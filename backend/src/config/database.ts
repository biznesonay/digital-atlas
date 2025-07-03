import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

// Обработка подключения
prisma.$connect()
  .then(() => {
    logger.info('✅ Успешное подключение к базе данных');
  })
  .catch((error) => {
    logger.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  });

// Обработка отключения
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };