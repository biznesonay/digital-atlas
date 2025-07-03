import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Digital Atlas API'
  });
});

// API версия
router.get('/version', (req, res) => {
  res.json({ 
    version: '1.0.0',
    lastDataUpdate: new Date().toISOString()
  });
});

// Подключаем маршруты по мере их создания
try {
  const authRoutes = require('./auth.routes').default;
  router.use('/auth', authRoutes);
} catch (e) {
  console.log('Auth routes not found');
}

try {
  const objectsRoutes = require('./objects.routes').default;
  router.use('/objects', objectsRoutes);
} catch (e) {
  console.log('Objects routes not found');
}

try {
  const dictionariesRoutes = require('./dictionaries.routes').default;
  router.use('/dictionaries', dictionariesRoutes);
} catch (e) {
  console.log('Dictionaries routes not found');
}

// 404 для несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
});

export default router;