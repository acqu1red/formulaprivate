# 🤖 Formula Private Bot

Telegram бот для управления подписками на закрытый канал с интеграцией Lava Top для платежей.

## 🚀 Возможности

- ✅ **Mini Apps интеграция** - сбор данных через Telegram Web Apps
- ✅ **Lava Top платежи** - безопасная оплата через Lava Top
- ✅ **Автоматические уведомления** - мгновенные уведомления о платежах
- ✅ **Webhook обработка** - автоматическая обработка платежей
- ✅ **База данных** - хранение подписок в Supabase
- ✅ **Админ панель** - управление пользователями и подписками
- ✅ **Улучшенный UX** - пошаговое создание ссылок с альтернативными вариантами

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

### 2. Открывается меню оплаты
```
Кнопка "💳 Оплатить подписку" → Меню с информацией о подписке
```

### 3. Пользователь нажимает "Оплатить"
```
🔄 Создание платежной ссылки...
⏳ Пожалуйста, подождите...
```

### 4. Создается ссылка на оплату
```
✅ Платежная ссылка создана успешно!
Варианты оплаты:
• 🔗 Открыть ссылку - перейти на страницу оплаты
• 💳 Оплатить - альтернативный способ
```

### 5. Пользователь выбирает способ оплаты
```
🔗 Открыть ссылку → Переход на Lava Top
💳 Оплатить → Альтернативная ссылка
```

### 6. Mini Apps (альтернативный путь)
```
Кнопка "💳 Оплатить подписку" → Mini Apps → Заполнение формы → Создание ссылки
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

### `/webhook-info` - Информация о webhook
Показывает текущее состояние webhook

### `/reset-webhook` - Сброс webhook
Принудительно переустанавливает webhook

### `/test` - Тест бота
Проверяет работоспособность бота

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
🔥 WEBHOOK ВЫЗВАН!
📥 ПОЛУЧЕН WEBHOOK ОТ TELEGRAM!
📋 Данные от Telegram: {...}
🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!
🎯 ОБРАБОТКА ФИНАЛЬНЫХ ДАННЫХ!
🔧 СОЗДАНИЕ ИНВОЙСА ДЛЯ ПОЛЬЗОВАТЕЛЯ 123456789
✅ Создана прямая ссылка на оплату
✅ Сообщение с кнопками оплаты отправлено
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

# Тест webhook info
curl -X GET http://localhost:8080/webhook-info
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте webhook URL в Lava Top
4. Убедитесь, что бот имеет права на отправку сообщений
5. Используйте `/reset-webhook` для сброса webhook

## 🎉 Готово к использованию!

Бот полностью настроен и готов к работе. Пользователи могут:

### Основной путь:
1. Открыть бота в Telegram: `@formula_private_bot`
2. Нажать "💳 Оплатить подписку"
3. Нажать "💳 Оплатить 50₽"
4. Дождаться создания ссылки
5. Выбрать способ оплаты:
   - 🔗 Открыть ссылку
   - 💳 Оплатить (альтернативный)

### Mini Apps путь:
1. Открыть бота в Telegram
2. Нажать "💳 Оплатить подписку"
3. Заполнить форму в Mini Apps
4. Получить ссылку на оплату

**Система работает автоматически с улучшенным UX!** 🚀
