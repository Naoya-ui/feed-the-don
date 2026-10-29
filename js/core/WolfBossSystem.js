import { wolfBoss } from '../data/enemies.js';

export class WolfBossSystem {
  static isWolf(unit) { return unit?.spriteKey === 'wolf'; }
  static initialize(unit) {
    Object.assign(unit, {
      level: wolfBoss.level, offenseLevel: wolfBoss.offenseLevel, defenseLevel: wolfBoss.defenseLevel,
      resistances: structuredClone(wolfBoss.resistances), sp: 10,
      nextHaste: 0, haste: 0, damageUp: 0, poisePotency: 0, poiseCount: 0,
      panicPending: false, panicActive: false, miragePhasePending: false, mirageForcedUsed: false,
      fragile: 0, nextFragile: 0, clashPowerUp: 0,
    });
    return unit;
  }
  static changeSp(unit, amount) {
    unit.sp = Math.max(-45, Math.min(45, (unit.sp || 0) + amount));
    if (unit.sp <= wolfBoss.panic.threshold && !unit.panicActive) unit.panicPending = true;
    return unit.sp;
  }
  static beginTurn(unit, livingEnemies = [unit]) {
    unit.panicActive = !!unit.panicPending;
    unit.panicPending = false;
    unit.fragile = unit.nextFragile || 0;
    unit.nextFragile = 0;
    this.updatePassive(unit, livingEnemies);
  }
  static updatePassive(unit, livingEnemies) {
    unit.clashPowerUp = livingEnemies.filter(e => e.hp > 0 && e !== unit).length === 0 ? 1 : 0;
  }
  static endTurn(unit) {
    if (unit.panicActive) {
      unit.panicActive = false;
      unit.panicPending = false;
      unit.sp = 0;
    }
    unit.fragile = 0;
  }
  static missingHpCoinPowerBonus(unit, scale = 5) {
    if (!unit || unit.hp <= 0 || unit.maxHp <= 0) return 0;
    return Math.floor(Math.max(0, 1 - unit.hp / unit.maxHp) * scale);
  }
  static addExhaust(unit, amount) {
    unit.exhaust = Math.min(wolfBoss.exhaust.cap, Math.max(0, (unit.exhaust || 0) + amount));
    // Latch the threshold before Turn End decay, so reaching exactly 3 still triggers.
    if (unit.exhaust >= wolfBoss.exhaust.trigger) unit.exhaustPending = true;
    return unit.exhaust;
  }
  static applyExhaustTurnStart(unit) {
    unit.offenseLevelDown = 0;
    let consumed = 0;
    if (unit.exhaustPending || (unit.exhaust || 0) >= wolfBoss.exhaust.trigger) {
      consumed = Math.min(unit.exhaust || 0, wolfBoss.exhaust.trigger);
      unit.exhaust = Math.max(0, (unit.exhaust || 0) - consumed);
      unit.offenseLevelDown = wolfBoss.exhaust.offenseDown;
    }
    unit.exhaustPending = false;
    return { consumed, offenseLevelDown: unit.offenseLevelDown };
  }
  static decayExhaustTurnEnd(unit) {
    unit.exhaust = Math.max(0, (unit.exhaust || 0) - wolfBoss.exhaust.decay);
    unit.offenseLevelDown = 0;
    return unit.exhaust;
  }
  static playerSpeedRange(unit, min = 3, max = 6) {
    return [min, Math.max(min, max - (unit.exhaust || 0))];
  }
  static staggerDurationTurns() { return wolfBoss.staggerTurns; }
  static checkStagger(unit) {
    if (unit.hp <= 0) return false;
    if (unit.hp < unit.maxHp * 0.4 && !unit.mirageForcedUsed) unit.miragePhasePending = true;
    let triggered = false;
    while (unit.thresholds[unit.staggerLevel] !== undefined && unit.hp <= unit.thresholds[unit.staggerLevel]) {
      unit.staggerLevel += 1;
      triggered = true;
    }
    if (triggered) {
      unit.staggered = true;
      unit.staggerTurns = this.staggerDurationTurns();
    }
    return triggered;
  }
  static canUseMirage(unit) {
    return unit.hp > 0 && unit.hp < unit.maxHp * 0.4 && !unit.panicActive && !unit.staggered;
  }
  static markSkillUsed(unit, skill) {
    if (skill.key === 'mirageSlash') {
      unit.mirageForcedUsed = true;
      unit.miragePhasePending = false;
    }
  }
  static onClashEnd(unit, skill, won) {
    this.changeSp(unit, won ? 10 : -10);
    if (won && skill.onClashWinSp) this.changeSp(unit, skill.onClashWinSp);
    if (!won && skill.onClashLoseFragile) unit.nextFragile = (unit.nextFragile || 0) + skill.onClashLoseFragile;
  }
}
