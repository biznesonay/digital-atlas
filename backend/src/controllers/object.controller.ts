import { Request, Response, NextFunction } from 'express';
import { AuthRequest, LanguageCode } from '../types';
import { ObjectService } from '../services/object.service';
import { ApiResponseUtil } from '../utils/api-response';

export class ObjectController {
  // Получение списка объектов
  static async getObjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        infrastructureTypeIds,
        priorityDirectionIds,
        regionId,
        isPublished,
        geocodingStatus,
        hasCoordinates,
        page = 1,
        limit = 20,
        lang = 'ru',
      } = req.query;

      // Преобразование query параметров
      const filters = {
        search: search as string,
        infrastructureTypeIds: infrastructureTypeIds 
          ? (typeof infrastructureTypeIds === 'string' 
              ? infrastructureTypeIds.split(',').map(Number) 
              : infrastructureTypeIds as number[])
          : undefined,
        priorityDirectionIds: priorityDirectionIds
          ? (typeof priorityDirectionIds === 'string'
              ? priorityDirectionIds.split(',').map(Number)
              : priorityDirectionIds as number[])
          : undefined,
        regionId: regionId ? Number(regionId) : undefined,
        isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
        geocodingStatus: geocodingStatus as string,
        hasCoordinates: hasCoordinates === 'true' ? true : hasCoordinates === 'false' ? false : undefined,
      };

      const result = await ObjectService.getObjects(
        filters,
        lang as LanguageCode,
        Number(page),
        Number(limit)
      );

      ApiResponseUtil.paginated(
        res,
        result.objects,
        result.page,
        Number(limit),
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  // Получение объекта по ID
  static async getObjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { lang = 'ru' } = req.query;

      const object = await ObjectService.getObjectById(
        Number(id),
        lang as LanguageCode
      );

      if (!object) {
        return ApiResponseUtil.error(
          res,
          'OBJECT_NOT_FOUND',
          'Объект не найден',
          404
        );
      }

      ApiResponseUtil.success(res, object);
    } catch (error) {
      next(error);
    }
  }

  // Создание объекта (только для админов)
  static async createObject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const object = await ObjectService.createObject(req.body);

      ApiResponseUtil.success(
        res,
        object,
        'Объект успешно создан',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Обновление объекта (только для админов)
  static async updateObject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const object = await ObjectService.updateObject(
        Number(id),
        req.body
      );

      ApiResponseUtil.success(
        res,
        object,
        'Объект успешно обновлен'
      );
    } catch (error) {
      next(error);
    }
  }

  // Удаление объекта (только для админов)
  static async deleteObject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await ObjectService.deleteObject(Number(id));

      ApiResponseUtil.success(
        res,
        null,
        'Объект успешно удален'
      );
    } catch (error) {
      next(error);
    }
  }

  // Получение статистики объектов (для админов)
  static async getObjectsStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await prisma.$transaction([
        prisma.object.count(),
        prisma.object.count({ where: { geocodingStatus: 'SUCCESS' } }),
        prisma.object.count({ where: { geocodingStatus: 'FAILED' } }),
        prisma.object.groupBy({
          by: ['infrastructureTypeId'],
          _count: true,
        }),
        prisma.object.groupBy({
          by: ['regionId'],
          _count: true,
        }),
      ]);

      ApiResponseUtil.success(res, {
        total: stats[0],
        withCoordinates: stats[1],
        withoutCoordinates: stats[2],
        byInfrastructureType: stats[3],
        byRegion: stats[4],
      });
    } catch (error) {
      next(error);
    }
  }
}

// Импорт prisma для статистики
import { prisma } from '../config/database';
