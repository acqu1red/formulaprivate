# 🌐 Настройка Webhook для Lava Top

## 📋 Что такое Webhook?

Webhook - это способ для Lava Top автоматически уведомлять ваш сервер о статусе платежей. Когда пользователь совершает оплату, Lava Top отправляет данные на ваш сервер, и бот автоматически отправляет пользователю ссылку-приглашение.

## 🚀 Варианты развертывания Webhook

### Вариант 1: Render.com (Рекомендуемый)

1. **Создайте аккаунт на [Render.com](https://render.com)**
2. **Создайте новый Web Service**
3. **Подключите ваш GitHub репозиторий**
4. **Настройте переменные окружения:**
   ```
   LAVA_WEBHOOK_SECRET=your_secret_here
   TELEGRAM_BOT_TOKEN=8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo
   SUPABASE_URL=https://uhhsrtmmuwoxsdquimaa.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8
   ```
5. **Укажите команду запуска:** `python lava_webhook.py`
6. **Получите URL:** `https://your-app-name.onrender.com`

### Вариант 2: Railway.app

1. **Создайте аккаунт на [Railway.app](https://railway.app)**
2. **Подключите GitHub репозиторий**
3. **Настройте переменные окружения**
4. **Получите URL:** `https://your-app-name.railway.app`

### Вариант 3: Heroku

1. **Создайте аккаунт на [Heroku.com](https://heroku.com)**
2. **Создайте новое приложение**
3. **Подключите GitHub репозиторий**
4. **Настройте переменные окружения**
5. **Получите URL:** `https://your-app-name.herokuapp.com`

## 🔧 Настройка в Lava Top

### Шаг 1: Получите Webhook URL

После развертывания вашего webhook сервера, вы получите URL вида:
```
https://your-app-name.onrender.com/lava-webhook
```

### Шаг 2: Настройте в Lava Top

1. **Войдите в личный кабинет Lava Top**
2. **Перейдите в настройки проекта**
3. **Найдите раздел "Webhooks" или "Уведомления"**
4. **Добавьте новый webhook:**
   - **URL:** `https://your-app-name.onrender.com/lava-webhook`
   - **Метод:** POST
   - **События:** payment.success, payment.failed
   - **Secret:** (опционально) укажите секретный ключ

### Шаг 3: Проверьте настройки

После настройки webhook будет автоматически:
- ✅ Получать уведомления о платежах
- ✅ Создавать подписки в базе данных
- ✅ Отправлять приглашения на email
- ✅ Уведомлять пользователей в Telegram
- ✅ Уведомлять администраторов

## 📱 Что происходит после оплаты

1. **Пользователь оплачивает тариф**
2. **Lava Top отправляет webhook на ваш сервер**
3. **Сервер создает подписку в базе данных**
4. **Отправляется email с приглашением в канал**
5. **Пользователь получает уведомление в Telegram**
6. **Администраторы получают уведомление**

## 🔍 Тестирование Webhook

### Проверка работоспособности

Откройте в браузере:
```
https://your-app-name.onrender.com/health
```

Должен вернуться ответ:
```json
{"status": "healthy"}
```

### Тестовый платеж

1. Сделайте тестовый платеж через Lava Top
2. Проверьте логи в Render/Railway/Heroku
3. Убедитесь, что пользователь получил уведомление
4. Проверьте, что подписка создана в базе данных

## 🛠️ Локальная разработка

Для тестирования локально:

```bash
# Установите зависимости
pip install flask requests supabase

# Запустите webhook локально
python lava_webhook.py

# Используйте ngrok для публичного URL
ngrok http 5000
```

Получите URL от ngrok и используйте его для тестирования.

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Render/Railway/Heroku
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что webhook URL доступен извне
4. Убедитесь, что Lava Top может достучаться до вашего сервера
