import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const updatePuntos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alumnoId = parseInt(req.params.alumno_id);
    const { puntos } = req.body;
    
    // Verificamos que el alumno exista
    const alumno = await prisma.alumno.findUnique({ where: { usuarioId: alumnoId } });
    
    if (!alumno) {
       return res.status(404).json({ status: 'error', message: 'Alumno no encontrado' });
    }

    // Aseguramos que los puntos nunca sean negativos según el requerimiento y la restricción de BD
    const nuevosPuntos = Math.max(0, alumno.puntos + puntos);

    const alumnoActualizado = await prisma.alumno.update({
       where: { usuarioId: alumnoId },
       data: { puntos: nuevosPuntos }
    });

    res.json({
       status: 'success',
       message: 'Puntos actualizados correctamente',
       data: {
          alumnoId: alumnoActualizado.usuarioId,
          puntosActuales: alumnoActualizado.puntos
       }
    });

  } catch(error) {
    next(error);
  }
};

export const updatePerfil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alumnoId = parseInt(req.params.alumno_id);
    const { avatarJson } = req.body;
    
    const alumno = await prisma.alumno.findUnique({ where: { usuarioId: alumnoId } });
    if (!alumno) return res.status(404).json({ status: 'error', message: 'Alumno no encontrado' });

    const actualizado = await prisma.alumno.update({
       where: { usuarioId: alumnoId },
       data: { avatarJson }
    });

    res.json({ status: 'success', data: actualizado });
  } catch (error) {
    next(error);
  }
};
