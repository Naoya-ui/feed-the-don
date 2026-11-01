/** Deterministic AABB combat resolution. RNG/coin rolls are not used for hit detection or damage. */
export class CombatSystem {
  static intersects(a, b) {
    return !!a && !!b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  /**
   * Snapshot every active attack before applying results. Incoming hits are then applied
   * in batches per target, so two active attacks on the same simulation frame can truly
   * trade even when either hit is lethal. A move hits each target only once per swing.
   */
  static resolve(attackers, targets, onHit = () => {}) {
    const pending = [];
    const evaded = [];
    const aliveAtFrameStart = new Set(targets.filter((fighter) => fighter?.alive).map((fighter) => fighter.id));
    for (const attacker of attackers) {
      if (!attacker?.alive) continue;
      const hitbox = attacker.getAttackBox();
      if (!hitbox) continue;
      for (const target of targets) {
        if (!target || target.team === attacker.team || !aliveAtFrameStart.has(target.id)) continue;
        const hitToken = `${hitbox.windowIndex ?? 0}:${target.id}`;
        if (hitbox.hitTargets.has(hitToken) || !this.intersects(hitbox, target.getHurtbox())) continue;
        // Each move's hit window can connect once per target. This enables separate
        // Gallop thrust pulses without allowing a single pulse to deal damage every frame.
        hitbox.hitTargets.add(hitToken);
        if ((target.invulnerableFrames || 0) > 0) {
          evaded.push({ attacker, target, move: hitbox.data, blocked: false, evaded: true, damage: 0, hitstop: 0 });
          continue;
        }
        const blocked = target.shouldBlockFrom(attacker.x);
        const baseDamage = hitbox.damage ?? hitbox.data.damage;
        const damage = blocked ? Math.max(hitbox.data.chip || 0, Math.ceil(baseDamage * 0.12)) : baseDamage;
        pending.push({ attacker, target, move: hitbox.data, hitIndex: hitbox.windowIndex ?? 0, attackerX: attacker.x, blocked, damage });
      }
    }

    const byTarget = new Map();
    for (const hit of pending) {
      if (!byTarget.has(hit.target.id)) byTarget.set(hit.target.id, []);
      byTarget.get(hit.target.id).push(hit);
    }

    // Apply total health damage once per target before emitting per-hit feedback.
    // This preserves trades and avoids update-order dependence for simultaneous contacts.
    for (const hits of byTarget.values()) {
      const target = hits[0].target;
      const allBlocked = hits.every((hit) => hit.blocked);
      const dominant = hits.slice().sort((a, b) => b.damage - a.damage)[0];
      const totalDamage = hits.reduce((sum, hit) => sum + hit.damage, 0);
      target.receiveHit({
        attackerX: dominant.attackerX,
        damage: totalDamage,
        move: dominant.move,
        hitIndex: dominant.hitIndex,
        blocked: allBlocked,
        allowFrameTrade: true,
      });
    }

    const events = [
      ...pending.map((hit) => ({
        attacker: hit.attacker, target: hit.target, move: hit.move,
        blocked: hit.blocked, evaded: false, damage: hit.damage, hitIndex: hit.hitIndex, hitstop: hit.move.hitstop || 0,
      })),
      ...evaded,
    ];
    for (const event of events) onHit(event);
    return events;
  }
}
