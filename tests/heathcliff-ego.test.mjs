import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MOVE_DATA } from '../js/fighting/Fighter.js';
import { HEATHCLIFF_EGO_CONFIG, heathcliffAnimations, heathcliffSprites, chargeHeathcliffEgoFromEvent } from '../js/data/heathcliff.js';
import { VOICE_LINE_CATALOG } from '../js/data/voiceLines.js';

const hc = { id: 'enemy-0', drawKey: 'heathcliff', egoMeter: 0 };
const don = { id: 'don', drawKey: 'don', egoMeter: undefined };
chargeHeathcliffEgoFromEvent({ attacker: hc, target: don, blocked: false, damage: 19, evaded: false });
assert.equal(hc.egoMeter, HEATHCLIFF_EGO_CONFIG.onHit, 'Heathcliff charges E.G.O when an attack connects');
chargeHeathcliffEgoFromEvent({ attacker: don, target: hc, blocked: false, damage: 19, evaded: false });
assert.equal(hc.egoMeter, HEATHCLIFF_EGO_CONFIG.onHit + HEATHCLIFF_EGO_CONFIG.whenHit, 'Heathcliff also charges when hit');
chargeHeathcliffEgoFromEvent({ attacker: hc, target: don, blocked: true, damage: 2, evaded: false });
assert.equal(hc.egoMeter, HEATHCLIFF_EGO_CONFIG.onHit + HEATHCLIFF_EGO_CONFIG.whenHit + HEATHCLIFF_EGO_CONFIG.onBlock, 'guarded hits grant less meter');
chargeHeathcliffEgoFromEvent({ attacker: hc, target: don, blocked: false, damage: 0, evaded: true });
assert.equal(hc.egoMeter, 18 + 13 + 11, 'evaded attacks do not charge E.G.O');
hc.egoMeter = 99;
chargeHeathcliffEgoFromEvent({ attacker: hc, target: don, blocked: false, damage: 19, evaded: false });
assert.equal(hc.egoMeter, 100, 'E.G.O meter is capped at 100');

assert.ok(MOVE_DATA.heathcliffSkill1 && MOVE_DATA.heathcliffSkill2 && MOVE_DATA.heathcliffEgo, 'Heathcliff has two normal moves and an E.G.O move');
assert.equal(MOVE_DATA.heathcliffEgo.animationKey, 'ego');
assert.equal(MOVE_DATA.heathcliffEgo.hitWindows.length, 2, 'E.G.O has two distinct hit pulses');
assert.equal(heathcliffAnimations.skill1.frames.length, 4);
assert.equal(heathcliffAnimations.skill2.frames.length, 4);
assert.equal(heathcliffAnimations.ego.frames.length, 16);
assert.equal(VOICE_LINE_CATALOG.heathcliff.attacks.skill1.length, 2);
assert.equal(VOICE_LINE_CATALOG.heathcliff.attacks.skill2.length, 3);
assert.equal(VOICE_LINE_CATALOG.heathcliff.attacks.ego.length, 9);
for (const src of [...Object.values(heathcliffSprites), ...Object.values(heathcliffAnimations).flatMap(a => [...a.frames, ...a.effectFrames.map(f => f.src)])]) {
  assert.ok(fs.existsSync(path.resolve(src)), `Runtime image exists: ${src}`);
}
for (const clips of Object.values(VOICE_LINE_CATALOG.heathcliff.attacks)) {
  for (const src of clips) assert.ok(fs.existsSync(path.resolve(src)), `Runtime voice exists: ${src}`);
}
console.log('Heathcliff ego tests passed.');
