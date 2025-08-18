
/* ====== CONFIG ====== */
const SUPABASE_URL = window.SUPABASE_URL || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";
const SUBSCRIPTIONS_TABLE = "subscriptions";
const PROMOCODES_TABLE = "promocodes";
const ADMIN_USERNAME = "@acqu1red";
const ADMIN_IDS = ["acqu1red", "123456789"]; // Добавьте сюда ID администраторов

const PAYMENT_URL = "https://acqu1red.github.io/formulaprivate/payment.html";
const ISLAND_MINIAPP_URL = "./island.html";

const MAX_DAILY_FREE = 5;
const TOTAL_QUESTS = 10; // Уменьшил до 10 квестов
const VARIATIONS_PER_QUEST = 10;

// Система рулетки
const ROULETTE_PRIZES = [
  { id: "subscription", name: "1 месяц подписки", icon: "👑", count: 3, probability: 0.03 },
  { id: "discount500", name: "Скидка 500 рублей", icon: "💰", count: 1, probability: 0.10 },
  { id: "discount100", name: "Скидка 100 рублей", icon: "💵", count: 3, probability: 0.15 },
  { id: "discount50", name: "Скидка 50 рублей", icon: "🪙", count: 4, probability: 0.20 },
  { id: "quest24h", name: "+1 открытый квест на 24ч", icon: "🎯", count: 5, probability: 0.75 },
  { id: "frodCourse", name: "ПОЛНЫЙ КУРС ПО ФРОДУ", icon: "📚", count: 1, probability: 0.0005 }
];

// Система уровней
const LEVEL_EXP = [
  100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500,
  6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000
];

// Система наград за квесты
const QUEST_REWARDS = {
  easy: { mulacoin: 1, exp: 150 },
  medium: { mulacoin: 3, exp: 500 },
  hard: { mulacoin: 5, exp: 1000 }
};

const SPIN_COST = 13;

/* ====== Telegram init ====== */
let tg = null;
function initTG(){
  try{
    tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if(tg){
      tg.expand();
      tg.enableClosingConfirmation();
      document.body.classList.add("tg-ready");
    }
  }catch(e){ console.log("TG init fail", e); }
}
initTG();

/* ====== Supabase ====== */
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* ====== Utils ====== */
const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));
const toast = (msg, type = 'info')=>{ 
  const t = $("#toast"); 
  t.textContent = msg; 
  t.className = `toast ${type}`;
  t.classList.add("show"); 
  setTimeout(()=>t.classList.remove("show"), 3000); 
};

// Система валют и уровней
let userData = {
  mulacoin: 0,
  exp: 0,
  level: 1,
  userId: null,
  lastFreeSpin: null
};

function calculateLevel(exp) {
  let level = 1;
  for (let i = 0; i < LEVEL_EXP.length; i++) {
    if (exp >= LEVEL_EXP[i]) {
      level = i + 2;
    } else {
      break;
    }
  }
  return level;
}

function getExpForNextLevel(level) {
  if (level <= LEVEL_EXP.length) {
    return LEVEL_EXP[level - 1];
  }
  return LEVEL_EXP[LEVEL_EXP.length - 1] + (level - LEVEL_EXP.length) * 1000;
}

function updateCurrencyDisplay() {
  const mulacoinEl = $("#mulacoinAmount");
  const userMulacoinEl = $("#userMulacoin");
  const levelEl = $("#currentLevel");
  const progressEl = $("#levelProgress");
  
  if (mulacoinEl) mulacoinEl.textContent = userData.mulacoin;
  if (userMulacoinEl) userMulacoinEl.textContent = userData.mulacoin;
  if (levelEl) levelEl.textContent = userData.level;
  
  const expForNext = getExpForNextLevel(userData.level);
  const currentLevelExp = userData.level > 1 ? LEVEL_EXP[userData.level - 2] : 0;
  const progress = userData.exp - currentLevelExp;
  const total = expForNext - currentLevelExp;
  
  if (progressEl) progressEl.textContent = `${progress}/${total}`;
}

function addRewards(mulacoin, exp) {
  const oldLevel = userData.level;
  
  userData.mulacoin += mulacoin;
  userData.exp += exp;
  userData.level = calculateLevel(userData.exp);
  
  updateCurrencyDisplay();
  
  // Проверяем повышение уровня
  if (userData.level > oldLevel) {
    toast(`🎉 Поздравляем! Вы достигли ${userData.level} уровня!`, 'success');
  }
  
  // Сохраняем данные
  saveUserData();
}

// Система рулетки
function createRouletteWheel() {
  const wheel = $("#rouletteWheel");
  if (!wheel) return;
  
  wheel.innerHTML = '';
  
  // Создаем секторы на основе призов
  let sectors = [];
  ROULETTE_PRIZES.forEach(prize => {
    for (let i = 0; i < prize.count; i++) {
      sectors.push(prize);
    }
  });
  
  // Перемешиваем секторы
  sectors.sort(() => Math.random() - 0.5);
  
  const sectorAngle = 360 / sectors.length;
  
  sectors.forEach((prize, index) => {
    const sector = document.createElement('div');
    sector.className = 'roulette-sector';
    sector.style.transform = `rotate(${index * sectorAngle}deg)`;
    sector.style.background = getSectorColor(prize.id);
    sector.innerHTML = `
      <div style="transform: rotate(${sectorAngle / 2}deg)">
        <div style="font-size: 16px; margin-bottom: 4px;">${prize.icon}</div>
        <div style="font-size: 8px;">${prize.name}</div>
      </div>
    `;
    sector.dataset.prize = prize.id;
    wheel.appendChild(sector);
  });
}

function getSectorColor(prizeId) {
  const colors = {
    subscription: 'linear-gradient(45deg, #FFD700, #FFA500)',
    discount500: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
    discount100: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
    discount50: 'linear-gradient(45deg, #A8E6CF, #7FCDCD)',
    quest24h: 'linear-gradient(45deg, #FFEAA7, #DDA0DD)',
    frodCourse: 'linear-gradient(45deg, #6C5CE7, #A29BFE)'
  };
  return colors[prizeId] || 'linear-gradient(45deg, #74B9FF, #0984E3)';
}

function spinRoulette() {
  const wheel = $("#rouletteWheel");
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!wheel || !spinBtn) return;
  
  // Отключаем кнопки во время вращения
  spinBtn.disabled = true;
  buyBtn.disabled = true;
  
  // Добавляем эффект нажатия
  spinBtn.style.transform = "scale(0.95)";
  spinBtn.textContent = "🎰 Крутится...";
  spinBtn.className = "btn ghost large";
  
  // Выбираем приз на основе вероятностей
  const prize = selectPrizeByProbability();
  
  // Вычисляем угол для выбранного приза
  const sectors = wheel.querySelectorAll('.roulette-sector');
  let targetSector = null;
  let targetIndex = 0;
  
  sectors.forEach((sector, index) => {
    if (sector.dataset.prize === prize.id) {
      targetSector = sector;
      targetIndex = index;
    }
  });
  
  if (!targetSector) return;
  
  const sectorAngle = 360 / sectors.length;
  const targetAngle = targetIndex * sectorAngle + sectorAngle / 2;
  const spinAngle = 360 * 8 + (360 - targetAngle); // 8 полных оборотов + до цели
  
  // Добавляем эффект свечения во время вращения
  wheel.style.boxShadow = "0 0 60px rgba(102, 247, 213, 0.8)";
  wheel.style.transition = "transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  wheel.style.transform = `rotate(${spinAngle}deg)`;
  
  setTimeout(() => {
    // Возвращаем нормальное свечение
    wheel.style.boxShadow = "0 0 40px rgba(102, 247, 213, 0.4), inset 0 0 20px rgba(0,0,0,0.3)";
    
    // Показываем кнопку "Получить приз"
    spinBtn.disabled = false;
    spinBtn.textContent = "🎁 Получить приз";
    spinBtn.className = "btn success large";
    spinBtn.style.transform = "scale(1)";
    
    // Сохраняем выбранный приз для показа
    spinBtn.dataset.prize = JSON.stringify(prize);
    
    buyBtn.disabled = false;
  }, 4000);
}

function selectPrizeByProbability() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const prize of ROULETTE_PRIZES) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      return prize;
    }
  }
  
  // Если ничего не выбрано, возвращаем самый частый приз
  return ROULETTE_PRIZES[4]; // quest24h
}

function showPrizeModal(prize) {
  const modal = $("#prizeModal");
  const icon = $("#prizeIcon");
  const title = $("#prizeTitle");
  const description = $("#prizeDescription");
  const content = $("#prizeContent");
  
  icon.textContent = prize.icon;
  title.textContent = "Поздравляем!";
  description.textContent = `Вы выиграли: ${prize.name}`;
  
  let contentHTML = '';
  
  if (prize.id === 'subscription' || prize.id.startsWith('discount')) {
    const promoCode = generatePromoCode(prize);
    contentHTML = `
      <div class="promo-code" id="promoCode" onclick="copyPromoCode()">${promoCode}</div>
      <p style="font-size: 14px; color: var(--text-muted); margin: 8px 0;">
        Нажмите на промокод, чтобы скопировать
      </p>
      <a href="https://t.me/acqu1red?text=${encodeURIComponent(getPromoMessage(prize, promoCode))}" 
         class="use-button" id="useButton" style="display: none;">
        Использовать
      </a>
    `;
  } else if (prize.id === 'quest24h') {
    contentHTML = `
      <p style="font-size: 14px; color: var(--text-muted);">
        Вам открыт дополнительный квест на 24 часа!
      </p>
    `;
    activateQuest24h();
  } else if (prize.id === 'frodCourse') {
    const promoCode = generatePromoCode(prize);
    contentHTML = `
      <div class="promo-code" id="promoCode" onclick="copyPromoCode()">${promoCode}</div>
      <p style="font-size: 14px; color: var(--text-muted); margin: 8px 0;">
        Нажмите на промокод, чтобы скопировать
      </p>
      <a href="https://t.me/acqu1red?text=${encodeURIComponent(getPromoMessage(prize, promoCode))}" 
         class="use-button" id="useButton" style="display: none;">
        Использовать
      </a>
    `;
  }
  
  content.innerHTML = contentHTML;
  modal.classList.add('show');
}

function generatePromoCode(prize) {
  const prefix = prize.id === 'subscription' ? 'SUB' : 
                prize.id === 'frodCourse' ? 'FROD' : 'DIS';
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

function getPromoMessage(prize, code) {
  const messages = {
    subscription: `🎉 Выиграл 1 месяц подписки!\n\nПромокод: ${code}\n\nДействует 30 дней.`,
    discount500: `🎉 Выиграл скидку 500 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    discount100: `🎉 Выиграл скидку 100 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    discount50: `🎉 Выиграл скидку 50 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    frodCourse: `🎉 Выиграл ПОЛНЫЙ КУРС ПО ФРОДУ!\n\nПромокод: ${code}\n\nДействует 60 дней.`
  };
  return messages[prize.id] || `Промокод: ${code}`;
}

function copyPromoCode() {
  const promoCode = $("#promoCode");
  if (!promoCode) return;
  
  const text = promoCode.textContent;
  navigator.clipboard.writeText(text).then(() => {
    promoCode.classList.add('copied');
    promoCode.textContent = 'Скопировано!';
    
    setTimeout(() => {
      promoCode.style.display = 'none';
      const useButton = $("#useButton");
      if (useButton) {
        useButton.style.display = 'inline-block';
        useButton.style.animation = 'fadeIn 0.5s ease';
      }
    }, 1000);
    
    toast('Промокод скопирован! Сохранен в Истории.', 'success');
  });
}

function activateQuest24h() {
  // Логика активации дополнительного квеста
  toast('Дополнительный квест активирован на 24 часа!', 'success');
}

function saveUserData() {
  if (userData.userId) {
    localStorage.setItem(`userData_${userData.userId}`, JSON.stringify(userData));
  }
}

function loadUserData(userId) {
  userData.userId = userId;
  const saved = localStorage.getItem(`userData_${userId}`);
  if (saved) {
    const parsed = JSON.parse(saved);
    userData = { ...userData, ...parsed };
  }
  updateCurrencyDisplay();
  updateRouletteControls();
}

function dayIndex(){ return Math.floor(Date.now() / (24*60*60*1000)); }
function variationIndex(){ return dayIndex() % VARIATIONS_PER_QUEST; }
function groupIndex(){ return dayIndex() % 2; } // 2 группы по 5 квестов

/* ====== Parallax particles ====== */
function fireflies(){
  const canvas = $("#fireflies");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let W,H; 
  function resize(){ 
    W=canvas.width=canvas.clientWidth; 
    H=canvas.height=canvas.clientHeight; 
  } 
  resize();
  window.addEventListener("resize", resize);
  
  const N = 32;
  const parts = Array.from({length:N},()=>({
    x:Math.random()*W,
    y:Math.random()*H, 
    vx:(Math.random()-.5)*.4, 
    vy:(Math.random()-.5)*.4, 
    r:1.5+Math.random()*3, 
    a:.6+Math.random()*.4 
  }));
  
  function step(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*10);
      g.addColorStop(0, `rgba(102,247,213,${0.9*p.a})`);
      g.addColorStop(1, `rgba(102,247,213,0)`);
      ctx.fillStyle=g;
      ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }
  step();
}
fireflies();

/* ====== Quests model (10 квестов) ====== */
const QUESTS = [
  { 
    id: "treasure", 
    theme: "Приключения", 
    style: "artdeco", 
    name: "Поиск сокровищ", 
    intro: "Собери карту и найди клад раньше других.", 
    description: "Исследуй загадочную карту и следуй за вспышками света, чтобы найти спрятанные сокровища.",
    type: "puzzle", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 50 },
    available: true,
    url: "quests/treasure.html"
  },
  { 
    id: "cyber", 
    theme: "Технологии", 
    style: "synthwave", 
    name: "Кибер‑взлом", 
    intro: "Подбери паттерн, чтобы открыть шлюз.", 
    description: "Взломай защищенную систему, подбирая правильные символы в нужном порядке.",
    type: "minigame", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 75 },
    available: true,
    url: "quests/cyber.html"
  },
  { 
    id: "bodylang", 
    theme: "Психология", 
    style: "neo", 
    name: "Язык тела", 
    intro: "Распознай невербальные сигналы 2D‑персонажа.", 
    description: "Анализируй выражения лица и жесты, чтобы определить эмоциональное состояние персонажа.",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 2, experience: 60 },
    available: true,
    url: "quests/bodylang.html"
  },
  { 
    id: "profiling", 
    theme: "Соцсети", 
    style: "neo", 
    name: "Профайлинг аккаунта", 
    intro: "Оцени профиль и выбери черты характера.", 
    description: "Изучи социальный профиль и определи основные черты характера пользователя.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 100 },
    available: false,
    url: "quests/profiling.html"
  },
  { 
    id: "roi", 
    theme: "Маркетинг", 
    style: "neo", 
    name: "ROI‑калькулятор", 
    intro: "Выбери кампанию с лучшей окупаемостью.", 
    description: "Проанализируй данные маркетинговых кампаний и выбери наиболее прибыльную.",
    type: "puzzle", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 80 },
    available: false,
    url: "quests/roi.html"
  },
  { 
    id: "funnel", 
    theme: "Продажи", 
    style: "neo", 
    name: "Воронка конверсий", 
    intro: "Найди самое узкое место.", 
    description: "Исследуй воронку продаж и определи, где происходят основные потери клиентов.",
    type: "puzzle", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 45 },
    available: false,
    url: "quests/funnel.html"
  },
  { 
    id: "copy", 
    theme: "Контент", 
    style: "neo", 
    name: "A/B заголовки", 
    intro: "Выбери выигравший заголовок по метрикам.", 
    description: "Сравни варианты заголовков и выбери тот, который показал лучшие результаты в A/B тесте.",
    type: "quiz", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 40 },
    available: false,
    url: "quests/copy.html"
  },
  { 
    id: "audience", 
    theme: "Демография", 
    style: "neo", 
    name: "Анализ аудитории", 
    intro: "Изучи демографические данные.", 
    description: "Изучи демографические данные аудитории и ответь на вопросы о целевой группе.",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 70 },
    available: false,
    url: "quests/audience.html"
  },
  { 
    id: "competitors", 
    theme: "Стратегия", 
    style: "neo", 
    name: "Анализ конкурентов", 
    intro: "Изучи конкурентную среду.", 
    description: "Изучи конкурентную среду и выбери наиболее сильного конкурента в отрасли.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 5, experience: 120 },
    available: false,
    url: "quests/competitors.html"
  },
  { 
    id: "trends", 
    theme: "Рынок", 
    style: "neo", 
    name: "Анализ трендов", 
    intro: "Изучи рыночные тренды.", 
    description: "Изучи рыночные тренды и выбери наиболее перспективное направление для инвестиций.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 90 },
    available: false,
    url: "quests/trends.html"
  }
];

/* ====== Subscription + Admin check ====== */
async function loadState(){
  let userId = null;
  let username = null;
  
  try{ 
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      userId = String(tg.initDataUnsafe.user.id);
      username = tg.initDataUnsafe.user.username;
    }
  } catch(e) { console.warn("TG user data fail", e); }
  
  let isSubscribed = false;
  let isAdmin = false;
  
  // Проверка на администратора
  if (username && ADMIN_IDS.includes(username)) {
    isAdmin = true;
    isSubscribed = true; // Администраторы имеют доступ ко всем квестам
  }
  
  // Проверка подписки через Supabase
  if(supabase && userId && !isAdmin){
    try{
      const { data, error } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .select("*")
        .eq("tg_id", userId)
        .maybeSingle();
      
      if(!error && data){ 
        isSubscribed = true; 
      }
    } catch(e){ 
      console.warn("supabase check fail", e); 
    }
  }
  
  return { userId, username, isSubscribed, isAdmin };
}

/* ====== Rotation + gating ====== */
function featuredQuests(state){
  if(state.isSubscribed || state.isAdmin) return QUESTS;
  // Для бесплатных пользователей показываем только доступные квесты
  return QUESTS.filter(q => q.available);
}

/* ====== Cards ====== */
function buildCards(state){
  const container = $("#quests");
  container.innerHTML = "";
  
  const list = featuredQuests(state);
  
  list.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "card fade-in";
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      ${state.isAdmin ? '<div class="premium-indicator">👑</div>' : ''}
      <div class="label">${q.theme}</div>
      <h3>${q.name}</h3>
      <div class="description">${q.description}</div>
      <div class="meta">
        <div class="tag ${q.difficulty}">${getDifficultyText(q.difficulty)}</div>
      <div class="tag">Вариация #${variationIndex()+1}/10</div>
      </div>
      <div class="cta">
        <button class="btn primary start">Начать квест</button>
        <button class="btn ghost details">Подробнее</button>
      </div>
    `;
    
    card.querySelector(".start").addEventListener("click", ()=>startQuest(q, state));
    card.querySelector(".details").addEventListener("click", ()=>{
      showQuestDetails(q, state);
    });
    
    container.appendChild(card);
  });

  // Показываем заблокированные квесты для бесплатных пользователей
  if(!state.isSubscribed && !state.isAdmin){
    const others = QUESTS.filter(q => !q.available);
    others.forEach((q, index) => {
      const card = document.createElement("div");
      card.className = "card locked fade-in";
      card.style.animationDelay = `${(list.length + index) * 0.1}s`;
      
      card.innerHTML = `
        <div class="lock">🔒 Заблокировано</div>
        <div class="label">${q.theme}</div>
        <h3>${q.name}</h3>
        <div class="description">${q.description}</div>
        <div class="tag ${q.difficulty}">${getDifficultyText(q.difficulty)}</div>
        <div class="cta">
          <button class="btn ghost" onclick="showSubscriptionPrompt()">Получить доступ</button>
        </div>
      `;
      
      container.appendChild(card);
    });
  }
}

function getDifficultyText(difficulty) {
  const texts = {
    easy: "Легкий",
    medium: "Средний", 
    hard: "Сложный"
  };
  return texts[difficulty] || difficulty;
}

function showQuestDetails(q, state) {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  modalBody.innerHTML = `
    <div class="questIntro">
      <h3>${q.name}</h3>
      <p>${q.intro}</p>
    </div>
    <div class="questBody">
      <div class="banner">
        <strong>Описание:</strong> ${q.description}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Сложность</div>
          <div style="font-weight: 600; color: var(--glow1);">${getDifficultyText(q.difficulty)}</div>
        </div>
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Фрагменты</div>
          <div style="font-weight: 600; color: var(--accent);">+${q.rewards.fragments}</div>
        </div>
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Опыт</div>
          <div style="font-weight: 600; color: var(--glow2);">+${q.rewards.experience}</div>
        </div>
      </div>
      ${!state.isSubscribed && !state.isAdmin ? `
        <div class="banner warning">
          <strong>💡 Подсказка:</strong> Подписчики получают доступ ко всем квестам и дополнительные награды!
        </div>
      ` : ''}
    </div>
    <div class="questActions">
      <button class="btn primary" onclick="startQuest('${q.id}', ${JSON.stringify(state)})">Начать квест</button>
      <button class="btn ghost" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

function showSubscriptionPrompt() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  modalBody.innerHTML = `
    <div class="questIntro">
      <h3>🔒 Доступ ограничен</h3>
      <p>Этот квест доступен только для подписчиков</p>
    </div>
    <div class="questBody">
      <div class="banner success">
        <strong>Преимущества подписки:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Доступ ко всем 10 квестам</li>
          <li>Дополнительные награды</li>
          <li>Новые вариации каждый день</li>
          <li>Приоритетная поддержка</li>
        </ul>
      </div>
    </div>
    <div class="questActions">
      <button class="btn primary" onclick="openSubscription()">Оформить подписку</button>
      <button class="btn ghost" onclick="closeModal()">Позже</button>
    </div>
  `;
  
  modal.classList.add("show");
}

function openSubscription() {
  if(tg && tg.openLink){
    tg.openLink(PAYMENT_URL, {try_instant_view:false});
  } else {
    window.open(PAYMENT_URL, "_blank");
  }
  closeModal();
}

/* ====== Start quest ====== */
function startQuest(q, state) {
  const questId = typeof q === 'string' ? q : q.id;
  const quest = QUESTS.find(q => q.id === questId);
  
  if (!quest) {
    toast("Квест не найден", "error");
    return;
  }
  
  // Проверяем доступ к квесту
  if (!state.isSubscribed && !state.isAdmin && !quest.available) {
    showSubscriptionPrompt();
    return;
  }
  
  // Открываем квест внутри Mini App
  const questUrl = `./quests/${questId}.html`;
  
  // Используем window.location.href для навигации внутри Mini App
  // tg.openLink открывает в браузере, а нам нужно остаться в Mini App
  window.location.href = questUrl;
}

/* ====== Modal functions ====== */
function closeModal() {
  const modal = $("#modal");
  modal.classList.remove("show");
}

$("#modalClose").addEventListener("click", closeModal);

// Закрытие модала по клику вне его
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});

/* ====== Promo system ====== */
function recordDayVisit(){
  const key="qh_days";
  const d = String(dayIndex());
  let set=new Set((localStorage.getItem(key)||"").split(",").filter(Boolean));
  set.add(d);
  localStorage.setItem(key, Array.from(set).join(","));
  return set.size;
}

async function maybeOfferPromo(state){
  if(state.isSubscribed || state.isAdmin) return;
  const days = recordDayVisit();
  if(days>=10){
    const claim = document.createElement("div");
    claim.className="glass success-animation";
    claim.style.margin="16px";
    claim.style.padding="20px";
    claim.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
        <h3 style="margin-bottom: 8px;">Поздравляем!</h3>
        <p>Ты открыл все квесты за 10 дней. Забери промокод на -50% (действует 60 дней).</p>
      </div>
    `;
    const btn = document.createElement("button"); 
    btn.className="btn primary"; 
    btn.textContent="Получить промокод";
    btn.style.marginTop = "12px";
    btn.onclick = async ()=>{
      const code = genCode(state.userId);
      await savePromo(code, state.userId);
      const box = document.createElement("div"); 
      box.className="banner success";
      box.innerHTML = `
        <strong>Промокод: ${code}</strong><br>
        Действует 60 дней. Напиши администратору 
        <a href="https://t.me/${ADMIN_USERNAME}" target="_blank" style="color: var(--accent);">@${ADMIN_USERNAME}</a>
      `;
      claim.appendChild(box);
    };
    claim.appendChild(btn);
    $(".app").insertAdjacentElement("afterbegin", claim);
  }
}

function genCode(uid){
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  return ("QH-"+(uid||"GUEST").slice(-4)+"-"+rand).replace(/[^A-Z0-9\-]/g,"");
}

async function savePromo(code, uid){
  if(!supabase){ 
    toast("Промокод: "+code, "success"); 
    return true; 
  }
  const expires = new Date(Date.now()+60*24*60*60*1000).toISOString();
  const { data, error } = await supabase.from(PROMOCODES_TABLE).insert({ 
    code, 
    tg_id: uid, 
    status:"unused", 
    issued_at: new Date().toISOString(), 
    expires_at: expires 
  });
  if(error){ 
    console.warn(error); 
    toast("Сохранение промокода не удалось, но код: "+code, "warning"); 
    return false; 
  }
  toast("Промокод сохранён!", "success");
  return true;
}

/* ====== Header buttons ====== */
$("#btnSubscribe").addEventListener("click", ()=>{
  window.location.href = "subscription.html";
});

$("#btnHistory").addEventListener("click", ()=>{ 
  showHistory();
});

// Обработчики рулетки
$("#spinRoulette").addEventListener("click", ()=>{
  const spinBtn = $("#spinRoulette");
  
  // Если кнопка показывает "Получить приз", показываем модальное окно
  if (spinBtn.textContent === "🎁 Получить приз") {
    const prize = JSON.parse(spinBtn.dataset.prize);
    showPrizeModal(prize);
    
    // Возвращаем кнопку в исходное состояние
    if (canSpinFree()) {
      spinBtn.textContent = "🎰 Крутить рулетку";
      spinBtn.className = "btn primary large";
    } else {
      spinBtn.textContent = "⏰ Завтра бесплатно";
      spinBtn.className = "btn ghost large";
    }
    return;
  }
  
  // Обычная логика прокрута
  if (canSpinFree()) {
    // Бесплатный прокрут
    userData.lastFreeSpin = new Date().toISOString();
    saveUserData();
    updateRouletteControls();
    spinRoulette();
  } else if (userData.mulacoin >= SPIN_COST) {
    // Платный прокрут
    userData.mulacoin -= SPIN_COST;
    updateCurrencyDisplay();
    saveUserData();
    spinRoulette();
  } else {
    toast("Недостаточно mulacoin для прокрута рулетки!", "error");
  }
});

$("#buySpin").addEventListener("click", ()=>{
  if (userData.mulacoin >= SPIN_COST) {
    userData.mulacoin -= SPIN_COST;
    updateCurrencyDisplay();
    saveUserData();
    spinRoulette();
  } else {
    toast("Недостаточно mulacoin для покупки прокрута!", "error");
  }
});

// Обработчик закрытия модала приза
$("#closePrize").addEventListener("click", ()=>{
  $("#prizeModal").classList.remove("show");
});

// Обработчик клика по уровню
$("#levelDisplay").addEventListener("click", ()=>{
  showLevelInfo();
});

function showHistory() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
      <h3 style="margin-bottom: 16px;">История прохождения</h3>
      <p style="color: var(--text-muted); margin-bottom: 20px;">
        Ваша статистика и достижения
      </p>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Валюта и опыт</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--glow1);">${userData.mulacoin}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Mulacoin</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--glow2);">${userData.exp}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Опыт</div>
          </div>
        </div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Уровень и прогресс</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent);">${userData.level}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Уровень</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--success);">${Math.min(userData.level, 5)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Бонус mulacoin</div>
          </div>
        </div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Промокоды</div>
        <p style="font-size: 12px; color: var(--text-muted);">
          Скопированные промокоды сохраняются здесь и доступны для повторного использования
        </p>
      </div>
      <button class="btn primary" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

function showLevelInfo() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  const expForNext = getExpForNextLevel(userData.level);
  const currentLevelExp = userData.level > 1 ? LEVEL_EXP[userData.level - 2] : 0;
  const progress = userData.exp - currentLevelExp;
  const total = expForNext - currentLevelExp;
  const percentage = Math.round((progress / total) * 100);
  
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
      <h3 style="margin-bottom: 16px;">Уровень ${userData.level}</h3>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Прогресс до следующего уровня</div>
        <div style="background: var(--bg1); border-radius: 4px; height: 8px; margin: 8px 0; overflow: hidden;">
          <div style="background: linear-gradient(90deg, var(--glow1), var(--glow2)); height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--glow1);">${progress} / ${total} (${percentage}%)</div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Бонусы за уровень</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Дополнительные mulacoin:</span>
            <span style="color: var(--glow1); font-weight: 600;">+${Math.min(userData.level, 5)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Шанс редких призов:</span>
            <span style="color: var(--glow2); font-weight: 600;">+${Math.min(userData.level * 2, 20)}%</span>
          </div>
        </div>
      </div>
      <button class="btn primary" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

/* ====== Init ====== */
loadState().then(state=>{
  buildCards(state);
  maybeOfferPromo(state);
  
  // Загружаем данные пользователя
  loadUserData(state.userId);
  
  // Создаем рулетку
  createRouletteWheel();
});

// Глобальные функции для доступа из других файлов
window.questSystem = {
  toast,
  closeModal,
  startQuest,
  loadState
};
