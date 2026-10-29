import { wolfBoss, wolfBattleSkills, wolfTurnPattern } from '../data/enemies.js';
import { WolfBossSystem } from './WolfBossSystem.js';

export class EnemyAI {
  static selectTargets(skill, slots, rng = Math.random) {
    if (!slots.length) return [];
    if (skill.targetRule === 'slowest') return [slots.slice().sort((a,b) => a.speed - b.speed || a.index - b.index)[0].index];
    const pool = slots.slice();
    const result = [];
    while (pool.length && result.length < (skill.attackWeight || 1)) {
      result.push(pool.splice(Math.min(pool.length - 1, Math.floor(rng() * pool.length)), 1)[0].index);
    }
    return result;
  }
  static uniqueTargetUnits(indices, slots, units) {
    const ids = new Set(indices.map(index => slots.find(s => s.index === index)?.unitId).filter(Boolean));
    return units.filter(unit => unit.hp > 0 && ids.has(unit.id));
  }
  static buildIntents({ enemies, turn, getSkillPool, randomInt, donSlots = [], rng = Math.random }) {
    const intents = [];
    for (const enemy of enemies.filter(e => e.hp > 0)) {
      const isWolf = WolfBossSystem.isWolf(enemy);
      let skills;
      if (isWolf) {
        const cycle = (turn - 1) % wolfTurnPattern.length;
        skills = wolfTurnPattern[cycle].map(key => wolfBattleSkills[key]);
        if (WolfBossSystem.canUseMirage(enemy) && (!enemy.mirageForcedUsed || cycle === 2)) skills[0] = wolfBattleSkills.mirageSlash;
      } else {
        const pool = getSkillPool(enemy);
        const count = ['LEADER', 'ELITE'].includes(enemy.role) && turn >= 3 ? 2 : 1;
        skills = Array.from({ length: count }, (_, n) => pool[(turn + enemy.id + n - 1) % pool.length]);
      }
      const range = isWolf ? wolfBoss.speed : enemy.role === 'ELITE' ? [4,7] : enemy.id === 2 ? [3,7] : [2,6];
      skills.forEach((skill, n) => intents.push({
        id: `e${enemy.id}-${n}`, enemyId: enemy.id, skill,
        speed: randomInt(...range) + (enemy.haste || 0), consumed: false,
        targetSlotIndices: this.selectTargets(skill, donSlots, rng),
      }));
    }
    return intents;
  }
}
