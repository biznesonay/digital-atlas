import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './error-handler';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(
        new AppError('Ошибка валидации данных', 400, 'VALIDATION_ERROR', { errors })
      );
    }

    // Заменяем body на валидированные данные
    req.body = value;
    next();
  };
};
