import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const directions = await prisma.priorityDirection.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: directions,
    });
  } catch (error) {
    console.error('Error fetching priority directions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch priority directions',
      },
      { status: 500 }
    );
  }
}