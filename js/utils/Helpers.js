export class Helpers {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static calculateCoinChance(sp = 0) {
    const safeSp = this.clamp(sp, -45, 45);
    return this.clamp(0.5 + safeSp / 100, 0.05, 0.95);
  }

  static headsChancePercent(sp = 0) {
    return Math.round(this.calculateCoinChance(sp) * 100);
  }

  static flipCoin(chance = 0.5) {
    return Math.random() < chance;
  }

  static rollSkillPower(skill, currentCoins, sp = 0, coinPower = null, baseBonus = 0) {
    const chance = this.calculateCoinChance(sp);
    const flips = [];
    let heads = 0;
    for (let i = 0; i < currentCoins; i += 1) {
      const head = this.flipCoin(chance);
      flips.push(head);
      if (head) heads += 1;
    }
    const cp = coinPower ?? skill.coinPower ?? 0;
    const base = skill.base ?? skill.basePower ?? 0;
    return { power: base + baseBonus + heads * cp, flips, heads, chance };
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }
}
