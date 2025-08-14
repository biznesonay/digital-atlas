import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'ru';

    const types = await prisma.infrastructureType.findMany({
      include: {
        translations: {
          where: { languageCode: lang },
        },
      },
    });

    const formattedTypes = types.map(type => ({
      id: type.id,
      name: type.translations[0]?.name || '',
      icon: type.icon,
      color: type.color,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTypes,
    });
  } catch (error) {
    console.error('Error fetching infrastructure types:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch infrastructure types',
      },
      { status: 500 }
    );
  }
}