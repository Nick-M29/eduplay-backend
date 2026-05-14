import { Router } from 'express';
import { getMisClases } from '../controllers/profesor.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Protegemos la ruta para que SOLO los profesores con token válido puedan entrar
router.get(
  '/mis-clases', 
  authenticateJWT, 
  authorizeRoles('PROFESOR', 'ADMIN'), 
  getMisClases
);

export default router;