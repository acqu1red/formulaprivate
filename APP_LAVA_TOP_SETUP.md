# 🚀 НАСТРОЙКА APP LAVA TOP ИНТЕГРАЦИИ

## ✅ Что уже сделано

1. **Файлы скопированы** из папки repair в корень репозитория
2. **Procfile обновлен** - теперь запускает `bot_webhook_app.py`
3. **requirements.txt обновлен** - добавлен `flask-cors==4.0.0`
4. **Папка repair удалена**

## 🔧 Следующие шаги

### 1. Переменные окружения (Railway → Variables)

Скопируйте из `example.env` и заполните:

```env
TELEGRAM_BOT_TOKEN=<ваш бот токен>
WEBHOOK_URL=https://formulaprivate-productionpaymentuknow.up.railway.app
WEBHOOK_SECRET=any_string

# ключ именно из APP LAVA TOP (личный кабинет app.lava.top)
LAVA_TOP_API_KEY=<api-ключ из app.lava.top>

# ваш оффер "basic":
LAVA_OFFER_ID_BASIC=302ecdcd-1581-45ad-8353-a168f347b8cc

# опционально
PAYMENT_MINIAPP_URL=https://acqu1red.github.io/formulaprivate/payment.html
PRIVATE_CHANNEL_ID=
ADMIN_IDS=
```

**Важно:** используйте только ключ из `app.lava.top`. Бизнес-ключи `api.lava.top` тут не подходят.

### 2. Webhooks в APP LAVA TOP

В кабинете `app.lava.top` → **Настройки** → **Webhooks**:

- **URL:** `https://formulaprivate-productionpaymentuknow.up.railway.app/lava-webhook`
- Включите событие **успешной оплаты** (и по желанию — неуспешной)

### 3. Деплой

Сделайте deploy в Railway. Логи теперь печатаются в STDOUT (видно сразу в Railway Logs).

### 4. Быстрая проверка

Локально (или через порт-форвард) выполните:

```bash
bash smoke_test.sh
```

Или вручную:

```bash
curl -sS http://localhost:8080/health
curl -sS http://localhost:8080/webhook-info
curl -sS -X POST http://localhost:8080/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","tariff":"basic","bank":"russian"}'
```

Если всё ок — в ответе `/api/create-payment` придёт `paymentUrl`.

## 🔄 Как работает новый код

1. **Mini App** отправляет данные в бот через `tg.sendData(...)`
2. **`/webhook`** (Telegram) принимает апдейты, хендлер `filters.StatusUpdate.WEB_APP_DATA` парсит JSON и вызывает `create_invoice()` из `lava_app_client.py`
3. **POST** `https://gate.lava.top/api/v2/invoice` отправляем:
   - `email`, `offerId`, `currency`, `paymentMethod`, `buyerLanguage`
   - `clientUtm` (в том числе `tg_id` и выбранный `tariff`) — чтобы потом сопоставлять оплату в вебхуке
4. **Ответ** содержит ссылку оплаты (`paymentUrl` / `url`) — бот отправляет её пользователю
5. **`/lava-webhook`** принимает вебхуки от APP LAVA TOP; при `eventType = "payment.success"` достаёт `tg_id` из `clientUtm` и шлёт пользователю "✅ Оплата прошла успешно"

## 💳 Важная мапа платёжного метода

- **Для ₽:** `BANK131`
- **Для $/€:** `UNLIMINT`

(из коробки выбирается автоматически по «bank russian / not russian»)

## 🔍 Troubleshooting

### Апдейты не доходят
Проверьте `GET /webhook-info`: URL должен быть `https://<...>/webhook`.
Переменная `WEBHOOK_URL` должна указывать на Railway-домен.

### Инвойс не создаётся
В логах появится сообщение от `lava_app_client.create_invoice`: проверьте, что стоит `LAVA_TOP_API_KEY` из `app.lava.top`, и `LAVA_OFFER_ID_BASIC` именно ваш.

### Вебхук об оплате не приходит
Убедитесь, что в `app.lava.top` → Webhooks включено событие успешной оплаты и URL верный.
Сервер должен отвечать HTTP 200.

## 🎯 Преимущества нового подхода

1. **Чистый клиент** под `gate.lava.top` с корректными заголовками
2. **Гарантированная обработка** web_app_data
3. **Детальные логи** и безопасная обработка ошибок
4. **Фолбэк-эндпойнт** `/api/create-payment` (на случай прямых вызовов из Mini App)
5. **CORS поддержка** для прямых вызовов из Mini App

---
*Инструкция создана для перехода на APP LAVA TOP*
