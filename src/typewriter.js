// ============================================
// TYPEWRITER — text typing effect
// ============================================

import { playSound } from './sound.js';

export class TypeWriter {
  constructor(text, speed = 40) {
    this.fullText = text;
    this.text = '';
    this.index = 0;
    this.speed = speed;
    this.timer = 0;
    this.done = false;
    this._waited = 0;
  }

  update(dt) {
    if (this.done) return;
    this.timer += dt * 1000;
    while (this.timer >= this.speed && this.index < this.fullText.length) {
      this.text += this.fullText[this.index];
      this.index++;
      this.timer -= this.speed;
      if (this.index % 2 === 0) playSound('beep', 0.3);
    }
    if (this.index >= this.fullText.length) this.done = true;
  }

  skip() {
    this.text = this.fullText;
    this.index = this.fullText.length;
    this.done = true;
  }
}
