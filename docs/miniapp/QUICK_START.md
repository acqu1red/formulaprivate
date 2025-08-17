# 🚀 Быстрый запуск Formula Private Mini App

## 1. Установка зависимостей

```bash
cd docs/miniapp
pnpm install
```

## 2. Настройка окружения

```bash
cp env.example .env
```

Отредактируйте `.env`:
```bash
BOT_TOKEN="your_telegram_bot_token"
JWT_SECRET="your-super-secret-key"
DATABASE_URL="file:./dev.db"
```

## 3. Настройка базы данных

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## 4. Запуск разработки

**Терминал 1 (Фронтенд):**
```bash
pnpm dev
```

**Терминал 2 (Бэкенд):**
```bash
pnpm server:dev
```

## 5. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env`
3. Настройте Mini App:
   ```
   /newapp → выберите бота
   Название: Formula Private
   Описание: Остров Архив - собирайте фрагменты знаний
   Start URL: http://localhost:3000
   ```

## 6. Тестирование

1. Откройте бота в Telegram
2. Нажмите "Открыть остров 🌴"
3. Собирайте фрагменты на хотспотах
4. Попробуйте мини-игры

## 🎮 Что тестировать

- ✅ Параллакс эффекты
- ✅ Сбор фрагментов (tap/hold)
- ✅ Мини-игры (ripple, dial, constellation)
- ✅ Ежедневные награды
- ✅ Смена скинов
- ✅ Paywall и оплата
- ✅ Реферальная система

## 🐛 Отладка

**Проблемы с HMAC:**
- Проверьте BOT_TOKEN в `.env`
- Убедитесь, что бот создан правильно

**Проблемы с БД:**
```bash
pnpm db:push --force-reset
pnpm db:seed
```

**Проблемы с CORS:**
- Проверьте FRONTEND_URL в `.env`
- Убедитесь, что фронтенд и бэкенд запущены

## 📱 Продакшн

1. Соберите проект:
```bash
pnpm build
pnpm server:build
```

2. Загрузите `dist/` на хостинг
3. Обновите URL в BotFather
4. Настройте переменные окружения для продакшна

## 🎯 Готово!

Ваш Telegram Mini App готов к использованию! 🎉
