# Digital Atlas - Цифровой атлас инновационной инфраструктуры

## Описание проекта
Интерактивный веб-сайт для визуализации и управления объектами инновационной инфраструктуры Казахстана.

## Технологический стек
- **Frontend**: Next.js 14, TypeScript, Material-UI, Google Maps
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **State Management**: Redux Toolkit

## Требования
- Node.js 20.x LTS
- npm 10.x
- PostgreSQL 14+

## Установка
```bash
# Клонирование репозитория
git clone [repository-url]
cd digital-atlas

# Установка зависимостей
npm run install:all

# Настройка базы данных
cd backend
npx prisma migrate dev
npm run db:seed

# Запуск в режиме разработки
cd ..
npm run dev