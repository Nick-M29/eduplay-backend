import { Router } from 'express';
import { obtenerUsuarios, eliminarUsuario, hacerAdmin, crearUsuario, editarUsuario } from '../controllers/admin.controller';
import { authenticateJWT, esAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT, esAdmin);

router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', crearUsuario);
router.delete('/usuarios/:id', eliminarUsuario);
router.patch('/usuarios/:id/admin', hacerAdmin);
router.put('/usuarios/:id', editarUsuario);

export default router;