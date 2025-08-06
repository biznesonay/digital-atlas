import { LanguageCode } from './index';

export interface CreateObjectDto {
  infrastructureTypeId: number;
  regionId: number;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  translations: {
    ru?: {
      name: string;
      address: string;
      isPublished?: boolean;
    };
    kz?: {
      name: string;
      address: string;
      isPublished?: boolean;
    };
    en?: {
      name: string;
      address: string;
      isPublished?: boolean;
    };
  };
  phones?: {
    number: string;
    type?: 'MAIN' | 'ADDITIONAL' | 'FAX' | 'MOBILE';
  }[];
  priorityDirectionIds?: number[];
  organizations?: {
    name: string;
    website?: string;
  }[];
}

export interface UpdateObjectDto extends Partial<CreateObjectDto> {
  id: number;
}

export interface ObjectFiltersDto {
  search?: string;
  infrastructureTypeIds?: number[];
  priorityDirectionIds?: number[];
  regionId?: number;
  isPublished?: boolean;
  geocodingStatus?: string;
  hasCoordinates?: boolean;
}

export interface ObjectWithRelations {
  id: number;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  geocodingStatus?: string | null;
  createdAt: Date;
  updatedAt: Date;
  infrastructureType: {
    id: number;
    icon: string;
    color: string;
    name?: string;
  };
  region: {
    id: number;
    code?: string | null;
    name?: string;
  };
  translations: Array<{
    languageCode: string;
    name: string;
    address: string;
    isPublished: boolean;
  }>;
  phones: Array<{
    id: number;
    number: string;
    type: string;
    order: number;
  }>;
  priorityDirections: Array<{
    id: number;
    name: string;
  }>;
  organizations: Array<{
    id: number;
    name: string;
    website?: string | null;
  }>;
}
