// Цвета для маркеров карты
export const MARKER_COLORS = {
  1: '#1976D2', // СЭЗ
  2: '#388E3C', // Технопарк
  3: '#7B1FA2', // Бизнес-инкубатор
  4: '#F57C00', // IT-хаб
  5: '#D32F2F', // Венчурный фонд
} as const;

// Размеры маркеров
export const MARKER_SIZES = {
  default: 36,
  hover: 40,
  selected: 44,
} as const;

// Основные цвета приложения
export const APP_COLORS = {
  header: '#1c296a',
  primary: '#1976D2',
  secondary: '#388E3C',
  background: '#F5F5F5',
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  white: '#FFFFFF',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
} as const;