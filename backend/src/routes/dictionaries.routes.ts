// backend/src/routes/dictionaries.routes.ts

import { Router } from 'express';
import { dictionariesController } from '../controllers/dictionariesController';

const router = Router();

// Все маршруты справочников публичные (используются на фронтенде)
router.get('/infrastructure-types', dictionariesController.getInfrastructureTypes.bind(dictionariesController));
router.get('/regions', dictionariesController.getRegions.bind(dictionariesController));
router.get('/priority-directions', dictionariesController.getPriorityDirections.bind(dictionariesController));
router.get('/search', dictionariesController.searchDictionaries.bind(dictionariesController));

export default router;