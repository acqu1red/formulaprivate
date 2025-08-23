/* ====== CONFIG ====== */
const SUPABASE_URL = window.SUPABASE_URL || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";

const SPIN_COST = 13;

// Epstein Case Prizes with conspiracy theme
const CASE_PRIZES = [
  { id: "classified_docs", name: "Засекреченные Документы", icon: "📄", probability: 0.25 },
  { id: "island_map", name: "Карта Острова", icon: "🗺️", probability: 0.20 },
  { id: "golden_key", name: "Золотой Ключ", icon: "🗝️", probability: 0.15 },
  { id: "surveillance_footage", name: "Записи Наблюдения", icon: "📹", probability: 0.12 },
  { id: "secret_contacts", name: "Тайные Контакты", icon: "📱", probability: 0.10 },
  { id: "illuminati_symbol", name: "Символ Иллюминатов", icon: "🔺", probability: 0.08 },
  { id: "flight_logs", name: "Журналы Полетов", icon: "✈️", probability: 0.06 },
  { id: "blackmail_evidence", name: "Компромат", icon: "💾", probability: 0.03 },
  { id: "epstein_diary", name: "Дневник Эпштейна", icon: "📖", probability: 0.01 }
];

/* ====== Global Variables ====== */
let tg = null;
let supabase = null;
let userData = {
  telegramId: null,
  mulacoin: 0,
  level: 1,
  experience: 0
};

let currentRoulettePosition = 0;
let isSpinning = false;

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
      document.body.classList.add("tg-ready");
      
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

/* ====== UI Updates ====== */
function updateUI() {
  const mulacoinAmount = $('#mulacoinAmount');
  if (mulacoinAmount) {
    mulacoinAmount.textContent = userData.mulacoin || 0;
  }
}

/* ====== Case Roulette Functions ====== */
function createCaseRoulette() {
  const container = $('#rouletteItems');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Create multiple sets of prizes for smooth scrolling
  const totalItems = 50;
  const prizeSet = [];
  
  // Fill prize set based on probabilities
  CASE_PRIZES.forEach(prize => {
    const count = Math.max(1, Math.floor(prize.probability * totalItems));
    for (let i = 0; i < count; i++) {
      prizeSet.push(prize);
    }
  });
  
  // Shuffle the prizes
  for (let i = prizeSet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prizeSet[i], prizeSet[j]] = [prizeSet[j], prizeSet[i]];
  }
  
  // Create roulette items
  prizeSet.forEach((prize, index) => {
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.dataset.prize = prize.id;
    item.innerHTML = prize.icon;
    item.title = prize.name;
    container.appendChild(item);
  });
  
  console.log('Кейс рулетка создана с', prizeSet.length, 'призами');
}

function spinCaseRoulette(isFree = false) {
  if (isSpinning) return;
  
  if (!isFree && userData.mulacoin < SPIN_COST) {
    toast('Недостаточно MULACOIN для прокрутки!', 'error');
    return;
  }
  
  isSpinning = true;
  const spinBtn = $('#spinCase');
  const buySpinBtn = $('#buySpinCase');
  
  // Disable buttons
  spinBtn.disabled = true;
  buySpinBtn.disabled = true;
  spinBtn.textContent = 'Крутим...';
  
  // Deduct cost
  if (!isFree) {
    updateUserData({ mulacoin: userData.mulacoin - SPIN_COST });
  }
  
  // Play sound
  const music = $('#caseSpinMusic');
  if (music) {
    music.currentTime = 0;
    music.play().catch(e => console.log('Audio play failed:', e));
  }
  
  // Calculate spin distance
  const items = $$('.roulette-item');
  if (items.length === 0) return;
  
  const itemWidth = 100; // width + gap
  const visibleWidth = 400;
  const centerOffset = visibleWidth / 2;
  
  // Random spin (3-8 full rotations + random position)
  const rotations = 3 + Math.random() * 5;
  const finalPosition = Math.random() * items.length;
  const spinDistance = (rotations * items.length + finalPosition) * itemWidth;
  
  currentRoulettePosition -= spinDistance;
  
  const rouletteItems = $('#rouletteItems');
  rouletteItems.classList.add('spinning');
  rouletteItems.style.transform = `translateX(${currentRoulettePosition}px)`;
  
  // Determine winner after spin
  setTimeout(() => {
    const winningPrize = selectPrizeByPosition(finalPosition, items);
    showCasePrize(winningPrize);
    
    // Reset buttons
    isSpinning = false;
    spinBtn.disabled = false;
    buySpinBtn.disabled = false;
    spinBtn.innerHTML = '<span class="btn-icon">🎯</span><span class="btn-text">Крутить Кейс</span>';
    
    rouletteItems.classList.remove('spinning');
  }, 4000);
}

function selectPrizeByPosition(position, items) {
  const index = Math.floor(position) % items.length;
  const prizeId = items[index].dataset.prize;
  return CASE_PRIZES.find(p => p.id === prizeId);
}

function showCasePrize(prize) {
  const modal = $('#prizeModal');
  const icon = $('#prizeIcon');
  const title = $('#prizeTitle');
  const description = $('#prizeDescription');
  const details = $('#prizeDetails');
  
  icon.textContent = prize.icon;
  title.textContent = 'Тайный Артефакт Найден!';
  description.textContent = `Вы обнаружили: ${prize.name}`;
  
  // Create conspiracy-themed description
  const descriptions = {
    classified_docs: "Секретные документы, раскрывающие связи между мировыми лидерами и теневыми организациями.",
    island_map: "Детальная карта острова с отмеченными секретными помещениями и подземными туннелями.",
    golden_key: "Золотой ключ от сейфа с компрометирующими материалами на влиятельных персон.",
    surveillance_footage: "Записи скрытых камер с доказательствами тайных встреч и сделок.",
    secret_contacts: "Зашифрованные контакты агентов влияния в правительствах разных стран.",
    illuminati_symbol: "Древний символ тайного общества, дающий доступ к эксклюзивной информации.",
    flight_logs: "Полные журналы частных перелетов с именами пассажеров и секретными маршрутами.",
    blackmail_evidence: "Компрометирующие материалы на высокопоставленных чиновников и бизнесменов.",
    epstein_diary: "Личный дневник с записями о встречах и планах мирового правительства."
  };
  
  details.innerHTML = `
    <div style="background: rgba(255, 215, 0, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid var(--conspiracy);">
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.5;">
        ${descriptions[prize.id] || "Таинственный артефакт из коллекции Эпштейна."}
      </p>
    </div>
    <div style="color: var(--conspiracy); font-weight: 600; margin-top: 16px;">
      🏆 +25 опыта получено!
    </div>
  `;
  
  modal.classList.add('show');
  
  // Save prize to history and give experience
  saveCasePrize(prize);
  updateUserData({ experience: userData.experience + 25 });
}

async function saveCasePrize(prize) {
  if (!supabase || !userData.telegramId) return;
  
  try {
    await supabase
      .from('roulette_history')
      .insert({
        user_id: userData.telegramId,
        prize_id: prize.id,
        prize_name: prize.name,
        won_at: new Date().toISOString(),
        source: 'epstein_case'
      });
  } catch (error) {
    console.error('Ошибка сохранения приза:', error);
  }
}

/* ====== Modal Functions ====== */
function showPrizesModal() {
  const modal = $('#prizesModal');
  const grid = $('#prizesGrid');
  
  grid.innerHTML = '';
  
  CASE_PRIZES.forEach(prize => {
    const item = document.createElement('div');
    item.className = 'prize-item';
    item.innerHTML = `
      <div class="prize-item-icon">${prize.icon}</div>
      <div class="prize-item-name">${prize.name}</div>
    `;
    grid.appendChild(item);
  });
  
  modal.classList.add('show');
}

async function showHistoryModal() {
  const modal = $('#historyModal');
  const content = $('#historyContent');
  
  if (!supabase || !userData.telegramId) {
    content.innerHTML = '<p style="text-align: center; color: var(--text-muted);">История недоступна</p>';
    modal.classList.add('show');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('roulette_history')
      .select('*')
      .eq('user_id', userData.telegramId)
      .eq('source', 'epstein_case')
      .order('won_at', { ascending: false })
      .limit(20);
    
    if (error) {
      content.innerHTML = '<p style="text-align: center; color: var(--error);">Ошибка загрузки истории</p>';
    } else if (!data || data.length === 0) {
      content.innerHTML = '<p style="text-align: center; color: var(--text-muted);">История пуста. Попробуйте прокрутить кейс!</p>';
    } else {
      content.innerHTML = `
        <div style="display: grid; gap: 12px;">
          ${data.map(item => {
            const prize = CASE_PRIZES.find(p => p.id === item.prize_id);
            const date = new Date(item.won_at).toLocaleString('ru-RU');
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--glass); border: 1px solid var(--border); border-radius: 8px;">
                <div style="font-size: 24px;">${prize ? prize.icon : '🎁'}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--text);">${item.prize_name}</div>
                  <div style="font-size: 12px; color: var(--text-muted);">${date}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
    content.innerHTML = '<p style="text-align: center; color: var(--error);">Ошибка загрузки истории</p>';
  }
  
  modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = $(modalId);
  if (modal) {
    modal.classList.remove('show');
  }
}

/* ====== Page Transition ====== */
function hidePageTransition() {
  const transition = $('#pageTransition');
  setTimeout(() => {
    transition.classList.add('hidden');
  }, 1000);
}

function goBackToQuests() {
  const transition = $('#pageTransition');
  transition.classList.remove('hidden');
  
  setTimeout(() => {
    window.location.href = './quests.html';
  }, 500);
}

/* ====== Event Listeners ====== */
function bindEvents() {
  // Back button
  $('#backToQuests')?.addEventListener('click', goBackToQuests);
  
  // Case controls
  $('#spinCase')?.addEventListener('click', () => spinCaseRoulette(true));
  $('#buySpinCase')?.addEventListener('click', () => spinCaseRoulette(false));
  $('#showPrizes')?.addEventListener('click', showPrizesModal);
  $('#showHistory')?.addEventListener('click', showHistoryModal);
  
  // Modal controls
  $('#closePrizesModal')?.addEventListener('click', () => closeModal('#prizesModal'));
  $('#closeHistoryModal')?.addEventListener('click', () => closeModal('#historyModal'));
  $('#closePrize')?.addEventListener('click', () => closeModal('#prizeModal'));
  
  // Close modals by clicking outside
  $$('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
}

/* ====== Initialization ====== */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Кейс Эпштейна загружается...');
  
  // Initialize Telegram
  initTG();
  
  // Initialize Supabase
  await initSupabase();
  
  // Load user data
  if (userData.telegramId) {
    await loadUserData(userData.telegramId);
  }
  
  // Create roulette
  createCaseRoulette();
  
  // Bind events
  bindEvents();
  
  // Hide page transition
  hidePageTransition();
  
  // Update UI
  updateUI();
  
  console.log('Кейс Эпштейна готов к использованию');
  toast('Добро пожаловать в тайную лабораторию...', 'success');
});
