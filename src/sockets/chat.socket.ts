import { Server } from 'socket.io';
import { authenticateSocket, SocketWithUser } from '../middlewares/socket.middleware';
import { prisma } from '../config/db';

export const initializeChatSocket = (io: Server) => {
  // Creamos un namespace específico para el chat
  const chatNamespace = io.of('/chat');

  // Aplicar middleware de autenticación a este namespace
  chatNamespace.use(authenticateSocket);

  chatNamespace.on('connection', (socket: SocketWithUser) => {
    console.log(`[Socket] Usuario conectado: ${socket.user?.userId} (Rol: ${socket.user?.rol})`);

    // ============================================
    // Evento: join_class
    // ============================================
    socket.on('join_class', async (data: { claseId: number }) => {
      try {
        const { claseId } = data;
        const { userId, rol } = socket.user!;

        // El chat interno es exclusivo para ALUMNOS según db.sql
        if (rol !== 'ALUMNO') {
          return socket.emit('error', { message: 'Solo los alumnos pueden usar este chat de clase' });
        }

        // Verificar en Prisma que el alumno realmente esté matriculado en esta clase
        const inscripcion = await prisma.claseAlumno.findUnique({
          where: {
            claseId_alumnoId: {
              claseId: claseId,
              alumnoId: userId
            }
          }
        });

        if (!inscripcion) {
          return socket.emit('error', { message: 'No estás matriculado en esta clase, acceso denegado al chat' });
        }

        // Unirse al room de Socket.io
        const roomName = `room_clase_${claseId}`;
        socket.join(roomName);
        
        socket.emit('joined_class', { message: `Te has unido al chat de la clase ${claseId}` });
        
      } catch (error) {
        console.error('[Socket] Error en join_class:', error);
        socket.emit('error', { message: 'Error interno del servidor al intentar unirse a la clase' });
      }
    });

    // ============================================
    // Evento: send_message
    // ============================================
    socket.on('send_message', async (data: { claseId: number; texto: string }) => {
      try {
        const { claseId, texto } = data;
        const { userId, rol } = socket.user!;

        if (rol !== 'ALUMNO') {
          return socket.emit('error', { message: 'Solo los alumnos pueden enviar mensajes' });
        }

        const roomName = `room_clase_${claseId}`;
        
        // Verificar que el socket esté previamente unido a la sala
        if (!socket.rooms.has(roomName)) {
           return socket.emit('error', { message: 'Debes unirte a la sala primero usando join_class' });
        }

        // 1. Guardar el mensaje en la base de datos (Tabla Chats_Alumnos)
        const nuevoMensaje = await prisma.chatAlumno.create({
          data: {
            claseId,
            remitenteId: userId,
            texto
            // destinatarioId se queda nulo ya que es un mensaje al grupo entero
          },
          include: {
            remitente: {
               select: { nombreCompleto: true }
            }
          }
        });

        // 2. Emitir (broadcast) el mensaje a TODOS los usuarios en la sala de la clase
        chatNamespace.to(roomName).emit('new_message', {
          id: nuevoMensaje.id,
          claseId: nuevoMensaje.claseId,
          remitenteId: nuevoMensaje.remitenteId,
          remitenteNombre: nuevoMensaje.remitente.nombreCompleto,
          texto: nuevoMensaje.texto,
          fechaEnvio: nuevoMensaje.fechaEnvio
        });

      } catch (error) {
        console.error('[Socket] Error en send_message:', error);
        socket.emit('error', { message: 'Error al procesar y enviar el mensaje' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Usuario desconectado: ${socket.user?.userId}`);
    });
  });
};
