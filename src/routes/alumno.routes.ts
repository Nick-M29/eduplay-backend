import { Router } from 'express';
import { updatePuntos, updatePerfil } from '../controllers/alumno.controller';
import { validate } from '../middlewares/validate.middleware';
import { updatePuntosSchema } from '../schemas/feature.schema';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Alumnos
 *   description: Gestión del progreso de alumnos
 */

// Todas las rutas requieren estar autenticado
router.use(authenticateJWT);

/**
 * @swagger
 * /alumnos/{alumno_id}/puntos:
 *   post:
 *     summary: Suma o resta puntos a un alumno (Solo PROFESOR)
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: alumno_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               puntos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Puntos actualizados correctamente
 */
// POST /alumnos/:alumno_id/puntos -> Sumar/restar puntos (Solo PROFESOR)
router.post(
  '/:alumno_id/puntos',
  authorizeRoles('PROFESOR'),
  validate(updatePuntosSchema),
  updatePuntos
);

/**
 * @swagger
 * /alumnos/{alumno_id}/perfil:
 *   put:
 *     summary: Actualiza el perfil (avatar) del alumno (Solo ALUMNO)
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: alumno_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put(
  '/:alumno_id/perfil',
  authorizeRoles('ALUMNO'),
  updatePerfil
);

export default router;
