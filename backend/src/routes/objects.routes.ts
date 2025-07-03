// backend/src/routes/objects.routes.ts

import { Router } from 'express';
import { objectsController } from '../controllers/objectsController';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/roleCheck';

const router = Router();

// Публичные маршруты (не требуют авторизации)
router.get('/', objectsController.getObjects.bind(objectsController));
router.get('/:id', objectsController.getObjectById.bind(objectsController));

// Защищенные маршруты (требуют авторизации)
router.use(authMiddleware); // Все маршруты ниже требуют авторизации

// Создание объекта (EDITOR и SUPER_ADMIN)
router.post('/', 
  checkRole(['EDITOR', 'SUPER_ADMIN']), 
  objectsController.createObject.bind(objectsController)
);

// Обновление объекта (EDITOR и SUPER_ADMIN)
router.put('/:id', 
  checkRole(['EDITOR', 'SUPER_ADMIN']), 
  objectsController.updateObject.bind(objectsController)
);

// Удаление объекта (EDITOR и SUPER_ADMIN)
router.delete('/:id', 
  checkRole(['EDITOR', 'SUPER_ADMIN']), 
  objectsController.deleteObject.bind(objectsController)
);

// Массовые операции (EDITOR и SUPER_ADMIN)
router.post('/bulk', 
  checkRole(['EDITOR', 'SUPER_ADMIN']), 
  objectsController.bulkOperation.bind(objectsController)
);

export default router;