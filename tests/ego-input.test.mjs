import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { Fighter, MOVE_DATA } from '../js/fighting/Fighter.js';
import { CombatSystem } from '../js/fighting/CombatSystem.js';
import { heathcliffAnimations } from '../js/data/heathcliff.js';
import { battleDonAnimations } from '../js/data/characters.js';
import { VOICE_LINE_CATALOG } from '../js/data/voiceLines.js';
import { VERSUS_ROSTER } from '../js/data/versusRoster.js';

const fighter = new Fighter({
  id: 'p2-heathcliff',
  team: 'player2',
  combatant: { hp: 320, maxHp: 320 },
  x: 700,
  groundY: 584,
  facing: -1,
  controls: { ego: 'numpad5' },
  egoEquipped: true,
  egoMoveData: MOVE_DATA.heathcliffBodysack,
});
fighter.drawKey = 'heathcliff';
fighter.egoId = 'bodysack';
fighter.egoMeter = 100;
let confirm = true;
const input = {
  isHeld: () => false,
  consumePress: (key) => (key === 'numpad5' && confirm ? ((confirm = false), true) : false),
  hasBufferedPress: (key) => key === 'numpad5' && confirm,
};
fighter.update(1 / 60, input);
assert.equal(
  fighter.currentMove?.data.id,
  'heathcliffBodysack',
  'E.G.O input starts the selected Bodysack move'
);
assert.equal(
  fighter.currentMove?.data.animationKey,
  'bodysack',
  'Bodysack has its own base-form animation mapping'
);
assert.equal(
  fighter.currentMove?.data.cinematicPath,
  'assets/images/ego/heathcliff/bodysack-preview.gif',
  'Bodysack uses the supplied base-form move GIF as its cinematic'
);
assert.equal(
  heathcliffAnimations.bodysack.frames.length,
  23,
  'Bodysack uses its dedicated sprite sequence'
);
assert.ok(
  VOICE_LINE_CATALOG.heathcliff.attacks.bodysack.length >= 3,
  'Bodysack has dedicated activation voice clips'
);
assert.equal(
  fighter.currentMove?.data.sfxPath,
  'assets/audio/heathcliff/bodysack/07HC.wav',
  'Bodysack uses the supplied E.G.O SFX'
);
const bodysackEgo = VERSUS_ROSTER.heathcliff.egos.find((ego) => ego.id === 'bodysack');
assert.equal(
  bodysackEgo?.preview,
  'assets/images/ego/heathcliff/bodysack/20701_cg.png',
  'Bodysack E.G.O artwork is used in the selector'
);
for (const src of [
  ...heathcliffAnimations.bodysack.frames,
  ...heathcliffAnimations.bodysack.effectFrames.map((effect) => effect.src),
  ...VOICE_LINE_CATALOG.heathcliff.attacks.bodysack,
  fighter.currentMove?.data.sfxPath,
  bodysackEgo?.preview,
]) {
  assert.ok(existsSync(new URL(`../${src}`, import.meta.url)), `Bodysack asset exists: ${src}`);
}
assert.equal(fighter.egoFormActive, true, 'I / Numpad 5 activates the E.G.O presentation state');
assert.equal(fighter.egoMeter, 0, 'E.G.O activation spends the full gauge');
assert.equal(fighter.egoActivationCount, 1);
assert.equal(fighter.currentMove.data.isEgo, true);
const donEgo = MOVE_DATA.donEgo;
const laSangreVoice = VOICE_LINE_CATALOG.don.attacks.laSangre;
const donEgoOption = VERSUS_ROSTER.don.egos.find((ego) => ego.id === 'la-sangre');
assert.equal(VERSUS_ROSTER.don.portrait, 'assets/images/battle/don/base/idle.png');
assert.equal(VERSUS_ROSTER.heathcliff.portrait, 'assets/images/battle/heathcliff/idle.png');
for (const character of Object.values(VERSUS_ROSTER)) {
  assert.ok(character.egos.every((ego) => ego.id !== 'none'), `${character.name} has no No E.G.O option`);
  for (const ego of character.egos)
    if (ego.icon)
      assert.ok(existsSync(new URL(`../${ego.icon}`, import.meta.url)), `${ego.name} icon exists`);
}
assert.equal(donEgo.iconPath, 'assets/images/battle/skill-icons/don/skill4-alt.png');
assert.equal(donEgoOption?.icon, donEgo.iconPath, 'Don E.G.O selector and move use the same icon');
assert.equal(donEgo.animationKey, 'laSangre', 'Don E.G.O uses its dedicated La Sangre animation');
assert.equal(donEgo.sfxPath, 'assets/audio/don-skills/la-sangre/DQ_EGO_AFTER7.wav');
assert.equal(laSangreVoice[0], 'assets/audio/don-skills/la-sangre/battle_awaken_20301_1.wav');
assert.equal(battleDonAnimations.laSangre.frames.length, 19);
for (const src of [
  ...battleDonAnimations.laSangre.frames,
  ...battleDonAnimations.laSangre.effectFrames.map((effect) => effect.src),
  ...laSangreVoice,
  donEgo.sfxPath,
  donEgo.iconPath,
  donEgoOption?.icon,
  donEgo.cinematicPath,
]) {
  assert.ok(existsSync(new URL(`../${src}`, import.meta.url)), `La Sangre asset exists: ${src}`);
}
const donTest = new Fighter({
  id: 'don-ego-test',
  name: 'Don Quixote',
  team: 'player',
  combatant: { hp: 60, maxHp: 100 },
  x: 230,
  groundY: 584,
  facing: 1,
  bodyWidth: 72,
  bodyHeight: 150,
  egoMoveData: MOVE_DATA.donEgo,
  egoEquipped: true,
});
donTest.drawKey = 'don';
donTest.egoMeter = 100;
donTest.opponentX = 400;
assert.equal(donTest.executeEGO(), true, 'Don manifests La Sangre with a full gauge');
for (let frame = 0; frame < MOVE_DATA.donEgo.chargeEndFrame - 1; frame += 1)
  donTest.update(1 / 60, null, { minX: 72, maxX: 1208 });
assert.ok(donTest.x > 300, 'Don completes the fast charge toward the target');
const targetTest = new Fighter({
  id: 'ego-target-test',
  name: 'Target',
  team: 'enemy',
  combatant: { hp: 100, maxHp: 100 },
  x: 400,
  groundY: 584,
  facing: -1,
  bodyWidth: 72,
  bodyHeight: 150,
});
donTest.update(1 / 60, null, { minX: 72, maxX: 1208 });
const egoHit = CombatSystem.resolve([donTest, targetTest], [donTest, targetTest])[0];
assert.equal(egoHit?.damage, 35, 'La Sangre deals the configured Pierce damage');
assert.equal(egoHit?.healed, 18, 'La Sangre restores half the damage dealt');
assert.equal(donTest.hp, 78);
assert.ok(targetTest.vx > 0, 'the target receives E.G.O knockback');
for (let frame = donTest.currentMove.frame; frame < MOVE_DATA.donEgo.returnToOriginEndFrame; frame += 1)
  donTest.update(1 / 60, null, { minX: 72, maxX: 1208 });
assert.ok(Math.abs(donTest.x - 230) < 1, 'Don returns to his starting position');
console.log('PASS ego-input: E.G.O assets, selector mapping, Don charge, Pierce, lifesteal and return');
