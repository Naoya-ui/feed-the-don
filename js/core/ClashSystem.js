export class ClashSystem {
  static offenseLevel(unit, skill = {}) {
    return (skill.offenseLevel ?? unit?.offenseLevel ?? 35) - (unit?.offenseLevelDown || 0);
  }
  static bonus(unit, opponent, skill, opponentSkill) {
    const advantage = this.offenseLevel(unit, skill) - this.offenseLevel(opponent, opponentSkill);
    return Math.max(0, Math.floor(advantage / 3)) + (unit?.clashPowerUp || 0);
  }
  static resolveRound({ playerSkill, enemySkill, playerCoins, enemyCoins, playerRoll, enemyRoll, playerUnit, enemyUnit }) {
    const dr = { ...playerRoll, power: playerRoll.power + this.bonus(playerUnit, enemyUnit, playerSkill, enemySkill) + (enemySkill.opponentClashPowerModifier || 0) };
    const er = { ...enemyRoll, power: enemyRoll.power + this.bonus(enemyUnit, playerUnit, enemySkill, playerSkill) + (playerSkill.opponentClashPowerModifier || 0) };
    const verdict = dr.power > er.power ? 'player' : dr.power < er.power ? 'enemy' : 'tie';
    return { playerRoll: dr, enemyRoll: er, verdict,
      playerCoins: Math.max(0, playerCoins - (verdict === 'enemy' ? 1 : 0)),
      enemyCoins: Math.max(0, enemyCoins - (verdict === 'player' ? 1 : 0)) };
  }
}
