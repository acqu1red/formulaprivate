# Система поддержки с админ-панелью

Веб-приложение для системы поддержки с интеграцией Telegram бота и админ-панелью.

## 🚀 Особенности

- **Telegram Bot** - для взаимодействия с пользователями
- **Mini App** - веб-интерфейс для пользователей и администраторов
- **Админ-панель** - управление диалогами и ответами
- **Supabase** - база данных и аутентификация
- **GitHub Pages** - хостинг приложения

## 📁 Структура проекта

```
bo3333/
├── bot.py                    # Telegram бот
├── docs/                     # Веб-приложение
│   ├── index.html           # Главная страница
│   ├── script.js            # JavaScript логика
│   ├── config.js            # Конфигурация
│   └── .nojekyll            # Для GitHub Pages
├── *.sql                    # SQL скрипты для базы данных
├── requirements.txt         # Python зависимости
├── deploy_webapp.sh         # Скрипт деплоя
└── *.md                     # Документация
```

## 🛠 Установка и настройка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd bo3333
   ```

2. **Настройте базу данных:**
   - Следуйте инструкциям в `SETUP_INSTRUCTIONS.md`

3. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Настройте переменные окружения:**
   - Создайте файл `.env` с токенами бота и Supabase

5. **Запустите бота:**
   ```bash
   python bot.py
   ```

## 🌐 Деплой

Приложение автоматически деплоится на GitHub Pages при пуше в ветку `main`.

## 📚 Документация

- `SETUP_INSTRUCTIONS.md` - подробная инструкция по настройке
- `ADMIN_SETUP.md` - настройка админ-панели
- `ADMIN_PANEL_IMPROVEMENTS.md` - улучшения админ-панели
- `GITHUB_PAGES_FIX.md` - исправления для GitHub Pages

## 🔧 Технологии

- **Frontend:** HTML, CSS, JavaScript, Supabase JS SDK
- **Backend:** Python, Telegram Bot API
- **База данных:** Supabase (PostgreSQL)
- **Хостинг:** GitHub Pages

## 📝 Лицензия

MIT License
