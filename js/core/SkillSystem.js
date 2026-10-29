import { CoinSystem } from './CoinSystem.js';
import { WolfBossSystem } from './WolfBossSystem.js';
import { wolfBoss } from '../data/enemies.js';

export class SkillSystem {
  static basePower(skill, context = {}) {
    const penalty = context.unit?.panicActive ? wolfBoss.panic.basePenalty : 0;
    return skill.base + (skill.defense ? 0 : context.attackUp || 0) - penalty;
  }
  static getCoinPower(skill, coinIndex = 1, context = {}) {
    let power = skill.coinPower;
    if (skill.key === 'justice' && context.speed >= 10) power += 2;
    if (skill.missingHpCoinPowerScale) power += WolfBossSystem.missingHpCoinPowerBonus(context.unit, skill.missingHpCoinPowerScale);
    return power;
  }
  static maxPower(skill, coins = skill.coins, context = {}) {
    return this.basePower(skill, context) + coins * Math.max(0, this.getCoinPower(skill, 1, context));
  }
  static roll(skill, coins = skill.coins, context = {}) {
    const roll = CoinSystem.roll(coins, context.unit?.sp ?? 0, context.rng);
    return { ...roll, power: this.basePower(skill, context) + roll.heads * this.getCoinPower(skill, 1, context) };
  }
}
