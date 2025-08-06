import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { 
  CreateObjectDto, 
  UpdateObjectDto, 
  ObjectFiltersDto,
  ObjectWithRelations 
} from '../types/object.types';
import { LanguageCode } from '../types';
import { AppError } from '../middleware/error-handler';
import { GeocodingUtil } from '../utils/geocoding';

export class ObjectService {
  // Получение списка объектов с фильтрацией
  static async getObjects(
    filters: ObjectFiltersDto,
    lang: LanguageCode = 'ru',
    page = 1,
    limit = 20
  ): Promise<{
    objects: ObjectWithRelations[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Построение условий фильтрации
    const where: Prisma.ObjectWhereInput = {};

    // Поиск по названию и адресу
    if (filters.search) {
      where.translations = {
        some: {
          AND: [
            { languageCode: lang },
            {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { address: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          ],
        },
      };
    }

    // Фильтр по типу инфраструктуры
    if (filters.infrastructureTypeIds?.length) {
      where.infrastructureTypeId = { in: filters.infrastructureTypeIds };
    }

    // Фильтр по приоритетным направлениям
    if (filters.priorityDirectionIds?.length) {
      where.priorityDirections = {
        some: {
          priorityDirectionId: { in: filters.priorityDirectionIds },
        },
      };
    }

    // Фильтр по региону
    if (filters.regionId) {
      where.regionId = filters.regionId;
    }

    // Фильтр по статусу публикации
    if (filters.isPublished !== undefined) {
      where.translations = {
        some: {
          languageCode: lang,
          isPublished: filters.isPublished,
        },
      };
    }

    // Фильтр по статусу геокодирования
    if (filters.geocodingStatus) {
      where.geocodingStatus = filters.geocodingStatus;
    }

    // Фильтр по наличию координат
    if (filters.hasCoordinates !== undefined) {
      if (filters.hasCoordinates) {
        where.AND = [
          { latitude: { not: null } },
          { longitude: { not: null } },
        ];
      } else {
        where.OR = [
          { latitude: null },
          { longitude: null },
        ];
      }
    }

    // Выполнение запроса
    const [objects, total] = await prisma.$transaction([
      prisma.object.findMany({
        where,
        skip,
        take: limit,
        include: {
          infrastructureType: {
            include: {
              translations: {
                where: { languageCode: lang },
              },
            },
          },
          region: {
            include: {
              translations: {
                where: { languageCode: lang },
              },
            },
          },
          translations: true,
          phones: {
            orderBy: { order: 'asc' },
          },
          priorityDirections: {
            include: {
              priorityDirection: true,
            },
          },
          organizations: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.object.count({ where }),
    ]);

    // Форматирование данных
    const formattedObjects = objects.map(obj => this.formatObject(obj, lang));

    return {
      objects: formattedObjects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Получение объекта по ID
  static async getObjectById(
    id: number,
    lang: LanguageCode = 'ru'
  ): Promise<ObjectWithRelations | null> {
    const object = await prisma.object.findUnique({
      where: { id },
      include: {
        infrastructureType: {
          include: {
            translations: {
              where: { languageCode: lang },
            },
          },
        },
        region: {
          include: {
            translations: {
              where: { languageCode: lang },
            },
          },
        },
        translations: true,
        phones: {
          orderBy: { order: 'asc' },
        },
        priorityDirections: {
          include: {
            priorityDirection: true,
          },
        },
        organizations: true,
      },
    });

    if (!object) {
      return null;
    }

    return this.formatObject(object, lang);
  }

  // Создание объекта
  static async createObject(data: CreateObjectDto): Promise<ObjectWithRelations> {
    // Валидация: должен быть хотя бы один язык
    const hasTranslations = data.translations.ru || data.translations.kz || data.translations.en;
    if (!hasTranslations) {
      throw new AppError(
        'Необходимо заполнить данные хотя бы для одного языка',
        400,
        'NO_TRANSLATIONS'
      );
    }

    // Проверка количества телефонов
    if (data.phones && data.phones.length > 5) {
      throw new AppError(
        'Максимальное количество телефонов - 5',
        400,
        'TOO_MANY_PHONES'
      );
    }

    // Попытка извлечь координаты
    let coordinates = null;
    let geocodingStatus = 'PENDING';

    // 1. Пробуем извлечь из Google Maps URL
    if (data.googleMapsUrl) {
      coordinates = GeocodingUtil.extractCoordinatesFromUrl(data.googleMapsUrl);
      if (coordinates) {
        geocodingStatus = 'SUCCESS';
      }
    }

    // 2. Если координаты указаны напрямую
    if (!coordinates && data.latitude && data.longitude) {
      if (GeocodingUtil.validateCoordinates(data.latitude, data.longitude)) {
        coordinates = { lat: data.latitude, lng: data.longitude };
        geocodingStatus = 'MANUAL';
      }
    }

    // 3. Если нет координат, пробуем геокодирование (в будущем)
    if (!coordinates && data.translations.ru?.address) {
      // TODO: Вызов геокодирования
      geocodingStatus = 'FAILED';
    }

    // Создание объекта
    const object = await prisma.object.create({
      data: {
        infrastructureTypeId: data.infrastructureTypeId,
        regionId: data.regionId,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        googleMapsUrl: data.googleMapsUrl,
        website: data.website,
        geocodingStatus,
        translations: {
          create: Object.entries(data.translations)
            .filter(([_, trans]) => trans)
            .map(([lang, trans]) => ({
              languageCode: lang,
              name: trans!.name,
              address: trans!.address,
              isPublished: trans!.isPublished ?? false,
            })),
        },
        phones: data.phones ? {
          create: data.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type || 'MAIN',
            order: index,
          })),
        } : undefined,
        priorityDirections: data.priorityDirectionIds ? {
          create: data.priorityDirectionIds.map(dirId => ({
            priorityDirectionId: dirId,
          })),
        } : undefined,
        organizations: data.organizations ? {
          create: data.organizations,
        } : undefined,
      },
      include: {
        infrastructureType: {
          include: {
            translations: true,
          },
        },
        region: {
          include: {
            translations: true,
          },
        },
        translations: true,
        phones: true,
        priorityDirections: {
          include: {
            priorityDirection: true,
          },
        },
        organizations: true,
      },
    });

    return this.formatObject(object, 'ru');
  }

  // Обновление объекта
  static async updateObject(
    id: number,
    data: UpdateObjectDto
  ): Promise<ObjectWithRelations> {
    // Проверяем существование объекта
    const existingObject = await prisma.object.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existingObject) {
      throw new AppError('Объект не найден', 404, 'OBJECT_NOT_FOUND');
    }

    // Проверка количества телефонов
    if (data.phones && data.phones.length > 5) {
      throw new AppError(
        'Максимальное количество телефонов - 5',
        400,
        'TOO_MANY_PHONES'
      );
    }

    // Обработка координат
    let updateData: any = {
      infrastructureTypeId: data.infrastructureTypeId,
      regionId: data.regionId,
      googleMapsUrl: data.googleMapsUrl,
      website: data.website,
    };

    // Если изменился Google Maps URL, пробуем извлечь координаты
    if (data.googleMapsUrl && data.googleMapsUrl !== existingObject.googleMapsUrl) {
      const coordinates = GeocodingUtil.extractCoordinatesFromUrl(data.googleMapsUrl);
      if (coordinates) {
        updateData.latitude = coordinates.lat;
        updateData.longitude = coordinates.lng;
        updateData.geocodingStatus = 'SUCCESS';
      }
    }

    // Если координаты указаны напрямую
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (data.latitude && data.longitude && 
          GeocodingUtil.validateCoordinates(data.latitude, data.longitude)) {
        updateData.latitude = data.latitude;
        updateData.longitude = data.longitude;
        updateData.geocodingStatus = 'MANUAL';
      } else {
        updateData.latitude = null;
        updateData.longitude = null;
        updateData.geocodingStatus = 'FAILED';
      }
    }

    // Обновление объекта
    const updatedObject = await prisma.object.update({
      where: { id },
      data: {
        ...updateData,
        // Обновление переводов
        translations: data.translations ? {
          upsert: Object.entries(data.translations)
            .filter(([_, trans]) => trans)
            .map(([lang, trans]) => ({
              where: {
                objectId_languageCode: {
                  objectId: id,
                  languageCode: lang,
                },
              },
              create: {
                languageCode: lang,
                name: trans!.name,
                address: trans!.address,
                isPublished: trans!.isPublished ?? false,
              },
              update: {
                name: trans!.name,
                address: trans!.address,
                isPublished: trans!.isPublished ?? false,
              },
            })),
        } : undefined,
        // Обновление телефонов
        phones: data.phones !== undefined ? {
          deleteMany: {},
          create: data.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type || 'MAIN',
            order: index,
          })),
        } : undefined,
        // Обновление приоритетных направлений
        priorityDirections: data.priorityDirectionIds !== undefined ? {
          deleteMany: {},
          create: data.priorityDirectionIds.map(dirId => ({
            priorityDirectionId: dirId,
          })),
        } : undefined,
        // Обновление организаций
        organizations: data.organizations !== undefined ? {
          deleteMany: {},
          create: data.organizations,
        } : undefined,
      },
      include: {
        infrastructureType: {
          include: {
            translations: true,
          },
        },
        region: {
          include: {
            translations: true,
          },
        },
        translations: true,
        phones: true,
        priorityDirections: {
          include: {
            priorityDirection: true,
          },
        },
        organizations: true,
      },
    });

    return this.formatObject(updatedObject, 'ru');
  }

  // Удаление объекта
  static async deleteObject(id: number): Promise<void> {
    const object = await prisma.object.findUnique({
      where: { id },
    });

    if (!object) {
      throw new AppError('Объект не найден', 404, 'OBJECT_NOT_FOUND');
    }

    await prisma.object.delete({
      where: { id },
    });
  }

  // Форматирование объекта для ответа
  private static formatObject(object: any, lang: LanguageCode): ObjectWithRelations {
    // Находим перевод для текущего языка
    const translation = object.translations.find(
      (t: any) => t.languageCode === lang
    ) || object.translations[0]; // Fallback на первый доступный

    // Форматируем данные
    return {
      id: object.id,
      latitude: object.latitude,
      longitude: object.longitude,
      googleMapsUrl: object.googleMapsUrl,
      website: object.website,
      logoUrl: object.logoUrl,
      imageUrl: object.imageUrl,
      geocodingStatus: object.geocodingStatus,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
      infrastructureType: {
        id: object.infrastructureType.id,
        icon: object.infrastructureType.icon,
        color: object.infrastructureType.color,
        name: object.infrastructureType.translations[0]?.name,
      },
      region: {
        id: object.region.id,
        code: object.region.code,
        name: object.region.translations[0]?.name,
      },
      translations: object.translations,
      phones: object.phones,
      priorityDirections: object.priorityDirections.map((pd: any) => ({
        id: pd.priorityDirection.id,
        name: pd.priorityDirection.name,
      })),
      organizations: object.organizations,
      // Добавляем поля из текущего перевода для удобства
      ...(translation && {
        name: translation.name,
        address: translation.address,
        isPublished: translation.isPublished,
      }),
    };
  }
}
