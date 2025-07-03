// backend/src/services/objectsService.ts

import { PrismaClient } from '@prisma/client';
import { CreateObjectDTO, UpdateObjectDTO, ObjectFilter, ObjectResponse } from '../types/object.types';

const prisma = new PrismaClient();

export class ObjectsService {
  // Получить все объекты с фильтрацией
  async getObjects(filter: ObjectFilter): Promise<ObjectResponse[]> {
    const lang = filter.lang || 'ru';
    
    const where: any = {};
    
    // Поиск по названию и адресу
    if (filter.search) {
      where.translations = {
        some: {
          languageCode: lang,
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { address: { contains: filter.search, mode: 'insensitive' } }
          ]
        }
      };
    }
    
    // Фильтр по типу инфраструктуры
    if (filter.infrastructureTypeId) {
      where.infrastructureTypeId = filter.infrastructureTypeId;
    }
    
    // Фильтр по региону
    if (filter.regionId) {
      where.regionId = filter.regionId;
    }
    
    // Фильтр по приоритетным направлениям
    if (filter.priorityDirections && filter.priorityDirections.length > 0) {
      where.priorityDirections = {
        some: {
          id: { in: filter.priorityDirections }
        }
      };
    }
    
    // Фильтр по статусу публикации
    if (filter.isPublished !== undefined) {
      where.translations = {
        some: {
          languageCode: lang,
          isPublished: filter.isPublished
        }
      };
    }
    
    // Фильтр по статусу геокодирования
    if (filter.geocodingStatus) {
      where.geocodingStatus = filter.geocodingStatus;
    }
    
    const objects = await prisma.object.findMany({
      where,
      include: {
        infrastructureType: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        region: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        translations: {
          where: { languageCode: lang }
        },
        phones: {
          orderBy: { order: 'asc' }
        },
        priorityDirections: true,
        organizations: true
      }
    });
    
    // Форматируем ответ
    return objects
      .filter(obj => obj.translations.length > 0) // Только объекты с переводом
      .map(obj => this.formatObjectResponse(obj, lang));
  }
  
  // Получить объект по ID
  async getObjectById(id: number, lang: string = 'ru'): Promise<ObjectResponse | null> {
    const object = await prisma.object.findUnique({
      where: { id },
      include: {
        infrastructureType: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        region: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        translations: {
          where: { languageCode: lang }
        },
        phones: {
          orderBy: { order: 'asc' }
        },
        priorityDirections: true,
        organizations: true
      }
    });
    
    if (!object || object.translations.length === 0) {
      return null;
    }
    
    return this.formatObjectResponse(object, lang);
  }
  
  // Создать новый объект
  async createObject(data: CreateObjectDTO): Promise<ObjectResponse> {
    // Валидация: максимум 5 телефонов
    if (data.phones && data.phones.length > 5) {
      throw new Error('Максимально допустимо 5 телефонов');
    }
    
    // Валидация: хотя бы один язык должен быть опубликован
    const hasPublished = data.translations.some(t => t.isPublished);
    if (!hasPublished) {
      throw new Error('Хотя бы один язык должен быть опубликован');
    }
    
    const object = await prisma.object.create({
      data: {
        infrastructureTypeId: data.infrastructureTypeId,
        regionId: data.regionId,
        latitude: data.latitude,
        longitude: data.longitude,
        googleMapsUrl: data.googleMapsUrl,
        website: data.website,
        geocodingStatus: data.geocodingStatus || 'PENDING',
        translations: {
          create: data.translations.map(t => ({
            languageCode: t.languageCode,
            name: t.name.substring(0, 1000), // Ограничение 1000 символов
            address: t.address.substring(0, 1000),
            isPublished: t.isPublished
          }))
        },
        phones: data.phones ? {
          create: data.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type,
            order: index
          }))
        } : undefined,
        priorityDirections: data.priorityDirections ? {
          connect: data.priorityDirections.map(id => ({ id }))
        } : undefined,
        organizations: data.organizations ? {
          create: data.organizations
        } : undefined
      },
      include: {
        infrastructureType: {
          include: { translations: true }
        },
        region: {
          include: { translations: true }
        },
        translations: true,
        phones: true,
        priorityDirections: true,
        organizations: true
      }
    });
    
    return this.formatObjectResponse(object, 'ru');
  }
  
  // Обновить объект
  async updateObject(id: number, data: UpdateObjectDTO): Promise<ObjectResponse> {
    // Проверяем существование объекта
    const existing = await prisma.object.findUnique({
      where: { id },
      include: { phones: true, translations: true }
    });
    
    if (!existing) {
      throw new Error('Объект не найден');
    }
    
    // Валидация телефонов
    if (data.phones && data.phones.length > 5) {
      throw new Error('Максимально допустимо 5 телефонов');
    }
    
    const updateData: any = {
      infrastructureTypeId: data.infrastructureTypeId,
      regionId: data.regionId,
      latitude: data.latitude,
      longitude: data.longitude,
      googleMapsUrl: data.googleMapsUrl,
      website: data.website,
      geocodingStatus: data.geocodingStatus,
      updatedAt: new Date()
    };
    
    // Обновление переводов
    if (data.translations) {
      // Удаляем старые и создаем новые
      await prisma.objectTranslation.deleteMany({
        where: { objectId: id }
      });
      
      updateData.translations = {
        create: data.translations.map(t => ({
          languageCode: t.languageCode,
          name: t.name.substring(0, 1000),
          address: t.address.substring(0, 1000),
          isPublished: t.isPublished
        }))
      };
    }
    
    // Обновление телефонов
    if (data.phones !== undefined) {
      // Удаляем старые
      await prisma.phone.deleteMany({
        where: { objectId: id }
      });
      
      // Создаем новые
      if (data.phones.length > 0) {
        updateData.phones = {
          create: data.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type,
            order: index
          }))
        };
      }
    }
    
    // Обновление приоритетных направлений
    if (data.priorityDirections !== undefined) {
      updateData.priorityDirections = {
        set: data.priorityDirections.map(id => ({ id }))
      };
    }
    
    // Обновление организаций
    if (data.organizations !== undefined) {
      // Удаляем старые
      await prisma.organization.deleteMany({
        where: { objectId: id }
      });
      
      // Создаем новые
      if (data.organizations.length > 0) {
        updateData.organizations = {
          create: data.organizations
        };
      }
    }
    
    const object = await prisma.object.update({
      where: { id },
      data: updateData,
      include: {
        infrastructureType: {
          include: { translations: true }
        },
        region: {
          include: { translations: true }
        },
        translations: true,
        phones: true,
        priorityDirections: true,
        organizations: true
      }
    });
    
    return this.formatObjectResponse(object, 'ru');
  }
  
  // Удалить объект
  async deleteObject(id: number): Promise<boolean> {
    const existing = await prisma.object.findUnique({
      where: { id }
    });
    
    if (!existing) {
      throw new Error('Объект не найден');
    }
    
    await prisma.object.delete({
      where: { id }
    });
    
    return true;
  }
  
  // Массовая активация/деактивация
  async bulkUpdateStatus(ids: number[], isPublished: boolean, lang: string = 'ru'): Promise<number> {
    const result = await prisma.objectTranslation.updateMany({
      where: {
        objectId: { in: ids },
        languageCode: lang
      },
      data: {
        isPublished
      }
    });
    
    return result.count;
  }
  
  // Форматирование ответа
  private formatObjectResponse(object: any, lang: string): ObjectResponse {
    const translation = object.translations[0];
    const infrastructureTypeTranslation = object.infrastructureType.translations[0];
    const regionTranslation = object.region.translations[0];
    
    return {
      id: object.id,
      infrastructureType: {
        id: object.infrastructureType.id,
        icon: object.infrastructureType.icon,
        color: object.infrastructureType.color,
        name: infrastructureTypeTranslation?.name || ''
      },
      region: {
        id: object.region.id,
        name: regionTranslation?.name || ''
      },
      latitude: object.latitude,
      longitude: object.longitude,
      googleMapsUrl: object.googleMapsUrl,
      website: object.website,
      logoUrl: object.logoUrl,
      imageUrl: object.imageUrl,
      geocodingStatus: object.geocodingStatus,
      name: translation.name,
      address: translation.address,
      phones: object.phones.map((phone: any) => ({
        id: phone.id,
        number: phone.number,
        type: phone.type
      })),
      priorityDirections: object.priorityDirections,
      organizations: object.organizations,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt
    };
  }
}