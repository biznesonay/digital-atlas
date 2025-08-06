import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config, validateConfig } from './config/app.config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limiter';

// Проверяем конфигурацию
validateConfig();

// Создаем Express приложение
const app = express();

// Базовые middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Для загрузки изображений
}));
app.use(compression());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(loggerMiddleware);

// Rate limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

// API информация
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Digital Atlas API',
      version: '1.0.0',
      description: 'API для Цифрового атласа инновационной инфраструктуры',
      endpoints: {
        health: '/api/health',
        objects: '/api/objects',
        auth: '/api/auth',
        admin: '/api/admin',
      },
    },
  });
});

// Тестовый endpoint для проверки БД
app.get('/api/test-db', async (req, res, next) => {
  try {
    const { prisma } = await import('./config/database');
    
    const counts = await prisma.$transaction([
      prisma.user.count(),
      prisma.region.count(),
      prisma.infrastructureType.count(),
      prisma.priorityDirection.count(),
      prisma.object.count(),
    ]);
    
    res.json({
      success: true,
      data: {
        users: counts[0],
        regions: counts[1],
        infrastructureTypes: counts[2],
        priorityDirections: counts[3],
        objects: counts[4],
      },
    });
  } catch (error) {
    next(error);
  }
});

// Здесь будут подключаться маршруты
// app.use('/api/auth', authRoutes);
// app.use('/api/objects', objectsRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (должен быть последним)
app.use(errorHandler);

// Запуск сервера
async function startServer(): Promise<void> {
  try {
    // Подключаемся к БД
    await connectDatabase();
    
    // Запускаем сервер
    const server = app.listen(config.port, () => {
      console.log(`
🚀 Server is running!
📍 Local: http://localhost:${config.port}
📍 API: http://localhost:${config.port}/api
🌍 Environment: ${config.nodeEnv}
      `);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });
      
      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Обработка сигналов завершения
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Запускаем сервер
startServer();

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // В production лучше перезапустить процесс
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // В production лучше перезапустить процесс
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

export default app;
