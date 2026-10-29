/**
 * Minimal finite-state machine for a combat turn.
 * main.js still owns presentation; this class owns legal phase transitions and
 * action ordering so turn flow cannot silently jump between phases.
 */
export class TurnSystem {
  static PHASE = Object.freeze({
    PLANNING: 'planning',
    COMBAT: 'combat',
    CLEANUP: 'cleanup',
  });

  static canTransition(from, to) {
    const P = this.PHASE;
    const allowed = {
      [P.PLANNING]: [P.COMBAT],
      [P.COMBAT]: [P.CLEANUP],
      [P.CLEANUP]: [P.PLANNING],
    };
    return from === to || (allowed[from] || []).includes(to);
  }

  static transition(battle, nextPhase, { force = false } = {}) {
    if (!battle) return false;
    if (!force && !this.canTransition(battle.phase, nextPhase)) {
      throw new Error(`Illegal combat phase transition: ${battle.phase} -> ${nextPhase}`);
    }
    battle.phase = nextPhase;
    return true;
  }

  static buildActionQueue(playerSlots = [], enemySlots = []) {
    return [
      ...playerSlots.map((slot) => ({ type: 'don', speed: Number(slot.speed || 0), slot })),
      ...enemySlots.map((slot) => ({ type: 'enemy', speed: Number(slot.speed || 0), slot })),
    ].sort((a, b) => b.speed - a.speed || (a.type === 'don' ? -1 : 1));
  }
}
