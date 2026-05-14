import { RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        rol: RolUsuario;
      };
    }
  }
}
