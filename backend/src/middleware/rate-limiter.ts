import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/app.config';
import { ApiResponse } from '../types';

// Rate limiter для общих запросов
export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000, // минуты в миллисекунды
  max: config.rateLimitMaxRequests,
  message: 'Слишком много запросов с этого IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response<ApiResponse>) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Превышен лимит запросов. Попробуйте позже.',
      },
    });
  },
});

// Более строгий rate limiter для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа
  skipSuccessfulRequests: true, // не считать успешные попытки
  message: 'Слишком много попыток входа, попробуйте через 15 минут',
  handler: (req: Request, res: Response<ApiResponse>) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
      },
    });
  },
});

// Rate limiter для загрузки файлов
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 20, // максимум 20 загрузок в час
  message: 'Превышен лимит загрузки файлов',
  handler: (req: Request, res: Response<ApiResponse>) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Превышен лимит загрузки файлов. Попробуйте через час.',
      },
    });
  },
});
