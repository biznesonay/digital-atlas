import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Стандартизированный ответ API
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
  meta?: any
): Response => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    ...(data && { data }),
    ...(message && { message }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Отправка ошибки
 */
export const sendError = (
  res: Response,
  statusCode: number,
  error: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(details && { details }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Очистка объекта от пустых значений
 */
export const cleanObject = (obj: any): any => {
  if (obj === null || obj === undefined) return undefined;
  
  if (Array.isArray(obj)) {
    const cleaned = obj.map(cleanObject).filter(item => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  // Для строк проверяем на пустоту
  if (typeof obj === 'string' && obj.trim() === '') {
    return undefined;
  }
  
  return obj;
};

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация телефона
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

/**
 * Валидация URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Форматирование телефона
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s-()]/g, '');
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '+7' + cleaned.slice(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
};

/**
 * Извлечение координат из Google Maps URL
 */
export const extractCoordinatesFromGoogleMaps = (url: string): { lat: number; lng: number } | null => {
  try {
    // Паттерны для различных форматов Google Maps URL
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // !3dlat!4dlng
      /&ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // &ll=lat,lng
      /\?ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ?ll=lat,lng
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
    return null;
  }
};

/**
 * Создание slug из текста
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Убираем специальные символы
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ''); // Убираем дефисы в начале и конце
};

/**
 * Пагинация
 */
export const paginate = (page: number = 1, limit: number = 10) => {
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  
  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
    page: validPage,
    limit: validLimit,
  };
};

/**
 * Создание мета-информации для пагинации
 */
export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Задержка (для тестирования)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Генерация случайного ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Безопасное JSON.parse
 */
export const safeJsonParse = (str: string, defaultValue: any = null): any => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

/**
 * Проверка, является ли объект пустым
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Логирование с timestamp
 */
export const log = (message: string, data?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

/**
 * Обработка ошибок Prisma
 */
export const handlePrismaError = (error: any): string => {
  if (error.code === 'P2002') {
    return 'Данные уже существуют';
  }
  if (error.code === 'P2025') {
    return 'Запись не найдена';
  }
  if (error.code === 'P2003') {
    return 'Связанные данные не найдены';
  }
  
  return error.message || 'Произошла ошибка базы данных';
};