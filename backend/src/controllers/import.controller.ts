import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ImportService } from '../services/import.service';
import { ApiResponseUtil } from '../utils/api-response';
import { prisma } from '../config/database';
import fs from 'fs';
import path from 'path';

export class ImportController {
  // Импорт из Excel
  static async importFromExcel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        return ApiResponseUtil.error(
          res,
          'FILE_REQUIRED',
          'Файл не был загружен',
          400
        );
      }

      const result = await ImportService.importFromExcel(
        req.file.path,
        req.userId!
      );

      ApiResponseUtil.success(res, result, 'Импорт завершен');
    } catch (error) {
      // Удаляем файл в случае ошибки
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // Скачать шаблон
  static async downloadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templatePath = await ImportService.generateTemplate();
      
      res.download(templatePath, 'import-template.xlsx', (err) => {
        // Удаляем временный файл после отправки
        fs.unlinkSync(templatePath);
        
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // История импорта
  static async getImportHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [history, total] = await prisma.$transaction([
        prisma.importHistory.findMany({
          where: req.user?.role === 'SUPER_ADMIN' ? {} : { userId: req.userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.importHistory.count({
          where: req.user?.role === 'SUPER_ADMIN' ? {} : { userId: req.userId },
        }),
      ]);

      ApiResponseUtil.paginated(
        res,
        history,
        Number(page),
        Number(limit),
        total
      );
    } catch (error) {
      next(error);
    }
  }

  // Детали импорта
  static async getImportDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const importRecord = await prisma.importHistory.findUnique({
        where: { id: Number(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!importRecord) {
        return ApiResponseUtil.error(
          res,
          'NOT_FOUND',
          'Запись импорта не найдена',
          404
        );
      }

      // Проверяем права доступа
      if (req.user?.role !== 'SUPER_ADMIN' && importRecord.userId !== req.userId) {
        return ApiResponseUtil.error(
          res,
          'FORBIDDEN',
          'Нет доступа к этой записи',
          403
        );
      }

      ApiResponseUtil.success(res, importRecord);
    } catch (error) {
      next(error);
    }
  }
}
