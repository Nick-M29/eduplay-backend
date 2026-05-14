import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(50, 'La contraseña no puede exceder los 50 caracteres');

export const registerSchema = z.object({
  body: z.discriminatedUnion('rol', [
    z.object({
      rol: z.literal('PROFESOR'),
      email: z.string().email('Email inválido'),
      password: passwordValidation,
      nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
      fechaNacimiento: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Fecha de nacimiento requerida e inválida (se espera formato YYYY-MM-DD o ISO string)'
      }),
    }),
    z.object({
      rol: z.literal('PADRE'),
      email: z.string().email('Email inválido'),
      password: passwordValidation,
      nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
      fechaNacimiento: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Fecha de nacimiento requerida e inválida (se espera formato YYYY-MM-DD o ISO string)'
      }),
    }),
    z.object({
      rol: z.literal('ALUMNO'),
      email: z.string().email('Email inválido'),
      password: passwordValidation,
      nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
      // Los alumnos no requieren fecha de nacimiento según el modelo de base de datos
    })
  ])
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  })
});
