/* ====== CONFIG ====== */
const SUPABASE_URL = window.SUPABASE_URL || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";

/* ====== Global Variables ====== */
let tg = null;
let supabase = null;
let userData = {
  telegramId: null,
  mulacoin: 0,
  level: 1,
  experience: 0
};

let currentCategory = null;
let documentsAnalyzed = 0;
let totalDocuments = 20;
let analysisScore = 0;
let currentDocumentIndex = 0;

/* ====== Document Database ====== */
const DOCUMENT_CATEGORIES = {
  media: {
    name: "Медиа Контроль",
    icon: "📺",
    documents: [
      {
        title: "Операция 'Mockingbird'",
        date: "1952-1975",
        content: `
СОВЕРШЕННО СЕКРЕТНО - ЦРУ

ОПЕРАЦИЯ "MOCKINGBIRD"

Данная операция предусматривает систематическое внедрение агентов влияния в ведущие медиа-корпорации США и Западной Европы.

ЦЕЛИ:
- Контроль информационного потока
- Формирование общественного мнения в нужном направлении
- Подавление нежелательных расследований
- Продвижение определенных политических нарративов

МЕТОДЫ:
1. Вербовка журналистов и редакторов
2. Финансирование через подставные фонды
3. Размещение подготовленных материалов
4. Цензура критических публикаций

РЕЗУЛЬТАТЫ:
На текущий момент под контролем находятся более 400 журналистов в 25 странах. Эффективность операции составляет 87%.

РЕКОМЕНДАЦИИ:
Расширить операцию на цифровые платформы и социальные сети.
        `,
        connections: ["📺 Крупные медиа-корпорации", "🏛️ Правительственные агентства", "💰 Теневые фонды"]
      },
      {
        title: "Проект 'Массовая Гипноза'",
        date: "1960-1980",
        content: `
УЛЬТРА СЕКРЕТНО - TAVISTOCK INSTITUTE

ПРОЕКТ "МАССОВАЯ ГИПНОЗА"

Исследование методов массового воздействия через телевизионные передачи и радиовещание.

ТЕХНОЛОГИИ:
- Подпороговые сообщения в рекламе
- Специальные частоты в музыке
- Нейролингвистическое программирование
- Визуальные триггеры в новостях

ЭКСПЕРИМЕНТЫ:
Тестирование проведено на аудитории в 2.3 млн человек. Показатель внушаемости увеличился на 340%.

ПРИМЕНЕНИЕ:
Методы внедрены в производство развлекательного контента крупнейших студий Голливуда.

ПОБОЧНЫЕ ЭФФЕКТЫ:
Снижение критического мышления на 45% среди регулярных зрителей.
        `,
        connections: ["🎭 Голливудские студии", "🧠 Психологические институты", "📡 Телевизионные сети"]
      }
    ]
  },
  finance: {
    name: "Финансовое Влияние",
    icon: "💰",
    documents: [
      {
        title: "План 'Золотой Удав'",
        date: "1971-настоящее время",
        content: `
СТРОГО КОНФИДЕНЦИАЛЬНО - ФЕДЕРАЛЬНАЯ РЕЗЕРВНАЯ СИСТЕМА

ОПЕРАЦИЯ "ЗОЛОТОЙ УДАВ"

Долгосрочная стратегия экономического контроля через манипулирование валютными курсами и ценами на золото.

ЭТАПЫ:
1. Отказ от золотого стандарта (1971) ✓
2. Создание нефтедоллара (1973-1975) ✓
3. Дестабилизация конкурирующих валют
4. Цифровизация финансовой системы
5. Внедрение CBDC под полным контролем

ИНСТРУМЕНТЫ:
- Координация центральных банков G7
- Манипуляции на товарных рынках
- Искусственные кризисы и "спасательные" пакеты
- Контроль рейтинговых агентств

РЕЗУЛЬТАТЫ:
Доллар США сохраняет статус мировой резервной валюты. Контроль над 78% международных резервов.

СЛЕДУЮЩИЙ ЭТАП:
Переход к цифровой валюте центрального банка (CBDC) с функцией тотального контроля транзакций.
        `,
        connections: ["🏦 Центральные банки", "🛢️ Нефтяные корпорации", "📊 Рейтинговые агентства"]
      },
      {
        title: "Досье 'Экономические Киллеры'",
        date: "1980-2010",
        content: `
СЕКРЕТНО - ВСЕМИРНЫЙ БАНК

ПРОГРАММА "ЭКОНОМИЧЕСКИХ УБИЙЦ"

Методы принуждения развивающихся стран к невыгодным экономическим соглашениям.

СТРАТЕГИЯ:
1. Завышенные прогнозы экономического роста
2. Выдача кредитов под нереалистичные проекты
3. Создание долговой зависимости
4. Требование приватизации стратегических активов

ЦЕЛИ:
- Доступ к природным ресурсам
- Геополитический контроль
- Создание рынков сбыта
- Предотвращение экономической независимости

РЕЗУЛЬТАТЫ:
Успешно обработано 47 стран. Общий объем контролируемых ресурсов: $2.4 трлн.

МЕТОДЫ ПРИНУЖДЕНИЯ:
При отказе сотрудничать - организация "цветных революций" или прямое военное вмешательство.
        `,
        connections: ["🌍 Международные банки", "⛽ Ресурсные корпорации", "🎭 НПО и фонды"]
      }
    ]
  },
  political: {
    name: "Политические Операции",
    icon: "🏛️",
    documents: [
      {
        title: "Архив 'Марионетки'",
        date: "1945-настоящее время",
        content: `
СОВЕРШЕННО СЕКРЕТНО - УПРАВЛЕНИЕ КАДРОВ

ПРОЕКТ "ПОЛИТИЧЕСКИЕ МАРИОНЕТКИ"

Система подготовки и продвижения контролируемых политических лидеров в ключевых странах мира.

ПРОГРАММА ПОДГОТОВКИ:
- Отбор перспективных кандидатов в молодом возрасте
- Обучение в элитных учебных заведениях
- Создание управляемых скандалов и компромата
- Финансовая поддержка избирательных кампаний

МЕТОДЫ КОНТРОЛЯ:
1. Финансовая зависимость
2. Компрометирующие материалы
3. Контроль ближайшего окружения
4. Угрозы безопасности семьи

ТЕКУЩИЙ СТАТУС:
Под контролем находятся:
- 23 главы государств
- 156 министров и сенаторов
- 89 губернаторов и мэров крупных городов

ОСОБЫЕ ОТМЕТКИ:
Кандидат №347 (инициалы [ЗАСЕКРЕЧЕНО]) готовится к президентской кампании 2024. Вероятность успеха: 94%.
        `,
        connections: ["🎓 Элитные университеты", "💼 Лоббистские группы", "🕴️ Спецслужбы"]
      },
      {
        title: "Досье 'Цветные Революции'",
        date: "2000-2020",
        content: `
СТРОГО КОНФИДЕНЦИАЛЬНО - ГОСУДАРСТВЕННЫЙ ДЕПАРТАМЕНТ

МАНУАЛ ПО ОРГАНИЗАЦИИ "ЦВЕТНЫХ РЕВОЛЮЦИЙ"

Стандартизированная методика смены неугодных правительств без прямого военного вмешательства.

ФАЗЫ ОПЕРАЦИИ:
1. Подготовительная (2-3 года)
   - Создание оппозиционных НПО
   - Подготовка активистов
   - Медиа-кампания дискредитации

2. Активная (3-6 месяцев)
   - Организация протестов
   - Международное давление
   - Экономические санкции

3. Завершающая (1-2 месяца)
   - Эскалация конфликта
   - Силовое принуждение к отставке
   - Установка подконтрольного правительства

УСПЕШНЫЕ ОПЕРАЦИИ:
- "Бульдозерная революция" (Сербия, 2000)
- "Революция роз" (Грузия, 2003)
- "Оранжевая революция" (Украина, 2004)
- "Арабская весна" (2010-2012)

БЮДЖЕТ: $1.2 млрд на операцию. ROI: 3400%.
        `,
        connections: ["🏛️ НПО и фонды демократии", "📺 Международные СМИ", "💰 Спонсоры оппозиции"]
      }
    ]
  },
  social: {
    name: "Социальная Инженерия",
    icon: "👥",
    documents: [
      {
        title: "Проект 'Разделяй и Властвуй'",
        date: "1990-настоящее время",
        content: `
КОНФИДЕНЦИАЛЬНО - ЦЕНТР СОЦИАЛЬНЫХ ИССЛЕДОВАНИЙ

ПРОГРАММА "РАЗДЕЛЯЙ И ВЛАСТВУЙ"

Систематическое углубление социальных противоречий для предотвращения консолидации общества против элиты.

НАПРАВЛЕНИЯ РАБОТЫ:
1. Расовые и этнические конфликты
2. Гендерные противоречия
3. Религиозные разногласия
4. Поколенческие конфликты
5. Классовая вражда

ИНСТРУМЕНТЫ:
- Финансирование радикальных движений с обеих сторон
- Провокации и инсценировки
- Медиа-накачка противоречий
- Создание искусственных проблем

ЦЕЛИ:
- Отвлечение от реальных проблем власти
- Предотвращение единства народа
- Оправдание усиления контроля
- Снижение политической активности

ЭФФЕКТИВНОСТЬ:
Уровень социальной фрагментации увеличился на 267% за последние 20 лет. Политическая активность снизилась на 43%.
        `,
        connections: ["📱 Социальные сети", "🎭 Активистские группы", "📺 Медиа-платформы"]
      },
      {
        title: "Досье 'Цифровое Стадо'",
        date: "2010-настоящее время",
        content: `
СЕКРЕТНО - BIG TECH КОНСОРЦИУМ

ОПЕРАЦИЯ "ЦИФРОВОЕ СТАДО"

Создание системы тотального цифрового контроля через социальные платформы и мобильные приложения.

КОМПОНЕНТЫ СИСТЕМЫ:
1. Сбор персональных данных (100% покрытие)
2. Анализ поведенческих паттернов
3. Предиктивное моделирование
4. Персонализированное воздействие
5. Социальный кредит

АЛГОРИТМЫ ВЛИЯНИЯ:
- Кастомизированные новостные ленты
- Таргетированная реклама убеждений
- Эмоциональные триггеры в контенте
- Создание эхо-камер мнений

ДОСТИЖЕНИЯ:
- 4.2 млрд пользователей под наблюдением
- Точность предсказания поведения: 89%
- Эффективность воздействия: 76%

СЛЕДУЮЩИЙ ЭТАП:
Интеграция с системой социального кредита и цифровой валютой для полного контроля.
        `,
        connections: ["📱 IT-корпорации", "🔍 Алгоритмы ИИ", "🏛️ Правительственные программы"]
      }
    ]
  }
};

/* ====== Utility Functions ====== */
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function toast(message, type = 'info') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ====== Telegram Integration ====== */
function initTG() {
  try {
    tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if (tg) {
      tg.expand();
      tg.enableClosingConfirmation();
      
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userData.telegramId = tg.initDataUnsafe.user.id;
        console.log('Telegram ID получен:', userData.telegramId);
      }
    }
  } catch (e) {
    console.log("TG init fail", e);
  }
}

/* ====== Supabase Integration ====== */
async function initSupabase() {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase инициализирован');
    return true;
  } catch (error) {
    console.error('Ошибка инициализации Supabase:', error);
    return false;
  }
}

async function loadUserData(telegramId) {
  if (!supabase || !telegramId) return;
  
  try {
    const { data, error } = await supabase
      .from('bot_user')
      .select('*')
      .eq('telegram_id', String(telegramId))
      .single();
    
    if (!error && data) {
      userData.mulacoin = data.mulacoin || 0;
      userData.level = data.level || 1;
      userData.experience = data.experience || 0;
      updateUI();
      console.log('Данные пользователя загружены:', userData);
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error);
  }
}

async function updateUserData(updates) {
  if (!supabase || !userData.telegramId) return;
  
  try {
    const { error } = await supabase
      .from('bot_user')
      .update(updates)
      .eq('telegram_id', String(userData.telegramId));
    
    if (error) {
      console.error('Ошибка обновления данных:', error);
    } else {
      Object.assign(userData, updates);
      updateUI();
    }
  } catch (error) {
    console.error('Ошибка обновления данных пользователя:', error);
  }
}

/* ====== UI Functions ====== */
function updateUI() {
  const mulacoinAmount = $('#mulacoinAmount');
  if (mulacoinAmount) {
    mulacoinAmount.textContent = userData.mulacoin || 0;
  }
  
  updateProgress();
}

function updateProgress() {
  const progressFill = $('#progressFill');
  const progressPercentage = $('#progressPercentage');
  const documentsCount = $('#documentsCount');
  
  const percentage = Math.round((documentsAnalyzed / totalDocuments) * 100);
  
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  
  if (progressPercentage) {
    progressPercentage.textContent = `${percentage}%`;
  }
  
  if (documentsCount) {
    documentsCount.textContent = `${documentsAnalyzed}/${totalDocuments}`;
  }
}

/* ====== Game Logic ====== */
function selectCategory(category) {
  currentCategory = category;
  currentDocumentIndex = 0;
  
  // Hide archive section, show document viewer
  $('.archive-section').style.display = 'none';
  $('#documentViewer').style.display = 'block';
  
  loadDocument();
}

function loadDocument() {
  if (!currentCategory || !DOCUMENT_CATEGORIES[currentCategory]) return;
  
  const documents = DOCUMENT_CATEGORIES[currentCategory].documents;
  const document = documents[currentDocumentIndex];
  
  if (!document) {
    // No more documents in this category
    completeCategory();
    return;
  }
  
  // Update document info
  $('#documentTitle').textContent = document.title;
  $('#documentDate').textContent = `Дата классификации: ${document.date}`;
  $('#documentText').innerHTML = document.content.replace(/\n/g, '<br>');
  
  // Show document viewer
  $('#documentViewer').style.display = 'block';
  $('#analysisSection').style.display = 'none';
  
  toast(`Загружен документ: ${document.title}`, 'info');
}

function analyzeDocument() {
  if (!currentCategory || !DOCUMENT_CATEGORIES[currentCategory]) return;
  
  const documents = DOCUMENT_CATEGORIES[currentCategory].documents;
  const document = documents[currentDocumentIndex];
  
  if (!document) return;
  
  // Calculate analysis score (random with some logic)
  const baseScore = 60 + Math.random() * 30; // 60-90%
  const bonus = analysisScore > 80 ? 10 : 0; // Bonus for previous good analyses
  analysisScore = Math.min(95, Math.round(baseScore + bonus));
  
  // Generate analysis text
  const analysisTexts = [
    `Документ "${document.title}" содержит критически важную информацию о механизмах контроля. Выявлены прямые связи с операциями глобальной элиты.`,
    `Анализ показывает высокую степень координации между различными структурами власти. Обнаружены доказательства долгосрочного планирования.`,
    `Документ подтверждает существование систематических операций по манипулированию общественным мнением и политическими процессами.`,
    `Выявлены ключевые персоналии и организации, участвующие в реализации планов мирового правительства.`
  ];
  
  const randomText = analysisTexts[Math.floor(Math.random() * analysisTexts.length)];
  
  // Show analysis section
  $('#analysisSection').style.display = 'block';
  $('#analysisScore').textContent = `${analysisScore}%`;
  $('#analysisText').textContent = randomText;
  
  // Load connections
  const connectionsGrid = $('#connectionsGrid');
  connectionsGrid.innerHTML = '';
  
  document.connections.forEach(connection => {
    const connectionDiv = document.createElement('div');
    connectionDiv.className = 'connection-item';
    connectionDiv.innerHTML = `
      <span class="connection-icon">${connection.split(' ')[0]}</span>
      ${connection.substring(2)}
    `;
    connectionsGrid.appendChild(connectionDiv);
  });
  
  toast('Анализ документа завершен!', 'success');
}

function nextDocument() {
  currentDocumentIndex++;
  loadDocument();
}

function completeAnalysis() {
  documentsAnalyzed++;
  
  // Add experience and score
  const expGain = 50 + (analysisScore > 80 ? 25 : 0);
  updateUserData({ experience: userData.experience + expGain });
  
  updateProgress();
  
  // Check if quest is complete
  if (documentsAnalyzed >= totalDocuments) {
    completeQuest();
  } else {
    // Go back to category selection
    $('#documentViewer').style.display = 'none';
    $('#analysisSection').style.display = 'none';
    $('.archive-section').style.display = 'block';
    
    toast(`+${expGain} опыта! Документов проанализировано: ${documentsAnalyzed}/${totalDocuments}`, 'success');
  }
}

function continueInvestigation() {
  nextDocument();
}

function completeCategory() {
  // Go back to category selection
  $('#documentViewer').style.display = 'none';
  $('#analysisSection').style.display = 'none';
  $('.archive-section').style.display = 'block';
  
  toast('Все документы в категории изучены. Выберите другую категорию.', 'info');
}

function completeQuest() {
  // Show success modal
  $('#successModal').classList.add('show');
  
  // Give final rewards
  const finalRewards = {
    mulacoin: userData.mulacoin + 5,
    experience: userData.experience + 1000
  };
  
  updateUserData(finalRewards);
  
  toast('Квест завершен! Все секреты раскрыты!', 'success');
}

function claimRewards() {
  $('#successModal').classList.remove('show');
  
  // Navigate back to quests
  setTimeout(() => {
    window.location.href = '../quests.html';
  }, 500);
}

function closeViewer() {
  $('#documentViewer').style.display = 'none';
  $('#analysisSection').style.display = 'none';
  $('.archive-section').style.display = 'block';
}

function goBackToQuests() {
  window.location.href = '../quests.html';
}

/* ====== Event Listeners ====== */
function bindEvents() {
  // Back button
  $('#backToQuests')?.addEventListener('click', goBackToQuests);
  
  // Category selection
  $$('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      selectCategory(category);
    });
  });
  
  // Document actions
  $('#closeViewer')?.addEventListener('click', closeViewer);
  $('#analyzeDocument')?.addEventListener('click', analyzeDocument);
  $('#nextDocument')?.addEventListener('click', nextDocument);
  
  // Analysis actions
  $('#completeAnalysis')?.addEventListener('click', completeAnalysis);
  $('#continueInvestigation')?.addEventListener('click', continueInvestigation);
  
  // Success modal
  $('#claimRewards')?.addEventListener('click', claimRewards);
  
  // Close modal by clicking outside
  $('#successModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
      $('#successModal').classList.remove('show');
    }
  });
}

/* ====== Initialization ====== */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Архивы Контроля загружаются...');
  
  // Initialize Telegram
  initTG();
  
  // Initialize Supabase
  await initSupabase();
  
  // Load user data
  if (userData.telegramId) {
    await loadUserData(userData.telegramId);
  }
  
  // Bind events
  bindEvents();
  
  // Update UI
  updateUI();
  
  console.log('Архивы Контроля готовы к использованию');
  toast('Добро пожаловать в секретные архивы...', 'info');
});
