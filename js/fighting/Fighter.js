import { StateMachine } from './StateMachine.js';

/** Core 2D fighter entity. Position is the body-box center X and top Y, in logical canvas pixels. */
export const MOVE_DATA = Object.freeze({
  // Don fights with a long lance: Joust and Gallop use long, narrow thrust boxes.
  // `hitboxCenterY` is a ratio of Fighter body height so the spear box tracks the weapon.
  light: {
    id: 'light', animationKey: 'joust', name: 'Joust', startup: 5, active: 4, recovery: 11,
    damage: 10, hitstun: 14, blockstun: 8, knockback: 255, hitstop: 3,
    hitboxWidth: 218, hitboxHeight: 68, hitboxCenterY: 0.12, range: 218, chip: 1,
    lungeStartFrame: 3, lungeEndFrame: 9, lungeSpeed: 235,
  },
  heavy: {
    id: 'heavy', animationKey: 'gallop', name: 'Gallop', startup: 8, active: 8, recovery: 18,
    damage: 20, hitstun: 19, blockstun: 10, knockback: 205, hitstop: 4,
    hitboxWidth: 252, hitboxHeight: 76, hitboxCenterY: 0.12, range: 252, chip: 2,
    // Two distinct thrust pulses inside the active frames. Each deals half damage.
    hitWindows: [
      { start: 0, end: 2, damageMultiplier: 0.5 },
      { start: 4, end: 6, damageMultiplier: 0.5 },
    ],
    lungeStartFrame: 6, lungeEndFrame: 18, lungeSpeed: 335,
  },
  special: {
    id: 'special', animationKey: 'justice', name: 'Justice · Skill 3', startup: 10, active: 28, recovery: 28, superArmor: true, cooldownFrames: 1200,
    damage: 15, hitstun: 30, blockstun: 18, knockback: 390, hitstop: 5,
    hitboxWidth: 286, hitboxHeight: 112, hitboxCenterY: 0.22, range: 286, chip: 5, animationFrames: 38,
    hitWindows: [
      { start: 0, end: 3, damage: 15 },
      { start: 12, end: 15, damage: 15 },
      { start: 23, end: 26, damage: 15 },
    ],
    faceOpponentAt: [16, 23],
    movementPhases: [
      { start: 7, end: 16, direction: 'forward', speed: 900 },
      { start: 16, end: 22, direction: 'away', speed: 380 },
      { start: 23, end: 34, direction: 'forward', speed: 640 },
    ],
  },
  donEgo: {
    id: 'donEgo', animationKey: 'justice', name: 'La Sangre de Sancho', isEgo: true,
    startup: 22, active: 14, recovery: 46, damage: 64, hitstun: 44, blockstun: 23,
    knockback: 790, hitstop: 9, hitboxWidth: 390, hitboxHeight: 158, hitboxCenterY: 0.23,
    range: 390, chip: 9, lungeStartFrame: 9, lungeEndFrame: 38, lungeSpeed: 535,
    hitWindows: [{ start: 0, end: 5, damageMultiplier: 0.45 }, { start: 7, end: 12, damageMultiplier: 0.55 }],
  },
  heathcliffSkill3: {
    id: 'heathcliffSkill3', animationKey: 'ego', name: 'Quick Suppression · Skill 3',
    startup: 8, active: 30, recovery: 34, superArmor: true, cooldownFrames: 1200, damage: 10, hitstun: 25, blockstun: 13,
    knockback: 440, hitstop: 5, hitboxWidth: 285, hitboxHeight: 145, hitboxCenterY: 0.39,
    range: 300, chip: 3, animationFrames: 54,
    hitWindows: [
      { start: 0, end: 2, damage: 10 },
      { start: 6, end: 8, damage: 10 },
      { start: 12, end: 14, damage: 10 },
      { start: 18, end: 20, damage: 10 },
      { start: 25, end: 29, damage: 20 },
    ],
    movementPhases: [
      { start: 7, end: 18, direction: 'forward', speed: 500 },
      { start: 18, end: 23, direction: 'away', speed: 360 },
      { start: 23, end: 38, direction: 'forward', speed: 720 },
    ],
  },
  enemyLight: {
    id: 'enemyLight', name: 'Enemy Strike', startup: 23, active: 5, recovery: 34,
    damage: 14, hitstun: 16, blockstun: 9, knockback: 290, hitstop: 3,
    hitboxWidth: 112, hitboxHeight: 105, hitboxCenterY: 0.5, range: 118, chip: 1,
  },
  enemyHeavy: {
    id: 'enemyHeavy', name: 'Heavy Strike', startup: 31, active: 5, recovery: 43,
    damage: 22, hitstun: 22, blockstun: 12, knockback: 410, hitstop: 4,
    hitboxWidth: 145, hitboxHeight: 116, hitboxCenterY: 0.5, range: 148, chip: 2,
  },
  wolfSlash: {
    id: 'wolfSlash', name: 'Wolf Slash', startup: 27, active: 6, recovery: 38,
    damage: 24, hitstun: 23, blockstun: 13, knockback: 440, hitstop: 5,
    hitboxWidth: 174, hitboxHeight: 132, hitboxCenterY: 0.48, range: 174, chip: 3,
  },
  // Heathcliff is AI-only in the story encounter. His attacks use the uploaded bat sprites.
  heathcliffSkill1: {
    id: 'heathcliffSkill1', animationKey: 'skill1', name: 'Bat Strike',
    startup: 10, active: 6, recovery: 22,
    damage: 10, hitstun: 18, blockstun: 10, knockback: 325, hitstop: 4,
    hitboxWidth: 198, hitboxHeight: 112, hitboxCenterY: 0.34, range: 205, chip: 2,
    lungeStartFrame: 8, lungeEndFrame: 15, lungeSpeed: 210, animationFrames: 24,
  },
  heathcliffSkill2: {
    id: 'heathcliffSkill2', animationKey: 'skill2', name: 'Ruthless Swing',
    startup: 14, active: 18, recovery: 28,
    damage: 11, hitstun: 24, blockstun: 12, knockback: 455, hitstop: 5,
    hitboxWidth: 260, hitboxHeight: 145, hitboxCenterY: 0.39, range: 265, chip: 3,
    knockdownOnHit: true, knockdownFrames: 34,
    hitWindows: [
      { start: 0, end: 3, damageMultiplier: 1 },
      { start: 13, end: 16, damageMin: 8, damageMax: 11 },
    ],
    lungeStartFrame: 11, lungeEndFrame: 24, lungeSpeed: 310, animationFrames: 35,
  },
  heathcliffBodysack: {
    id: 'heathcliffBodysack', animationKey: 'ego', name: 'Bodysack · E.G.O', isEgo: true,
    startup: 18, active: 18, recovery: 42, damage: 72, hitstun: 42, blockstun: 22,
    knockback: 820, hitstop: 9, hitboxWidth: 370, hitboxHeight: 190, hitboxCenterY: 0.42,
    range: 370, chip: 8, lungeStartFrame: 8, lungeEndFrame: 31, lungeSpeed: 510,
    hitWindows: [{ start: 0, end: 5, damageMultiplier: 0.45 }, { start: 9, end: 14, damageMultiplier: 0.55 }],
    animationFrames: 54,
  },
  heathcliffEgo: {
    id: 'heathcliffEgo', animationKey: 'ego', name: 'E.G.O Burst',
    startup: 24, active: 14, recovery: 45,
    damage: 20, hitstun: 42, blockstun: 22, knockback: 740, hitstop: 9,
    hitboxWidth: 365, hitboxHeight: 185, hitboxCenterY: 0.39, range: 365, chip: 8,
    hitWindows: [
      { start: 1, end: 4, damageMultiplier: 0.55 },
      { start: 8, end: 12, damageMultiplier: 0.45 },
    ],
    lungeStartFrame: 19, lungeEndFrame: 40, lungeSpeed: 485, animationFrames: 54,
  },
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const approach = (value, target, maxDelta) => value < target
  ? Math.min(value + maxDelta, target)
  : Math.max(value - maxDelta, target);

export class Fighter {
  constructor({
    id,
    name,
    team = 'player',
    combatant,
    x = 180,
    groundY = 560,
    bodyWidth = 66,
    bodyHeight = 152,
    facing = 1,
    walkSpeed = 315,
    acceleration = 2300,
    friction = 2700,
    gravity = 2100,
    jumpSpeed = 760,
    aiIndex = 0,
    controls = null,
    lightMoveData = null,
    heavyMoveData = null,
    specialMoveData = null,
    egoMoveData = null,
    egoEquipped = false,
  }) {
    if (!id || !combatant) throw new TypeError('Fighter requires a stable id and a combatant data object.');
    this.id = String(id);
    this.name = name || this.id;
    this.team = team;
    this.combatant = combatant;
    this.x = x;
    this.y = groundY - bodyHeight;
    // Render interpolation uses the previous simulation position to keep motion smooth
    // even when the monitor refresh rate differs from the fixed 60 Hz simulation.
    this.previousX = this.x;
    this.previousY = this.y;
    this.groundY = groundY;
    this.bodyWidth = bodyWidth;
    this.bodyHeight = bodyHeight;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing >= 0 ? 1 : -1;
    this.walkSpeed = walkSpeed;
    this.acceleration = acceleration;
    this.friction = friction;
    this.gravity = gravity;
    this.jumpSpeed = jumpSpeed;
    this.aiIndex = aiIndex;
    this.controls = { left: 'a', right: 'd', jump: 'w', guard: 's', light: 'j', heavy: 'k', special: 'u', ego: 'i', dash: 'l', ...(controls || {}) };
    this.lightMoveData = lightMoveData || MOVE_DATA.light;
    this.heavyMoveData = heavyMoveData || MOVE_DATA.heavy;
    this.specialMoveData = specialMoveData || MOVE_DATA.special;
    this.egoMoveData = egoMoveData || null;
    this.egoEquipped = !!egoEquipped;
    this.egoMeter = 0;
    this.egoMeterMax = 100;
    this.egoActivationCount = 0;
    this.egoFormActive = false;
    this.egoSpriteSet = null;
    this.skill3CooldownFrames = 0;
    this.stateMachine = new StateMachine('Idle', {
      Idle: ['Run', 'Jump', 'Dash', 'Attack', 'Hit', 'Block', 'Blockstun', 'Knockdown'],
      Run: ['Idle', 'Jump', 'Dash', 'Attack', 'Hit', 'Block', 'Blockstun', 'Knockdown'],
      Jump: ['Idle', 'Run', 'Dash', 'Attack', 'Hit', 'Blockstun', 'Knockdown'],
      Dash: ['Idle', 'Run', 'Jump', 'Hit', 'Blockstun', 'Knockdown'],
      Attack: ['Idle', 'Run', 'Jump', 'Hit', 'Blockstun', 'Knockdown'],
      Hit: ['Idle', 'Run', 'Jump', 'Blockstun', 'Knockdown'],
      Block: ['Idle', 'Run', 'Hit', 'Blockstun', 'Knockdown'],
      Blockstun: ['Idle', 'Hit', 'Knockdown'],
      Knockdown: ['Idle', 'Hit', 'Blockstun'],
    });
    this.currentMove = null;
    this.hitstunFrames = 0;
    this.knockdownFrames = 0;
    this.blockstunFrames = 0;
    this.dashFrames = 0;
    this.dashCooldownFrames = 0;
    this.dashDirection = this.facing;
    this.invulnerableFrames = 0;
    this.aiCooldownFrames = 0;
    this.aiDefenseCooldownFrames = 0;
    this.aiGuardFrames = 0;
    this.aiDirection = 0;
    this.aiThinkFrames = 0;
    this.onGround = true;
    this.blockHeld = false;
    this.flashFrames = 0;
    this.lastDamage = 0;
    this.lastWasBlocked = false;
  }

  get state() { return this.stateMachine.current; }
  set state(nextState) { this.stateMachine.transition(nextState); }
  get hp() { return Math.max(0, Number(this.combatant.hp) || 0); }
  get maxHp() { return Math.max(1, Number(this.combatant.maxHp) || 1); }
  get alive() { return this.hp > 0; }
  get moveFrame() { return this.currentMove?.frame ?? -1; }
  get moveTotalFrames() {
    return this.currentMove ? this.currentMove.data.startup + this.currentMove.data.active + this.currentMove.data.recovery : 0;
  }

  /** Atomically swap visual pose sources; body dimensions and collision boxes never change. */
  activateEgoForm(spriteSet = null) {
    if (!this.egoEquipped || this.egoMeter < this.egoMeterMax) return false;
    this.egoSpriteSet = spriteSet || this.egoSpriteSet;
    this.egoFormActive = true;
    this.egoMeter = 0;
    this.egoActivationCount += 1;
    return true;
  }

  canAct() {
    return this.alive && this.hitstunFrames <= 0 && this.blockstunFrames <= 0 && !this.currentMove && this.dashFrames <= 0;
  }

  beginAttack(moveData) {
    if (!this.canAct() || !moveData || (moveData.cooldownFrames && this.skill3CooldownFrames > 0)) return false;
    if (moveData.cooldownFrames) this.skill3CooldownFrames = moveData.cooldownFrames;
    this.blockHeld = false;
    this.currentMove = {
      data: { ...moveData },
      frame: 0,
      hitTargets: new Set(),
      hitWindowDamages: Array.isArray(moveData.hitWindows) ? moveData.hitWindows.map((window) => Number.isFinite(window.damageMin) && Number.isFinite(window.damageMax)
        ? Math.floor(Math.random() * (window.damageMax - window.damageMin + 1)) + window.damageMin : null) : [],
    };
    this.state = 'Attack';
    this.vx *= 0.28;
    return true;
  }

  beginDash(direction = this.facing) {
    if (!this.canAct() || this.dashCooldownFrames > 0) return false;
    this.dashDirection = Math.sign(direction) || this.facing;
    this.dashFrames = 9;
    this.dashCooldownFrames = 31;
    this.invulnerableFrames = 0;
    this.vx = this.dashDirection * 780;
    this.blockHeld = false;
    this.state = 'Dash';
    return true;
  }

  /** Update once per fixed simulation frame. Input is present only for the human fighter. */
  update(dt, input, bounds = { minX: 55, maxX: 1225 }) {
    this.previousX = this.x;
    this.previousY = this.y;
    this.stateMachine.tick();
    if (this.dashCooldownFrames > 0) this.dashCooldownFrames -= 1;
    if (this.skill3CooldownFrames > 0) this.skill3CooldownFrames -= 1;
    if (this.invulnerableFrames > 0) this.invulnerableFrames -= 1;
    if (this.flashFrames > 0) this.flashFrames -= 1;

    if (!this.alive) {
      this.state = 'Knockdown';
      this.vx = approach(this.vx, 0, this.friction * dt);
      this.#integrate(dt, bounds);
      return;
    }

    if (this.knockdownFrames > 0) {
      this.knockdownFrames -= 1;
      this.state = 'Knockdown';
      this.vx = approach(this.vx, 0, this.friction * 0.6 * dt);
      this.#integrate(dt, bounds);
      if (this.knockdownFrames <= 0) this.state = 'Idle';
      return;
    }

    if (this.hitstunFrames > 0) {
      this.hitstunFrames -= 1;
      this.state = 'Hit';
      this.blockHeld = false;
      this.vx = approach(this.vx, 0, this.friction * 0.42 * dt);
      this.#integrate(dt, bounds);
      if (this.hitstunFrames <= 0) this.state = this.onGround ? 'Idle' : 'Jump';
      return;
    }

    if (this.blockstunFrames > 0) {
      this.blockstunFrames -= 1;
      this.state = 'Blockstun';
      this.vx = approach(this.vx, 0, this.friction * dt);
      this.#integrate(dt, bounds);
      if (this.blockstunFrames <= 0) this.state = 'Idle';
      return;
    }

    if (this.currentMove) {
      this.currentMove.frame += 1;
      this.state = 'Attack';
      const move = this.currentMove.data;
      const frame = this.currentMove.frame;
      if (Array.isArray(move.faceOpponentAt) && move.faceOpponentAt.includes(frame) && Number.isFinite(this.opponentX)) {
        this.facing = Math.sign(this.opponentX - this.x) || this.facing;
      }
      const motionPhase = Array.isArray(move.movementPhases) ? move.movementPhases.find((phase) => frame >= phase.start && frame < phase.end) : null;
      const lungeStart = Number.isFinite(move.lungeStartFrame) ? move.lungeStartFrame : move.startup;
      const lungeEnd = Number.isFinite(move.lungeEndFrame) ? move.lungeEndFrame : move.startup;
      if (motionPhase) {
        const direction = motionPhase.direction === 'away' ? -this.facing : this.facing;
        this.vx = approach(this.vx, direction * motionPhase.speed, this.acceleration * 2 * dt);
      } else if (frame >= lungeStart && frame < lungeEnd) {
        // Moves with a lunge (especially Justice) glide forward over several frames rather
        // than teleporting one frame or stopping abruptly. Clamp to arena bounds below.
        this.vx = approach(this.vx, this.facing * (move.lungeSpeed || 235), this.acceleration * 1.6 * dt);
      } else if (frame < move.startup) {
        this.vx = approach(this.vx, this.facing * 28, this.acceleration * dt);
      } else {
        this.vx = approach(this.vx, 0, this.friction * dt);
      }
      if (frame >= this.moveTotalFrames) {
        this.currentMove = null;
        this.state = 'Idle';
      }
      this.#integrate(dt, bounds);
      return;
    }

    if (this.dashFrames > 0) {
      this.dashFrames -= 1;
      this.state = 'Dash';
      this.vx = approach(this.vx, this.dashDirection * 780, this.acceleration * 2 * dt);
      this.#integrate(dt, bounds);
      if (this.dashFrames <= 0) this.state = 'Idle';
      return;
    }

    if ((this.team === 'player' || this.team === 'player2') && input) {
      const left = input.isHeld(this.controls.left);
      const right = input.isHeld(this.controls.right);
      const moveDir = (right ? 1 : 0) - (left ? 1 : 0);
      this.blockHeld = input.isHeld(this.controls.guard) && this.onGround;

      if (moveDir) this.facing = moveDir;
      if (input.consumePress(this.controls.dash)) {
        if (this.beginDash()) {
          this.#integrate(dt, bounds);
          return;
        }
      }
      if (input.consumePress(this.controls.jump)) {
        if (this.onGround && !this.blockHeld) {
          this.vy = -this.jumpSpeed;
          this.onGround = false;
          this.state = 'Jump';
        }
      }
      // E.G.O is an equipped loadout: when its gauge is full the special button manifests
      // the selected E.G.O; otherwise that same button performs the fighter's normal Skill 3.
      if (!this.blockHeld) {
        const specialKey = this.controls.special;
        const egoKey = this.controls.ego;
        const canManifestEgo = this.egoEquipped && this.egoMoveData && this.egoMeter >= this.egoMeterMax;
        if (input.hasBufferedPress(egoKey) && canManifestEgo) {
          if (this.activateEgoForm() && this.beginAttack(this.egoMoveData)) input.consumePress(egoKey);
        } else if (input.hasBufferedPress(specialKey)) {
          if (this.beginAttack(this.specialMoveData)) input.consumePress(specialKey);
        } else if (input.hasBufferedPress(this.controls.heavy) && this.beginAttack(this.heavyMoveData)) {
          input.consumePress(this.controls.heavy);
        } else if (input.hasBufferedPress(this.controls.light) && this.beginAttack(this.lightMoveData)) {
          input.consumePress(this.controls.light);
        }
      }
      if (this.currentMove) {
        this.#integrate(dt, bounds);
        return;
      }
      if (this.blockHeld) {
        this.state = 'Block';
        this.vx = approach(this.vx, 0, this.friction * dt);
      } else {
        this.vx = approach(this.vx, moveDir * this.walkSpeed, this.acceleration * dt);
        if (this.onGround) this.state = moveDir ? 'Run' : 'Idle';
      }
    } else {
      // AI-controlled fighters can use the same grounded guard state as the player.
      // `aiDirection` is set by RealtimeBattleMode before update().
      const moveDir = this.aiDirection;
      if (this.blockHeld && this.onGround) {
        this.state = 'Block';
        this.vx = approach(this.vx, 0, this.friction * dt);
      } else {
        if (moveDir) this.facing = moveDir;
        this.vx = approach(this.vx, moveDir * this.walkSpeed * 0.78, this.acceleration * dt);
        if (this.onGround) this.state = moveDir ? 'Run' : 'Idle';
      }
    }

    this.#integrate(dt, bounds);
  }

  getHurtbox() {
    // Exclude the long transparent sprite margins; the box describes the physical body.
    return {
      x: this.x - this.bodyWidth / 2,
      y: this.y + this.bodyHeight * 0.12,
      width: this.bodyWidth,
      height: this.bodyHeight * 0.82,
    };
  }

  getAttackBox() {
    if (!this.currentMove) return null;
    const { data, frame, hitTargets, hitWindowDamages = [] } = this.currentMove;
    if (frame < data.startup || frame >= data.startup + data.active) return null;

    // Single-hit moves are active for their full active window but can only hit each target
    // once. Multi-hit moves describe separate pulses as offsets from the first active frame.
    const activeFrame = frame - data.startup;
    let windowIndex = 0;
    let damageMultiplier = 1;
    if (Array.isArray(data.hitWindows) && data.hitWindows.length) {
      windowIndex = data.hitWindows.findIndex((window) => activeFrame >= window.start && activeFrame < window.end);
      if (windowIndex < 0) return null;
      damageMultiplier = data.hitWindows[windowIndex].damageMultiplier ?? 1;
    }

    const width = data.hitboxWidth;
    const height = data.hitboxHeight;
    const originOffset = Number.isFinite(data.hitboxOriginOffset) ? data.hitboxOriginOffset : this.bodyWidth * 0.28;
    const centerYRatio = Number.isFinite(data.hitboxCenterY) ? data.hitboxCenterY : 0.5;
    return {
      x: this.facing > 0 ? this.x + originOffset : this.x - originOffset - width,
      y: this.y + this.bodyHeight * centerYRatio - height / 2,
      width,
      height,
      data,
      damage: Math.max(1, hitWindowDamages[windowIndex] ?? data.hitWindows?.[windowIndex]?.damage ?? Math.round(data.damage * damageMultiplier)),
      windowIndex,
      hitTargets,
    };
  }

  shouldBlockFrom(attackerX) {
    if (!this.blockHeld || !this.onGround) return false;
    return Math.sign(attackerX - this.x) === this.facing;
  }

  receiveHit({ attackerX, damage, move, hitIndex = 0, blocked = false, allowFrameTrade = false }) {
    if ((!this.alive && !allowFrameTrade) || (this.invulnerableFrames > 0 && this.dashFrames <= 0)) return { applied: false, damage: 0, blocked };
    const actualDamage = Math.max(0, Math.round(damage));
    const previousHp = this.hp;
    this.combatant.hp = Math.max(0, previousHp - actualDamage);
    this.lastDamage = previousHp - this.hp;
    this.lastWasBlocked = blocked;
    this.flashFrames = blocked ? 4 : 8;
    const superArmor = !!this.currentMove?.data?.superArmor;
    if (!superArmor) this.currentMove = null;

    const direction = this.x >= attackerX ? 1 : -1;
    if (blocked) {
      this.blockstunFrames = Math.max(this.blockstunFrames, move.blockstun || 8);
      this.hitstunFrames = 0;
      this.vx = direction * (move.knockback || 0) * 0.16;
      this.state = 'Blockstun';
    } else {
      if (!superArmor) this.hitstunFrames = Math.max(this.hitstunFrames, move.hitstun || 12);
      if (!blocked && move.knockdownOnHit && hitIndex === 0) {
        this.knockdownFrames = Math.max(this.knockdownFrames, move.knockdownFrames || 30);
        this.hitstunFrames = 0;
      }
      this.blockstunFrames = 0;
      this.vx = direction * (move.knockback || 0);
      if (this.onGround) this.vy = -115;
      this.state = this.hp <= 0 || this.knockdownFrames > 0 ? 'Knockdown' : (superArmor ? 'Attack' : 'Hit');
    }
    return { applied: true, damage: this.lastDamage, blocked };
  }

  #integrate(dt, bounds) {
    // Horizontal acceleration and physical displacement happen in simulation time, not render time.
    this.x += this.vx * dt;
    this.x = clamp(this.x, bounds.minX, bounds.maxX);
    this.y += this.vy * dt;
    if (!this.onGround || this.vy !== 0) this.vy += this.gravity * dt;
    const floorY = this.groundY - this.bodyHeight;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.onGround = true;
      if (this.state === 'Jump') this.state = 'Idle';
    } else {
      this.onGround = false;
      if (this.state !== 'Hit' && this.state !== 'Attack' && this.state !== 'Knockdown') this.state = 'Jump';
    }
  }
}
