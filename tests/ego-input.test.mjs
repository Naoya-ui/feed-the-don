import assert from 'node:assert/strict';
import { Fighter, MOVE_DATA } from '../js/fighting/Fighter.js';

const fighter = new Fighter({
  id: 'p2-heathcliff', team: 'player2', combatant: { hp: 320, maxHp: 320 },
  x: 700, groundY: 584, facing: -1, controls: { ego: 'numpad5' },
  egoEquipped: true, egoMoveData: MOVE_DATA.heathcliffBodysack,
});
fighter.drawKey = 'heathcliff';
fighter.egoId = 'bodysack';
fighter.egoMeter = 100;
let confirm = true;
const input = {
  isHeld: () => false,
  consumePress: (key) => key === 'numpad5' && confirm ? (confirm = false, true) : false,
  hasBufferedPress: (key) => key === 'numpad5' && confirm,
};
fighter.update(1 / 60, input);
assert.equal(fighter.currentMove?.data.id, 'heathcliffBodysack', 'E.G.O input starts the selected Bodysack move');
assert.equal(fighter.egoFormActive, true, 'I / Numpad 5 activates the E.G.O presentation state');
assert.equal(fighter.egoMeter, 0, 'E.G.O activation spends the full gauge');
assert.equal(fighter.egoActivationCount, 1);
assert.equal(fighter.currentMove.data.isEgo, true);
console.log('PASS ego-input: E.G.O key starts the selected Bodysack skill and spends gauge');
