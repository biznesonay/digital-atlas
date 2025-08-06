import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
  jwtExpire: process.env.JWT_EXPIRE || '30m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  
  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10), // minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Google APIs (для будущего использования)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY || '',
};

// Проверка обязательных переменных окружения
export function validateConfig(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Проверка безопасности в production
  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'default-secret-change-this') {
      throw new Error('JWT_SECRET must be changed in production!');
    }
  }
}
