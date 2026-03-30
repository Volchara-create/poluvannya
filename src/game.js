// ============================================
// GAME — main state machine, all game screens
// ============================================

import * as FX from './effects.js';
import * as UI from './ui.js';
import { playSound, initAudio } from './sound.js';
import { drawPlayer, drawWeapon, drawCrosshair } from './player.js';
import { drawShooter, drawKamikaze, drawShield, drawBoss,
  drawSpaceBasic, drawSpaceFast, drawSpaceHeavy,
  drawCommander, drawDefeatedBoss, drawHQPlayer } from './enemy.js';
import { MISSIONS, PLANET_THEMES, drawDecoration, getMissionPhrase,
  getMissionData, BOSS_DIALOGUES, COMMANDER_LINES, ENEMY_TYPES,
  TRUE_PHRASES, FAKE_PHRASES } from './data.js';
import { createNewSave, saves, save, loadSaves, setSlot, saveToDisk,
  deleteSave, updateBaseLevel, WEAPONS, getWeaponDamage } from './save.js';
import { TypeWriter } from './typewriter.js';
import { updateGlitches, renderGlitchEffects, triggerGlitch, isControlsInverted } from './glitch.js';
import * as ATM from './atmosphere.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Input
const keys = {};
const justPressed = {};
let mx = 0, my = 0, mClick = false, mDown = false;

document.addEventListener('keydown', e => {
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * 800 / r.width;
  my = (e.clientY - r.top) * 600 / r.height;
});
canvas.addEventListener('mousedown', () => { mDown = true; });
canvas.addEventListener('mouseup', () => { mDown = false; });
canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * 800 / r.width;
  my = (e.clientY - r.top) * 600 / r.height;
  mClick = true;
});

function btn(x, y, w, h, text) { return UI.button(ctx, x, y, w, h, text, mx, my); }
function btnClick(x, y, w, h) { return mClick && mx >= x && mx <= x + w && my >= y && my <= y + h; }

// State
let S = 0; // 0=slots,1=intro,2=hq,3=brief,4=ship,5=land,6=hunt,7=dlg,8=reward,9=shop,10=puzzle,11=end,12=death
let gt = 0; // game time
let camX = 0, camY = 0;

// Camera
function camFollow(tx, ty, mw, mh, lerp = 0.06) {
  const ttx = Math.max(0, Math.min(mw - 800, tx - 400));
  const tty = Math.max(0, Math.min(mh - 600, ty - 300));
  camX += (ttx - camX) * lerp;
  camY += (tty - camY) * lerp;
}

// World mouse
function wmx() { return mx + camX; }
function wmy() { return my + camY; }
function aimAngle(px, py) { return Math.atan2(wmy() - py, wmx() - px); }

loadSaves();

// ============================================
// SLOT SELECT
// ============================================
function slotSelect(dt) {
  canvas.style.cursor = 'default';

  // Deep space background
  const slotBg = ctx.createRadialGradient(400, 200, 50, 400, 300, 500);
  slotBg.addColorStop(0, '#0a0818');
  slotBg.addColorStop(0.5, '#040410');
  slotBg.addColorStop(1, '#010106');
  ctx.fillStyle = slotBg;
  ctx.fillRect(0, 0, 800, 600);

  // Parallax stars
  ATM.renderStars(ctx, gt, 0, 0, 800, 600);

  // Subtle nebula
  ctx.save();
  const sng = ctx.createRadialGradient(300, 200, 20, 300, 200, 200);
  sng.addColorStop(0, 'rgba(0,60,80,0.08)');
  sng.addColorStop(1, 'transparent');
  ctx.fillStyle = sng; ctx.fillRect(0, 0, 800, 600);
  ctx.restore();

  // Title with enhanced glow
  ctx.save();
  ctx.shadowColor = '#0ff'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#0ff'; ctx.font = '30px "Orbitron", sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('ПОЛЮВАННЯ', 400, 70);
  // Double glow
  ctx.shadowBlur = 60;
  ctx.globalAlpha = 0.3;
  ctx.fillText('ПОЛЮВАННЯ', 400, 70);
  ctx.restore();
  ctx.fillStyle = '#077'; ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'center'; ctx.fillText('Космічний Мисливець  ·  Broken Reality', 400, 95);

  for (let i = 0; i < 3; i++) {
    const x = 150, y = 125 + i * 145, w = 500, h = 125, s = saves[i];
    const hov = mx >= x && mx <= x + w && my >= y && my <= y + h;
    ctx.fillStyle = hov ? 'rgba(0,255,255,0.05)' : 'rgba(0,20,20,0.3)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = hov ? '#0ff' : '#033'; ctx.lineWidth = hov ? 2 : 1;
    ctx.strokeRect(x, y, w, h);
    ctx.textAlign = 'left'; ctx.fillStyle = '#0ff'; ctx.font = '15px "Orbitron", sans-serif';
    ctx.fillText(`СЛОТ ${i + 1}`, x + 16, y + 28);
    if (s) {
      ctx.fillStyle = '#777'; ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillText(`Місія: ${s.missionNumber + 1}  ·  ${s.credits} cr  ·  База Lv.${s.baseLevel}`, x + 16, y + 52);
      const wp = s.weapons[s.activeWeapon];
      if (wp) ctx.fillText(`Зброя: ${WEAPONS[wp.type].name} Lv.${wp.level}`, x + 16, y + 70);
      // Del btn
      const dx = x + w - 85, dy = y + h - 32;
      const dh = mx >= dx && mx <= dx + 70 && my >= dy && my <= dy + 22;
      ctx.fillStyle = dh ? 'rgba(255,0,0,0.12)' : 'rgba(255,0,0,0.03)';
      ctx.fillRect(dx, dy, 70, 22);
      ctx.strokeStyle = dh ? '#f44' : '#400'; ctx.strokeRect(dx, dy, 70, 22);
      ctx.fillStyle = dh ? '#f88' : '#600'; ctx.font = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'center'; ctx.fillText('Видалити', dx + 35, dy + 14);
      if (mClick && dh) { playSound('click'); deleteSave(i); loadSaves(); return; }
    } else {
      ctx.fillStyle = '#333'; ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillText('Порожній — натисни щоб почати', x + 16, y + 55);
    }
    if (mClick && hov && !(s && mx >= x + w - 85 && my >= y + h - 32)) {
      playSound('click'); initAudio();
      if (!saves[i]) { setSlot(i, createNewSave()); saveToDisk(); introInit(); S = 1; }
      else { setSlot(i, saves[i]); S = 2; }
    }
  }
}

// ============================================
// INTRO
// ============================================
let intro = {};
function introInit() {
  intro = { lines: ['Космічна поліція шукає мисливців.','Ти підходиш.',
    'Ніяких питань. Ніяких відмов.','Ось твоя зброя.','Виконуй завдання.'],
    idx: 0, tw: null, phase: 0 };
  intro.tw = new TypeWriter(intro.lines[0], 45);
}
function runIntro(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  if (intro.phase === 0) {
    intro.tw.update(dt);
    ctx.fillStyle = '#0ff'; ctx.font = '15px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < intro.idx; i++) { ctx.globalAlpha = 0.45; ctx.fillText(intro.lines[i], 400, 200 + i * 30); }
    ctx.globalAlpha = 1; ctx.fillText(intro.tw.text, 400, 200 + intro.idx * 30);
    if (intro.tw.done) {
      if (intro.idx < intro.lines.length - 1) { intro.tw._waited += dt; if (intro.tw._waited > 0.6) { intro.idx++; intro.tw = new TypeWriter(intro.lines[intro.idx], 45); } }
      else intro.phase = 1;
    }
    if (justPressed['Escape'] || justPressed['Enter']) intro.phase = 1;
  }
  if (intro.phase === 1) {
    ctx.fillStyle = '#0ff'; ctx.font = '15px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < intro.lines.length; i++) { ctx.globalAlpha = 0.35; ctx.fillText(intro.lines[i], 400, 200 + i * 30); }
    ctx.globalAlpha = 1;
    // Pixel pistol big
    ctx.save(); ctx.translate(400, 415); ctx.scale(4, 4);
    ctx.fillStyle = '#333'; ctx.fillRect(-4, 1, 4, 4);
    ctx.fillStyle = '#555'; ctx.fillRect(-2, -2, 10, 5);
    ctx.fillStyle = '#777'; ctx.fillRect(7, -1, 3, 3);
    ctx.fillStyle = '#222'; ctx.fillRect(8, 0, 2, 1);
    ctx.restore();
    ctx.fillStyle = '#088'; ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText('[ Отримано: Пістолет ]', 400, 460);
    btn(300, 495, 200, 40, '[ Почати ]');
    if (btnClick(300, 495, 200, 40) || justPressed['Enter']) { playSound('click'); S = 2; }
  }
}

// ============================================
// HQ
// ============================================
let hq = { px: 190, py: 170, dir: 'down', tgt: null };
const HQO = {
  monitor: { x: 45, y: 15, w: 55, h: 32, l: 'Місії', c: '#0af' },
  hangar: { x: 150, y: 15, w: 55, h: 32, l: 'Ангар', c: '#f80' },
  wardrobe: { x: 280, y: 15, w: 55, h: 32, l: 'Гардероб', c: '#f0a' },
  commander: { x: 295, y: 130, w: 35, h: 35, l: 'Командир', c: '#0f0' },
  bed: { x: 12, y: 210, w: 45, h: 32, l: 'Зберегти', c: '#55a' },
  secret: { x: 170, y: 245, w: 35, h: 12, l: '', c: '#222' },
  arsenal: { x: 45, y: 110, w: 55, h: 32, l: 'Арсенал', c: '#f44', mb: 2 },
  lab: { x: 280, y: 210, w: 55, h: 32, l: 'Лабораторія', c: '#a0f', mb: 3 }
};
let cmdTW = null;

function runHQ(dt) {
  canvas.style.cursor = 'default';
  updateBaseLevel();
  const spd = 105 * dt;
  const ox = hq.px, oy = hq.py;
  if (keys['KeyW']||keys['ArrowUp']) { hq.py -= spd; hq.dir = 'up'; }
  if (keys['KeyS']||keys['ArrowDown']) { hq.py += spd; hq.dir = 'down'; }
  if (keys['KeyA']||keys['ArrowLeft']) { hq.px -= spd; hq.dir = 'left'; }
  if (keys['KeyD']||keys['ArrowRight']) { hq.px += spd; hq.dir = 'right'; }
  hq.px = Math.max(8, Math.min(370, hq.px));
  hq.py = Math.max(18, Math.min(268, hq.py));

  for (const [k, o] of Object.entries(HQO)) {
    if (o.mb && save.baseLevel < o.mb) continue;
    if (k === 'secret' && save.missionNumber < 3) continue;
    if (hq.px > o.x - 6 && hq.px < o.x + o.w + 6 && hq.py > o.y - 6 && hq.py < o.y + o.h + 6) { hq.px = ox; hq.py = oy; }
  }

  hq.tgt = null;
  for (const [k, o] of Object.entries(HQO)) {
    if (o.mb && save.baseLevel < o.mb) continue;
    if (k === 'secret' && save.missionNumber < 3) continue;
    if (Math.hypot(hq.px - (o.x + o.w / 2), hq.py - (o.y + o.h / 2)) < 46) { hq.tgt = k; break; }
  }

  if (justPressed['KeyE'] && hq.tgt && !cmdTW) {
    playSound('click');
    if (hq.tgt === 'monitor') { briefInit(); S = 3; }
    else if (hq.tgt === 'hangar') { shopCat = 'hangar'; S = 9; }
    else if (hq.tgt === 'wardrobe') { shopCat = 'wardrobe'; S = 9; }
    else if (hq.tgt === 'arsenal') { shopCat = 'arsenal'; S = 9; }
    else if (hq.tgt === 'lab') { shopCat = 'lab'; S = 9; }
    else if (hq.tgt === 'commander') { cmdTW = new TypeWriter(COMMANDER_LINES[Math.min(save.missionNumber, 9)], 30); }
    else if (hq.tgt === 'bed') { saveToDisk(); UI.notify('Збережено!'); }
    else if (hq.tgt === 'secret') {
      if (!save.secretRoomFound) { save.secretRoomFound = true; saveToDisk(); playSound('alarm'); UI.notify('Ти знайшов щось...'); }
      if (save.collectedPhrases.length >= 5) { puzzleInit(); S = 10; }
    }
  }

  // Render
  // Dark space background with subtle gradient
  const hqBg = ctx.createRadialGradient(400, 300, 100, 400, 300, 450);
  hqBg.addColorStop(0, '#0a0a18');
  hqBg.addColorStop(1, '#040408');
  ctx.fillStyle = hqBg;
  ctx.fillRect(0, 0, 800, 600);

  // Background stars through window effect
  ATM.renderStars(ctx, gt * 0.3, 0, 0, 800, 600);

  ctx.save(); ctx.translate(200, 150);

  // Floor with better tiles
  const aging = Math.min(5, Math.floor(save.missionNumber / 2));
  for (let x = 0; x < 380; x += 20) for (let y = 0; y < 280; y += 20) {
    const base = (x + y) % 40 === 0 ? '#0c0c16' : '#08080f';
    ctx.fillStyle = base;
    ctx.fillRect(x, y, 20, 20);
    // Subtle tile edge
    ctx.fillStyle = 'rgba(255,255,255,0.01)';
    ctx.fillRect(x, y, 20, 1);
    ctx.fillRect(x, y, 1, 20);
  }
  // Walls with gradient
  ctx.strokeStyle = '#1a3030'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 380, 280);
  // Wall glow (animated)
  ctx.strokeStyle = '#0ff'; ctx.globalAlpha = 0.03 + Math.sin(gt * 2) * 0.01; ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 378, 278); ctx.globalAlpha = 1;
  // Ceiling lights with glow
  const lightPositions = [[185, 0], [0, 135], [378, 135], [95, 0], [285, 0]];
  for (const [lx, ly] of lightPositions) {
    ctx.fillStyle = '#0ff'; ctx.globalAlpha = 0.15 + Math.sin(gt * 3 + lx * 0.01) * 0.05;
    ctx.fillRect(lx, ly, 10, 2);
    // Light cone
    const lg = ctx.createRadialGradient(lx + 5, ly + 1, 0, lx + 5, ly + 1, 40);
    lg.addColorStop(0, 'rgba(0,255,255,0.03)');
    lg.addColorStop(1, 'transparent');
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 35, ly, 80, 60);
  }
  ctx.globalAlpha = 1;

  // Cracks
  if (aging >= 2) {
    ctx.strokeStyle = `rgba(255,0,0,${0.03 + aging * 0.015})`; ctx.lineWidth = 1;
    for (let i = 0; i < aging; i++) {
      const cx = 25 + i * 55;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + 7, 15); ctx.lineTo(cx + 3, 35); ctx.stroke();
    }
  }

  // Objects
  for (const [k, o] of Object.entries(HQO)) {
    if (o.mb && save.baseLevel < o.mb) continue;
    if (k === 'secret') {
      if (save.missionNumber < 3) continue;
      ctx.save(); ctx.globalAlpha = 0.15 + Math.sin(gt * 4) * 0.1;
      ctx.fillStyle = '#0ff'; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.restore(); continue;
    }
    if (k === 'commander') {
      ctx.save(); ctx.translate(o.x + o.w / 2, o.y + o.h / 2 + 4);
      drawCommander(ctx, gt); ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(o.x, o.y, o.w, o.h);
    }
    ctx.strokeStyle = hq.tgt === k ? o.c : `${o.c}55`; ctx.lineWidth = hq.tgt === k ? 2 : 1;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
    if (hq.tgt === k) { ctx.save(); ctx.globalAlpha = 0.06 + Math.sin(gt * 4) * 0.03; ctx.fillStyle = o.c; ctx.fillRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4); ctx.restore(); }
    ctx.fillStyle = o.c; ctx.font = '8px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText(o.l, o.x + o.w / 2, o.y + o.h + 10);
  }

  // Player light glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.04 + Math.sin(gt * 3) * 0.01;
  const plg = ctx.createRadialGradient(hq.px, hq.py, 0, hq.px, hq.py, 50);
  plg.addColorStop(0, '#0ff');
  plg.addColorStop(1, 'transparent');
  ctx.fillStyle = plg;
  ctx.beginPath(); ctx.arc(hq.px, hq.py, 50, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Player
  ctx.save(); ctx.translate(hq.px, hq.py);
  drawHQPlayer(ctx, hq.dir, gt); ctx.restore();
  ctx.restore();

  // Post-processing
  ATM.renderVignette(ctx, 800, 600);
  ATM.renderScanlines(ctx, 800, 600);

  // HUD
  if (hq.tgt) { ctx.fillStyle = '#0ff'; ctx.font = '12px "Share Tech Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('[E] — взаємодія', 400, 455); }
  if (!save.tutorialShown.move) { ctx.fillStyle = '#0ff'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('WASD — рух', 400, 478);
    if (keys['KeyW']||keys['KeyA']||keys['KeyS']||keys['KeyD']) save.tutorialShown.move = true; }
  ctx.fillStyle = '#088'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`Місія: ${save.missionNumber + 1}  |  ${save.credits} cr  |  База Lv.${save.baseLevel}`, 10, 16);

  // Commander dialogue
  if (cmdTW) {
    cmdTW.update(dt);
    ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(50, 490, 700, 72);
    ctx.strokeStyle = '#0f0'; ctx.strokeRect(50, 490, 700, 72);
    ctx.fillStyle = '#0f0'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText('КОМАНДИР:', 68, 508);
    ctx.fillStyle = '#ccc'; ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText(cmdTW.text, 68, 533);
    if (cmdTW.done) { ctx.fillStyle = '#444'; ctx.textAlign = 'right'; ctx.font = '9px "Share Tech Mono", monospace';
      ctx.fillText('[E — закрити]', 732, 553);
      if (justPressed['KeyE']||justPressed['Enter']||justPressed['Escape']) cmdTW = null; }
  }
}

// ============================================
// MISSION BRIEF
// ============================================
let curM = null;
function briefInit() { curM = getMissionData(save.missionNumber); }
function runBrief(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  if (!curM) return;
  ctx.fillStyle = '#0ff'; ctx.font = '20px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`МІСІЯ ${save.missionNumber + 1}`, 400, 60);
  ctx.fillStyle = '#fff'; ctx.font = '17px "Orbitron", sans-serif';
  ctx.fillText(curM.name, 400, 95);
  // Planet preview
  const th = PLANET_THEMES[curM.planet] || PLANET_THEMES.forest;
  ctx.fillStyle = th.ground; ctx.fillRect(300, 125, 200, 90);
  ctx.strokeStyle = th.accent; ctx.strokeRect(300, 125, 200, 90);
  // Decorations in preview
  const decTypes = th.decorations;
  for (let i = 0; i < 6; i++) drawDecoration(ctx, 320 + i * 30, 185, decTypes[i % decTypes.length], th);
  ctx.fillStyle = th.decorColor; ctx.font = '9px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
  ctx.fillText(th.name, 400, 230);

  const sy = 260; ctx.textAlign = 'left'; ctx.font = '13px "Share Tech Mono", monospace';
  ctx.fillStyle = '#777'; ctx.fillText('Загроза:', 220, sy);
  ctx.fillStyle = '#f44'; const st = Math.min(5, Math.ceil(curM.enemies / 1.5));
  ctx.fillText('★'.repeat(st) + '☆'.repeat(5 - st), 370, sy);
  ctx.fillStyle = '#777'; ctx.fillText('Ворогів:', 220, sy + 25); ctx.fillStyle = '#ff0'; ctx.fillText(`${curM.enemies}`, 370, sy + 25);
  ctx.fillStyle = '#777'; ctx.fillText('HP боса:', 220, sy + 50); ctx.fillStyle = '#f80'; ctx.fillText(`${curM.bossHP}`, 370, sy + 50);
  ctx.fillStyle = '#777'; ctx.fillText('Нагорода:', 220, sy + 75); ctx.fillStyle = '#0f0'; ctx.font = '15px "Share Tech Mono", monospace';
  ctx.fillText(`${curM.reward} cr`, 370, sy + 75);
  if (curM.bossAbility) { ctx.fillStyle = '#777'; ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillText('Здібність:', 220, sy + 100); ctx.fillStyle = '#f0f'; ctx.fillText('???', 370, sy + 100); }
  btn(235, 510, 120, 38, '← Назад'); btn(415, 510, 150, 38, 'Відправитись');
  if (btnClick(235, 510, 120, 38)) { playSound('click'); S = 2; }
  if (btnClick(415, 510, 150, 38)||justPressed['Enter']) { playSound('click'); shipInit(); S = 4; }
}

// ============================================
// SHIP MINI-GAME (enemies shoot & move smart)
// ============================================
let sh = {};
function shipInit() {
  sh = { x: 400, y: 500, hp: save.shipMaxHP, mhp: save.shipMaxHP, bul: [], en: [], eb: [],
    t: 0, mt: 20, st: 0, ls: 0, alive: true, spd: save.shipSpeed + 1,
    dmg: save.shipDamage, bc: save.shipBulletsLevel };
}
function runShip(dt) {
  canvas.style.cursor = 'none';
  if (!sh.alive) { deathInit('ship'); S = 12; return; }
  const sp = sh.spd * 95;
  if (keys['KeyW']||keys['ArrowUp']) sh.y -= sp * dt;
  if (keys['KeyS']||keys['ArrowDown']) sh.y += sp * dt;
  if (keys['KeyA']||keys['ArrowLeft']) sh.x -= sp * dt;
  if (keys['KeyD']||keys['ArrowRight']) sh.x += sp * dt;
  sh.x = Math.max(22, Math.min(778, sh.x)); sh.y = Math.max(60, Math.min(575, sh.y));

  // Shoot
  sh.ls += dt * 1000;
  if ((keys['Space']||mDown) && sh.ls > 350) {
    sh.ls = 0;
    for (let i = 0; i < sh.bc; i++) sh.bul.push({ x: sh.x + (i - (sh.bc - 1) / 2) * 12, y: sh.y - 18, s: 10 });
    playSound('shoot_pistol'); FX.muzzleFlash(sh.x, sh.y - 20, -Math.PI / 2);
  }

  // Player bullets
  for (let i = sh.bul.length - 1; i >= 0; i--) { sh.bul[i].y -= sh.bul[i].s; if (sh.bul[i].y < -10) sh.bul.splice(i, 1); }

  // Spawn
  sh.st -= dt;
  const df = Math.min(save.missionNumber + 1, 10);
  if (sh.st <= 0) {
    const r = Math.random(), t = r < 0.5 ? 'basic' : r < 0.8 ? 'fast' : 'heavy';
    const hp = { basic: 12, fast: 6, heavy: 35 }[t];
    const spd = { basic: 1.4 + df * 0.18, fast: 2.8 + df * 0.12, heavy: 0.6 + df * 0.08 }[t];
    sh.en.push({ x: Math.random() * 700 + 50, y: -30, t, hp, mhp: hp, spd, zz: 0, ls: 0 });
    sh.st = Math.max(0.3, 1.3 - df * 0.09);
  }

  // Update enemies
  for (let i = sh.en.length - 1; i >= 0; i--) {
    const e = sh.en[i]; e.ls += dt * 1000;
    if (e.t === 'basic') {
      e.y += e.spd; e.x += Math.sign(sh.x - e.x) * 0.4;
      if (e.ls > 1800 && e.y > 40 && e.y < 480) {
        e.ls = 0; const a = Math.atan2(sh.y - e.y, sh.x - e.x);
        sh.eb.push({ x: e.x, y: e.y, dx: Math.cos(a) * 3.2, dy: Math.sin(a) * 3.2, l: 3 });
        FX.muzzleFlash(e.x, e.y + 10, Math.PI / 2);
      }
    } else if (e.t === 'fast') {
      e.zz += dt * 6; e.y += e.spd; e.x += Math.sin(e.zz) * 3;
      if (Math.abs(e.x - sh.x) < 80 && e.y < sh.y) e.y += e.spd * 2;
    } else {
      e.y += e.spd;
      if (e.y > 80 && e.y < 320) { e.y -= e.spd * 0.6;
        if (e.ls > 1400) { e.ls = 0; const a = Math.atan2(sh.y - e.y, sh.x - e.x);
          sh.eb.push({ x: e.x - 10, y: e.y + 8, dx: Math.cos(a) * 2.8, dy: Math.sin(a) * 2.8, l: 3.5 });
          sh.eb.push({ x: e.x + 10, y: e.y + 8, dx: Math.cos(a) * 2.8, dy: Math.sin(a) * 2.8, l: 3.5 });
        }
      }
    }
    // Hit by player
    for (let j = sh.bul.length - 1; j >= 0; j--) {
      if (Math.hypot(sh.bul[j].x - e.x, sh.bul[j].y - e.y) < 16) {
        e.hp -= sh.dmg; FX.impact(e.x, e.y, Math.PI / 2);
        FX.damageNumber(e.x, e.y - 12, sh.dmg, '#ff0');
        sh.bul.splice(j, 1);
        if (e.hp <= 0) { FX.deathEffect(e.x, e.y, e.t === 'heavy' ? '#a44' : '#f44');
          sh.en.splice(i, 1); playSound('explosion'); FX.shake(e.t === 'heavy' ? 5 : 2, 0.1);
        } else playSound('hit');
        break;
      }
    }
    if (!sh.en[i]) continue;
    // Hit ship
    if (e.y > 0 && Math.hypot(e.x - sh.x, e.y - sh.y) < 20) {
      sh.hp -= e.t === 'heavy' ? 25 : 15;
      FX.hitSpark(sh.x, sh.y, '#0ff'); FX.shake(5, 0.12); FX.screenFlash('#f44', 0.15);
      sh.en.splice(i, 1); playSound('hit');
      if (sh.hp <= 0) { sh.alive = false; playSound('death'); FX.deathEffect(sh.x, sh.y, '#0ff'); }
      continue;
    }
    if (e.y > 640) sh.en.splice(i, 1);
  }

  // Enemy bullets
  for (let i = sh.eb.length - 1; i >= 0; i--) {
    const b = sh.eb[i]; b.x += b.dx; b.y += b.dy; b.l -= dt;
    if (b.l <= 0 || b.y > 620) { sh.eb.splice(i, 1); continue; }
    if (Math.hypot(b.x - sh.x, b.y - sh.y) < 14) {
      sh.hp -= 10; FX.hitSpark(sh.x, sh.y, '#0ff'); FX.shake(3, 0.08);
      FX.screenFlash('#f44', 0.1); sh.eb.splice(i, 1); playSound('hit');
      if (sh.hp <= 0) { sh.alive = false; playSound('death'); FX.deathEffect(sh.x, sh.y, '#0ff'); }
    }
  }

  FX.engineTrail(sh.x, sh.y + 14); sh.t += dt;
  if (sh.t >= sh.mt) { landInit(); S = 5; }

  // Render
  // Deep space gradient
  const spaceG = ctx.createRadialGradient(400, 300, 50, 400, 300, 500);
  spaceG.addColorStop(0, '#060818');
  spaceG.addColorStop(0.5, '#030410');
  spaceG.addColorStop(1, '#010206');
  ctx.fillStyle = spaceG;
  ctx.fillRect(0, 0, 800, 600);

  // Multiple nebulae
  ctx.save();
  // Purple nebula
  const ng1 = ctx.createRadialGradient(600, 180, 20, 600, 180, 220);
  ng1.addColorStop(0, 'rgba(60,15,80,0.15)'); ng1.addColorStop(0.5, 'rgba(40,8,60,0.06)'); ng1.addColorStop(1, 'transparent');
  ctx.fillStyle = ng1; ctx.fillRect(0, 0, 800, 600);
  // Blue nebula
  const ng2 = ctx.createRadialGradient(150, 420, 15, 150, 420, 180);
  ng2.addColorStop(0, 'rgba(10,40,80,0.12)'); ng2.addColorStop(0.5, 'rgba(5,20,50,0.05)'); ng2.addColorStop(1, 'transparent');
  ctx.fillStyle = ng2; ctx.fillRect(0, 0, 800, 600);
  // Red/warm nebula (distant)
  const ng3 = ctx.createRadialGradient(700, 500, 10, 700, 500, 150);
  ng3.addColorStop(0, 'rgba(60,20,10,0.08)'); ng3.addColorStop(1, 'transparent');
  ctx.fillStyle = ng3; ctx.fillRect(0, 0, 800, 600);
  ctx.restore();

  // Parallax stars
  ATM.renderStars(ctx, sh.t, 0, sh.t * 50, 800, 600);

  // Additional moving stars for speed feel
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137) % 800;
    const sy = (i * 251 + sh.t * 80 * (1 + (i % 3))) % 650 - 25;
    const trail = 2 + (i % 3) * 3;
    ctx.fillStyle = i % 9 === 0 ? '#aaf' : i % 13 === 0 ? '#ffa' : '#fff';
    ctx.globalAlpha = 0.15 + (i % 5) * 0.06;
    ctx.fillRect(sx, sy, 1, trail);
  }
  ctx.globalAlpha = 1;

  // Ship
  ctx.save(); ctx.translate(sh.x, sh.y); drawPlayer.call ? null : null;
  // Draw ship inline since we import from player.js which is the hunter
  // Using enemy.js doesn't have ship - let's draw inline
  drawShipSprite(ctx, gt);
  ctx.restore();

  // Player bullets
  ctx.fillStyle = '#ff0';
  for (const b of sh.bul) {
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 4;
    ctx.fillRect(b.x - 1, b.y - 4, 2, 8);
    ctx.shadowBlur = 0;
  }

  // Enemies
  for (const e of sh.en) {
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.t === 'basic') drawSpaceBasic(ctx, gt);
    else if (e.t === 'fast') drawSpaceFast(ctx, gt);
    else drawSpaceHeavy(ctx, gt);
    ctx.restore();
    if (e.t === 'heavy') UI.hpBar(ctx, e.x - 14, e.y - 20, 28, 3, e.hp, e.mhp, '#f44');
  }

  // Enemy bullets
  for (const b of sh.eb) {
    ctx.fillStyle = '#f44'; ctx.shadowColor = '#f44'; ctx.shadowBlur = 3;
    ctx.fillRect(b.x - 2, b.y - 2, 4, 4); ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.2; ctx.fillRect(b.x - b.dx, b.y - b.dy, 3, 3); ctx.globalAlpha = 1;
  }

  FX.renderWorld(ctx);

  // HUD
  UI.hpBar(ctx, 12, 10, 130, 12, sh.hp, sh.mhp, '#0f0');
  ctx.fillStyle = '#aaa'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`${Math.ceil(sh.hp)}/${sh.mhp}`, 12, 34);
  ctx.fillStyle = '#0ff'; ctx.font = '18px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(Math.max(0, sh.mt - sh.t))}с`, 400, 26);

  // Post-processing
  ATM.renderVignette(ctx, 800, 600);
  ATM.renderScanlines(ctx, 800, 600);

  if (!save.tutorialShown.shoot) {
    ctx.fillStyle = '#0ff'; ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText('WASD — рух  |  ЛКМ/ПРОБІЛ — стрільба', 400, 585);
    if (keys['Space'] || mDown) save.tutorialShown.shoot = true;
  }
}

// Ship sprite (drawn here since it's unique)
function drawShipSprite(ctx, t) {
  ctx.fillStyle = '#0a3a4a'; ctx.fillRect(-8, -20, 16, 30);
  ctx.fillStyle = '#0a5a6a'; ctx.fillRect(-6, -26, 12, 8); ctx.fillRect(-4, -30, 8, 5); ctx.fillRect(-2, -32, 4, 3);
  ctx.fillStyle = '#085858'; ctx.fillRect(-20, -4, 12, 16); ctx.fillRect(8, -4, 12, 16);
  ctx.fillStyle = '#0a6a6a'; ctx.fillRect(-18, -2, 8, 4); ctx.fillRect(10, -2, 8, 4);
  ctx.fillStyle = '#f00'; ctx.fillRect(-20, 2, 3, 3); ctx.fillRect(17, 2, 3, 3);
  ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 4;
  ctx.fillRect(-4, -24, 8, 6); ctx.fillStyle = '#088'; ctx.fillRect(-3, -23, 6, 4); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#0aa'; ctx.lineWidth = 1; ctx.strokeRect(-8, -20, 16, 30);
  ctx.fillStyle = '#f80'; ctx.globalAlpha = 0.6 + Math.random() * 0.3;
  const f = 6 + Math.random() * 10;
  ctx.fillRect(-6, 10, 4, f); ctx.fillRect(2, 10, 4, f);
  ctx.fillStyle = '#ff0'; ctx.globalAlpha = 0.3 + Math.random() * 0.3;
  ctx.fillRect(-5, 12, 2, f - 3); ctx.fillRect(3, 12, 2, f - 3);
  ctx.globalAlpha = 1;
}

// ============================================
// LANDING ANIMATION
// ============================================
let land = { t: 0 };
function landInit() { land.t = 0; }
function runLand(dt) {
  canvas.style.cursor = 'none'; land.t += dt;
  const m = getMissionData(save.missionNumber);
  const th = PLANET_THEMES[m.planet] || PLANET_THEMES.forest;
  ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, 800, 600);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.1 + (i % 4) * 0.04;
    ctx.fillRect((i * 137) % 800, (i * 251 + land.t * 60) % 600, 1, 1); }
  ctx.globalAlpha = 1;
  if (land.t < 1.8) {
    const p = land.t / 1.8;
    ctx.fillStyle = th.ground;
    ctx.beginPath(); ctx.arc(400, 600 + 220 - p * 360, 170 + p * 130, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(400, 70 + p * 200); drawShipSprite(ctx, gt); ctx.restore();
    ctx.fillStyle = '#0ff'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('НАБЛИЖЕННЯ...', 400, 42);
  } else if (land.t < 3) {
    const p = (land.t - 1.8) / 1.2;
    ctx.fillStyle = th.ground; ctx.fillRect(0, 0, 800, 600);
    if (p < 0.35) { ctx.fillStyle = '#fff'; ctx.globalAlpha = (1 - p / 0.35) * 0.4; ctx.fillRect(0, 0, 800, 600); ctx.globalAlpha = 1; }
    if (p < 0.5) FX.shake(6, 0.05);
    ctx.fillStyle = '#0ff'; ctx.font = '16px "Orbitron", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ВХІД В АТМОСФЕРУ', 400, 300);
  } else { huntInit(); S = 6; }
}

// ============================================
// HUNT — main combat, mouse aim
// ============================================
let H = { p: {}, en: [], boss: null, bul: [], eb: [], obs: [], stash: [], deco: [],
  mw: 1200, mh: 900, acd: 0, th: null };

function huntInit() {
  const m = getMissionData(save.missionNumber);
  H.th = PLANET_THEMES[m.planet] || PLANET_THEMES.forest;
  H.p = { x: 100, y: H.mh / 2, hp: save.playerMaxHP, mhp: save.playerMaxHP, inv: 0, ls: 0, moving: false };
  H.bul = []; H.eb = []; H.acd = 0; FX.clear(); ATM.clearAmbient(); camX = 0; camY = 0;

  // Obstacles
  H.obs = [];
  for (let i = 0; i < 10 + Math.random() * 8; i++)
    H.obs.push({ x: 120 + Math.random() * (H.mw - 240), y: 80 + Math.random() * (H.mh - 160), w: 20 + Math.random() * 35, h: 18 + Math.random() * 25, t: Math.random() > 0.5 ? 'r' : 'c' });

  // Decorations
  H.deco = [];
  const dt2 = H.th.decorations;
  for (let i = 0; i < 25 + Math.random() * 15; i++)
    H.deco.push({ x: Math.random() * H.mw, y: Math.random() * H.mh, t: dt2[Math.floor(Math.random() * dt2.length)] });

  // Stashes
  H.stash = [];
  if (Math.random() < 0.45) H.stash.push({ x: 200 + Math.random() * (H.mw - 400), y: 200 + Math.random() * (H.mh - 400), f: false, r: 50 + Math.floor(Math.random() * 150) });

  // Enemies
  H.en = [];
  const types = ['shooter', 'kamikaze', 'shield'];
  for (let i = 0; i < m.enemies; i++) {
    const t = types[Math.floor(Math.random() * types.length)];
    const e = ENEMY_TYPES[t];
    H.en.push({ x: 400 + Math.random() * (H.mw - 500), y: 80 + Math.random() * (H.mh - 160),
      hp: e.hp, mhp: e.hp, spd: e.speed, dmg: e.damage, c: e.color, t, fr: e.fireRate, ls: 0,
      rng: e.range, alive: true, frz: 0 });
  }

  // Boss
  H.boss = { x: H.mw - 150, y: H.mh / 2, hp: m.bossHP, mhp: m.bossHP, spd: 1.5, dmg: 20,
    fr: 1300, ls: 0, alive: true, ab: m.bossAbility, at: 0, acd: 5000,
    sh: false, inv: false, _st: 0, _it: 0, frz: 0 };
}

function runHunt(dt) {
  canvas.style.cursor = 'none';
  if (FX.isHitStopped()) { renderHunt(); return; }
  const p = H.p, dtm = dt * 1000;
  if (p.hp <= 0) { deathInit('planet'); S = 12; playSound('death'); FX.deathEffect(p.x, p.y, '#0ff'); return; }

  // Move
  const spd = save.playerSpeed * 52;
  let dx = 0, dy = 0;
  const inv = isControlsInverted() ? -1 : 1;
  if (keys['KeyW']||keys['ArrowUp']) dy -= inv; if (keys['KeyS']||keys['ArrowDown']) dy += inv;
  if (keys['KeyA']||keys['ArrowLeft']) dx -= inv; if (keys['KeyD']||keys['ArrowRight']) dx += inv;
  if (dx && dy) { dx *= 0.707; dy *= 0.707; }
  p.moving = dx !== 0 || dy !== 0;
  const nx = p.x + dx * spd * dt, ny = p.y + dy * spd * dt;
  let blocked = false;
  for (const o of H.obs) { if (nx > o.x - 8 && nx < o.x + o.w + 8 && ny > o.y - 8 && ny < o.y + o.h + 8) { blocked = true; break; } }
  if (!blocked) { p.x = Math.max(8, Math.min(H.mw - 8, nx)); p.y = Math.max(8, Math.min(H.mh - 8, ny)); }
  if (p.inv > 0) p.inv -= dt;

  // Aim
  const aa = aimAngle(p.x, p.y);

  // Overheat system
  if (!H.heat) H.heat = 0;
  if (!H.overheated) H.overheated = false;
  const wpn = save.weapons[save.activeWeapon], wd = WEAPONS[wpn.type];

  // Cool down
  if (wd.overheat) {
    H.heat = Math.max(0, H.heat - (wd.coolRate || 30) * dt);
    if (H.overheated && H.heat <= 0) H.overheated = false;
  } else {
    H.heat = 0; H.overheated = false;
  }

  // Shoot
  p.ls += dtm;
  const canShoot = !H.overheated && p.ls > wd.fireRate;
  if ((mDown || keys['Space']) && canShoot) {
    p.ls = 0;
    // Overheat
    if (wd.overheat) {
      H.heat += wd.heatPerShot || 6;
      if (H.heat >= (wd.maxHeat || 100)) { H.overheated = true; playSound('glitch'); }
    }
    if (wd.type === 'ranged') {
      H.bul.push({ x: p.x + Math.cos(aa) * 14, y: p.y + Math.sin(aa) * 14,
        dx: Math.cos(aa) * wd.bulletSpeed, dy: Math.sin(aa) * wd.bulletSpeed,
        d: getWeaponDamage(wpn.type, wpn.level), tr: 0, mr: wd.range });
      FX.muzzleFlash(p.x + Math.cos(aa) * 16, p.y + Math.sin(aa) * 16, aa);
      FX.shake(wpn.type === 'sniper' ? 3 : 1.5, 0.06);
      playSound('shoot_' + wpn.type);
    } else {
      const d = getWeaponDamage(wpn.type, wpn.level);
      const meleeMinions = H.en.some(e => e.alive);
      const all = [...H.en.filter(e => e.alive), ...(meleeMinions ? [] : [H.boss])].filter(e => e?.alive);
      for (const e of all) {
        if (Math.hypot(e.x - p.x, e.y - p.y) < wd.range + 16) {
          e.hp -= d; FX.hitSpark(e.x, e.y, e === H.boss ? '#f44' : e.c); FX.damageNumber(e.x, e.y - 16, d, '#ff0', true);
          FX.shake(4, 0.08); playSound('hit');
          if (e.hp <= 0) { e.alive = false; FX.deathEffect(e.x, e.y, e === H.boss ? '#f44' : e.c); playSound('explosion'); FX.hitStop(0.1); FX.shake(8, 0.2); }
        }
      }
      playSound('shoot_sword');
    }
  }

  // Weapon switch
  if (justPressed['Digit1']) { save.activeWeapon = 0; playSound('click'); }
  if (justPressed['Digit2'] && save.weapons.length > 1) { save.activeWeapon = 1; playSound('click'); }

  // Ability
  H.acd = Math.max(0, H.acd - dtm);
  if (justPressed['KeyQ'] && H.acd <= 0 && save.abilities[wpn.type]) {
    // Simplified ability use
    const d = getWeaponDamage(wpn.type, wpn.level);
    if (wpn.type === 'pistol') {
      for (let i = -1; i <= 1; i++) { const a = aa + i * 0.15;
        H.bul.push({ x: p.x, y: p.y, dx: Math.cos(a) * 9, dy: Math.sin(a) * 9, d: Math.ceil(d * 1.5), tr: 0, mr: 300 }); }
      playSound('shoot_pistol');
    } else if (wpn.type === 'sword') {
      const all = [...H.en.filter(e => e.alive), H.boss].filter(e => e?.alive);
      for (const e of all) { if (Math.hypot(e.x - p.x, e.y - p.y) < 60) { e.hp -= d * 1.5; FX.hitSpark(e.x, e.y);
        if (e.hp <= 0) { e.alive = false; FX.deathEffect(e.x, e.y); playSound('explosion'); } } }
      FX.emit(p.x, p.y, 15, { color: '#aaf', speed: 3, life: 0.3, size: 3, glow: true }); playSound('shoot_sword');
    } else if (wpn.type === 'machinegun') {
      H.bul.push({ x: p.x, y: p.y, dx: Math.cos(aa) * 4, dy: Math.sin(aa) * 4, d: 50, tr: 0, mr: 150, gren: true }); playSound('shoot');
    } else if (wpn.type === 'sniper') {
      H.bul.push({ x: p.x, y: p.y, dx: Math.cos(aa) * 11, dy: Math.sin(aa) * 11, d: 5, tr: 0, mr: 400, slp: true }); playSound('shoot_sniper');
    }
    const cd = { pistol: 8000, sword: 12000, machinegun: 15000, sniper: 15000 };
    H.acd = cd[wpn.type] * (1 - ((save.abilities[wpn.type] || 1) - 1) * 0.15);
  }

  // Bullets
  for (let i = H.bul.length - 1; i >= 0; i--) {
    const b = H.bul[i]; b.x += b.dx; b.y += b.dy; b.tr += Math.hypot(b.dx, b.dy);
    FX.bulletTrail(b.x - b.dx * 0.5, b.y - b.dy * 0.5, Math.atan2(b.dy, b.dx));
    if (b.tr > (b.mr || 400) || b.x < 0 || b.x > H.mw || b.y < 0 || b.y > H.mh) { H.bul.splice(i, 1); continue; }

    const targets = [...H.en.filter(e => e.alive)];
    const minionsAlive = H.en.some(e => e.alive);
    if (H.boss?.alive && !H.boss.sh && !minionsAlive) targets.push(H.boss);
    for (const e of targets) {
      const hr = e === H.boss ? 20 : 14;
      if (Math.hypot(b.x - e.x, b.y - e.y) < hr) {
        if (b.slp) { e.frz = 1.5; FX.emit(e.x, e.y, 8, { color: '#a0f', speed: 1.5, life: 0.4, size: 3, glow: true }); }
        else { e.hp -= b.d; }
        FX.impact(b.x, b.y, Math.atan2(b.dy, b.dx));
        FX.damageNumber(e.x, e.y - 20, b.d, '#ff0');
        H.bul.splice(i, 1); playSound('hit');
        if (e.hp <= 0) {
          e.alive = false;
          FX.deathEffect(e.x, e.y, e === H.boss ? '#f44' : e.c);
          playSound('explosion');
          FX.hitStop(e === H.boss ? 0.12 : 0.05);
          FX.shake(e === H.boss ? 10 : 4, e === H.boss ? 0.25 : 0.12);
          FX.screenFlash(e === H.boss ? '#f44' : '#ff0', e === H.boss ? 0.2 : 0.08);
        }
        break;
      }
    }

    // Hit obstacles
    if (H.bul[i]) for (const o of H.obs) {
      if (b.x > o.x && b.x < o.x + o.w && b.y > o.y && b.y < o.y + o.h) {
        FX.impact(b.x, b.y, Math.atan2(b.dy, b.dx) + Math.PI); H.bul.splice(i, 1); break;
      }
    }
  }

  // Enemies
  for (const e of H.en) {
    if (!e.alive) continue;
    if (e.frz > 0) { e.frz -= dt; continue; }
    const dist = Math.hypot(e.x - p.x, e.y - p.y);
    const ang = Math.atan2(p.y - e.y, p.x - e.x);
    if (e.t === 'kamikaze') {
      e.x += Math.cos(ang) * e.spd * 52 * dt; e.y += Math.sin(ang) * e.spd * 52 * dt;
      if (dist < e.rng && p.inv <= 0) {
        p.hp -= e.dmg; p.inv = 0.5; e.alive = false;
        FX.deathEffect(e.x, e.y, '#ff0'); FX.damageNumber(p.x, p.y - 15, e.dmg, '#f44', true);
        FX.shake(6, 0.15); FX.screenFlash('#f80', 0.15); playSound('explosion');
      }
    } else if (e.t === 'shooter') {
      if (dist < 130) { e.x -= Math.cos(ang) * e.spd * 38 * dt; e.y -= Math.sin(ang) * e.spd * 38 * dt; }
      else if (dist > 230) { e.x += Math.cos(ang) * e.spd * 48 * dt; e.y += Math.sin(ang) * e.spd * 48 * dt; }
      e.ls += dtm;
      if (e.ls > e.fr && dist < 300) { e.ls = 0;
        H.eb.push({ x: e.x, y: e.y, dx: Math.cos(ang) * 3.5, dy: Math.sin(ang) * 3.5, d: e.dmg, l: 2 });
        FX.muzzleFlash(e.x + Math.cos(ang) * 12, e.y + Math.sin(ang) * 12, ang);
      }
    } else {
      e.x += Math.cos(ang) * e.spd * 48 * dt; e.y += Math.sin(ang) * e.spd * 48 * dt;
      if (dist < 28 && p.inv <= 0) { p.hp -= e.dmg; p.inv = 0.7; FX.hitSpark(p.x, p.y, '#48f'); FX.shake(3, 0.1); playSound('hit');
        FX.damageNumber(p.x, p.y - 15, e.dmg, '#f44'); }
    }
    e.x = Math.max(8, Math.min(H.mw - 8, e.x)); e.y = Math.max(8, Math.min(H.mh - 8, e.y));
    for (const o of H.obs) { if (e.x > o.x - 10 && e.x < o.x + o.w + 10 && e.y > o.y - 10 && e.y < o.y + o.h + 10) {
      const pa = Math.atan2(e.y - (o.y + o.h / 2), e.x - (o.x + o.w / 2)); e.x += Math.cos(pa) * 2; e.y += Math.sin(pa) * 2; } }
  }

  // Boss
  if (H.boss?.alive) {
    const b = H.boss;
    if (b.frz > 0) { b.frz -= dt; } else {
      const dist = Math.hypot(b.x - p.x, b.y - p.y);
      const ang = Math.atan2(p.y - b.y, p.x - b.x);
      if (dist > 140) { b.x += Math.cos(ang) * b.spd * 48 * dt; b.y += Math.sin(ang) * b.spd * 48 * dt; }
      else if (dist < 70) { b.x -= Math.cos(ang) * b.spd * 24 * dt; b.y -= Math.sin(ang) * b.spd * 24 * dt; }
      b.ls += dtm;
      if (b.ls > b.fr && dist < 350) { b.ls = 0;
        H.eb.push({ x: b.x, y: b.y, dx: Math.cos(ang) * 4.5, dy: Math.sin(ang) * 4.5, d: b.dmg, l: 2.5 });
        FX.muzzleFlash(b.x + Math.cos(ang) * 20, b.y + Math.sin(ang) * 20, ang);
      }
      if (b.ab) { b.at += dtm; if (b.at > b.acd) { b.at = 0; bossAbility(b); } }
      if (b.sh) { b._st -= dtm; if (b._st <= 0) b.sh = false; }
      if (b.inv) { b._it -= dtm; if (b._it <= 0) b.inv = false; }
      if (dist < 22 && p.inv <= 0) { p.hp -= b.dmg; p.inv = 0.7; FX.hitSpark(p.x, p.y, '#f44'); FX.shake(5, 0.15); playSound('hit');
        FX.damageNumber(p.x, p.y - 15, b.dmg, '#f44', true); }
    }
    b.x = Math.max(10, Math.min(H.mw - 10, b.x)); b.y = Math.max(10, Math.min(H.mh - 10, b.y));
    for (const o of H.obs) { if (b.x > o.x - 14 && b.x < o.x + o.w + 14 && b.y > o.y - 14 && b.y < o.y + o.h + 14) {
      const pa = Math.atan2(b.y - (o.y + o.h / 2), b.x - (o.x + o.w / 2)); b.x += Math.cos(pa) * 2; b.y += Math.sin(pa) * 2; } }
  }

  // Enemy bullets
  for (let i = H.eb.length - 1; i >= 0; i--) {
    const b = H.eb[i]; b.x += b.dx; b.y += b.dy; b.l -= dt;
    if (b.l <= 0) { H.eb.splice(i, 1); continue; }
    if (p.inv <= 0 && Math.hypot(b.x - p.x, b.y - p.y) < 10) {
      p.hp -= b.d; p.inv = 0.5; H.eb.splice(i, 1);
      FX.hitSpark(p.x, p.y, '#0ff'); FX.damageNumber(p.x, p.y - 15, b.d, '#f44');
      FX.shake(3, 0.08); FX.screenFlash('#f44', 0.1); playSound('hit');
    }
  }

  // Stash
  for (const s of H.stash) { if (!s.f && Math.hypot(s.x - p.x, s.y - p.y) < 22) {
    s.f = true; save.credits += s.r; playSound('pickup'); UI.notify(`+${s.r} cr!`);
    FX.pickupEffect(s.x, s.y);
  } }

  // Win
  if (H.en.every(e => !e.alive) && H.boss && !H.boss.alive) { dlgInit(); S = 7; }

  camFollow(p.x, p.y, H.mw, H.mh, 0.06);

  // Update atmosphere
  const huntPlanet = getMissionData(save.missionNumber).planet;
  ATM.updateAmbient(dt, huntPlanet, camX, camY, H.mw, H.mh);

  const sk = FX.getShake();

  renderHunt();
}

function bossAbility(b) {
  const abs = ['teleport','shield','summon','invisible','reflect','glitchfield'];
  const a = b.ab === 'all' ? abs[Math.floor(Math.random() * abs.length)] : b.ab;
  switch (a) {
    case 'teleport': FX.glitchBurst(b.x, b.y); b.x = 100 + Math.random() * (H.mw - 200);
      b.y = 100 + Math.random() * (H.mh - 200); FX.glitchBurst(b.x, b.y); playSound('glitch'); break;
    case 'shield': b.sh = true; b._st = 2000; break;
    case 'summon': for (let i = 0; i < 2; i++) H.en.push({ x: b.x + (Math.random() - 0.5) * 60,
      y: b.y + (Math.random() - 0.5) * 60, hp: 15, mhp: 15, spd: 2.5, dmg: 10, c: '#f88',
      t: 'kamikaze', fr: 0, ls: 0, rng: 25, alive: true, frz: 0 }); break;
    case 'invisible': b.inv = true; b._it = 3000; break;
    case 'reflect': H.bul = H.bul.filter(bu => { if (Math.hypot(bu.x - b.x, bu.y - b.y) < 50) {
      H.eb.push({ x: bu.x, y: bu.y, dx: -bu.dx, dy: -bu.dy, d: 10, l: 2 }); return false; } return true; });
      playSound('glitch'); break;
    case 'glitchfield': triggerGlitch(4); break;
  }
}

function renderHunt() {
  const p = H.p, th = H.th, aa = aimAngle(p.x, p.y);
  const sk = FX.getShake();
  const planet = getMissionData(save.missionNumber).planet;

  // Sky gradient background (screen space)
  ATM.renderSky(ctx, planet, 800, 600);

  // Parallax stars behind everything
  ATM.renderStars(ctx, gt, camX, camY, 800, 600);

  ctx.save(); ctx.translate(-camX + sk.x, -camY + sk.y);

  // Ground base
  ctx.fillStyle = th.ground; ctx.fillRect(0, 0, H.mw, H.mh);
  // Ground detail tiles
  ctx.fillStyle = th.groundDetail;
  for (let x = 0; x < H.mw; x += 24) for (let y = 0; y < H.mh; y += 24)
    if ((x + y) % 48 === 0) ctx.fillRect(x, y, 24, 24);

  // Enhanced ground texture
  ATM.renderGround(ctx, planet, H.mw, H.mh, gt);

  // Ambient lights (bigger, softer)
  for (let i = 0; i < 6; i++) {
    const lx = (i * 317 + 50) % H.mw, ly = (i * 479 + 50) % H.mh;
    const g = ctx.createRadialGradient(lx, ly, 5, lx, ly, 140);
    g.addColorStop(0, th.accent + '0a'); g.addColorStop(0.5, th.accent + '04'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(lx - 140, ly - 140, 280, 280);
  }

  ctx.strokeStyle = th.accent; ctx.lineWidth = 3; ctx.strokeRect(0, 0, H.mw, H.mh);

  // Decorations
  for (const d of H.deco) drawDecoration(ctx, d.x, d.y, d.t, th);

  // Obstacles
  for (const o of H.obs) {
    const bc = th.obstacles[o.t === 'r' ? 0 : 1];
    ctx.fillStyle = '#000'; ctx.globalAlpha = 0.25; ctx.fillRect(o.x + 3, o.y + 3, o.w, o.h); ctx.globalAlpha = 1;
    ctx.fillStyle = bc; ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(o.x, o.y, o.w, 2); ctx.fillRect(o.x, o.y, 2, o.h);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(o.x, o.y + o.h - 2, o.w, 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.strokeRect(o.x, o.y, o.w, o.h);
  }

  // Stashes
  for (const s of H.stash) { if (s.f) continue;
    ctx.save(); ctx.globalAlpha = 0.4 + Math.sin(gt * 4) * 0.25;
    ctx.fillStyle = '#ff0'; ctx.fillRect(s.x - 7, s.y - 7, 14, 14);
    ctx.strokeStyle = '#fa0'; ctx.strokeRect(s.x - 7, s.y - 7, 14, 14);
    ctx.fillStyle = '#880'; ctx.fillRect(s.x - 1, s.y - 5, 2, 10); ctx.fillRect(s.x - 5, s.y - 1, 10, 2);
    ctx.restore(); }

  // Enemies
  for (const e of H.en) { if (!e.alive) continue;
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.frz > 0) { ctx.fillStyle = '#0af'; ctx.globalAlpha = 0.2; ctx.fillRect(-14, -22, 28, 44); ctx.globalAlpha = 1; }
    if (e.t === 'shooter') drawShooter(ctx, gt, e.hp, e.mhp);
    else if (e.t === 'kamikaze') drawKamikaze(ctx, gt, e.hp, e.mhp);
    else drawShield(ctx, gt, e.hp, e.mhp);
    ctx.restore();
    UI.hpBar(ctx, e.x - 16, e.y - 30, 32, 3, e.hp, e.mhp, e.c);
    ctx.fillStyle = '#444'; ctx.font = '7px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText(ENEMY_TYPES[e.t]?.name || '', e.x, e.y - 35);
  }

  // Boss
  if (H.boss?.alive) {
    const b = H.boss;
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.frz > 0) { ctx.fillStyle = '#0af'; ctx.globalAlpha = 0.15; ctx.fillRect(-26, -46, 52, 82); ctx.globalAlpha = 1; }
    drawBoss(ctx, gt, b.ab, b.sh, b.inv);
    ctx.restore();
    if (!b.inv || Math.floor(gt * 8) % 3 === 0) {
      const bossShielded = H.en.some(e => e.alive);
      UI.hpBar(ctx, b.x - 32, b.y - 52, 64, 6, b.hp, b.mhp, bossShielded ? '#555' : '#f00');
      ctx.fillStyle = '#f88'; ctx.font = '8px "Orbitron", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('WARDEN XAR\'VOTH', b.x, b.y - 58);
      if (bossShielded) {
        ctx.fillStyle = '#f80'; ctx.font = '7px "Share Tech Mono", monospace';
        ctx.fillText('⚠ ЗАХИЩЕНИЙ ПІДЛЕГЛИМИ', b.x, b.y - 65);
      }
    }
  }

  // Player
  ctx.save(); ctx.translate(p.x, p.y);
  drawPlayer(ctx, p.inv, gt, p.moving);
  drawWeapon(ctx, aa, save.weapons[save.activeWeapon].type);
  ctx.restore();

  // Player bullets
  const wt = save.weapons[save.activeWeapon].type;
  for (const b of H.bul) {
    if (b.gren) { ctx.fillStyle = '#f80'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff0'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    } else if (b.slp) { ctx.fillStyle = '#a0f'; ctx.shadowColor = '#a0f'; ctx.shadowBlur = 5;
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6); ctx.shadowBlur = 0;
    } else {
      const bc = wt === 'sniper' ? '#0af' : wt === 'machinegun' ? '#fa0' : '#ff0';
      ctx.fillStyle = bc; ctx.shadowColor = bc; ctx.shadowBlur = 4;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.dy, b.dx));
      ctx.fillRect(-4, -1, 8, 2); ctx.restore(); ctx.shadowBlur = 0;
    }
  }

  // Enemy bullets
  for (const b of H.eb) {
    ctx.fillStyle = '#f44'; ctx.shadowColor = '#f44'; ctx.shadowBlur = 3;
    ctx.fillRect(b.x - 2, b.y - 2, 4, 4); ctx.shadowBlur = 0;
  }

  FX.renderWorld(ctx);

  // Ambient floating particles (world space)
  ATM.renderAmbientWorld(ctx, camX, camY);

  // Dynamic lighting from player, enemies, boss
  ATM.renderLights(ctx, planet, p.x, p.y, H.en, H.boss, gt);

  // Fog layer (world space, on top of everything)
  ATM.renderFog(ctx, planet, gt, H.mw, H.mh);

  ctx.restore();

  // Post-processing (screen space)
  ATM.postProcess(ctx, 800, 600, gt);

  // HUD
  const wpn = save.weapons[save.activeWeapon], wd = WEAPONS[wpn.type];
  UI.hpBar(ctx, 10, 10, 125, 12, p.hp, p.mhp, '#0f0');
  ctx.fillStyle = '#aaa'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`${Math.ceil(p.hp)}/${p.mhp}`, 10, 34);
  ctx.fillStyle = '#0ff'; ctx.fillText(`${wd.name} Lv.${wpn.level}`, 10, 48);
  // Overheat bar
  if (wd.overheat) {
    const heatRatio = H.heat / (wd.maxHeat || 100);
    UI.hpBar(ctx, 10, 52, 80, 6, H.heat, wd.maxHeat || 100, H.overheated ? '#f00' : '#f80');
    if (H.overheated) { ctx.fillStyle = '#f44'; ctx.font = '9px "Share Tech Mono", monospace'; ctx.fillText('ПЕРЕГРІВ!', 95, 58); }
  }
  ctx.fillStyle = '#ff0'; ctx.fillText(`${save.credits} cr`, 10, wd.overheat ? 72 : 62);
  if (save.abilities[wpn.type]) {
    ctx.fillStyle = H.acd > 0 ? '#555' : '#0f0';
    ctx.fillText(H.acd > 0 ? `Q: ${Math.ceil(H.acd / 1000)}с` : 'Q: готово', 10, 76);
  }
  for (let i = 0; i < save.weapons.length; i++) {
    ctx.fillStyle = i === save.activeWeapon ? '#0ff' : '#444';
    ctx.fillText(`[${i + 1}] ${WEAPONS[save.weapons[i].type].name}`, 10, 90 + i * 14);
  }

  // Mini-map
  if (save.miniMapLevel > 0) {
    const mw = 105, mh = 78, mmx = 687, mmy = 515;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(mmx, mmy, mw, mh);
    ctx.strokeStyle = '#044'; ctx.strokeRect(mmx, mmy, mw, mh);
    const sx = mw / H.mw, sy = mh / H.mh;
    ctx.fillStyle = '#0ff'; ctx.fillRect(mmx + p.x * sx - 1, mmy + p.y * sy - 1, 3, 3);
    for (const e of H.en) { if (!e.alive) continue; ctx.fillStyle = '#f44'; ctx.fillRect(mmx + e.x * sx, mmy + e.y * sy, 2, 2); }
    if (H.boss?.alive) { ctx.fillStyle = '#f00'; ctx.fillRect(mmx + H.boss.x * sx - 1, mmy + H.boss.y * sy - 1, 4, 4); }
    if (save.miniMapLevel >= 2) for (const s of H.stash) { if (!s.f) { ctx.fillStyle = '#ff0'; ctx.fillRect(mmx + s.x * sx - 1, mmy + s.y * sy - 1, 3, 3); } }
  }

  drawCrosshair(ctx, mx, my);
  FX.renderScreen(ctx);
}

// ============================================
// DIALOGUE
// ============================================
let dlg = { lines: [], idx: 0, tw: null, ph: null, done: false };
const GW = ['не маєш','брехня','дані','код','система','цикл','петля','правда','симуляція'];

function dlgInit() {
  const ph = getMissionPhrase(save.missionNumber);
  dlg.ph = ph;
  const bl = save.missionNumber < BOSS_DIALOGUES.length ? BOSS_DIALOGUES[save.missionNumber] : ['Ще один мисливець...', 'Цикл продовжується.'];
  dlg.lines = [...bl, ph.text]; dlg.idx = 0; dlg.tw = new TypeWriter(dlg.lines[0], 30); dlg.done = false;
  if (!save.collectedPhrases.find(p => p.text === ph.text)) save.collectedPhrases.push(ph);
  save.crueltyRating = Math.max(0, save.crueltyRating - 1);
}
function runDlg(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  dlg.tw.update(dt);
  ctx.save(); ctx.translate(400, 160); drawDefeatedBoss(ctx, gt); ctx.restore();
  ctx.fillStyle = '#555'; ctx.font = '10px "Share Tech Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('ЦІЛЬ ЗНЕШКОДЖЕНА', 400, 210);
  for (let i = 0; i < dlg.idx; i++) { ctx.fillStyle = i === dlg.lines.length - 1 ? '#f0f' : '#444'; ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText(dlg.lines[i], 400, 260 + i * 22); }
  const txt = dlg.tw.text, sec = dlg.idx === dlg.lines.length - 1;
  ctx.font = sec ? '15px "Share Tech Mono", monospace' : '13px "Share Tech Mono", monospace';
  let xp = 400 - ctx.measureText(txt).width / 2;
  for (let i = 0; i < txt.length; i++) {
    const gl = sec || GW.some(w => { const j = txt.toLowerCase().indexOf(w); return j !== -1 && i >= j && i < j + w.length; });
    if (gl && Math.random() > 0.65) { ctx.fillStyle = '#f0f'; ctx.globalAlpha = 0.4 + Math.random() * 0.5; }
    else { ctx.fillStyle = sec ? '#f0f' : '#bbb'; ctx.globalAlpha = 1; }
    ctx.fillText(txt[i], xp, 260 + dlg.idx * 22); xp += ctx.measureText(txt[i]).width;
  }
  ctx.globalAlpha = 1;
  if (dlg.tw.done) {
    if (dlg.idx < dlg.lines.length - 1) { dlg.tw._waited += dt; if (dlg.tw._waited > 0.9) { dlg.idx++; dlg.tw = new TypeWriter(dlg.lines[dlg.idx], 30); } }
    else { dlg.done = true; btn(300, 520, 200, 36, "[ Ув'язнити ]");
      if (btnClick(300, 520, 200, 36) || justPressed['Enter']) { playSound('click'); rwdInit(); S = 8; } }
  }
  if (justPressed['Space'] && !dlg.tw.done) { dlg.tw.skip(); save.crueltyRating += 1; }
}

// ============================================
// REWARD
// ============================================
let rwd = { t: 0, given: false };
function rwdInit() { rwd = { t: 0, given: false }; }
function runRwd(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600); rwd.t += dt;
  const m = getMissionData(save.missionNumber);
  ctx.fillStyle = '#0f0'; ctx.font = '24px "Orbitron", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ЦІЛЬ ЗАХОПЛЕНА', 400, 190);
  ctx.fillStyle = '#ff0'; ctx.font = '20px "Orbitron", sans-serif'; ctx.fillText(`+${m.reward} cr`, 400, 240);
  if (!rwd.given && rwd.t > 0.5) {
    rwd.given = true; save.credits += m.reward; save.missionNumber++; updateBaseLevel();
    if (Math.random() < 0.12) { const drops = ['sword','machinegun','sniper'].filter(w => !save.weapons.find(sw => sw.type === w));
      if (drops.length > 0 && save.weapons.length < 2) { const d = drops[Math.floor(Math.random() * drops.length)];
        save.weapons.push({ type: d, level: 1 }); UI.notify(`Вибито: ${WEAPONS[d].name}!`); } }
    saveToDisk();
  }
  if (rwd.given && save.missionNumber >= 10 && !save.secretRoomFound) {
    let ch = Math.min(1, 0.15 + (save.missionNumber - 10) * 0.05);
    if (save.crueltyRating > 10) ch += 0.05;
    if (rwd.t > 1.5 && Math.random() < ch * dt) { endInit(1); S = 11; return; }
  }
  btn(300, 370, 200, 38, '[ Далі ]');
  if (btnClick(300, 370, 200, 38) || justPressed['Enter']) { playSound('click'); S = 2; }
}

// ============================================
// DEATH
// ============================================
let dth = { t: '', cl: 0, wl: false };
function deathInit(t) {
  const loss = 0.3 + Math.random() * 0.2; dth.t = t;
  dth.cl = Math.floor(save.credits * loss); save.credits -= dth.cl; dth.wl = false;
  if (t === 'planet' && Math.random() < 0.08) { const w = save.weapons[save.activeWeapon]; if (w?.level > 1) { w.level--; dth.wl = true; } }
  if (save.hasInsurance) { save.credits += dth.cl; dth.cl = 0; if (dth.wl) { save.weapons[save.activeWeapon].level++; dth.wl = false; } save.hasInsurance = false; }
  saveToDisk();
}
function runDeath(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#f44'; ctx.font = '26px "Orbitron", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(dth.t === 'ship' ? 'КОРАБЕЛЬ ЗНИЩЕНО' : 'МІСІЮ ПРОВАЛЕНО', 400, 190);
  ctx.fillStyle = '#888'; ctx.font = '13px "Share Tech Mono", monospace';
  ctx.fillText(`Втрачено: -${dth.cl} cr`, 400, 260);
  if (dth.wl) { ctx.fillStyle = '#f80'; ctx.fillText('Рівень зброї -1', 400, 290); }
  btn(300, 390, 200, 38, '[ До штабу ]');
  if (btnClick(300, 390, 200, 38) || justPressed['Enter']) { playSound('click'); S = 2; }
}

// ============================================
// SHOP (same logic, cleaner)
// ============================================
let shopCat = 'hangar';
function runShop(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  const titles = { hangar: 'АНГАР', wardrobe: 'ГАРДЕРОБ', arsenal: 'АРСЕНАЛ', lab: 'ЛАБОРАТОРІЯ' };
  ctx.fillStyle = '#0ff'; ctx.font = '18px "Orbitron", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(titles[shopCat], 400, 32);
  ctx.fillStyle = '#ff0'; ctx.font = '11px "Share Tech Mono", monospace'; ctx.fillText(`${save.credits} cr`, 400, 52);
  let y = 80;
  const si = (name, lv, max, prices, fn) => {
    ctx.fillStyle = '#777'; ctx.font = '12px "Share Tech Mono", monospace'; ctx.textAlign = 'left'; ctx.fillText(name, 45, y);
    for (let i = 1; i <= max; i++) { ctx.fillStyle = i <= lv ? '#0ff' : '#1a1a1a'; ctx.fillRect(230 + (i - 1) * 26, y - 8, 22, 11); }
    if (lv < max) { const c = prices[lv - 1]; btn(570, y - 13, 120, 22, `${c} cr`);
      if (btnClick(570, y - 13, 120, 22) && save.credits >= c) { save.credits -= c; fn(); playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('МАКС', 590, y); }
    y += 34;
  };

  if (shopCat === 'hangar') {
    si('HP корабля', save.shipHPLevel, 5, [200,450,750,1100], () => { save.shipMaxHP += 20; save.shipHPLevel++; });
    si('Швидкість кор.', save.shipSpeedLevel, 5, [250,500,800,1200], () => { save.shipSpeed += 0.5; save.shipSpeedLevel++; });
    si('Гармати', save.shipDamageLevel, 5, [250,500,800,1200], () => { save.shipDamage += 5; save.shipDamageLevel++; });
    si('Кулі кор.', save.shipBulletsLevel, 3, [500,900], () => { save.shipBulletsLevel++; });
    y += 8;
    si('HP гравця', save.hpLevel, 5, [250,500,800,1200], () => { save.playerMaxHP += 25; save.hpLevel++; });
    si('Швидкість', save.speedLevel, 5, [300,600,900,1400], () => { save.playerSpeed += 0.5; save.speedLevel++; });
  } else if (shopCat === 'arsenal') {
    ctx.fillStyle = '#777'; ctx.font = '12px "Share Tech Mono", monospace'; ctx.textAlign = 'left'; ctx.fillText('Зброя (макс 2):', 45, y); y += 22;
    for (const [t, pr] of [['sword',600],['machinegun',900],['sniper',1500]]) {
      const own = save.weapons.find(w => w.type === t);
      ctx.fillStyle = '#0cc'; ctx.fillText(`${WEAPONS[t].name} — ${pr} cr`, 55, y);
      if (own) { ctx.fillStyle = '#0f0'; ctx.fillText(`Є Lv.${own.level}`, 340, y);
        if (own.level < 5) { const uc = [400,700,1100,1600][own.level-1]; btn(470, y - 12, 105, 20, `Lv.${own.level+1} ${uc}`);
          if (btnClick(470, y - 12, 105, 20) && save.credits >= uc) { save.credits -= uc; own.level++; playSound('click'); saveToDisk(); } }
        if (save.weapons.length > 1) { btn(590, y - 12, 85, 20, `Продати`);
          if (btnClick(590, y - 12, 85, 20)) { save.credits += Math.floor(pr/2); save.weapons = save.weapons.filter(w => w.type !== t);
            if (save.activeWeapon >= save.weapons.length) save.activeWeapon = 0; playSound('click'); saveToDisk(); } }
      } else if (save.weapons.length < 2) { btn(470, y - 12, 95, 20, 'Купити');
        if (btnClick(470, y - 12, 95, 20) && save.credits >= pr) { save.credits -= pr; save.weapons.push({ type: t, level: 1 }); playSound('click'); saveToDisk(); } }
      y += 30;
    }
    const pist = save.weapons.find(w => w.type === 'pistol');
    if (pist && pist.level < 5) { y += 8; const uc = [400,700,1100,1600][pist.level-1];
      ctx.fillStyle = '#0cc'; ctx.fillText(`Пістолет Lv.${pist.level}`, 55, y);
      btn(470, y - 12, 115, 20, `Lv.${pist.level+1} ${uc}`);
      if (btnClick(470, y - 12, 115, 20) && save.credits >= uc) { save.credits -= uc; pist.level++; playSound('click'); saveToDisk(); } }
  } else if (shopCat === 'lab') {
    const an = { pistol:'Подвійний постріл', sword:'Круговий удар', machinegun:'Граната', sniper:'Сонний дротик' };
    ctx.fillStyle = '#777'; ctx.font = '12px "Share Tech Mono", monospace'; ctx.textAlign = 'left'; ctx.fillText('Здібності:', 45, y); y += 22;
    for (const w of save.weapons) { const lv = save.abilities[w.type] || 0;
      ctx.fillStyle = '#0cc'; ctx.fillText(`${WEAPONS[w.type].name}: ${an[w.type]}`, 55, y);
      if (lv === 0) { btn(490, y - 12, 100, 20, 'Купити 500');
        if (btnClick(490, y - 12, 100, 20) && save.credits >= 500) { save.credits -= 500; save.abilities[w.type] = 1; playSound('click'); saveToDisk(); }
      } else if (lv < 3) { const c = [800,1200][lv-1]; ctx.fillStyle = '#666'; ctx.fillText(`Lv.${lv}`, 430, y);
        btn(490, y - 12, 100, 20, `Lv.${lv+1} ${c}`);
        if (btnClick(490, y - 12, 100, 20) && save.credits >= c) { save.credits -= c; save.abilities[w.type]++; playSound('click'); saveToDisk(); }
      } else { ctx.fillStyle = '#0f0'; ctx.fillText('МАКС', 490, y); }
      y += 28;
    }
    y += 12;
    if (!save.hasInsurance) { const ic = 400 + save.missionNumber * 20;
      ctx.fillStyle = '#0cc'; ctx.fillText(`Страховка — ${ic} cr`, 55, y);
      btn(490, y - 12, 95, 20, 'Купити');
      if (btnClick(490, y - 12, 95, 20) && save.credits >= ic) { save.credits -= ic; save.hasInsurance = true; playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('Страховка ✓', 55, y); }
    y += 28;
    if (save.miniMapLevel < 2) { const mc = save.miniMapLevel === 0 ? 600 : 1500;
      const ml = save.miniMapLevel === 0 ? 'Міні-карта' : 'Покращена карта';
      ctx.fillStyle = '#0cc'; ctx.fillText(`${ml} — ${mc} cr`, 55, y);
      btn(490, y - 12, 95, 20, 'Купити');
      if (btnClick(490, y - 12, 95, 20) && save.credits >= mc) { save.credits -= mc; save.miniMapLevel++; playSound('click'); saveToDisk(); }
    } else { ctx.fillStyle = '#0f0'; ctx.fillText('Карта: МАКС', 55, y); }
  } else { ctx.fillStyle = '#444'; ctx.font = '13px "Share Tech Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('Скоро...', 400, 300); }

  btn(10, 548, 105, 30, '← Назад');
  if (btnClick(10, 548, 105, 30) || justPressed['Escape']) { playSound('click'); S = 2; }
}

// ============================================
// PUZZLE
// ============================================
let pz = { ph: [], sel: new Set() };
function puzzleInit() { pz.ph = [...save.collectedPhrases].sort(() => Math.random() - 0.5); pz.sel = new Set(); }
function runPuzzle(dt) {
  canvas.style.cursor = 'default';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#0ff'; ctx.font = '16px "Orbitron", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ПАЗЛ ФРАЗ', 400, 32);
  ctx.fillStyle = '#555'; ctx.font = '10px "Share Tech Mono", monospace';
  ctx.fillText(`Вибери ПРАВДУ  ·  Вибрано: ${pz.sel.size}`, 400, 52);
  for (let i = 0; i < pz.ph.length && i * 26 + 72 < 510; i++) {
    const py = 72 + i * 26, s = pz.sel.has(i), h = mx >= 75 && mx <= 725 && my >= py && my <= py + 24;
    ctx.fillStyle = s ? 'rgba(0,255,255,0.08)' : h ? 'rgba(255,255,255,0.02)' : 'transparent'; ctx.fillRect(75, py, 650, 24);
    if (s) { ctx.strokeStyle = '#0ff'; ctx.strokeRect(75, py, 650, 24); }
    ctx.fillStyle = s ? '#0ff' : '#777'; ctx.font = '12px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${s ? '✓' : '○'} "${pz.ph[i].text}"`, 85, py + 16);
    if (mClick && h) { if (pz.sel.has(i)) pz.sel.delete(i); else pz.sel.add(i); playSound('click'); }
  }
  btn(300, 532, 200, 34, '[ Підтвердити ]');
  if (btnClick(300, 532, 200, 34)) { playSound('click');
    const sel = [...pz.sel].map(i => pz.ph[i]);
    const ok = sel.every(p => p.isTrue) && TRUE_PHRASES.every(tp => sel.find(sp => sp.text === tp));
    endInit(ok ? 3 : 2); S = 11; }
  btn(10, 532, 85, 34, '← Назад');
  if (btnClick(10, 532, 85, 34)) { playSound('click'); S = 2; }
}

// ============================================
// ENDINGS
// ============================================
const ENDS = {
  1: { c: '#aaa', bg: '#000', l: ['Ти спіймав найнебезпечніших злочинців.','Ти виконав свою роботу.','...','Це не зупиняє тебе.','Нові цілі вже чекають.'] },
  2: { c: '#f44', bg: '#100', l: ['Ти герой.','Ти рятуєш світ.','Вони були загрозою.','','Ти знищив ворогів.','Ти виконав свою місію.','','Система стабільна.','Все працює правильно.','','Ти зробив правильний вибір.','...','але вибір є завжди','навіть коли здається, що його немає'] },
  3: { c: '#0f0', bg: '#010', l: ['Ти не герой.','Ти лише інструмент.','','Тебе створили.','Щоб ти виконував накази.','','Цей світ — не справжній.','Це симуляція.','','Все повторюється.','Це цикл.','','Вони не вороги.','Вони знали частину правди.','','Ти зупинив їх.','Щоб ніхто не дізнався.','...','все має кінець','і водночас це лише початок'] },
  4: { c: '#48f', bg: '#003', l: ['Ти не герой.','Але і не зброя.','','Ти зробив вибір.','','Він не контролює все.','Він теж частина системи.','','Його змусили.','Як і тебе.','','Це більше ніж цикл.','Це щось глибше.','','Світ можна змінити.','Правда на твоєму боці,','але не кожна правда істина.','','Ти не знищив систему.','Ти її порушив.','','І тепер...'] }
};
let end = { type: 0, idx: 0, tw: null, done: false };
function endInit(t) { const e = ENDS[t]; end = { type: t, idx: 0, tw: new TypeWriter(e.l[0], 55), done: false };
  if (!save.endingsReached.includes(t)) save.endingsReached.push(t); saveToDisk(); }
function runEnd(dt) {
  canvas.style.cursor = 'default';
  const e = ENDS[end.type]; ctx.fillStyle = e.bg; ctx.fillRect(0, 0, 800, 600);
  end.tw.update(dt); ctx.fillStyle = e.c; ctx.font = '15px "Share Tech Mono", monospace'; ctx.textAlign = 'center';
  for (let i = 0; i < end.idx; i++) { ctx.globalAlpha = 0.35; ctx.fillText(e.l[i], 400, 110 + i * 24); }
  ctx.globalAlpha = 1; ctx.fillText(end.tw.text, 400, 110 + end.idx * 24);
  if (end.tw.done) {
    if (end.idx < e.l.length - 1) { end.tw._waited += dt; if (end.tw._waited > 0.75) { end.idx++; end.tw = new TypeWriter(e.l[end.idx], 55); } }
    else end.done = true;
  }
  if (end.done) { btn(300, 540, 200, 34, end.type === 1 ? 'Продовжити' : 'Меню');
    if (btnClick(300, 540, 200, 34)||justPressed['Enter']) { playSound('click'); S = end.type === 1 ? 2 : 0; } }
  if (justPressed['Escape']) { end.idx = e.l.length - 1; end.tw.skip(); end.done = true; }
}

// ============================================
// MAIN LOOP
// ============================================
let prevT = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - prevT) / 1000); prevT = t; gt += dt;
  FX.update(dt);
  if (save && S > 1) updateGlitches(dt, save.missionNumber);

  switch (S) {
    case 0: slotSelect(dt); break; case 1: runIntro(dt); break; case 2: runHQ(dt); break;
    case 3: runBrief(dt); break; case 4: runShip(dt); break; case 5: runLand(dt); break;
    case 6: runHunt(dt); break; case 7: runDlg(dt); break; case 8: runRwd(dt); break;
    case 9: runShop(dt); break; case 10: runPuzzle(dt); break; case 11: runEnd(dt); break;
    case 12: runDeath(dt); break;
  }

  if (save && S > 1) renderGlitchEffects(ctx);
  UI.renderNotifications(ctx, dt);
  UI.renderFade(ctx, dt);
  mClick = false; for (const k in justPressed) delete justPressed[k];
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
