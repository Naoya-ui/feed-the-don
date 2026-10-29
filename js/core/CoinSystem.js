export class CoinSystem {
  static chance(sp = 0) { return Math.max(0.05, Math.min(0.95, 0.5 + sp / 100)); }
  static headsChancePercent(sp = 0) { return Math.round(this.chance(sp) * 100); }
  static roll(count, sp = 0, rng = Math.random) {
    const chance = this.chance(sp);
    const flips = Array.from({ length: Math.max(0, count) }, () => rng() < chance);
    return { flips, heads: flips.filter(Boolean).length, chance };
  }
}
