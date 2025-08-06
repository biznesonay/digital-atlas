import { PrismaClient } from '@prisma/client';
import { config } from './app.config';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.nodeEnv !== 'production') {
  global.prisma = prisma;
}

// Функция для проверки подключения к БД
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Функция для закрытия подключения к БД
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('👋 Database connection closed');
}
