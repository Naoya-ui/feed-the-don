import assert from 'node:assert/strict';
import { Fighter, MOVE_DATA } from '../js/fighting/Fighter.js';
import { CombatSystem } from '../js/fighting/CombatSystem.js';

const dt = 1 / 60;
const bounds = { minX: 0, maxX: 1280 };
const donData = { hp: 100, maxHp: 100 };
const enemyData = { hp: 100, maxHp: 100 };
const don = new Fighter({ id: 'don', name: 'Don', team: 'player', combatant: donData, x: 400, groundY: 560, facing: 1 });
const enemy = new Fighter({ id: 'enemy-1', name: 'Bandit', team: 'enemy', combatant: enemyData, x: 520, groundY: 560, facing: -1 });
assert.equal(CombatSystem.intersects({ x: 0, y: 0, width: 10, height: 10 }, { x: 9, y: 9, width: 10, height: 10 }), true);
assert.equal(CombatSystem.intersects({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 4, height: 4 }), false, 'AABB touching edges is not overlap');

assert.equal(don.beginAttack(MOVE_DATA.light), true);
for (let i = 0; i < MOVE_DATA.light.startup - 1; i += 1) {
  don.update(dt, null, bounds);
  assert.equal(CombatSystem.resolve([don], [enemy]).length, 0, 'startup frames must not cause hits');
}
don.update(dt, null, bounds); // frame reaches first active frame
const first = CombatSystem.resolve([don], [enemy]);
assert.equal(first.length, 1, 'active hitbox should connect to overlapping hurtbox');
assert.equal(enemy.hp, 85, 'move damage is deterministic');
assert.equal(enemy.state, 'Hit');
for (let i = 0; i < 3; i += 1) {
  don.update(dt, null, bounds);
  assert.equal(CombatSystem.resolve([don], [enemy]).length, 0, 'a swing cannot hit the same target repeatedly');
}

// A correctly faced guard takes chip damage and enters blockstun.
const guardedData = { hp: 100, maxHp: 100 };
const guarded = new Fighter({ id: 'guarded', name: 'Guarded Don', team: 'player', combatant: guardedData, x: 500, groundY: 560, facing: -1 });
guarded.blockHeld = true;
const enemyAttacker = new Fighter({ id: 'enemy-2', name: 'Bandit', team: 'enemy', combatant: { hp: 100, maxHp: 100 }, x: 420, groundY: 560, facing: 1 });
assert.equal(enemyAttacker.beginAttack(MOVE_DATA.enemyLight), true);
for (let i = 0; i < MOVE_DATA.enemyLight.startup; i += 1) enemyAttacker.update(dt, null, bounds);
const blockedEvents = CombatSystem.resolve([enemyAttacker], [guarded]);
assert.equal(blockedEvents.length, 1);
assert.equal(blockedEvents[0].blocked, true);
assert.equal(guarded.hp, 98, 'guard uses fixed chip damage for this move');
assert.equal(guarded.state, 'Blockstun');


// A dash's invulnerability is presented as EVADED and never produces a false damage event.
const attackerData = { hp: 100, maxHp: 100 };
const evadeData = { hp: 100, maxHp: 100 };
const attacker = new Fighter({ id: 'attacker', name: 'Attacker', team: 'enemy', combatant: attackerData, x: 400, groundY: 560, facing: 1 });
const evader = new Fighter({ id: 'evader', name: 'Evader', team: 'player', combatant: evadeData, x: 520, groundY: 560, facing: -1 });
evader.invulnerableFrames = 3;
assert.equal(attacker.beginAttack(MOVE_DATA.enemyLight), true);
for (let i = 0; i < MOVE_DATA.enemyLight.startup; i += 1) attacker.update(dt, null, bounds);
const evadeEvents = CombatSystem.resolve([attacker], [evader]);
assert.equal(evadeEvents.length, 1);
assert.equal(evadeEvents[0].evaded, true);
assert.equal(evader.hp, 100, 'invulnerable dash frames must not deal damage');
assert.equal(evader.state, 'Idle', 'an evaded swing must not apply hitstun');

// Simultaneous active attacks are snapshotted before damage is applied, so they can trade.
const tradeAData = { hp: 40, maxHp: 40 };
const tradeBData = { hp: 40, maxHp: 40 };
const tradeA = new Fighter({ id: 'trade-a', team: 'player', combatant: tradeAData, x: 400, groundY: 560, facing: 1 });
const tradeB = new Fighter({ id: 'trade-b', team: 'enemy', combatant: tradeBData, x: 520, groundY: 560, facing: -1 });
tradeA.beginAttack(MOVE_DATA.light);
tradeB.beginAttack(MOVE_DATA.light);
for (let i = 0; i < MOVE_DATA.light.startup; i += 1) { tradeA.update(dt, null, bounds); tradeB.update(dt, null, bounds); }
const tradeEvents = CombatSystem.resolve([tradeA, tradeB], [tradeA, tradeB]);
assert.equal(tradeEvents.length, 2, 'simultaneous attacks both resolve on the same frame');
assert.equal(tradeA.hp, 25);
assert.equal(tradeB.hp, 25);

// Don's three distinct moves must keep three separate animation keys and frame profiles.
assert.equal(MOVE_DATA.light.animationKey, 'joust');
assert.equal(MOVE_DATA.heavy.animationKey, 'gallop');
assert.equal(MOVE_DATA.special.animationKey, 'justice');
assert.ok(MOVE_DATA.special.startup > MOVE_DATA.heavy.startup, 'Justice has a readable longer startup');
assert.ok(MOVE_DATA.special.recovery > MOVE_DATA.heavy.recovery, 'Justice has a meaningful recovery commitment');
assert.ok(MOVE_DATA.light.hitboxWidth >= 200 && MOVE_DATA.light.hitboxHeight < 90, 'Joust has a long, narrow lance hitbox');
assert.equal(MOVE_DATA.heavy.hitWindows.length, 2, 'Gallop has two separate thrust pulses');
assert.ok(MOVE_DATA.special.lungeSpeed > 400, 'Justice uses a natural forward slide');

// Gallop must hit the same target twice in separate windows, not once per active frame.
const gallopTargetData = { hp: 100, maxHp: 100 };
const gallopDon = new Fighter({ id: 'gallop-don', team: 'player', combatant: { hp: 100, maxHp: 100 }, x: 400, groundY: 560, facing: 1 });
const gallopTarget = new Fighter({ id: 'gallop-target', team: 'enemy', combatant: gallopTargetData, x: 560, groundY: 560, facing: -1 });
assert.equal(gallopDon.beginAttack(MOVE_DATA.heavy), true);
const gallopEvents = [];
for (let i = 0; i < MOVE_DATA.heavy.startup + MOVE_DATA.heavy.active + 1; i += 1) {
  gallopDon.update(dt, null, bounds);
  gallopEvents.push(...CombatSystem.resolve([gallopDon], [gallopTarget]));
}
assert.equal(gallopEvents.length, 2, 'Gallop deals exactly two hits');
assert.deepEqual(gallopEvents.map((event) => event.damage), [14, 14], 'Gallop divides damage over its two thrusts');
assert.equal(gallopTarget.hp, 72, 'two Gallop thrusts apply the intended total damage');

const slide = new Fighter({ id: 'justice-slide', team: 'player', combatant: { hp: 100, maxHp: 100 }, x: 400, groundY: 560, facing: 1 });
assert.equal(slide.beginAttack(MOVE_DATA.special), true);
const beforeSlide = slide.x;
for (let i = 0; i < MOVE_DATA.special.lungeEndFrame; i += 1) slide.update(dt, null, bounds);
assert.ok(slide.x > beforeSlide + 35, 'Justice glides forward over multiple simulation frames');

const thirdSkillData = { hp: 100, maxHp: 100 };
const thirdSkill = new Fighter({ id: 'third-skill', name: 'Don', team: 'player', combatant: thirdSkillData, x: 400, groundY: 560 });
assert.equal(thirdSkill.beginAttack(MOVE_DATA.special), true, 'third skill move can be started by the fighter system');
assert.equal(thirdSkill.currentMove.data.name, 'Justice');

console.log('PASS realtime-combat: AABB, spear-sized hitboxes, frame data, three Don skills, two-hit Gallop, chip guard, evasion, hitstun, simultaneous trade');
