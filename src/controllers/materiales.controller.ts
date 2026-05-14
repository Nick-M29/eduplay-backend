import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// OBTENER COMENTARIOS (Con filtro anónimo)
// ==========================================
export const obtenerComentariosMaterial = async (req: Request, res: Response) => {
    try {
        const { materialId } = req.params;
        // Asumimos que tu middleware de JWT inyecta el usuario en req.user
        const { id: usuarioPeticionId, rol } = (req as any).user;

        // 1. Buscamos los comentarios ordenados del más antiguo al más nuevo
        const comentarios = await prisma.comentarioMaterial.findMany({
            where: { materialId: parseInt(materialId) },
            orderBy: { fechaCreacion: 'asc' },
            include: {
                remitente: {
                    select: {
                        rol: true,
                        alumno: { select: { nombreCompleto: true } },
                        padre: { select: { nombreCompleto: true } },
                        profesor: { select: { nombreCompleto: true } }
                    }
                }
            }
        });

        // 2. Filtramos la identidad según quién hace la petición
        const comentariosFiltrados = comentarios.map(comentario => {
            let nombreReal = "Usuario Desconocido";

            // Extraemos el nombre real dependiendo de qué perfil tenga el remitente
            if (comentario.remitente.rol === 'ALUMNO' && comentario.remitente.alumno) {
                nombreReal = comentario.remitente.alumno.nombreCompleto;
            } else if (comentario.remitente.rol === 'PADRE' && comentario.remitente.padre) {
                nombreReal = comentario.remitente.padre.nombreCompleto;
            } else if (comentario.remitente.rol === 'PROFESOR' && comentario.remitente.profesor) {
                nombreReal = comentario.remitente.profesor.nombreCompleto;
            }

            // REGLA DE PRIVACIDAD:
            const visorEsProfesor = rol === 'PROFESOR'; // Quién está mirando la pantalla
            const esMiComentario = comentario.remitenteId === usuarioPeticionId; // Fui yo quien lo escribió
            const autorEsProfesor = comentario.remitente.rol === 'PROFESOR'; // El autor de ESTE comentario es un profe
            // Si soy el profe o es mi propio comentario, veo mi nombre. Si no, soy "Anónimo".

            const autorVisible = (visorEsProfesor || esMiComentario || autorEsProfesor) 
                ? nombreReal 
                : "Compañero Anónimo";

            return {
                id: comentario.id,
                texto: comentario.texto,
                fechaCreacion: comentario.fechaCreacion,
                autor: autorVisible,
                esMio: esMiComentario,
                rolAutorOriginal: autorEsProfesor ? 'PROFESOR' : (visorEsProfesor ? comentario.remitente.rol : undefined),
        parentId: comentario.parentId
            };
        });

        res.status(200).json(comentariosFiltrados);
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ==========================================
// CREAR UN NUEVO COMENTARIO
// ==========================================
export const crearComentarioMaterial = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { texto, parentId } = req.body; // NUEVO: Extraemos también el parentId del cuerpo de la petición
    
    const usuario = (req as any).user;
    
    // Aquí atrapamos el ID sin importar cómo lo hayas llamado en tu token
    const remitenteId = usuario.id || usuario.usuarioId || usuario.userId; 

    if (!remitenteId) {
       return res.status(401).json({ message: "No se pudo identificar al usuario desde el token" });
    }

    if (!texto || texto.trim() === "") {
       return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }

    // NUEVO: Separamos los datos en una variable para poder añadirle el 'parent' condicionalmente
    const dataPrisma: any = {
      texto: texto,
      material: {
        connect: { id: parseInt(materialId) }
      },
      remitente: {
        connect: { id: parseInt(remitenteId) }
      }
    };

    // NUEVO: Si recibimos un parentId válido, lo conectamos con el comentario original
    if (parentId) {
      dataPrisma.parent = {
        connect: { id: parseInt(parentId) }
      };
    }

    // Pasamos nuestro objeto dataPrisma modificado al create
    const nuevoComentario = await prisma.comentarioMaterial.create({
      data: dataPrisma
    });

    res.status(201).json({
      message: "Comentario enviado con éxito",
      comentario: nuevoComentario
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error interno del servidor al crear el comentario" });
  }
};

export const eliminarMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Si tu material tiene comentarios, los borramos primero
    await prisma.comentarioMaterial.deleteMany({ where: { materialId: parseInt(id) } });
    
    // Borramos el material
    await prisma.material.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Material eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar material:", error);
    res.status(500).json({ message: "Error interno al eliminar el material" });
  }
};