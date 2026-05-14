import { z } from 'zod';

export const paramsClaseIdSchema = z.object({
  params: z.object({
    clase_id: z.string().regex(/^\d+$/, 'El ID de la clase debe ser un número')
  })
});

export const createMaterialSchema = z.object({
  params: z.object({
    clase_id: z.string().regex(/^\d+$/, 'El ID de la clase debe ser un número')
  }),
  body: z.object({
    titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    contenido: z.string().min(5, 'El contenido debe tener al menos 5 caracteres'),
    audiencia: z.enum(['ALUMNOS', 'PADRES', 'AMBOS'], {
      errorMap: () => ({ message: 'La audiencia debe ser ALUMNOS, PADRES o AMBOS' })
    })
  })
});

export const updatePuntosSchema = z.object({
  params: z.object({
    alumno_id: z.string().regex(/^\d+$/, 'El ID del alumno debe ser un número')
  }),
  body: z.object({
    puntos: z.number().int('Los puntos deben ser un número entero (puede ser negativo)')
  })
});
