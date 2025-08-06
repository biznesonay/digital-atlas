import { apiClient } from './client';
import { DigitalObject, ObjectFilters, PaginationMeta, LanguageCode } from '@/types';

export class ObjectsAPI {
  static async getObjects(
    filters: ObjectFilters = {},
    lang: LanguageCode = 'ru',
    page = 1,
    limit = 20
  ) {
    const params = {
      ...filters,
      lang,
      page,
      limit,
      // Преобразуем массивы в строки для query params
      infrastructureTypeIds: filters.infrastructureTypeIds?.join(','),
      priorityDirectionIds: filters.priorityDirectionIds?.join(','),
    };

    return apiClient.get<DigitalObject[]>('/objects', { params });
  }

  static async getObjectById(id: number, lang: LanguageCode = 'ru') {
    return apiClient.get<DigitalObject>(`/objects/${id}`, { 
      params: { lang } 
    });
  }

  static async createObject(data: any) {
    return apiClient.post<DigitalObject>('/objects', data);
  }

  static async updateObject(id: number, data: any) {
    return apiClient.put<DigitalObject>(`/objects/${id}`, data);
  }

  static async deleteObject(id: number) {
    return apiClient.delete(`/objects/${id}`);
  }
}
