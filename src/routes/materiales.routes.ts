import { Router } from 'express';
import { obtenerComentariosMaterial, crearComentarioMaterial, eliminarMaterial } from '../controllers/materiales.controller';
import { authenticateJWT } from '../middlewares/auth.middleware'; // Ajusta la ruta a tu middleware

const router = Router();

// Rutas para los comentarios de un material específico
// Nota: Ambas rutas usan el middleware 'authenticate' para saber quién hace la petición
router.get('/:materialId/comentarios', authenticateJWT, obtenerComentariosMaterial);
router.post('/:materialId/comentarios', authenticateJWT, crearComentarioMaterial);
router.delete('/:id', authenticateJWT, eliminarMaterial);

export default router;