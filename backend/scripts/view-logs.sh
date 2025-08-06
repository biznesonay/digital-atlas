#!/bin/bash

LOG_DIR="../logs"

echo "📋 Доступные логи:"
echo "1. Все ошибки (error)"
echo "2. Все логи (combined)"
echo "3. Логи импорта (import)"
echo "4. Последние ошибки"
echo "5. Поиск по логам"

read -p "Выберите опцию (1-5): " choice

case $choice in
  1)
    echo "🔴 Последние ошибки:"
    tail -n 50 $LOG_DIR/error-*.log
    ;;
  2)
    echo "📝 Последние логи:"
    tail -n 50 $LOG_DIR/combined-*.log
    ;;
  3)
    echo "📥 Логи импорта:"
    tail -n 50 $LOG_DIR/import-*.log
    ;;
  4)
    echo "⚠️ Последние 20 ошибок:"
    grep -h "ERROR" $LOG_DIR/combined-*.log | tail -n 20
    ;;
  5)
    read -p "Введите текст для поиска: " search_text
    echo "🔍 Результаты поиска:"
    grep -h "$search_text" $LOG_DIR/*.log | tail -n 50
    ;;
  *)
    echo "Неверная опция"
    ;;
esac
