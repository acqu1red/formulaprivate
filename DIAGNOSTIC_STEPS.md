# 🔍 Диагностика проблемы с логами

## Проблема: Не приходят логи от Telegram webhook

### Шаг 1: Проверьте переменные окружения в Railway

1. Откройте ваш проект в Railway
2. Перейдите в раздел **Variables**
3. Убедитесь, что заданы все обязательные переменные:

```
TELEGRAM_BOT_TOKEN=ваш_токен_бота
WEBHOOK_URL=https://ваше-приложение.up.railway.app
WEBHOOK_SECRET=любая_строка_секрета
LAVA_TOP_API_KEY=ваш_ключ_lava_top
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc
```

### Шаг 2: Проверьте логи запуска приложения

После деплоя в логах Railway должны появиться:

```
🚀 ЗАПУСК ПРИЛОЖЕНИЯ
📡 WEBHOOK_URL: https://ваше-приложение.up.railway.app
🤖 TELEGRAM_BOT_TOKEN: 7593...6qc
🔑 LAVA_TOP_API_KEY: whjK...hav
🎯 LAVA_OFFER_ID_BASIC: 302e...b8cc
🔧 ИНИЦИАЛИЗАЦИЯ TELEGRAM БОТА
🔗 УСТАНОВКА WEBHOOK
🗑️  Удаляем старый webhook...
✅ Удаление webhook: 200
🎯 Устанавливаем webhook: https://ваше-приложение.up.railway.app/webhook
📡 setWebhook ответ: 200 {"ok":true,"result":true,"description":"Webhook was set"}
```

### Шаг 3: Проверьте health endpoint

Откройте в браузере:
```
https://ваше-приложение.up.railway.app/health
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "time": "2024-01-01T12:00:00Z",
  "webhook_url": "https://ваше-приложение.up.railway.app",
  "bot_token_set": true,
  "lava_key_set": true
}
```

### Шаг 4: Проверьте webhook info

Откройте в браузере:
```
https://ваше-приложение.up.railway.app/webhook-info
```

В ответе `result.url` должен быть:
```
https://ваше-приложение.up.railway.app/webhook
```

### Шаг 5: Используйте диагностический скрипт

Запустите локально:
```bash
python debug_webhook.py
```

Этот скрипт проверит:
- Переменные окружения
- Доступность бота
- Настройку webhook
- Доступность endpoint

### Шаг 6: Принудительно установите webhook

Если webhook настроен неправильно, выполните:
```
POST https://ваше-приложение.up.railway.app/force-set-webhook
```

### Шаг 7: Тест бота

1. Отправьте `/start` боту
2. Нажмите кнопку "Оплатить"
3. В логах Railway должно появиться:
```
HTTP IN: {"method":"POST","path":"/webhook","ip":"...","ct":"application/json","len":"123","json":{...}}
```

## Возможные причины проблемы:

### 1. Неправильный WEBHOOK_URL
- Убедитесь, что URL указывает на ваше текущее приложение
- Не используйте старый домен `formulaprivate-productionpaymentuknow.up.railway.app`

### 2. Не заданы переменные окружения
- Приложение не запустится без обязательных переменных
- Проверьте логи запуска на наличие ошибок

### 3. Telegram не может достучаться до webhook
- Проверьте, что приложение доступно извне
- Убедитесь, что нет ошибок в коде

### 4. Проблемы с SSL
- Railway автоматически предоставляет SSL
- Убедитесь, что используете `https://`

## Команды для быстрой проверки:

```bash
# Проверка health
curl https://ваше-приложение.up.railway.app/health

# Проверка webhook info
curl https://ваше-приложение.up.railway.app/webhook-info

# Принудительная установка webhook
curl -X POST https://ваше-приложение.up.railway.app/force-set-webhook
```

## Если ничего не помогает:

1. Проверьте логи Railway на наличие ошибок
2. Убедитесь, что Procfile правильный: `web: python bot_webhook_app.py`
3. Попробуйте временно включить polling: `USE_POLLING=1`
4. Проверьте, что бот не заблокирован
