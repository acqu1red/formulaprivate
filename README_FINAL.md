# 🤖 Telegram Bot с LAVA TOP Seller API

Telegram бот для приема платежей через LAVA TOP Seller API с интеграцией Supabase.

## 🚀 Быстрый старт

### 1. Настройка базы данных Supabase

Выполните в Supabase SQL Editor:

```sql
-- Создание таблицы bot_users
CREATE TABLE IF NOT EXISTS bot_users (
    id SERIAL PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_bot_users_email ON bot_users(email);
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram_id ON bot_users(telegram_id);
```

Или используйте готовый файл: `create_bot_users_table.sql`

### 2. Настройка Railway Variables

#### Обязательные переменные:
```bash
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
LAVA_TOP_API_KEY=<ваш-ключ-из-app.lava.top>
PRIVATE_CHANNEL_ID=<ID-вашего-канала>
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```

#### Опциональные переменные:
```bash
LAVA_TOP_API_BASE=https://gate.lava.top
ADMIN_IDS=708907063,7365307696
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
```

### 3. Деплой в Railway

1. Подключите GitHub репозиторий к Railway
2. Установите переменные окружения
3. Railway автоматически использует `Procfile`

### 4. Настройка webhook LAVA

В кабинете [app.lava.top](https://app.lava.top):
- URL: `https://<your-app>.up.railway.app/lava-webhook`
- Метод: POST

## 📁 Структура проекта

### Основные файлы:
- `bot_webhook.py` - основной файл бота
- `payment.html` - MiniApp для оплаты
- `docs/payment.html` - дубликат MiniApp

### SQL файлы:
- `create_bot_users_table.sql` - создание таблицы bot_users
- `complete_fix.sql` - завершение настройки
- `simple_fix.sql` - простое исправление
- `fix_users_table.sql` - исправление таблицы
- `check_table.sql` - диагностика
- `recreate_table.sql` - пересоздание

### Конфигурация:
- `requirements.txt` - Python зависимости
- `Procfile` - для Railway
- `env.example` - пример переменных
- `SETUP_INSTRUCTIONS.md` - подробные инструкции

## 🔄 Рабочий процесс

1. **Пользователь** открывает MiniApp в боте
2. **Заполняет** email и выбирает тариф
3. **Нажимает** "Оплатить" → данные отправляются в бота
4. **Бот** сохраняет пользователя в базу и создает инвойс через LAVA TOP
5. **Пользователь** получает ссылку на оплату
6. **После оплаты** LAVA отправляет webhook
7. **Бот** ищет пользователя по email и отправляет инвайт-ссылку

## 🧪 Тестирование

### Проверка webhook:
```bash
GET https://<your-app>.up.railway.app/webhook-info
```

### Сброс webhook:
```bash
POST https://<your-app>.up.railway.app/reset-webhook
```

### Тест бота:
```bash
GET https://<your-app>.up.railway.app/test
```

## 🐛 Отладка

### Логи в Railway:
Проверяйте логи в Railway Dashboard

### Проверка переменных:
```bash
GET https://<your-app>.up.railway.app/test
```

### Проверка базы данных:
```sql
SELECT * FROM bot_users ORDER BY created_at DESC LIMIT 10;
```

## 📋 API Endpoints

- `GET /health` - проверка здоровья
- `GET /test` - тест бота
- `GET /webhook-info` - информация о webhook
- `POST /reset-webhook` - сброс webhook
- `POST /webhook` - Telegram webhook
- `POST /api/create-payment` - создание платежа
- `POST /lava-webhook` - LAVA webhook

## 🔧 Технические детали

### LAVA TOP Seller API:
- Endpoint: `POST https://gate.lava.top/api/v2/invoice`
- Headers: `X-Api-Key: <your-key>`
- Offer ID: `302ecdcd-1581-45ad-8353-a168f347b8cc`

### База данных:
- Таблица: `bot_users`
- Колонки: `id`, `telegram_id`, `email`, `created_at`, `updated_at`

### MiniApp:
- URL: `https://acqu1red.github.io/formulaprivate/`
- Данные отправляются через `Telegram.WebApp.sendData()`

## ✅ Готово!

После настройки всех компонентов бот будет полностью функционален и готов к продакшену.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Railway
2. Убедитесь, что все переменные установлены
3. Проверьте структуру таблицы `bot_users`
4. Убедитесь, что webhook LAVA настроен правильно
