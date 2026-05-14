import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

const generateClassCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CLS-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomKey = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombreClase, claveIngreso } = req.body;
    // req.user existe porque este endpoint estará protegido por auth.middleware
    const profesorId = req.user!.userId;

    const codigoClase = generateClassCode();
    // UX: Si el profesor no manda una clave, generamos una de 6 caracteres
    const finalClaveIngreso = claveIngreso || generateRandomKey();

    const newClass = await prisma.clase.create({
      data: {
        nombreClase,
        codigoClase,
        claveIngreso: finalClaveIngreso,
        profesorId
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Clase creada exitosamente',
      data: {
        id: newClass.id,
        nombreClase: newClass.nombreClase,
        codigoClase: newClass.codigoClase,
        claveIngreso: newClass.claveIngreso,
        fechaCreacion: newClass.fechaCreacion
      }
    });
  } catch (error) {
    next(error);
  }
};

export const linkStudentToParent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { codigoAcceso } = req.body;
    const padreId = req.user!.userId;

    const alumno = await prisma.alumno.findUnique({
      where: { codigoAcceso }
    });

    if (!alumno) {
      return res.status(404).json({
        status: 'error',
        message: 'Alumno no encontrado con el código de acceso proporcionado'
      });
    }

    // Se crea el vínculo. Si ya existe, Prisma lanzará el error P2002 que atrapa el error global
    await prisma.padreAlumno.create({
      data: {
        padreId,
        alumnoId: alumno.usuarioId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Alumno vinculado a tu cuenta exitosamente',
      data: {
        alumnoId: alumno.usuarioId,
        nombre: alumno.nombreCompleto
      }
    });
  } catch (error) {
    next(error);
  }
};

export const joinClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { codigoClase, claveIngreso, alumnoId } = req.body;
    const { userId, rol } = req.user!;

    // 1. Verificar existencia y clave de la clase
    const clase = await prisma.clase.findUnique({
      where: { codigoClase }
    });

    if (!clase || clase.claveIngreso !== claveIngreso) {
      return res.status(401).json({
        status: 'error',
        message: 'Código de clase o clave de ingreso incorrectos'
      });
    }

    let targetAlumnoId: number;

    // 2. Lógica de roles
    if (rol === 'ALUMNO') {
      targetAlumnoId = userId;
    } else if (rol === 'PADRE') {
      if (!alumnoId) {
        return res.status(400).json({
          status: 'error',
          message: 'Se requiere enviar el alumnoId para inscribirlo'
        });
      }

      // 2.1 Verificar que el padre esté realmente vinculado a este alumno
      const vinculo = await prisma.padreAlumno.findUnique({
        where: {
          padreId_alumnoId: {
            padreId: userId,
            alumnoId: alumnoId
          }
        }
      });

      if (!vinculo) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para inscribir a este alumno porque no está vinculado a tu cuenta'
        });
      }

      targetAlumnoId = alumnoId;
    } else {
      // Por seguridad, aunque el authorizeRoles debería prevenir esto
      return res.status(403).json({
        status: 'error',
        message: 'Rol no autorizado'
      });
    }

    // 3. Crear el registro en la tabla intermedia (Clase_Alumno)
    await prisma.claseAlumno.create({
      data: {
        claseId: clase.id,
        alumnoId: targetAlumnoId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Inscripción a la clase realizada con éxito',
      data: {
        claseId: clase.id,
        alumnoId: targetAlumnoId
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claseId = parseInt(req.params.clase_id);
    const userId = req.user!.userId;

    const inscripcion = await prisma.claseAlumno.findUnique({
      where: {
        claseId_alumnoId: { claseId, alumnoId: userId }
      }
    });

    if (!inscripcion) {
      return res.status(403).json({
        status: 'error',
        message: 'No estás matriculado en esta clase'
      });
    }

    const mensajes = await prisma.chatAlumno.findMany({
      where: { claseId },
      take: 50,
      orderBy: { fechaEnvio: 'desc' },
      include: {
        remitente: { select: { nombreCompleto: true } }
      }
    });

    res.json({
      status: 'success',
      data: mensajes.reverse() // Devolvemos en orden cronológico
    });
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claseId = parseInt(req.params.clase_id);
    const profesorId = req.user!.userId;
    const { titulo, contenido, audiencia } = req.body;

    const clase = await prisma.clase.findUnique({ where: { id: claseId } });
    if (!clase || clase.profesorId !== profesorId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para agregar material a esta clase. Asegúrate de ser el dueño.'
      });
    }

    const material = await prisma.material.create({
      data: { claseId, titulo, contenido, audiencia }
    });

    res.status(201).json({ status: 'success', data: material });
  } catch (error) {
    next(error);
  }
};

export const getMateriales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claseId = parseInt(req.params.clase_id);
    const { userId, rol } = req.user!;

    let audienciasPermitidas: any[] = ['AMBOS'];

    if (rol === 'PROFESOR') {
      audienciasPermitidas = ['ALUMNOS', 'PADRES', 'AMBOS'];
      const clase = await prisma.clase.findUnique({ where: { id: claseId } });
      if (!clase || clase.profesorId !== userId) {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
      }
    } else if (rol === 'ALUMNO') {
      audienciasPermitidas.push('ALUMNOS');
      const insc = await prisma.claseAlumno.findUnique({ where: { claseId_alumnoId: { claseId, alumnoId: userId } } });
      if (!insc) return res.status(403).json({ status: 'error', message: 'No estás matriculado' });
    } else if (rol === 'PADRE') {
      audienciasPermitidas.push('PADRES');
      const hijosEnClase = await prisma.padreAlumno.findMany({
        where: { padreId: userId, alumno: { clases: { some: { claseId } } } }
      });
      if (hijosEnClase.length === 0) return res.status(403).json({ status: 'error', message: 'No tienes hijos inscritos en esta clase' });
    }

    const materiales = await prisma.material.findMany({
      where: { claseId, audiencia: { in: audienciasPermitidas } },
      orderBy: { fechaPublicacion: 'desc' }
    });

    res.json({ status: 'success', data: materiales });
  } catch (error) {
    next(error);
  }
};

export const getMyClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, rol } = req.user!;

    // 1. Si es PROFESOR: devolvemos las clases que él creó
    if (rol === 'PROFESOR') {
      const clases = await prisma.clase.findMany({
        where: { profesorId: userId },
        include: {
        alumnos: true
        },
        orderBy: { fechaCreacion: 'desc' }
      });
      return res.json({ status: 'success', data: clases });
    }

    // 2. Si es ALUMNO: devolvemos las clases a las que está inscrito
    if (rol === 'ALUMNO') {

      const alumnoData = await prisma.alumno.findUnique({
        where: { usuarioId: userId },
        select: { puntos: true }
      });

      const inscripciones = await prisma.claseAlumno.findMany({
        where: { alumnoId: userId },
        include: {
          clase: {
            include: {
              profesor: {
                select: { nombreCompleto: true }
              }
            }
          }
        }
      });
      return res.json({
        status: 'success',
        data: inscripciones,
        puntos: alumnoData?.puntos || 0
      });
    }

    // 3. Si es PADRE: (Por ahora devolvemos un array vacío o lógica futura)
    return res.json({ status: 'success', data: [] });

  } catch (error) {
    next(error);
  }
};

export const getAlumnosClase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claseId = parseInt(req.params.clase_id);
    const inscripciones = await prisma.claseAlumno.findMany({
      where: { claseId },
      include: {
        alumno: {
          select: { usuarioId: true, nombreCompleto: true, puntos: true, avatarJson: true }
        }
      }
    });
    res.json({ status: 'success', data: inscripciones.map(i => i.alumno) });
  } catch (error) {
    next(error);
  }
};
