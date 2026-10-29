import assert from 'node:assert/strict';
import { GameLoop } from '../js/fighting/GameLoop.js';

let nextId = 1;
const callbacks = new Map();
const raf = (cb) => { const id = nextId++; callbacks.set(id, cb); return id; };
const caf = (id) => callbacks.delete(id);
function step(timestamp) {
  const entry = callbacks.entries().next().value;
  assert.ok(entry, 'expected one pending animation frame');
  const [id, callback] = entry;
  callbacks.delete(id);
  callback(timestamp);
}
let updates = 0;
let renders = 0;
let loop;
loop = new GameLoop({
  update: (dt) => { assert.equal(dt, 1 / 60); updates += 1; },
  render: (alpha, frameDelta) => { assert.ok(alpha >= 0 && alpha <= 1); assert.ok(frameDelta >= 0); renders += 1; },
  raf, caf, maxSubSteps: 5,
});
loop.start();
step(0); // establishes the frame-time baseline
step(50); // three 60Hz simulation steps (with small floating point tolerance)
assert.equal(updates, 2 + 1, '50ms should advance approximately three fixed updates');
assert.equal(renders, 2);
loop.stop();
assert.equal(callbacks.size, 0, 'stop cancels the pending RAF callback');
console.log('PASS realtime-game-loop: fixed 60Hz updates, rendering, start/stop');
