import { Router } from 'express';
import { enviarMensajeContacto } from '../controllers/contacto.controller';

const router = Router();

// Define la ruta POST /contacto y la enlaza con tu controlador
router.post('/contacto', enviarMensajeContacto);

export default router;