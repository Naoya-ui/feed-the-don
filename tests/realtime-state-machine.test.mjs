import assert from 'node:assert/strict';
import { StateMachine } from '../js/fighting/StateMachine.js';

const machine = new StateMachine('Idle', { Idle: ['Run', 'Attack'], Run: ['Idle', 'Jump'], Attack: ['Idle', 'Hit'], Hit: ['Idle', 'Knockdown'], Knockdown: [] });
assert.equal(machine.transition('Run'), true);
assert.equal(machine.current, 'Run');
assert.equal(machine.transition('Jump'), true);
assert.equal(machine.current, 'Jump');
assert.equal(machine.transition('Attack'), false, 'invalid transitions are rejected instead of silently switching states');
assert.equal(machine.current, 'Jump');
assert.equal(machine.rejectedTransitions.length, 1);
assert.equal(machine.transition('Knockdown', { force: true }), true, 'engine-level forced transition is available for exceptional resets');
assert.equal(machine.current, 'Knockdown');
console.log('PASS realtime-state-machine: legal transitions, invalid transition rejection, forced exceptional transition');
