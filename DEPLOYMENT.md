# 🚀 Инструкция по развертыванию

Полная инструкция по развертыванию Telegram бота с системой оплаты Lava Top.

## 📋 Предварительные требования

1. **Telegram Bot Token** - получите у @BotFather
2. **Lava Top аккаунт** - зарегистрируйтесь на [app.lava.top](https://app.lava.top)
3. **Supabase проект** - создайте на [supabase.com](https://supabase.com)
4. **Railway аккаунт** - зарегистрируйтесь на [railway.app](https://railway.app)

## 🔧 Шаг 1: Настройка базы данных Supabase

### 1.1 Создание проекта
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### 1.2 Настройка схемы базы данных
1. Перейдите в **SQL Editor**
2. Выполните SQL из файла `database_schema.sql`
3. Проверьте создание таблиц в **Table Editor**

### 1.3 Получение данных подключения
1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (SUPABASE_URL)
   - **anon public** ключ (SUPABASE_KEY)

## 💳 Шаг 2: Настройка Lava Top

### 2.1 Создание магазина
1. Откройте [app.lava.top](https://app.lava.top)
2. Создайте новый магазин
3. Запишите **Shop ID**

### 2.2 Создание продукта
1. В магазине создайте новый продукт
2. Настройте:
   - **Название**: "Подписка на закрытый канал"
   - **Цена**: 50₽
   - **Валюта**: RUB
3. Запишите **Product ID**

### 2.3 Получение API ключа
1. Перейдите в **Настройки** → **API**
2. Создайте новый API ключ
3. Запишите **Secret Key**

## 🤖 Шаг 3: Создание Telegram бота

### 3.1 Получение токена
1. Откройте @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Запишите **Bot Token**

### 3.2 Настройка Mini Apps
1. Отправьте @BotFather `/setmenubutton`
2. Выберите вашего бота
3. Укажите URL: `https://ваш-домен.github.io/ваш-репозиторий/`

## 🚂 Шаг 4: Развертывание на Railway

### 4.1 Подключение репозитория
1. Откройте [Railway Dashboard](https://railway.app/dashboard)
2. Нажмите **New Project**
3. Выберите **Deploy from GitHub repo**
4. Подключите ваш репозиторий

### 4.2 Настройка переменных окружения
В Railway Dashboard → **Variables** добавьте:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
LAVA_SHOP_ID=ваш_shop_id
LAVA_SECRET_KEY=ваш_secret_key
LAVA_PRODUCT_ID=ваш_product_id
SUPABASE_URL=ваш_supabase_url
SUPABASE_KEY=ваш_supabase_key
WEBHOOK_SECRET=Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c
LAVA_WEBHOOK_SECRET=LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z
```

### 4.3 Настройка домена
1. В Railway Dashboard перейдите в **Settings**
2. Включите **Public Networking**
3. Скопируйте **Domain** (например: `formulaprivate-productionpaymentuknow.up.railway.app`)

## 🔗 Шаг 5: Настройка Webhook

### 5.1 Telegram Webhook
Railway автоматически настроит webhook при запуске. Проверьте логи:

```
✅ Webhook успешно установлен
🔍 Фактический webhook URL: https://ваш-домен.up.railway.app/webhook
```

### 5.2 Lava Top Webhook
1. В настройках Lava Top перейдите в **Webhooks**
2. Добавьте новый webhook:
   - **URL**: `https://ваш-домен.up.railway.app/lava-webhook`
   - **API Key**: `LavaTop_Webhook_Secret_2024_Formula_Private_Channel_8x9y2z`

## 🧪 Шаг 6: Тестирование

### 6.1 Проверка бота
1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Убедитесь, что появляется меню

### 6.2 Проверка Mini Apps
1. Нажмите "💳 Оплатить подписку"
2. Заполните форму
3. Нажмите "Оплатить"
4. Убедитесь, что бот отправляет ссылку на оплату

### 6.3 Проверка webhook
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что нет ошибок
3. Проверьте, что данные обрабатываются

## 📊 Шаг 7: Мониторинг

### 7.1 Логи Railway
- Откройте Railway Dashboard
- Перейдите в **Deployments** → **Logs**
- Следите за логами в реальном времени

### 7.2 База данных
- Откройте Supabase Dashboard
- Перейдите в **Table Editor**
- Проверьте таблицу `subscriptions`

### 7.3 Lava Top
- Откройте Lava Top Dashboard
- Перейдите в **Транзакции**
- Проверьте статус платежей

## 🛠️ Устранение неполадок

### Проблема: Бот не отвечает
1. Проверьте логи Railway
2. Убедитесь, что TELEGRAM_BOT_TOKEN правильный
3. Проверьте, что webhook установлен

### Проблема: Mini Apps не работает
1. Проверьте URL в @BotFather
2. Убедитесь, что файлы загружены в GitHub Pages
3. Проверьте консоль браузера

### Проблема: Ссылки не создаются
1. Проверьте LAVA_SHOP_ID и LAVA_PRODUCT_ID
2. Убедитесь, что API ключ правильный
3. Проверьте логи создания платежей

### Проблема: Webhook не получает уведомления
1. Проверьте URL webhook в Lava Top
2. Убедитесь, что API ключ правильный
3. Проверьте логи webhook

## 📈 Шаг 8: Оптимизация

### 8.1 Масштабирование
- Railway автоматически масштабирует приложение
- При необходимости увеличьте лимиты

### 8.2 Мониторинг производительности
- Используйте Railway Analytics
- Следите за временем ответа
- Мониторьте использование ресурсов

### 8.3 Резервное копирование
- Supabase автоматически создает бэкапы
- Настройте дополнительные бэкапы при необходимости

## 🎉 Готово!

Ваша система полностью развернута и готова к работе!

### Что работает:
- ✅ Telegram бот с командами
- ✅ Mini Apps интерфейс
- ✅ Создание ссылок на оплату
- ✅ Обработка платежей
- ✅ База данных подписок
- ✅ Webhook система

### Следующие шаги:
1. Протестируйте с реальными пользователями
2. Настройте уведомления администраторам
3. Добавьте аналитику
4. Оптимизируйте производительность

**Удачного использования!** 🚀
