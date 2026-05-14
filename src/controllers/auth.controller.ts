import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { sendEmail } from "../services/email.service"; // 1. Importamos el servicio de correo

const generateAccessCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generador de código numérico de 6 dígitos para el email
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isAdult = (birthDateString: string): boolean => {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, rol, nombreCompleto, fechaNacimiento } = req.body;

    if (rol === "PROFESOR" || rol === "PADRE") {
      if (!isAdult(fechaNacimiento)) {
        return res.status(403).json({
          status: "error",
          message: "Debe ser mayor de 18 años para registrarse como Profesor o Padre.",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // 2. Generamos el código de verificación para el email
    const codigoEmail = generateVerificationCode();

    const result = await prisma.$transaction(async (tx) => {
      // 3. Incluimos verificado: false y el código en la creación
      const newUser = await tx.usuario.create({
        data: {
          email,
          passwordHash,
          rol,
          verificado: false,
          codigoVerificacion: codigoEmail
        },
      });

      if (rol === "PROFESOR") {
        await tx.profesor.create({
          data: {
            usuarioId: newUser.id,
            nombreCompleto,
            fechaNacimiento: new Date(fechaNacimiento),
          },
        });
      } else if (rol === "PADRE") {
        await tx.padre.create({
          data: {
            usuarioId: newUser.id,
            nombreCompleto,
            fechaNacimiento: new Date(fechaNacimiento),
          },
        });
      } else if (rol === "ALUMNO") {
        const codigoAcceso = generateAccessCode();
        await tx.alumno.create({
          data: {
            usuarioId: newUser.id,
            nombreCompleto,
            codigoAcceso,
          },
        });
      }

      return newUser;
    });

    // 4. Enviamos el email (fuera de la transacción para no bloquear la DB si el mail tarda)
    await sendEmail(
      email,
      "Activa tu cuenta en EduPlay 🎮",
      `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 4px solid #2563eb; padding: 30px; border-radius: 24px; color: #1e293b;">
        <h1 style="color: #2563eb; text-align: center;">¡Hola, ${nombreCompleto}!</h1>
        <p style="font-size: 18px; text-align: center; font-weight: 500;">
          Bienvenido a la aventura. Para empezar a ganar XP y subir de nivel, necesitamos verificar tu cuenta.
        </p>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 16px; margin: 25px 0; border: 2px dashed #3b82f6;">
          <span style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #1e293b;">${codigoEmail}</span>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 14px;">
          Introduce este código en la pantalla de verificación de EduPlay.
        </p>
      </div>
      `
    );

    res.status(201).json({
      status: "success",
      message: "Usuario registrado. Revisa tu correo para activar la cuenta.",
      data: {
        id: result.id,
        email: result.email,
        rol: result.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        profesor: true,
        padre: true,
        alumno: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // 5. Bloqueo si no está verificado
    if (!user.verificado) {
      return res.status(401).json({
        status: "error",
        message: "Tu cuenta aún no ha sido activada. Revisa tu email para introducir el código de verificación.",
        noVerificado: true, 
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "supersecreto123";
    const token = jwt.sign({ userId: user.id, rol: user.rol }, jwtSecret, {
      expiresIn: "24h",
    });

    let nombreCompleto = "";
    let codigoAcceso = undefined;
    let puntos = undefined;
    let avatarJson = undefined;

    if (user.rol === "PROFESOR") nombreCompleto = user.profesor?.nombreCompleto || "";
    if (user.rol === "PADRE") nombreCompleto = user.padre?.nombreCompleto || "";
    if (user.rol === "ALUMNO") {
      nombreCompleto = user.alumno?.nombreCompleto || "";
      codigoAcceso = user.alumno?.codigoAcceso;
      puntos = user.alumno?.puntos;
      avatarJson = user.alumno?.avatarJson;
    }

    res.status(200).json({
      status: "success",
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          rol: user.rol,
          nombreCompleto,
          codigoAcceso,
          puntos,
          avatarJson,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verificarCodigo = async (req: Request, res: Response) => {
  const { email, codigo } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (usuario.codigoVerificacion !== codigo) {
      return res
        .status(400)
        .json({ message: "El código introducido es incorrecto" });
    }

    await prisma.usuario.update({
      where: { email },
      data: {
        verificado: true,
        codigoVerificacion: null,
      },
    });

    res.json({
      message: "¡Cuenta activada con éxito! Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en verificación:", error);
    res.status(500).json({ message: "Error interno al verificar la cuenta" });
  }
};

// Añade esta importación si no la tienes arriba
// import bcrypt from 'bcrypt';

export const cambiarPassword = async (req: Request | any, res: Response) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    const userId = req.user.userId; // Obtenido gracias al middleware authenticateJWT

    // 1. Buscamos al usuario en la base de datos
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Comprobamos que la contraseña actual es correcta
    const isPasswordValid = await bcrypt.compare(passwordActual, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // 3. Hasheamos la nueva contraseña
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    // 4. Actualizamos el usuario en la base de datos
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.status(200).json({ 
      status: 'success', 
      message: '¡Contraseña forjada con éxito! Tu cuenta ahora es más segura.' 
    });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: 'Error interno al actualizar la contraseña' });
  }
};