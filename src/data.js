// ============================================
// GAME DATA — missions, phrases, dialogues, planets
// ============================================

// Missions
export const MISSIONS = [
  { name: 'Тінь на Кеплері', enemies: 2, bossHP: 80, reward: 150, bossAbility: null, planet: 'forest' },
  { name: 'Втікач зі Станції', enemies: 3, bossHP: 120, reward: 200, bossAbility: null, planet: 'station' },
  { name: 'Привид Андромеди', enemies: 3, bossHP: 160, reward: 300, bossAbility: null, planet: 'ice' },
  { name: 'Протокол Омега', enemies: 4, bossHP: 200, reward: 400, bossAbility: 'teleport', planet: 'desert' },
  { name: 'Сигнал з Оріона', enemies: 4, bossHP: 220, reward: 450, bossAbility: 'shield', planet: 'crystal' },
  { name: 'Мертва Зона', enemies: 4, bossHP: 240, reward: 500, bossAbility: 'summon', planet: 'ruins' },
  { name: 'Тіні Юпітера', enemies: 5, bossHP: 280, reward: 600, bossAbility: 'invisible', planet: 'volcanic' },
  { name: 'Протокол Ехо', enemies: 5, bossHP: 320, reward: 700, bossAbility: 'reflect', planet: 'forest' },
  { name: 'Чорний Маяк', enemies: 5, bossHP: 360, reward: 800, bossAbility: 'glitchfield', planet: 'ice' },
  { name: 'Останній Сигнал', enemies: 6, bossHP: 400, reward: 1000, bossAbility: 'all', planet: 'ruins' }
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

// Draw decoration based on type
export function drawDecoration(ctx, x, y, type, theme) {
  ctx.save();
  ctx.translate(x, y);
  const c = theme.decorColor;

  switch (type) {
    case 'tree_small':
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(-2, -4, 4, 10); // trunk
      ctx.fillStyle = c;
      ctx.fillRect(-6, -10, 12, 8); // leaves
      ctx.fillRect(-4, -14, 8, 5);
      break;
    case 'tree_big':
      ctx.fillStyle = '#3a2a0a';
      ctx.fillRect(-3, -6, 6, 14); // trunk
      ctx.fillStyle = c;
      ctx.fillRect(-10, -16, 20, 12);
      ctx.fillRect(-7, -22, 14, 8);
      ctx.fillRect(-4, -26, 8, 5);
      break;
    case 'bush':
      ctx.fillStyle = c;
      ctx.fillRect(-5, -4, 10, 6);
      ctx.fillRect(-3, -7, 6, 4);
      break;
    case 'mushroom':
      ctx.fillStyle = '#4a2a4a';
      ctx.fillRect(-1, -2, 2, 6);
      ctx.fillStyle = '#8a3a3a';
      ctx.fillRect(-4, -5, 8, 4);
      break;
    case 'cactus':
      ctx.fillStyle = '#2a5a2a';
      ctx.fillRect(-2, -10, 4, 16);
      ctx.fillRect(-6, -6, 4, 3);
      ctx.fillRect(2, -8, 4, 3);
      break;
    case 'rock_desert':
      ctx.fillStyle = theme.obstacles[0];
      ctx.fillRect(-5, -3, 10, 6);
      ctx.fillRect(-3, -5, 6, 3);
      break;
    case 'bones':
      ctx.fillStyle = '#aaa';
      ctx.fillRect(-4, -1, 8, 2);
      ctx.fillRect(-1, -3, 2, 6);
      break;
    case 'ice_crystal':
      ctx.fillStyle = '#8af';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-5, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'snow_pile':
      ctx.fillStyle = '#cce';
      ctx.fillRect(-6, -2, 12, 4);
      ctx.fillRect(-4, -4, 8, 3);
      break;
    case 'crystal_small':
      ctx.fillStyle = '#a0f';
      ctx.fillRect(-2, -8, 4, 10);
      ctx.fillRect(-1, -10, 2, 3);
      break;
    case 'crystal_big':
      ctx.fillStyle = '#c0f';
      ctx.fillRect(-3, -14, 6, 16);
      ctx.fillRect(-2, -18, 4, 5);
      ctx.fillStyle = '#80a';
      ctx.fillRect(-1, -14, 2, 12);
      break;
    case 'crystal_cluster':
      ctx.fillStyle = '#a0f';
      ctx.fillRect(-5, -6, 3, 8);
      ctx.fillRect(-1, -10, 3, 12);
      ctx.fillRect(3, -4, 3, 6);
      break;
    case 'lava_pool':
      ctx.fillStyle = '#f40';
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 300) * 0.2;
      ctx.fillRect(-6, -3, 12, 6);
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(-3, -1, 6, 2);
      break;
    case 'charred_tree':
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-2, -8, 4, 12);
      ctx.fillRect(-5, -10, 3, 3);
      ctx.fillRect(2, -12, 3, 4);
      break;
    case 'pillar':
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(-4, -16, 8, 20);
      ctx.fillStyle = '#4a4a5a';
      ctx.fillRect(-5, -18, 10, 3);
      ctx.fillRect(-5, 2, 10, 3);
      break;
    case 'broken_wall':
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(-8, -6, 16, 8);
      ctx.fillRect(-6, -10, 4, 5);
      ctx.fillRect(2, -8, 5, 3);
      break;
    case 'terminal':
      ctx.fillStyle = '#1a2a2a';
      ctx.fillRect(-4, -6, 8, 8);
      ctx.fillStyle = '#0a4';
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 500) * 0.3;
      ctx.fillRect(-3, -5, 6, 4);
      break;
    case 'console':
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-5, -4, 10, 6);
      ctx.fillStyle = '#0af';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-4, -3, 8, 3);
      break;
    default:
      ctx.fillStyle = c;
      ctx.fillRect(-3, -3, 6, 6);
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
    reward: 500 + Math.floor(Math.random() * 1000),
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
