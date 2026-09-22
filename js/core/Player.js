import { Helpers } from '../utils/Helpers.js';

export class Player {
  constructor(data = {}) {
    this.id = data.id || 'don';
    this.name = data.name || 'Don Quixote';
    this.maxHp = data.maxHp ?? 203;
    this.hp = this.maxHp;
    this.sp = Helpers.clamp(data.sp ?? 0, -45, 45);
    this.minSp = -45;
    this.maxSp = 45;
    this.haste = 0;
    this.nextHaste = 0;
    this.attackUp = 0;
    this.nextAttackUp = 0;
    this.isStaggered = false;
    this.staggerTurns = 0;
    this.staggerLevel = 0;
    this.thresholds = [...(data.staggerThresholds || [120, 50])];
    this.statuses = {
      bleed: { potency: 0, count: 0 },
    };
  }

  changeSp(amount) {
    this.sp = Helpers.clamp(this.sp + amount, this.minSp, this.maxSp);
    return this.sp;
  }

  takeDamage(amount) {
    const oldHp = this.hp;
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
    const threshold = this.thresholds[this.staggerLevel];
    let staggerTriggered = false;
    if (threshold !== undefined && oldHp > threshold && this.hp <= threshold) {
      this.staggerLevel += 1;
      this.isStaggered = true;
      this.staggerTurns = 1;
      staggerTriggered = true;
    }
    return { oldHp, newHp: this.hp, damage: oldHp - this.hp, staggerTriggered, staggerThreshold: staggerTriggered ? threshold : null };
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + Math.max(0, amount));
    return this.hp;
  }

  addStatus(type, potency = 0, count = 0) {
    const status = this.statuses[type];
    if (!status) return null;
    status.potency += Math.max(0, potency);
    status.count += Math.max(0, count);
    return status;
  }
}
