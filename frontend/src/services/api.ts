// frontend/src/services/api.ts

import axios from 'axios';
import type { 
  MapObject, 
  InfrastructureType, 
  Region, 
  PriorityDirection,
  ObjectFilter,
  ApiResponse 
} from '@/types';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API методы
export const objectsAPI = {
  // Получить все объекты с фильтрацией
  getObjects: async (filters?: ObjectFilter): Promise<ApiResponse<MapObject[]>> => {
    const { data } = await api.get('/objects', { params: filters });
    return data;
  },

  // Получить объект по ID
  getObjectById: async (id: number, lang: string = 'ru'): Promise<ApiResponse<MapObject>> => {
    const { data } = await api.get(`/objects/${id}`, { params: { lang } });
    return data;
  },
};

export const dictionariesAPI = {
  // Получить типы инфраструктуры
  getInfrastructureTypes: async (lang: string = 'ru'): Promise<ApiResponse<InfrastructureType[]>> => {
    const { data } = await api.get('/dictionaries/infrastructure-types', { params: { lang } });
    return data;
  },

  // Получить регионы
  getRegions: async (lang: string = 'ru'): Promise<ApiResponse<Region[]>> => {
    const { data } = await api.get('/dictionaries/regions', { params: { lang } });
    return data;
  },

  // Получить приоритетные направления
  getPriorityDirections: async (): Promise<ApiResponse<PriorityDirection[]>> => {
    const { data } = await api.get('/dictionaries/priority-directions');
    return data;
  },

  // Поиск по всем справочникам
  searchDictionaries: async (query: string, lang: string = 'ru'): Promise<ApiResponse<any>> => {
    const { data } = await api.get('/dictionaries/search', { params: { q: query, lang } });
    return data;
  },
};

export default api;