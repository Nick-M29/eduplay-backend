import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validamos y extraemos los datos validados (parse arrojará un error si falla)
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // Si la validación es exitosa, pasamos al controlador
    } catch (error) {
      // Si falla, pasamos el error (ZodError) al middleware global de manejo de errores
      next(error);
    }
  };
};
