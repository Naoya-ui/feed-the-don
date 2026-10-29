import assert from 'node:assert/strict';
import { RealtimeBattleMode, getSpriteFacingScale } from '../js/fighting/RealtimeBattleMode.js';

class FakeTarget {
  listeners = new Map();
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  emit(type, event = {}) {
    const ev = { preventDefault() {}, ...event };
    for (const fn of this.listeners.get(type) || []) fn(ev);
  }
}
class FakeClassList {
  values = new Set();
  add(v) { this.values.add(v); }
  remove(v) { this.values.delete(v); }
  toggle(v, force) { const shouldAdd = force ?? !this.values.has(v); shouldAdd ? this.values.add(v) : this.values.delete(v); return shouldAdd; }
}
class FakeNode extends FakeTarget {
  constructor(id = '') { super(); this.id=id; this.children=[]; this.dataset={}; this.style={}; this.classList=new FakeClassList(); this.hidden=false; this.checked=false; this.textContent=''; this.width=1280; this.height=720; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children=[...nodes]; }
  focus() {}
  setAttribute(name, value) { this.attributes ??= {}; this.attributes[name] = value; }
  querySelector(selector) {
    const m = selector.match(/^\[data-(enemy-id|hp-fill|hp-label)="([^"]+)"\]$/);
    if (!m) return null;
    const key = ({'enemy-id':'enemyId','hp-fill':'hpFill','hp-label':'hpLabel'})[m[1]];
    return this.children.find(node => node.dataset?.[key] === m[2]) || null;
  }
  getContext() { return fakeContext; }
}
const gradient = { addColorStop() {} };
const fakeContext = new Proxy({
  save(){}, restore(){}, clearRect(){}, fillRect(){}, strokeRect(){}, beginPath(){}, ellipse(){}, arc(){}, fill(){}, stroke(){}, moveTo(){}, lineTo(){}, quadraticCurveTo(){}, bezierCurveTo(){}, rotate(){},
  fillText(){}, strokeText(){}, drawImage(){}, translate(){}, scale(){}, createLinearGradient(){ return gradient; }, createRadialGradient(){ return gradient; },
}, { set(target, key, value) { target[key]=value; return true; } });

const win = new FakeTarget();
let nextRafId=1;
const rafs=new Map();
globalThis.window=win;
globalThis.requestAnimationFrame=(cb)=>{const id=nextRafId++;rafs.set(id,cb);return id;};
globalThis.cancelAnimationFrame=(id)=>rafs.delete(id);
globalThis.Image=class FakeImage { constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this._src='';} set src(v){this._src=v;} get src(){return this._src;} };
const ids=['realtimeCanvas','rtPlayerHpFill','rtPlayerHpLabel','rtEnemyHud','rtMessage','rtEncounterLabel','rtResult','rtResultEyebrow','rtResultTitle','rtResultCopy','rtResultButton','rtMainMenuButton','rtResetRound','rtSettingsButton','rtModeBadge','rtControlsSummary','rtSeriesScore','rtLiveStatus','rtFpsStatus'];
const nodes=Object.fromEntries(ids.map(id=>[id,new FakeNode(id)]));
nodes.realtimeCanvas.getContext=()=>fakeContext;
const root=new FakeNode('realtimeArena');
root.querySelector=(selector)=>nodes[selector.replace(/^#/, '')]||null;
globalThis.document={getElementById:(id)=>id==='realtimeArena'?root:nodes[id]||null,createElement:()=>new FakeNode()};

const battle={
  wave:1,totalWaves:1,
  don:{hp:100,maxHp:100},
  enemies:[{id:0,name:'Test Bandit',hp:20,maxHp:20,spriteKey:'club',role:'CLUB'}],
};
assert.equal(getSpriteFacingScale('player', 1), 1, 'Don art is natively facing right');
assert.equal(getSpriteFacingScale('player', -1), -1, 'Don art flips when the player faces left');
assert.equal(getSpriteFacingScale('enemy', -1), 1, 'enemy art is natively facing left and stays unflipped when facing Don');
assert.equal(getSpriteFacingScale('enemy', 1), -1, 'enemy art flips only when facing right');
assert.equal(getSpriteFacingScale('enemy', -1, 'heathcliff'), -1, 'Heathcliff art is natively facing right and flips toward the player');
assert.equal(getSpriteFacingScale('enemy', 1, 'heathcliff'), 1, 'Heathcliff art remains unflipped when facing right');

const moveStartEvents=[];
const roundStartEvents=[];
const mode=new RealtimeBattleMode({root,onMoveStart:(event)=>moveStartEvents.push(event),onRoundStart:(event)=>roundStartEvents.push(event)});
const round=mode.runRound(battle,'bandit');
mode.pause();
assert.equal(mode.loop.running, false, 'Settings pauses the real-time simulation');
mode.resume();
assert.equal(mode.loop.running, true, 'closing Settings resumes the real-time simulation');
mode.player.x=400;
mode.enemies[0].x=500;
win.emit('keydown',{key:'j',repeat:false});
for(let i=0;i<6;i++) mode.update(1/60);
assert.equal(battle.enemies[0].hp,5,'the real-time orchestration connects input, frame data, hitbox and live battle HP');
assert.equal(moveStartEvents[0]?.move.animationKey, 'joust', 'Don Joust voice event is emitted at move startup');
assert.equal(moveStartEvents.length, 1, 'one voice event is emitted for the single Joust startup, not on every active frame');
assert.equal(roundStartEvents[0]?.round, 1, 'the real-time engine publishes the round-start event for contextual voice lines');
assert.equal(mode.cameraShake, 0, 'ordinary Joust hits must not shake the screen');
assert.equal(mode.player.stateMachine.rejectedTransitions.length, 0, 'the integrated fighter follows only valid state transitions');
assert.equal(mode.enemies[0].stateMachine.rejectedTransitions.length, 0, 'the AI fighter follows only valid state transitions');
// Don keeps the player's chosen facing while idle; AI-facing must not override it.
mode.input.clear();
mode.player.currentMove = null;
mode.player.hitstunFrames = 0;
mode.player.blockstunFrames = 0;
mode.player.x = 500;
mode.player.facing = 1;
mode.enemies[0].x = 300;
mode.enemies[0].aiCooldownFrames = 999;
mode.enemies[0].aiDefenseCooldownFrames = 999;
mode.update(1/60);
assert.equal(mode.player.facing, 1, 'player may intentionally keep facing right even when the enemy is to the left');
mode.render(0,1/60);
assert.ok(nodes.rtPlayerHpLabel.textContent.includes('100'));
mode.player.currentMove = null;
mode.player.state = 'Idle';
mode.player.aiCooldownFrames = 0;
mode.hitstopFrames = 0;
mode.enemies[0].aiCooldownFrames = 999;
assert.equal('autoDuel' in mode, false, 'the automatic battle mode has been removed from the realtime engine');
mode.setDebugBoxes(true);
assert.equal(mode.debugBoxes, true, 'hitbox visibility can be controlled by the Settings menu');
mode.setDebugBoxes(false);
assert.equal(mode.debugBoxes, false, 'the hitbox overlay can be disabled again from Settings');

// Regression: U must trigger Don's third skill and only that move may start camera shake.
mode.input.clear();
mode.player.currentMove = null;
mode.player.hitstunFrames = 0;
mode.player.blockstunFrames = 0;
mode.player.x = 400;
mode.player.facing = 1;
mode.player.state = 'Idle';
mode.enemies[0].currentMove = null;
mode.enemies[0].hitstunFrames = 0;
mode.enemies[0].blockstunFrames = 0;
mode.enemies[0].combatant.maxHp = 100;
mode.enemies[0].combatant.hp = 100;
mode.enemies[0].x = 500;
mode.enemies[0].facing = -1;
mode.enemies[0].aiCooldownFrames = 999;
mode.enemies[0].aiDefenseCooldownFrames = 999;
mode.cameraShake = 0;
win.emit('keydown', { key: 'u', repeat: false });
for (let i = 0; i < 18; i += 1) mode.update(1/60);
assert.ok(mode.cameraShake > 0, 'only the restored U/Justice move enables camera shake');
assert.equal(mode.player.currentMove?.data.id, 'special', 'pressing U selects the third move, Justice');
assert.ok(moveStartEvents.some((event) => event.move.animationKey === 'justice'), 'Justice emits its own move-start voice event');
assert.ok(battle.enemies[0].hp < 100, 'U/Justice reaches combat resolution and deals damage');
win.emit('keyup', { key: 'u' });

battle.enemies[0].hp=0; mode.hitstopFrames=0;
mode.update(1/60);
assert.equal(await round,'win','all enemy KOs end the current wave');
const shown=mode.showResult(true);
nodes.rtResultButton.emit('click');
assert.equal(await shown,'continue','story encounters still return to story when confirmed');
const standaloneResult = mode.showResult(true, { standalone: true });
nodes.rtMainMenuButton.emit('click');
assert.equal(await standaloneResult, 'main-menu', 'standalone Versus/Training can return to the main menu');
mode.dispose();
assert.equal(root.hidden,true,'dispose hides the realtime layer when returning to story mode');

const trainingBattle = {
  wave: 1, totalWaves: 1,
  don: { hp: 100, maxHp: 100 },
  enemies: [{ id: 42, name: 'Training Dummy', hp: 999999, maxHp: 999999, spriteKey: 'club', role: 'CLUB' }],
};
const trainingMode = new RealtimeBattleMode({ root, trainingMode: true, standaloneMode: true });
const trainingRound = trainingMode.runRound(trainingBattle, 'training');
for (let i = 0; i < 20; i += 1) trainingMode.update(1/60);
assert.equal(trainingBattle.don.hp, 100, 'training dummy does not attack the player');
assert.equal(trainingBattle.enemies[0].hp, 999999, 'training dummy remains ready for practice until the player attacks it');
win.emit('keydown', { key: 'Escape', repeat: false });
trainingMode.update(1/60);
assert.equal(await trainingRound, 'exit', 'Escape exits Training without forcing a round win/loss');
trainingMode.dispose();

// Wolf/Boss and Versus rounds use a best-of-three coin score; the decider is round three.
const seriesBattle = {
  wave: 1, totalWaves: 1,
  don: { hp: 100, maxHp: 100 },
  enemies: [{ id: 77, name: 'Wolf', hp: 30, maxHp: 30, spriteKey: 'wolf', role: 'WOLF' }],
};
const seriesMode = new RealtimeBattleMode({ root });
const seriesPromise = seriesMode.runRound(seriesBattle, 'wolf');
assert.equal(seriesMode.seriesActive, true, 'boss battles enable best-of-three scoring');
assert.equal(nodes.rtSeriesScore.hidden, false, 'round coin HUD is visible during boss fights');
seriesBattle.enemies[0].hp = 0;
seriesMode.update(1/60);
assert.equal(seriesMode.seriesScores.player, 1, 'round win awards one coin to Don');
for (let i = 0; i < 84; i += 1) seriesMode.update(1/60);
assert.equal(seriesMode.seriesRound, 2, 'a first round win begins round two instead of ending the encounter');
assert.equal(seriesBattle.don.hp, 100, 'fighter HP is restored before the next round');
assert.equal(seriesBattle.enemies[0].hp, 30, 'boss HP is restored before the next round');
seriesBattle.don.hp = 0;
seriesMode.update(1/60);
assert.equal(seriesMode.seriesScores.enemy, 1, 'boss round win awards one coin to the opponent');
for (let i = 0; i < 84; i += 1) seriesMode.update(1/60);
assert.equal(seriesMode.seriesRound, 3, 'a 1–1 score triggers a third tiebreaker round');
seriesBattle.enemies[0].hp = 0;
seriesMode.update(1/60);
for (let i = 0; i < 84; i += 1) seriesMode.update(1/60);
assert.equal(await seriesPromise, 'win', 'the match ends when Don gets the second round coin');
assert.equal(seriesMode.seriesScores.player, 2);
assert.equal(seriesMode.seriesRound, 3);
seriesMode.dispose();
console.log('PASS realtime-mode: facing orientation, player-facing control, story flow, passive training, Settings debug boxes, best-of-three boss score and tiebreaker round');
