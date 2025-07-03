// src/types/index.ts

import { Request } from 'express';

// Расширяем Request для добавления пользователя
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Типы для объектов
export interface ObjectData {
  id?: number;
  infrastructureTypeId: number;
  regionId: number;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
  geocodingStatus?: 'SUCCESS' | 'FAILED' | 'MANUAL' | 'PENDING';
  translations: ObjectTranslationData[];
  phones: PhoneData[];
  priorityDirections: number[];
  organizations: OrganizationData[];
}

export interface ObjectTranslationData {
  languageCode: 'ru' | 'kz' | 'en';
  name: string;
  address: string;
  isPublished: boolean;
}

export interface PhoneData {
  number: string;
  type: 'MAIN' | 'ADDITIONAL' | 'FAX' | 'MOBILE';
  order?: number;
}

export interface OrganizationData {
  name: string;
  website?: string;
}

// Типы для фильтрации
export interface ObjectFilters {
  search?: string;
  infrastructureTypes?: number[];
  regions?: number[];
  priorityDirections?: number[];
  lang?: 'ru' | 'kz' | 'en';
  isPublished?: boolean;
}

// Типы для импорта
export interface ImportRow {
  [key: string]: any;
  'Объект инновационной инфраструктуры'?: string;
  'Название (RU)'?: string;
  'Название (KZ)'?: string;
  'Название (EN)'?: string;
  'Адрес (RU)'?: string;
  'Адрес (KZ)'?: string;
  'Адрес (EN)'?: string;
  'Приоритетные направления'?: string;
  'Регион'?: string;
  'URL Google maps'?: string;
  'Телефоны'?: string;
  'Сайт'?: string;
}

export interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: ImportError[];
  createdObjects: number;
  updatedObjects: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

// Типы для аутентификации
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'EDITOR';
}

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Типы для справочников
export interface InfrastructureTypeData {
  id?: number;
  icon: string;
  color: string;
  order?: number;
  isActive?: boolean;
  translations: {
    languageCode: 'ru' | 'kz' | 'en';
    name: string;
  }[];
}

export interface RegionData {
  id?: number;
  code?: string;
  parentId?: number;
  translations: {
    languageCode: 'ru' | 'kz' | 'en';
    name: string;
  }[];
}

export interface PriorityDirectionData {
  id?: number;
  name: string;
  order?: number;
  isActive?: boolean;
}

// Константы для валидации
export const VALIDATION_LIMITS = {
  TEXT_MAX_LENGTH: 1000,
  NAME_MAX_LENGTH: 200,
  PHONE_MAX_COUNT: 5,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const SUPPORTED_LANGUAGES = ['ru', 'kz', 'en'] as const;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const SUPPORTED_EXCEL_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
] as const;