# 🔧 Исправления платёжного контура MiniApp → Railway → LAVA TOP

## ✅ Что исправлено

### 1. **Procfile** - небуферизованные логи
```diff
- web: python bot_webhook.py
+ web: python -u bot_webhook.py
```

### 2. **bot_webhook.py** - убраны хардкоды
- ❌ Убраны дефолтные значения чужого домена `PUBLIC_BASE_URL`
- ❌ Убраны дефолтные ключи `LAVA_TOP_API_KEY`, `TELEGRAM_BOT_TOKEN`
- ✅ Добавлена проверка обязательных переменных окружения
- ✅ Добавлен `metadata.tg_user_id` в LAVA инвойсы для упрощения сопоставления
- ✅ Исправлена логика webhook (без хардкодов доменов)
- ✅ Добавлены endpoints `/reset-webhook` и `/webhook-info`

### 3. **docs/payment.html** - исправлена отправка данных
- ❌ Убрана гонка `tg.close()` → `tg.sendData()`
- ✅ Сначала отправка данных, потом закрытие MiniApp
- ✅ Улучшена валидация email
- ✅ Добавлен fallback без закрытия MiniApp

### 4. **env.example** - безопасность
- ❌ Убраны все реальные ключи
- ✅ Оставлены только пустые плейсхолдеры

## 🚀 Настройка на Railway

### 1. Переменные окружения (ОБЯЗАТЕЛЬНО)

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=ваш_токен_бота
PRIVATE_CHANNEL_ID=-1001234567890

# LAVA TOP Seller API
LAVA_TOP_API_KEY=ваш_ключ_lava_top
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc

# Railway URL (автоматически или вручную)
PUBLIC_BASE_URL=https://ваш-домен-railway.up.railway.app

# Опционально
ADMIN_IDS=123,456
LAVA_TOP_WEBHOOK_SECRET=ваш_секрет_вебхука
```

### 2. Деплой

```bash
git add .
git commit -m "Fix payment flow: remove hardcoded values, fix webhook logic"
git push
```

### 3. Настройка webhook

После деплоя выполните:

```bash
# Сброс и установка webhook
curl -X POST https://ваш-домен-railway.up.railway.app/reset-webhook

# Проверка webhook
curl https://ваш-домен-railway.up.railway.app/webhook-info
```

### 4. Настройка LAVA TOP webhook

В кабинете app.lava.top установите webhook URL:
```
https://ваш-домен-railway.up.railway.app/lava-webhook
```

## 🔍 Тестирование

### 1. MiniApp путь
1. Откройте MiniApp в боте
2. Заполните email и выберите тариф
3. Нажмите "Оплатить"
4. В чате должна появиться кнопка с ссылкой на оплату

### 2. REST API путь
```bash
curl -X POST https://ваш-домен-railway.up.railway.app/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "email": "user@example.com",
    "tariff": "basic",
    "price": 50,
    "bank": "russian"
  }'
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "payment_url": "https://app.lava.top/...",
  "message": "Payment created successfully"
}
```

### 3. Проверка логов
Логи теперь выводятся мгновенно (без буферизации):
```bash
# В Railway Dashboard должны быть видны все print() сообщения
```

## 🛠️ Структура исправлений

### Файлы изменены:
- ✅ `Procfile` - добавлен флаг `-u`
- ✅ `bot_webhook.py` - убраны хардкоды, добавлены проверки
- ✅ `docs/payment.html` - исправлена логика отправки данных
- ✅ `env.example` - убраны реальные ключи

### Файлы НЕ изменены:
- ❌ Остальной функционал бота
- ❌ Меню и команды
- ❌ Supabase логика (вне оплаты)
- ❌ Тексты и интерфейс
- ❌ Базы данных
- ❌ Деплой скрипты

## 🔒 Безопасность

- ✅ Все ключи теперь берутся только из переменных окружения
- ✅ Нет хардкодов доменов в коде
- ✅ Проверка обязательных параметров перед созданием инвойсов
- ✅ Безопасная обработка ошибок

## 📋 Чек-лист настройки

- [ ] Установлены все переменные окружения в Railway
- [ ] Деплой прошел успешно
- [ ] Webhook установлен (`/reset-webhook`)
- [ ] Webhook работает (`/webhook-info`)
- [ ] LAVA TOP webhook настроен в кабинете
- [ ] MiniApp отправляет данные корректно
- [ ] Инвойсы создаются через LAVA TOP Seller API
- [ ] Инвайты отправляются после оплаты

## 🆘 Устранение неполадок

### "LAVA_TOP_API_KEY не установлен"
- Проверьте переменную `LAVA_TOP_API_KEY` в Railway

### "PUBLIC_BASE_URL не задан"
- Установите `PUBLIC_BASE_URL` в Railway
- Выполните `/reset-webhook`

### "Webhook не работает"
- Проверьте `TELEGRAM_BOT_TOKEN`
- Выполните `/reset-webhook`
- Проверьте `/webhook-info`

### "MiniApp не отправляет данные"
- Проверьте логи в Railway
- Убедитесь, что `tg.sendData()` доступен
- Проверьте формат данных в `payment.html`
