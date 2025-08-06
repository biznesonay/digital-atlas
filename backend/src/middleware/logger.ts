import morgan from 'morgan';
import { Request, Response } from 'express';
import { config } from '../config/app.config';

// Кастомный токен для morgan - показывает тело запроса в dev режиме
morgan.token('body', (req: Request) => {
  if (config.nodeEnv === 'development' && req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }
  return '-';
});

// Кастомный токен для времени ответа с цветом
morgan.token('response-time-colored', (req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  if (!responseTime) return '-';
  
  const time = parseInt(responseTime.toString(), 10);
  if (time < 100) return `\x1b[32m${time}ms\x1b[0m`; // Зеленый
  if (time < 500) return `\x1b[33m${time}ms\x1b[0m`; // Желтый
  return `\x1b[31m${time}ms\x1b[0m`; // Красный
});

// Формат для разработки
const devFormat = ':method :url :status :response-time-colored - :body';

// Формат для production
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

export const loggerMiddleware = morgan(
  config.nodeEnv === 'development' ? devFormat : prodFormat,
  {
    skip: (req: Request) => {
      // Пропускаем логирование health check в production
      return config.nodeEnv === 'production' && req.url === '/api/health';
    },
  }
);
