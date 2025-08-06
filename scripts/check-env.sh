echo "🔍 Проверка окружения разработки..."

# Проверка Node.js
NODE_VERSION=$(node -v)
echo "Node.js: $NODE_VERSION"
if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
    echo "❌ Требуется Node.js версии 20.x"
    exit 1
fi

# Проверка npm
NPM_VERSION=$(npm -v)
echo "npm: $NPM_VERSION"
if [[ ! "$NPM_VERSION" =~ ^10\. ]]; then
    echo "❌ Требуется npm версии 10.x"
    exit 1
fi

# Проверка PostgreSQL
if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version | awk '{print $3}')
    echo "PostgreSQL: $POSTGRES_VERSION"
else
    echo "⚠️  PostgreSQL не найден. Установите PostgreSQL 14+"
fi

echo "✅ Проверка окружения завершена"
