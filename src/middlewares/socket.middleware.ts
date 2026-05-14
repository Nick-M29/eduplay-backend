import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '@prisma/client';

export interface SocketWithUser extends Socket {
  user?: {
    userId: number;
    rol: RolUsuario;
  };
}

export const authenticateSocket = (socket: SocketWithUser, next: (err?: Error) => void) => {
  // El cliente puede enviar el token en socket.handshake.auth o en los headers
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Error de Autenticación: No se proporcionó token (Bearer)'));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'supersecreto123';
    
    // Verificamos el token
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; rol: RolUsuario };
    
    // Inyectamos el payload en el socket para que los manejadores de eventos sepan quién es
    socket.user = decoded;
    
    // Autenticación exitosa
    next();
  } catch (error) {
    // Si el token es inválido o expira, desconectamos el socket
    next(new Error('Error de Autenticación: Token inválido o expirado'));
  }
};
