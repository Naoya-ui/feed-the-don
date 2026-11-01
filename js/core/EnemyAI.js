/**
 * Enemy intent planner.
 * Current encounters use readable rotations, but the planner is isolated so a
 * boss can later switch to weighted/conditional behaviors without touching UI.
 */
export class EnemyAI {
  static actionCount(enemy, turn = 1) {
    const isWolf = enemy?.spriteKey === 'wolf';
    const isBossLike = enemy?.role === 'LEADER' || enemy?.role === 'ELITE' || isWolf;
    if (isWolf) return Math.min(1 + Math.floor((turn - 1) / 2), 3);
    return isBossLike && turn >= 3 ? 2 : 1;
  }

  static chooseSkill(enemy, pool = [], turn = 1, actionIndex = 0) {
    if (!pool.length) return null;
    const isWolf = enemy?.spriteKey === 'wolf';
    const rotationIndex = isWolf
      ? (turn - 1 + actionIndex) % pool.length
      : (turn + Number(enemy?.id || 0) + actionIndex - 1) % pool.length;
    return pool[rotationIndex];
  }

  static speedRange(enemy) {
    if (enemy?.spriteKey === 'wolf') return [4, 8];
    if (enemy?.role === 'ELITE') return [4, 7];
    if (Number(enemy?.id) === 2) return [3, 7];
    return [2, 6];
  }

  static buildIntents({ enemies = [], turn = 1, getSkillPool, randomInt }) {
    const intents = [];
    enemies.forEach((enemy) => {
      const pool = getSkillPool(enemy);
      const count = this.actionCount(enemy, turn);
      const [minSpeed, maxSpeed] = this.speedRange(enemy);

      for (let n = 0; n < count; n += 1) {
        const skill = this.chooseSkill(enemy, pool, turn, n);
        if (!skill) continue;
        intents.push({
          id: `e${enemy.id}-${n}`,
          enemyId: enemy.id,
          speed: randomInt(minSpeed, maxSpeed) + Number(enemy.haste || 0),
          skill,
          consumed: false,
        });
      }
    });
    return intents;
  }
}
