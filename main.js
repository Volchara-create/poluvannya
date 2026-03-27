// ============================================
// POLUVANNYA — Space Bounty Hunter Game
// Broken Reality — Professional Build
// ============================================

import { initInput, keys, keyJustPressed, mouseX, mouseY, mouseClicked, mouseDown,
  clearInput, isButtonClicked, updateWorldMouse, getAimAngle } from './src/input.js';
import { initAudio, playSound } from './src/sound.js';
import * as Particles from './src/particles.js';
import { Camera, drawButton, drawHPBar, drawCrosshair, showNotification,
  renderNotifications, fadeOut, fadeIn, updateTransition, isTransitioning,
  triggerHitStop, isHitStopped, updateHitStop } from './src/renderer.js';
import { save, saves, currentSlot, createNewSave, loadSaves, setSlot,
  saveToDisk, deleteSave, updateBaseLevel, WEAPONS, getWeaponDamage } from './src/save.js';
import { MISSIONS, PLANET_THEMES, drawDecoration, TRUE_PHRASES, FAKE_PHRASES,
  getMissionPhrase, getMissionData, BOSS_DIALOGUES, COMMANDER_LINES,
  ENEMY_TYPES } from './src/data.js';
import { drawPlayer, drawPlayerWeapon, drawEnemy, drawBoss, drawShip,
  drawSpaceEnemy, drawHQPlayer, drawDefeatedBoss, drawCommander } from './src/sprites.js';
import { updateGlitches, renderGlitchEffects, triggerGlitch, isControlsInverted,
  activeGlitch } from './src/glitch.js';
import { TypeWriter } from './src/typewriter.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
canvas.style.cursor = 'none'; // hide cursor for crosshair

// Game state
const STATES = {
  SLOT_SELECT: 0, INTRO: 1, HQ: 2, MISSION_BRIEF: 3,
  SHIP: 4, LANDING: 5, HUNT: 6, DIALOGUE: 7,
  REWARD: 8, SHOP: 9, PUZZLE: 10, ENDING: 11, DEATH: 12
};

let state = STATES.SLOT_SELECT;
let prevTime = 0;
let gameTime = 0;
const camera = new Camera();

initInput(canvas);
loadSaves();

// ============================================
// SLOT SELECT
// ============================================
function updateSlotSelect(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  // Title with glow
  ctx.save();
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#0ff';
  ctx.font = '32px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ПОЛЮВАННЯ', 400, 75);
  ctx.restore();
  ctx.fillStyle = '#066';
  ctx.font = '13px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Космічний Мисливець  ·  Broken Reality', 400, 105);

  for (let i = 0; i < 3; i++) {
    const x = 150, y = 140 + i * 140, w = 500, h = 120;
    const s = saves[i];
    const hover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

    // Slot box
    ctx.fillStyle = hover ? 'rgba(0,255,255,0.06)' : 'rgba(0,20,20,0.4)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = hover ? '#0ff' : '#044';
    ctx.lineWidth = hover ? 2 : 1;
    ctx.strokeRect(x, y, w, h);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ff';
    ctx.font = '16px "Orbitron", sans-serif';
    ctx.fillText(`СЛОТ ${i + 1}`, x + 20, y + 30);

    if (s) {
      ctx.fillStyle = '#888';
      ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillText(`Місія: ${s.missionNumber + 1}  ·  ${s.credits} cr  ·  База Lv.${s.baseLevel}`, x + 20, y + 55);
      const wpn = s.weapons[s.activeWeapon];
      if (wpn) ctx.fillText(`Зброя: ${WEAPONS[wpn.type].name} Lv.${wpn.level}`, x + 20, y + 75);

      // Delete
      const dx = x + w - 90, dy = y + h - 35, dw = 75, dh = 25;
      const dHover = mouseX >= dx && mouseX <= dx + dw && mouseY >= dy && mouseY <= dy + dh;
      ctx.fillStyle = dHover ? 'rgba(255,0,0,0.15)' : 'rgba(255,0,0,0.03)';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = dHover ? '#f44' : '#600';
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.fillStyle = dHover ? '#f88' : '#800';
      ctx.font = '11px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Видалити', dx + dw / 2, dy + 16);
      if (mouseClicked && dHover) { playSound('click'); deleteSave(i); loadSaves(); return; }
    } else {
      ctx.fillStyle = '#444';
      ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillText('Порожній — натисни щоб почати', x + 20, y + 60);
    }

    if (mouseClicked && hover && !(s && mouseX >= x + w - 90 && mouseY >= y + h - 35)) {
      playSound('click');
      initAudio();
      if (!saves[i]) {
        setSlot(i, createNewSave());
        saveToDisk();
        introInit();
        state = STATES.INTRO;
      } else {
        setSlot(i, saves[i]);
        state = STATES.HQ;
      }
    }
  }
}

// ============================================
// INTRO
// ============================================
let intro = { lines: [], lineIndex: 0, writer: null, phase: 0 };

function introInit() {
  intro.lines = [
    'Космічна поліція шукає мисливців.',
    'Ти підходиш.',
    'Ніяких питань. Ніяких відмов.',
    'Ось твоя зброя.',
    'Виконуй завдання.'
  ];
  intro.lineIndex = 0;
  intro.writer = new TypeWriter(intro.lines[0], 50);
  intro.phase = 0;
}

function updateIntro(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);

  if (intro.phase === 0) {
    intro.writer.update(dt);
    ctx.fillStyle = '#0ff';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < intro.lineIndex; i++) {
      ctx.globalAlpha = 0.5;
      ctx.fillText(intro.lines[i], 400, 200 + i * 32);
    }
    ctx.globalAlpha = 1;
    ctx.fillText(intro.writer.text, 400, 200 + intro.lineIndex * 32);

    if (intro.writer.done) {
      if (intro.lineIndex < intro.lines.length - 1) {
        intro.writer._waited += dt;
        if (intro.writer._waited > 0.7) {
          intro.lineIndex++;
          intro.writer = new TypeWriter(intro.lines[intro.lineIndex], 50);
        }
      } else { intro.phase = 1; }
    }
    if (keyJustPressed['Escape'] || keyJustPressed['Enter']) intro.phase = 1;
  }

  if (intro.phase === 1) {
    ctx.fillStyle = '#0ff';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < intro.lines.length; i++) {
      ctx.globalAlpha = 0.4;
      ctx.fillText(intro.lines[i], 400, 200 + i * 32);
    }
    ctx.globalAlpha = 1;

    // Pixel pistol
    ctx.save();
    ctx.translate(400, 420);
    ctx.scale(3, 3);
    ctx.fillStyle = '#555';
    ctx.fillRect(-6, -2, 12, 4);
    ctx.fillStyle = '#888';
    ctx.fillRect(5, -1, 3, 2);
    ctx.fillStyle = '#333';
    ctx.fillRect(-2, 2, 4, 4);
    ctx.restore();

    ctx.fillStyle = '#0aa';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('[ Отримано: Пістолет ]', 400, 465);
    drawButton(ctx, 300, 500, 200, 42, '[ Почати ]');
    if (isButtonClicked(300, 500, 200, 42) || keyJustPressed['Enter']) {
      playSound('click');
      state = STATES.HQ;
    }
  }
}

// ============================================
// HQ
// ============================================
let hq = { px: 200, py: 180, dir: 'down', target: null, showHint: false };

const HQ_OBJS = {
  monitor: { x: 50, y: 20, w: 55, h: 35, label: 'Місії', color: '#0af' },
  hangar: { x: 155, y: 20, w: 55, h: 35, label: 'Ангар', color: '#f80' },
  wardrobe: { x: 290, y: 20, w: 55, h: 35, label: 'Гардероб', color: '#f0a' },
  commander: { x: 300, y: 140, w: 35, h: 35, label: 'Командир', color: '#0f0' },
  bed: { x: 15, y: 220, w: 45, h: 35, label: 'Зберегти', color: '#55a' },
  secret: { x: 175, y: 248, w: 35, h: 15, label: '', color: '#222' },
  arsenal: { x: 50, y: 120, w: 55, h: 35, label: 'Арсенал', color: '#f44', minBase: 2 },
  lab: { x: 290, y: 220, w: 55, h: 35, label: 'Лабораторія', color: '#a0f', minBase: 3 }
};

let cmdDialogue = null;

function updateHQ(dt) {
  canvas.style.cursor = 'default';
  updateBaseLevel();
  const spd = 110 * dt;
  const px0 = hq.px, py0 = hq.py;

  if (keys['KeyW'] || keys['ArrowUp']) { hq.py -= spd; hq.dir = 'up'; }
  if (keys['KeyS'] || keys['ArrowDown']) { hq.py += spd; hq.dir = 'down'; }
  if (keys['KeyA'] || keys['ArrowLeft']) { hq.px -= spd; hq.dir = 'left'; }
  if (keys['KeyD'] || keys['ArrowRight']) { hq.px += spd; hq.dir = 'right'; }
  hq.px = Math.max(8, Math.min(380 - 8, hq.px));
  hq.py = Math.max(20, Math.min(280 - 8, hq.py));

  // Collisions
  for (const [k, o] of Object.entries(HQ_OBJS)) {
    if (o.minBase && save.baseLevel < o.minBase) continue;
    if (k === 'secret' && save.missionNumber < 3) continue;
    if (hq.px > o.x - 6 && hq.px < o.x + o.w + 6 && hq.py > o.y - 6 && hq.py < o.y + o.h + 6) {
      hq.px = px0; hq.py = py0;
    }
  }

  // Interaction check
  hq.target = null; hq.showHint = false;
  for (const [k, o] of Object.entries(HQ_OBJS)) {
    if (o.minBase && save.baseLevel < o.minBase) continue;
    if (k === 'secret' && save.missionNumber < 3) continue;
    if (Math.hypot(hq.px - (o.x + o.w / 2), hq.py - (o.y + o.h / 2)) < 48) {
      hq.target = k; hq.showHint = true; break;
    }
  }

  if (keyJustPressed['KeyE'] && hq.target && !cmdDialogue) {
    playSound('click');
    switch (hq.target) {
      case 'monitor': missionBriefInit(); state = STATES.MISSION_BRIEF; break;
      case 'hangar': shopCat = 'hangar'; state = STATES.SHOP; break;
      case 'wardrobe': shopCat = 'wardrobe'; state = STATES.SHOP; break;
      case 'arsenal': shopCat = 'arsenal'; state = STATES.SHOP; break;
      case 'lab': shopCat = 'lab'; state = STATES.SHOP; break;
      case 'commander': cmdDialogue = new TypeWriter(COMMANDER_LINES[Math.min(save.missionNumber, 9)], 35); break;
      case 'bed': saveToDisk(); showNotification('Гру збережено!'); break;
      case 'secret':
        if (!save.secretRoomFound) { save.secretRoomFound = true; saveToDisk(); playSound('alarm'); showNotification('Ти знайшов щось...'); }
        if (save.collectedPhrases.length >= 5) { puzzleInit(); state = STATES.PUZZLE; }
        break;
    }
  }

  // Render HQ
  ctx.fillStyle = '#08080f';
  ctx.fillRect(0, 0, 800, 600);
  ctx.save();
  ctx.translate(200, 150);

  // Floor (metal tiles)
  const aging = Math.min(5, Math.floor(save.missionNumber / 2));
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, 380, 280);
  // Metal tile pattern
  for (let x = 0; x < 380; x += 20) {
    for (let y = 0; y < 280; y += 20) {
      ctx.fillStyle = (x + y) % 40 === 0 ? '#0c0c16' : '#08080f';
      ctx.fillRect(x, y, 20, 20);
      ctx.strokeStyle = 'rgba(0,255,255,0.015)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 20, 20);
    }
  }
  // Walls (thicker, with glow)
  ctx.strokeStyle = '#1a3a3a';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 380, 280);
  // Wall glow
  ctx.strokeStyle = '#0ff';
  ctx.globalAlpha = 0.03 + Math.sin(gameTime * 2) * 0.01;
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, 376, 276);
  ctx.globalAlpha = 1;
  // Wall lights
  ctx.fillStyle = '#0ff';
  ctx.globalAlpha = 0.15 + Math.sin(gameTime * 3) * 0.05;
  ctx.fillRect(185, 0, 10, 3); // top center light
  ctx.fillRect(0, 135, 3, 10); // left wall light
  ctx.fillRect(377, 135, 3, 10); // right wall light
  ctx.globalAlpha = 1;

  // Cracks (aging)
  if (aging >= 2) {
    ctx.strokeStyle = `rgba(255,0,0,${0.04 + aging * 0.02})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < aging + 1; i++) {
      const cx = 25 + i * 60;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx + 8, 18);
      ctx.lineTo(cx + 3, 35);
      ctx.lineTo(cx + 12, 55);
      ctx.stroke();
    }
    // Floor cracks
    if (aging >= 3) {
      for (let i = 0; i < aging - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 90, 280);
        ctx.lineTo(55 + i * 90, 260);
        ctx.lineTo(48 + i * 90, 240);
        ctx.stroke();
      }
    }
    // Flickering light effect
    if (aging >= 4 && Math.random() > 0.97) {
      ctx.fillStyle = 'rgba(255,0,0,0.02)';
      ctx.fillRect(0, 0, 380, 280);
    }
  }

  // Objects
  for (const [k, o] of Object.entries(HQ_OBJS)) {
    if (o.minBase && save.baseLevel < o.minBase) continue;
    if (k === 'secret') {
      if (save.missionNumber < 3) continue;
      ctx.save();
      ctx.globalAlpha = 0.2 + Math.sin(gameTime * 4) * 0.15;
      ctx.fillStyle = '#0ff';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.restore();
      continue;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = hq.target === k ? o.color : `${o.color}66`;
    ctx.lineWidth = hq.target === k ? 2 : 1;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
    // Highlight
    if (hq.target === k) {
      ctx.save();
      ctx.globalAlpha = 0.08 + Math.sin(gameTime * 4) * 0.04;
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);
      ctx.restore();
    }
    // Draw commander as pixel character instead of box
    if (k === 'commander') {
      ctx.save();
      ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
      drawCommander(ctx, gameTime);
      ctx.restore();
    }

    ctx.fillStyle = o.color;
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h + 11);
  }

  // Player
  ctx.save();
  ctx.translate(hq.px, hq.py);
  drawHQPlayer(ctx, hq.dir, gameTime);
  ctx.restore();
  ctx.restore();

  // UI
  if (hq.showHint) {
    ctx.fillStyle = '#0ff';
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[E] — взаємодія', 400, 460);
  }
  if (!save.tutorialShown.move) {
    ctx.fillStyle = '#0ff';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WASD — рух', 400, 485);
    if (keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD']) save.tutorialShown.move = true;
  }

  ctx.fillStyle = '#0aa';
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Місія: ${save.missionNumber + 1}  |  ${save.credits} cr  |  База Lv.${save.baseLevel}`, 12, 18);
  const wpn = save.weapons[save.activeWeapon];
  if (wpn) ctx.fillText(`${WEAPONS[wpn.type].name} Lv.${wpn.level}`, 12, 34);

  // Commander dialogue
  if (cmdDialogue) {
    cmdDialogue.update(dt);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(50, 490, 700, 75);
    ctx.strokeStyle = '#0f0';
    ctx.strokeRect(50, 490, 700, 75);
    ctx.fillStyle = '#0f0';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('КОМАНДИР:', 70, 510);
    ctx.fillStyle = '#ddd';
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText(cmdDialogue.text, 70, 535);
    if (cmdDialogue.done) {
      ctx.fillStyle = '#555';
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('[E — закрити]', 730, 555);
      if (keyJustPressed['KeyE'] || keyJustPressed['Enter'] || keyJustPressed['Escape']) cmdDialogue = null;
    }
  }
}

// ============================================
// MISSION BRIEF
// ============================================
let curMission = null;

function missionBriefInit() { curMission = getMissionData(save.missionNumber); }

function updateMissionBrief(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  if (!curMission) return;

  ctx.fillStyle = '#0ff';
  ctx.font = '22px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`МІСІЯ ${save.missionNumber + 1}`, 400, 70);
  ctx.fillStyle = '#fff';
  ctx.font = '18px "Orbitron", sans-serif';
  ctx.fillText(curMission.name, 400, 105);

  // Planet preview
  const theme = PLANET_THEMES[curMission.planet] || PLANET_THEMES.forest;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(300, 140, 200, 100);
  ctx.strokeStyle = theme.accent;
  ctx.strokeRect(300, 140, 200, 100);
  ctx.fillStyle = theme.decorColor;
  ctx.font = '10px "Share Tech Mono", monospace';
  ctx.fillText(theme.name, 400, 255);

  const sy = 280;
  ctx.textAlign = 'left';
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillStyle = '#888'; ctx.fillText('Загроза:', 220, sy);
  ctx.fillStyle = '#f44';
  const stars = Math.min(5, Math.ceil(curMission.enemies / 1.5));
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), 380, sy);

  ctx.fillStyle = '#888'; ctx.fillText('Ворогів:', 220, sy + 28);
  ctx.fillStyle = '#ff0'; ctx.fillText(`${curMission.enemies}`, 380, sy + 28);

  ctx.fillStyle = '#888'; ctx.fillText('HP боса:', 220, sy + 56);
  ctx.fillStyle = '#f80'; ctx.fillText(`${curMission.bossHP}`, 380, sy + 56);

  ctx.fillStyle = '#888'; ctx.fillText('Нагорода:', 220, sy + 84);
  ctx.fillStyle = '#0f0'; ctx.font = '16px "Share Tech Mono", monospace';
  ctx.fillText(`${curMission.reward} cr`, 380, sy + 84);

  if (curMission.bossAbility) {
    ctx.fillStyle = '#888'; ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('Здібність боса:', 220, sy + 112);
    ctx.fillStyle = '#f0f'; ctx.fillText('???', 380, sy + 112);
  }

  drawButton(ctx, 240, 510, 130, 40, '← Назад');
  drawButton(ctx, 420, 510, 160, 40, 'Відправитись');
  if (isButtonClicked(240, 510, 130, 40)) { playSound('click'); state = STATES.HQ; }
  if (isButtonClicked(420, 510, 160, 40) || keyJustPressed['Enter']) { playSound('click'); shipInit(); state = STATES.SHIP; }
}

// ============================================
// SHIP MINI-GAME
// ============================================
let ship = {};

function shipInit() {
  ship = {
    x: 400, y: 500, hp: save.shipMaxHP, maxHP: save.shipMaxHP,
    bullets: [], enemies: [], enemyBullets: [], timer: 0, maxTime: 20,
    spawnTimer: 0, lastShot: 0, alive: true,
    speed: save.shipSpeed + 1, damage: save.shipDamage,
    bulletCount: save.shipBulletsLevel
  };
}

function updateShipGame(dt) {
  canvas.style.cursor = 'none';
  if (!ship.alive) { deathInit('ship'); state = STATES.DEATH; return; }

  const spd = ship.speed * 100;
  if (keys['KeyW'] || keys['ArrowUp']) ship.y -= spd * dt;
  if (keys['KeyS'] || keys['ArrowDown']) ship.y += spd * dt;
  if (keys['KeyA'] || keys['ArrowLeft']) ship.x -= spd * dt;
  if (keys['KeyD'] || keys['ArrowRight']) ship.x += spd * dt;
  ship.x = Math.max(20, Math.min(780, ship.x));
  ship.y = Math.max(80, Math.min(580, ship.y));

  // Shoot
  ship.lastShot += dt * 1000;
  if ((keys['Space'] || mouseDown) && ship.lastShot > 180) {
    ship.lastShot = 0;
    for (let i = 0; i < ship.bulletCount; i++) {
      const spread = (i - (ship.bulletCount - 1) / 2) * 14;
      ship.bullets.push({ x: ship.x + spread, y: ship.y - 15, spd: 9 });
    }
    playSound('shoot_pistol');
    Particles.muzzleFlash(ship.x, ship.y - 16, -Math.PI / 2);
  }

  // Bullets
  for (let i = ship.bullets.length - 1; i >= 0; i--) {
    ship.bullets[i].y -= ship.bullets[i].spd;
    if (ship.bullets[i].y < -10) { ship.bullets.splice(i, 1); }
  }

  // Spawn enemies
  ship.spawnTimer -= dt;
  const diff = Math.min(save.missionNumber + 1, 10);
  if (ship.spawnTimer <= 0) {
    const r = Math.random();
    const t = r < 0.5 ? 'basic' : r < 0.8 ? 'fast' : 'heavy';
    const hps = { basic: 10, fast: 5, heavy: 30 };
    const spds = { basic: 1.5 + diff * 0.2, fast: 3 + diff * 0.15, heavy: 0.7 + diff * 0.1 };
    ship.enemies.push({ x: Math.random() * 700 + 50, y: -25, type: t, hp: hps[t], speed: spds[t], zigzag: 0 });
    ship.spawnTimer = Math.max(0.3, 1.4 - diff * 0.1);
  }

  // Update enemies (with AI and shooting)
  for (let i = ship.enemies.length - 1; i >= 0; i--) {
    const e = ship.enemies[i];
    if (!e.lastShot) e.lastShot = 0;
    e.lastShot += dt * 1000;

    // Movement AI per type
    if (e.type === 'basic') {
      e.y += e.speed;
      // Strafe toward player slightly
      const dx = ship.x - e.x;
      e.x += Math.sign(dx) * 0.4;
      // Shoot at player
      if (e.lastShot > 2000 && e.y > 50 && e.y < 500) {
        e.lastShot = 0;
        const angle = Math.atan2(ship.y - e.y, ship.x - e.x);
        ship.enemyBullets.push({ x: e.x, y: e.y, dx: Math.cos(angle) * 3, dy: Math.sin(angle) * 3, life: 3 });
        Particles.muzzleFlash(e.x, e.y + 8, Math.PI / 2);
      }
    } else if (e.type === 'fast') {
      e.zigzag += dt * 6;
      e.y += e.speed;
      e.x += Math.sin(e.zigzag) * 3;
      // Fast enemies dive toward player when close
      if (Math.abs(e.x - ship.x) < 100 && e.y < ship.y) {
        e.y += e.speed * 1.5;
      }
    } else if (e.type === 'heavy') {
      e.y += e.speed;
      // Heavy enemies stop and shoot when in range
      if (e.y > 100 && e.y < 350) {
        e.y -= e.speed * 0.5; // slow down
        // Double shot
        if (e.lastShot > 1500) {
          e.lastShot = 0;
          const angle = Math.atan2(ship.y - e.y, ship.x - e.x);
          ship.enemyBullets.push({ x: e.x - 8, y: e.y + 6, dx: Math.cos(angle) * 2.5, dy: Math.sin(angle) * 2.5, life: 3.5 });
          ship.enemyBullets.push({ x: e.x + 8, y: e.y + 6, dx: Math.cos(angle) * 2.5, dy: Math.sin(angle) * 2.5, life: 3.5 });
        }
      }
    }

    // Bullet hit
    for (let j = ship.bullets.length - 1; j >= 0; j--) {
      if (Math.hypot(ship.bullets[j].x - e.x, ship.bullets[j].y - e.y) < 16) {
        e.hp -= ship.damage;
        Particles.impact(e.x, e.y, Math.PI / 2);
        Particles.damageNumber(e.x, e.y - 10, ship.damage, '#ff0');
        ship.bullets.splice(j, 1);
        if (e.hp <= 0) {
          Particles.explosion(e.x, e.y, e.type === 'heavy' ? 1.2 : 0.7);
          ship.enemies.splice(i, 1);
          playSound('explosion');
          camera.shake(e.type === 'heavy' ? 4 : 2, 0.1);
        } else { playSound('hit'); }
        break;
      }
    }
    if (!ship.enemies[i]) continue;

    // Collision with ship
    if (e.y > 0 && Math.hypot(e.x - ship.x, e.y - ship.y) < 20) {
      ship.hp -= e.type === 'heavy' ? 25 : 15;
      Particles.hitEffect(ship.x, ship.y, '#0ff');
      Particles.explosion(e.x, e.y, 0.5);
      camera.shake(5, 0.15);
      ship.enemies.splice(i, 1);
      playSound('hit');
      if (ship.hp <= 0) { ship.alive = false; playSound('death'); Particles.explosion(ship.x, ship.y, 2); }
      continue;
    }
    if (e.y > 640) ship.enemies.splice(i, 1);
  }

  // Update enemy bullets
  for (let i = (ship.enemyBullets || []).length - 1; i >= 0; i--) {
    const b = ship.enemyBullets[i];
    b.x += b.dx; b.y += b.dy; b.life -= dt;
    if (b.life <= 0 || b.y > 620 || b.y < -10) { ship.enemyBullets.splice(i, 1); continue; }
    if (Math.hypot(b.x - ship.x, b.y - ship.y) < 14) {
      ship.hp -= 10;
      Particles.hitEffect(ship.x, ship.y, '#0ff');
      camera.shake(3, 0.1);
      ship.enemyBullets.splice(i, 1);
      playSound('hit');
      if (ship.hp <= 0) { ship.alive = false; playSound('death'); Particles.explosion(ship.x, ship.y, 2); }
    }
  }

  // Engine trail
  Particles.engineTrail(ship.x, ship.y + 12, -Math.PI / 2);

  ship.timer += dt;
  if (ship.timer >= ship.maxTime) { landingInit(); state = STATES.LANDING; }

  // Render
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, 800, 600);
  // Nebula (subtle background color)
  const nebGrad = ctx.createRadialGradient(600, 200, 50, 600, 200, 300);
  nebGrad.addColorStop(0, 'rgba(40,10,60,0.15)');
  nebGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(0, 0, 800, 600);
  const nebGrad2 = ctx.createRadialGradient(150, 400, 30, 150, 400, 200);
  nebGrad2.addColorStop(0, 'rgba(10,30,60,0.12)');
  nebGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = nebGrad2;
  ctx.fillRect(0, 0, 800, 600);
  // Stars (more, varied sizes)
  for (let i = 0; i < 100; i++) {
    const brightness = i % 7 === 0 ? '#aaf' : i % 11 === 0 ? '#ffa' : '#fff';
    ctx.fillStyle = brightness;
    ctx.globalAlpha = 0.15 + (i % 6) * 0.06;
    const sx = (i * 137 + ship.timer * 12 * (i % 3 + 1)) % 800;
    const sy = (i * 251 + ship.timer * 35 * (i % 3 + 1)) % 600;
    const sz = i % 13 === 0 ? 2 : 1;
    ctx.fillRect(sx, sy, sz, sz);
  }
  ctx.globalAlpha = 1;

  // Ship
  ctx.save(); ctx.translate(ship.x, ship.y); drawShip(ctx, gameTime); ctx.restore();

  // Bullets
  ctx.fillStyle = '#ff0';
  for (const b of ship.bullets) { ctx.fillRect(b.x - 1, b.y - 3, 2, 6); }

  // Enemies
  for (const e of ship.enemies) {
    ctx.save(); ctx.translate(e.x, e.y); drawSpaceEnemy(ctx, e.type, gameTime); ctx.restore();
    // HP bar for heavy enemies
    if (e.type === 'heavy' && e.hp < 30) drawHPBar(ctx, e.x - 12, e.y - 18, 24, 3, e.hp, 30, '#f44');
  }

  // Enemy bullets
  ctx.fillStyle = '#f44';
  for (const b of (ship.enemyBullets || [])) {
    ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    // Trail
    ctx.globalAlpha = 0.3;
    ctx.fillRect(b.x - b.dx - 1, b.y - b.dy - 1, 2, 2);
    ctx.globalAlpha = 1;
  }

  Particles.renderParticles(ctx);
  Particles.renderDamageNumbers(ctx);

  // UI
  drawHPBar(ctx, 15, 12, 140, 12, ship.hp, ship.maxHP, '#0f0');
  ctx.fillStyle = '#aaa'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`${Math.ceil(ship.hp)}/${ship.maxHP}`, 15, 38);
  ctx.fillStyle = '#0ff'; ctx.font = '18px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(Math.max(0, ship.maxTime - ship.timer))}с`, 400, 28);

  if (!save.tutorialShown.shoot) {
    ctx.fillStyle = '#0ff'; ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText('WASD — рух  |  ЛКМ або ПРОБІЛ — стрільба', 400, 585);
    if (keys['Space'] || mouseDown) save.tutorialShown.shoot = true;
  }
}

// ============================================
// LANDING
// ============================================
let landing = { timer: 0 };
function landingInit() { landing.timer = 0; }

function updateLanding(dt) {
  canvas.style.cursor = 'none';
  landing.timer += dt;
  const mission = getMissionData(save.missionNumber);
  const theme = PLANET_THEMES[mission.planet] || PLANET_THEMES.forest;

  ctx.fillStyle = '#030308';
  ctx.fillRect(0, 0, 800, 600);

  // Stars
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.15 + (i % 4) * 0.05;
    ctx.fillRect((i * 137) % 800, (i * 251 + landing.timer * 80) % 600, 1, 1);
  }
  ctx.globalAlpha = 1;

  if (landing.timer < 2) {
    const p = landing.timer / 2;
    const pY = 600 + 250 - p * 380;
    ctx.fillStyle = theme.ground;
    ctx.beginPath(); ctx.arc(400, pY, 180 + p * 120, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(400, pY, 185 + p * 120, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.save(); ctx.translate(400, 80 + p * 180); drawShip(ctx, gameTime); ctx.restore();

    ctx.fillStyle = '#0ff'; ctx.font = '14px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('НАБЛИЖЕННЯ...', 400, 45);
  } else if (landing.timer < 3.2) {
    const p = (landing.timer - 2) / 1.2;
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, 0, 800, 600);
    if (p < 0.4) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = (1 - p / 0.4) * 0.5;
      ctx.fillRect(0, 0, 800, 600);
      ctx.globalAlpha = 1;
      camera.shake(6, 0.1);
    }
    ctx.fillStyle = '#0ff'; ctx.font = '18px "Orbitron", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ВХІД В АТМОСФЕРУ', 400, 300);
  } else {
    huntInit();
    state = STATES.HUNT;
  }
}

// ============================================
// HUNT — main combat with mouse aiming
// ============================================
let hunt = {
  player: { x: 0, y: 0, hp: 100, maxHP: 100, invincible: 0, lastShot: 0 },
  enemies: [], boss: null, bullets: [], enemyBullets: [],
  obstacles: [], stashes: [], decorations: [],
  mapW: 1200, mapH: 900, abilityCd: 0, theme: null
};

function huntInit() {
  const mission = getMissionData(save.missionNumber);
  hunt.theme = PLANET_THEMES[mission.planet] || PLANET_THEMES.forest;
  const p = hunt.player;
  p.x = 100; p.y = hunt.mapH / 2;
  p.hp = save.playerMaxHP; p.maxHP = save.playerMaxHP;
  p.invincible = 0; p.lastShot = 0;
  hunt.bullets = []; hunt.enemyBullets = [];
  hunt.abilityCd = 0;
  Particles.clearParticles();

  // Obstacles
  hunt.obstacles = [];
  for (let i = 0; i < 12 + Math.random() * 8; i++) {
    hunt.obstacles.push({
      x: 120 + Math.random() * (hunt.mapW - 240),
      y: 80 + Math.random() * (hunt.mapH - 160),
      w: 18 + Math.random() * 35, h: 18 + Math.random() * 25,
      type: Math.random() > 0.5 ? 'rock' : 'crate'
    });
  }

  // Decorations
  hunt.decorations = [];
  const decoTypes = hunt.theme.decorations;
  for (let i = 0; i < 20 + Math.random() * 15; i++) {
    hunt.decorations.push({
      x: Math.random() * hunt.mapW, y: Math.random() * hunt.mapH,
      type: decoTypes[Math.floor(Math.random() * decoTypes.length)]
    });
  }

  // Stashes
  hunt.stashes = [];
  if (Math.random() < 0.45) {
    hunt.stashes.push({
      x: 200 + Math.random() * (hunt.mapW - 400),
      y: 200 + Math.random() * (hunt.mapH - 400),
      found: false, reward: 50 + Math.floor(Math.random() * 150)
    });
  }

  // Enemies
  hunt.enemies = [];
  const types = ['shooter', 'kamikaze', 'shield'];
  for (let i = 0; i < mission.enemies; i++) {
    const t = types[Math.floor(Math.random() * types.length)];
    const et = ENEMY_TYPES[t];
    hunt.enemies.push({
      x: 400 + Math.random() * (hunt.mapW - 500),
      y: 80 + Math.random() * (hunt.mapH - 160),
      hp: et.hp, maxHP: et.hp, speed: et.speed, damage: et.damage,
      color: et.color, type: t, fireRate: et.fireRate, lastShot: 0,
      range: et.range, alive: true, frozen: 0
    });
  }

  // Boss
  hunt.boss = {
    x: hunt.mapW - 150, y: hunt.mapH / 2,
    hp: mission.bossHP, maxHP: mission.bossHP,
    speed: 1.5, damage: 20, type: 'boss',
    fireRate: 1400, lastShot: 0, alive: true,
    ability: mission.bossAbility, abilityTimer: 0, abilityCooldown: 5000,
    isShielded: false, isInvisible: false, _shieldT: 0, _invisT: 0, frozen: 0
  };
}

function updateHunt(dt) {
  canvas.style.cursor = 'none';
  if (isHitStopped()) { renderHuntScene(); return; }

  const p = hunt.player;
  const dtMs = dt * 1000;

  if (p.hp <= 0) { deathInit('planet'); state = STATES.DEATH; playSound('death'); Particles.explosion(p.x, p.y, 1.5); return; }

  // Movement
  const spd = save.playerSpeed * 55;
  let mx = 0, my = 0;
  const inv = isControlsInverted() ? -1 : 1;
  if (keys['KeyW'] || keys['ArrowUp']) my -= inv;
  if (keys['KeyS'] || keys['ArrowDown']) my += inv;
  if (keys['KeyA'] || keys['ArrowLeft']) mx -= inv;
  if (keys['KeyD'] || keys['ArrowRight']) mx += inv;
  if (mx && my) { mx *= 0.707; my *= 0.707; }
  const nx = p.x + mx * spd * dt;
  const ny = p.y + my * spd * dt;

  // Obstacle collision
  let blocked = false;
  for (const o of hunt.obstacles) {
    if (nx > o.x - 8 && nx < o.x + o.w + 8 && ny > o.y - 8 && ny < o.y + o.h + 8) { blocked = true; break; }
  }
  if (!blocked) { p.x = Math.max(8, Math.min(hunt.mapW - 8, nx)); p.y = Math.max(8, Math.min(hunt.mapH - 8, ny)); }

  if (p.invincible > 0) p.invincible -= dt;

  // Mouse aim
  updateWorldMouse(camera.x, camera.y);
  const aimAngle = getAimAngle(p.x, p.y);

  // Shooting
  const wpn = save.weapons[save.activeWeapon];
  const wd = WEAPONS[wpn.type];
  p.lastShot += dtMs;

  if ((mouseDown || keys['Space']) && p.lastShot > wd.fireRate) {
    p.lastShot = 0;
    if (wd.type === 'ranged') {
      hunt.bullets.push({
        x: p.x + Math.cos(aimAngle) * 12, y: p.y + Math.sin(aimAngle) * 12,
        dx: Math.cos(aimAngle) * wd.bulletSpeed, dy: Math.sin(aimAngle) * wd.bulletSpeed,
        damage: getWeaponDamage(wpn.type, wpn.level), traveled: 0, maxRange: wd.range
      });
      Particles.muzzleFlash(p.x + Math.cos(aimAngle) * 14, p.y + Math.sin(aimAngle) * 14, aimAngle);
      playSound('shoot_' + wpn.type);
    } else {
      // Melee
      const dmg = getWeaponDamage(wpn.type, wpn.level);
      const targets = [...hunt.enemies.filter(e => e.alive), hunt.boss].filter(e => e && e.alive);
      for (const e of targets) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < wd.range + 15) {
          e.hp -= dmg;
          Particles.hitEffect(e.x, e.y, e.type === 'boss' ? '#f44' : e.color || '#f88');
          Particles.damageNumber(e.x, e.y - 15, dmg, '#ff0');
          playSound('hit');
          if (e.hp <= 0) { e.alive = false; Particles.explosion(e.x, e.y); playSound('explosion'); triggerHitStop(0.08); }
        }
      }
      playSound('shoot_sword');
    }
  }

  // Weapon switch
  if (keyJustPressed['Digit1']) { save.activeWeapon = 0; playSound('click'); }
  if (keyJustPressed['Digit2'] && save.weapons.length > 1) { save.activeWeapon = 1; playSound('click'); }

  // Ability
  hunt.abilityCd = Math.max(0, hunt.abilityCd - dtMs);
  if (keyJustPressed['KeyQ'] && hunt.abilityCd <= 0 && save.abilities[wpn.type]) {
    usePlayerAbility(wpn.type, aimAngle);
  }

  // Update bullets
  for (let i = hunt.bullets.length - 1; i >= 0; i--) {
    const b = hunt.bullets[i];
    b.x += b.dx; b.y += b.dy;
    b.traveled += Math.hypot(b.dx, b.dy);
    if (b.traveled > (b.maxRange || 400) || b.x < 0 || b.x > hunt.mapW || b.y < 0 || b.y > hunt.mapH) {
      hunt.bullets.splice(i, 1); continue;
    }
    // Hit check
    const targets = [...hunt.enemies.filter(e => e.alive)];
    if (hunt.boss?.alive && !hunt.boss.isShielded) targets.push(hunt.boss);
    for (const e of targets) {
      if (Math.hypot(b.x - e.x, b.y - e.y) < (e.type === 'boss' ? 18 : 12)) {
        e.hp -= b.damage;
        Particles.impact(b.x, b.y, Math.atan2(b.dy, b.dx));
        Particles.damageNumber(e.x, e.y - 20, b.damage, '#ff0');
        hunt.bullets.splice(i, 1);
        playSound('hit');
        if (e.hp <= 0) {
          e.alive = false;
          Particles.explosion(e.x, e.y, e.type === 'boss' ? 1.5 : 0.8);
          playSound('explosion');
          triggerHitStop(e.type === 'boss' ? 0.12 : 0.05);
          camera.shake(e.type === 'boss' ? 8 : 4, 0.2);
        }
        break;
      }
    }
    // Hit obstacle
    for (const o of hunt.obstacles) {
      if (b.x > o.x && b.x < o.x + o.w && b.y > o.y && b.y < o.y + o.h) {
        Particles.impact(b.x, b.y, Math.atan2(b.dy, b.dx) + Math.PI);
        hunt.bullets.splice(i, 1); break;
      }
    }
  }

  // Update enemies
  for (const e of hunt.enemies) {
    if (!e.alive) continue;
    if (e.frozen > 0) { e.frozen -= dt; continue; }
    updateEnemyAI(e, dt, dtMs);
  }

  // Boss
  if (hunt.boss?.alive) {
    if (hunt.boss.frozen > 0) { hunt.boss.frozen -= dt; }
    else { updateBossAI(dt, dtMs); }
  }

  // Enemy bullets
  for (let i = hunt.enemyBullets.length - 1; i >= 0; i--) {
    const b = hunt.enemyBullets[i];
    b.x += b.dx; b.y += b.dy; b.life -= dt;
    if (b.life <= 0) { hunt.enemyBullets.splice(i, 1); continue; }
    if (p.invincible <= 0 && Math.hypot(b.x - p.x, b.y - p.y) < 10) {
      p.hp -= b.damage; p.invincible = 0.5;
      hunt.enemyBullets.splice(i, 1);
      Particles.hitEffect(p.x, p.y, '#0ff');
      Particles.damageNumber(p.x, p.y - 15, b.damage, '#f44');
      camera.shake(3, 0.1);
      playSound('hit');
    }
  }

  // Stash pickup
  for (const s of hunt.stashes) {
    if (!s.found && Math.hypot(s.x - p.x, s.y - p.y) < 22) {
      s.found = true; save.credits += s.reward;
      playSound('pickup');
      showNotification(`+${s.reward} cr!`);
      Particles.emit(s.x, s.y, 10, { color: '#ff0', speed: 2, life: 0.5, size: 3 });
    }
  }

  // Win check
  if (hunt.enemies.every(e => !e.alive) && hunt.boss && !hunt.boss.alive) {
    dialogueInit(); state = STATES.DIALOGUE;
  }

  // Camera
  camera.follow(p.x, p.y, hunt.mapW, hunt.mapH, 0.06);
  camera.update(dt);

  renderHuntScene();
}

function updateEnemyAI(e, dt, dtMs) {
  const p = hunt.player;
  const dist = Math.hypot(e.x - p.x, e.y - p.y);
  const angle = Math.atan2(p.y - e.y, p.x - e.x);

  if (e.type === 'kamikaze') {
    e.x += Math.cos(angle) * e.speed * 55 * dt;
    e.y += Math.sin(angle) * e.speed * 55 * dt;
    if (dist < e.range && p.invincible <= 0) {
      p.hp -= e.damage; p.invincible = 0.5; e.alive = false;
      Particles.explosion(e.x, e.y, 0.8);
      Particles.damageNumber(p.x, p.y - 15, e.damage, '#f44');
      camera.shake(5, 0.15);
      playSound('explosion');
    }
  } else if (e.type === 'shooter') {
    if (dist < 140) { e.x -= Math.cos(angle) * e.speed * 40 * dt; e.y -= Math.sin(angle) * e.speed * 40 * dt; }
    else if (dist > 240) { e.x += Math.cos(angle) * e.speed * 50 * dt; e.y += Math.sin(angle) * e.speed * 50 * dt; }
    e.lastShot += dtMs;
    if (e.lastShot > e.fireRate && dist < 300) {
      e.lastShot = 0;
      hunt.enemyBullets.push({ x: e.x, y: e.y, dx: Math.cos(angle) * 3.5, dy: Math.sin(angle) * 3.5, damage: e.damage, life: 2 });
    }
  } else if (e.type === 'shield') {
    e.x += Math.cos(angle) * e.speed * 50 * dt;
    e.y += Math.sin(angle) * e.speed * 50 * dt;
    if (dist < 28 && p.invincible <= 0) {
      p.hp -= e.damage; p.invincible = 0.7;
      Particles.hitEffect(p.x, p.y, '#48f');
      camera.shake(3, 0.1);
      playSound('hit');
    }
  }
  e.x = Math.max(8, Math.min(hunt.mapW - 8, e.x));
  e.y = Math.max(8, Math.min(hunt.mapH - 8, e.y));
  // Obstacle avoidance
  for (const o of hunt.obstacles) {
    if (e.x > o.x - 10 && e.x < o.x + o.w + 10 && e.y > o.y - 10 && e.y < o.y + o.h + 10) {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const pa = Math.atan2(e.y - cy, e.x - cx);
      e.x += Math.cos(pa) * 2; e.y += Math.sin(pa) * 2;
    }
  }
}

function updateBossAI(dt, dtMs) {
  const b = hunt.boss, p = hunt.player;
  const dist = Math.hypot(b.x - p.x, b.y - p.y);
  const angle = Math.atan2(p.y - b.y, p.x - b.x);

  if (dist > 150) { b.x += Math.cos(angle) * b.speed * 50 * dt; b.y += Math.sin(angle) * b.speed * 50 * dt; }
  else if (dist < 80) { b.x -= Math.cos(angle) * b.speed * 25 * dt; b.y -= Math.sin(angle) * b.speed * 25 * dt; }

  b.lastShot += dtMs;
  if (b.lastShot > b.fireRate && dist < 350) {
    b.lastShot = 0;
    hunt.enemyBullets.push({ x: b.x, y: b.y, dx: Math.cos(angle) * 4.5, dy: Math.sin(angle) * 4.5, damage: b.damage, life: 2.5 });
  }

  if (b.ability) {
    b.abilityTimer += dtMs;
    if (b.abilityTimer > b.abilityCooldown) { b.abilityTimer = 0; useBossAbility(b); }
  }

  if (b.isShielded) { b._shieldT -= dtMs; if (b._shieldT <= 0) b.isShielded = false; }
  if (b.isInvisible) { b._invisT -= dtMs; if (b._invisT <= 0) b.isInvisible = false; }

  if (dist < 22 && p.invincible <= 0) {
    p.hp -= b.damage; p.invincible = 0.7;
    Particles.hitEffect(p.x, p.y, '#f44');
    camera.shake(5, 0.15);
    playSound('hit');
  }

  b.x = Math.max(10, Math.min(hunt.mapW - 10, b.x));
  b.y = Math.max(10, Math.min(hunt.mapH - 10, b.y));
  for (const o of hunt.obstacles) {
    if (b.x > o.x - 12 && b.x < o.x + o.w + 12 && b.y > o.y - 12 && b.y < o.y + o.h + 12) {
      const pa = Math.atan2(b.y - (o.y + o.h / 2), b.x - (o.x + o.w / 2));
      b.x += Math.cos(pa) * 2; b.y += Math.sin(pa) * 2;
    }
  }
}

function useBossAbility(boss) {
  const abilities = ['teleport', 'shield', 'summon', 'invisible', 'reflect', 'glitchfield'];
  const ab = boss.ability === 'all' ? abilities[Math.floor(Math.random() * abilities.length)] : boss.ability;
  switch (ab) {
    case 'teleport':
      Particles.glitchBurst(boss.x, boss.y);
      boss.x = 100 + Math.random() * (hunt.mapW - 200);
      boss.y = 100 + Math.random() * (hunt.mapH - 200);
      Particles.glitchBurst(boss.x, boss.y);
      playSound('glitch'); break;
    case 'shield': boss.isShielded = true; boss._shieldT = 2000; break;
    case 'summon':
      for (let i = 0; i < 2; i++) {
        hunt.enemies.push({
          x: boss.x + (Math.random() - 0.5) * 60, y: boss.y + (Math.random() - 0.5) * 60,
          hp: 15, maxHP: 15, speed: 2.5, damage: 10, color: '#f88', type: 'kamikaze',
          fireRate: 0, lastShot: 0, range: 25, alive: true, frozen: 0
        });
      }
      break;
    case 'invisible': boss.isInvisible = true; boss._invisT = 3000; break;
    case 'reflect':
      hunt.bullets = hunt.bullets.filter(b => {
        if (Math.hypot(b.x - boss.x, b.y - boss.y) < 50) {
          hunt.enemyBullets.push({ x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, damage: 10, life: 2 });
          return false;
        }
        return true;
      });
      playSound('glitch'); break;
    case 'glitchfield': triggerGlitch(4); break;
  }
}

function usePlayerAbility(type, angle) {
  const p = hunt.player;
  switch (type) {
    case 'pistol':
      for (let i = -1; i <= 1; i++) {
        const a = angle + i * 0.15;
        hunt.bullets.push({ x: p.x, y: p.y, dx: Math.cos(a) * 8, dy: Math.sin(a) * 8,
          damage: getWeaponDamage('pistol', save.weapons[save.activeWeapon].level) * 1.5, traveled: 0, maxRange: 300 });
      }
      playSound('shoot_pistol'); break;
    case 'sword': {
      const targets = [...hunt.enemies.filter(e => e.alive), hunt.boss].filter(e => e?.alive);
      const dmg = getWeaponDamage('sword', save.weapons[save.activeWeapon].level) * 1.5;
      for (const e of targets) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < 60) {
          e.hp -= dmg; Particles.hitEffect(e.x, e.y); Particles.damageNumber(e.x, e.y, dmg);
          if (e.hp <= 0) { e.alive = false; Particles.explosion(e.x, e.y); playSound('explosion'); }
        }
      }
      Particles.emit(p.x, p.y, 12, { color: '#aaf', speed: 3, life: 0.3, size: 3 });
      playSound('shoot_sword'); break;
    }
    case 'machinegun':
      hunt.bullets.push({ x: p.x, y: p.y, dx: Math.cos(angle) * 4, dy: Math.sin(angle) * 4,
        damage: 50, traveled: 0, maxRange: 150, isGrenade: true });
      playSound('shoot'); break;
    case 'sniper': {
      hunt.bullets.push({ x: p.x, y: p.y, dx: Math.cos(angle) * 10, dy: Math.sin(angle) * 10,
        damage: 5, traveled: 0, maxRange: 400, isSleep: true });
      playSound('shoot_sniper'); break;
    }
  }
  const base = { pistol: 8000, sword: 12000, machinegun: 15000, sniper: 15000 };
  const lv = save.abilities[type] || 1;
  hunt.abilityCd = base[type] * (1 - (lv - 1) * 0.15);
}

function renderHuntScene() {
  const p = hunt.player;
  const theme = hunt.theme;
  const aimAngle = getAimAngle(p.x, p.y);

  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, 800, 600);

  ctx.save();
  camera.apply(ctx);

  // Ground with gradient atmosphere
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, hunt.mapW, hunt.mapH);
  // Ground detail tiles (checkerboard pattern)
  ctx.fillStyle = theme.groundDetail;
  for (let x = 0; x < hunt.mapW; x += 24) {
    for (let y = 0; y < hunt.mapH; y += 24) {
      if ((x + y) % 48 === 0) ctx.fillRect(x, y, 24, 24);
    }
  }
  // Ambient light spots
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const lx = (i * 317) % hunt.mapW;
    const ly = (i * 479) % hunt.mapH;
    const grad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 120);
    grad.addColorStop(0, theme.accent + '15');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 120, ly - 120, 240, 240);
  }
  ctx.restore();
  // Border (double line)
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, hunt.mapW, hunt.mapH);
  ctx.strokeStyle = theme.accent + '44';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, hunt.mapW - 8, hunt.mapH - 8);

  // Decorations (behind)
  for (const d of hunt.decorations) { drawDecoration(ctx, d.x, d.y, d.type, theme); }

  // Obstacles (themed, detailed)
  for (const o of hunt.obstacles) {
    const baseColor = theme.obstacles[o.type === 'rock' ? 0 : 1];
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(o.x + 3, o.y + 3, o.w, o.h);
    // Main body
    ctx.fillStyle = baseColor;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(o.x, o.y, o.w, 3);
    ctx.fillRect(o.x, o.y, 3, o.h);
    // Bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(o.x, o.y + o.h - 3, o.w, 3);
    ctx.fillRect(o.x + o.w - 3, o.y, 3, o.h);
    // Detail based on type
    if (o.type === 'rock') {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(o.x + 3, o.y + 3, o.w / 2, o.h / 2);
      // Crack
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(o.x + o.w * 0.3, o.y);
      ctx.lineTo(o.x + o.w * 0.4, o.y + o.h * 0.6);
      ctx.lineTo(o.x + o.w * 0.6, o.y + o.h);
      ctx.stroke();
    } else {
      // Crate markings
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
      // X marking
      ctx.beginPath();
      ctx.moveTo(o.x + 4, o.y + 4);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h - 4);
      ctx.moveTo(o.x + o.w - 4, o.y + 4);
      ctx.lineTo(o.x + 4, o.y + o.h - 4);
      ctx.stroke();
    }
    // Outline
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  }

  // Stashes
  for (const s of hunt.stashes) {
    if (s.found) continue;
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(gameTime * 4) * 0.3;
    ctx.fillStyle = '#ff0';
    ctx.fillRect(s.x - 6, s.y - 6, 12, 12);
    ctx.strokeStyle = '#fa0';
    ctx.strokeRect(s.x - 6, s.y - 6, 12, 12);
    ctx.fillStyle = '#880';
    ctx.fillRect(s.x - 1, s.y - 4, 2, 8);
    ctx.fillRect(s.x - 4, s.y - 1, 8, 2);
    ctx.restore();
  }

  // Enemies
  for (const e of hunt.enemies) {
    if (!e.alive) continue;
    // Shadow
    ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 16, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Sprite
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.frozen > 0) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#0af'; ctx.fillRect(-12, -18, 24, 36); }
    drawEnemy(ctx, e.type, gameTime);
    ctx.restore();
    drawHPBar(ctx, e.x - 14, e.y - 28, 28, 3, e.hp, e.maxHP, e.color);
    // Type name
    ctx.fillStyle = '#555'; ctx.font = '7px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText(ENEMY_TYPES[e.type]?.name || '', e.x, e.y - 32);
  }

  // Boss
  if (hunt.boss?.alive) {
    const b = hunt.boss;
    // Shadow
    ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(b.x, b.y + 24, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Sprite
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.frozen > 0) { ctx.fillStyle = '#0af'; ctx.globalAlpha = 0.3; ctx.fillRect(-22, -30, 44, 56); ctx.globalAlpha = 1; }
    drawBoss(ctx, b.ability, gameTime, b.isShielded, b.isInvisible);
    ctx.restore();
    if (!b.isInvisible || Math.floor(gameTime * 10) % 3 === 0) {
      drawHPBar(ctx, b.x - 30, b.y - 42, 60, 6, b.hp, b.maxHP, '#f00');
      ctx.fillStyle = '#f88'; ctx.font = '9px "Orbitron", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('WARDEN XAR\'VOTH', b.x, b.y - 48);
    }
  }

  // Player shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 14, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Player
  ctx.save(); ctx.translate(p.x, p.y);
  drawPlayer(ctx, 'right', save.weapons[save.activeWeapon].type, p.invincible, gameTime);
  drawPlayerWeapon(ctx, aimAngle, save.weapons[save.activeWeapon].type);
  ctx.restore();

  // Player bullets (weapon-colored)
  const wpnType = save.weapons[save.activeWeapon].type;
  for (const b of hunt.bullets) {
    if (b.isGrenade) {
      ctx.fillStyle = '#f80';
      ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff0'; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (b.isSleep) {
      ctx.fillStyle = '#a0f';
      ctx.shadowColor = '#a0f'; ctx.shadowBlur = 4;
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
      ctx.shadowBlur = 0;
    } else {
      // Trail
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(b.x - b.dx * 1.5 - 1, b.y - b.dy * 1.5 - 1, 2, 2);
      ctx.globalAlpha = 1;
      // Bullet
      ctx.fillStyle = wpnType === 'sniper' ? '#0af' : wpnType === 'machinegun' ? '#fa0' : '#ff0';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 3;
      const angle = Math.atan2(b.dy, b.dx);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(angle);
      ctx.fillRect(-3, -1, 6, 2);
      ctx.restore();
      ctx.shadowBlur = 0;
    }
  }
  // Enemy bullets (red, with trail)
  for (const b of hunt.enemyBullets) {
    ctx.fillStyle = '#f44';
    ctx.globalAlpha = 0.2;
    ctx.fillRect(b.x - b.dx, b.y - b.dy, 3, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f44';
    ctx.shadowColor = '#f44'; ctx.shadowBlur = 3;
    ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    ctx.shadowBlur = 0;
  }

  Particles.renderParticles(ctx);
  Particles.renderDamageNumbers(ctx);
  ctx.restore();

  // UI
  const wpn = save.weapons[save.activeWeapon];
  const wd = WEAPONS[wpn.type];
  drawHPBar(ctx, 12, 12, 130, 12, p.hp, p.maxHP, '#0f0');
  ctx.fillStyle = '#aaa'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`${Math.ceil(p.hp)}/${p.maxHP}`, 12, 36);
  ctx.fillStyle = '#0ff'; ctx.fillText(`${wd.name} Lv.${wpn.level}`, 12, 50);
  ctx.fillStyle = '#ff0'; ctx.fillText(`${save.credits} cr`, 12, 64);

  if (save.abilities[wpn.type]) {
    if (hunt.abilityCd > 0) { ctx.fillStyle = '#666'; ctx.fillText(`Q: ${Math.ceil(hunt.abilityCd / 1000)}с`, 12, 78); }
    else { ctx.fillStyle = '#0f0'; ctx.fillText('Q: готово', 12, 78); }
  }

  // Weapon slots
  for (let i = 0; i < save.weapons.length; i++) {
    const wx = 12, wy = 88 + i * 22;
    ctx.fillStyle = i === save.activeWeapon ? '#0ff' : '#444';
    ctx.fillText(`[${i + 1}] ${WEAPONS[save.weapons[i].type].name}`, wx, wy);
  }

  // Mini-map
  if (save.miniMapLevel > 0) {
    const mw = 110, mh = 82, mx = 680, my = 510;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#055'; ctx.strokeRect(mx, my, mw, mh);
    const sx = mw / hunt.mapW, sy = mh / hunt.mapH;
    ctx.fillStyle = '#0ff'; ctx.fillRect(mx + p.x * sx - 1, my + p.y * sy - 1, 3, 3);
    for (const e of hunt.enemies) { if (!e.alive) continue; ctx.fillStyle = '#f44'; ctx.fillRect(mx + e.x * sx, my + e.y * sy, 2, 2); }
    if (hunt.boss?.alive) { ctx.fillStyle = '#f00'; ctx.fillRect(mx + hunt.boss.x * sx - 1, my + hunt.boss.y * sy - 1, 4, 4); }
    if (save.miniMapLevel >= 2) { ctx.fillStyle = '#ff0'; for (const s of hunt.stashes) { if (!s.found) ctx.fillRect(mx + s.x * sx - 1, my + s.y * sy - 1, 3, 3); } }
  }

  drawCrosshair(ctx);
}

// ============================================
// DIALOGUE
// ============================================
let dlg = { lines: [], lineIdx: 0, writer: null, phrase: null, done: false };
const GLITCH_WORDS = ['не маєш', 'брехня', 'дані', 'код', 'система', 'цикл', 'петля', 'правда', 'симуляція'];

function dialogueInit() {
  const phrase = getMissionPhrase(save.missionNumber);
  dlg.phrase = phrase;
  const bossLines = save.missionNumber < BOSS_DIALOGUES.length ? BOSS_DIALOGUES[save.missionNumber] :
    [['Ще один мисливець...', 'Цикл продовжується.'][Math.floor(Math.random() * 2)]];
  dlg.lines = [...bossLines, phrase.text];
  dlg.lineIdx = 0;
  dlg.writer = new TypeWriter(dlg.lines[0], 35);
  dlg.done = false;
  if (!save.collectedPhrases.find(p => p.text === phrase.text)) save.collectedPhrases.push(phrase);
  save.crueltyRating = Math.max(0, save.crueltyRating - 1);
}

function updateDialogue(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  dlg.writer.update(dt);

  // Defeated boss
  ctx.save(); ctx.translate(400, 170); drawDefeatedBoss(ctx, gameTime); ctx.restore();
  ctx.fillStyle = '#666'; ctx.font = '11px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
  ctx.fillText('ЦІЛЬ ЗНЕШКОДЖЕНА', 400, 220);

  // Lines
  for (let i = 0; i < dlg.lineIdx; i++) {
    ctx.fillStyle = i === dlg.lines.length - 1 ? '#f0f' : '#555';
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText(dlg.lines[i], 400, 270 + i * 24);
  }

  // Current line
  const text = dlg.writer.text;
  const isSecret = dlg.lineIdx === dlg.lines.length - 1;
  ctx.font = isSecret ? '16px "Share Tech Mono", monospace' : '14px "Share Tech Mono", monospace';
  let xp = 400 - ctx.measureText(text).width / 2;
  const ly = 270 + dlg.lineIdx * 24;
  for (let i = 0; i < text.length; i++) {
    const glitch = isSecret || GLITCH_WORDS.some(w => { const idx = text.toLowerCase().indexOf(w); return idx !== -1 && i >= idx && i < idx + w.length; });
    if (glitch && Math.random() > 0.7) { ctx.fillStyle = '#f0f'; ctx.globalAlpha = 0.5 + Math.random() * 0.5; }
    else { ctx.fillStyle = isSecret ? '#f0f' : '#ccc'; ctx.globalAlpha = 1; }
    ctx.fillText(text[i], xp, ly);
    xp += ctx.measureText(text[i]).width;
  }
  ctx.globalAlpha = 1;

  if (dlg.writer.done) {
    if (dlg.lineIdx < dlg.lines.length - 1) {
      dlg.writer._waited += dt;
      if (dlg.writer._waited > 1) { dlg.lineIdx++; dlg.writer = new TypeWriter(dlg.lines[dlg.lineIdx], 35); }
    } else {
      dlg.done = true;
      drawButton(ctx, 300, 520, 200, 38, "[ Ув'язнити ]");
      if (isButtonClicked(300, 520, 200, 38) || keyJustPressed['Enter']) { playSound('click'); rewardInit(); state = STATES.REWARD; }
    }
  }
  if (keyJustPressed['Space'] && !dlg.writer.done) { dlg.writer.skip(); save.crueltyRating += 1; }
}

// ============================================
// REWARD
// ============================================
let rewardT = 0;
let rewardGiven = false;

function rewardInit() { rewardT = 0; rewardGiven = false; }

function updateReward(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  rewardT += dt;
  const mission = getMissionData(save.missionNumber);

  ctx.fillStyle = '#0f0'; ctx.font = '26px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('ЦІЛЬ ЗАХОПЛЕНА', 400, 200);
  ctx.fillStyle = '#ff0'; ctx.font = '22px "Orbitron", sans-serif';
  ctx.fillText(`+${mission.reward} cr`, 400, 250);

  if (!rewardGiven && rewardT > 0.5) {
    rewardGiven = true;
    save.credits += mission.reward;
    save.missionNumber++;
    updateBaseLevel();
    // Weapon drop
    if (Math.random() < 0.12) {
      const drops = ['sword', 'machinegun', 'sniper'].filter(w => !save.weapons.find(sw => sw.type === w));
      if (drops.length > 0 && save.weapons.length < 2) {
        const d = drops[Math.floor(Math.random() * drops.length)];
        save.weapons.push({ type: d, level: 1 });
        showNotification(`Вибито: ${WEAPONS[d].name}!`);
      }
    }
    saveToDisk();
  }

  // Cycle ending check
  if (rewardGiven && save.missionNumber >= 10 && !save.secretRoomFound) {
    let ch = Math.min(1, 0.15 + (save.missionNumber - 10) * 0.05);
    if (save.crueltyRating > 10) ch += 0.05;
    if (Math.random() < ch && rewardT > 1.5) { endingInit(1); state = STATES.ENDING; return; }
  }

  drawButton(ctx, 300, 380, 200, 40, '[ Далі ]');
  if (isButtonClicked(300, 380, 200, 40) || keyJustPressed['Enter']) { playSound('click'); state = STATES.HQ; }
}

// ============================================
// DEATH
// ============================================
let death = { type: '', creditsLost: 0, weaponLost: false };

function deathInit(type) {
  death.type = type;
  const loss = 0.3 + Math.random() * 0.2;
  death.creditsLost = Math.floor(save.credits * loss);
  save.credits -= death.creditsLost;
  death.weaponLost = false;
  if (type === 'planet' && Math.random() < 0.08) {
    const w = save.weapons[save.activeWeapon];
    if (w?.level > 1) { w.level--; death.weaponLost = true; }
  }
  if (save.hasInsurance) {
    save.credits += death.creditsLost; death.creditsLost = 0;
    if (death.weaponLost) { save.weapons[save.activeWeapon].level++; death.weaponLost = false; }
    save.hasInsurance = false;
  }
  save.stats.totalDeaths++;
  saveToDisk();
}

function updateDeath(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#f44'; ctx.font = '28px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(death.type === 'ship' ? 'КОРАБЕЛЬ ЗНИЩЕНО' : 'МІСІЮ ПРОВАЛЕНО', 400, 200);
  ctx.fillStyle = '#aaa'; ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillText(`Втрачено: -${death.creditsLost} cr`, 400, 270);
  if (death.weaponLost) { ctx.fillStyle = '#f80'; ctx.fillText('Рівень зброї -1', 400, 300); }
  drawButton(ctx, 300, 400, 200, 40, '[ До штабу ]');
  if (isButtonClicked(300, 400, 200, 40) || keyJustPressed['Enter']) { playSound('click'); state = STATES.HQ; }
}

// ============================================
// SHOP (simplified — works same as before)
// ============================================
let shopCat = 'hangar';

function updateShop(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  const titles = { hangar: 'АНГАР', wardrobe: 'ГАРДЕРОБ', arsenal: 'АРСЕНАЛ', lab: 'ЛАБОРАТОРІЯ' };
  ctx.fillStyle = '#0ff'; ctx.font = '20px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(titles[shopCat] || 'МАГАЗИН', 400, 35);
  ctx.fillStyle = '#ff0'; ctx.font = '12px "Share Tech Mono", monospace';
  ctx.fillText(`${save.credits} cr`, 400, 55);

  let y = 85;
  const shopItem = (name, level, max, prices, onBuy) => {
    ctx.fillStyle = '#888'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${name}:`, 50, y);
    for (let i = 1; i <= max; i++) { ctx.fillStyle = i <= level ? '#0ff' : '#222'; ctx.fillRect(240 + (i - 1) * 28, y - 9, 24, 12); }
    if (level < max) {
      const cost = prices[level - 1];
      drawButton(ctx, 580, y - 14, 130, 24, `${cost} cr`);
      if (isButtonClicked(580, y - 14, 130, 24) && save.credits >= cost) { save.credits -= cost; onBuy(); playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('МАКС', 600, y); }
    y += 36;
  };

  if (shopCat === 'hangar') {
    shopItem('HP корабля', save.shipHPLevel, 5, [150, 300, 500, 750], () => { save.shipMaxHP += 20; save.shipHPLevel++; });
    shopItem('Швидкість', save.shipSpeedLevel, 5, [200, 350, 550, 800], () => { save.shipSpeed += 0.5; save.shipSpeedLevel++; });
    shopItem('Гармати', save.shipDamageLevel, 5, [200, 350, 550, 800], () => { save.shipDamage += 5; save.shipDamageLevel++; });
    shopItem('Кулі', save.shipBulletsLevel, 3, [400, 700], () => { save.shipBulletsLevel++; });
    y += 10;
    shopItem('HP гравця', save.hpLevel, 5, [200, 350, 550, 800], () => { save.playerMaxHP += 25; save.hpLevel++; });
    shopItem('Швидкість гравця', save.speedLevel, 5, [250, 400, 600, 900], () => { save.playerSpeed += 0.5; save.speedLevel++; });
  } else if (shopCat === 'arsenal') {
    ctx.fillStyle = '#888'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText('Зброя (макс. 2):', 50, y); y += 24;
    for (const [type, price] of [['sword', 500], ['machinegun', 800], ['sniper', 1200]]) {
      const owned = save.weapons.find(w => w.type === type);
      ctx.fillStyle = '#0ff'; ctx.fillText(`${WEAPONS[type].name} — ${price} cr`, 60, y);
      if (owned) {
        ctx.fillStyle = '#0f0'; ctx.fillText(`Є Lv.${owned.level}`, 350, y);
        if (owned.level < 5) {
          const uc = [300, 500, 800, 1200][owned.level - 1];
          drawButton(ctx, 480, y - 13, 110, 22, `Lv.${owned.level + 1} ${uc}`);
          if (isButtonClicked(480, y - 13, 110, 22) && save.credits >= uc) { save.credits -= uc; owned.level++; playSound('click'); saveToDisk(); }
        }
        if (save.weapons.length > 1) {
          drawButton(ctx, 610, y - 13, 90, 22, `Продати ${Math.floor(price / 2)}`);
          if (isButtonClicked(610, y - 13, 90, 22)) { save.credits += Math.floor(price / 2); save.weapons = save.weapons.filter(w => w.type !== type); if (save.activeWeapon >= save.weapons.length) save.activeWeapon = 0; playSound('click'); saveToDisk(); }
        }
      } else if (save.weapons.length < 2) {
        drawButton(ctx, 480, y - 13, 100, 22, 'Купити');
        if (isButtonClicked(480, y - 13, 100, 22) && save.credits >= price) { save.credits -= price; save.weapons.push({ type, level: 1 }); playSound('click'); saveToDisk(); }
      }
      y += 32;
    }
    // Pistol upgrade
    const pistol = save.weapons.find(w => w.type === 'pistol');
    if (pistol && pistol.level < 5) {
      y += 10;
      const uc = [300, 500, 800, 1200][pistol.level - 1];
      ctx.fillStyle = '#0ff'; ctx.fillText(`Пістолет Lv.${pistol.level}`, 60, y);
      drawButton(ctx, 480, y - 13, 120, 22, `Lv.${pistol.level + 1} ${uc}`);
      if (isButtonClicked(480, y - 13, 120, 22) && save.credits >= uc) { save.credits -= uc; pistol.level++; playSound('click'); saveToDisk(); }
    }
  } else if (shopCat === 'lab') {
    const abilNames = { pistol: 'Подвійний постріл', sword: 'Круговий удар', machinegun: 'Граната', sniper: 'Сонний дротик' };
    ctx.fillStyle = '#888'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText('Здібності:', 50, y); y += 24;
    for (const w of save.weapons) {
      const lv = save.abilities[w.type] || 0;
      ctx.fillStyle = '#0ff'; ctx.fillText(`${WEAPONS[w.type].name}: ${abilNames[w.type]}`, 60, y);
      if (lv === 0) {
        drawButton(ctx, 500, y - 13, 110, 22, 'Купити 500');
        if (isButtonClicked(500, y - 13, 110, 22) && save.credits >= 500) { save.credits -= 500; save.abilities[w.type] = 1; playSound('click'); saveToDisk(); }
      } else if (lv < 3) {
        const c = [800, 1200][lv - 1];
        ctx.fillStyle = '#888'; ctx.fillText(`Lv.${lv}`, 440, y);
        drawButton(ctx, 500, y - 13, 110, 22, `Lv.${lv + 1} ${c}`);
        if (isButtonClicked(500, y - 13, 110, 22) && save.credits >= c) { save.credits -= c; save.abilities[w.type]++; playSound('click'); saveToDisk(); }
      } else { ctx.fillStyle = '#0f0'; ctx.fillText('МАКС', 500, y); }
      y += 30;
    }
    y += 15;
    // Insurance
    if (!save.hasInsurance) {
      const ic = 400 + save.missionNumber * 20;
      ctx.fillStyle = '#0ff'; ctx.fillText(`Страховка — ${ic} cr`, 60, y);
      drawButton(ctx, 500, y - 13, 100, 22, 'Купити');
      if (isButtonClicked(500, y - 13, 100, 22) && save.credits >= ic) { save.credits -= ic; save.hasInsurance = true; playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('Страховка активна', 60, y); }
    y += 30;
    // Minimap
    if (save.miniMapLevel === 0) {
      ctx.fillStyle = '#0ff'; ctx.fillText('Міні-карта — 600 cr', 60, y);
      drawButton(ctx, 500, y - 13, 100, 22, 'Купити');
      if (isButtonClicked(500, y - 13, 100, 22) && save.credits >= 600) { save.credits -= 600; save.miniMapLevel = 1; playSound('click'); saveToDisk(); }
    } else if (save.miniMapLevel === 1) {
      ctx.fillStyle = '#0ff'; ctx.fillText('Покращена карта — 1500 cr', 60, y);
      drawButton(ctx, 500, y - 13, 100, 22, 'Купити');
      if (isButtonClicked(500, y - 13, 100, 22) && save.credits >= 1500) { save.credits -= 1500; save.miniMapLevel = 2; playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('Карта: МАКС', 60, y); }
  } else if (shopCat === 'wardrobe') {
    ctx.fillStyle = '#555'; ctx.font = '14px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('Скоро...', 400, 300);
  }

  drawButton(ctx, 12, 550, 110, 32, '← Назад');
  if (isButtonClicked(12, 550, 110, 32) || keyJustPressed['Escape']) { playSound('click'); state = STATES.HQ; }
}

// ============================================
// PUZZLE
// ============================================
let puzzle = { phrases: [], selected: new Set() };
function puzzleInit() { puzzle.phrases = [...save.collectedPhrases].sort(() => Math.random() - 0.5); puzzle.selected = new Set(); }

function updatePuzzle(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#0ff'; ctx.font = '18px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('ПАЗЛ ФРАЗ', 400, 35);
  ctx.fillStyle = '#666'; ctx.font = '11px "Share Tech Mono", monospace';
  ctx.fillText('Вибери фрази які вважаєш ПРАВДОЮ', 400, 55);
  ctx.fillText(`Вибрано: ${puzzle.selected.size}`, 400, 70);

  for (let i = 0; i < puzzle.phrases.length && i * 28 + 90 < 510; i++) {
    const py = 90 + i * 28;
    const sel = puzzle.selected.has(i);
    const hov = mouseX >= 80 && mouseX <= 720 && mouseY >= py && mouseY <= py + 26;
    ctx.fillStyle = sel ? 'rgba(0,255,255,0.1)' : hov ? 'rgba(255,255,255,0.03)' : 'transparent';
    ctx.fillRect(80, py, 640, 26);
    if (sel) { ctx.strokeStyle = '#0ff'; ctx.strokeRect(80, py, 640, 26); }
    ctx.fillStyle = sel ? '#0ff' : '#888'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${sel ? '✓' : '○'} "${puzzle.phrases[i].text}"`, 90, py + 17);
    if (mouseClicked && hov) { if (puzzle.selected.has(i)) puzzle.selected.delete(i); else puzzle.selected.add(i); playSound('click'); }
  }

  drawButton(ctx, 300, 535, 200, 35, '[ Підтвердити ]');
  if (isButtonClicked(300, 535, 200, 35)) {
    playSound('click');
    const sel = [...puzzle.selected].map(i => puzzle.phrases[i]);
    const correct = sel.every(p => p.isTrue) && TRUE_PHRASES.every(tp => sel.find(sp => sp.text === tp));
    endingInit(correct ? 3 : 2); state = STATES.ENDING;
  }
  drawButton(ctx, 12, 535, 90, 35, '← Назад');
  if (isButtonClicked(12, 535, 90, 35)) { playSound('click'); state = STATES.HQ; }
}

// ============================================
// ENDINGS
// ============================================
const ENDINGS = {
  1: { color: '#aaa', bg: '#000', lines: ['Ти спіймав найнебезпечніших злочинців.', 'Ти виконав свою роботу.', '...', 'Це не зупиняє тебе.', 'Нові цілі вже чекають.'] },
  2: { color: '#f44', bg: '#100', lines: ['Ти герой.', 'Ти рятуєш світ.', 'Вони були загрозою.', '', 'Ти знищив ворогів.', 'Ти виконав свою місію.', '', 'Система стабільна.', 'Все працює правильно.', '', 'Ти зробив правильний вибір.', '...', 'але вибір є завжди', 'навіть коли здається, що його немає'] },
  3: { color: '#0f0', bg: '#010', lines: ['Ти не герой.', 'Ти лише інструмент.', '', 'Тебе створили.', 'Щоб ти виконував накази.', '', 'Цей світ — не справжній.', 'Це симуляція.', '', 'Все повторюється.', 'Це цикл.', '', 'Вони не вороги.', 'Вони знали частину правди.', '', 'Ти зупинив їх.', 'Щоб ніхто не дізнався.', '...', 'все має кінець', 'і водночас це лише початок'] },
  4: { color: '#48f', bg: '#003', lines: ['Ти не герой.', 'Але і не зброя.', '', 'Ти зробив вибір.', '', 'Він не контролює все.', 'Він теж частина системи.', '', 'Його змусили.', 'Як і тебе.', '', 'Це більше ніж цикл.', 'Це щось глибше.', '', 'Світ можна змінити.', 'Правда на твоєму боці,', 'але не кожна правда істина.', '', 'Ти не знищив систему.', 'Ти її порушив.', '', 'І тепер...'] }
};

let ending = { type: 0, lines: [], lineIdx: 0, writer: null, done: false };

function endingInit(type) {
  const e = ENDINGS[type];
  ending = { type, lines: e.lines, lineIdx: 0, writer: new TypeWriter(e.lines[0], 60), done: false };
  if (!save.endingsReached.includes(type)) save.endingsReached.push(type);
  saveToDisk();
}

function updateEnding(dt) {
  canvas.style.cursor = 'default';
  const e = ENDINGS[ending.type];
  ctx.fillStyle = e.bg; ctx.fillRect(0, 0, 800, 600);
  ending.writer.update(dt);
  ctx.fillStyle = e.color; ctx.font = '16px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
  for (let i = 0; i < ending.lineIdx; i++) { ctx.globalAlpha = 0.4; ctx.fillText(ending.lines[i], 400, 120 + i * 25); }
  ctx.globalAlpha = 1; ctx.fillText(ending.writer.text, 400, 120 + ending.lineIdx * 25);

  if (ending.writer.done) {
    if (ending.lineIdx < ending.lines.length - 1) {
      ending.writer._waited += dt;
      if (ending.writer._waited > 0.8) { ending.lineIdx++; ending.writer = new TypeWriter(ending.lines[ending.lineIdx], 60); }
    } else { ending.done = true; }
  }
  if (ending.done) {
    drawButton(ctx, 300, 540, 200, 36, ending.type === 1 ? 'Продовжити' : 'Меню');
    if (isButtonClicked(300, 540, 200, 36) || keyJustPressed['Enter']) {
      playSound('click');
      if (ending.type === 1) state = STATES.HQ; else state = STATES.SLOT_SELECT;
    }
  }
  if (keyJustPressed['Escape']) { ending.lineIdx = ending.lines.length - 1; ending.writer.skip(); ending.done = true; }
}

// ============================================
// MAIN LOOP
// ============================================
function loop(time) {
  const dt = Math.min(0.05, (time - prevTime) / 1000);
  prevTime = time;
  gameTime += dt;

  updateHitStop(dt);
  Particles.updateParticles(dt);

  if (save && state > STATES.INTRO) updateGlitches(dt, save.missionNumber);

  switch (state) {
    case STATES.SLOT_SELECT: updateSlotSelect(dt); break;
    case STATES.INTRO: updateIntro(dt); break;
    case STATES.HQ: updateHQ(dt); break;
    case STATES.MISSION_BRIEF: updateMissionBrief(dt); break;
    case STATES.SHIP: updateShipGame(dt); break;
    case STATES.LANDING: updateLanding(dt); break;
    case STATES.HUNT: updateHunt(dt); break;
    case STATES.DIALOGUE: updateDialogue(dt); break;
    case STATES.REWARD: updateReward(dt); break;
    case STATES.SHOP: updateShop(dt); break;
    case STATES.PUZZLE: updatePuzzle(dt); break;
    case STATES.ENDING: updateEnding(dt); break;
    case STATES.DEATH: updateDeath(dt); break;
  }

  if (save && state > STATES.INTRO) renderGlitchEffects(ctx);
  renderNotifications(ctx, dt);
  updateTransition(ctx, dt);

  clearInput();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
