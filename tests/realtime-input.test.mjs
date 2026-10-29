import assert from 'node:assert/strict';
import { InputHandler } from '../js/fighting/InputHandler.js';

class FakeTarget {
  listeners = new Map();
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  emit(type, event = {}) {
    const e = { preventDefault() { this.defaultPrevented = true; }, ...event };
    for (const handler of this.listeners.get(type) || []) handler(e);
    return e;
  }
}

const target = new FakeTarget();
const input = new InputHandler({ target, bufferFrames: 8 });
let keyEvent = target.emit('keydown', { key: 'j', repeat: false });
assert.equal(keyEvent.defaultPrevented, true, 'combat key should not scroll the page');
assert.equal(input.isHeld('j'), true);
assert.equal(input.hasBufferedPress('j'), true);
target.emit('keydown', { key: 'j', repeat: true });
assert.equal(input.buffer.length, 1, 'OS key repeat must not add duplicate presses');
assert.equal(input.consumePress('j'), true);
assert.equal(input.consumePress('j'), false, 'press edge can only be consumed once');
target.emit('keyup', { key: 'j' });
assert.equal(input.isHeld('j'), false);

target.emit('keydown', { key: 'k' });
for (let i = 0; i < 9; i += 1) input.advanceFrame();
assert.equal(input.hasBufferedPress('k'), false, 'buffered press expires after the configured frame window');
target.emit('keydown', { key: 'd' });
target.emit('blur');
assert.equal(input.isHeld('d'), false, 'window blur must clear stuck movement keys');
assert.equal(input.buffer.length, 0, 'window blur must clear buffered presses');
// U is Don's restored third skill and must be treated like the other combat keys.
const specialPress = target.emit('keydown', { key: 'u' });
assert.equal(specialPress.defaultPrevented, true, 'U must not scroll or activate browser shortcuts during combat');
assert.equal(input.isHeld('u'), true, 'U key state is tracked');
assert.equal(input.consumePress('u'), true, 'U press is buffered and consumable');
target.emit('keyup', { key: 'u' });
assert.equal(input.isHeld('u'), false, 'U keyup clears its held state');

input.dispose();
assert.equal(target.listeners.get('keydown').size, 0, 'dispose removes event listeners');
console.log('PASS realtime-input: hold, press edge, buffer expiry, blur cleanup, dispose');
