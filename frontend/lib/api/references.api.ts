import { apiClient } from './client';
import { InfrastructureType, Region, PriorityDirection, LanguageCode } from '@/types';

export class ReferencesAPI {
  static async getInfrastructureTypes(lang: LanguageCode = 'ru') {
    return apiClient.get<InfrastructureType[]>('/references/infrastructure-types', {
      params: { lang }
    });
  }

  static async getRegions(lang: LanguageCode = 'ru') {
    return apiClient.get<Region[]>('/references/regions', {
      params: { lang }
    });
  }

  static async getPriorityDirections() {
    return apiClient.get<PriorityDirection[]>('/references/priority-directions');
  }
}
