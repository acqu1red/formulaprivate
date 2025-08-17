# Formula Private - Остров Архив

🏝️ Интерактивный Telegram Mini App с красивым визуалом, микро-играми и системой сбора фрагментов для доступа к эксклюзивному контенту.

## 🎮 Особенности

- **Красивый визуал**: Neo-Solarpunk дизайн с glassmorphism, неоновыми эффектами и параллаксом
- **Интерактивные хотспоты**: Tap/hold механики и мини-игры (20-30% от общего количества)
- **Система прогресса**: Сбор фрагментов для разблокировки книг
- **Микро-игры**: Holo-Ripple Sync, Glyph Dial, Constellation Trace
- **Ежедневные награды**: Streak система с бонусами
- **Реферальная система**: Приглашение друзей с наградами
- **Мульти-скины**: Neo-Solarpunk, Art-Deco Nocturne, Retro-Synthwave
- **Telegram интеграция**: Полная поддержка WebApp API

## 🏗️ Архитектура

```
apps/
├── webapp/          # React + Vite + TypeScript фронтенд
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── lib/          # Утилиты (Telegram, API, Audio)
│   │   ├── store/        # Zustand store
│   │   └── types/        # TypeScript типы
│   └── island.html       # Центральный HTML для GitHub Pages
└── server/          # Node.js + Express + Prisma бэкенд
    ├── src/
    │   ├── routes/       # API роуты
    │   ├── middleware/   # Аутентификация
    │   ├── lib/          # Утилиты
    │   └── bot/          # Telegram бот
    └── prisma/           # База данных
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm 8+
- Git

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/acqu1red/formulaprivate.git
cd formulaprivate
```

2. **Установите зависимости**
```bash
pnpm install
```

3. **Настройте окружение**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. **Настройте базу данных**
```bash
cd apps/server
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. **Запустите в режиме разработки**
```bash
# В корневой папке
pnpm dev
```

Это запустит:
- Фронтенд на http://localhost:3000
- Бэкенд на http://localhost:3001
- Telegram бота (если настроен BOT_TOKEN)

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `env.example`:

```env
# База данных
DATABASE_URL="file:./dev.db"

# Telegram Bot
BOT_TOKEN="your_bot_token_here"
CHANNEL_ID="-1001234567890"

# JWT
JWT_SECRET="your_jwt_secret_here"

# Конфигурация приложения
PUBLIC_BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# Окружение
NODE_ENV="development"
PORT=3001

# URL для GitHub Pages
ISLAND_URL="https://acqu1red.github.io/formulaprivate/island.html"
```

### Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env`
3. Настройте WebApp URL в BotFather:
   ```
   /setmenubutton
   URL: https://acqu1red.github.io/formulaprivate/island.html
   ```

## 🎨 Скины и визуал

### Neo-Solarpunk (по умолчанию)
- Цвета: бирюзовый (#66F7D5), лавандовый (#A6B4FF), мёд (#FFE27A)
- Стиль: Природа + технологии, glassmorphism
- Шрифты: Inter Tight, Inter

### Art-Deco Nocturne
- Цвета: золотой (#FFD700), тёмно-синий (#1A1A2E)
- Стиль: Геометрические орнаменты, вертикальные линии
- Шрифты: Cormorant Garamond

### Retro-Synthwave
- Цвета: пурпур (#FF00FF), циан (#00FFFF), жёлтый (#FFFF00)
- Стиль: 80s ретро, сетка, глитч-эффекты
- Шрифты: Orbitron

## 🎮 Микро-игры

### Holo-Ripple Sync
- **Механика**: Тап в центр при совпадении волны с целью
- **Время**: 20 секунд
- **Награда**: 5 фрагментов + шанс золотого

### Glyph Dial
- **Механика**: Поворот кольца до подсвеченного сектора
- **Время**: 20 секунд
- **Награда**: 4 фрагмента + шанс золотого

### Constellation Trace
- **Механика**: Проведение линии через звёзды
- **Время**: 20 секунд
- **Награда**: 6 фрагментов + шанс золотого

## 📱 Развёртывание

### GitHub Pages

1. **Соберите для GitHub Pages**
```bash
cd apps/webapp
pnpm build:ghpages
```

2. **Загрузите в репозиторий**
```bash
# Скопируйте содержимое dist-ghpages/ в ветку gh-pages
# или в папку /docs вашего репозитория
```

3. **Настройте GitHub Pages**
- Включите GitHub Pages в настройках репозитория
- Укажите папку с собранными файлами
- URL будет: `https://acqu1red.github.io/formulaprivate/island.html`

### Продакшн сервер

1. **Соберите приложения**
```bash
pnpm build
```

2. **Настройте переменные окружения для продакшна**
```env
NODE_ENV="production"
DATABASE_URL="postgresql://..."
PUBLIC_BASE_URL="https://your-domain.com"
```

3. **Запустите сервер**
```bash
pnpm start
```

## 🔧 Разработка

### Структура проекта

```
src/
├── components/          # React компоненты
│   ├── MapScene.tsx     # Главная сцена острова
│   ├── HotspotButton.tsx # Интерактивные хотспоты
│   ├── MinigameModal.tsx # Модальные окна игр
│   ├── TopPanel.tsx     # Верхняя панель
│   └── ...
├── lib/                 # Утилиты
│   ├── telegram.ts      # Telegram WebApp API
│   ├── api.ts          # API клиент
│   └── audio.ts        # Аудио менеджер
├── store/              # Zustand store
└── types/              # TypeScript типы
```

### Добавление новых скинов

1. Добавьте цвета в `tailwind.config.js`
2. Создайте CSS переменные в `index.css`
3. Добавьте ассеты в `src/assets/skins/`
4. Обновите компонент Settings

### Добавление новых мини-игр

1. Создайте компонент игры в `MinigameModal.tsx`
2. Добавьте тип в `types/index.ts`
3. Обновите логику в `MapScene.tsx`

## 📊 API Endpoints

### Аутентификация
- `POST /auth/validate` - Валидация initData

### Конфигурация
- `GET /config` - Получение конфигурации приложения

### Прогресс
- `GET /progress` - Получение прогресса пользователя
- `POST /progress/collect` - Сбор фрагмента

### Награды
- `POST /rewards/daily` - Получение ежедневной награды

### Подписка
- `GET /subscription/status` - Статус подписки
- `POST /subscription/check` - Проверка платежа

### Членство
- `POST /membership/invite` - Создание инвайт-ссылки

### Посты
- `GET /posts/teaser/:bookId` - Тизер книги

## 🤝 Реферальная система

- Пользователи получают уникальный код при регистрации
- При переходе по ссылке `?start=ref_CODE` новый пользователь привязывается к рефереру
- Реферер получает +1 к streak при первом входе приглашённого

## 🎵 Аудио

- Звуковые эффекты для всех действий
- Автоматическое отключение при отсутствии user gesture
- Fallback на Web Audio API осцилляторы
- Настройка громкости в Settings

## 🔒 Безопасность

- HMAC валидация initData от Telegram
- JWT токены для аутентификации
- Rate limiting на сбор фрагментов
- Валидация всех входных данных

## 📈 Производительность

- Оптимизированные ассеты (WebP/AVIF)
- Lazy loading компонентов
- RequestAnimationFrame для анимаций
- Поддержка prefers-reduced-motion

## 🐛 Отладка

### Логи
```bash
# Фронтенд
cd apps/webapp
pnpm dev

# Бэкенд
cd apps/server
pnpm dev
```

### База данных
```bash
cd apps/server
pnpm db:studio  # Открыть Prisma Studio
```

## 📄 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

- Telegram: [@acqu1red](https://t.me/acqu1red)
- GitHub Issues: [Создать issue](https://github.com/acqu1red/formulaprivate/issues)

---

**Formula Private - Остров Архив** 🏝️✨
