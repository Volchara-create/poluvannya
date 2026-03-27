// ============================================
// GAME DATA — missions, phrases, dialogues, planets
// ============================================

// Missions
export const MISSIONS = [
  { name: 'Тінь на Кеплері', enemies: 2, bossHP: 80, reward: 80, bossAbility: null, planet: 'forest' },
  { name: 'Втікач зі Станції', enemies: 3, bossHP: 120, reward: 120, bossAbility: null, planet: 'station' },
  { name: 'Привид Андромеди', enemies: 3, bossHP: 160, reward: 160, bossAbility: null, planet: 'ice' },
  { name: 'Протокол Омега', enemies: 4, bossHP: 200, reward: 220, bossAbility: 'teleport', planet: 'desert' },
  { name: 'Сигнал з Оріона', enemies: 4, bossHP: 220, reward: 260, bossAbility: 'shield', planet: 'crystal' },
  { name: 'Мертва Зона', enemies: 4, bossHP: 240, reward: 300, bossAbility: 'summon', planet: 'ruins' },
  { name: 'Тіні Юпітера', enemies: 5, bossHP: 280, reward: 350, bossAbility: 'invisible', planet: 'volcanic' },
  { name: 'Протокол Ехо', enemies: 5, bossHP: 320, reward: 400, bossAbility: 'reflect', planet: 'forest' },
  { name: 'Чорний Маяк', enemies: 5, bossHP: 360, reward: 480, bossAbility: 'glitchfield', planet: 'ice' },
  { name: 'Останній Сигнал', enemies: 6, bossHP: 400, reward: 600, bossAbility: 'all', planet: 'ruins' }
];

// Planet visual themes
export const PLANET_THEMES = {
  forest: {
    ground: '#0a1a0a',
    groundDetail: '#0d2a0d',
    accent: '#1a4a1a',
    obstacles: ['#1a3a1a', '#2a4a1a'],
    decorColor: '#0a3a0a',
    name: 'Лісова планета',
    decorations: ['tree_small', 'tree_big', 'bush', 'mushroom']
  },
  desert: {
    ground: '#1a1508',
    groundDetail: '#2a2010',
    accent: '#3a2a15',
    obstacles: ['#4a3a20', '#5a4a2a'],
    decorColor: '#3a2a10',
    name: 'Пустеля',
    decorations: ['cactus', 'rock_desert', 'bones']
  },
  ice: {
    ground: '#0a0a1a',
    groundDetail: '#101528',
    accent: '#1a2a4a',
    obstacles: ['#2a3a5a', '#3a4a6a'],
    decorColor: '#2a4a6a',
    name: 'Крижана планета',
    decorations: ['ice_crystal', 'snow_pile', 'frozen_tree']
  },
  crystal: {
    ground: '#10051a',
    groundDetail: '#1a0a2a',
    accent: '#2a1a4a',
    obstacles: ['#3a2a5a', '#4a3a6a'],
    decorColor: '#5a2af0',
    name: 'Кристалічна планета',
    decorations: ['crystal_small', 'crystal_big', 'crystal_cluster']
  },
  volcanic: {
    ground: '#1a0a05',
    groundDetail: '#2a1008',
    accent: '#3a1a0a',
    obstacles: ['#2a1a1a', '#3a2a1a'],
    decorColor: '#f80',
    name: 'Вулканічна планета',
    decorations: ['lava_pool', 'charred_tree', 'volcano_vent']
  },
  ruins: {
    ground: '#0a0a0d',
    groundDetail: '#121218',
    accent: '#1a1a25',
    obstacles: ['#2a2a3a', '#3a3a4a'],
    decorColor: '#4a4a5a',
    name: 'Руїни',
    decorations: ['pillar', 'broken_wall', 'terminal', 'debris']
  },
  station: {
    ground: '#080810',
    groundDetail: '#0d0d18',
    accent: '#15152a',
    obstacles: ['#2a2a3a', '#1a2a3a'],
    decorColor: '#0aa',
    name: 'Космічна станція',
    decorations: ['console', 'crate_metal', 'wire', 'light_panel']
  }
};

// Draw decoration based on type — 2x scale for visibility
export function drawDecoration(ctx, x, y, type, theme) {
  ctx.save();
  ctx.translate(x, y);
  const c = theme.decorColor;

  switch (type) {
    case 'tree_small':
      // Trunk
      ctx.fillStyle = '#3a2a0a';
      ctx.fillRect(-3, -4, 6, 16);
      // Leaves (layered)
      ctx.fillStyle = c;
      ctx.fillRect(-10, -14, 20, 12);
      ctx.fillRect(-7, -20, 14, 8);
      ctx.fillRect(-4, -24, 8, 5);
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(-8, -14, 8, 10);
      break;
    case 'tree_big':
      ctx.fillStyle = '#4a3010';
      ctx.fillRect(-4, -8, 8, 22);
      // Roots
      ctx.fillStyle = '#3a2008';
      ctx.fillRect(-8, 12, 4, 4);
      ctx.fillRect(4, 12, 4, 4);
      // Canopy
      ctx.fillStyle = c;
      ctx.fillRect(-16, -24, 32, 18);
      ctx.fillRect(-12, -32, 24, 10);
      ctx.fillRect(-8, -36, 16, 6);
      // Light patches
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(-12, -28, 10, 8);
      break;
    case 'bush':
      ctx.fillStyle = c;
      ctx.fillRect(-8, -6, 16, 10);
      ctx.fillRect(-6, -10, 12, 5);
      // Berries
      ctx.fillStyle = '#f44';
      ctx.fillRect(-4, -4, 2, 2);
      ctx.fillRect(2, -6, 2, 2);
      break;
    case 'mushroom':
      ctx.fillStyle = '#5a3a5a';
      ctx.fillRect(-2, -2, 4, 10);
      ctx.fillStyle = '#aa4a4a';
      ctx.fillRect(-8, -8, 16, 8);
      ctx.fillStyle = '#cc6666';
      ctx.fillRect(-6, -10, 12, 3);
      // Spots
      ctx.fillStyle = '#ffaaaa';
      ctx.fillRect(-5, -6, 2, 2);
      ctx.fillRect(1, -8, 2, 2);
      ctx.fillRect(3, -5, 2, 2);
      break;
    case 'cactus':
      ctx.fillStyle = '#2a6a2a';
      ctx.fillRect(-3, -18, 6, 28);
      // Arms
      ctx.fillRect(-9, -10, 6, 4);
      ctx.fillRect(-9, -10, 4, 8);
      ctx.fillRect(3, -14, 6, 4);
      ctx.fillRect(5, -14, 4, 10);
      // Spikes
      ctx.fillStyle = '#aaa';
      ctx.fillRect(-1, -20, 2, 3);
      ctx.fillRect(-4, -8, 1, 2);
      ctx.fillRect(3, -12, 1, 2);
      break;
    case 'rock_desert':
      ctx.fillStyle = theme.obstacles[0];
      ctx.fillRect(-8, -4, 16, 10);
      ctx.fillRect(-6, -8, 12, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(-6, -8, 6, 4);
      break;
    case 'bones':
      ctx.fillStyle = '#bbb';
      ctx.fillRect(-6, -1, 12, 3);
      ctx.fillRect(-2, -4, 3, 8);
      // Skull
      ctx.fillStyle = '#ccc';
      ctx.fillRect(-4, -8, 6, 5);
      ctx.fillStyle = '#333';
      ctx.fillRect(-3, -6, 2, 2);
      ctx.fillRect(0, -6, 2, 2);
      break;
    case 'ice_crystal':
      ctx.fillStyle = '#6af';
      ctx.shadowColor = '#6af';
      ctx.shadowBlur = 4;
      ctx.fillRect(-3, -18, 6, 22);
      ctx.fillRect(-2, -22, 4, 5);
      ctx.fillStyle = '#8cf';
      ctx.fillRect(-1, -18, 2, 16);
      ctx.shadowBlur = 0;
      break;
    case 'snow_pile':
      ctx.fillStyle = '#cce';
      ctx.fillRect(-10, -3, 20, 6);
      ctx.fillRect(-7, -7, 14, 5);
      ctx.fillStyle = '#ddf';
      ctx.fillRect(-5, -7, 8, 3);
      break;
    case 'frozen_tree':
      ctx.fillStyle = '#4a5a6a';
      ctx.fillRect(-3, -6, 6, 18);
      ctx.fillStyle = '#6a8aaa';
      ctx.fillRect(-10, -14, 20, 10);
      ctx.fillRect(-6, -20, 12, 7);
      // Ice particles
      ctx.fillStyle = '#8cf';
      ctx.fillRect(-8, -12, 2, 2);
      ctx.fillRect(5, -16, 2, 2);
      break;
    case 'crystal_small':
      ctx.fillStyle = '#a0f';
      ctx.shadowColor = '#a0f';
      ctx.shadowBlur = 3;
      ctx.fillRect(-3, -14, 6, 18);
      ctx.fillRect(-2, -18, 4, 5);
      ctx.shadowBlur = 0;
      break;
    case 'crystal_big':
      ctx.fillStyle = '#c0f';
      ctx.shadowColor = '#c0f';
      ctx.shadowBlur = 5;
      ctx.fillRect(-5, -22, 10, 28);
      ctx.fillRect(-3, -28, 6, 8);
      ctx.fillStyle = '#80a';
      ctx.fillRect(-2, -22, 4, 20);
      ctx.shadowBlur = 0;
      break;
    case 'crystal_cluster':
      ctx.fillStyle = '#a0f';
      ctx.fillRect(-8, -10, 4, 14);
      ctx.fillRect(-2, -16, 5, 20);
      ctx.fillRect(5, -6, 4, 10);
      ctx.fillStyle = '#c0f';
      ctx.fillRect(-1, -18, 3, 5);
      break;
    case 'lava_pool':
      ctx.fillStyle = '#f40';
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.2;
      ctx.fillRect(-10, -5, 20, 10);
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(-6, -2, 12, 4);
      // Bubbles
      ctx.fillStyle = '#f80';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-4 + Math.sin(Date.now() / 200) * 3, -3, 2, 2);
      break;
    case 'charred_tree':
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-3, -14, 6, 22);
      ctx.fillRect(-8, -16, 4, 4);
      ctx.fillRect(4, -20, 4, 6);
      // Embers
      ctx.fillStyle = '#f80';
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 400) * 0.2;
      ctx.fillRect(-2, -6, 2, 2);
      ctx.fillRect(1, -10, 2, 2);
      break;
    case 'volcano_vent':
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(-6, -4, 12, 8);
      ctx.fillStyle = '#f40';
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.3;
      ctx.fillRect(-3, -6, 6, 4);
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(-1, -10 - Math.random() * 4, 2, 6);
      break;
    case 'pillar':
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(-6, -26, 12, 32);
      ctx.fillStyle = '#4a4a5a';
      ctx.fillRect(-8, -28, 16, 4);
      ctx.fillRect(-8, 4, 16, 4);
      // Cracks
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(-4, -16, 1, 8);
      break;
    case 'broken_wall':
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(-12, -8, 24, 14);
      ctx.fillRect(-8, -14, 6, 7);
      ctx.fillRect(4, -12, 6, 5);
      // Rubble
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(-10, 4, 4, 3);
      ctx.fillRect(2, 5, 5, 3);
      break;
    case 'terminal':
      ctx.fillStyle = '#1a2a2a';
      ctx.fillRect(-6, -10, 12, 14);
      ctx.fillStyle = '#0a4';
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 500) * 0.3;
      ctx.fillRect(-5, -8, 10, 6);
      // Text on screen
      ctx.fillStyle = '#0f0';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-4, -7, 6, 1);
      ctx.fillRect(-4, -5, 8, 1);
      ctx.fillRect(-4, -3, 4, 1);
      break;
    case 'debris':
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(-5, -2, 10, 5);
      ctx.fillRect(-8, -1, 4, 3);
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(3, -3, 4, 4);
      break;
    case 'console':
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-8, -6, 16, 10);
      ctx.fillStyle = '#0af';
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 400) * 0.2;
      ctx.fillRect(-6, -4, 12, 5);
      // Buttons
      ctx.fillStyle = '#0f0';
      ctx.globalAlpha = 0.7;
      ctx.fillRect(-5, 2, 2, 2);
      ctx.fillStyle = '#f00';
      ctx.fillRect(3, 2, 2, 2);
      break;
    case 'crate_metal':
      ctx.fillStyle = '#2a3a3a';
      ctx.fillRect(-7, -7, 14, 14);
      ctx.strokeStyle = '#4a5a5a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-7, -7, 14, 14);
      ctx.fillStyle = '#3a4a4a';
      ctx.fillRect(-5, -1, 10, 2);
      break;
    case 'wire':
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(0, 8, 8, -2);
      ctx.stroke();
      // Spark
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = Math.random() > 0.7 ? 0.8 : 0;
      ctx.fillRect(7, -3, 2, 2);
      break;
    case 'light_panel':
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = '#0af';
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 600 + x) * 0.2;
      ctx.fillRect(-3, -3, 6, 6);
      break;
    default:
      ctx.fillStyle = c;
      ctx.fillRect(-4, -4, 8, 8);
  }

  ctx.restore();
}

// Phrases system
export const TRUE_PHRASES = [
  "Ти не герой", "Ти лише інструмент", "Тебе створили",
  "Світ — це симуляція", "Все повторюється", "Це цикл",
  "Вони не вороги", "Вони знали правду", "Ти вже був тут", "Виходу немає"
];

export const FAKE_PHRASES = [
  "Ти герой", "Ти рятуєш світ", "Ти обраний",
  "Вони брехали тобі", "Без тебе все зруйнується", "Ти єдиний шанс"
];

export function getMissionPhrase(missionNum) {
  const trueMissionIndices = [0, 2, 4, 7, 9, 14, 15, 16, 17, 19];
  const trueIndex = trueMissionIndices.indexOf(missionNum);
  if (trueIndex !== -1 && trueIndex < TRUE_PHRASES.length) {
    return { text: TRUE_PHRASES[trueIndex], isTrue: true };
  }
  return { text: FAKE_PHRASES[Math.floor(Math.random() * FAKE_PHRASES.length)], isTrue: false };
}

export function getMissionData(missionNum) {
  if (missionNum < 10) return MISSIONS[missionNum];
  const difficulty = Math.min(missionNum, 30);
  const planets = Object.keys(PLANET_THEMES);
  return {
    name: generatePlanetName(),
    enemies: Math.min(3 + Math.floor(difficulty / 3), 8),
    bossHP: 200 + difficulty * 30,
    reward: 250 + Math.floor(Math.random() * 400),
    bossAbility: ['teleport', 'shield', 'summon', 'invisible'][Math.floor(Math.random() * 4)],
    planet: planets[Math.floor(Math.random() * planets.length)]
  };
}

function generatePlanetName() {
  const prefixes = ['Тінь', 'Сигнал', 'Привид', 'Протокол', 'Ехо', 'Зона', 'Маяк', 'Код', 'Фантом', 'Ядро'];
  const suffixes = ['Кеплера', 'Андромеди', 'Оріона', 'Центавра', 'Сіріуса', 'Вега', 'Альтаїр', 'Тау', 'Дзета'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

// Boss dialogues
export const BOSS_DIALOGUES = [
  ['Ти думаєш що робиш правильно?', 'Вони не розповіли тобі все...', 'Я лише знав забагато.'],
  ['Вони послали тебе за мною.', 'Ти навіть не запитав чому.', 'Подумай про це.'],
  ['Ти колись бачив код цього світу?', 'Ні? Тоді ти нічого не знаєш.', 'Дані кажуть більше ніж слова.'],
  ['Скільки до мене було таких як ти?', 'Система створює мисливців.', 'І знищує коли вони непотрібні.'],
  ['Ти відчуваєш що щось не так?', 'Цей сигнал... він не для тебе.', 'Він для тих хто дивиться.'],
  ['Ця зона мертва не просто так.', 'Тут зламалась реальність.', 'Як і скрізь... просто тут видно.'],
  ['Тіні знають більше за світло.', 'В темряві ховається правда.', 'Ти боїшся темряви?'],
  ['Ехо... все повторюється.', 'Ти вже робив це раніше.', 'І будеш робити знову.'],
  ['Маяк світить для тих хто заблукав.', 'Але ти не заблукав.', 'Тебе спрямували.'],
  ['Це останній сигнал.', 'Не мій. Твій.', 'Подумай... хто насправді ціль?']
];

export const COMMANDER_LINES = [
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

// Enemy types
export const ENEMY_TYPES = {
  shooter: { hp: 40, speed: 1.2, damage: 12, color: '#a0f', fireRate: 1800, range: 220, name: 'Стрілець' },
  kamikaze: { hp: 25, speed: 3.5, damage: 30, color: '#ff0', fireRate: 0, range: 30, name: 'Камікадзе' },
  shield: { hp: 80, speed: 0.8, damage: 10, color: '#48f', fireRate: 2500, range: 80, name: 'Щит' }
};
