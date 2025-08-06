import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadExcel, handleUploadError } from '../middleware/upload';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'EDITOR'));

// Импорт из Excel
router.post(
  '/excel',
  uploadExcel.single('file'),
  handleUploadError,
  ImportController.importFromExcel
);

// Скачать шаблон
router.get('/template', ImportController.downloadTemplate);

// История импорта
router.get('/history', ImportController.getImportHistory);

// Детали импорта
router.get('/history/:id', ImportController.getImportDetails);

export default router;
