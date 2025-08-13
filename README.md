# 🤖 Formula Private Bot

Telegram бот для управления подписками на закрытый канал с интеграцией Lava Top для платежей.

## 🚀 Возможности

- ✅ **Mini Apps интеграция** - сбор данных через Telegram Web Apps
- ✅ **Lava Top платежи** - безопасная оплата через Lava Top
- ✅ **Автоматические уведомления** - мгновенные уведомления о платежах
- ✅ **Webhook обработка** - автоматическая обработка платежей
- ✅ **База данных** - хранение подписок в Supabase
- ✅ **Админ панель** - управление пользователями и подписками

## 📋 Структура проекта

```
├── bot_webhook.py          # Основной файл бота
├── requirements.txt        # Зависимости Python
├── Procfile               # Конфигурация для Railway
├── railway.toml           # Конфигурация Railway
├── index.html             # Mini Apps интерфейс
├── payment.html           # Страница оплаты
└── docs/                  # Документация
```

## 🔧 Установка и настройка

### 1. Переменные окружения

Создайте файл `.env` или настройте переменные в Railway:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c

# Lava Top
LAVA_SHOP_ID=1b9f3e05-86aa-4102-9648-268f0f586bb1
LAVA_SECRET_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_PRODUCT_ID=302ecdcd-1581-45ad-8353-a168f347b8cc
LAVA_WEBHOOK_SECRET=LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z

# Supabase (опционально)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Администраторы
ADMIN_IDS=708907063,7365307696
```

### 2. Развертывание на Railway

1. Подключите GitHub репозиторий к Railway
2. Настройте переменные окружения
3. Railway автоматически развернет приложение

### 3. Настройка webhook

Бот автоматически настроит webhook при запуске:
- Telegram webhook: `https://your-domain.railway.app/webhook`
- Lava Top webhook: `https://your-domain.railway.app/lava-webhook`

## 🎯 Как это работает

### 1. Пользователь запускает бота
```
/start → Приветственное сообщение с кнопкой "💳 Оплатить подписку"
```

### 2. Открывается Mini Apps
```
Кнопка "💳 Оплатить подписку" → Открывается payment.html
```

### 3. Пользователь заполняет форму
```
Email: user@example.com
Тариф: 1_month
Цена: 50₽
```

### 4. Данные отправляются в бота
```
Mini Apps → webhook → process_payment_data() → create_lava_invoice()
```

### 5. Создается ссылка на оплату
```
https://app.lava.top/ru/products/{shop_id}/{product_id}?currency=RUB&amount=5000&order_id=order_123_1234567890&metadata={...}
```

### 6. Пользователь оплачивает
```
Lava Top → Успешная оплата → webhook → Уведомление пользователю
```

## 🔗 API Endpoints

### `/webhook` - Telegram webhook
Обрабатывает обновления от Telegram Bot API

### `/api/create-payment` - Создание платежа
```json
POST /api/create-payment
{
  "user_id": "123456789",
  "email": "user@example.com",
  "tariff": "1_month",
  "price": 50.0
}
```

### `/lava-webhook` - Lava Top webhook
Обрабатывает уведомления о платежах от Lava Top

## 📱 Mini Apps

### index.html
Главная страница Mini Apps с информацией о подписке

### payment.html
Форма для сбора данных пользователя:
- Email
- Выбор тарифа
- Подтверждение цены

## 🔒 Безопасность

- ✅ Проверка API ключей для webhook
- ✅ Валидация данных от Mini Apps
- ✅ Безопасное хранение токенов
- ✅ Логирование всех операций

## 📊 Логирование

Бот ведет подробные логи всех операций:

```
🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!
📱 web_app_data объект: WebAppData(...)
📱 Получены данные от Mini Apps: {...}
🎯 ОБРАБОТКА ФИНАЛЬНЫХ ДАННЫХ!
🔧 СОЗДАНИЕ ИНВОЙСА ДЛЯ ПОЛЬЗОВАТЕЛЯ 123456789
✅ Создана прямая ссылка на оплату
✅ Сообщение с кнопкой оплаты отправлено пользователю
```

## 🛠️ Разработка

### Локальный запуск

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск бота
python bot_webhook.py
```

### Тестирование

```bash
# Тест API endpoint
curl -X POST http://localhost:8080/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{"user_id":"123","email":"test@example.com","tariff":"1_month","price":50.0}'
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте webhook URL в Lava Top
4. Убедитесь, что бот имеет права на отправку сообщений

## 🎉 Готово к использованию!

Бот полностью настроен и готов к работе. Пользователи могут:
- Открыть бота в Telegram
- Нажать "💳 Оплатить подписку"
- Заполнить форму в Mini Apps
- Оплатить через Lava Top
- Получить доступ к закрытому каналу

**Система работает автоматически!** 🚀
