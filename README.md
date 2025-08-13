# Telegram Bot с системой оплаты Lava Top

Полнофункциональный Telegram бот с интеграцией системы оплаты Lava Top и Telegram Mini Apps.

## 🚀 Возможности

- ✅ **Telegram Mini Apps** - удобный интерфейс для ввода данных
- ✅ **Lava Top интеграция** - создание уникальных ссылок на оплату
- ✅ **Webhook система** - обработка уведомлений об оплате
- ✅ **Supabase база данных** - хранение подписок и пользователей
- ✅ **Railway деплой** - автоматическое развертывание

## 📋 Быстрый старт

### 1. Настройка переменных окружения

В Railway Dashboard добавьте следующие переменные:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
LAVA_SHOP_ID=1b9f3e05-86aa-4102-9648-268f0f586bb1
LAVA_SECRET_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_PRODUCT_ID=302ecdcd-1581-45ad-8353-a168f347b8cc
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
LAVA_WEBHOOK_SECRET=LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z
```

### 2. Настройка Lava Top

1. В настройках Lava Top установите webhook:
   - **URL**: `https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook`
   - **API Key**: `LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z`

2. Убедитесь, что Product ID правильный: `302ecdcd-1581-45ad-8353-a168f347b8cc`

### 3. Развертывание на Railway

1. Подключите GitHub репозиторий к Railway
2. Railway автоматически развернет приложение
3. Проверьте логи в Railway Dashboard

## 🎯 Как это работает

### Пользовательский поток:

1. **Пользователь** открывает бота и нажимает `/start`
2. **Бот** показывает меню с кнопкой "💳 Оплатить подписку"
3. **Пользователь** нажимает кнопку и открывается Mini Apps
4. **Mini Apps** собирает данные (email, тариф, способ оплаты)
5. **Данные** отправляются в бот через `tg.sendData`
6. **Бот** создает уникальную ссылку на оплату через Lava Top
7. **Бот** отправляет сообщение с кнопкой "💳 Оплатить"
8. **Пользователь** переходит по ссылке и оплачивает
9. **Lava Top** отправляет webhook об успешной оплате
10. **Бот** активирует подписку пользователя

### Техническая архитектура:

```
Telegram Mini Apps → tg.sendData → Bot Webhook → API Endpoint → Lava Top → Payment URL
                                                                              ↓
Lava Top Webhook ← Bot Webhook ← Payment Success ← Lava Top ← User Payment
```

## 📁 Структура проекта

```
├── bot_webhook.py          # Основной файл бота с webhook
├── payment.html            # Mini Apps интерфейс
├── index.html              # Редирект на Mini Apps
├── requirements.txt        # Python зависимости
├── railway.toml           # Конфигурация Railway
└── README.md              # Документация
```

## 🔧 API Endpoints

### `/webhook` - Telegram Webhook
- **Метод**: POST
- **Описание**: Получает обновления от Telegram
- **Обрабатывает**: Команды, сообщения, данные от Mini Apps

### `/api/create-payment` - Создание платежа
- **Метод**: POST
- **Описание**: Создает уникальную ссылку на оплату
- **Данные**: `{"user_id": "123", "email": "test@example.com", "tariff": "1_month", "price": 50.0}`
- **Ответ**: `{"status": "success", "payment_url": "https://app.lava.top/..."}`

### `/lava-webhook` - Lava Top Webhook
- **Метод**: POST
- **Описание**: Получает уведомления об оплате от Lava Top
- **Обрабатывает**: Успешные платежи, активирует подписки

### `/health` - Health Check
- **Метод**: GET
- **Описание**: Проверка работоспособности сервиса

## 🎨 Mini Apps

### Структура данных:

```javascript
// Данные, отправляемые из Mini Apps
{
  "step": "final_data",
  "email": "user@example.com",
  "tariff": "1_month",
  "price": 50.0,
  "userId": "123456789"
}
```

### Отправка данных:

```javascript
// В Mini Apps
tg.sendData(JSON.stringify({
  step: "final_data",
  email: email,
  tariff: tariff,
  price: price,
  userId: userId
}));
```

## 📊 База данных

### Таблица `subscriptions`:
- `user_id` - ID пользователя Telegram
- `email` - Email пользователя
- `tariff` - Тариф подписки
- `amount` - Сумма оплаты
- `currency` - Валюта
- `order_id` - ID заказа
- `start_date` - Дата начала подписки
- `end_date` - Дата окончания подписки
- `status` - Статус подписки
- `metadata` - Дополнительные данные

## 🚀 Команды бота

- `/start` - Запуск бота, показывает главное меню
- `/payment` - Показать меню оплаты
- `/more_info` - Подробная информация о подписке

## 🔍 Логирование

Бот ведет подробные логи всех операций:

```
🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!
🎯 ОБРАБОТКА ФИНАЛЬНЫХ ДАННЫХ!
✅ ИНВОЙС СОЗДАН УСПЕШНО!
✅ Сообщение с кнопкой оплаты отправлено пользователю
```

## 🛠️ Устранение неполадок

### Проблема: "Chat not found"
- **Причина**: Тестовые запросы с несуществующими chat_id
- **Решение**: Бот автоматически обрабатывает такие ошибки

### Проблема: Webhook не работает
- **Проверьте**: Правильность URL и secret token
- **Логи**: Проверьте логи в Railway Dashboard

### Проблема: Ссылка на оплату не создается
- **Проверьте**: Правильность LAVA_SHOP_ID и LAVA_PRODUCT_ID
- **API**: Протестируйте `/api/create-payment` endpoint

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте настройки webhook в Lava Top

## 🎉 Готово!

Система полностью готова к работе. Пользователи могут:
- Открыть бота
- Заполнить форму в Mini Apps
- Получить уникальную ссылку на оплату
- Оплатить подписку
- Получить доступ к закрытому контенту

**Удачного использования!** 🚀
