/**
 * E.G.O lifecycle and resource accounting.
 * Manifestation reserves no resources; the cost is committed immediately
 * before the E.G.O attack resolves. This prevents charging for cancelled turns.
 */
export class EgoSystem {
  static isUnlocked(battle, { encounter = 'wolf', minTurn = 4 } = {}) {
    return !!battle && battle.encounter === encounter && Number(battle.turn || 0) >= minTurn;
  }

  static affordability(battle, skill) {
    if (!battle || !skill?.ego) return { ok: false, reason: 'INVALID_EGO', missing: {} };
    const missing = {};
    // Sanity may cross 0; it is a spend, not a positive-only currency.
    // We only block the skill when paying the full cost would go below the
    // unit's minimum SP floor.
    const spCost = Math.max(0, Number(skill.spCost || 0));
    const currentSp = Number(battle.don?.sp || 0);
    const minSp = Number(battle.don?.minSp ?? -45);
    if (currentSp - spCost < minSp) missing.SP = (minSp + spCost) - currentSp;

    for (const [resource, costRaw] of Object.entries(skill.resourceCost || {})) {
      const cost = Math.max(0, Number(costRaw || 0));
      const have = Math.max(0, Number(battle.sins?.[resource] || 0));
      if (have < cost) missing[resource] = cost - have;
    }

    return {
      ok: Object.keys(missing).length === 0,
      reason: Object.keys(missing).length ? 'INSUFFICIENT_RESOURCES' : null,
      missing,
    };
  }

  static canManifest(battle, skill) {
    if (!this.isUnlocked(battle)) return { ok: false, reason: 'LOCKED', missing: {} };
    if (battle.egoActivated) return { ok: false, reason: 'ALREADY_MANIFESTED', missing: {} };
    return this.affordability(battle, skill);
  }

  static payCost(battle, skill) {
    const check = this.affordability(battle, skill);
    if (!check.ok) return check;

    const spCost = Math.max(0, Number(skill.spCost || 0));
    if (typeof battle.don?.changeSp === 'function') battle.don.changeSp(-spCost);
    else if (battle.don) battle.don.sp = Number(battle.don.sp || 0) - spCost;

    for (const [resource, costRaw] of Object.entries(skill.resourceCost || {})) {
      const cost = Math.max(0, Number(costRaw || 0));
      battle.sins[resource] = Math.max(0, Number(battle.sins[resource] || 0) - cost);
    }
    return { ok: true, reason: null, missing: {} };
  }

  static grantTutorialResources(battle, skill, { sp = 45 } = {}) {
    if (!battle || !skill?.ego) return;
    if (battle.don) battle.don.sp = Math.max(Number(battle.don.sp || 0), sp);
    for (const [resource, costRaw] of Object.entries(skill.resourceCost || {})) {
      battle.sins[resource] = Math.max(Number(battle.sins?.[resource] || 0), Number(costRaw || 0));
    }
  }
}
