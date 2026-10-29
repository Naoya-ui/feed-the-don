/**
 * Pure clash-state reducer. UI/animations stay outside this module.
 * A clash round compares two already-rolled powers, applies opponent clash
 * modifiers, then removes the loser's right-most active Coin.
 */
export class ClashSystem {
  static isUnbreakableCoin(skill, coinNumber) {
    const coinEffect = (skill?.coinEffects || []).find((entry) => entry.coin === coinNumber);
    return !!(skill?.unbreakable || coinEffect?.unbreakable);
  }

  static applyOpponentModifiers(playerRoll, enemyRoll, playerSkill, enemySkill) {
    const player = { ...playerRoll };
    const enemy = { ...enemyRoll };
    player.power += Number(enemySkill?.opponentClashPowerModifier || 0);
    enemy.power += Number(playerSkill?.opponentClashPowerModifier || 0);
    return { player, enemy };
  }

  static resolveRound({ playerSkill, enemySkill, playerCoins, enemyCoins, playerRoll, enemyRoll }) {
    const adjusted = this.applyOpponentModifiers(playerRoll, enemyRoll, playerSkill, enemySkill);
    const result = {
      playerRoll: adjusted.player,
      enemyRoll: adjusted.enemy,
      verdict: 'tie',
      playerCoins,
      enemyCoins,
      crackedPlayerCoins: 0,
      crackedEnemyCoins: 0,
      lostCoinNumber: null,
    };

    if (adjusted.player.power > adjusted.enemy.power) {
      result.verdict = 'player';
      result.lostCoinNumber = enemyCoins;
      if (this.isUnbreakableCoin(enemySkill, enemyCoins)) {
        result.crackedEnemyCoins = 1;
        result.enemyCoins = 0;
      } else {
        result.enemyCoins = Math.max(0, enemyCoins - 1);
      }
    } else if (adjusted.player.power < adjusted.enemy.power) {
      result.verdict = 'enemy';
      result.lostCoinNumber = playerCoins;
      if (this.isUnbreakableCoin(playerSkill, playerCoins)) {
        result.crackedPlayerCoins = 1;
        result.playerCoins = 0;
      } else {
        result.playerCoins = Math.max(0, playerCoins - 1);
      }
    }

    return result;
  }
}
