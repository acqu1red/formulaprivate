# Миграция репозитория на новый GitHub Pages

## 🔄 Что было изменено

### Старый репозиторий
- **GitHub Pages**: `https://acqu1red.github.io/tourmalineGG/`
- **Репозиторий**: `bo3333`

### Новый репозиторий
- **GitHub Pages**: `https://acqu1red.github.io/formulaprivate/`
- **Репозиторий**: `formulaprivate`

## 📝 Обновленные файлы

### 1. `bot.py`
```python
# Было
MINIAPP_URL = "https://acqu1red.github.io/tourmalineGG/"
PAYMENT_MINIAPP_URL = "https://acqu1red.github.io/tourmalineGG/payment.html"

# Стало
MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/"
PAYMENT_MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/payment.html"
```

### 2. `docs/script.js`
Обновлены 3 URL для уведомлений:
- Уведомления пользователям о новых ответах
- Уведомления администраторам о новых сообщениях
- Уведомления администраторам о вопросах на ответ

### 3. `GITHUB_PAGES_FIX.md`
- Обновлен URL в разделе "Ссылка"
- Обновлено название репозитория в структуре файлов

### 4. `ADMIN_NOTIFICATIONS.md`
- Обновлены URL в примерах кода
- Обновлен пример прямого перехода к диалогу

### 5. `REPOSITORY_CLEANUP.md`
- Обновлено название репозитория в структуре файлов

## ✅ Результат

Все ссылки в проекте теперь указывают на новый репозиторий:
- **GitHub Pages**: `https://acqu1red.github.io/formulaprivate/`
- **Платежная страница**: `https://acqu1red.github.io/formulaprivate/payment.html`
- **Админ-панель**: `https://acqu1red.github.io/formulaprivate/?admin_conversation=...`
- **Диалоги пользователей**: `https://acqu1red.github.io/formulaprivate/?conversation=...`

## 🚀 Следующие шаги

1. **Убедитесь, что новый репозиторий создан**: `https://github.com/acqu1red/formulaprivate`
2. **Загрузите все файлы в новый репозиторий**
3. **Включите GitHub Pages** в настройках репозитория
4. **Укажите папку `/docs`** как источник для GitHub Pages
5. **Протестируйте работу miniapp** по новому адресу

## 🔗 Полезные ссылки

- **Новый репозиторий**: https://github.com/acqu1red/formulaprivate
- **Новый GitHub Pages**: https://acqu1red.github.io/formulaprivate/
- **Платежная страница**: https://acqu1red.github.io/formulaprivate/payment.html

Миграция завершена успешно! 🎉
