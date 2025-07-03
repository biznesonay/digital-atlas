// backend/src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Логирование ошибки
  console.error('🔥 Ошибка:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  
  // Определение статуса ошибки
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';
  
  // Обработка специфических ошибок Prisma
  if (err.code === 'P2002') {
    status = 409;
    message = 'Запись с такими данными уже существует';
  } else if (err.code === 'P2025') {
    status = 404;
    message = 'Запись не найдена';
  } else if (err.code === 'P2003') {
    status = 400;
    message = 'Неверная ссылка на связанную запись';
  }
  
  // Обработка ошибок валидации
  if (err.name === 'ValidationError') {
    status = 400;
  }
  
  // Отправка ответа
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};