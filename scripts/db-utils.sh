case "$1" in
  "reset")
    echo "🔄 Сброс базы данных..."
    npx prisma migrate reset --force
    ;;
  "seed")
    echo "🌱 Заполнение базы данных..."
    npm run db:seed
    ;;
  "studio")
    echo "🎨 Открытие Prisma Studio..."
    npm run db:studio
    ;;
  "backup")
    echo "💾 Создание резервной копии..."
    pg_dump -U postgres digital_atlas > ../backups/digital_atlas_$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Резервная копия создана"
    ;;
  *)
    echo "Использование: $0 {reset|seed|studio|backup}"
    exit 1
    ;;
esac
