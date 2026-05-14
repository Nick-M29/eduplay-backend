import { Router } from 'express';
// IMPORTANTE: Hemos añadido verificarCodigo a esta importación
import { register, login, verificarCodigo } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { cambiarPassword } from '../controllers/auth.controller';

import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (Profesor, Padre o Alumno)
 *     tags: [Auth]
 *     security: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [PROFESOR, PADRE, ALUMNO]
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nombreCompleto:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
// Protegemos las rutas con el middleware de validación Zod
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión
 *     tags: [Auth]
 *     security: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve JWT
 */
router.post('/login', validate(loginSchema), login);
router.put('/cambiar-password', authenticateJWT, cambiarPassword);
/**
 * @swagger
 * /auth/verificar:
 *   post:
 *     summary: Verifica la cuenta del usuario mediante el código enviado por correo
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               codigo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta activada con éxito
 *       400:
 *         description: Código incorrecto
 *       404:
 *         description: Usuario no encontrado
 */


export default router;