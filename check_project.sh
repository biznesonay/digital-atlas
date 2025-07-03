#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 ПРОВЕРКА СОСТОЯНИЯ ПРОЕКТА DIGITAL ATLAS${NC}"
echo "Время проверки: $(date '+%Y-%m-%d %H:%M:%S')"

# Проверяем текущую директорию
echo -e "\n${BLUE}=== ТЕКУЩАЯ ДИРЕКТОРИЯ ===${NC}"
echo "Текущая папка: $(pwd)"
echo "Содержимое:"
ls -la

# Проверяем основную структуру
echo -e "\n${BLUE}=== ОСНОВНАЯ СТРУКТУРА ===${NC}"
for item in "frontend" "backend" "package.json" ".gitignore"; do
    if [ -e "$item" ]; then
        echo -e "${GREEN}✓${NC} $item найден"
    else
        echo -e "${RED}✗${NC} $item НЕ найден"
    fi
done

# Проверяем Frontend
echo -e "\n${BLUE}=== FRONTEND ===${NC}"
if [ -d "frontend" ]; then
    echo -e "${GREEN}✓${NC} Frontend папка найдена"
    ls -la frontend/
    echo -e "\n${YELLOW}Frontend package.json:${NC}"
    cat frontend/package.json 2>/dev/null || echo "package.json не найден"
else
    echo -e "${RED}✗${NC} Frontend папка НЕ найдена"
fi

# Проверяем Backend
echo -e "\n${BLUE}=== BACKEND ===${NC}"
if [ -d "backend" ]; then
    echo -e "${GREEN}✓${NC} Backend папка найдена"
    ls -la backend/
    echo -e "\n${YELLOW}Backend package.json:${NC}"
    cat backend/package.json 2>/dev/null || echo "package.json не найден"
    
    echo -e "\n${YELLOW}Backend src структура:${NC}"
    ls -la backend/src/ 2>/dev/null || echo "src папка не найдена"
else
    echo -e "${RED}✗${NC} Backend папка НЕ найдена"
fi

# Проверяем Prisma
echo -e "\n${BLUE}=== PRISMA ===${NC}"
if [ -d "backend/prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma папка найдена"
    ls -la backend/prisma/
    echo -e "\n${YELLOW}Prisma schema.prisma:${NC}"
    cat backend/prisma/schema.prisma 2>/dev/null || echo "schema.prisma не найден"
else
    echo -e "${RED}✗${NC} Prisma папка НЕ найдена"
fi

# Проверяем .env файлы (без секретов)
echo -e "\n${BLUE}=== ENV FILES ===${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env найден"
    echo "Переменные (значения скрыты):"
    cat backend/.env | sed 's/=.*/=***/' | grep -v '^#' | grep -v '^$'
else
    echo -e "${RED}✗${NC} Backend .env НЕ найден"
fi

# Проверяем PostgreSQL
echo -e "\n${BLUE}=== POSTGRESQL ===${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} psql найден"
    if pg_isready -q 2>/dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL запущен"
    else
        echo -e "${RED}✗${NC} PostgreSQL НЕ запущен"
    fi
else
    echo -e "${RED}✗${NC} psql не найден"
fi

echo -e "\n${BLUE}=== ПРОВЕРКА ЗАВЕРШЕНА ===${NC}"
