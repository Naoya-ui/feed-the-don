import { CoinSystem } from './CoinSystem.js';

/**
 * Central skill-power rules.
 * Data files describe skills; this class interprets that data consistently for
 * clash previews, real clash rolls and future AI evaluation.
 */
export class SkillSystem {
  static getCoinPower(skill, coinNumber = 1, context = {}) {
    if (!skill) return 0;
    const speed = Number(context.speed || 0);
    let power = Number(skill.coinPower || 0);

    // Don Quixote: For Justice! gains Coin Power at high Speed.
    if (skill.key === 'justice' && speed >= 10) power += 2;

    // Per-coin modifiers support boss skills such as Wolf's second coin.
    const coinEffect = (skill.coinEffects || []).find((entry) => entry.coin === coinNumber);
    power += Number(coinEffect?.coinPowerModifier || 0);
    return power;
  }

  static basePower(skill, context = {}) {
    if (!skill) return 0;
    const attackBonus = skill.defense ? 0 : Number(context.attackBonus || 0);
    return Number(skill.base ?? skill.basePower ?? 0) + attackBonus;
  }

  static rollPower(skill, activeCoins = null, context = {}) {
    const coinCount = Math.max(0, Math.floor(activeCoins ?? skill?.coins ?? 0));
    const sp = Number(context.sp || 0);
    const result = CoinSystem.flipMany(coinCount, sp, context.rng || Math.random);
    let power = this.basePower(skill, context);

    result.flips.forEach((isHeads, index) => {
      if (!isHeads) return;
      power += this.getCoinPower(skill, index + 1, context);
    });

    return {
      power,
      flips: result.flips,
      heads: result.heads,
      chance: result.chance,
      sp,
    };
  }

  static maxPower(skill, activeCoins = null, context = {}) {
    const coinCount = Math.max(0, Math.floor(activeCoins ?? skill?.coins ?? 0));
    let power = this.basePower(skill, context);
    for (let coin = 1; coin <= coinCount; coin += 1) {
      power += this.getCoinPower(skill, coin, context);
    }
    return power;
  }

  static expectedPower(skill, activeCoins = null, context = {}) {
    const coinCount = Math.max(0, Math.floor(activeCoins ?? skill?.coins ?? 0));
    const chance = CoinSystem.headsChance(Number(context.sp || 0));
    let power = this.basePower(skill, context);
    for (let coin = 1; coin <= coinCount; coin += 1) {
      power += this.getCoinPower(skill, coin, context) * chance;
    }
    return power;
  }
}
