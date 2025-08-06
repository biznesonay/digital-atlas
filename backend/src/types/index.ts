import { Request } from 'express';
import { User } from '@prisma/client';

// Расширяем Request для добавления пользователя
export interface AuthRequest extends Request {
  user?: User;
  userId?: number;
}

// Типы для ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Типы для языков
export type LanguageCode = 'ru' | 'kz' | 'en';

// Типы для фильтров
export interface ObjectFilters {
  search?: string;
  infrastructureTypes?: number[];
  priorityDirections?: number[];
  regionId?: number;
  lang?: LanguageCode;
}

// Типы для пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
