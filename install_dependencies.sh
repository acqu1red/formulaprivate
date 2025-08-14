#!/bin/bash

echo "🔧 Установка зависимостей для APP LAVA TOP"
echo "=========================================="

# Создаем виртуальное окружение, если его нет
if [ ! -d "venv" ]; then
    echo "📦 Создаем виртуальное окружение..."
    python3 -m venv venv
fi

# Активируем виртуальное окружение
echo "🔌 Активируем виртуальное окружение..."
source venv/bin/activate

# Обновляем pip
echo "⬆️ Обновляем pip..."
pip install --upgrade pip

# Устанавливаем зависимости
echo "📥 Устанавливаем зависимости..."
pip install -r requirements.txt

# Проверяем установку flask-cors
echo "🔍 Проверяем установку Flask-CORS..."
python3 -c "import flask_cors; print('✅ Flask-CORS установлен успешно')" 2>/dev/null || {
    echo "❌ Проблема с Flask-CORS, устанавливаем вручную..."
    pip install Flask-CORS==4.0.0
}

# Проверяем все импорты
echo "🔍 Проверяем импорты..."
python3 -c "
import flask
import flask_cors
import telegram
import requests
import json
import logging
import os
print('✅ Все основные модули импортируются успешно')
"

echo ""
echo "✅ Установка завершена!"
echo "🚀 Для запуска используйте:"
echo "   source venv/bin/activate"
echo "   python bot_webhook_app.py"
echo ""
echo "🔧 Если есть проблемы с flask_cors, используйте:"
echo "   python bot_webhook_app_no_cors.py"
