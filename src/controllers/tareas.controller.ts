import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 1. CREAR UNA TAREA Y GENERAR ENTREGAS/GRUPOS
// ==========================================
export const crearTarea = async (req: Request, res: Response) => {
  try {
    const { claseId } = req.params;
    const { titulo, descripcion, fechaLimite, recompensaXP, penalizacionXP, esGrupal, tamanoGrupo = 3 } = req.body;

    // 1. Obtener a todos los alumnos de esta clase
    // (Ajusta 'alumnos' según cómo se llame tu relación de inscripciones en el modelo Clase)
    const claseConAlumnos = await prisma.clase.findUnique({
      where: { id: parseInt(claseId) },
      include: { alumnos: true } 
    });

    if (!claseConAlumnos) return res.status(404).json({ message: "Clase no encontrada" });
    const alumnos = claseConAlumnos.alumnos;

    // 2. Crear la Tarea base
    const nuevaTarea = await prisma.tarea.create({
      data: {
        claseId: parseInt(claseId),
        titulo,
        descripcion,
        fechaLimite: new Date(fechaLimite),
        recompensaXP: parseInt(recompensaXP),
        penalizacionXP: parseInt(penalizacionXP),
        esGrupal
      }
    });

    // 3. Lógica de creación de Entregas Pendientes
    if (!esGrupal) {
      // TAREA INDIVIDUAL: Creamos una entrega por cada alumno
      const entregas = alumnos.map((alumno: any) => {
        // 🔥 MAGIA AQUÍ: Atrapamos el ID sin importar cómo lo llame tu tabla de base de datos
        const idReal = alumno.alumnoId || alumno.usuarioId || alumno.id; 
        
        return {
          tareaId: nuevaTarea.id,
          alumnoId: idReal
        };
      });
      
      await prisma.entrega.createMany({ data: entregas });

    } else {
      // TAREA GRUPAL: Mezclar alumnos aleatoriamente (Algoritmo Fisher-Yates)
      let alumnosMezclados = [...alumnos];
      for (let i = alumnosMezclados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [alumnosMezclados[i], alumnosMezclados[j]] = [alumnosMezclados[j], alumnosMezclados[i]];
      }

      // Agruparlos y crear los Grupos en BD
      let numGrupo = 1;
      for (let i = 0; i < alumnosMezclados.length; i += tamanoGrupo) {
        const miembrosGrupo = alumnosMezclados.slice(i, i + tamanoGrupo);
        
        // Creamos el grupo y lo vinculamos a la tarea y a los alumnos
        const nuevoGrupo = await prisma.grupoTarea.create({
          data: {
            tareaId: nuevaTarea.id,
            nombre: `Equipo ${numGrupo}`,
            alumnos: {
              // 🔥 Misma malla de seguridad aquí
              connect: miembrosGrupo.map((a: any) => {
                const idReal = a.alumnoId || a.usuarioId || a.id;
                return { id: idReal };
              })
            }
          }
        });

        // Creamos UNA sola entrega pendiente para todo el grupo
        await prisma.entrega.create({
          data: {
            tareaId: nuevaTarea.id,
            grupoId: nuevoGrupo.id
          }
        });
        numGrupo++;
      }
    }

    res.status(201).json({ message: "Tarea publicada y entregas generadas con éxito", tarea: nuevaTarea });
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================================
// 2. EVALUAR UNA ENTREGA (+XP o -XP)
// ==========================================
export const evaluarEntrega = async (req: Request, res: Response) => {
  try {
    const { entregaId } = req.params;
    const { estado } = req.body; // 'APROBADA' o 'RECHAZADA'

    // Buscar la entrega con los datos de la tarea y los alumnos implicados
    const entrega = await prisma.entrega.findUnique({
      where: { id: parseInt(entregaId) },
      include: { 
        tarea: true,
        alumno: true,
        grupo: { include: { alumnos: true } }
      }
    });

    if (!entrega) return res.status(404).json({ message: "Entrega no encontrada" });

    // Actualizamos el estado de la entrega
    await prisma.entrega.update({
      where: { id: parseInt(entregaId) },
      data: { estado }
    });

    // Lógica de Gamificación (XP)
    const puntosCalculados = estado === 'APROBADA' 
      ? entrega.tarea.recompensaXP 
      : -entrega.tarea.penalizacionXP;

    // A quién damos/quitamos los puntos
    const alumnosAfectados = entrega.tarea.esGrupal 
      ? entrega.grupo!.alumnos 
      : [entrega.alumno!];

    // Actualizamos los puntos de cada alumno en la base de datos
    for (const alumno of alumnosAfectados) {
      await prisma.usuario.update({
        where: { id: alumno.id },
        data: { 
          // Entramos al perfil de Alumno asociado a este Usuario para actualizar sus puntos
          alumno: {
            update: {
              puntos: { increment: puntosCalculados }
            }
          }
        }
      });
    }

    res.status(200).json({ message: `Entrega ${estado}, XP asignada correctamente.` });
  } catch (error) {
    console.error("Error al evaluar entrega:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================================
// 3. OBTENER LAS TAREAS DE UNA CLASE
// ==========================================
export const obtenerTareasClase = async (req: Request, res: Response) => {
  try {
    const { claseId } = req.params;

    const tareas = await prisma.tarea.findMany({
      where: { claseId: parseInt(claseId) },
      orderBy: { fechaCreacion: 'desc' }, // Las más nuevas primero
      include: {
        entregas: {
          include: {
            // El alumno de la entrega es un 'Usuario', así que buscamos su perfil 'alumno'
            alumno: { 
              select: { 
                id: true,
                alumno: { select: { nombreCompleto: true } },
                profesor: { select: { nombreCompleto: true } }
              } 
            },
            grupo: { 
              include: { 
                // Lo mismo para los miembros del grupo
                alumnos: { 
                  select: { 
                    id: true,
                    alumno: { select: { nombreCompleto: true } },
                    profesor: { select: { nombreCompleto: true } }
                  } 
                } 
              } 
            }
          }
        }
      }
    });

    const tareasFormateadas = tareas.map(tarea => ({
      ...tarea,
      entregas: tarea.entregas.map(entrega => {
        let nombreMostrar = "Usuario Desconocido";
        
        // Función auxiliar para sacar el nombre real
        const sacarNombre = (usr: any) => {
          if (!usr) return "Sin nombre";
          return usr.alumno?.nombreCompleto || usr.profesor?.nombreCompleto || "Usuario Desconocido";
        };

        if (tarea.esGrupal) {
          const nombresGrupo = entrega.grupo?.alumnos?.map(a => sacarNombre(a)).join(', ') || '';
          nombreMostrar = `👥 ${entrega.grupo?.nombre} (${nombresGrupo})`;
        } else {
          nombreMostrar = `👤 ${sacarNombre(entrega.alumno)}`;
        }

        return {
          ...entrega,
          nombreMostrar // Le enviamos el texto ya perfecto y con su icono
        };
      })
    }));

    res.status(200).json(tareas);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    res.status(500).json({ message: "Error interno del servidor al cargar las tareas" });
  }
};

// ==========================================
// 4. ALUMNO ENVÍA SU ENTREGA
// ==========================================
export const entregarTarea = async (req: Request, res: Response) => {
  try {
    const { entregaId } = req.params;
    const { contenido } = req.body;

    const entregaActualizada = await prisma.entrega.update({
      where: { id: parseInt(entregaId) },
      data: {
        contenido,
        estado: 'ENTREGADA',
        fechaEntrega: new Date()
      }
    });

    res.status(200).json({ message: "Tarea entregada con éxito", entrega: entregaActualizada });
  } catch (error) {
    console.error("Error al entregar tarea:", error);
    res.status(500).json({ message: "Error interno al enviar la entrega" });
  }
};

// ==========================================
// 5. ELIMINAR TAREA
// ==========================================
export const eliminarTarea = async (req: Request, res: Response) => {
  try {
    const { tareaId } = req.params;

    // 1. Borramos primero las entregas y los grupos para evitar errores de llaves foráneas
    await prisma.entrega.deleteMany({ where: { tareaId: parseInt(tareaId) } });
    await prisma.grupoTarea.deleteMany({ where: { tareaId: parseInt(tareaId) } });
    
    // 2. Ahora sí, borramos la tarea principal
    await prisma.tarea.delete({ where: { id: parseInt(tareaId) } });

    res.status(200).json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    res.status(500).json({ message: "Error interno al eliminar la tarea" });
  }
};