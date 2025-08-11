# Настройка GitHub Pages для нового репозитория

## ✅ Что уже сделано

1. **Репозиторий создан**: [https://github.com/acqu1red/formulaprivate](https://github.com/acqu1red/formulaprivate)
2. **Все файлы загружены** с обновленными URL
3. **Структура файлов готова** для GitHub Pages

## 🚀 Настройка GitHub Pages

### 1. Включение GitHub Pages

1. Перейдите в репозиторий: [https://github.com/acqu1red/formulaprivate](https://github.com/acqu1red/formulaprivate)
2. Нажмите **Settings** (вкладка настроек)
3. В левом меню найдите **Pages**
4. В разделе **Source** выберите:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/docs`
5. Нажмите **Save**

### 2. Проверка работы

После настройки GitHub Pages будет доступен по адресу:
- **Главная страница**: https://acqu1red.github.io/formulaprivate/
- **Платежная страница**: https://acqu1red.github.io/formulaprivate/payment.html

### 3. Тестирование

1. **Откройте главную страницу**: https://acqu1red.github.io/formulaprivate/
2. **Проверьте админ-панель**: добавьте `?admin_conversation=123` к URL
3. **Проверьте диалоги**: добавьте `?conversation=123` к URL

## 📁 Структура файлов

```
formulaprivate/
├── docs/                    # GitHub Pages (веб-приложение)
│   ├── index.html          # Главная страница
│   ├── payment.html        # Платежная страница
│   ├── script.js           # JavaScript логика
│   ├── config.js           # Конфигурация
│   └── .nojekyll           # Отключение Jekyll
├── bot.py                  # Telegram бот
└── ...                     # Остальные файлы
```

## 🔗 Обновленные URL

Все URL в проекте теперь указывают на новый репозиторий:

- **MINIAPP_URL**: `https://acqu1red.github.io/formulaprivate/`
- **PAYMENT_MINIAPP_URL**: `https://acqu1red.github.io/formulaprivate/payment.html`
- **Уведомления**: `https://acqu1red.github.io/formulaprivate/?admin_conversation=...`
- **Диалоги**: `https://acqu1red.github.io/formulaprivate/?conversation=...`

## 🎯 Результат

После настройки GitHub Pages:
- ✅ **Miniapp работает** по новому адресу
- ✅ **Платежная система** функционирует
- ✅ **Админ-панель** доступна
- ✅ **Уведомления** отправляются с правильными ссылками

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте настройки GitHub Pages в репозитории
2. Убедитесь, что папка `/docs` выбрана как источник
3. Подождите несколько минут для развертывания
4. Проверьте консоль браузера на ошибки

GitHub Pages должен заработать в течение 5-10 минут после настройки! 🚀
