import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '@prisma/client'; // Importamos tu Enum exacto de Prisma

export const authorizeRoles = (...rolesPermitidos: RolUsuario[]) => {
  return (req: Request | any, res: Response, next: NextFunction) => {
    
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No autenticado. El token es inválido o no existe.' 
      });
    }

    // Comprobamos si el rol del usuario está en la lista de permitidos
    const tienePermiso = rolesPermitidos.includes(req.user.rol as RolUsuario);

    if (!tienePermiso) {
      return res.status(403).json({ 
        status: 'error',
        message: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}` 
      });
    }

    next();
  };
};