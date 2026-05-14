import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getMisClases = async (req: Request | any, res: Response) => {
  try {
    // Asumimos que tu middleware de JWT guarda los datos del token en req.user
    const userId = req.user.userId; 

    // Buscamos las clases donde el profesorId coincida con el ID del usuario
    const clases = await prisma.clase.findMany({
      where: { 
        profesorId: userId 
      },
      include: {
        // Un truco genial de Prisma para contar relaciones sin traer todos los datos
        _count: {
          select: { alumnos: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: clases
    });
  } catch (error) {
    console.error("Error al obtener clases del profesor:", error);
    res.status(500).json({ message: 'Error interno al cargar las clases' });
  }
};