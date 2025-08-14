import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема валидации параметров запроса
const querySchema = z.object({
  lang: z.enum(['ru', 'kz', 'en']).default('ru'),
  types: z.array(z.coerce.number()).optional(),
  regions: z.array(z.coerce.number()).optional(),
  directions: z.array(z.coerce.number()).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Парсим параметры
    const params = {
      lang: searchParams.get('lang') || 'ru',
      types: searchParams.getAll('types[]').map(Number).filter(n => !isNaN(n)),
      regions: searchParams.getAll('regions[]').map(Number).filter(n => !isNaN(n)),
      directions: searchParams.getAll('directions[]').map(Number).filter(n => !isNaN(n)),
      search: searchParams.get('search') || undefined,
    };

    // Валидация параметров
    const validated = querySchema.parse(params);

    // Построение условий фильтрации
    const where: any = {
      translations: {
        some: {
          languageCode: validated.lang,
          isPublished: true,
          ...(validated.search && {
            OR: [
              { name: { contains: validated.search } },
              { address: { contains: validated.search } },
            ],
          }),
        },
      },
    };

    if (validated.types && validated.types.length > 0) {
      where.infrastructureTypeId = { in: validated.types };
    }

    if (validated.regions && validated.regions.length > 0) {
      where.regionId = { in: validated.regions };
    }

    if (validated.directions && validated.directions.length > 0) {
      where.priorityDirections = {
        some: {
          priorityDirectionId: { in: validated.directions },
        },
      };
    }

    // Получение объектов из БД
    const objects = await prisma.object.findMany({
      where,
      include: {
        translations: {
          where: { languageCode: validated.lang },
        },
        infrastructureType: {
          include: {
            translations: {
              where: { languageCode: validated.lang },
            },
          },
        },
        region: {
          include: {
            translations: {
              where: { languageCode: validated.lang },
            },
          },
        },
        priorityDirections: {
          include: {
            priorityDirection: true,
          },
        },
      },
    });

    // Форматирование данных для фронтенда
    const formattedObjects = objects.map(obj => ({
      id: obj.id,
      name: obj.translations[0]?.name || '',
      address: obj.translations[0]?.address || '',
      coordinates: {
        latitude: obj.latitude,
        longitude: obj.longitude,
      },
      type: {
        id: obj.infrastructureType.id,
        name: obj.infrastructureType.translations[0]?.name || '',
        icon: obj.infrastructureType.icon,
        color: obj.infrastructureType.color,
      },
      region: {
        id: obj.region.id,
        name: obj.region.translations[0]?.name || '',
      },
      priorityDirections: obj.priorityDirections.map(pd => ({
        id: pd.priorityDirection.id,
        name: pd.priorityDirection.name,
      })),
      website: obj.website,
      contactPhones: obj.contactPhones,
      logoUrl: obj.logoUrl,
      imageUrl: obj.imageUrl,
    }));

    return NextResponse.json({
      success: true,
      data: formattedObjects,
    });
  } catch (error) {
    console.error('Error fetching objects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch objects',
      },
      { status: 500 }
    );
  }
}