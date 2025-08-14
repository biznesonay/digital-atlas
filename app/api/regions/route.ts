import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'ru';

    const regions = await prisma.region.findMany({
      include: {
        translations: {
          where: { languageCode: lang },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedRegions = regions.map(region => ({
      id: region.id,
      name: region.translations[0]?.name || '',
    }));

    return NextResponse.json({
      success: true,
      data: formattedRegions,
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch regions',
      },
      { status: 500 }
    );
  }
}