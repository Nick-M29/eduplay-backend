import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { classService } from '../../services/class.service';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  remitenteId: number;
  remitenteNombre?: string;
  texto: string;
  fechaEnvio: string;
  remitente?: { nombreCompleto: string, avatarJson?: any };
}

export const ChatBox = ({ claseId }: { claseId: string }) => {
  const { token, user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [socketError, setSocketError] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    // 1. Cargar historial desde el Backend
    const loadHistory = async () => {
      try {
        const res = await classService.getChatHistory(claseId);
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error('Error cargando historial', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHistory();

    // 2. Conectar a Socket.io usando el namespace de chat
    const socket = io('http://localhost:3000/chat', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Conectado al socket, emitiendo join_class...');
      // Emitimos el evento de unirse a la sala validada en Prisma
      socket.emit('join_class', { claseId: Number(claseId) });
      setSocketError('');
    });

    socket.on('joined_class', (data) => {
      console.log(data.message);
    });

    // Escuchando mensajes en tiempo real
    socket.on('new_message', (msg: Message) => {
      if (isMounted) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Manejo de errores de autenticación o base de datos del socket
    socket.on('error', (err) => {
      console.error('Socket error:', err);
      if (isMounted) setSocketError(err.message);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      if (isMounted) setSocketError('Error de autenticación o red en el chat.');
    });

    // Cleanup: Desconectar el socket al desmontar el componente
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [claseId, token]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    // Emitir mensaje al backend
    socketRef.current.emit('send_message', {
      claseId: Number(claseId),
      texto: newMessage
    });

    setNewMessage(''); // Limpiar input instantáneamente para mejor UX
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white border border-gray-200 rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Header del Chat */}
      <div className="bg-primary-600 border-b border-primary-700 px-5 py-4 flex flex-col">
        <h3 className="font-bold text-white flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
          Chat en Vivo
        </h3>
        {socketError && <p className="text-xs text-red-200 mt-1 font-medium">{socketError}</p>}
      </div>

      {/* Historial de Mensajes (Estilo Discord) */}
      <div className="flex-1 overflow-y-auto p-0 bg-[#313338] text-gray-100">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
               <span className="text-2xl">👋</span>
            </div>
            <p className="text-center text-gray-300 font-bold">Bienvenido al inicio del servidor</p>
            <p className="text-center text-gray-400 text-sm mt-1">Este es el comienzo del chat de tu clase.</p>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg, index) => {
              const isMe = msg.remitenteId === user?.id;
              const senderName = msg.remitenteNombre || msg.remitente?.nombreCompleto || 'Compañero';
              const avatar = msg.remitente?.avatarJson;
              
              // Evitar renderizar el mismo avatar/nombre repetidamente si es la misma persona (Discord style)
              const previousMsg = index > 0 ? messages[index - 1] : null;
              const isConsecutive = previousMsg && previousMsg.remitenteId === msg.remitenteId;
              
              return (
                <div key={msg.id || index} className={`px-4 py-1 hover:bg-[#2b2d31] transition-colors group flex ${!isConsecutive ? 'mt-4' : ''}`}>
                  
                  {/* Columna Izquierda: Avatar o Timestamp oculto */}
                  <div className="w-10 flex-shrink-0 mr-4">
                    {!isConsecutive ? (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-primary-600 shrink-0"
                        style={avatar ? { backgroundColor: avatar.bgColor } : {}}
                      >
                        {avatar?.photo ? (
                          <img src={avatar.photo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg" style={{ color: avatar?.iconColor || '#fff' }}>
                            {avatar?.iconType === 'ROBOT' ? '🤖' : avatar?.iconType === 'ZORRO' ? '🦊' : avatar?.iconType === 'NINJA' ? '🥷' : senderName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 leading-[22px] text-center block w-full">
                        {new Date(msg.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                  
                  {/* Columna Derecha: Nombre + Mensaje */}
                  <div className="flex-1 min-w-0">
                    {!isConsecutive && (
                      <div className="flex items-baseline mb-1">
                        <span className={`font-bold mr-2 text-[15px] ${isMe ? 'text-green-400' : 'text-primary-300'}`}>
                          {senderName}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(msg.fechaEnvio).toLocaleDateString([], {day:'2-digit', month:'2-digit', year:'numeric'})} {new Date(msg.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    )}
                    <p className="text-[15px] text-gray-200 leading-[22px] whitespace-pre-wrap break-words">{msg.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="p-4 bg-[#313338] border-t border-[#1e1f22]">
        <form onSubmit={handleSend} className="flex space-x-3 bg-[#383a40] rounded-lg px-4 py-2 border border-transparent focus-within:border-[#2b2d31]">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Enviar mensaje a #general...`}
            className="flex-1 bg-transparent text-gray-200 focus:outline-none text-[15px] py-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="text-gray-400 hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
