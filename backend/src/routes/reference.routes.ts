import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiResponseUtil } from '../utils/api-response';
import { LanguageCode } from '../types';

const router = Router();

// Получение типов инфраструктуры
router.get('/infrastructure-types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lang = 'ru' } = req.query;

    const types = await prisma.infrastructureType.findMany({
      where: { isActive: true },
      include: {
        translations: {
          where: { languageCode: lang as string },
        },
      },
      orderBy: { order: 'asc' },
    });

    const formatted = types.map(type => ({
      id: type.id,
      icon: type.icon,
      color: type.color,
      name: type.translations[0]?.name || `Type ${type.id}`,
    }));

    ApiResponseUtil.success(res, formatted);
  } catch (error) {
    next(error);
  }
});

// Получение регионов
router.get('/regions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lang = 'ru' } = req.query;

    const regions = await prisma.region.findMany({
      include: {
        translations: {
          where: { languageCode: lang as string },
        },
      },
      orderBy: { code: 'asc' },
    });

    const formatted = regions.map(region => ({
      id: region.id,
      code: region.code,
      name: region.translations[0]?.name || `Region ${region.id}`,
      parentId: region.parentId,
    }));

    ApiResponseUtil.success(res, formatted);
  } catch (error) {
    next(error);
  }
});

// Получение приоритетных направлений
router.get('/priority-directions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const directions = await prisma.priorityDirection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    ApiResponseUtil.success(res, directions);
  } catch (error) {
    next(error);
  }
});

export default router;
