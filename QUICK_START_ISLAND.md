# 🏝️ Formula Private - Остров Архив - Быстрый старт

## 🚀 Запуск за 5 минут

### 1. Установка зависимостей
```bash
pnpm install
```

### 2. Настройка окружения
```bash
cp env.example .env
# Отредактируйте .env с вашими настройками
```

### 3. Настройка базы данных
```bash
cd apps/server
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Запуск в режиме разработки
```bash
# В корневой папке
pnpm dev
```

## 🌐 Деплой на GitHub Pages

### Автоматический деплой
```bash
./deploy.sh
```

### Ручной деплой
```bash
cd apps/webapp
pnpm build:ghpages
# Скопируйте содержимое dist-ghpages/ в папку docs/
```

## 🤖 Настройка Telegram Bot

1. **Добавьте токен в .env**
```env
BOT_TOKEN="your_bot_token_here"
```

2. **Настройте WebApp URL в BotFather**
```
/setmenubutton
URL: https://acqu1red.github.io/formulaprivate/island.html
```

3. **Кнопка уже добавлена в bot.py**
- Новая кнопка "🏝️ Остров Архив" появится в меню бота

## 🎮 Тестирование

1. **Откройте бота** и нажмите "🏝️ Остров Архив"
2. **Исследуйте остров** - найдите хотспоты
3. **Собирайте фрагменты** - tap/hold на хотспотах
4. **Играйте в мини-игры** - 20-30% хотспотов
5. **Проверьте настройки** - переключение скинов

## 📱 URL приложения

- **Разработка**: http://localhost:3000
- **GitHub Pages**: https://acqu1red.github.io/formulaprivate/island.html

## 🔧 Основные команды

```bash
# Разработка
pnpm dev                    # Запуск фронтенда + бэкенда
pnpm build                  # Сборка для продакшна
pnpm build:ghpages          # Сборка для GitHub Pages

# База данных
pnpm db:generate           # Генерация Prisma клиента
pnpm db:migrate            # Миграции БД
pnpm db:seed               # Заполнение тестовыми данными
pnpm db:studio             # Prisma Studio (GUI для БД)
```

## 🎨 Скины

- **Neo-Solarpunk** (по умолчанию) - природа + технологии
- **Art-Deco Nocturne** - тёмное золото, геометрия
- **Retro-Synthwave** - 80s ретро, неоновые цвета

## 🎮 Микро-игры

1. **Holo-Ripple Sync** - тап в центр при совпадении волны
2. **Glyph Dial** - поворот кольца до сектора
3. **Constellation Trace** - проведение линии через звёзды

## 📊 Структура хотспотов

- **70-80%** - простые tap/hold
- **20-30%** - мини-игры
- **Распределение**: равномерно по карте

## 🔗 Интеграция с существующими системами

- **Оплата**: переход на https://acqu1red.github.io/formulaprivate/payment.html
- **Подписка**: проверка через API
- **Канал**: инвайт-ссылки после оплаты

---

**Готово!** 🎉 Ваш интерактивный остров-архив работает!
