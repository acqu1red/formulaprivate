# 🤖 Telegram Bot с Webhook Уведомлениями

Telegram бот с интеграцией веб-приложения и системой уведомлений администраторов о новых запросах.

## 🚀 Быстрый запуск

1. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

2. **Запустите бота:**
```bash
python bot.py
```

Бот автоматически запустит:
- Telegram бота с polling
- Webhook API сервер на порту 5000

## 📱 Функциональность

### Для пользователей:
- Команда `/start` - главное меню с кнопками
- Веб-приложение для отправки вопросов
- Получение ответов от администраторов

### Для администраторов:
- Уведомления о новых сообщениях в Telegram
- Уведомления о новых запросах через веб-приложение
- Команда `/messages` - просмотр всех диалогов
- Команда `/test_web` - тестирование webhook уведомлений
- Возможность ответа пользователям через кнопки

## 🌐 Webhook API

### Endpoints:
- `POST /webhook/notify_admins` - уведомления о новых запросах
- `GET /health` - проверка здоровья сервера

### Формат данных webhook:
```json
{
    "user_id": 123456789,
    "message_content": "Текст сообщения",
    "conversation_id": 1
}
```

## 🔧 Конфигурация

### Администраторы
Настройте в `bot.py`:
```python
ADMIN_USERNAMES = ["username1", "username2"]
ADMIN_IDS = [123456789, 987654321]
```

### База данных
Supabase конфигурация в `bot.py`:
```python
SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_key"
```

## 📊 Структура проекта

```
├── bot.py              # Основной файл бота с webhook API
├── requirements.txt    # Зависимости Python
├── docs/              # Веб-приложение
│   ├── index.html
│   ├── script.js      # Интеграция с webhook API
│   └── config.js
└── README.md          # Эта документация
```

## 🧪 Тестирование

### Тест webhook уведомлений:
```bash
curl -X POST http://localhost:5000/webhook/notify_admins \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789, "message_content": "Тест", "conversation_id": 1}'
```

### Проверка здоровья API:
```bash
curl http://localhost:5000/health
```

## 🔄 Интеграция с веб-приложением

Веб-приложение автоматически отправляет уведомления при каждом новом сообщении пользователя через webhook API.

## 📝 Логи

Все логи выводятся в консоль:
- Telegram бот события
- Webhook API запросы
- Ошибки и уведомления

## 🛑 Остановка

Нажмите `Ctrl+C` в терминале для остановки всех сервисов.
