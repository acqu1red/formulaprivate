# 🌐 Настройка Webhook для Lava Top

## 📋 Что такое Webhook?

Webhook - это способ для Lava Top автоматически уведомлять ваш сервер о статусе платежей. Когда пользователь совершает оплату, Lava Top отправляет данные на ваш сервер, и бот автоматически отправляет пользователю ссылку-приглашение.

## 🚀 Создание отдельного репозитория для Webhook

### Шаг 1: Создайте новый репозиторий на GitHub

1. **Перейдите на [GitHub.com](https://github.com)**
2. **Нажмите "New repository"**
3. **Название:** `lava-webhook` (или любое другое)
4. **Описание:** `Lava Top Webhook Server`
5. **Сделайте репозиторий Public**
6. **НЕ инициализируйте с README**
7. **Нажмите "Create repository"**

### Шаг 2: Загрузите webhook код

```bash
# В папке webhook
cd webhook

# Добавьте удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/lava-webhook.git

# Загрузите код
git push -u origin main
```

### Шаг 3: Развертывание на Railway.app

1. **Перейдите на [Railway.app](https://railway.app)**
2. **Создайте новый проект**
3. **Выберите "Deploy from GitHub repo"**
4. **Выберите ваш репозиторий:** `YOUR_USERNAME/lava-webhook`
5. **Railway автоматически определит Python проект**
6. **Добавьте переменные окружения:**
   ```
   LAVA_WEBHOOK_SECRET=your_secret_here
   TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
   ```
7. **Получите URL:** `https://your-app-name.railway.app`

### Шаг 4: Альтернативное развертывание на Render.com

1. **Перейдите на [Render.com](https://render.com)**
2. **Создайте новый Web Service**
3. **Подключите ваш GitHub репозиторий:** `YOUR_USERNAME/lava-webhook`
4. **Настройте переменные окружения:**
   ```
   LAVA_WEBHOOK_SECRET=your_secret_here
   TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
   ```
5. **Команда запуска:** `python lava_webhook.py`
6. **Получите URL:** `https://your-app-name.onrender.com`

## 🔧 Настройка в Lava Top

### Шаг 1: Получите Webhook URL

После развертывания ваш webhook URL будет:
```
https://your-app-name.railway.app/lava-webhook
```

### Шаг 2: Настройте в Lava Top

1. **Войдите в личный кабинет Lava Top**
2. **Перейдите в настройки проекта**
3. **Найдите раздел "Webhooks" или "Уведомления"**
4. **Добавьте новый webhook:**
   - **URL:** `https://your-app-name.railway.app/lava-webhook`
   - **Метод:** POST
   - **События:** payment.success, payment.failed
   - **Secret:** (опционально) укажите секретный ключ

### Шаг 3: Проверьте настройки

После настройки webhook будет автоматически:
- ✅ Получать уведомления о платежах
- ✅ Отправлять ссылку-приглашение пользователю в Telegram
- ✅ Уведомлять администраторов

## 📱 Что происходит после оплаты

1. **Пользователь оплачивает тариф**
2. **Lava Top отправляет webhook на ваш сервер**
3. **Пользователь получает уведомление в Telegram с ссылкой:**
   ```
   🎉 Оплата прошла успешно!
   
   Ваша подписка активирована!
   Вот ваша ссылка для доступа к закрытому каналу:
   
   🔗 Присоединиться к каналу
   
   С уважением, команда Формулы Успеха
   ```
4. **Администраторы получают уведомление**

## 🔍 Тестирование Webhook

### Проверка работоспособности

Откройте в браузере:
```
https://your-app-name.railway.app/health
```

Должен вернуться ответ:
```json
{"status": "healthy"}
```

### Тестовый платеж

1. Сделайте тестовый платеж через Lava Top
2. Проверьте логи в Railway/Render
3. Убедитесь, что пользователь получил уведомление

## 🛠️ Локальная разработка

Для тестирования локально:

```bash
# Установите зависимости
pip install flask requests

# Запустите webhook локально
python lava_webhook.py

# Используйте ngrok для публичного URL
ngrok http 5000
```

Получите URL от ngrok и используйте его для тестирования.

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Railway/Render
2. Убедитесь, что все переменные окружения настроены
3. Проверьте, что webhook URL доступен извне
4. Убедитесь, что Lava Top может достучаться до вашего сервера
