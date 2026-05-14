import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    nombreClase: z.string().min(3, 'El nombre de la clase debe tener al menos 3 caracteres'),
    // Hacemos la clave opcional para generar una automáticamente si el profesor no la envía
    claveIngreso: z.string().min(4, 'La clave de ingreso debe tener al menos 4 caracteres').optional()
  })
});

export const linkStudentSchema = z.object({
  body: z.object({
    codigoAcceso: z.string().min(6, 'El código de acceso debe tener al menos 6 caracteres')
  })
});

export const joinClassSchema = z.object({
  body: z.object({
    codigoClase: z.string().min(1, 'El código de clase es requerido'),
    claveIngreso: z.string().min(1, 'La clave de ingreso es requerida'),
    // alumnoId es requerido si la petición la hace un Padre, pero Zod lo deja opcional
    // para que la validación fuerte se haga en el controlador según el rol del usuario
    alumnoId: z.number().int().positive('El ID del alumno debe ser un número positivo').optional()
  })
});
