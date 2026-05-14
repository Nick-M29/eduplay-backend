import { Router } from 'express';
import { createClass, linkStudentToParent, joinClass, getChatHistory, createMaterial, getMateriales, getMyClasses, getAlumnosClase } from '../controllers/class.controller';
import { validate } from '../middlewares/validate.middleware';
import { createClassSchema, linkStudentSchema, joinClassSchema } from '../schemas/class.schema';
import { paramsClaseIdSchema, createMaterialSchema } from '../schemas/feature.schema';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clases
 *   description: Gestión de clases, matriculación, chat y materiales
 */

// Todas las rutas de clases requieren estar autenticado
router.use(authenticateJWT);

/**
 * @swagger
 * /clases/mis-clases:
 *   get:
 *     summary: Obtiene las clases creadas por el profesor (Solo PROFESOR)
 *     tags: [Clases]
 *     responses:
 *       200:
 *         description: Lista de clases
 */
router.get(
  '/mis-clases',
  authorizeRoles('PROFESOR', 'ALUMNO'),
  getMyClasses
);

/**
 * @swagger
 * /clases:
 *   post:
 *     summary: Crea una nueva clase (Solo PROFESOR)
 *     tags: [Clases]
 *     responses:
 *       201:
 *         description: Clase creada
 */
// POST /clases -> Crear clase (Solo PROFESOR)
router.post(
  '/',
  authorizeRoles('PROFESOR'),
  validate(createClassSchema),
  createClass
);

/**
 * @swagger
 * /clases/vincular-alumno:
 *   post:
 *     summary: Vincula un padre con un alumno usando el código de acceso (Solo PADRE)
 *     tags: [Clases]
 *     responses:
 *       200:
 *         description: Alumno vinculado exitosamente
 */
// POST /clases/vincular-alumno -> Vincular padre con alumno (Solo PADRE)
router.post(
  '/vincular-alumno',
  authorizeRoles('PADRE'),
  validate(linkStudentSchema),
  linkStudentToParent
);

/**
 * @swagger
 * /clases/unirse:
 *   post:
 *     summary: Inscribe a un alumno a una clase (ALUMNO o PADRE)
 *     tags: [Clases]
 *     responses:
 *       200:
 *         description: Inscripción exitosa
 */
// POST /clases/unirse -> Inscribirse a clase (ALUMNO o PADRE)
router.post(
  '/unirse',
  authorizeRoles('ALUMNO', 'PADRE'),
  validate(joinClassSchema),
  joinClass
);

/**
 * @swagger
 * /clases/{clase_id}/chat:
 *   get:
 *     summary: Recupera el historial de chat de la clase (Solo ALUMNO)
 *     tags: [Clases]
 *     parameters:
 *       - in: path
 *         name: clase_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensajes devuelta en orden cronológico
 */
// GET /clases/:clase_id/chat -> Historial de mensajes (Solo ALUMNO)
router.get(
  '/:clase_id/chat',
  authorizeRoles('ALUMNO'),
  validate(paramsClaseIdSchema),
  getChatHistory
);

/**
 * @swagger
 * /clases/{clase_id}/alumnos:
 *   get:
 *     summary: Recupera la lista de alumnos de una clase (Solo PROFESOR)
 *     tags: [Clases]
 *     parameters:
 *       - in: path
 *         name: clase_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de alumnos
 */
router.get(
  '/:clase_id/alumnos',
  authorizeRoles('PROFESOR'),
  validate(paramsClaseIdSchema),
  getAlumnosClase
);

/**
 * @swagger
 * /clases/{clase_id}/materiales:
 *   post:
 *     summary: Crea un nuevo material didáctico (Solo PROFESOR)
 *     tags: [Clases]
 *     parameters:
 *       - in: path
 *         name: clase_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Material creado
 *   get:
 *     summary: Lista los materiales de la clase filtrados por audiencia (TODOS)
 *     tags: [Clases]
 *     parameters:
 *       - in: path
 *         name: clase_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Materiales recuperados
 */
// POST /clases/:clase_id/materiales -> Crear material didáctico (Solo PROFESOR)
router.post(
  '/:clase_id/materiales',
  authorizeRoles('PROFESOR'),
  validate(createMaterialSchema),
  createMaterial
);

// GET /clases/:clase_id/materiales -> Leer materiales según audiencia (TODOS)
router.get(
  '/:clase_id/materiales',
  authorizeRoles('PROFESOR', 'PADRE', 'ALUMNO'),
  validate(paramsClaseIdSchema),
  getMateriales
);

export default router;
