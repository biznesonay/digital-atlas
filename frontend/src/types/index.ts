// frontend/src/types/index.ts

// Типы для инфраструктуры
export interface InfrastructureType {
  id: number;
  icon: string;
  color: string;
  name: string;
  objectsCount?: number;
  isActive?: boolean;
}

// Типы для регионов
export interface Region {
  id: number;
  code?: string;
  name: string;
  objectsCount?: number;
  children?: Region[];
}

// Типы для приоритетных направлений
export interface PriorityDirection {
  id: number;
  name: string;
  objectsCount?: number;
  isActive?: boolean;
}

// Типы для телефонов
export interface Phone {
  id: number;
  number: string;
  type: 'MAIN' | 'ADDITIONAL' | 'FAX' | 'MOBILE';
}

// Типы для организаций
export interface Organization {
  id: number;
  name: string;
  website?: string;
}

// Основной тип для объекта
export interface MapObject {
  id: number;
  infrastructureType: InfrastructureType;
  region: Region;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
  geocodingStatus?: string;
  name: string;
  address: string;
  phones: Phone[];
  priorityDirections: PriorityDirection[];
  organizations: Organization[];
  createdAt?: string;
  updatedAt?: string;
}

// Фильтры
export interface ObjectFilter {
  search?: string;
  infrastructureTypeId?: number;
  regionId?: number;
  priorityDirections?: number[];
  lang?: 'ru' | 'kz' | 'en';
}

// API Response типы
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  count?: number;
}

// Состояние Redux
export interface RootState {
  objects: ObjectsState;
  filters: FiltersState;
  ui: UIState;
}

export interface ObjectsState {
  items: MapObject[];
  loading: boolean;
  error: string | null;
}

export interface FiltersState {
  search: string;
  infrastructureTypeId: number | null;
  regionId: number | null;
  priorityDirections: number[];
}

export interface UIState {
  selectedObjectId: number | null;
  mapCenter: {
    lat: number;
    lng: number;
  };
  mapZoom: number;
  sidebarOpen: boolean;
  modalOpen: boolean;
}