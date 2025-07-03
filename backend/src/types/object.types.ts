// backend/src/types/object.types.ts

export interface CreateObjectDTO {
  infrastructureTypeId: number;
  regionId: number;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  geocodingStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'MANUAL';
  translations: {
    languageCode: 'ru' | 'kz' | 'en';
    name: string;
    address: string;
    isPublished: boolean;
  }[];
  phones?: {
    number: string;
    type: 'MAIN' | 'ADDITIONAL' | 'FAX' | 'MOBILE';
  }[];
  priorityDirections?: number[];
  organizations?: {
    name: string;
    website?: string;
  }[];
}

export interface UpdateObjectDTO extends Partial<CreateObjectDTO> {
  id: number;
}

export interface ObjectFilter {
  search?: string;
  infrastructureTypeId?: number;
  regionId?: number;
  priorityDirections?: number[];
  isPublished?: boolean;
  geocodingStatus?: string;
  lang?: 'ru' | 'kz' | 'en';
}

export interface ObjectResponse {
  id: number;
  infrastructureType: {
    id: number;
    icon: string;
    color: string;
    name: string;
  };
  region: {
    id: number;
    name: string;
  };
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  website?: string;
  logoUrl?: string;
  imageUrl?: string;
  geocodingStatus?: string;
  name: string;
  address: string;
  phones: Array<{
    id: number;
    number: string;
    type: string;
  }>;
  priorityDirections: Array<{
    id: number;
    name: string;
  }>;
  organizations: Array<{
    id: number;
    name: string;
    website?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}