# 🔍 Инструкция по отладке Mini Apps

## Проблема
Mini Apps пишет "бот создает ссылку для оплаты" бесконечно, логи пустые.

## 🔧 Шаги для отладки

### 1. Проверка Mini Apps URL в BotFather

1. Откройте @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Перейдите в **Bot Settings** → **Menu Button**
5. Проверьте URL - он должен быть:
   ```
   https://acqu1red.github.io/formulaprivate/
   ```
   или
   ```
   https://formulaprivate-productionpaymentuknow.up.railway.app/
   ```

### 2. Проверка Mini Apps в браузере

1. Откройте URL Mini Apps в браузере
2. Должна открыться страница с формой оплаты
3. Проверьте консоль браузера (F12) на ошибки

### 3. Тестирование Mini Apps

1. Откройте `test_mini_apps_debug.html` в браузере
2. Нажмите "Отправить данные"
3. Проверьте лог на странице
4. Проверьте логи в Railway

### 4. Проверка логов Railway

1. Откройте Railway Dashboard
2. Перейдите в **Deployments** → **Logs**
3. Ищите логи:
   ```
   📥 ПОЛУЧЕН WEBHOOK ОТ TELEGRAM!
   🚀 ВЫЗВАНА ФУНКЦИЯ handle_web_app_data!
   📱 ОБРАБОТКА ДАННЫХ ПЛАТЕЖА!
   ```

### 5. Тестирование webhook

Запустите тест:
```bash
python3 test_webhook_data.py
```

## 🐛 Возможные проблемы

### Проблема 1: Mini Apps URL неправильный
**Симптомы**: Mini Apps не открывается или показывает ошибку
**Решение**: Проверить URL в BotFather

### Проблема 2: tg.sendData не работает
**Симптомы**: Данные не отправляются
**Решение**: Проверить консоль браузера на ошибки

### Проблема 3: Webhook не получает данные
**Симптомы**: Логи пустые
**Решение**: Проверить настройки webhook

### Проблема 4: Данные не обрабатываются
**Симптомы**: Данные приходят, но не обрабатываются
**Решение**: Проверить логи обработки

## 📋 Чек-лист

- [ ] Mini Apps URL правильный в BotFather
- [ ] Mini Apps открывается в браузере
- [ ] Нет ошибок в консоли браузера
- [ ] tg.sendData работает
- [ ] Webhook получает данные
- [ ] Данные обрабатываются
- [ ] Ссылка на оплату создается

## 🔍 Команды для проверки

```bash
# Тест webhook
python3 test_webhook_data.py

# Проверка health
curl https://formulaprivate-productionpaymentuknow.up.railway.app/health

# Проверка webhook info
curl https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info

# Сброс webhook
curl https://formulaprivate-productionpaymentuknow.up.railway.app/reset-webhook
```

## 📞 Если ничего не помогает

1. Проверьте все логи в Railway
2. Убедитесь, что Mini Apps URL правильный
3. Проверьте, что webhook настроен
4. Протестируйте с реальным пользователем
