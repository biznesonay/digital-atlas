// backend/src/middleware/roleCheck.ts

import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Проверяем, что пользователь авторизован
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    // Проверяем роль пользователя
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Недостаточно прав для выполнения операции'
      });
    }
    
    next();
  };
};