import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', {
          path: req.path,
          method: req.method,
          body: req.body,
          errors: error.issues,
        });
        return res.status(400).json({
          error: 'Validation error',
          details: error.issues,
        });
      }
      console.error('Validation middleware error:', error);
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

