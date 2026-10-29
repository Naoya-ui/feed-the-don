import assert from 'node:assert/strict';
import { GamepadInputAdapter } from '../js/fighting/GamepadInput.js';

const events = new Map();
const target = {
  addEventListener(name, fn) { events.set(name, fn); },
  removeEventListener(name) { events.delete(name); },
};
const input = {
  virtual: new Set(),
  setVirtualKey(key, down) { if (down) this.virtual.add(key); else this.virtual.delete(key); },
};
let pads = [{ connected: true, index: 0, id: 'Test Pad', axes: [-0.8, 0], buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: i === 2 })) }];
const adapter = new GamepadInputAdapter({ getGamepads: () => pads });
const controls = { left: 'arrowleft', right: 'arrowright', jump: 'arrowup', guard: 'arrowdown', light: 'numpad1', heavy: 'numpad2', special: 'numpad3', dash: 'numpad4' };
let status = adapter.update({ input, controls, settings: { player: 'p2', index: 0, deadzone: 0.35, buttons: { light: 2, jump: 0, dash: 1, heavy: 3, special: 4, guard: 5 } } });
assert.equal(status.connected, true);
assert.ok(input.virtual.has('arrowleft'), 'left stick maps to P2 left key');
assert.ok(input.virtual.has('numpad1'), 'configured button maps to P2 light attack');
pads = [];
status = adapter.update({ input, controls, settings: { player: 'p2', index: 0 } });
assert.equal(status.connected, false);
assert.equal(input.virtual.size, 0, 'disconnect releases virtual keys');
adapter.dispose();
console.log('PASS gamepad-input: configurable action mapping, stick movement, disconnect cleanup');
