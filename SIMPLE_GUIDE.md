# 🎯 Простая инструкция по Context7 MCP

## Что такое Context7?
Context7 - это **инструмент для AI-ассистентов**, который дает им доступ к актуальной документации по библиотекам и фреймворкам.

## Как это работает?
1. **Вы настраиваете** Context7 в своем AI-клиенте (Cursor, Copilot, etc.)
2. **AI-ассистент** автоматически получает свежую документацию
3. **Вы получаете** точные и актуальные ответы

---

## 📱 Настройка в разных программах

### Cursor IDE
1. Откройте **Settings** (Cmd/Ctrl + ,)
2. Найдите **"MCP"** или **"Model Context Protocol"**
3. Скопируйте содержимое файла `cursor-mcp-config.json`
4. Вставьте в настройки MCP
5. Сохраните

### GitHub Copilot
1. Перейдите в **Repository → Settings → Copilot → Coding agent → MCP configuration**
2. Скопируйте содержимое файла `copilot-mcp-config.json`
3. Вставьте в настройки
4. Сохраните

### VS Code
1. Откройте **Settings** (Cmd/Ctrl + ,)
2. Найдите **"MCP"** или **"Model Context Protocol"**
3. Используйте конфигурацию из `cursor-mcp-config.json`

---

## 🚀 Как использовать

### Способ 1: Автоматически
После настройки AI-ассистент **автоматически** будет получать документацию при вопросах о:
- Библиотеках и фреймворках
- Коде и примерах
- Настройке и конфигурации

### Способ 2: Вручную
В чате с AI введите:
```
use context7
```

Затем задайте вопрос:
```
implement basic authentication with supabase
```

---

## 📝 Примеры вопросов

```
use context7
- "show me React hooks examples"
- "how to use Next.js routing"
- "MongoDB connection examples"
- "Express.js middleware tutorial"
- "Python FastAPI authentication"
- "how to deploy to Vercel"
- "Docker setup for Node.js app"
```

---

## 🔧 Устранение проблем

### Ошибка "Module Not Found"
Замените `npx` на `bunx` в конфигурации:
```json
{
  "mcpServers": {
    "context7": {
      "command": "bunx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    }
  }
}
```

### Не работает в Copilot
Используйте HTTP версию:
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "tools": ["get-library-docs", "resolve-library-id"]
    }
  }
}
```

---

## ✅ Проверка работы

После настройки задайте AI-ассистенту:
```
use context7
show me how to create a React component
```

Если AI отвечает с актуальной документацией и примерами кода - все работает!

---

## 🎯 Главное

- **НЕ нужны API ключи** от вас
- **НЕ нужно запускать сервер** вручную
- **Просто настройте** в AI-клиенте
- **Используйте** как обычный AI-ассистент

Context7 работает "под капотом" и дает AI доступ к свежей документации!
