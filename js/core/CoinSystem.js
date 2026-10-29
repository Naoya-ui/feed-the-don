import { Helpers } from '../utils/Helpers.js';

/**
 * Pure coin-flip rules used by both player and enemy skills.
 * Keeping RNG here makes the combat math deterministic/testable when a custom
 * random function is injected by tests or future replay systems.
 */
export class CoinSystem {
  static headsChance(sp = 0) {
    return Helpers.calculateCoinChance(sp);
  }

  static headsChancePercent(sp = 0) {
    return Math.round(this.headsChance(sp) * 100);
  }

  static flip(sp = 0, rng = Math.random) {
    return rng() < this.headsChance(sp);
  }

  static flipMany(count = 1, sp = 0, rng = Math.random) {
    const safeCount = Math.max(0, Math.floor(count));
    const flips = Array.from({ length: safeCount }, () => this.flip(sp, rng));
    return {
      flips,
      heads: flips.filter(Boolean).length,
      chance: this.headsChance(sp),
    };
  }
}
