import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { Fighter, MOVE_DATA } from '../js/fighting/Fighter.js';
import { heathcliffAnimations } from '../js/data/heathcliff.js';
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
console.log('PASS ego-input: E.G.O key starts the selected Bodysack skill and spends gauge');
