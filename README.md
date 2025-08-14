# Formula Private Bot - LAVA TOP API v2

Telegram бот для продажи доступа к закрытому каналу через LAVA TOP API v2.

## 🚀 Быстрый старт

### 1. Настройка переменных окружения

Создайте файл `.env` на основе `env.example`:

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
PUBLIC_BASE_URL=https://your-app.up.railway.app
PRIVATE_CHANNEL_ID=-1001234567890
ADMIN_IDS=123,456

# LAVA TOP (seller API)
LAVA_TOP_API_BASE=https://gate.lava.top
LAVA_TOP_API_KEY=your_api_key_from_app.lava.top
LAVA_OFFER_ID_BASIC=your_basic_offer_id
LAVA_OFFER_ID_PRO=your_pro_offer_id
LAVA_OFFER_ID_VIP=your_vip_offer_id
LAVA_TOP_WEBHOOK_SECRET=your_webhook_secret

# MiniApp
PAYMENT_MINIAPP_URL=https://your-host/payment.html
```

### 2. Установка зависимостей

**Создание виртуального окружения (рекомендуется):**
```bash
python3 -m venv venv
source venv/bin/activate  # На macOS/Linux
# или
venv\Scripts\activate     # На Windows
```

**Установка зависимостей:**
```bash
pip install -r requirements.txt
```

**Примечание:** Если у вас возникают проблемы с импортом `flask_cors`, убедитесь что вы используете виртуальное окружение и все зависимости установлены корректно.

### 3. Запуск

**Активируйте виртуальное окружение (если используете):**
```bash
source venv/bin/activate  # На macOS/Linux
# или
venv\Scripts\activate     # На Windows
```

**Для продакшена (webhook):**
```bash
python bot_webhook_app.py
```

**Для локальной разработки (polling):**
```bash
python bot.py
```

## 📋 Тест-план

### 1. Проверка health endpoint
```bash
curl https://your-app.up.railway.app/health
```
Ожидаемый ответ: `{"status":"ok"}`

### 2. Настройка Telegram webhook
```bash
curl -X POST https://your-app.up.railway.app/reset-webhook
curl https://your-app.up.railway.app/webhook-info
```

### 3. Тест создания инвойса через API
```bash
curl -X POST https://your-app.up.railway.app/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "chat_id": 123,
    "email": "test@example.com",
    "tariff": "basic",
    "price": 50,
    "bank": "russian"
  }'
```

Ожидаемый ответ: `{"ok": true, "payment_url": "https://..."}`

### 4. Тест MiniApp
1. Откройте Telegram MiniApp
2. Заполните форму оплаты
3. Нажмите "Оплатить"
4. В чате бота должна появиться кнопка со ссылкой оплаты

### 5. Настройка вебхука LAVA
В кабинете app.lava.top установите URL вебхука:
```
https://your-app.up.railway.app/lava-webhook
```

### 6. Тест вебхука LAVA
```bash
curl -X POST https://your-app.up.railway.app/lava-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "payment.success",
    "data": {
      "metadata": {
        "user_id": "123",
        "chat_id": "123"
      }
    }
  }'
```

После успешной оплаты бот должен отправить пригласительную ссылку пользователю.

## 🔧 Архитектура

### Основные компоненты:

1. **bot_webhook.py** - основной сервис для продакшена
   - Flask + python-telegram-bot v22
   - Webhook для Telegram
   - API эндпоинты для MiniApp
   - Обработка вебхуков LAVA

2. **bot.py** - локальная версия для разработки
   - Polling режим
   - Те же хендлеры что и в webhook версии

3. **payment.html** - MiniApp для оплаты
   - Поддержка двух сценариев:
     - Telegram.WebApp.sendData() → бот
     - Прямой API вызов при ?api=URL

### Поток оплаты:

1. **MiniApp** → отправляет данные в бота
2. **Бот** → создает инвойс через LAVA TOP API v2
3. **LAVA** → возвращает ссылку оплаты
4. **Пользователь** → оплачивает через ссылку
5. **LAVA** → отправляет вебхук на успешную оплату
6. **Бот** → создает пригласительную ссылку и отправляет пользователю

## 🔑 LAVA TOP API v2

### Создание инвойса:
```python
POST https://gate.lava.top/api/v2/invoice
Headers:
  X-Api-Key: your_api_key
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "offerId": "your_offer_id",
  "currency": "RUB",
  "paymentMethod": "BANK131",
  "buyerLanguage": "RU",
  "metadata": {
    "user_id": "123",
    "chat_id": "123"
  }
}
```

### Методы оплаты:
- **RUB** → `BANK131` (российские карты)
- **USD/EUR** → `UNLIMINT`, `PAYPAL`, `STRIPE`

## 🛠️ Разработка

### Локальный запуск:
```bash
# Установите переменные окружения
export TELEGRAM_BOT_TOKEN="your_token"
export LAVA_TOP_API_KEY="your_key"
# ... остальные переменные

# Запустите локальную версию
python bot.py
```

### Тестирование:
```bash
python test_new_system.py
```

## 📝 Логи

Бот выводит подробные логи:
- Создание инвойсов
- Обработка вебхуков
- Ошибки API
- Действия пользователей

## 🔒 Безопасность

- Все ключи через переменные окружения
- Проверка подписи вебхуков (опционально)
- Валидация входных данных
- Одноразовые пригласительные ссылки

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи бота
2. Убедитесь в корректности переменных окружения
3. Проверьте настройки в кабинете app.lava.top
4. Запустите тесты: `python test_new_system.py`

