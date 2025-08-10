# Исправление GitHub Pages

## 🐛 Проблема
При открытии miniapp появлялась ошибка "File not found":
```
The site configured at this address does not contain the requested file.
```

## 🔧 Причина
GitHub Pages по умолчанию ищет `index.html` в корне репозитория, а у нас он находится в папке `docs/`.

## ✅ Решение

### 1. Исправлен GitHub Actions workflow
**Файл**: `.github/workflows/deploy-pages.yml`

**Изменение**:
```yaml
# Было:
path: '.'

# Стало:
path: './docs'
```

Теперь GitHub Actions загружает только содержимое папки `docs/` для деплоя.

### 2. Добавлен index.html в корень
**Файл**: `index.html` (в корне репозитория)

Создан файл для автоматического перенаправления на `docs/index.html`:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Перенаправление...</title>
    <meta http-equiv="refresh" content="0; url=./docs/">
</head>
<body>
    <p>Перенаправление на приложение...</p>
    <script>
        window.location.href = './docs/';
    </script>
</body>
</html>
```

## 🚀 Результат

Теперь GitHub Pages корректно:
- ✅ Находит файл `index.html` в папке `docs/`
- ✅ Деплоит только нужные файлы
- ✅ Автоматически перенаправляет с корня на приложение

## 📋 Структура для GitHub Pages

```
tourmalineGG/
├── docs/                    # ← GitHub Pages использует эту папку
│   ├── index.html          # Главная страница
│   ├── script.js           # JavaScript
│   ├── config.js           # Конфигурация
│   └── .nojekyll           # Отключает Jekyll
├── index.html              # ← Перенаправление на docs/
└── .github/workflows/      # ← Настройки деплоя
    └── deploy-pages.yml    # ← Указывает путь ./docs
```

## 🎯 Как проверить

1. **Подождите несколько минут** после push (GitHub Actions нужно время)
2. **Откройте** https://acqu1red.github.io/tourmalineGG/
3. **Должно работать** без ошибок "File not found"

Теперь miniapp должен работать корректно! 🎉
