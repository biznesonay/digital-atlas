// backend/src/controllers/objectsController.ts

import { Request, Response, NextFunction } from 'express';
import { ObjectsService } from '../services/objectsService';
import { 
  createObjectSchema, 
  updateObjectSchema, 
  objectFilterSchema,
  bulkOperationSchema 
} from '../utils/objectValidation';

const objectsService = new ObjectsService();

export class ObjectsController {
  // Получить все объекты с фильтрацией
  async getObjects(req: Request, res: Response, next: NextFunction) {
    try {
      // Валидация параметров фильтрации
      const { error, value } = objectFilterSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
      
      const objects = await objectsService.getObjects(value);
      
      res.json({
        success: true,
        data: objects,
        count: objects.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Получить объект по ID
  async getObjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const lang = (req.query.lang as string) || 'ru';
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID объекта'
        });
      }
      
      const object = await objectsService.getObjectById(id, lang);
      
      if (!object) {
        return res.status(404).json({
          success: false,
          error: 'Объект не найден'
        });
      }
      
      res.json({
        success: true,
        data: object
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Создать новый объект
  async createObject(req: Request, res: Response, next: NextFunction) {
    try {
      // Валидация данных
      const { error, value } = createObjectSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
      
      const object = await objectsService.createObject(value);
      
      res.status(201).json({
        success: true,
        data: object,
        message: 'Объект успешно создан'
      });
    } catch (error: any) {
      if (error.message.includes('Максимально') || error.message.includes('Хотя бы')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }
  
  // Обновить объект
  async updateObject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID объекта'
        });
      }
      
      // Валидация данных
      const { error, value } = updateObjectSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
      
      const object = await objectsService.updateObject(id, value);
      
      res.json({
        success: true,
        data: object,
        message: 'Объект успешно обновлен'
      });
    } catch (error: any) {
      if (error.message === 'Объект не найден') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      if (error.message.includes('Максимально')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }
  
  // Удалить объект
  async deleteObject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID объекта'
        });
      }
      
      await objectsService.deleteObject(id);
      
      res.json({
        success: true,
        message: 'Объект успешно удален'
      });
    } catch (error: any) {
      if (error.message === 'Объект не найден') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }
  
  // Массовые операции
  async bulkOperation(req: Request, res: Response, next: NextFunction) {
    try {
      // Валидация данных
      const { error, value } = bulkOperationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
      
      const { ids, action, lang } = value;
      
      switch (action) {
        case 'activate':
          const activatedCount = await objectsService.bulkUpdateStatus(ids, true, lang);
          res.json({
            success: true,
            message: `Активировано объектов: ${activatedCount}`
          });
          break;
          
        case 'deactivate':
          const deactivatedCount = await objectsService.bulkUpdateStatus(ids, false, lang);
          res.json({
            success: true,
            message: `Деактивировано объектов: ${deactivatedCount}`
          });
          break;
          
        case 'delete':
          // Удаление по одному для проверки существования
          let deletedCount = 0;
          for (const id of ids) {
            try {
              await objectsService.deleteObject(id);
              deletedCount++;
            } catch (e) {
              // Пропускаем несуществующие
            }
          }
          res.json({
            success: true,
            message: `Удалено объектов: ${deletedCount}`
          });
          break;
          
        default:
          res.status(400).json({
            success: false,
            error: 'Неизвестная операция'
          });
      }
    } catch (error) {
      next(error);
    }
  }
}

// Экспортируем экземпляр контроллера
export const objectsController = new ObjectsController();