// ============================================
// INPUT SYSTEM — keyboard + mouse aiming
// ============================================

export const keys = {};
export let mouseX = 0;
export let mouseY = 0;
export let mouseClicked = false;
export let mouseDown = false;
export const keyJustPressed = {};

// World-space mouse position (after camera transform)
export let worldMouseX = 0;
export let worldMouseY = 0;

export function initInput(canvas) {
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

  canvas.addEventListener('mousedown', e => {
    mouseDown = true;
  });

  canvas.addEventListener('mouseup', e => {
    mouseDown = false;
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    mouseClicked = true;
  });
}

export function updateWorldMouse(cameraX, cameraY) {
  worldMouseX = mouseX + cameraX;
  worldMouseY = mouseY + cameraY;
}

export function getAimAngle(playerX, playerY) {
  return Math.atan2(worldMouseY - playerY, worldMouseX - playerX);
}

export function clearInput() {
  mouseClicked = false;
  for (const key in keyJustPressed) delete keyJustPressed[key];
}

export function isButtonClicked(x, y, w, h) {
  return mouseClicked && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

export function isButtonHover(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}
