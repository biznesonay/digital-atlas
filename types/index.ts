// Основные типы для объектов инфраструктуры
export interface InfrastructureObject {
  id: number;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: InfrastructureType;
  priorityDirections: PriorityDirection[];
  region: Region;
  website?: string;
  contactPhones?: string;
  logoUrl?: string;
  imageUrl?: string;
}

export interface InfrastructureType {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface PriorityDirection {
  id: number;
  name: string;
}

// Типы для фильтров
export interface FilterState {
  search: string;
  infrastructureTypes: number[];
  regions: number[];
  priorityDirections: number[];
}

// Типы для карты
export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapType: 'roadmap' | 'satellite';
}

// Типы для аутентификации
export interface User {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Языковые коды
export type LanguageCode = 'ru' | 'kz' | 'en';