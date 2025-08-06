import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { AppError } from './error-handler';

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Фильтр файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Разрешаем только Excel файлы
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
  ];
  
  const allowedExtensions = ['.xls', '.xlsx', '.ods'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Разрешены только Excel файлы (.xls, .xlsx)', 400, 'INVALID_FILE_TYPE'));
  }
};

// Создаем multer instance
export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware для обработки ошибок загрузки
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Файл слишком большой. Максимальный размер: 10MB', 400, 'FILE_TOO_LARGE'));
    }
    return next(new AppError(error.message, 400, 'UPLOAD_ERROR'));
  }
  next(error);
};
