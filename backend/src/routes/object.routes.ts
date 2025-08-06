import { Router } from 'express';
import { ObjectController } from '../controllers/object.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { objectValidators } from '../validators/object.validator';

const router = Router();

// Публичные маршруты
router.get(
  '/',
  validate(objectValidators.filters),
  ObjectController.getObjects
);

router.get(
  '/:id',
  ObjectController.getObjectById
);

// Защищенные маршруты (только для админов)
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'EDITOR'),
  validate(objectValidators.create),
  ObjectController.createObject
);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'EDITOR'),
  validate(objectValidators.update),
  ObjectController.updateObject
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'EDITOR'),
  ObjectController.deleteObject
);

router.get(
  '/stats/summary',
  authenticate,
  authorize('SUPER_ADMIN', 'EDITOR'),
  ObjectController.getObjectsStats
);

export default router;
