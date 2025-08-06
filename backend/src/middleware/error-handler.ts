import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { config } from '../config/app.config';
import { ApiResponse } from '../types';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Внутренняя ошибка сервера';
  let details = undefined;

  // Логируем все ошибки
  logger.error('Ошибка обработки запроса', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    error: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params,
    user: (req as any).userId,
  });

  // Обработка известных ошибок
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } 
  // Обработка ошибок Prisma
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'Запись с такими данными уже существует';
      details = { fields: err.meta?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Запись не найдена';
    }
    
    logger.error('Ошибка Prisma', {
      prismaCode: err.code,
      meta: err.meta,
    });
  } 
  // Обработка ошибок валидации Prisma
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Ошибка валидации данных';
    
    logger.error('Ошибка валидации Prisma', {
      validationError: err.message,
    });
  }

  // В режиме разработки показываем stack trace
  if (config.nodeEnv === 'development') {
    details = {
      ...details,
      stack: err.stack,
      originalError: err.message,
    };
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

// Middleware для обработки 404
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('404 - Маршрут не найден', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Маршрут ${req.method} ${req.url} не найден`,
    },
  });
};
