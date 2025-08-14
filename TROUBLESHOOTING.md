# 🔧 Устранение неполадок

## ❌ Проблема: Бот не может создать ссылку для оплаты

### 🔍 Диагностика

1. **Проверьте переменные в Railway:**
   ```bash
   curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test"
   ```

2. **Проверьте создание инвойса:**
   ```bash
   curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test-invoice"
   ```

### 🚨 Основные проблемы и решения

#### 1. LAVA_TOP_API_KEY не установлен

**Симптомы:**
- В логах: `🔑 LAVA_TOP_API_KEY: <ваш-ключ-из-app.lav...`
- В /test: `"lava_api_key_set": false`

**Решение:**
1. Зайдите в Railway Dashboard
2. Перейдите в Variables
3. Добавьте переменную:
   ```
   LAVA_TOP_API_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
   ```
4. Перезапустите деплой

#### 2. Как получить LAVA_TOP_API_KEY

1. Зайдите в [app.lava.top](https://app.lava.top)
2. Войдите в кабинет
3. Перейдите в раздел "Интеграция" или "API"
4. Скопируйте ваш `X-Api-Key`

#### 3. PRIVATE_CHANNEL_ID не установлен

**Симптомы:**
- В /test: `"private_channel_id": "-1001234567890"`

**Решение:**
1. Добавьте бота в ваш канал как администратора
2. Отправьте сообщение в канал
3. Получите ID канала:
   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/getUpdates"
   ```
4. Найдите `chat_id` в ответе
5. Установите в Railway:
   ```
   PRIVATE_CHANNEL_ID=-100xxxxxxxxx
   ```

### 🧪 Тестирование

#### Тест 1: Проверка переменных
```bash
curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test"
```

**Ожидаемый результат:**
```json
{
  "status": "ok",
  "lava_api_key_set": true,
  "lava_api_key_preview": "LavaTop_1...",
  "private_channel_id": "-100xxxxxxxxx"
}
```

#### Тест 2: Создание инвойса
```bash
curl "https://formulaprivate-productionpaymentuknow.up.railway.app/test-invoice"
```

**Ожидаемый результат:**
```json
{
  "status": "success",
  "payment_url": "https://app.lava.top/...",
  "lava_api_key_set": true
}
```

### 📋 Полный список обязательных переменных

```bash
# ОБЯЗАТЕЛЬНО
TELEGRAM_BOT_TOKEN=7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc
LAVA_TOP_API_KEY=whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav
PRIVATE_CHANNEL_ID=-100xxxxxxxxx
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```

### 🔄 Перезапуск деплоя

После изменения переменных:
1. Сохраните переменные в Railway
2. Railway автоматически перезапустит деплой
3. Дождитесь завершения деплоя
4. Проверьте логи

### 📞 Если проблема остается

1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные установлены правильно
3. Проверьте, что таблица `bot_users` создана в Supabase
4. Убедитесь, что webhook LAVA настроен правильно

---
*Инструкция по решению проблем с импортами*

# 🔧 РЕШЕНИЕ ПРОБЛЕМ С ИМПОРТАМИ

## ❌ Проблема: "Не удается разрешить импорт flask_cors"

### Решение 1: Установка зависимостей

```bash
# Запустите скрипт установки
./install_dependencies.sh
```

### Решение 2: Ручная установка

```bash
# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Если проблема с flask-cors, установите вручную
pip install Flask-CORS==4.0.0
```

### Решение 3: Использование версии без CORS

Если проблема с `flask_cors` не решается:

1. **Измените Procfile:**
   ```bash
   # Замените содержимое Procfile на:
   web: python bot_webhook_app_no_cors.py
   ```

2. **Или переименуйте файлы:**
   ```bash
   mv bot_webhook_app_no_cors.py bot_webhook_app.py
   ```

## ✅ Проверка установки

```bash
# Проверьте, что все импорты работают
python3 -c "
import flask
import flask_cors
import telegram
import requests
print('✅ Все модули импортируются успешно')
"
```

## 🔧 Альтернативные решения

### Вариант 1: Обновленный requirements.txt
```txt
python-telegram-bot==22.3
supabase==2.18.0
pytz==2024.1
aiohttp==3.9.1
flask==3.1.0
Flask-CORS==4.0.0
requests==2.31.0
```

### Вариант 2: Минимальный requirements.txt (без CORS)
```txt
python-telegram-bot==22.3
flask==3.1.0
requests==2.31.0
```

## 🚀 Быстрый тест

```bash
# Запустите тест
./smoke_test.sh

# Или вручную
curl -sS http://localhost:8080/health
```

## 📋 Все данные уже вставлены в файлы

### В bot_webhook_app.py:
- ✅ `TELEGRAM_BOT_TOKEN` = "7593794536:AAGSiEJol..."
- ✅ `WEBHOOK_URL` = "https://formulaprivate-productionpaymentuknow.up.railway.app"
- ✅ `LAVA_TOP_API_KEY` = "whjKvjpi2oqAjTOwfbt0YUkulXCxjU5PWUJDxlQXwOuhOCNSiRq2jSX7Gd2Zihav"
- ✅ `LAVA_OFFER_ID_BASIC` = "302ecdcd-1581-45ad-8353-a168f347b8cc"
- ✅ `WEBHOOK_SECRET` = "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c"

### В example.env:
- ✅ Все переменные заполнены реальными данными

## 🎯 Рекомендации

1. **Сначала попробуйте** `./install_dependencies.sh`
2. **Если не работает** - используйте версию без CORS
3. **Для Railway** - используйте обычную версию (Railway автоматически установит зависимости)
