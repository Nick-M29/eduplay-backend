import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import classRoutes from './routes/class.routes';
import alumnoRoutes from './routes/alumno.routes';
import { initializeChatSocket } from './sockets/chat.socket';
import { setupSwagger } from './config/swagger';
import materialesRoutes from './routes/materiales.routes';
import tareasRoutes from './routes/tareas.routes';
import adminRoutes from './routes/admin.routes';
import contactoRoutes from './routes/contacto.routes';
import profesorRoutes from './routes/profesor.routes';

import { verificarCodigo } from './controllers/auth.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Crear servidor HTTP para integrarlo con Socket.io
const httpServer = http.createServer(app);

// Inicializar servidor de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // En producción, ajustar al dominio del frontend
    methods: ['GET', 'POST']
  }
});

// Middlewares Express
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas REST
app.use('/auth', authRoutes);
app.use('/clases', classRoutes);
app.use('/alumnos', alumnoRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tareas', tareasRoutes)
app.use('/api/profesor', profesorRoutes);

app.use('/api', contactoRoutes);
app.post('/api/verificar', verificarCodigo);
// Configurar Swagger (Documentación)
setupSwagger(app);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduPlay API running' });
});

// Inicializar WebSockets
initializeChatSocket(io);

// Middleware de manejo de errores global (debe ir al final de todas las rutas)
app.use(errorHandler);

// Levantar el servidor HTTP (que incluye Express y Socket.io)
httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Socket.io is ready and listening`);
});
