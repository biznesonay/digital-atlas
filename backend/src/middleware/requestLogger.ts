// backend/src/middleware/requestLogger.ts

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Логируем после завершения запроса
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(`❌ ${message}`);
    } else {
      console.log(`✅ ${message}`);
    }
  });
  
  next();
};