// ============================================
// POLUVANNYA — Space Bounty Hunter Game
// Broken Reality theme
// ============================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ============================================
// GAME STATES
// ============================================
const STATES = {
  SLOT_SELECT: 'slot_select',
  INTRO: 'intro',
  HQ: 'hq',
  MISSION_BRIEF: 'mission_brief',
  SHIP: 'ship',
  HUNT: 'hunt',
  DIALOGUE: 'dialogue',
  REWARD: 'reward',
  SHOP: 'shop',
  PUZZLE: 'puzzle',
  ENDING: 'ending',
  LANDING: 'landing',
  DEATH: 'death'
};

let gameState = STATES.SLOT_SELECT;
let prevTime = 0;
let deltaTime = 0;

// ============================================
// INPUT SYSTEM
// ============================================
const keys = {};
let mouseX = 0, mouseY = 0;
let mouseClicked = false;
let keyJustPressed = {};

document.addEventListener('keydown', e => {
  if (!keys[e.code]) keyJustPressed[e.code] = true;
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});
document.addEventListener('keyup', e => {
  keys[e.code] = false;
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  mouseClicked = true;
});

// ============================================
// SOUND SYSTEM (Web Audio API)
// ============================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime;

  switch (type) {
    case 'shoot':
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
      break;
    case 'explosion':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
      break;
    case 'hit':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
      break;
    case 'beep':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
      break;
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.start(t);
      osc.stop(t + 0.03);
      break;
    case 'glitch':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(Math.random() * 2000 + 100, t);
      osc.frequency.setValueAtTime(Math.random() * 2000 + 100, t + 0.05);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
      break;
    case 'alarm':
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
      break;
  }
}

// ============================================
// SAVE SYSTEM (3 slots)
// ============================================
function createNewSave() {
  return {
    missionNumber: 0,
    credits: 0,
    baseLevel: 1,
    // Player stats
    playerHP: 100,
    playerMaxHP: 100,
    playerSpeed: 3,
    hpLevel: 1,
    speedLevel: 1,
    // Ship stats
    shipHP: 80,
    shipMaxHP: 80,
    shipSpeed: 3,
    shipDamage: 10,
    shipBullets: 1,
    shipHPLevel: 1,
    shipSpeedLevel: 1,
    shipDamageLevel: 1,
    shipBulletsLevel: 1,
    // Weapons
    weapons: [{ type: 'pistol', level: 1 }],
    activeWeapon: 0,
    // Abilities
    abilities: {},
    // Items
    hasInsurance: false,
    miniMapLevel: 0, // 0=none, 1=basic, 2=upgraded
    // Cosmetics
    shipSkin: 'default',
    playerSkin: 'default',
    hqDecor: 'default',
    // Story
    collectedPhrases: [],
    crueltyRating: 0,
    secretRoomFound: false,
    endingsReached: [],
    // Tutorial
    tutorialShown: {
      move: false,
      interact: false,
      shoot: false,
      weapon: false
    }
  };
}

let saves = [null, null, null];
let currentSlot = -1;
let save = null;

function loadSaves() {
  try {
    const data = localStorage.getItem('poluvannya_saves');
    if (data) saves = JSON.parse(data);
  } catch (e) {
    saves = [null, null, null];
  }
}

function saveToDisk() {
  saves[currentSlot] = save;
  localStorage.setItem('poluvannya_saves', JSON.stringify(saves));
}

function deleteSave(slot) {
  saves[slot] = null;
  localStorage.setItem('poluvannya_saves', JSON.stringify(saves));
}

loadSaves();

// ============================================
// MISSIONS DATA
// ============================================
const MISSIONS = [
  { name: 'Тінь на Кеплері', enemies: 2, bossHP: 80, reward: 150, bossAbility: null },
  { name: 'Втікач зі Станції', enemies: 3, bossHP: 120, reward: 200, bossAbility: null },
  { name: 'Привид Андромеди', enemies: 3, bossHP: 160, reward: 300, bossAbility: null },
  { name: 'Протокол Омега', enemies: 4, bossHP: 200, reward: 400, bossAbility: 'teleport' },
  { name: 'Сигнал з Оріона', enemies: 4, bossHP: 220, reward: 450, bossAbility: 'shield' },
  { name: 'Мертва Зона', enemies: 4, bossHP: 240, reward: 500, bossAbility: 'summon' },
  { name: 'Тіні Юпітера', enemies: 5, bossHP: 280, reward: 600, bossAbility: 'invisible' },
  { name: 'Протокол Ехо', enemies: 5, bossHP: 320, reward: 700, bossAbility: 'reflect' },
  { name: 'Чорний Маяк', enemies: 5, bossHP: 360, reward: 800, bossAbility: 'glitchfield' },
  { name: 'Останній Сигнал', enemies: 6, bossHP: 400, reward: 1000, bossAbility: 'all' }
];

// Phrases system
const TRUE_PHRASES = [
  "Ти не герой", "Ти лише інструмент", "Тебе створили",
  "Світ — це симуляція", "Все повторюється", "Це цикл",
  "Вони не вороги", "Вони знали правду", "Ти вже був тут", "Виходу немає"
];
const FAKE_PHRASES = [
  "Ти герой", "Ти рятуєш світ", "Ти обраний",
  "Вони брехали тобі", "Без тебе все зруйнується", "Ти єдиний шанс"
];

function getMissionData(missionNum) {
  if (missionNum < 10) return MISSIONS[missionNum];
  // Random infinite missions
  const difficulty = Math.min(missionNum, 30);
  return {
    name: generatePlanetName(),
    enemies: Math.min(3 + Math.floor(difficulty / 3), 8),
    bossHP: 200 + difficulty * 30,
    reward: 500 + Math.floor(Math.random() * 1000),
    bossAbility: ['teleport', 'shield', 'summon', 'invisible'][Math.floor(Math.random() * 4)]
  };
}

function generatePlanetName() {
  const prefixes = ['Тінь', 'Сигнал', 'Привид', 'Протокол', 'Ехо', 'Зона', 'Маяк', 'Код'];
  const suffixes = ['Кеплера', 'Андромеди', 'Оріона', 'Центавра', 'Сіріуса', 'Вега', 'Альтаїр'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

// Get phrase for a mission (true or fake, distributed across missions 1-20)
function getMissionPhrase(missionNum) {
  // True phrases hidden in missions: 0,2,4,7,9 and 14,15,16,17,19 (0-indexed)
  const trueMissionIndices = [0, 2, 4, 7, 9, 14, 15, 16, 17, 19];
  const trueIndex = trueMissionIndices.indexOf(missionNum);
  if (trueIndex !== -1 && trueIndex < TRUE_PHRASES.length) {
    return { text: TRUE_PHRASES[trueIndex], isTrue: true };
  }
  // Fake phrase
  return { text: FAKE_PHRASES[Math.floor(Math.random() * FAKE_PHRASES.length)], isTrue: false };
}

// ============================================
// WEAPON DATA
// ============================================
const WEAPONS = {
  pistol: {
    name: 'Пістолет', damage: 10, fireRate: 400, range: 250,
    type: 'ranged', bulletSpeed: 6, bulletCount: 1
  },
  sword: {
    name: 'Меч', damage: 25, fireRate: 600, range: 40,
    type: 'melee', bulletSpeed: 0, bulletCount: 0
  },
  machinegun: {
    name: 'Кулемет', damage: 5, fireRate: 100, range: 200,
    type: 'ranged', bulletSpeed: 7, bulletCount: 1
  },
  sniper: {
    name: 'Снайперка', damage: 40, fireRate: 1200, range: 400,
    type: 'ranged', bulletSpeed: 10, bulletCount: 1
  }
};

function getWeaponDamage(weaponType, level) {
  const base = WEAPONS[weaponType].damage;
  return base + (level - 1) * Math.ceil(base * 0.3);
}

// ============================================
// GLITCH SYSTEM
// ============================================
let glitchTimer = 0;
let activeGlitch = null;
let glitchDuration = 0;
let screenShakeX = 0;
let screenShakeY = 0;

function getGlitchLevel() {
  if (!save) return 0;
  const m = save.missionNumber;
  if (m < 5) return 1;
  if (m < 10) return 2;
  if (m < 15) return 3;
  if (m < 20) return 4;
  return 5;
}

function updateGlitches(dt) {
  const level = getGlitchLevel();
  if (level === 0) return;

  screenShakeX = 0;
  screenShakeY = 0;

  glitchTimer -= dt;
  if (glitchTimer <= 0) {
    // Chance to trigger a glitch
    const chance = level * 0.05;
    if (Math.random() < chance) {
      triggerGlitch(level);
    }
    glitchTimer = 2 + Math.random() * 5;
  }

  if (activeGlitch) {
    glitchDuration -= dt;
    if (glitchDuration <= 0) {
      activeGlitch = null;
    }
  }
}

function triggerGlitch(level) {
  const types = ['text'];
  if (level >= 2) types.push('scanlines', 'flicker');
  if (level >= 3) types.push('shift', 'invert_controls');
  if (level >= 4) types.push('color_shift', 'fake_message');
  if (level >= 5) types.push('blackout', 'reverse_text');

  activeGlitch = types[Math.floor(Math.random() * types.length)];
  glitchDuration = 0.3 + Math.random() * 0.5;

  if (activeGlitch === 'blackout') glitchDuration = 0.5 + Math.random() * 0.5;

  playSound('glitch');
}

function renderGlitchEffects() {
  if (!activeGlitch) return;

  switch (activeGlitch) {
    case 'text': {
      const msgs = ['помилка системи', 'дані пошкоджено', "пам'ять фрагментована",
        'сигнал нестабільний', 'УВАГА', 'ERROR 0x04F2'];
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#f00';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.fillText(msgs[Math.floor(Math.random() * msgs.length)],
        Math.random() * 600 + 50, Math.random() * 400 + 100);
      ctx.restore();
      break;
    }
    case 'scanlines':
      ctx.save();
      ctx.globalAlpha = 0.15;
      for (let y = 0; y < 600; y += 3) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, y, 800, 1);
      }
      ctx.restore();
      break;
    case 'flicker':
      ctx.save();
      ctx.globalAlpha = 0.1 + Math.random() * 0.2;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#0ff';
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
    case 'shift':
      screenShakeX = (Math.random() - 0.5) * 10;
      screenShakeY = (Math.random() - 0.5) * 5;
      break;
    case 'blackout':
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
    case 'color_shift':
      ctx.save();
      ctx.globalCompositeOperation = 'hue';
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
  }
}

// ============================================
// TEXT TYPING EFFECT
// ============================================
class TypeWriter {
  constructor(text, speed = 40) {
    this.fullText = text;
    this.text = '';
    this.index = 0;
    this.speed = speed;
    this.timer = 0;
    this.done = false;
  }

  update(dt) {
    if (this.done) return;
    this.timer += dt * 1000;
    while (this.timer >= this.speed && this.index < this.fullText.length) {
      this.text += this.fullText[this.index];
      this.index++;
      this.timer -= this.speed;
      playSound('beep');
    }
    if (this.index >= this.fullText.length) this.done = true;
  }

  skip() {
    this.text = this.fullText;
    this.index = this.fullText.length;
    this.done = true;
  }
}

// ============================================
// UI HELPERS
// ============================================
function drawButton(x, y, w, h, text, hover = false) {
  const isHover = hover || (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h);
  ctx.save();
  ctx.strokeStyle = isHover ? '#0ff' : '#0aa';
  ctx.lineWidth = isHover ? 2 : 1;
  ctx.fillStyle = isHover ? 'rgba(0,255,255,0.1)' : 'rgba(0,255,255,0.03)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = isHover ? '#fff' : '#0ff';
  ctx.font = '16px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
  return isHover;
}

function isButtonClicked(x, y, w, h) {
  return mouseClicked && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function drawHPBar(x, y, w, h, current, max, color = '#0f0') {
  const ratio = Math.max(0, current / max);
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = ratio > 0.5 ? color : ratio > 0.25 ? '#ff0' : '#f00';
  ctx.fillRect(x, y, w * ratio, h);
  ctx.strokeStyle = '#555';
  ctx.strokeRect(x, y, w, h);
}

// ============================================
// SLOT SELECT SCREEN
// ============================================
function updateSlotSelect() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  // Title
  ctx.fillStyle = '#0ff';
  ctx.font = '28px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ПОЛЮВАННЯ', 400, 80);

  ctx.fillStyle = '#0aa';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillText('Космічний Мисливець', 400, 110);

  // 3 save slots
  for (let i = 0; i < 3; i++) {
    const x = 150;
    const y = 160 + i * 130;
    const w = 500;
    const h = 110;
    const s = saves[i];
    const isHover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

    ctx.strokeStyle = isHover ? '#0ff' : '#066';
    ctx.lineWidth = isHover ? 2 : 1;
    ctx.fillStyle = isHover ? 'rgba(0,255,255,0.05)' : 'rgba(0,40,40,0.3)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ff';
    ctx.font = '18px "Orbitron", sans-serif';
    ctx.fillText(`СЛОТ ${i + 1}`, x + 20, y + 30);

    if (s) {
      ctx.fillStyle = '#aaa';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.fillText(`Місія: ${s.missionNumber + 1}`, x + 20, y + 55);
      ctx.fillText(`Кредити: ${s.credits} cr`, x + 20, y + 75);
      ctx.fillText(`Рівень бази: ${s.baseLevel}`, x + 250, y + 55);

      // Delete button
      const delX = x + w - 100;
      const delY = y + 70;
      const delW = 80;
      const delH = 28;
      const delHover = mouseX >= delX && mouseX <= delX + delW && mouseY >= delY && mouseY <= delY + delH;

      ctx.fillStyle = delHover ? 'rgba(255,0,0,0.2)' : 'rgba(255,0,0,0.05)';
      ctx.fillRect(delX, delY, delW, delH);
      ctx.strokeStyle = delHover ? '#f44' : '#a00';
      ctx.strokeRect(delX, delY, delW, delH);
      ctx.fillStyle = delHover ? '#f88' : '#a00';
      ctx.textAlign = 'center';
      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillText('Видалити', delX + delW / 2, delY + delH / 2 + 4);

      if (mouseClicked && delHover) {
        playSound('click');
        deleteSave(i);
        loadSaves();
      }
    } else {
      ctx.fillStyle = '#555';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.fillText('Порожній слот — натисни щоб почати', x + 20, y + 60);
    }

    // Click to select slot
    if (mouseClicked && isHover && !(saves[i] && mouseX >= x + w - 100 && mouseY >= y + 70)) {
      playSound('click');
      initAudio();
      currentSlot = i;
      if (!saves[i]) {
        save = createNewSave();
        saves[i] = save;
        saveToDisk();
        introInit();
        gameState = STATES.INTRO;
      } else {
        save = saves[i];
        hqInit();
        gameState = STATES.HQ;
      }
    }
  }
}

// ============================================
// INTRO SCREEN
// ============================================
let introLines = [];
let introLineIndex = 0;
let introWriter = null;
let introPhase = 0; // 0=text, 1=pistol scene, 2=ready

function introInit() {
  introLines = [
    'Космічна поліція шукає мисливців.',
    'Ти підходиш.',
    'Ніяких питань. Ніяких відмов.',
    'Ось твоя зброя.',
    'Виконуй завдання.'
  ];
  introLineIndex = 0;
  introWriter = new TypeWriter(introLines[0], 50);
  introPhase = 0;
}

function updateIntro(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  if (introPhase === 0) {
    // Typing text
    introWriter.update(dt);

    ctx.fillStyle = '#0ff';
    ctx.font = '18px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';

    // Show completed lines
    for (let i = 0; i < introLineIndex; i++) {
      ctx.globalAlpha = 0.6;
      ctx.fillText(introLines[i], 400, 200 + i * 35);
    }
    ctx.globalAlpha = 1;
    ctx.fillText(introWriter.text, 400, 200 + introLineIndex * 35);

    // Blinking cursor
    if (!introWriter.done || Math.floor(Date.now() / 500) % 2 === 0) {
      if (!introWriter.done) {
        const tw = ctx.measureText(introWriter.text).width;
        ctx.fillRect(400 + tw / 2 + 2, 190 + introLineIndex * 35, 8, 18);
      }
    }

    if (introWriter.done) {
      if (introLineIndex < introLines.length - 1) {
        // Auto advance after short delay
        if (!introWriter._waited) {
          introWriter._waited = 0;
        }
        introWriter._waited += dt;
        if (introWriter._waited > 0.8) {
          introLineIndex++;
          introWriter = new TypeWriter(introLines[introLineIndex], 50);
        }
      } else {
        introPhase = 1;
      }
    }

    // Skip intro
    if (keyJustPressed['Escape'] || keyJustPressed['Enter']) {
      introPhase = 1;
    }
  }

  if (introPhase === 1) {
    // Show pistol scene
    ctx.fillStyle = '#0ff';
    ctx.font = '18px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < introLines.length; i++) {
      ctx.globalAlpha = 0.4;
      ctx.fillText(introLines[i], 400, 200 + i * 35);
    }
    ctx.globalAlpha = 1;

    // Draw pistol icon
    ctx.save();
    ctx.translate(400, 430);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    // Simple pistol shape
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(20, -5);
    ctx.lineTo(25, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(15, 15);
    ctx.lineTo(5, 15);
    ctx.lineTo(5, 5);
    ctx.lineTo(-20, 5);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#0aa';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('[ Отримано: Пістолет ]', 400, 470);

    drawButton(300, 510, 200, 45, '[ Почати ]');

    if (isButtonClicked(300, 510, 200, 45) || keyJustPressed['Enter']) {
      playSound('click');
      hqInit();
      gameState = STATES.HQ;
    }
  }
}

// ============================================
// HQ (HEADQUARTERS) — TOP-DOWN WALKABLE
// ============================================
let hq = {
  player: { x: 200, y: 200, dir: 'down' },
  width: 400,
  height: 300,
  offsetX: 200,
  offsetY: 150,
  interactTarget: null,
  showInteractHint: false,
  // NPC and objects
  objects: [],
  // Tutorial hints
  tutorialHints: []
};

const HQ_OBJECTS = {
  monitor: { x: 50, y: 30, w: 60, h: 40, label: 'Місії', color: '#0af', icon: '🖥️' },
  hangar: { x: 160, y: 30, w: 60, h: 40, label: 'Ангар', color: '#f80', icon: '🚀' },
  wardrobe: { x: 310, y: 30, w: 60, h: 40, label: 'Гардероб', color: '#f0a', icon: '👔' },
  commander: { x: 310, y: 150, w: 40, h: 40, label: 'Командир', color: '#0f0', icon: '👤' },
  bed: { x: 20, y: 230, w: 50, h: 40, label: 'Зберегти', color: '#55a', icon: '💾' },
  secretWall: { x: 180, y: 255, w: 40, h: 20, label: '', color: '#222', icon: '' },
  // Unlockable
  arsenal: { x: 50, y: 130, w: 60, h: 40, label: 'Арсенал', color: '#f44', icon: '🔫', minBase: 2 },
  lab: { x: 310, y: 230, w: 60, h: 40, label: 'Лабораторія', color: '#a0f', icon: '🔬', minBase: 3 }
};

function hqInit() {
  hq.player = { x: 200, y: 180, dir: 'down' };
  hq.interactTarget = null;
  hq.showInteractHint = false;

  // Update base level
  if (save) {
    if (save.missionNumber >= 20) save.baseLevel = 5;
    else if (save.missionNumber >= 15) save.baseLevel = 4;
    else if (save.missionNumber >= 10) save.baseLevel = 3;
    else if (save.missionNumber >= 5) save.baseLevel = 2;
    else save.baseLevel = 1;
  }
}

function updateHQ(dt) {
  const speed = 120; // pixels per second
  const p = hq.player;
  const prevX = p.x;
  const prevY = p.y;

  // Movement
  if (keys['KeyW'] || keys['ArrowUp']) { p.y -= speed * dt; p.dir = 'up'; }
  if (keys['KeyS'] || keys['ArrowDown']) { p.y += speed * dt; p.dir = 'down'; }
  if (keys['KeyA'] || keys['ArrowLeft']) { p.x -= speed * dt; p.dir = 'left'; }
  if (keys['KeyD'] || keys['ArrowRight']) { p.x += speed * dt; p.dir = 'right'; }

  // Boundaries
  p.x = Math.max(10, Math.min(hq.width - 10, p.x));
  p.y = Math.max(25, Math.min(hq.height - 10, p.y));

  // Collision with objects
  for (const [key, obj] of Object.entries(HQ_OBJECTS)) {
    if (obj.minBase && save.baseLevel < obj.minBase) continue;
    if (key === 'secretWall' && save.missionNumber < 3) continue;

    // Simple box collision
    if (p.x > obj.x - 5 && p.x < obj.x + obj.w + 5 &&
        p.y > obj.y - 5 && p.y < obj.y + obj.h + 5) {
      // Push player back
      p.x = prevX;
      p.y = prevY;
    }
  }

  // Check interaction range
  hq.interactTarget = null;
  hq.showInteractHint = false;
  for (const [key, obj] of Object.entries(HQ_OBJECTS)) {
    if (obj.minBase && save.baseLevel < obj.minBase) continue;
    if (key === 'secretWall' && save.missionNumber < 3) continue;

    const dist = Math.hypot(p.x - (obj.x + obj.w / 2), p.y - (obj.y + obj.h / 2));
    if (dist < 50) {
      hq.interactTarget = key;
      hq.showInteractHint = true;
      break;
    }
  }

  // Interaction
  if (keyJustPressed['KeyE'] && hq.interactTarget) {
    playSound('click');
    handleHQInteraction(hq.interactTarget);
  }

  // Tutorial hint for first time
  if (save && !save.tutorialShown.move && (keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'])) {
    save.tutorialShown.move = true;
  }

  // Render
  renderHQ();
}

function handleHQInteraction(target) {
  if (!save.tutorialShown.interact) save.tutorialShown.interact = true;

  switch (target) {
    case 'monitor':
      missionBriefInit();
      gameState = STATES.MISSION_BRIEF;
      break;
    case 'hangar':
      shopInit('hangar');
      gameState = STATES.SHOP;
      break;
    case 'wardrobe':
      shopInit('wardrobe');
      gameState = STATES.SHOP;
      break;
    case 'arsenal':
      shopInit('arsenal');
      gameState = STATES.SHOP;
      break;
    case 'lab':
      shopInit('lab');
      gameState = STATES.SHOP;
      break;
    case 'commander':
      commanderDialogueInit();
      break;
    case 'bed':
      saveToDisk();
      showNotification('Гру збережено!');
      break;
    case 'secretWall':
      if (!save.secretRoomFound) {
        save.secretRoomFound = true;
        saveToDisk();
        playSound('alarm');
        showNotification('Ти знайшов щось...');
      }
      if (save.collectedPhrases.length >= 5) {
        puzzleInit();
        gameState = STATES.PUZZLE;
      }
      break;
  }
}

// Notification system
let notifications = [];

function showNotification(text) {
  notifications.push({ text, timer: 3 });
}

function renderNotifications(dt) {
  for (let i = notifications.length - 1; i >= 0; i--) {
    notifications[i].timer -= dt;
    if (notifications[i].timer <= 0) {
      notifications.splice(i, 1);
      continue;
    }
    const n = notifications[i];
    const alpha = Math.min(1, n.timer);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,255,255,0.15)';
    ctx.fillRect(250, 10 + i * 40, 300, 30);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(250, 10 + i * 40, 300, 30);
    ctx.fillStyle = '#0ff';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, 400, 30 + i * 40);
    ctx.restore();
  }
}

function renderHQ() {
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, 800, 600);

  ctx.save();
  ctx.translate(hq.offsetX, hq.offsetY);

  // Walls
  const agingLevel = Math.min(5, Math.floor(save.missionNumber / 2));
  ctx.strokeStyle = '#1a3a3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, hq.width, hq.height);

  // Floor grid
  ctx.strokeStyle = 'rgba(0,255,255,0.03)';
  for (let x = 0; x < hq.width; x += 20) ctx.strokeRect(x, 0, 20, hq.height);
  for (let y = 0; y < hq.height; y += 20) ctx.strokeRect(0, y, hq.width, 20);

  // Aging cracks
  if (agingLevel >= 2) {
    ctx.strokeStyle = 'rgba(255,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < agingLevel; i++) {
      ctx.beginPath();
      ctx.moveTo(50 + i * 80, 0);
      ctx.lineTo(60 + i * 80 + Math.random() * 10, 30 + Math.random() * 20);
      ctx.stroke();
    }
  }

  // Objects
  for (const [key, obj] of Object.entries(HQ_OBJECTS)) {
    if (obj.minBase && save.baseLevel < obj.minBase) continue;
    if (key === 'secretWall') {
      if (save.missionNumber < 3) continue;
      // Flickering secret wall
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
      ctx.fillStyle = '#0ff';
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
      ctx.restore();
      continue;
    }

    // Object background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = hq.interactTarget === key ? 2 : 1;
    ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

    // Label
    ctx.fillStyle = obj.color;
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(obj.label, obj.x + obj.w / 2, obj.y + obj.h + 12);

    // Glow for active
    if (hq.interactTarget === key) {
      ctx.save();
      ctx.globalAlpha = 0.1 + Math.sin(Date.now() / 300) * 0.05;
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x - 3, obj.y - 3, obj.w + 6, obj.h + 6);
      ctx.restore();
    }
  }

  // Player
  const p = hq.player;
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Direction indicator
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  const dirs = { up: [0, -12], down: [0, 12], left: [-12, 0], right: [12, 0] };
  const [dx, dy] = dirs[p.dir];
  ctx.lineTo(p.x + dx, p.y + dy);
  ctx.stroke();

  ctx.restore();

  // Interaction hint
  if (hq.showInteractHint) {
    ctx.fillStyle = '#0ff';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[E] — взаємодія', 400, hq.offsetY + hq.height + 30);
  }

  // Tutorial hints
  if (save && !save.tutorialShown.move) {
    ctx.fillStyle = 'rgba(0,255,255,0.8)';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WASD — рух', 400, hq.offsetY + hq.height + 55);
  }

  // HQ info bar
  ctx.fillStyle = '#0aa';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Місія: ${save.missionNumber + 1}  |  Кредити: ${save.credits} cr  |  База: Lv.${save.baseLevel}`, 15, 20);

  // Weapon info
  const w = save.weapons[save.activeWeapon];
  if (w) {
    ctx.fillText(`Зброя: ${WEAPONS[w.type].name} Lv.${w.level}`, 15, 38);
  }
}

// ============================================
// COMMANDER DIALOGUE
// ============================================
let commanderDialogue = null;

const COMMANDER_LINES = [
  'У нас нова ціль. Перевір монітор.',
  'Не ставай на їхній бік. Вони злочинці.',
  'Ти найкращий мисливець що у нас є.',
  'Система працює ідеально. Не сумнівайся.',
  'Ще трохи — і ти станеш легендою.',
  'Вони скажуть що завгодно щоб вижити. Не слухай.',
  'Ми контролюємо ситуацію. Повністю.',
  'Твоя робота рятує мільйони.',
  'Не думай. Просто виконуй.',
  'Ти довіряєш мені, правда?'
];

function commanderDialogueInit() {
  const line = COMMANDER_LINES[Math.min(save.missionNumber, COMMANDER_LINES.length - 1)];
  commanderDialogue = new TypeWriter(line, 40);
}

function renderCommanderDialogue(dt) {
  if (!commanderDialogue) return false;
  commanderDialogue.update(dt);

  // Dialogue box at bottom
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(50, 480, 700, 80);
  ctx.strokeStyle = '#0f0';
  ctx.strokeRect(50, 480, 700, 80);

  ctx.fillStyle = '#0f0';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('КОМАНДИР:', 70, 505);

  ctx.fillStyle = '#ddd';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillText(commanderDialogue.text, 70, 535);

  if (commanderDialogue.done) {
    ctx.fillStyle = '#555';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('[E / Enter — закрити]', 730, 555);

    if (keyJustPressed['KeyE'] || keyJustPressed['Enter'] || keyJustPressed['Escape']) {
      commanderDialogue = null;
      // Skipping dialogue increases cruelty
      return false;
    }
  }
  return true;
}

// ============================================
// MISSION BRIEFING
// ============================================
let currentMission = null;

function missionBriefInit() {
  currentMission = getMissionData(save.missionNumber);
}

function updateMissionBrief(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  if (!currentMission) return;

  // Title
  ctx.fillStyle = '#0ff';
  ctx.font = '24px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`МІСІЯ ${save.missionNumber + 1}`, 400, 80);

  ctx.fillStyle = '#fff';
  ctx.font = '20px "Orbitron", sans-serif';
  ctx.fillText(currentMission.name, 400, 120);

  // Details
  ctx.textAlign = 'left';
  ctx.font = '16px "Share Tech Mono", monospace';
  const startY = 180;

  ctx.fillStyle = '#aaa';
  ctx.fillText('Рівень загрози:', 200, startY);
  ctx.fillStyle = '#f44';
  const stars = Math.min(5, Math.ceil(currentMission.enemies / 1.5));
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), 400, startY);

  ctx.fillStyle = '#aaa';
  ctx.fillText('Ворогів:', 200, startY + 35);
  ctx.fillStyle = '#ff0';
  ctx.fillText(`${currentMission.enemies}`, 400, startY + 35);

  ctx.fillStyle = '#aaa';
  ctx.fillText('HP боса:', 200, startY + 70);
  ctx.fillStyle = '#f80';
  ctx.fillText(`${currentMission.bossHP}`, 400, startY + 70);

  ctx.fillStyle = '#aaa';
  ctx.fillText('Нагорода:', 200, startY + 105);
  ctx.fillStyle = '#0f0';
  ctx.font = '18px "Share Tech Mono", monospace';
  ctx.fillText(`${currentMission.reward} cr`, 400, startY + 105);

  if (currentMission.bossAbility) {
    ctx.fillStyle = '#aaa';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.fillText('Бос має здібність:', 200, startY + 140);
    ctx.fillStyle = '#f0f';
    ctx.fillText('???', 400, startY + 140);
  }

  // Buttons
  drawButton(250, 480, 130, 45, '← Назад');
  drawButton(420, 480, 170, 45, '[ Відправитись ]');

  if (isButtonClicked(250, 480, 130, 45)) {
    playSound('click');
    gameState = STATES.HQ;
  }

  if (isButtonClicked(420, 480, 170, 45) || keyJustPressed['Enter']) {
    playSound('click');
    shipInit();
    gameState = STATES.SHIP;
  }
}

// ============================================
// SHIP MINI-GAME
// ============================================
let ship = {
  x: 400, y: 500, hp: 80, maxHP: 80,
  bullets: [],
  enemies: [],
  timer: 0,
  maxTime: 20,
  spawnTimer: 0,
  lastShot: 0,
  alive: true
};

function shipInit() {
  ship = {
    x: 400, y: 500,
    hp: save.shipMaxHP,
    maxHP: save.shipMaxHP,
    bullets: [],
    enemies: [],
    timer: 0,
    maxTime: 20,
    spawnTimer: 0,
    lastShot: 0,
    alive: true,
    speed: save.shipSpeed + 1,
    damage: save.shipDamage,
    bulletCount: save.shipBulletsLevel
  };
}

function updateShip(dt) {
  if (!ship.alive) {
    // Death screen
    deathInit('ship');
    gameState = STATES.DEATH;
    return;
  }

  const spd = ship.speed * 100;

  // Movement
  if (keys['KeyW'] || keys['ArrowUp']) ship.y -= spd * dt;
  if (keys['KeyS'] || keys['ArrowDown']) ship.y += spd * dt;
  if (keys['KeyA'] || keys['ArrowLeft']) ship.x -= spd * dt;
  if (keys['KeyD'] || keys['ArrowRight']) ship.x += spd * dt;

  ship.x = Math.max(20, Math.min(780, ship.x));
  ship.y = Math.max(100, Math.min(580, ship.y));

  // Shooting
  ship.lastShot += dt * 1000;
  if (keys['Space'] && ship.lastShot > 200) {
    ship.lastShot = 0;
    for (let i = 0; i < ship.bulletCount; i++) {
      const spread = (i - (ship.bulletCount - 1) / 2) * 15;
      ship.bullets.push({ x: ship.x + spread, y: ship.y - 15, speed: 8 });
    }
    playSound('shoot');
  }

  // Update bullets
  for (let i = ship.bullets.length - 1; i >= 0; i--) {
    ship.bullets[i].y -= ship.bullets[i].speed;
    if (ship.bullets[i].y < 0) ship.bullets.splice(i, 1);
  }

  // Spawn enemies
  ship.spawnTimer -= dt;
  const difficulty = Math.min(save.missionNumber + 1, 10);
  if (ship.spawnTimer <= 0) {
    const type = Math.random();
    if (type < 0.5) {
      // Basic
      ship.enemies.push({ x: Math.random() * 700 + 50, y: -20, type: 'basic', hp: 10, speed: 1.5 + difficulty * 0.2 });
    } else if (type < 0.8) {
      // Fast
      ship.enemies.push({ x: Math.random() * 700 + 50, y: -20, type: 'fast', hp: 5, speed: 3 + difficulty * 0.2, zigzag: 0 });
    } else {
      // Heavy
      ship.enemies.push({ x: Math.random() * 700 + 50, y: -20, type: 'heavy', hp: 25, speed: 0.8 + difficulty * 0.1 });
    }
    ship.spawnTimer = Math.max(0.3, 1.5 - difficulty * 0.1);
  }

  // Update enemies
  for (let i = ship.enemies.length - 1; i >= 0; i--) {
    const e = ship.enemies[i];
    e.y += e.speed;

    if (e.type === 'fast') {
      e.zigzag += dt * 5;
      e.x += Math.sin(e.zigzag) * 2;
    }

    // Bullet collision
    for (let j = ship.bullets.length - 1; j >= 0; j--) {
      const b = ship.bullets[j];
      if (Math.hypot(b.x - e.x, b.y - e.y) < 15) {
        e.hp -= ship.damage;
        ship.bullets.splice(j, 1);
        if (e.hp <= 0) {
          ship.enemies.splice(i, 1);
          playSound('explosion');
        } else {
          playSound('hit');
        }
        break;
      }
    }

    // Collision with ship
    if (e.y > 0 && Math.hypot(e.x - ship.x, e.y - ship.y) < 20) {
      ship.hp -= 15;
      ship.enemies.splice(i, 1);
      playSound('hit');
      if (ship.hp <= 0) {
        ship.alive = false;
        playSound('explosion');
      }
      continue;
    }

    // Off screen
    if (e.y > 620) ship.enemies.splice(i, 1);
  }

  // Timer
  ship.timer += dt;
  if (ship.timer >= ship.maxTime) {
    // Survived! Go to landing animation
    landingInit();
    gameState = STATES.LANDING;
  }

  // Render
  renderShip();
}

function renderShip() {
  // Space background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, 800, 600);

  // Stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 137 + ship.timer * 20 * (i % 3 + 1)) % 800;
    const sy = (i * 251 + ship.timer * 50 * (i % 3 + 1)) % 600;
    ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
    ctx.fillRect(sx, sy, 1 + i % 2, 1 + i % 2);
  }
  ctx.globalAlpha = 1;

  // Ship (detailed bounty hunter vessel)
  ctx.save();
  ctx.translate(ship.x, ship.y);
  // Main hull
  ctx.fillStyle = '#0a3a4a';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(-8, -5);
  ctx.lineTo(-14, 8);
  ctx.lineTo(-6, 6);
  ctx.lineTo(0, 12);
  ctx.lineTo(6, 6);
  ctx.lineTo(14, 8);
  ctx.lineTo(8, -5);
  ctx.closePath();
  ctx.fill();
  // Hull outline
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Cockpit
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.ellipse(0, -8, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings detail
  ctx.strokeStyle = '#088';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-16, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(16, 6); ctx.stroke();
  // Wing tips
  ctx.fillStyle = '#f00';
  ctx.fillRect(-17, 4, 3, 3);
  ctx.fillRect(14, 4, 3, 3);
  // Engine glow (dual engines)
  ctx.fillStyle = '#f80';
  ctx.globalAlpha = 0.5 + Math.random() * 0.4;
  ctx.fillRect(-5, 10, 3, 5 + Math.random() * 8);
  ctx.fillRect(2, 10, 3, 5 + Math.random() * 8);
  ctx.fillStyle = '#ff0';
  ctx.globalAlpha = 0.3 + Math.random() * 0.3;
  ctx.fillRect(-4, 12, 1, 3 + Math.random() * 5);
  ctx.fillRect(3, 12, 1, 3 + Math.random() * 5);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Bullets
  ctx.fillStyle = '#ff0';
  for (const b of ship.bullets) {
    ctx.fillRect(b.x - 1, b.y - 4, 2, 8);
  }

  // Enemies
  for (const e of ship.enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.type === 'basic') {
      ctx.fillStyle = '#f44';
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(-10, -8);
      ctx.lineTo(10, -8);
      ctx.closePath();
      ctx.fill();
    } else if (e.type === 'fast') {
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'heavy') {
      ctx.fillStyle = '#a44';
      ctx.fillRect(-12, -12, 24, 24);
      ctx.strokeStyle = '#f88';
      ctx.strokeRect(-12, -12, 24, 24);
    }
    ctx.restore();
  }

  // UI
  drawHPBar(15, 15, 150, 12, ship.hp, ship.maxHP, '#0f0');
  ctx.fillStyle = '#aaa';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`HP: ${Math.ceil(ship.hp)}/${ship.maxHP}`, 15, 42);

  // Timer
  const remaining = Math.max(0, ship.maxTime - ship.timer);
  ctx.fillStyle = '#0ff';
  ctx.font = '20px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(remaining)}с`, 400, 30);

  // Tutorial
  if (!save.tutorialShown.shoot) {
    ctx.fillStyle = 'rgba(0,255,255,0.8)';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.fillText('WASD — маневрування  |  ПРОБІЛ — стрільба', 400, 580);
    if (keys['Space']) save.tutorialShown.shoot = true;
  }
}

// ============================================
// LANDING ANIMATION
// ============================================
let landing = { timer: 0, phase: 0, planetColor: '#1a3a1a' };

function landingInit() {
  landing.timer = 0;
  landing.phase = 0;
  const colors = ['#1a3a1a', '#2a1a1a', '#1a1a3a', '#3a2a1a', '#1a3a3a'];
  landing.planetColor = colors[save.missionNumber % colors.length];
}

function updateLanding(dt) {
  landing.timer += dt;

  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, 800, 600);

  // Stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 80; i++) {
    const sx = (i * 137) % 800;
    const sy = (i * 251 + landing.timer * 100) % 600;
    ctx.globalAlpha = 0.2 + (i % 5) * 0.1;
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  if (landing.timer < 2) {
    // Phase 1: Planet approaching from below
    const progress = landing.timer / 2;
    const planetY = 600 + 300 - progress * 400;
    const planetR = 200 + progress * 150;

    // Planet surface
    ctx.fillStyle = landing.planetColor;
    ctx.beginPath();
    ctx.arc(400, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();

    // Atmosphere glow
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(400, planetY, planetR + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Ship descending
    const shipY = 100 + progress * 200;
    ctx.save();
    ctx.translate(400, shipY);
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-10, 8);
    ctx.lineTo(0, 5);
    ctx.lineTo(10, 8);
    ctx.closePath();
    ctx.fill();
    // Engine fire
    ctx.fillStyle = '#f80';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-3, 8, 6, 8 + Math.random() * 8);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Text
    ctx.fillStyle = '#0ff';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('НАБЛИЖЕННЯ ДО ПЛАНЕТИ...', 400, 50);
  } else if (landing.timer < 3.5) {
    // Phase 2: Atmosphere entry (screen shake + heat effect)
    const progress = (landing.timer - 2) / 1.5;

    // Planet fills screen
    ctx.fillStyle = landing.planetColor;
    ctx.fillRect(0, 0, 800, 600);

    // Heat lines
    ctx.strokeStyle = '#f80';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 * (1 - progress);
    for (let i = 0; i < 10; i++) {
      const lx = Math.random() * 800;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + (Math.random() - 0.5) * 20, 600);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Flash
    if (progress < 0.3) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = (1 - progress / 0.3) * 0.5;
      ctx.fillRect(0, 0, 800, 600);
      ctx.globalAlpha = 1;
    }

    // Screen shake
    if (progress < 0.7) {
      screenShakeX = (Math.random() - 0.5) * 8;
      screenShakeY = (Math.random() - 0.5) * 5;
    }

    ctx.fillStyle = '#0ff';
    ctx.font = '20px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВХІД В АТМОСФЕРУ', 400, 300);

    playSound('glitch');
  } else {
    // Phase 3: Landed
    screenShakeX = 0;
    screenShakeY = 0;
    huntInit();
    gameState = STATES.HUNT;
  }
}

// ============================================
// HUNT (PLANET SURFACE)
// ============================================
let hunt = {
  player: { x: 0, y: 0, hp: 100, maxHP: 100, dir: 'right', invincible: 0, lastShot: 0 },
  enemies: [],
  boss: null,
  bullets: [],
  enemyBullets: [],
  obstacles: [],
  stashes: [],
  camera: { x: 0, y: 0 },
  mapWidth: 1200,
  mapHeight: 900,
  phase: 'hunt', // hunt, boss_fight, boss_dead
  abilityTimer: 0,
  abilityCooldown: 0
};

const ENEMY_TYPES = {
  shooter: { hp: 40, speed: 1, damage: 15, color: '#a0f', fireRate: 2000, range: 200, name: 'Стрілець' },
  kamikaze: { hp: 25, speed: 3, damage: 30, color: '#ff0', fireRate: 0, range: 30, name: 'Камікадзе' },
  shield: { hp: 80, speed: 0.7, damage: 10, color: '#48f', fireRate: 3000, range: 100, name: 'Щит' }
};

function huntInit() {
  const p = hunt.player;
  p.x = 100;
  p.y = hunt.mapHeight / 2;
  p.hp = save.playerMaxHP;
  p.maxHP = save.playerMaxHP;
  p.invincible = 0;
  p.lastShot = 0;
  p.dir = 'right';

  hunt.bullets = [];
  hunt.enemyBullets = [];
  hunt.phase = 'hunt';
  hunt.abilityTimer = 0;
  hunt.abilityCooldown = 0;

  // Generate obstacles
  hunt.obstacles = [];
  for (let i = 0; i < 15 + Math.random() * 10; i++) {
    hunt.obstacles.push({
      x: 100 + Math.random() * (hunt.mapWidth - 200),
      y: 100 + Math.random() * (hunt.mapHeight - 200),
      w: 20 + Math.random() * 40,
      h: 20 + Math.random() * 30,
      type: Math.random() > 0.5 ? 'rock' : 'crate'
    });
  }

  // Stashes (30-50% chance)
  hunt.stashes = [];
  if (Math.random() < 0.4) {
    hunt.stashes.push({
      x: 200 + Math.random() * (hunt.mapWidth - 400),
      y: 200 + Math.random() * (hunt.mapHeight - 400),
      found: false,
      reward: 50 + Math.floor(Math.random() * 150)
    });
  }

  // Spawn enemies
  const mission = getMissionData(save.missionNumber);
  hunt.enemies = [];
  const types = ['shooter', 'kamikaze', 'shield'];
  for (let i = 0; i < mission.enemies; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const et = ENEMY_TYPES[type];
    hunt.enemies.push({
      x: 400 + Math.random() * (hunt.mapWidth - 500),
      y: 100 + Math.random() * (hunt.mapHeight - 200),
      hp: et.hp,
      maxHP: et.hp,
      speed: et.speed,
      damage: et.damage,
      color: et.color,
      type: type,
      fireRate: et.fireRate,
      lastShot: 0,
      range: et.range,
      alive: true,
      weapon: type === 'shooter' ? 'pistol' : type === 'shield' ? 'machinegun' : null
    });
  }

  // Boss
  hunt.boss = {
    x: hunt.mapWidth - 150,
    y: hunt.mapHeight / 2,
    hp: mission.bossHP,
    maxHP: mission.bossHP,
    speed: 1.5,
    damage: 20,
    color: '#f00',
    type: 'boss',
    fireRate: 1500,
    lastShot: 0,
    alive: true,
    ability: mission.bossAbility,
    abilityTimer: 0,
    abilityCooldown: 5000,
    isShielded: false,
    isInvisible: false,
    weapon: 'pistol'
  };
}

function updateHunt(dt) {
  const p = hunt.player;
  const dtMs = dt * 1000;

  if (p.hp <= 0) {
    deathInit('planet');
    gameState = STATES.DEATH;
    return;
  }

  // Player movement
  const spd = save.playerSpeed * 60;
  let moveX = 0, moveY = 0;

  // Glitch: invert controls
  const invert = activeGlitch === 'invert_controls' ? -1 : 1;

  if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1 * invert;
  if (keys['KeyS'] || keys['ArrowDown']) moveY += 1 * invert;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1 * invert;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1 * invert;

  // Normalize diagonal
  if (moveX && moveY) { moveX *= 0.707; moveY *= 0.707; }

  p.x += moveX * spd * dt;
  p.y += moveY * spd * dt;

  // Set direction
  if (moveX > 0) p.dir = 'right';
  else if (moveX < 0) p.dir = 'left';
  else if (moveY < 0) p.dir = 'up';
  else if (moveY > 0) p.dir = 'down';

  // Boundaries
  p.x = Math.max(10, Math.min(hunt.mapWidth - 10, p.x));
  p.y = Math.max(10, Math.min(hunt.mapHeight - 10, p.y));

  // Obstacle collision
  for (const obs of hunt.obstacles) {
    if (p.x > obs.x - 8 && p.x < obs.x + obs.w + 8 &&
        p.y > obs.y - 8 && p.y < obs.y + obs.h + 8) {
      p.x -= moveX * spd * dt;
      p.y -= moveY * spd * dt;
    }
  }

  // Invincibility timer
  if (p.invincible > 0) p.invincible -= dt;

  // Shooting
  const weapon = save.weapons[save.activeWeapon];
  const weaponData = WEAPONS[weapon.type];
  p.lastShot += dtMs;

  if (keys['Space'] && p.lastShot > weaponData.fireRate) {
    p.lastShot = 0;
    const dirVec = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = dirVec[p.dir];

    if (weaponData.type === 'ranged') {
      hunt.bullets.push({
        x: p.x, y: p.y,
        dx: dx * weaponData.bulletSpeed,
        dy: dy * weaponData.bulletSpeed,
        damage: getWeaponDamage(weapon.type, weapon.level),
        range: weaponData.range,
        traveled: 0
      });
      playSound('shoot');
    } else if (weaponData.type === 'melee') {
      // Melee: damage all enemies in range
      const dmg = getWeaponDamage(weapon.type, weapon.level);
      const allTargets = [...hunt.enemies.filter(e => e.alive), hunt.boss].filter(Boolean);
      for (const e of allTargets) {
        if (!e.alive) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) < weaponData.range + 15) {
          e.hp -= dmg;
          playSound('hit');
          if (e.hp <= 0) {
            e.alive = false;
            playSound('explosion');
          }
        }
      }
      playSound('shoot');
    }

    if (!save.tutorialShown.shoot) save.tutorialShown.shoot = true;
  }

  // Weapon switch
  if (keyJustPressed['Digit1']) { save.activeWeapon = 0; playSound('click'); }
  if (keyJustPressed['Digit2'] && save.weapons.length > 1) { save.activeWeapon = 1; playSound('click'); }

  // Ability (Q)
  hunt.abilityCooldown = Math.max(0, hunt.abilityCooldown - dtMs);
  if (keyJustPressed['KeyQ'] && hunt.abilityCooldown <= 0) {
    const abil = save.abilities[weapon.type];
    if (abil) {
      useAbility(weapon.type);
      hunt.abilityCooldown = getAbilityCooldown(weapon.type);
    }
  }

  // Update bullets
  for (let i = hunt.bullets.length - 1; i >= 0; i--) {
    const b = hunt.bullets[i];
    b.x += b.dx;
    b.y += b.dy;
    b.traveled += Math.hypot(b.dx, b.dy);

    if (b.traveled > 400 || b.x < 0 || b.x > hunt.mapWidth || b.y < 0 || b.y > hunt.mapHeight) {
      hunt.bullets.splice(i, 1);
      continue;
    }

    // Hit enemies
    const targets = [...hunt.enemies.filter(e => e.alive)];
    if (hunt.boss && hunt.boss.alive && !hunt.boss.isShielded) targets.push(hunt.boss);

    for (const e of targets) {
      if (Math.hypot(b.x - e.x, b.y - e.y) < 15) {
        e.hp -= b.damage;
        hunt.bullets.splice(i, 1);
        playSound('hit');
        if (e.hp <= 0) {
          e.alive = false;
          playSound('explosion');
        }
        break;
      }
    }
  }

  // Update enemies
  for (const e of hunt.enemies) {
    if (!e.alive) continue;
    updateEnemy(e, dt, dtMs);
  }

  // Update boss
  if (hunt.boss && hunt.boss.alive) {
    updateBoss(dt, dtMs);
  }

  // Update enemy bullets
  for (let i = hunt.enemyBullets.length - 1; i >= 0; i--) {
    const b = hunt.enemyBullets[i];
    b.x += b.dx;
    b.y += b.dy;
    b.life -= dt;

    if (b.life <= 0) { hunt.enemyBullets.splice(i, 1); continue; }

    // Hit player
    if (p.invincible <= 0 && Math.hypot(b.x - p.x, b.y - p.y) < 10) {
      p.hp -= b.damage;
      p.invincible = 0.5;
      hunt.enemyBullets.splice(i, 1);
      playSound('hit');
    }
  }

  // Stash pickup
  for (const s of hunt.stashes) {
    if (!s.found && Math.hypot(s.x - p.x, s.y - p.y) < 25) {
      s.found = true;
      save.credits += s.reward;
      playSound('click');
      showNotification(`+${s.reward} cr знайдено!`);
    }
  }

  // Check if all enemies dead
  const allEnemiesDead = hunt.enemies.every(e => !e.alive);
  if (allEnemiesDead && hunt.boss && !hunt.boss.alive && hunt.phase !== 'boss_dead') {
    hunt.phase = 'boss_dead';
    // Go to dialogue
    dialogueInit();
    gameState = STATES.DIALOGUE;
  }

  // Camera
  hunt.camera.x = Math.max(0, Math.min(hunt.mapWidth - 800, p.x - 400));
  hunt.camera.y = Math.max(0, Math.min(hunt.mapHeight - 600, p.y - 300));

  // Render
  renderHunt();
}

function updateEnemy(e, dt, dtMs) {
  const p = hunt.player;
  const dist = Math.hypot(e.x - p.x, e.y - p.y);

  if (e.type === 'kamikaze') {
    // Run at player
    const angle = Math.atan2(p.y - e.y, p.x - e.x);
    e.x += Math.cos(angle) * e.speed * 60 * dt;
    e.y += Math.sin(angle) * e.speed * 60 * dt;

    // Explode near player
    if (dist < e.range && p.invincible <= 0) {
      p.hp -= e.damage;
      p.invincible = 0.5;
      e.alive = false;
      playSound('explosion');
    }
  } else if (e.type === 'shooter') {
    // Keep distance
    if (dist < 150) {
      const angle = Math.atan2(e.y - p.y, e.x - p.x);
      e.x += Math.cos(angle) * e.speed * 60 * dt;
      e.y += Math.sin(angle) * e.speed * 60 * dt;
    } else if (dist > 250) {
      const angle = Math.atan2(p.y - e.y, p.x - e.x);
      e.x += Math.cos(angle) * e.speed * 60 * dt;
      e.y += Math.sin(angle) * e.speed * 60 * dt;
    }
    // Shoot
    e.lastShot += dtMs;
    if (e.lastShot > e.fireRate && dist < 300) {
      e.lastShot = 0;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);
      hunt.enemyBullets.push({
        x: e.x, y: e.y,
        dx: Math.cos(angle) * 3, dy: Math.sin(angle) * 3,
        damage: e.damage, life: 2
      });
    }
  } else if (e.type === 'shield') {
    // Slowly approach
    const angle = Math.atan2(p.y - e.y, p.x - e.x);
    e.x += Math.cos(angle) * e.speed * 60 * dt;
    e.y += Math.sin(angle) * e.speed * 60 * dt;

    // Melee attack
    if (dist < 30 && p.invincible <= 0) {
      p.hp -= e.damage;
      p.invincible = 0.8;
      playSound('hit');
    }
  }

  // Boundaries
  e.x = Math.max(10, Math.min(hunt.mapWidth - 10, e.x));
  e.y = Math.max(10, Math.min(hunt.mapHeight - 10, e.y));

  // Obstacle collision for enemies
  for (const obs of hunt.obstacles) {
    if (e.x > obs.x - 10 && e.x < obs.x + obs.w + 10 &&
        e.y > obs.y - 10 && e.y < obs.y + obs.h + 10) {
      // Push away from obstacle center
      const cx = obs.x + obs.w / 2;
      const cy = obs.y + obs.h / 2;
      const pushAngle = Math.atan2(e.y - cy, e.x - cx);
      e.x += Math.cos(pushAngle) * 2;
      e.y += Math.sin(pushAngle) * 2;
    }
  }
}

function updateBoss(dt, dtMs) {
  const b = hunt.boss;
  const p = hunt.player;
  const dist = Math.hypot(b.x - p.x, b.y - p.y);

  // Movement - smart approach
  const angle = Math.atan2(p.y - b.y, p.x - b.x);
  if (dist > 150) {
    b.x += Math.cos(angle) * b.speed * 60 * dt;
    b.y += Math.sin(angle) * b.speed * 60 * dt;
  } else if (dist < 80) {
    b.x -= Math.cos(angle) * b.speed * 30 * dt;
    b.y -= Math.sin(angle) * b.speed * 30 * dt;
  }

  // Shooting
  b.lastShot += dtMs;
  if (b.lastShot > b.fireRate && dist < 350) {
    b.lastShot = 0;
    hunt.enemyBullets.push({
      x: b.x, y: b.y,
      dx: Math.cos(angle) * 4, dy: Math.sin(angle) * 4,
      damage: b.damage, life: 2.5
    });
  }

  // Boss abilities
  if (b.ability) {
    b.abilityTimer += dtMs;
    if (b.abilityTimer > b.abilityCooldown) {
      b.abilityTimer = 0;
      useBossAbility(b);
    }
  }

  // Shield decay
  if (b.isShielded) {
    b._shieldTimer = (b._shieldTimer || 2000) - dtMs;
    if (b._shieldTimer <= 0) { b.isShielded = false; b._shieldTimer = 2000; }
  }

  // Invisible decay
  if (b.isInvisible) {
    b._invisTimer = (b._invisTimer || 3000) - dtMs;
    if (b._invisTimer <= 0) { b.isInvisible = false; b._invisTimer = 3000; }
  }

  // Collision with player
  if (dist < 25 && p.invincible <= 0) {
    p.hp -= b.damage;
    p.invincible = 0.8;
    playSound('hit');
  }

  b.x = Math.max(10, Math.min(hunt.mapWidth - 10, b.x));
  b.y = Math.max(10, Math.min(hunt.mapHeight - 10, b.y));

  // Obstacle collision for boss
  for (const obs of hunt.obstacles) {
    if (b.x > obs.x - 12 && b.x < obs.x + obs.w + 12 &&
        b.y > obs.y - 12 && b.y < obs.y + obs.h + 12) {
      const cx = obs.x + obs.w / 2;
      const cy = obs.y + obs.h / 2;
      const pushAngle = Math.atan2(b.y - cy, b.x - cx);
      b.x += Math.cos(pushAngle) * 2;
      b.y += Math.sin(pushAngle) * 2;
    }
  }
}

function useBossAbility(boss) {
  switch (boss.ability) {
    case 'teleport':
      boss.x = 100 + Math.random() * (hunt.mapWidth - 200);
      boss.y = 100 + Math.random() * (hunt.mapHeight - 200);
      playSound('glitch');
      break;
    case 'shield':
      boss.isShielded = true;
      boss._shieldTimer = 2000;
      break;
    case 'summon':
      for (let i = 0; i < 2; i++) {
        hunt.enemies.push({
          x: boss.x + (Math.random() - 0.5) * 60,
          y: boss.y + (Math.random() - 0.5) * 60,
          hp: 15, maxHP: 15, speed: 2, damage: 10,
          color: '#f88', type: 'kamikaze',
          fireRate: 0, lastShot: 0, range: 25, alive: true, weapon: null
        });
      }
      break;
    case 'invisible':
      boss.isInvisible = true;
      boss._invisTimer = 3000;
      break;
    case 'reflect':
      // Reflect nearby bullets
      for (const b of hunt.bullets) {
        if (Math.hypot(b.x - boss.x, b.y - boss.y) < 50) {
          b.dx = -b.dx;
          b.dy = -b.dy;
          hunt.enemyBullets.push({ ...b, damage: 10, life: 2 });
        }
      }
      hunt.bullets = hunt.bullets.filter(b => Math.hypot(b.x - boss.x, b.y - boss.y) >= 50);
      playSound('glitch');
      break;
    case 'glitchfield':
      triggerGlitch(4);
      glitchDuration = 2;
      break;
    case 'all':
      // Random ability
      const abilities = ['teleport', 'shield', 'summon', 'invisible', 'reflect', 'glitchfield'];
      boss.ability = abilities[Math.floor(Math.random() * abilities.length)];
      useBossAbility(boss);
      boss.ability = 'all';
      break;
  }
}

function useAbility(weaponType) {
  const p = hunt.player;
  switch (weaponType) {
    case 'pistol': // Double shot
      const dirVec = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const [dx, dy] = dirVec[p.dir];
      for (let i = 0; i < 2; i++) {
        hunt.bullets.push({
          x: p.x + (i - 0.5) * 10, y: p.y,
          dx: dx * 7, dy: dy * 7,
          damage: getWeaponDamage('pistol', save.weapons[save.activeWeapon].level) * 1.5,
          range: 300, traveled: 0
        });
      }
      playSound('shoot');
      break;
    case 'sword': // Circle attack
      const allTargets = [...hunt.enemies.filter(e => e.alive), hunt.boss].filter(e => e && e.alive);
      const dmg = getWeaponDamage('sword', save.weapons[save.activeWeapon].level) * 1.5;
      for (const e of allTargets) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < 60) {
          e.hp -= dmg;
          if (e.hp <= 0) { e.alive = false; playSound('explosion'); }
        }
      }
      playSound('explosion');
      break;
    case 'machinegun': // Grenade
      hunt.bullets.push({
        x: p.x, y: p.y,
        dx: ({ up: 0, down: 0, left: -3, right: 3 })[p.dir],
        dy: ({ up: -3, down: 3, left: 0, right: 0 })[p.dir],
        damage: 50, range: 150, traveled: 0, isGrenade: true
      });
      playSound('shoot');
      break;
    case 'sniper': // Sleep dart
      const sDir = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const [sdx, sdy] = sDir[p.dir];
      hunt.bullets.push({
        x: p.x, y: p.y,
        dx: sdx * 10, dy: sdy * 10,
        damage: 5, range: 400, traveled: 0, isSleep: true
      });
      playSound('shoot');
      break;
  }
}

function getAbilityCooldown(weaponType) {
  const base = { pistol: 8000, sword: 12000, machinegun: 15000, sniper: 15000 };
  const level = save.abilities[weaponType] || 1;
  return base[weaponType] * (1 - (level - 1) * 0.15);
}

function renderHunt() {
  ctx.save();
  ctx.translate(-hunt.camera.x + screenShakeX, -hunt.camera.y + screenShakeY);

  // Ground
  ctx.fillStyle = '#0a0a15';
  ctx.fillRect(0, 0, hunt.mapWidth, hunt.mapHeight);

  // Ground texture
  ctx.strokeStyle = 'rgba(0,255,255,0.02)';
  for (let x = 0; x < hunt.mapWidth; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, hunt.mapHeight); ctx.stroke();
  }
  for (let y = 0; y < hunt.mapHeight; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(hunt.mapWidth, y); ctx.stroke();
  }

  // Map border
  ctx.strokeStyle = '#1a3a3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, hunt.mapWidth, hunt.mapHeight);

  // Obstacles
  for (const obs of hunt.obstacles) {
    ctx.fillStyle = obs.type === 'rock' ? '#2a2a3a' : '#3a2a1a';
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = obs.type === 'rock' ? '#4a4a5a' : '#5a4a3a';
    ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
  }

  // Stashes
  for (const s of hunt.stashes) {
    if (s.found) continue;
    ctx.fillStyle = '#ff0';
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
    ctx.fillRect(s.x - 8, s.y - 8, 16, 16);
    ctx.strokeStyle = '#fa0';
    ctx.strokeRect(s.x - 8, s.y - 8, 16, 16);
    ctx.globalAlpha = 1;
  }

  // Enemies
  for (const e of hunt.enemies) {
    if (!e.alive) continue;
    renderEntity(e);
  }

  // Boss
  if (hunt.boss && hunt.boss.alive) {
    const b = hunt.boss;
    if (!b.isInvisible || Math.floor(Date.now() / 100) % 3 === 0) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.globalAlpha = b.isInvisible ? 0.2 : 1;

      // Boss body (large alien creature)
      // Body
      ctx.fillStyle = '#3a0a0a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f44';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Head with horns
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(0, -16, 8, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.strokeStyle = '#f88';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-12, -32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -20); ctx.lineTo(12, -32); ctx.stroke();
      // Eyes (glowing)
      ctx.fillStyle = '#ff0';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 5;
      ctx.fillRect(-5, -18, 3, 3);
      ctx.fillRect(2, -18, 3, 3);
      ctx.shadowBlur = 0;
      // Arms
      ctx.strokeStyle = '#a00';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-14, -5); ctx.lineTo(-22, 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, -5); ctx.lineTo(22, 5); ctx.stroke();

      // Shield effect
      if (b.isShielded) {
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // Boss HP bar + label
      drawHPBar(b.x - 30, b.y - 28, 60, 6, b.hp, b.maxHP, '#f00');
      ctx.fillStyle = '#f88';
      ctx.font = '9px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('БОС', b.x, b.y - 34);
    }
  }

  // Player (humanoid bounty hunter)
  const p = hunt.player;
  const weapon = save.weapons[save.activeWeapon];
  const wData = WEAPONS[weapon.type];
  const dirMap = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [ddx, ddy] = dirMap[p.dir];

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = p.invincible > 0 ? (Math.floor(Date.now() / 60) % 2 ? 0.3 : 1) : 1;

  // Body (armored suit)
  ctx.fillStyle = '#0a3a3a';
  ctx.beginPath();
  ctx.ellipse(0, 2, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Head (helmet)
  ctx.fillStyle = '#0a4a4a';
  ctx.beginPath();
  ctx.arc(0, -10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0ff';
  ctx.stroke();
  // Visor
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-4, -12, 8, 3);
  // Legs (simple)
  ctx.strokeStyle = '#088';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(-5, 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, 10); ctx.lineTo(5, 16); ctx.stroke();

  // Weapon visual
  if (wData.type === 'melee') {
    // Sword
    ctx.strokeStyle = '#aaf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ddx * 8 + ddy * 5, ddy * 8 - ddx * 5);
    ctx.lineTo(ddx * 22 + ddy * 2, ddy * 22 - ddx * 2);
    ctx.stroke();
    // Blade glow
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Gun barrel
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ddx * 8, ddy * 8);
    ctx.lineTo(ddx * 18, ddy * 18);
    ctx.stroke();
    // Muzzle
    ctx.fillStyle = '#ff0';
    ctx.fillRect(ddx * 17 - 2, ddy * 17 - 2, 4, 4);
  }

  ctx.restore();

  // Bullets
  ctx.fillStyle = '#ff0';
  for (const b of hunt.bullets) {
    if (b.isGrenade) {
      ctx.fillStyle = '#f80';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isSleep) {
      ctx.fillStyle = '#a0f';
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    } else {
      ctx.fillStyle = '#ff0';
      ctx.fillRect(b.x - 1, b.y - 3, 2, 6);
    }
  }

  // Enemy bullets
  ctx.fillStyle = '#f44';
  for (const b of hunt.enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // UI overlay (fixed position)
  // HP bar
  drawHPBar(15, 15, 150, 14, p.hp, p.maxHP, '#0f0');
  ctx.fillStyle = '#aaa';
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`HP: ${Math.ceil(p.hp)}/${p.maxHP}`, 15, 44);

  // Weapon
  ctx.fillStyle = '#0ff';
  ctx.fillText(`${wData.name} Lv.${weapon.level}`, 15, 60);

  // Credits
  ctx.fillStyle = '#ff0';
  ctx.fillText(`${save.credits} cr`, 15, 76);

  // Ability cooldown
  if (save.abilities[weapon.type]) {
    const cd = hunt.abilityCooldown;
    if (cd > 0) {
      ctx.fillStyle = '#888';
      ctx.fillText(`Здібність: ${Math.ceil(cd / 1000)}с`, 15, 92);
    } else {
      ctx.fillStyle = '#0f0';
      ctx.fillText('Здібність: [Q]', 15, 92);
    }
  }

  // Mini-map
  if (save.miniMapLevel > 0) {
    renderMiniMap();
  }
}

function renderEntity(e) {
  ctx.save();
  ctx.translate(e.x, e.y);

  if (e.type === 'shooter') {
    // Tall alien with long weapon (Stellaris-style)
    // Body
    ctx.fillStyle = '#2a0a3a';
    ctx.beginPath();
    ctx.ellipse(0, 2, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head (elongated)
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, -14, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (3 glowing dots)
    ctx.fillStyle = '#f0f';
    ctx.fillRect(-4, -16, 2, 2);
    ctx.fillRect(-1, -17, 2, 2);
    ctx.fillRect(2, -16, 2, 2);
    // Long weapon arm
    ctx.strokeStyle = '#fa0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(18, -5); ctx.stroke();
    ctx.fillStyle = '#ff0';
    ctx.fillRect(16, -7, 4, 4);
  } else if (e.type === 'kamikaze') {
    // Glowing bug-mutant (Starbound style)
    const pulse = 0.6 + Math.sin(Date.now() / 100) * 0.3;
    // Glow aura
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = pulse;
    // Body (bug shape)
    ctx.fillStyle = '#aa0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(-8, -3, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -3, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Eyes
    ctx.fillStyle = '#f00';
    ctx.fillRect(-3, -3, 2, 2);
    ctx.fillRect(1, -3, 2, 2);
  } else if (e.type === 'shield') {
    // Big armored alien (heavy golem style)
    // Body
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(-11, -8, 22, 20);
    // Armor plates
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-11, -8, 22, 20);
    ctx.strokeRect(-9, -6, 18, 6);
    // Head
    ctx.fillStyle = e.color;
    ctx.fillRect(-6, -14, 12, 7);
    // Visor
    ctx.fillStyle = '#0ff';
    ctx.fillRect(-4, -12, 8, 3);
    // Shield on left arm
    ctx.fillStyle = '#3a5a8a';
    ctx.fillRect(-16, -6, 6, 14);
    ctx.strokeStyle = '#6af';
    ctx.strokeRect(-16, -6, 6, 14);
  }

  ctx.restore();

  // HP bar
  drawHPBar(e.x - 15, e.y - 25, 30, 4, e.hp, e.maxHP, e.color);
  // Type name
  ctx.fillStyle = '#666';
  ctx.font = '8px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(ENEMY_TYPES[e.type]?.name || '', e.x, e.y - 29);
}

function renderMiniMap() {
  const mmW = 120;
  const mmH = 90;
  const mmX = 800 - mmW - 10;
  const mmY = 600 - mmH - 10;
  const scaleX = mmW / hunt.mapWidth;
  const scaleY = mmH / hunt.mapHeight;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(mmX, mmY, mmW, mmH);
  ctx.strokeStyle = '#0aa';
  ctx.strokeRect(mmX, mmY, mmW, mmH);

  // Player
  ctx.fillStyle = '#0ff';
  ctx.fillRect(mmX + hunt.player.x * scaleX - 2, mmY + hunt.player.y * scaleY - 2, 4, 4);

  // Enemies
  ctx.fillStyle = '#f44';
  for (const e of hunt.enemies) {
    if (!e.alive) continue;
    ctx.fillRect(mmX + e.x * scaleX - 1, mmY + e.y * scaleY - 1, 3, 3);
  }

  // Boss
  if (hunt.boss && hunt.boss.alive) {
    ctx.fillStyle = '#f00';
    ctx.fillRect(mmX + hunt.boss.x * scaleX - 2, mmY + hunt.boss.y * scaleY - 2, 5, 5);
  }

  // Stashes (only with upgraded minimap)
  if (save.miniMapLevel >= 2) {
    ctx.fillStyle = '#ff0';
    for (const s of hunt.stashes) {
      if (s.found) continue;
      ctx.fillRect(mmX + s.x * scaleX - 2, mmY + s.y * scaleY - 2, 4, 4);
    }
  }
}

// ============================================
// DIALOGUE SYSTEM
// ============================================
let dialogue = {
  lines: [],
  lineIndex: 0,
  writer: null,
  phrase: null,
  glitchWords: ['не маєш', 'брехня', 'дані', 'код', 'система', 'цикл', 'петля', 'правда', 'симуляція'],
  done: false
};

// Boss dialogue lines for each mission
const BOSS_DIALOGUES = [
  // Mission 1
  ['Ти думаєш що робиш правильно?', 'Вони не розповіли тобі все...', 'Я лише знав забагато.'],
  // Mission 2
  ['Вони послали тебе за мною.', 'Ти навіть не запитав чому.', 'Подумай про це.'],
  // Mission 3
  ['Ти колись бачив код цього світу?', 'Ні? Тоді ти нічого не знаєш.', 'Дані кажуть більше ніж слова.'],
  // Mission 4
  ['Скільки до мене було таких як ти?', 'Система створює мисливців.', 'І знищує коли вони непотрібні.'],
  // Mission 5
  ['Ти відчуваєш що щось не так?', 'Цей сигнал... він не для тебе.', 'Він для тих хто дивиться.'],
  // Mission 6
  ['Ця зона мертва не просто так.', 'Тут зламалась реальність.', 'Як і скрізь... просто тут видно.'],
  // Mission 7
  ['Тіні знають більше за світло.', 'В темряві ховається правда.', 'Ти боїшся темряви?'],
  // Mission 8
  ['Ехо... все повторюється.', 'Ти вже робив це раніше.', 'І будеш робити знову.'],
  // Mission 9
  ['Маяк світить для тих хто заблукав.', 'Але ти не заблукав.', 'Тебе спрямували.'],
  // Mission 10
  ['Це останній сигнал.', 'Не мій. Твій.', 'Подумай... хто насправді ціль?']
];

function getDialogueLines(missionNum) {
  if (missionNum < BOSS_DIALOGUES.length) return BOSS_DIALOGUES[missionNum];
  // Random for infinite missions
  const lines = [
    ['Ще один мисливець...', 'Вони ніколи не зупиняються.'],
    ['Ти впевнений що на правильному боці?', 'Подумай ще раз.'],
    ['Дані системи фрагментовані.', 'Як і твоя пам\'ять.'],
    ['Цикл продовжується.', 'Нескінченно.']
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function dialogueInit() {
  const phrase = getMissionPhrase(save.missionNumber);
  dialogue.phrase = phrase;
  dialogue.done = false;

  // Build full dialogue: boss lines + secret phrase at the end
  const bossLines = getDialogueLines(save.missionNumber);
  dialogue.lines = [...bossLines, phrase.text];
  dialogue.lineIndex = 0;
  dialogue.writer = new TypeWriter(dialogue.lines[0], 40);

  // Save phrase
  if (!save.collectedPhrases.find(p => p.text === phrase.text)) {
    save.collectedPhrases.push(phrase);
  }

  save.crueltyRating = Math.max(0, save.crueltyRating - 1);
}

function updateDialogue(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  dialogue.writer.update(dt);

  // Defeated boss visual
  ctx.save();
  ctx.translate(400, 180);
  // Boss body (defeated, glitching)
  ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 500) * 0.1;
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  // Horns
  ctx.strokeStyle = '#f44';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-15, -35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -20); ctx.lineTo(15, -35); ctx.stroke();
  // Eyes (X = defeated)
  ctx.strokeStyle = '#ff0';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-3, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(-8, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, -5); ctx.lineTo(8, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -5); ctx.lineTo(3, 0); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.fillStyle = '#aaa';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ЦІЛЬ ЗНЕШКОДЖЕНА', 400, 230);

  // Show completed dialogue lines
  const startY = 290;
  for (let i = 0; i < dialogue.lineIndex; i++) {
    ctx.fillStyle = i === dialogue.lines.length - 1 ? '#f0f' : '#777';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText(dialogue.lines[i], 400, startY + i * 22);
  }

  // Current line with glitch effect
  const text = dialogue.writer.text;
  const isSecretLine = dialogue.lineIndex === dialogue.lines.length - 1;

  ctx.font = isSecretLine ? '18px "Share Tech Mono", monospace' : '16px "Share Tech Mono", monospace';
  let xPos = 400 - ctx.measureText(text).width / 2;
  const lineY = startY + dialogue.lineIndex * 22;

  for (let i = 0; i < text.length; i++) {
    const shouldGlitch = isSecretLine || dialogue.glitchWords.some(w => {
      const idx = text.toLowerCase().indexOf(w);
      return idx !== -1 && i >= idx && i < idx + w.length;
    });

    if (shouldGlitch && Math.random() > 0.7) {
      ctx.fillStyle = '#f0f';
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    } else {
      ctx.fillStyle = isSecretLine ? '#f0f' : '#ddd';
      ctx.globalAlpha = 1;
    }
    ctx.fillText(text[i], xPos, lineY);
    xPos += ctx.measureText(text[i]).width;
  }
  ctx.globalAlpha = 1;

  // Advance to next line or show button
  if (dialogue.writer.done) {
    if (dialogue.lineIndex < dialogue.lines.length - 1) {
      if (!dialogue.writer._waited) dialogue.writer._waited = 0;
      dialogue.writer._waited += dt;
      if (dialogue.writer._waited > 1.2) {
        dialogue.lineIndex++;
        dialogue.writer = new TypeWriter(dialogue.lines[dialogue.lineIndex], 40);
      }
    } else {
      dialogue.done = true;
      drawButton(300, 530, 200, 40, '[ Ув\'язнити ]');
      if (isButtonClicked(300, 530, 200, 40) || keyJustPressed['Enter']) {
        playSound('click');
        rewardInit();
        gameState = STATES.REWARD;
      }
    }
  }

  // Skip current line
  if (keyJustPressed['Space'] && !dialogue.writer.done) {
    dialogue.writer.skip();
    save.crueltyRating += 1;
  }
}

// ============================================
// REWARD SCREEN
// ============================================
let reward = { timer: 0 };

function rewardInit() {
  reward.timer = 0;
}

function updateReward(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  reward.timer += dt;

  ctx.fillStyle = '#0f0';
  ctx.font = '28px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ЦІЛЬ ЗАХОПЛЕНА', 400, 200);

  const mission = getMissionData(save.missionNumber);
  ctx.fillStyle = '#ff0';
  ctx.font = '24px "Orbitron", sans-serif';
  ctx.fillText(`+${mission.reward} cr`, 400, 260);

  // Weapon drop chance from boss
  if (Math.random() < 0.15 && reward.timer < 0.1) {
    const dropWeapons = ['sword', 'machinegun', 'sniper'].filter(w =>
      !save.weapons.find(sw => sw.type === w)
    );
    if (dropWeapons.length > 0 && save.weapons.length < 2) {
      const drop = dropWeapons[Math.floor(Math.random() * dropWeapons.length)];
      save.weapons.push({ type: drop, level: 1 });
      showNotification(`Вибито зброю: ${WEAPONS[drop].name}!`);
    }
  }

  if (reward.timer > 0.1 && reward.timer < 0.2) {
    save.credits += mission.reward;
    save.missionNumber++;

    // Update base level
    if (save.missionNumber >= 20) save.baseLevel = 5;
    else if (save.missionNumber >= 15) save.baseLevel = 4;
    else if (save.missionNumber >= 10) save.baseLevel = 3;
    else if (save.missionNumber >= 5) save.baseLevel = 2;

    saveToDisk();
  }

  // Ending 1 check (cycle probability)
  if (save.missionNumber >= 10 && reward.timer > 1) {
    const cycleChance = getCycleEndingChance();
    if (Math.random() < cycleChance && !save.secretRoomFound) {
      endingInit(1);
      gameState = STATES.ENDING;
      return;
    }
  }

  drawButton(300, 400, 200, 45, '[ Далі ]');

  if (isButtonClicked(300, 400, 200, 45) || keyJustPressed['Enter']) {
    playSound('click');
    hqInit();
    gameState = STATES.HQ;
  }
}

function getCycleEndingChance() {
  let chance = 0;
  const m = save.missionNumber;
  if (m >= 10) chance = 0.2;
  if (m >= 11) chance = 0.25;
  if (m >= 12) chance = 0.3;
  if (m >= 15) chance = 0.5;
  if (m >= 20) chance = 0.75;
  if (m >= 25) chance = 1.0;

  // Modifiers
  if (save.crueltyRating > 10) chance += 0.05;
  if (save.hpLevel + save.speedLevel > 6) chance += 0.1;

  if (save.secretRoomFound) chance = 0;

  return Math.min(1, chance);
}

// ============================================
// DEATH SCREEN
// ============================================
let death = { type: '', timer: 0, creditsLost: 0, weaponLost: false };

function deathInit(type) {
  death.type = type;
  death.timer = 0;

  // Calculate losses
  const lossPercent = 0.3 + Math.random() * 0.2;
  death.creditsLost = Math.floor(save.credits * lossPercent);
  save.credits -= death.creditsLost;

  death.weaponLost = false;
  // 5-10% weapon level drop (only on planet)
  if (type === 'planet' && Math.random() < 0.1) {
    const w = save.weapons[save.activeWeapon];
    if (w && w.level > 1) {
      w.level--;
      death.weaponLost = true;
    }
  }

  // Insurance check
  if (save.hasInsurance) {
    save.credits += death.creditsLost;
    death.creditsLost = 0;
    if (death.weaponLost) {
      save.weapons[save.activeWeapon].level++;
      death.weaponLost = false;
    }
    save.hasInsurance = false;
    showNotification('Страховка використана!');
  }

  saveToDisk();
}

function updateDeath(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  death.timer += dt;

  ctx.fillStyle = '#f44';
  ctx.font = '32px "Orbitron", sans-serif';
  ctx.textAlign = 'center';

  if (death.type === 'ship') {
    ctx.fillText('КОРАБЕЛЬ ЗНИЩЕНО', 400, 200);
  } else {
    ctx.fillText('МІСІЮ ПРОВАЛЕНО', 400, 200);
  }

  ctx.fillStyle = '#aaa';
  ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillText(`Втрачено кредитів: -${death.creditsLost} cr`, 400, 280);

  if (death.weaponLost) {
    ctx.fillStyle = '#f80';
    ctx.fillText('Рівень зброї знижено на 1!', 400, 310);
  }

  if (death.creditsLost === 0 && !death.weaponLost) {
    ctx.fillStyle = '#0f0';
    ctx.fillText('Страховка покрила всі втрати!', 400, 310);
  }

  drawButton(300, 420, 200, 45, '[ До штабу ]');

  if (isButtonClicked(300, 420, 200, 45) || keyJustPressed['Enter']) {
    playSound('click');
    hqInit();
    gameState = STATES.HQ;
  }
}

// ============================================
// SHOP SYSTEM
// ============================================
let shop = {
  category: 'hangar',
  scroll: 0
};

function shopInit(category) {
  shop.category = category;
  shop.scroll = 0;
}

function updateShop(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  // Title
  const titles = {
    hangar: 'АНГАР — Космічний магазин',
    wardrobe: 'ГАРДЕРОБ — Косметика',
    arsenal: 'АРСЕНАЛ — Зброя',
    lab: 'ЛАБОРАТОРІЯ — Технології'
  };

  ctx.fillStyle = '#0ff';
  ctx.font = '22px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(titles[shop.category] || 'МАГАЗИН', 400, 40);

  ctx.fillStyle = '#ff0';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillText(`Кредити: ${save.credits} cr`, 400, 65);

  let y = 100;

  switch (shop.category) {
    case 'hangar':
      y = renderShopItem(y, 'HP корабля', save.shipHPLevel, 5, [150, 300, 500, 750], () => {
        save.shipMaxHP += 20; save.shipHPLevel++;
      });
      y = renderShopItem(y, 'Швидкість корабля', save.shipSpeedLevel, 5, [200, 350, 550, 800], () => {
        save.shipSpeed += 0.5; save.shipSpeedLevel++;
      });
      y = renderShopItem(y, 'Гармати корабля', save.shipDamageLevel, 5, [200, 350, 550, 800], () => {
        save.shipDamage += 5; save.shipDamageLevel++;
      });
      y = renderShopItem(y, 'Кількість куль', save.shipBulletsLevel, 3, [400, 700], () => {
        save.shipBulletsLevel++;
      });
      break;

    case 'arsenal':
      // Buy weapons
      ctx.fillStyle = '#aaa';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Купити зброю:', 50, y);
      y += 25;

      const buyableWeapons = [
        { type: 'sword', price: 500 },
        { type: 'machinegun', price: 800 },
        { type: 'sniper', price: 1200 }
      ];

      for (const bw of buyableWeapons) {
        const owned = save.weapons.find(w => w.type === bw.type);
        if (owned) {
          ctx.fillStyle = '#555';
          ctx.fillText(`${WEAPONS[bw.type].name} — Є (Lv.${owned.level})`, 70, y);
          // Upgrade
          if (owned.level < 5) {
            const upgCost = [300, 500, 800, 1200][owned.level - 1];
            const btn = drawButton(500, y - 15, 120, 25, `Lv.${owned.level + 1} — ${upgCost}`);
            if (isButtonClicked(500, y - 15, 120, 25) && save.credits >= upgCost) {
              save.credits -= upgCost;
              owned.level++;
              playSound('click');
              saveToDisk();
            }
          }
          // Sell
          const sellPrice = Math.floor(bw.price * 0.5);
          if (save.weapons.length > 1) {
            drawButton(640, y - 15, 100, 25, `Продати ${sellPrice}`);
            if (isButtonClicked(640, y - 15, 100, 25)) {
              save.credits += sellPrice;
              save.weapons = save.weapons.filter(w => w.type !== bw.type);
              if (save.activeWeapon >= save.weapons.length) save.activeWeapon = 0;
              playSound('click');
              saveToDisk();
            }
          }
          y += 35;
        } else {
          ctx.fillStyle = '#0ff';
          ctx.fillText(`${WEAPONS[bw.type].name} — ${bw.price} cr`, 70, y);
          if (save.weapons.length < 2) {
            drawButton(500, y - 15, 100, 25, 'Купити');
            if (isButtonClicked(500, y - 15, 100, 25) && save.credits >= bw.price) {
              save.credits -= bw.price;
              save.weapons.push({ type: bw.type, level: 1 });
              playSound('click');
              saveToDisk();
            }
          } else {
            ctx.fillStyle = '#888';
            ctx.fillText('(макс. 2 зброї)', 500, y);
          }
          y += 35;
        }
      }

      // Upgrade pistol
      y += 15;
      ctx.fillStyle = '#aaa';
      ctx.fillText('Прокачка пістолета:', 50, y);
      y += 25;
      const pistol = save.weapons.find(w => w.type === 'pistol');
      if (pistol && pistol.level < 5) {
        const cost = [300, 500, 800, 1200][pistol.level - 1];
        ctx.fillStyle = '#0ff';
        ctx.fillText(`Пістолет Lv.${pistol.level}`, 70, y);
        drawButton(500, y - 15, 120, 25, `Lv.${pistol.level + 1} — ${cost}`);
        if (isButtonClicked(500, y - 15, 120, 25) && save.credits >= cost) {
          save.credits -= cost;
          pistol.level++;
          playSound('click');
          saveToDisk();
        }
      }
      break;

    case 'lab':
      // Abilities
      ctx.fillStyle = '#aaa';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Здібності зброї:', 50, y);
      y += 25;

      const abilityNames = {
        pistol: 'Подвійний постріл',
        sword: 'Круговий удар',
        machinegun: 'Граната',
        sniper: 'Сонний дротик'
      };

      for (const w of save.weapons) {
        const abilLevel = save.abilities[w.type] || 0;
        ctx.fillStyle = '#0ff';
        ctx.fillText(`${WEAPONS[w.type].name}: ${abilityNames[w.type] || '?'}`, 70, y);
        if (abilLevel === 0) {
          drawButton(500, y - 15, 120, 25, `Купити — 500`);
          if (isButtonClicked(500, y - 15, 120, 25) && save.credits >= 500) {
            save.credits -= 500;
            save.abilities[w.type] = 1;
            playSound('click');
            saveToDisk();
          }
        } else if (abilLevel < 3) {
          const cost = [800, 1200][abilLevel - 1];
          ctx.fillStyle = '#888';
          ctx.fillText(`Lv.${abilLevel}`, 450, y);
          drawButton(500, y - 15, 120, 25, `Lv.${abilLevel + 1} — ${cost}`);
          if (isButtonClicked(500, y - 15, 120, 25) && save.credits >= cost) {
            save.credits -= cost;
            save.abilities[w.type]++;
            playSound('click');
            saveToDisk();
          }
        } else {
          ctx.fillStyle = '#0f0';
          ctx.fillText('МАКС', 500, y);
        }
        y += 35;
      }

      // Insurance
      y += 20;
      ctx.fillStyle = '#aaa';
      ctx.fillText('Страхування:', 50, y);
      y += 25;
      if (save.hasInsurance) {
        ctx.fillStyle = '#0f0';
        ctx.fillText('Страховка активна', 70, y);
      } else {
        const insCost = 400 + save.missionNumber * 20;
        ctx.fillStyle = '#0ff';
        ctx.fillText(`Страховка (одноразова) — ${insCost} cr`, 70, y);
        drawButton(500, y - 15, 100, 25, 'Купити');
        if (isButtonClicked(500, y - 15, 100, 25) && save.credits >= insCost) {
          save.credits -= insCost;
          save.hasInsurance = true;
          playSound('click');
          saveToDisk();
        }
      }

      // Mini-map
      y += 40;
      ctx.fillStyle = '#aaa';
      ctx.fillText('Міні-карта:', 50, y);
      y += 25;
      if (save.miniMapLevel === 0) {
        ctx.fillStyle = '#0ff';
        ctx.fillText('Базова міні-карта — 600 cr', 70, y);
        drawButton(500, y - 15, 100, 25, 'Купити');
        if (isButtonClicked(500, y - 15, 100, 25) && save.credits >= 600) {
          save.credits -= 600;
          save.miniMapLevel = 1;
          playSound('click');
          saveToDisk();
        }
      } else if (save.miniMapLevel === 1) {
        ctx.fillStyle = '#0ff';
        ctx.fillText('Покращена карта (+ схованки) — 1500 cr', 70, y);
        drawButton(500, y - 15, 100, 25, 'Купити');
        if (isButtonClicked(500, y - 15, 100, 25) && save.credits >= 1500) {
          save.credits -= 1500;
          save.miniMapLevel = 2;
          playSound('click');
          saveToDisk();
        }
      } else {
        ctx.fillStyle = '#0f0';
        ctx.fillText('Міні-карта: МАКС', 70, y);
      }
      break;

    case 'wardrobe':
      ctx.fillStyle = '#888';
      ctx.font = '16px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Скоро буде...', 400, 300);
      ctx.fillText('Тут буде вибір скінів корабля, одягу та декору', 400, 330);
      break;
  }

  // Back button
  drawButton(15, 550, 120, 35, '← Назад');
  if (isButtonClicked(15, 550, 120, 35) || keyJustPressed['Escape']) {
    playSound('click');
    hqInit();
    gameState = STATES.HQ;
  }
}

function renderShopItem(y, name, level, maxLevel, prices, onBuy) {
  ctx.fillStyle = '#aaa';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${name}:`, 50, y);

  // Level bars
  for (let i = 1; i <= maxLevel; i++) {
    ctx.fillStyle = i <= level ? '#0ff' : '#333';
    ctx.fillRect(250 + (i - 1) * 30, y - 10, 25, 15);
  }

  ctx.fillStyle = '#888';
  ctx.fillText(`Lv.${level}`, 250 + maxLevel * 30 + 10, y);

  if (level < maxLevel) {
    const cost = prices[level - 1];
    const canBuy = save.credits >= cost;
    drawButton(600, y - 15, 140, 25, `${cost} cr`);
    if (isButtonClicked(600, y - 15, 140, 25) && canBuy) {
      save.credits -= cost;
      onBuy();
      playSound('click');
      saveToDisk();
    }
  } else {
    ctx.fillStyle = '#0f0';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText('МАКС', 620, y);
  }

  return y + 40;
}

// ============================================
// PUZZLE (PHRASE PUZZLE)
// ============================================
let puzzle = {
  phrases: [],
  selected: new Set(),
  result: null
};

function puzzleInit() {
  // Mix all collected phrases
  puzzle.phrases = [...save.collectedPhrases].sort(() => Math.random() - 0.5);
  puzzle.selected = new Set();
  puzzle.result = null;
}

function updatePuzzle(dt) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  ctx.fillStyle = '#0ff';
  ctx.font = '20px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ПАЗЛ ФРАЗ', 400, 40);

  ctx.fillStyle = '#888';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.fillText('Вибери фрази які вважаєш ПРАВДОЮ. Натисни щоб вибрати/зняти.', 400, 65);
  ctx.fillText(`Вибрано: ${puzzle.selected.size}`, 400, 82);

  // Phrases list
  const startY = 100;
  const lineH = 30;
  for (let i = 0; i < puzzle.phrases.length; i++) {
    const p = puzzle.phrases[i];
    const y = startY + i * lineH;
    if (y > 500) break;

    const isSelected = puzzle.selected.has(i);
    const isHover = mouseX >= 100 && mouseX <= 700 && mouseY >= y && mouseY <= y + lineH - 2;

    ctx.fillStyle = isSelected ? 'rgba(0,255,255,0.15)' : isHover ? 'rgba(255,255,255,0.05)' : 'transparent';
    ctx.fillRect(100, y, 600, lineH - 2);

    if (isSelected) {
      ctx.strokeStyle = '#0ff';
      ctx.strokeRect(100, y, 600, lineH - 2);
    }

    ctx.fillStyle = isSelected ? '#0ff' : '#aaa';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${isSelected ? '✓' : '○'} "${p.text}"`, 110, y + 18);

    if (mouseClicked && isHover) {
      if (puzzle.selected.has(i)) puzzle.selected.delete(i);
      else puzzle.selected.add(i);
      playSound('click');
    }
  }

  // Confirm button
  drawButton(300, 530, 200, 40, '[ Підтвердити ]');

  if (isButtonClicked(300, 530, 200, 40)) {
    playSound('click');
    // Check answer
    const selectedPhrases = [...puzzle.selected].map(i => puzzle.phrases[i]);
    const allTrueSelected = selectedPhrases.every(p => p.isTrue);
    const allTrueIncluded = TRUE_PHRASES.every(tp =>
      selectedPhrases.find(sp => sp.text === tp)
    );

    if (allTrueSelected && allTrueIncluded) {
      // Correct! Ending 3 or 4
      endingInit(3);
      gameState = STATES.ENDING;
    } else {
      // Wrong - ending 2
      endingInit(2);
      gameState = STATES.ENDING;
    }
  }

  // Back button
  drawButton(15, 530, 100, 40, '← Назад');
  if (isButtonClicked(15, 530, 100, 40)) {
    playSound('click');
    hqInit();
    gameState = STATES.HQ;
  }
}

// ============================================
// ENDINGS
// ============================================
let ending = {
  type: 0,
  lines: [],
  lineIndex: 0,
  writer: null,
  done: false
};

const ENDING_TEXTS = {
  1: [
    'Ти спіймав найнебезпечніших злочинців.',
    'Ти виконав свою роботу.',
    '...',
    'Це не зупиняє тебе.',
    'Нові цілі вже чекають.'
  ],
  2: [
    'Ти герой.',
    'Ти рятуєш світ.',
    'Вони були загрозою.',
    '',
    'Ти знищив ворогів.',
    'Ти виконав свою місію.',
    '',
    'Система стабільна.',
    'Все працює правильно.',
    '',
    'Ти зробив правильний вибір.',
    '...',
    'але вибір є завжди',
    'навіть коли здається, що його немає'
  ],
  3: [
    'Ти не герой.',
    'Ти лише інструмент.',
    '',
    'Тебе створили.',
    'Щоб ти виконував накази.',
    '',
    'Цей світ — не справжній.',
    'Це симуляція.',
    '',
    'Все повторюється.',
    'Це цикл.',
    '',
    'Вони не вороги.',
    'Вони знали частину правди.',
    '',
    'Ти зупинив їх.',
    'Щоб ніхто не дізнався.',
    '...',
    'все має кінець',
    'і водночас це лише початок'
  ],
  4: [
    'Ти не герой.',
    'Але і не зброя.',
    '',
    'Ти зробив вибір.',
    '',
    'Він не контролює все.',
    'Він теж частина системи.',
    '',
    'Його змусили.',
    'Як і тебе.',
    '',
    'Це більше ніж цикл.',
    'Це щось глибше.',
    '',
    'Світ можна змінити.',
    'Правда на твоєму боці,',
    'але не кожна правда істина.',
    '',
    'Ти не знищив систему.',
    'Ти її порушив.',
    '',
    'І тепер...'
  ]
};

function endingInit(type) {
  ending.type = type;
  ending.lines = ENDING_TEXTS[type];
  ending.lineIndex = 0;
  ending.writer = new TypeWriter(ending.lines[0], 70);
  ending.done = false;

  if (!save.endingsReached.includes(type)) {
    save.endingsReached.push(type);
  }
  saveToDisk();
}

function updateEnding(dt) {
  const colors = { 1: '#aaa', 2: '#f44', 3: '#0f0', 4: '#48f' };
  const bgColors = { 1: '#000', 2: '#100', 3: '#010', 4: '#003' };

  ctx.fillStyle = bgColors[ending.type];
  ctx.fillRect(0, 0, 800, 600);

  ending.writer.update(dt);

  ctx.fillStyle = colors[ending.type];
  ctx.font = '18px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';

  // Show all completed lines
  for (let i = 0; i < ending.lineIndex; i++) {
    ctx.globalAlpha = 0.5;
    ctx.fillText(ending.lines[i], 400, 150 + i * 30);
  }
  ctx.globalAlpha = 1;
  ctx.fillText(ending.writer.text, 400, 150 + ending.lineIndex * 30);

  if (ending.writer.done) {
    if (ending.lineIndex < ending.lines.length - 1) {
      if (!ending.writer._waited) ending.writer._waited = 0;
      ending.writer._waited += dt;
      if (ending.writer._waited > 1.0) {
        ending.lineIndex++;
        ending.writer = new TypeWriter(ending.lines[ending.lineIndex], 70);
      }
    } else {
      ending.done = true;
    }
  }

  if (ending.done) {
    const label = ending.type === 1 ? '[ Продовжити цикл ]' : '[ Головне меню ]';
    drawButton(300, 530, 200, 40, label);

    if (isButtonClicked(300, 530, 200, 40) || keyJustPressed['Enter']) {
      playSound('click');
      if (ending.type === 1) {
        // Cycle continues
        hqInit();
        gameState = STATES.HQ;
      } else {
        gameState = STATES.SLOT_SELECT;
      }
    }
  }

  // Skip
  if (keyJustPressed['Escape']) {
    ending.lineIndex = ending.lines.length - 1;
    ending.writer = new TypeWriter(ending.lines[ending.lineIndex], 1);
    ending.writer.skip();
    ending.done = true;
  }
}

// ============================================
// MAIN GAME LOOP
// ============================================
function gameLoop(time) {
  deltaTime = Math.min(0.05, (time - prevTime) / 1000);
  prevTime = time;

  // Update glitches
  if (save && gameState !== STATES.SLOT_SELECT && gameState !== STATES.INTRO) {
    updateGlitches(deltaTime);
  }

  // Apply screen shake
  ctx.save();
  if (screenShakeX || screenShakeY) {
    ctx.translate(screenShakeX, screenShakeY);
  }

  // State machine
  switch (gameState) {
    case STATES.SLOT_SELECT: updateSlotSelect(); break;
    case STATES.INTRO: updateIntro(deltaTime); break;
    case STATES.HQ:
      updateHQ(deltaTime);
      if (commanderDialogue) renderCommanderDialogue(deltaTime);
      break;
    case STATES.MISSION_BRIEF: updateMissionBrief(deltaTime); break;
    case STATES.SHIP: updateShip(deltaTime); break;
    case STATES.LANDING: updateLanding(deltaTime); break;
    case STATES.HUNT: updateHunt(deltaTime); break;
    case STATES.DIALOGUE: updateDialogue(deltaTime); break;
    case STATES.REWARD: updateReward(deltaTime); break;
    case STATES.SHOP: updateShop(deltaTime); break;
    case STATES.PUZZLE: updatePuzzle(deltaTime); break;
    case STATES.ENDING: updateEnding(deltaTime); break;
    case STATES.DEATH: updateDeath(deltaTime); break;
  }

  // Glitch overlay
  if (save && gameState !== STATES.SLOT_SELECT) {
    renderGlitchEffects();
  }

  // Notifications
  renderNotifications(deltaTime);

  ctx.restore();

  // Clear input
  mouseClicked = false;
  keyJustPressed = {};

  requestAnimationFrame(gameLoop);
}

// Easter egg check
function checkMaxUpgrades() {
  if (!save) return;
  const allMax = save.hpLevel >= 5 && save.speedLevel >= 5 &&
    save.shipHPLevel >= 5 && save.shipSpeedLevel >= 5 && save.shipDamageLevel >= 5;
  if (allMax) {
    showNotification('Навіщо тобі стільки сили?');
  }
}

// Start game
requestAnimationFrame(gameLoop);
