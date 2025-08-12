# 🎯 Финальная конфигурация для Railway Webhook

## 📋 Ваши данные Lava Top

### ✅ У вас уже есть:
- **API Key:** `whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav`
- **Shop ID:** `1b9f3e05-86aa-4102-9648-268f0f586bb1`
- **Product ID:** `302ecdcd-1581-45ad-8353-a168f347b8cc`
- **Product URL:** https://app.lava.top/products/1b9f3e05-86aa-4102-9648-268f0f586bb1/302ecdcd-1581-45ad-8353-a168f347b8cc?currency=RUB

### 🔑 Что нужно создать:
- **Webhook Secret:** `lava_webhook_secret_2024_secure_key` (создайте любую случайную строку)
- **Telegram Webhook Secret:** `telegram_webhook_secret_2024` (создайте любую случайную строку)

## 🚨 Важно: Secret Key НЕ нужен!

Для вашей задачи (отправка сообщений после оплаты) **Secret Key не требуется**. Ваш API Key `whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav` достаточен.

## 📝 Полная конфигурация для Railway

В Railway Dashboard → Variables добавьте:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
WEBHOOK_SECRET=telegram_webhook_secret_2024

# Supabase Database
SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8

# Lava Top Payment System
LAVA_SHOP_ID=1b9f3e05-86aa-4102-9648-268f0f586bb1
LAVA_SECRET_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
LAVA_WEBHOOK_SECRET=lava_webhook_secret_2024_secure_key

# Railway URL (добавится автоматически после деплоя)
RAILWAY_STATIC_URL=https://formulaprivate-production.up.railway.app
```

## 🔧 Настройка в Lava Top Dashboard

### Шаг 1: Настройка webhook
1. Войдите в [Lava Top Dashboard](https://app.lava.top)
2. Перейдите в настройки вашего проекта
3. Найдите раздел "Webhooks" или "Уведомления"
4. Добавьте новый webhook:

```
URL: https://your-app-name.railway.app/lava-webhook
Метод: POST
События: payment.success
Secret: lava_webhook_secret_2024_secure_key
```

## 🎯 Что будет происходить после оплаты

1. **Пользователь оплачивает подписку** на Lava Top
2. **Lava Top отправляет webhook** на ваш сервер
3. **Бот автоматически отправляет сообщение** пользователю:

```
🎉 Оплата прошла успешно!

Ваша подписка активирована!
Вот ваша ссылка для доступа к закрытому каналу:

🔗 Присоединиться к каналу

⏰ Подписка активна до: [дата окончания]

С уважением, команда Формулы Успеха
```

4. **Пользователь добавляется в базу данных** с датой окончания подписки
5. **По истечении подписки** пользователь автоматически удаляется из канала (без черного списка)

## 🚀 Быстрый старт

### 1. Деплой на Railway
```bash
# Загрузите код в GitHub
git add .
git commit -m "Add webhook support"
git push origin main

# Создайте проект на Railway
# Подключите ваш GitHub репозиторий
```

### 2. Настройка переменных окружения
Скопируйте конфигурацию выше в Railway Dashboard → Variables

### 3. Установка webhook
```bash
# После получения URL от Railway
export WEBHOOK_URL="https://your-app-name.railway.app"
python setup_webhook.py setup
```

### 4. Настройка Lava Top
Добавьте webhook URL в настройках Lava Top

## ✅ Проверка работы

1. **Проверьте статус webhook:**
   ```bash
   python setup_webhook.py status
   ```

2. **Сделайте тестовый платеж** через Lava Top

3. **Проверьте, что пользователь получил сообщение** с ссылкой на канал

4. **Проверьте логи** в Railway Dashboard

## 🆘 Если что-то не работает

### Проблема: Webhook не срабатывает
1. Проверьте URL в настройках Lava Top
2. Убедитесь, что приложение запущено
3. Проверьте логи в Railway

### Проблема: Сообщение не отправляется
1. Проверьте токен бота
2. Убедитесь, что webhook установлен
3. Проверьте подключение к Supabase

### Проблема: Пользователь не добавляется в канал
1. Проверьте права бота в канале
2. Убедитесь, что ссылка-приглашение работает
3. Проверьте настройки канала

## 📞 Поддержка

Если нужна помощь:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные окружения установлены
3. Проверьте настройки webhook в Lava Top

## 🎯 Результат

После настройки у вас будет полностью автоматизированная система:
- ✅ Автоматическая отправка ссылок после оплаты
- ✅ Сохранение данных о подписках
- ✅ Автоматическое удаление по истечении срока
- ✅ Уведомления администраторов
- ✅ Безопасное исключение (не черный список)
