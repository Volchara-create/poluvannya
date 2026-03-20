// ============================================
// POLUVANNYA — Space Police Shooter
// ============================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game dimensions
canvas.width = 600;
canvas.height = 800;

// ---- GAME STATE ----
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let enemySpawnTimer = 0;
let enemySpawnInterval = 90; // frames between enemy spawns
let difficulty = 1;
let frameCount = 0;

// ---- STARS (background) ----
const stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 2 + 0.5,
    brightness: Math.random()
  });
}

// ---- PLAYER ----
const player = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 5,
  color: '#0af',
  shootCooldown: 0,
  shootRate: 12 // frames between shots
};

// ---- ARRAYS ----
let bullets = [];
let enemies = [];
let explosions = [];
let particles = [];

// ---- INPUT ----
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  // Start or restart game
  if (!gameStarted || gameOver) {
    if (e.code === 'Space' || e.code === 'Enter') {
      startGame();
    }
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// ---- START / RESTART ----
function startGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  gameStarted = true;
  bullets = [];
  enemies = [];
  explosions = [];
  particles = [];
  difficulty = 1;
  frameCount = 0;
  enemySpawnInterval = 90;
  player.x = canvas.width / 2;
  player.y = canvas.height - 80;
}

// ---- DRAW PLAYER SHIP ----
function drawPlayer() {
  const { x, y } = player;

  // Engine glow
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 15;

  // Main body
  ctx.fillStyle = '#0af';
  ctx.beginPath();
  ctx.moveTo(x, y - 25);        // nose
  ctx.lineTo(x - 20, y + 20);   // left wing
  ctx.lineTo(x - 8, y + 12);
  ctx.lineTo(x, y + 18);
  ctx.lineTo(x + 8, y + 12);
  ctx.lineTo(x + 20, y + 20);   // right wing
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Engine flame
  ctx.shadowColor = '#f80';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#f80';
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 18);
  ctx.lineTo(x, y + 28 + Math.random() * 6);
  ctx.lineTo(x + 5, y + 18);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
}

// ---- DRAW ENEMY SHIP ----
function drawEnemy(e) {
  const { x, y, type } = e;

  if (type === 'fighter') {
    // Red fighter
    ctx.fillStyle = '#f33';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);       // nose (pointing down)
    ctx.lineTo(x - 18, y - 15);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x, y - 10);
    ctx.lineTo(x + 5, y - 5);
    ctx.lineTo(x + 18, y - 15);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'heavy') {
    // Big purple enemy
    ctx.fillStyle = '#a3f';
    ctx.shadowColor = '#a3f';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, y + 25);
    ctx.lineTo(x - 25, y - 10);
    ctx.lineTo(x - 15, y - 20);
    ctx.lineTo(x, y - 12);
    ctx.lineTo(x + 15, y - 20);
    ctx.lineTo(x + 25, y - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Basic scout — orange
    ctx.fillStyle = '#f80';
    ctx.shadowColor = '#f80';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x - 12, y - 10);
    ctx.lineTo(x, y - 5);
    ctx.lineTo(x + 12, y - 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

// ---- SPAWN ENEMY ----
function spawnEnemy() {
  const types = ['scout', 'fighter'];
  if (difficulty >= 3) types.push('heavy');

  const type = types[Math.floor(Math.random() * types.length)];

  const e = {
    x: Math.random() * (canvas.width - 60) + 30,
    y: -30,
    type,
    hp: type === 'heavy' ? 3 : type === 'fighter' ? 2 : 1,
    speed: type === 'heavy' ? 1.2 : type === 'fighter' ? 2.5 : 1.8,
    width: type === 'heavy' ? 50 : type === 'fighter' ? 36 : 24,
    height: type === 'heavy' ? 50 : type === 'fighter' ? 36 : 30,
    // Zigzag movement
    zigzag: Math.random() > 0.5,
    zigzagSpeed: (Math.random() - 0.5) * 3,
    zigzagTimer: 0
  };

  enemies.push(e);
}

// ---- EXPLOSION ----
function createExplosion(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: Math.random() * 4 + 2
    });
  }
}

// ---- UPDATE ----
function update() {
  if (!gameStarted || gameOver) return;

  frameCount++;

  // Increase difficulty over time
  if (frameCount % 600 === 0) {
    difficulty++;
    enemySpawnInterval = Math.max(30, 90 - difficulty * 8);
  }

  // Move stars
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }

  // Player movement
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.x += player.speed;
  }
  if (keys['ArrowUp'] || keys['KeyW']) {
    player.y -= player.speed;
  }
  if (keys['ArrowDown'] || keys['KeyS']) {
    player.y += player.speed;
  }

  // Keep player in bounds
  player.x = Math.max(25, Math.min(canvas.width - 25, player.x));
  player.y = Math.max(30, Math.min(canvas.height - 30, player.y));

  // Shooting
  if (player.shootCooldown > 0) player.shootCooldown--;
  if (keys['Space'] && player.shootCooldown <= 0) {
    bullets.push({
      x: player.x - 8,
      y: player.y - 20,
      speed: 8,
      color: '#0ff'
    });
    bullets.push({
      x: player.x + 8,
      y: player.y - 20,
      speed: 8,
      color: '#0ff'
    });
    player.shootCooldown = player.shootRate;
  }

  // Move bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -10) {
      bullets.splice(i, 1);
    }
  }

  // Spawn enemies
  enemySpawnTimer++;
  if (enemySpawnTimer >= enemySpawnInterval) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  // Move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;

    // Zigzag
    if (e.zigzag) {
      e.zigzagTimer++;
      if (e.zigzagTimer > 40) {
        e.zigzagSpeed *= -1;
        e.zigzagTimer = 0;
      }
      e.x += e.zigzagSpeed;
      e.x = Math.max(20, Math.min(canvas.width - 20, e.x));
    }

    // Off screen — lose a life
    if (e.y > canvas.height + 30) {
      enemies.splice(i, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
      continue;
    }

    // Collision with player
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30) {
      createExplosion(e.x, e.y, '#f80');
      createExplosion(player.x, player.y, '#0ff');
      enemies.splice(i, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
      continue;
    }

    // Bullet collision
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      const bx = b.x - e.x;
      const by = b.y - e.y;
      const bDist = Math.sqrt(bx * bx + by * by);
      if (bDist < e.width / 2 + 5) {
        bullets.splice(j, 1);
        e.hp--;
        // Hit flash particle
        particles.push({
          x: b.x, y: b.y,
          vx: 0, vy: 0,
          life: 8, maxLife: 8,
          color: '#fff',
          size: 8
        });
        if (e.hp <= 0) {
          const points = e.type === 'heavy' ? 30 : e.type === 'fighter' ? 20 : 10;
          score += points;
          createExplosion(e.x, e.y, e.type === 'heavy' ? '#a3f' : e.type === 'fighter' ? '#f33' : '#f80');
          enemies.splice(i, 1);
          break;
        }
      }
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ---- DRAW ----
function draw() {
  // Clear
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  for (const s of stars) {
    const alpha = 0.3 + s.brightness * 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!gameStarted) {
    drawTitle();
    return;
  }

  // Player
  if (!gameOver) {
    drawPlayer();
  }

  // Bullets
  for (const b of bullets) {
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x - 2, b.y, 4, 12);
    ctx.shadowBlur = 0;
  }

  // Enemies
  for (const e of enemies) {
    drawEnemy(e);
  }

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // HUD
  drawHUD();

  // Game over screen
  if (gameOver) {
    drawGameOver();
  }
}

// ---- TITLE SCREEN ----
function drawTitle() {
  ctx.textAlign = 'center';

  // Title
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 48px "Segoe UI", sans-serif';
  ctx.fillText('ПОЛЮВАННЯ', canvas.width / 2, 250);

  ctx.shadowBlur = 10;
  ctx.fillStyle = '#0af';
  ctx.font = '24px "Segoe UI", sans-serif';
  ctx.fillText('Космічний Поліцейський', canvas.width / 2, 300);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#888';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('← → або A/D — рух', canvas.width / 2, 400);
  ctx.fillText('↑ ↓ або W/S — вгору/вниз', canvas.width / 2, 425);
  ctx.fillText('ПРОБІЛ — стрільба', canvas.width / 2, 450);

  // Blinking prompt
  if (Math.floor(Date.now() / 500) % 2) {
    ctx.fillStyle = '#0ff';
    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillText('Натисни ПРОБІЛ або ENTER щоб почати', canvas.width / 2, 550);
  }

  ctx.textAlign = 'left';
}

// ---- HUD ----
function drawHUD() {
  // Score
  ctx.fillStyle = '#0ff';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Очки: ${score}`, 15, 30);

  // Lives
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f55';
  for (let i = 0; i < lives; i++) {
    const hx = canvas.width - 20 - i * 30;
    // Draw mini heart
    ctx.font = '20px sans-serif';
    ctx.fillText('❤', hx, 30);
  }

  // Difficulty level
  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText(`Рівень: ${difficulty}`, canvas.width / 2, 30);

  ctx.textAlign = 'left';
}

// ---- GAME OVER ----
function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';

  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#f33';
  ctx.font = 'bold 48px "Segoe UI", sans-serif';
  ctx.fillText('GAME OVER', canvas.width / 2, 320);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = '28px "Segoe UI", sans-serif';
  ctx.fillText(`Рахунок: ${score}`, canvas.width / 2, 380);

  ctx.fillStyle = '#aaa';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText(`Досягнуто рівень: ${difficulty}`, canvas.width / 2, 420);

  if (Math.floor(Date.now() / 500) % 2) {
    ctx.fillStyle = '#0ff';
    ctx.font = '20px "Segoe UI", sans-serif';
    ctx.fillText('Натисни ПРОБІЛ щоб грати знову', canvas.width / 2, 500);
  }

  ctx.textAlign = 'left';
}

// ---- GAME LOOP ----
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start!
gameLoop();
