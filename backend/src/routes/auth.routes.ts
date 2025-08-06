import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authValidators } from '../validators/auth.validator';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

// Публичные маршруты
router.post(
  '/login',
  authLimiter,
  validate(authValidators.login),
  AuthController.login
);

router.post(
  '/refresh',
  validate(authValidators.refreshToken),
  AuthController.refresh
);

router.post(
  '/password-reset',
  authLimiter,
  validate(authValidators.resetPasswordRequest),
  AuthController.requestPasswordReset
);

router.post(
  '/password-reset/confirm',
  authLimiter,
  validate(authValidators.resetPassword),
  AuthController.resetPassword
);

// Защищенные маршруты
router.post('/logout', optionalAuth, AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
