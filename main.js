// ============================================
// POLУVANNYA — Space Bounty Hunter Game
// Full game cycle: intro → mission → ship → hunt → battle → dialogue → reward → shop
// ============================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ============================================
// GAME STATE
// ============================================
const STATES = {
  INTRO: 'intro',
  MISSION: 'mission',
  SHIP: 'ship',
  HUNT: 'hunt',
  DIALOGUE: 'dialogue',
  CAPTURE: 'capture',
  REWARD: 'reward',
  SHOP: 'shop'
};

let gameState = STATES.INTRO;
let prevTime = 0;
let deltaTime = 0;

// ============================================
// INPUT SYSTEM
// ============================================
const keys = {};
let mouseX = 0, mouseY = 0;
let mouseClicked = false;

document.addEventListener('keydown', e => {
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
// PLAYER DATA (persists between missions)
// ============================================
let player = {
  maxHp: 100,
  hp: 100,
  attack: 15,
  speed: 3,
  weaponLevel: 1,
  credits: 0,
  missionLevel: 1,
  hpUpgrades: 0,
  attackUpgrades: 0,
  speedUpgrades: 0,
  weaponUpgrades: 0
};

// Hidden story phrases collected (player never sees this)
let hiddenPhrases = [];

// Load saved data
function loadGame() {
  try {
    const saved = localStorage.getItem('poluvannya_save');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(player, data.player);
      hiddenPhrases = data.hiddenPhrases || [];
    }
  } catch(e) {}
}

function saveGame() {
  try {
    localStorage.setItem('poluvannya_save', JSON.stringify({
      player,
      hiddenPhrases
    }));
  } catch(e) {}
}

loadGame();

// ============================================
// MISSIONS DATA
// ============================================
const MISSIONS = [
  {
    name: 'Місія: Тінь на Кеплері',
    desc: 'Ціль помічена на планеті Кеплер-442b.\nНебезпечний злочинець. Діяти швидко.',
    reward: 150,
    enemyCount: 2,
    bossHp: 80,
    bossAttack: 8,
    enemyHp: 30,
    enemySpeed: 1.2,
    planetColor: '#1a3a2a',
    npcPhrases: [
      'Ти думаєш це просто робота?',
      'Вони тобі не все сказали...',
      'Подивись навколо. Це справжнє?',
      'Ти тут не маєш бути...',
    ],
    glitchPhrase: 'система_нереальна'
  },
  {
    name: 'Місія: Втікач зі Станції',
    desc: 'Втікач переховується на орбітальній станції.\nМожливий опір. Захопити живим.',
    reward: 200,
    enemyCount: 3,
    bossHp: 120,
    bossAttack: 12,
    enemyHp: 40,
    enemySpeed: 1.5,
    planetColor: '#2a1a3a',
    npcPhrases: [
      'Ти не розумієш що робиш.',
      'Я бачив код...',
      'Світ виглядає нормальним...',
      'але це не так...',
      'Ми всі — дані.',
    ],
    glitchPhrase: 'свідомість_заблокована'
  },
  {
    name: 'Місія: Привид Андромеди',
    desc: 'Невідомий сигнал з покинутої колонії.\nОстання місія перед просуванням.',
    reward: 300,
    enemyCount: 3,
    bossHp: 160,
    bossAttack: 15,
    enemyHp: 50,
    enemySpeed: 1.8,
    planetColor: '#3a2a1a',
    npcPhrases: [
      'Знову ти...',
      'Скільки разів ми вже тут були?',
      'Світ — це брехня.',
      'Ти програма, як і я.',
      'Вони перезапустять нас знову.',
      'Запам\'ятай це слово...',
    ],
    glitchPhrase: 'петля_нескінченна'
  },
  {
    name: 'Місія: Протокол Омега',
    desc: 'Надсекретна ціль. Рівень загрози — максимальний.\nПоліція не гарантує підтримку.',
    reward: 400,
    enemyCount: 4,
    bossHp: 200,
    bossAttack: 18,
    enemyHp: 60,
    enemySpeed: 2.0,
    planetColor: '#3a1a1a',
    npcPhrases: [
      'Ти прийшов за мною?',
      'Або я прийшов за тобою?',
      'Межі стираються...',
      'Хто написав цей сценарій?',
      'Ти відчуваєш затримку?',
      'Це не лаг. Це правда.',
    ],
    glitchPhrase: 'архітектор_спостерігає'
  },
  {
    name: 'Місія: Останній Сигнал',
    desc: 'Невідоме джерело транслює координати.\nЦе може бути пастка. Або правда.',
    reward: 500,
    enemyCount: 5,
    bossHp: 250,
    bossAttack: 22,
    enemyHp: 70,
    enemySpeed: 2.2,
    planetColor: '#1a1a3a',
    npcPhrases: [
      'Нарешті...',
      'Ти дійшов до кінця.',
      'Або до початку.',
      'Все що ти збирав — це ключ.',
      'Система має вихід.',
      'Але чи хочеш ти вийти?',
      'Ти більше ніж мисливець.',
    ],
    glitchPhrase: 'вихід_знайдено'
  }
];

function getCurrentMission() {
  const idx = Math.min(player.missionLevel - 1, MISSIONS.length - 1);
  return MISSIONS[idx];
}

// ============================================
// GLITCH SYSTEM
// ============================================
const glitchMessages = [
  'помилка системи',
  'дані пошкоджено',
  'сигнал нестабільний',
  'з\'єднання перервано',
  'невідомий протокол',
  'пам\'ять фрагментована',
  'цикл порушено'
];

let glitchTimer = 0;
let glitchActive = false;
let glitchText = '';
let glitchAlpha = 0;
let controlGlitch = false;
let screenGlitch = false;
let screenGlitchTimer = 0;

function updateGlitch(dt) {
  glitchTimer -= dt;
  if (glitchTimer <= 0) {
    glitchTimer = 8 + Math.random() * 15;
    if (Math.random() < 0.3) {
      glitchActive = true;
      glitchText = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
      glitchAlpha = 1;
    }
    if (Math.random() < 0.15) {
      controlGlitch = true;
      setTimeout(() => controlGlitch = false, 300 + Math.random() * 500);
    }
    if (Math.random() < 0.2) {
      screenGlitch = true;
      screenGlitchTimer = 0.2 + Math.random() * 0.3;
    }
  }
  if (glitchActive) {
    glitchAlpha -= dt * 0.5;
    if (glitchAlpha <= 0) glitchActive = false;
  }
  if (screenGlitch) {
    screenGlitchTimer -= dt;
    if (screenGlitchTimer <= 0) screenGlitch = false;
  }
}

function drawGlitchOverlay() {
  if (glitchActive && glitchAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = glitchAlpha * 0.8;
    ctx.fillStyle = '#0f0';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('> ' + glitchText, canvas.width / 2, 30);
    ctx.restore();
  }
  if (screenGlitch) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * canvas.height;
      const h = 2 + Math.random() * 8;
      const shift = (Math.random() - 0.5) * 20;
      ctx.drawImage(canvas, 0, y, canvas.width, h, shift, y, canvas.width, h);
    }
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = Math.random() > 0.5 ? '#f00' : '#0ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

// ============================================
// STARS BACKGROUND
// ============================================
const stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * 800,
    y: Math.random() * 600,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 30 + 10,
    brightness: Math.random()
  });
}

function drawStars(scrollSpeed) {
  stars.forEach(s => {
    s.y += s.speed * deltaTime * (scrollSpeed || 1);
    if (s.y > 600) { s.y = 0; s.x = Math.random() * 800; }
    s.brightness += (Math.random() - 0.5) * 0.1;
    s.brightness = Math.max(0.3, Math.min(1, s.brightness));
    ctx.fillStyle = `rgba(200, 220, 255, ${s.brightness})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
}

// ============================================
// UI HELPERS
// ============================================
function drawButton(text, x, y, w, h) {
  ctx.save();
  const isHover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

  ctx.strokeStyle = isHover ? '#0ff' : '#0aa';
  ctx.lineWidth = isHover ? 2 : 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = isHover ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = isHover ? '#0ff' : '#0cc';
  ctx.font = '16px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.textBaseline = 'alphabetic';

  ctx.restore();
  return isHover;
}

function isButtonClicked(x, y, w, h) {
  return mouseClicked &&
    mouseX >= x && mouseX <= x + w &&
    mouseY >= y && mouseY <= y + h;
}

function drawHPBar(x, y, w, h, current, max, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x, y, w, h);
  const ratio = Math.max(0, current / max);
  ctx.fillStyle = color || '#0f0';
  ctx.fillRect(x, y, w * ratio, h);
  ctx.strokeStyle = '#555';
  ctx.strokeRect(x, y, w, h);
}

// ============================================
// INTRO STATE
// ============================================
let introPhase = 0;
let introTimer = 0;
const introTexts = [
  'Тебе найняли.',
  'Космічна поліція шукає мисливців.',
  'Ти виконуєш завдання без питань.'
];
let introTextIndex = 0;
let introCharIndex = 0;
let introCurrentText = '';

function initIntro() {
  introPhase = 0;
  introTimer = 0;
  introTextIndex = 0;
  introCharIndex = 0;
  introCurrentText = '';
}

function updateIntro(dt) {
  introTimer += dt;

  if (introPhase === 0) {
    if (introTextIndex < introTexts.length) {
      introCharIndex += dt * 20;
      const idx = Math.floor(introCharIndex);
      if (idx >= introTexts[introTextIndex].length) {
        introCurrentText = introTexts[introTextIndex];
        introTimer = 0;
        introPhase = 1;
      } else {
        introCurrentText = introTexts[introTextIndex].substring(0, idx);
      }
    }
  } else if (introPhase === 1) {
    if (introTimer > 1.5) {
      introTextIndex++;
      if (introTextIndex < introTexts.length) {
        introCharIndex = 0;
        introCurrentText = '';
        introPhase = 0;
        introTimer = 0;
      } else {
        introPhase = 2;
      }
    }
  }

  if (introPhase === 2) {
    if (isButtonClicked(300, 420, 200, 50)) {
      gameState = STATES.MISSION;
      initMission();
    }
  }
}

function drawIntro() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  drawStars(0.3);

  ctx.font = '18px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';

  for (let i = 0; i < introTextIndex && i < introTexts.length; i++) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.fillText(introTexts[i], 400, 200 + i * 40);
  }

  if (introTextIndex < introTexts.length) {
    ctx.fillStyle = '#0ff';
    ctx.fillText(introCurrentText + (Math.floor(introTimer * 3) % 2 === 0 ? '█' : ''), 400, 200 + introTextIndex * 40);
  }

  if (introPhase === 2) {
    drawButton('[ Почати ]', 300, 420, 200, 50);
  }

  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.textAlign = 'center';
  ctx.fillText('POLUVANNYA v1.0', 400, 570);
}

// ============================================
// MISSION STATE
// ============================================
let missionFadeIn = 0;

function initMission() {
  missionFadeIn = 0;
}

function updateMission(dt) {
  missionFadeIn = Math.min(1, missionFadeIn + dt * 2);

  if (isButtonClicked(300, 450, 200, 50)) {
    gameState = STATES.SHIP;
    initShip();
  }
}

function drawMission() {
  const mission = getCurrentMission();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  drawStars(0.3);

  ctx.save();
  ctx.globalAlpha = missionFadeIn;

  ctx.fillStyle = '#0ff';
  ctx.font = '10px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('INCOMING TRANSMISSION', 400, 120);

  ctx.strokeStyle = '#0aa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 140);
  ctx.lineTo(600, 140);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '24px "Orbitron", sans-serif';
  ctx.fillText(mission.name, 400, 190);

  ctx.fillStyle = '#aaa';
  ctx.font = '16px "Share Tech Mono", monospace';
  const lines = mission.desc.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 400, 250 + i * 30);
  });

  ctx.fillStyle = '#0a0';
  ctx.font = '14px "Share Tech Mono", monospace';
  const threatLevel = Math.min(player.missionLevel, 5);
  let threatStars = '';
  for (let i = 0; i < threatLevel; i++) threatStars += '*';
  ctx.fillText('Рівень загрози: ' + threatStars, 400, 360);
  ctx.fillStyle = '#ff0';
  ctx.fillText('Нагорода: ' + mission.reward + ' кредитів', 400, 390);

  ctx.restore();

  drawButton('[ Відправитись ]', 300, 450, 200, 50);
}

// ============================================
// SHIP MINI-GAME (top-down shooter, survive 20s)
// ============================================
let ship = {};
let shipBullets = [];
let shipEnemies = [];
let shipTimer = 0;
let shipSpawnTimer = 0;
let shipParticles = [];
let shipGlitchMsg = '';
let shipGlitchTimer = 0;

function initShip() {
  ship = {
    x: 400, y: 480,
    w: 30, h: 30,
    hp: player.maxHp,
    shootCooldown: 0
  };
  shipBullets = [];
  shipEnemies = [];
  shipParticles = [];
  shipTimer = 0;
  shipSpawnTimer = 0;
  shipGlitchMsg = '';
  shipGlitchTimer = 0;
}

function updateShip(dt) {
  shipTimer += dt;

  // Player movement
  const spd = (player.speed + 2) * 60 * dt;
  if (!controlGlitch) {
    if (keys['KeyW'] || keys['ArrowUp']) ship.y -= spd;
    if (keys['KeyS'] || keys['ArrowDown']) ship.y += spd;
    if (keys['KeyA'] || keys['ArrowLeft']) ship.x -= spd;
    if (keys['KeyD'] || keys['ArrowRight']) ship.x += spd;
  } else {
    if (keys['KeyW'] || keys['ArrowUp']) ship.y += spd * 0.5;
    if (keys['KeyS'] || keys['ArrowDown']) ship.y -= spd * 0.5;
  }
  ship.x = Math.max(15, Math.min(785, ship.x));
  ship.y = Math.max(15, Math.min(585, ship.y));

  // Shooting
  ship.shootCooldown -= dt;
  if (keys['Space'] && ship.shootCooldown <= 0) {
    // Glitch: sometimes bullets don't fire
    if (Math.random() > 0.1) {
      shipBullets.push({ x: ship.x, y: ship.y - 15, w: 3, h: 10 });
      if (player.weaponLevel >= 2) {
        shipBullets.push({ x: ship.x - 10, y: ship.y - 10, w: 3, h: 10 });
        shipBullets.push({ x: ship.x + 10, y: ship.y - 10, w: 3, h: 10 });
      }
      if (player.weaponLevel >= 3) {
        shipBullets.push({ x: ship.x - 18, y: ship.y - 5, w: 3, h: 10 });
        shipBullets.push({ x: ship.x + 18, y: ship.y - 5, w: 3, h: 10 });
      }
    } else {
      shipGlitchMsg = 'зброя: збій';
      shipGlitchTimer = 1;
    }
    ship.shootCooldown = 0.15;
  }

  // Update bullets
  shipBullets = shipBullets.filter(b => {
    b.y -= 500 * dt;
    return b.y > -10;
  });

  // Spawn enemies
  shipSpawnTimer -= dt;
  if (shipSpawnTimer <= 0) {
    const mission = getCurrentMission();
    shipSpawnTimer = 1.5 - Math.min(shipTimer * 0.02, 0.8);
    shipEnemies.push({
      x: 30 + Math.random() * 740,
      y: -20,
      w: 25, h: 25,
      hp: 10 + player.missionLevel * 5,
      speed: (60 + Math.random() * 40 + shipTimer * 2) * (mission.enemySpeed / 1.5),
      frozen: false,
      frozenTimer: 0
    });
  }

  // Update enemies
  shipEnemies = shipEnemies.filter(e => {
    // Glitch: enemies freeze
    if (e.frozen) {
      e.frozenTimer -= dt;
      if (e.frozenTimer <= 0) e.frozen = false;
      return true;
    }
    if (Math.random() < 0.002) {
      e.frozen = true;
      e.frozenTimer = 0.5 + Math.random() * 1;
      return true;
    }

    e.y += e.speed * dt;

    // Bullet collision
    for (let i = shipBullets.length - 1; i >= 0; i--) {
      const b = shipBullets[i];
      if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15) {
        e.hp -= player.attack;
        shipBullets.splice(i, 1);
        for (let p = 0; p < 4; p++) {
          shipParticles.push({
            x: e.x, y: e.y,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            life: 0.5, color: '#f80'
          });
        }
        break;
      }
    }

    if (e.hp <= 0) {
      for (let p = 0; p < 10; p++) {
        shipParticles.push({
          x: e.x, y: e.y,
          vx: (Math.random() - 0.5) * 200,
          vy: (Math.random() - 0.5) * 200,
          life: 0.8,
          color: Math.random() > 0.5 ? '#ff0' : '#f80'
        });
      }
      return false;
    }

    // Player collision
    if (Math.abs(e.x - ship.x) < 20 && Math.abs(e.y - ship.y) < 20) {
      ship.hp -= 15;
      return false;
    }

    return e.y < 620;
  });

  // Particles
  shipParticles = shipParticles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    return p.life > 0;
  });

  if (shipGlitchTimer > 0) shipGlitchTimer -= dt;

  // Win: survive 20 seconds
  if (shipTimer >= 20) {
    gameState = STATES.HUNT;
    initHunt();
  }

  // Death: restart ship phase
  if (ship.hp <= 0) {
    initShip();
  }
}

function drawShip() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  drawStars(2);

  // Timer
  const remaining = Math.max(0, 20 - shipTimer);
  ctx.fillStyle = '#0ff';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('До прибуття: ' + remaining.toFixed(1) + 'с', 780, 25);

  // HP
  ctx.textAlign = 'left';
  ctx.fillText('HP', 20, 25);
  drawHPBar(50, 14, 150, 14, ship.hp, player.maxHp, '#0f0');

  // Player ship
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.fillStyle = '#0cf';
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(-12, 12);
  ctx.lineTo(0, 6);
  ctx.lineTo(12, 12);
  ctx.closePath();
  ctx.fill();
  // Engine glow
  ctx.fillStyle = 'rgba(0, 200, 255, ' + (0.3 + Math.random() * 0.3) + ')';
  ctx.fillRect(-4, 8, 8, 5 + Math.random() * 5);
  ctx.restore();

  // Bullets
  ctx.fillStyle = '#ff0';
  shipBullets.forEach(b => {
    ctx.fillRect(b.x - 1.5, b.y - 5, 3, 10);
  });

  // Enemies
  shipEnemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.frozen) ctx.globalAlpha = 0.4 + Math.random() * 0.3;
    ctx.fillStyle = '#f44';
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(-12, -10);
    ctx.lineTo(0, -4);
    ctx.lineTo(12, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Particles
  shipParticles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;

  // Glitch msg
  if (shipGlitchTimer > 0) {
    ctx.fillStyle = '#f00';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(shipGlitchMsg, 400, 560);
  }

  // Random "signal unstable"
  if (Math.random() < 0.01) {
    ctx.fillStyle = '#0f0';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('сигнал нестабільний', 400, 300);
  }
}

// ============================================
// HUNT STATE (top-down planet exploration + combat)
// ============================================
let hunter = {};
let huntEnemies = [];
let huntBoss = null;
let huntBullets = [];
let huntParticles = [];
let huntCamera = { x: 0, y: 0 };
const HUNT_MAP_W = 1200;
const HUNT_MAP_H = 900;
let huntObstacles = [];

function initHunt() {
  const mission = getCurrentMission();
  hunter = {
    x: 600, y: 750,
    w: 20, h: 20,
    hp: player.maxHp,
    shootCooldown: 0,
    facing: -Math.PI / 2,
    invincible: 0
  };
  huntBullets = [];
  huntParticles = [];

  // Obstacles
  huntObstacles = [];
  for (let i = 0; i < 15; i++) {
    huntObstacles.push({
      x: 50 + Math.random() * (HUNT_MAP_W - 100),
      y: 50 + Math.random() * (HUNT_MAP_H - 200),
      w: 20 + Math.random() * 40,
      h: 20 + Math.random() * 40
    });
  }

  // Enemies
  huntEnemies = [];
  for (let i = 0; i < mission.enemyCount; i++) {
    huntEnemies.push({
      x: 200 + Math.random() * 800,
      y: 100 + Math.random() * 400,
      w: 18, h: 18,
      hp: mission.enemyHp,
      maxHp: mission.enemyHp,
      speed: mission.enemySpeed,
      shootTimer: 2 + Math.random() * 3,
      type: 'guard'
    });
  }

  // Boss
  huntBoss = {
    x: 600, y: 200,
    w: 28, h: 28,
    hp: mission.bossHp,
    maxHp: mission.bossHp,
    speed: mission.enemySpeed * 0.8,
    shootTimer: 1.5,
    attack: mission.bossAttack,
    type: 'boss',
    defeated: false,
    moveAngle: Math.random() * Math.PI * 2,
    moveTimer: 0
  };
}

function updateHunt(dt) {
  // Player movement
  const spd = (player.speed + 1.5) * 60 * dt;
  let dx = 0, dy = 0;
  if (!controlGlitch) {
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  }
  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    hunter.x += (dx / len) * spd;
    hunter.y += (dy / len) * spd;
    hunter.facing = Math.atan2(dy, dx);
  }
  hunter.x = Math.max(10, Math.min(HUNT_MAP_W - 10, hunter.x));
  hunter.y = Math.max(10, Math.min(HUNT_MAP_H - 10, hunter.y));

  if (hunter.invincible > 0) hunter.invincible -= dt;

  // Shooting
  hunter.shootCooldown -= dt;
  if (keys['Space'] && hunter.shootCooldown <= 0) {
    hunter.shootCooldown = 0.25 - player.weaponLevel * 0.03;
    huntBullets.push({
      x: hunter.x, y: hunter.y,
      vx: Math.cos(hunter.facing) * 350,
      vy: Math.sin(hunter.facing) * 350,
      damage: player.attack,
      owner: 'player'
    });
  }

  // Camera
  huntCamera.x = Math.max(0, Math.min(HUNT_MAP_W - 800, hunter.x - 400));
  huntCamera.y = Math.max(0, Math.min(HUNT_MAP_H - 600, hunter.y - 300));

  // Enemies
  huntEnemies = huntEnemies.filter(e => {
    const edx = hunter.x - e.x;
    const edy = hunter.y - e.y;
    const dist = Math.sqrt(edx * edx + edy * edy);

    if (dist > 40) {
      e.x += (edx / dist) * e.speed * 60 * dt;
      e.y += (edy / dist) * e.speed * 60 * dt;
    }

    e.shootTimer -= dt;
    if (e.shootTimer <= 0 && dist < 400) {
      e.shootTimer = 2 + Math.random() * 2;
      huntBullets.push({
        x: e.x, y: e.y,
        vx: (edx / dist) * 200,
        vy: (edy / dist) * 200,
        damage: 8 + player.missionLevel * 2,
        owner: 'enemy'
      });
    }

    if (dist < 25 && hunter.invincible <= 0) {
      hunter.hp -= 10;
      hunter.invincible = 0.5;
    }

    return e.hp > 0;
  });

  // Boss
  if (huntBoss && !huntBoss.defeated) {
    const bdx = hunter.x - huntBoss.x;
    const bdy = hunter.y - huntBoss.y;
    const bdist = Math.sqrt(bdx * bdx + bdy * bdy);

    huntBoss.moveTimer -= dt;
    if (huntBoss.moveTimer <= 0) {
      huntBoss.moveTimer = 1 + Math.random() * 2;
      huntBoss.moveAngle = Math.atan2(bdy, bdx) + (Math.random() - 0.5) * 1;
    }
    huntBoss.x += Math.cos(huntBoss.moveAngle) * huntBoss.speed * 60 * dt;
    huntBoss.y += Math.sin(huntBoss.moveAngle) * huntBoss.speed * 60 * dt;
    huntBoss.x = Math.max(30, Math.min(HUNT_MAP_W - 30, huntBoss.x));
    huntBoss.y = Math.max(30, Math.min(HUNT_MAP_H - 30, huntBoss.y));

    huntBoss.shootTimer -= dt;
    if (huntBoss.shootTimer <= 0 && bdist < 500) {
      huntBoss.shootTimer = 1.2 - player.missionLevel * 0.05;
      const shots = player.missionLevel >= 3 ? 3 : 1;
      for (let s = 0; s < shots; s++) {
        const spread = (s - (shots - 1) / 2) * 0.3;
        const angle = Math.atan2(bdy, bdx) + spread;
        huntBullets.push({
          x: huntBoss.x, y: huntBoss.y,
          vx: Math.cos(angle) * 220,
          vy: Math.sin(angle) * 220,
          damage: huntBoss.attack,
          owner: 'enemy'
        });
      }
    }

    if (bdist < 30 && hunter.invincible <= 0) {
      hunter.hp -= huntBoss.attack;
      hunter.invincible = 0.5;
    }

    if (huntBoss.hp <= 0) {
      huntBoss.defeated = true;
      setTimeout(() => {
        gameState = STATES.DIALOGUE;
        initDialogue();
      }, 1000);
    }
  }

  // Bullets
  huntBullets = huntBullets.filter(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < -20 || b.x > HUNT_MAP_W + 20 || b.y < -20 || b.y > HUNT_MAP_H + 20) return false;

    if (b.owner === 'player') {
      for (const e of huntEnemies) {
        if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15) {
          e.hp -= b.damage;
          spawnHuntParticles(b.x, b.y, '#f80', 4);
          return false;
        }
      }
      if (huntBoss && !huntBoss.defeated) {
        if (Math.abs(b.x - huntBoss.x) < 20 && Math.abs(b.y - huntBoss.y) < 20) {
          huntBoss.hp -= b.damage;
          spawnHuntParticles(b.x, b.y, '#ff0', 6);
          return false;
        }
      }
    } else {
      if (Math.abs(b.x - hunter.x) < 12 && Math.abs(b.y - hunter.y) < 12 && hunter.invincible <= 0) {
        hunter.hp -= b.damage;
        hunter.invincible = 0.3;
        spawnHuntParticles(hunter.x, hunter.y, '#f00', 5);
        return false;
      }
    }
    return true;
  });

  // Particles
  huntParticles = huntParticles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    return p.life > 0;
  });

  // Death
  if (hunter.hp <= 0) {
    initHunt();
  }
}

function spawnHuntParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    huntParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 150,
      vy: (Math.random() - 0.5) * 150,
      life: 0.4 + Math.random() * 0.3,
      color
    });
  }
}

function drawHunt() {
  const mission = getCurrentMission();
  ctx.save();
  ctx.translate(-huntCamera.x, -huntCamera.y);

  // Background
  ctx.fillStyle = mission.planetColor;
  ctx.fillRect(0, 0, HUNT_MAP_W, HUNT_MAP_H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < HUNT_MAP_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HUNT_MAP_H); ctx.stroke();
  }
  for (let y = 0; y < HUNT_MAP_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(HUNT_MAP_W, y); ctx.stroke();
  }

  // Obstacles
  ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
  huntObstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });

  // Enemies
  huntEnemies.forEach(e => {
    ctx.fillStyle = '#f55';
    ctx.fillRect(e.x - 9, e.y - 9, 18, 18);
    ctx.strokeStyle = '#f88';
    ctx.strokeRect(e.x - 9, e.y - 9, 18, 18);
    drawHPBar(e.x - 15, e.y - 18, 30, 4, e.hp, e.maxHp, '#f44');
  });

  // Boss
  if (huntBoss) {
    const b = huntBoss;
    if (!b.defeated) {
      ctx.fillStyle = '#f0f';
      ctx.fillRect(b.x - 14, b.y - 14, 28, 28);
      ctx.strokeStyle = '#f8f';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x - 14, b.y - 14, 28, 28);
      ctx.lineWidth = 1;
      drawHPBar(b.x - 25, b.y - 24, 50, 5, b.hp, b.maxHp, '#f0f');
      ctx.fillStyle = '#f0f';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ЦІЛЬ', b.x, b.y - 30);
    } else {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.2;
      ctx.fillStyle = '#808';
      ctx.fillRect(b.x - 14, b.y - 14, 28, 28);
      ctx.globalAlpha = 1;
    }
  }

  // Player
  if (!(hunter.invincible > 0 && Math.floor(hunter.invincible * 10) % 2 === 0)) {
    ctx.fillStyle = '#0cf';
    ctx.save();
    ctx.translate(hunter.x, hunter.y);
    ctx.rotate(hunter.facing);
    ctx.fillRect(-10, -8, 20, 16);
    ctx.fillStyle = '#0ff';
    ctx.fillRect(8, -3, 8, 6);
    ctx.restore();
  }

  // Bullets
  huntBullets.forEach(b => {
    ctx.fillStyle = b.owner === 'player' ? '#0ff' : '#f44';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Particles
  huntParticles.forEach(p => {
    ctx.globalAlpha = p.life * 2;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;

  ctx.restore();

  // HUD
  ctx.fillStyle = '#0ff';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP', 20, 25);
  drawHPBar(50, 14, 150, 14, hunter.hp, player.maxHp, '#0f0');

  if (huntBoss && !huntBoss.defeated) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0f';
    ctx.font = '12px "Orbitron", sans-serif';
    ctx.fillText('ЦІЛЬ', 400, 20);
    drawHPBar(300, 28, 200, 8, huntBoss.hp, huntBoss.maxHp, '#f0f');
  }

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('WASD — рух | ПРОБІЛ — стрільба', 20, 585);
}

// ============================================
// DIALOGUE STATE
// ============================================
let dialogPhrases = [];
let dialogIndex = 0;
let dialogCharIndex = 0;
let dialogCurrentText = '';
let dialogPhase = 0;
let dialogTimer = 0;
let dialogGlitchWords = [];

function initDialogue() {
  const mission = getCurrentMission();
  dialogPhrases = [...mission.npcPhrases];
  dialogIndex = 0;
  dialogCharIndex = 0;
  dialogCurrentText = '';
  dialogPhase = 0;
  dialogTimer = 0;
  dialogGlitchWords = ['не маєш', 'брехня', 'не так', 'дані', 'код', 'програма', 'петля', 'вихід', 'система', 'нереальн'];
}

function updateDialogue(dt) {
  dialogTimer += dt;

  if (dialogPhase === 0) {
    dialogCharIndex += dt * 18;
    const idx = Math.floor(dialogCharIndex);
    if (idx >= dialogPhrases[dialogIndex].length) {
      dialogCurrentText = dialogPhrases[dialogIndex];
      dialogPhase = 1;
      dialogTimer = 0;
    } else {
      dialogCurrentText = dialogPhrases[dialogIndex].substring(0, idx);
    }
  } else if (dialogPhase === 1) {
    if (dialogTimer > 2 || mouseClicked || keys['Space']) {
      dialogIndex++;
      if (dialogIndex < dialogPhrases.length) {
        dialogCharIndex = 0;
        dialogCurrentText = '';
        dialogPhase = 0;
        dialogTimer = 0;
      } else {
        dialogPhase = 2;
        // Silently collect hidden phrase
        const mission = getCurrentMission();
        if (mission.glitchPhrase && !hiddenPhrases.includes(mission.glitchPhrase)) {
          hiddenPhrases.push(mission.glitchPhrase);
          saveGame();
        }
      }
    }
  } else if (dialogPhase === 2) {
    if (isButtonClicked(300, 480, 200, 50)) {
      gameState = STATES.REWARD;
      initReward();
    }
  }
}

function drawDialogue() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  const mission = getCurrentMission();
  ctx.fillStyle = mission.planetColor;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, 800, 600);
  ctx.globalAlpha = 1;

  // NPC
  ctx.fillStyle = '#808';
  ctx.fillRect(370, 180, 60, 60);
  ctx.strokeStyle = '#f0f';
  ctx.strokeRect(370, 180, 60, 60);
  ctx.fillStyle = '#f0f';
  ctx.font = '10px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ЦІЛЬ', 400, 260);

  // Dialogue box
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(100, 320, 600, 120);
  ctx.strokeStyle = '#0aa';
  ctx.strokeRect(100, 320, 600, 120);

  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';

  const startIdx = Math.max(0, dialogIndex - 2);
  for (let i = startIdx; i < dialogIndex; i++) {
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.fillText(dialogPhrases[i], 120, 345 + (i - startIdx) * 22);
  }

  if (dialogIndex < dialogPhrases.length) {
    const yPos = 345 + Math.min(2, dialogIndex - startIdx) * 22;
    drawGlitchText(dialogCurrentText, 120, yPos);

    if (dialogPhase === 0 && Math.floor(dialogTimer * 3) % 2 === 0) {
      ctx.fillStyle = '#0ff';
      ctx.fillText('_', 120 + ctx.measureText(dialogCurrentText).width, yPos);
    }
  }

  if (dialogPhase === 1) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ клікніть щоб продовжити ]', 400, 460);
  }

  if (dialogPhase === 2) {
    drawButton("[ Ув'язнити ]", 300, 480, 200, 50);
  }
}

function drawGlitchText(text, x, y) {
  let hasGlitch = false;
  for (const gw of dialogGlitchWords) {
    if (text.toLowerCase().includes(gw)) {
      hasGlitch = true;
      break;
    }
  }

  if (hasGlitch && Math.random() < 0.3) {
    ctx.save();
    ctx.fillStyle = '#f0f';
    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
    ctx.fillText(text, x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 2);
    ctx.fillStyle = '#0ff';
    ctx.globalAlpha = 0.5;
    ctx.fillText(text, x + (Math.random() - 0.5) * 2, y);
    ctx.restore();
  } else {
    ctx.fillStyle = '#0ff';
    ctx.fillText(text, x, y);
  }
}

// ============================================
// REWARD STATE
// ============================================
let rewardTimer = 0;
let rewardCredits = 0;

function initReward() {
  rewardTimer = 0;
  const mission = getCurrentMission();
  rewardCredits = mission.reward;
  player.credits += rewardCredits;
  player.missionLevel++;
  saveGame();
}

function updateReward(dt) {
  rewardTimer += dt;
  if (isButtonClicked(300, 420, 200, 50)) {
    gameState = STATES.SHOP;
    initShop();
  }
}

function drawReward() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  drawStars(0.3);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#0f0';
  ctx.font = '28px "Orbitron", sans-serif';
  ctx.fillText('ЦІЛЬ ЗАХОПЛЕНА', 400, 200);

  ctx.strokeStyle = '#0a0';
  ctx.beginPath();
  ctx.moveTo(250, 225);
  ctx.lineTo(550, 225);
  ctx.stroke();

  ctx.fillStyle = '#ff0';
  ctx.font = '22px "Orbitron", sans-serif';
  ctx.fillText('+ ' + rewardCredits + ' кредитів', 400, 290);

  ctx.fillStyle = '#aaa';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillText('Баланс: ' + player.credits + ' кредитів', 400, 340);

  drawButton('[ Далі ]', 300, 420, 200, 50);
}

// ============================================
// SHOP STATE
// ============================================
let shopItems = [];

function initShop() {
  shopItems = [
    {
      name: 'HP +25',
      desc: 'Збільшити максимальне здоров\'я',
      price: 100 + player.hpUpgrades * 50,
      action: function() { player.maxHp += 25; player.hpUpgrades++; }
    },
    {
      name: 'Атака +5',
      desc: 'Збільшити силу атаки',
      price: 120 + player.attackUpgrades * 60,
      action: function() { player.attack += 5; player.attackUpgrades++; }
    },
    {
      name: 'Швидкість +0.5',
      desc: 'Рухатись швидше',
      price: 100 + player.speedUpgrades * 50,
      action: function() { player.speed += 0.5; player.speedUpgrades++; }
    },
    {
      name: 'Зброя LV' + (player.weaponLevel + 1),
      desc: player.weaponLevel < 3 ? 'Покращити зброю (більше куль)' : 'МАКСИМУМ',
      price: player.weaponLevel < 3 ? 200 + player.weaponUpgrades * 100 : 99999,
      action: function() { if (player.weaponLevel < 3) { player.weaponLevel++; player.weaponUpgrades++; } }
    }
  ];
}

function updateShop(dt) {
  shopItems.forEach(function(item, i) {
    var bx = 200, by = 140 + i * 90;
    if (isButtonClicked(bx + 280, by + 40, 100, 25)) {
      if (player.credits >= item.price && item.price < 99999) {
        player.credits -= item.price;
        item.action();
        saveGame();
        initShop();
      }
    }
  });

  if (isButtonClicked(300, 520, 200, 50)) {
    gameState = STATES.MISSION;
    initMission();
  }
}

function drawShop() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 800, 600);

  ctx.fillStyle = '#0ff';
  ctx.font = '24px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('МАГАЗИН', 400, 50);

  ctx.fillStyle = '#ff0';
  ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillText('Кредити: ' + player.credits, 400, 85);

  ctx.strokeStyle = '#0aa';
  ctx.beginPath();
  ctx.moveTo(150, 100);
  ctx.lineTo(650, 100);
  ctx.stroke();

  shopItems.forEach(function(item, i) {
    var bx = 200, by = 140 + i * 90;
    var canBuy = player.credits >= item.price && item.price < 99999;

    ctx.fillStyle = canBuy ? 'rgba(0, 255, 255, 0.05)' : 'rgba(100, 100, 100, 0.05)';
    ctx.fillRect(bx, by, 400, 70);
    ctx.strokeStyle = canBuy ? '#0aa' : '#333';
    ctx.strokeRect(bx, by, 400, 70);

    ctx.fillStyle = canBuy ? '#0ff' : '#555';
    ctx.font = '16px "Orbitron", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, bx + 15, by + 25);

    ctx.fillStyle = canBuy ? '#888' : '#444';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText(item.desc, bx + 15, by + 50);

    ctx.fillStyle = canBuy ? '#ff0' : '#555';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    if (item.price < 99999) {
      ctx.fillText(item.price + ' cr', bx + 270, by + 57);
    }

    if (canBuy) {
      drawButton('Купити', bx + 280, by + 40, 100, 25);
    }
  });

  // Player stats
  ctx.fillStyle = '#0aa';
  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP: ' + player.maxHp + '  ATK: ' + player.attack + '  SPD: ' + player.speed.toFixed(1) + '  WPN: Lv' + player.weaponLevel, 200, 510);

  drawButton('[ Наступна місія ]', 300, 520, 200, 50);
}

// ============================================
// MAIN GAME LOOP
// ============================================
function gameLoop(timestamp) {
  deltaTime = Math.min((timestamp - prevTime) / 1000, 0.05);
  prevTime = timestamp;

  // Glitch system during gameplay
  if (gameState === STATES.SHIP || gameState === STATES.HUNT) {
    updateGlitch(deltaTime);
  }

  switch (gameState) {
    case STATES.INTRO: updateIntro(deltaTime); break;
    case STATES.MISSION: updateMission(deltaTime); break;
    case STATES.SHIP: updateShip(deltaTime); break;
    case STATES.HUNT: updateHunt(deltaTime); break;
    case STATES.DIALOGUE: updateDialogue(deltaTime); break;
    case STATES.REWARD: updateReward(deltaTime); break;
    case STATES.SHOP: updateShop(deltaTime); break;
  }

  switch (gameState) {
    case STATES.INTRO: drawIntro(); break;
    case STATES.MISSION: drawMission(); break;
    case STATES.SHIP: drawShip(); break;
    case STATES.HUNT: drawHunt(); break;
    case STATES.DIALOGUE: drawDialogue(); break;
    case STATES.REWARD: drawReward(); break;
    case STATES.SHOP: drawShop(); break;
  }

  // Glitch overlay
  if (gameState === STATES.SHIP || gameState === STATES.HUNT || gameState === STATES.DIALOGUE) {
    drawGlitchOverlay();
  }

  // Scanline effect for CRT feel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let y = 0; y < 600; y += 3) {
    ctx.fillRect(0, y, 800, 1);
  }

  mouseClicked = false;
  requestAnimationFrame(gameLoop);
}

// Start the game
initIntro();
requestAnimationFrame(gameLoop);
