import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JwtUtil } from '../utils/jwt';
import { AppError } from './error-handler';
import { prisma } from '../config/database';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Токен авторизации не предоставлен', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Проверяем токен
    const payload = JwtUtil.verifyAccessToken(token);

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Пользователь не найден или деактивирован', 401, 'UNAUTHORIZED');
    }

    // Добавляем пользователя в запрос
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Недействительный токен авторизации', 401, 'INVALID_TOKEN'));
    }
  }
};

// Middleware для проверки роли
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Пользователь не аутентифицирован', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Недостаточно прав для выполнения операции', 403, 'FORBIDDEN'));
    }

    next();
  };
};

// Опциональная аутентификация (для публичных endpoints с возможностью авторизации)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Продолжаем без аутентификации
    }

    const token = authHeader.substring(7);
    const payload = JwtUtil.verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch {
    // Игнорируем ошибки и продолжаем без аутентификации
    next();
  }
};
