// backend/src/services/dictionariesService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DictionariesService {
  // Получить типы инфраструктуры
  async getInfrastructureTypes(lang: string = 'ru', includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    const types = await prisma.infrastructureType.findMany({
      where,
      include: {
        translations: {
          where: { languageCode: lang }
        },
        _count: {
          select: { objects: true }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    return types.map(type => ({
      id: type.id,
      icon: type.icon,
      color: type.color,
      name: type.translations[0]?.name || '',
      objectsCount: type._count.objects,
      isActive: type.isActive,
      order: type.order
    }));
  }
  
  // Получить регионы
  async getRegions(lang: string = 'ru') {
    const regions = await prisma.region.findMany({
      include: {
        translations: {
          where: { languageCode: lang }
        },
        _count: {
          select: { objects: true }
        },
        children: {
          include: {
            translations: {
              where: { languageCode: lang }
            },
            _count: {
              select: { objects: true }
            }
          }
        }
      },
      where: { parentId: null }, // Только корневые регионы
      orderBy: { id: 'asc' }
    });
    
    const formatRegion = (region: any): any => ({
      id: region.id,
      code: region.code,
      name: region.translations[0]?.name || '',
      objectsCount: region._count.objects,
      children: region.children?.map(formatRegion) || []
    });
    
    return regions.map(formatRegion);
  }
  
  // Получить приоритетные направления
  async getPriorityDirections(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    const directions = await prisma.priorityDirection.findMany({
      where,
      include: {
        _count: {
          select: { objects: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return directions.map(dir => ({
      id: dir.id,
      name: dir.name,
      objectsCount: dir._count.objects,
      isActive: dir.isActive,
      order: dir.order
    }));
  }
  
  // Поиск по всем справочникам (для автокомплита)
  async searchDictionaries(query: string, lang: string = 'ru') {
    const searchTerm = `%${query}%`;
    
    // Поиск по типам инфраструктуры
    const infrastructureTypes = await prisma.infrastructureType.findMany({
      where: {
        isActive: true,
        translations: {
          some: {
            languageCode: lang,
            name: { contains: query, mode: 'insensitive' }
          }
        }
      },
      include: {
        translations: {
          where: { languageCode: lang }
        }
      },
      take: 5
    });
    
    // Поиск по регионам
    const regions = await prisma.region.findMany({
      where: {
        translations: {
          some: {
            languageCode: lang,
            name: { contains: query, mode: 'insensitive' }
          }
        }
      },
      include: {
        translations: {
          where: { languageCode: lang }
        }
      },
      take: 5
    });
    
    // Поиск по приоритетным направлениям
    const priorityDirections = await prisma.priorityDirection.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5
    });
    
    return {
      infrastructureTypes: infrastructureTypes.map(type => ({
        id: type.id,
        type: 'infrastructureType',
        name: type.translations[0]?.name || '',
        icon: type.icon,
        color: type.color
      })),
      regions: regions.map(region => ({
        id: region.id,
        type: 'region',
        name: region.translations[0]?.name || ''
      })),
      priorityDirections: priorityDirections.map(dir => ({
        id: dir.id,
        type: 'priorityDirection',
        name: dir.name
      }))
    };
  }
  
  // Создать или обновить приоритетное направление
  async createOrUpdatePriorityDirection(name: string): Promise<number> {
    // Проверяем существование
    const existing = await prisma.priorityDirection.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    });
    
    if (existing) {
      return existing.id;
    }
    
    // Создаем новое
    const created = await prisma.priorityDirection.create({
      data: {
        name,
        isActive: true
      }
    });
    
    return created.id;
  }
}

export const dictionariesService = new DictionariesService();