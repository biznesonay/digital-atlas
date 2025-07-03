// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

// Публичные маршруты
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Защищенные маршруты
router.get('/me', authMiddleware, authController.getMe);

export default router;