import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '@prisma/client';

interface JwtPayload {
  userId: number;
  rol: RolUsuario;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No se proporcionó token de autenticación (Bearer Token)',
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'supersecreto123';

    // Si el token es inválido o expiró, jwt.verify lanzará un error que atrapará el catch
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Inyectamos el payload en el request (gracias a nuestra extensión de tipos)
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'El token de autenticación ha expirado',
      });
    }
    return res.status(403).json({
      status: 'error',
      message: 'Token de autenticación inválido',
    });
  }
};

export const esAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.rol === 'ADMIN') {
    return next(); 
  }

  return res.status(403).json({
    status: 'error',
    message: 'Acceso restringido: Se requieren permisos de administrador',
  });
};