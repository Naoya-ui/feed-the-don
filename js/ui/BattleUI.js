import { Helpers } from '../utils/Helpers.js';

export class BattleUI {
  static renderStaggerMarkers(container, thresholds = [], maxHp = 1) {
    if (!container || !maxHp) return;
    container.querySelectorAll('.stagger-marker.modular').forEach((node) => node.remove());
    thresholds.forEach((threshold) => {
      const marker = document.createElement('i');
      marker.className = 'stagger-marker modular';
      marker.style.left = `${Helpers.clamp((threshold / maxHp) * 100, 0, 100)}%`;
      container.appendChild(marker);
    });
  }

  static updateHealthBar(fill, text, currentHp, maxHp) {
    const pct = Helpers.clamp((currentHp / Math.max(1, maxHp)) * 100, 0, 100);
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${Math.max(0, currentHp)}/${maxHp}`;
  }

  static updateSanity(fill, text, sp) {
    if (fill) fill.style.width = `${Helpers.clamp(((sp + 45) / 90) * 100, 0, 100)}%`;
    if (text) text.textContent = `${sp >= 0 ? '+' : ''}${sp}`;
  }
}
