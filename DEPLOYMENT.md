# Инструкции по развертыванию

## 🚀 Пошаговое развертывание

### Шаг 1: Настройка Supabase

1. **Создание проекта Supabase:**
   - Перейдите на [supabase.com](https://supabase.com)
   - Создайте новый проект
   - Дождитесь завершения инициализации

2. **Настройка базы данных:**
   - В панели Supabase перейдите в **SQL Editor**
   - Скопируйте весь код из файла `database_schema.sql`
   - Выполните код (может занять несколько минут)
   - Проверьте, что все таблицы созданы в **Table Editor**

3. **Получение ключей:**
   - В настройках проекта найдите **API**
   - Скопируйте **Project URL** и **anon public key**

### Шаг 2: Настройка Telegram Bot

1. **Создание бота:**
   - Напишите [@BotFather](https://t.me/BotFather) в Telegram
   - Выполните команду `/newbot`
   - Следуйте инструкциям для создания бота
   - Сохраните **Bot Token**

2. **Настройка Web App:**
   - Напишите [@BotFather](https://t.me/BotFather) команду `/mybots`
   - Выберите вашего бота
   - Перейдите в **Bot Settings** → **Menu Button**
   - Установите URL вашего мини-приложения

### Шаг 3: Настройка GitHub Pages

1. **Создание репозитория:**
   - Создайте новый репозиторий на GitHub
   - Загрузите все файлы проекта

2. **Настройка GitHub Pages:**
   - В настройках репозитория перейдите в **Pages**
   - В разделе **Source** выберите **Deploy from a branch**
   - Выберите ветку `main` и папку `/docs`
   - Сохраните настройки

3. **Обновление URL:**
   - Получите URL вашего сайта (обычно `https://username.github.io/repository-name/`)
   - Обновите `MINIAPP_URL` в `bot.py`
   - Обновите URL в настройках бота у BotFather

### Шаг 4: Обновление конфигурации

1. **В файле `bot.py`:**
```python
# Supabase configuration
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"

# Telegram Bot Token
BOT_TOKEN = "your-bot-token"

# Mini App URL
MINIAPP_URL = "https://your-username.github.io/your-repo/"
```

2. **В файле `docs/config.js`:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    key: 'your-anon-key'
};
```

### Шаг 5: Тестирование

1. **Проверка базы данных:**
```sql
-- Проверка подключения
SELECT test_connection();

-- Проверка таблиц
SELECT * FROM check_tables();

-- Проверка администраторов
SELECT * FROM admins;
```

2. **Запуск бота:**
```bash
python bot.py
```

3. **Тестирование мини-приложения:**
   - Откройте бота в Telegram
   - Нажмите кнопку "❓ Задать вопрос"
   - Проверьте, что мини-приложение открывается
   - Отправьте тестовое сообщение

## 🔧 Настройка администраторов

### Добавление нового администратора:

1. **Получение Telegram ID:**
   - Напишите [@userinfobot](https://t.me/userinfobot) в Telegram
   - Скопируйте ваш ID

2. **Добавление в базу данных:**
```sql
INSERT INTO admins (telegram_id, username) VALUES 
(YOUR_TELEGRAM_ID, 'your_username')
ON CONFLICT (telegram_id) DO NOTHING;
```

### Проверка прав администратора:
```sql
SELECT is_admin(YOUR_TELEGRAM_ID);
```

## 🐛 Устранение неполадок

### Проблема: "Connection failed"
- Проверьте правильность URL и ключа Supabase
- Убедитесь, что проект активен
- Проверьте настройки RLS

### Проблема: "Bot not found"
- Проверьте правильность Bot Token
- Убедитесь, что бот не заблокирован
- Проверьте настройки Web App

### Проблема: "Mini App not loading"
- Проверьте правильность URL в GitHub Pages
- Убедитесь, что файлы загружены в папку `/docs`
- Проверьте консоль браузера на ошибки

### Проблема: "Permission denied"
- Проверьте, что ваш ID добавлен в таблицу `admins`
- Убедитесь, что функции созданы корректно
- Проверьте политики безопасности

## 📊 Мониторинг

### Логи бота:
- Все действия бота логируются в консоль
- Ошибки сохраняются с подробным описанием

### Логи базы данных:
- В Supabase Dashboard → Logs можно просмотреть запросы
- Проверьте раздел **Database** для ошибок SQL

### Метрики:
- Количество диалогов: `SELECT COUNT(*) FROM conversations;`
- Количество сообщений: `SELECT COUNT(*) FROM messages;`
- Активные пользователи: `SELECT COUNT(DISTINCT user_id) FROM conversations;`

## 🔒 Безопасность

### Рекомендации:
1. Не публикуйте ключи в публичных репозиториях
2. Используйте переменные окружения для продакшена
3. Регулярно обновляйте зависимости
4. Мониторьте логи на подозрительную активность

### Переменные окружения (для продакшена):
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
export BOT_TOKEN="your-bot-token"
export MINIAPP_URL="https://your-username.github.io/your-repo/"
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что все шаги выполнены
3. Проверьте настройки всех сервисов
4. Обратитесь к документации Supabase и Telegram Bot API
