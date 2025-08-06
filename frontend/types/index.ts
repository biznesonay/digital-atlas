// Языковые коды
export type LanguageCode = 'ru' | 'kz' | 'en';

// Типы для объектов инфраструктуры
export interface InfrastructureType {
  id: number;
  icon: string;
  color: string;
  name: string;
}

// Типы для регионов
export interface Region {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
}

// Типы для приоритетных направлений
export interface PriorityDirection {
  id: number;
  name: string;
}

// Типы для телефонов
export interface Phone {
  id?: number;
  number: string;
  type: 'MAIN' | 'ADDITIONAL' | 'FAX' | 'MOBILE';
  order?: number;
}

// Типы для организаций
export interface Organization {
  id?: number;
  name: string;
  website?: string;
}

// Типы для переводов объекта
export interface ObjectTranslation {
  languageCode: string;
  name: string;
  address: string;
  isPublished: boolean;
}

// Основной тип для объекта
export interface DigitalObject {
  id: number;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
  geocodingStatus?: string;
  createdAt: string;
  updatedAt: string;
  infrastructureType: InfrastructureType;
  region: Region;
  translations: ObjectTranslation[];
  phones: Phone[];
  priorityDirections: PriorityDirection[];
  organizations: Organization[];
  // Поля из текущего перевода для удобства
  name?: string;
  address?: string;
  isPublished?: boolean;
}

// Типы для фильтров
export interface ObjectFilters {
  search?: string;
  infrastructureTypeIds?: number[];
  priorityDirectionIds?: number[];
  regionId?: number;
  isPublished?: boolean;
  hasCoordinates?: boolean;
}

// Типы для пагинации
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: PaginationMeta;
}

// Типы для аутентификации
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Типы для координат
export interface Coordinates {
  lat: number;
  lng: number;
}

// Типы для маркеров на карте
export interface MapMarker {
  id: number;
  position: Coordinates;
  type: InfrastructureType;
  title: string;
  object: DigitalObject;
}
