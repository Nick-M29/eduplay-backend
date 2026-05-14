import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]:', err);

  // Manejo de errores de validación con Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación de datos',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Manejo de errores de Prisma (ej. Violación de restricción única)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: `El registro ya existe. Conflicto en el campo: ${err.meta?.target}`
      });
    }
  }

  // Error general o desconocido
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
