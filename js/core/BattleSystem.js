import { Helpers } from '../utils/Helpers.js';

export class BattleSystem {
  static addStatus(target, type, potency = 0, count = 0) {
    if (!target.statuses) target.statuses = {};
    if (!target.statuses[type]) target.statuses[type] = { potency: 0, count: 0 };
    target.statuses[type].potency += Math.max(0, potency);
    target.statuses[type].count += Math.max(0, count);
    return target.statuses[type];
  }

  static consumeBleed(target, coinCount = 1) {
    const bleed = target?.statuses?.bleed;
    if (!bleed || bleed.potency <= 0 || bleed.count <= 0) return 0;
    const triggers = Math.min(Math.max(0, coinCount), bleed.count);
    const damage = bleed.potency * triggers;
    bleed.count -= triggers;
    if (bleed.count <= 0) {
      bleed.count = 0;
      bleed.potency = 0;
    }
    if (typeof target.takeDamage === 'function') target.takeDamage(damage);
    else target.hp = Math.max(0, target.hp - damage);
    return damage;
  }

  static consumeRupture(target) {
    const rupture = target?.statuses?.rupture;
    if (!rupture || rupture.potency <= 0 || rupture.count <= 0) return 0;
    const damage = rupture.potency;
    rupture.count -= 1;
    if (rupture.count <= 0) {
      rupture.count = 0;
      rupture.potency = 0;
    }
    return damage;
  }


  static gainPoise(target, potency = 0, count = 0) {
    if (!target) return { potency: 0, count: 0 };
    target.poisePotency = Math.max(0, (target.poisePotency || 0) + Math.max(0, potency));
    target.poiseCount = Math.max(0, (target.poiseCount || 0) + Math.max(0, count));
    return { potency: target.poisePotency, count: target.poiseCount };
  }

  static poiseCritChance(target, chancePerPotency = 5) {
    if (!target || (target.poisePotency || 0) <= 0 || (target.poiseCount || 0) <= 0) return 0;
    return Helpers.clamp((target.poisePotency || 0) * chancePerPotency, 0, 100);
  }

  static rollPoiseCritical(target, chancePerPotency = 5) {
    const chance = this.poiseCritChance(target, chancePerPotency);
    if (chance <= 0) return { critical: false, chance };
    const critical = Math.random() * 100 < chance;
    if (critical) {
      target.poiseCount = Math.max(0, (target.poiseCount || 0) - 1);
      if (target.poiseCount <= 0) {
        target.poiseCount = 0;
        target.poisePotency = 0;
      }
    }
    return { critical, chance };
  }

  static decayPoise(target, amount = 1) {
    if (!target || (target.poiseCount || 0) <= 0) return { potency: target?.poisePotency || 0, count: 0 };
    target.poiseCount = Math.max(0, target.poiseCount - Math.max(0, amount));
    if (target.poiseCount <= 0) {
      target.poiseCount = 0;
      target.poisePotency = 0;
    }
    return { potency: target.poisePotency || 0, count: target.poiseCount || 0 };
  }

  static staggerMultiplier(target) {
    return target?.isStaggered || target?.staggered ? 2 : 1;
  }

  static roll(skill, coins, sp = 0, coinPower = null, baseBonus = 0) {
    return Helpers.rollSkillPower(skill, coins, sp, coinPower, baseBonus);
  }
}
