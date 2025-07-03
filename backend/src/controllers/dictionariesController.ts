// backend/src/controllers/dictionariesController.ts

import { Request, Response, NextFunction } from 'express';
import { dictionariesService } from '../services/dictionariesService';

export class DictionariesController {
  // Получить типы инфраструктуры
  async getInfrastructureTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = (req.query.lang as string) || 'ru';
      const includeInactive = req.query.includeInactive === 'true';
      
      const types = await dictionariesService.getInfrastructureTypes(lang, includeInactive);
      
      res.json({
        success: true,
        data: types
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Получить регионы
  async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = (req.query.lang as string) || 'ru';
      
      const regions = await dictionariesService.getRegions(lang);
      
      res.json({
        success: true,
        data: regions
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Получить приоритетные направления
  async getPriorityDirections(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      
      const directions = await dictionariesService.getPriorityDirections(includeInactive);
      
      res.json({
        success: true,
        data: directions
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Поиск по всем справочникам
  async searchDictionaries(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const lang = (req.query.lang as string) || 'ru';
      
      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: {
            infrastructureTypes: [],
            regions: [],
            priorityDirections: []
          }
        });
      }
      
      const results = await dictionariesService.searchDictionaries(query, lang);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dictionariesController = new DictionariesController();