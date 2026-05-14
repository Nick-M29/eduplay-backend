import { Router } from 'express';
import { crearTarea, evaluarEntrega, obtenerTareasClase, entregarTarea, eliminarTarea } from '../controllers/tareas.controller';

const router = Router();

// Endpoint para el profesor (crear tarea y grupos)
router.post('/clase/:claseId', crearTarea);
router.get('/clase/:claseId', obtenerTareasClase);
// Endpoint para que el profesor evalúe (+XP o -XP)
router.post('/entregas/:entregaId/evaluar', evaluarEntrega);
router.post('/entregas/:entregaId/entregar', entregarTarea);

router.delete('/:tareaId', eliminarTarea);
export default router;