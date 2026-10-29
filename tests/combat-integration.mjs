// Runs the real main.js combat functions with DOM/animation doubles.
// It does not substitute combat rules and is not a browser layout test.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const nodes=new Map();
function node() {
 const n={style:{setProperty(){}},dataset:{},hidden:false,children:[],textContent:'',innerHTML:'',value:20,paused:true,
 classList:{add(){},remove(){},toggle(){},contains(){return false;}},
 addEventListener(){},removeEventListener(){},setAttribute(){},getAttribute(){return null;},remove(){},
 appendChild(c){this.children.push(c);return c;},querySelector(){return node();},querySelectorAll(){return [];},closest(){return node();},
 getBoundingClientRect(){return {left:0,top:0,right:100,bottom:100,width:100,height:100};},
 animate(){return {finished:Promise.resolve(),cancel(){}};},play(){return Promise.resolve();},pause(){},load(){},focus(){}};
 return n;
}
const document={getElementById(id){assert.ok(ids.has(id),`Missing HTML id: ${id}`);if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},
 querySelector(){return node();},querySelectorAll(){return [];},createElement:node,createElementNS:node,addEventListener(){},removeEventListener(){},body:node(),documentElement:node()};
const math=Object.create(Math); math.random=()=>0;
const ctx=vm.createContext({console,document,Math:math,structuredClone,
 window:{addEventListener(){},removeEventListener(){},innerWidth:1280,innerHeight:720},
 Image:class {decode(){return Promise.resolve();}}, Audio:class {play(){return Promise.resolve();}pause(){}},
 localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
 requestAnimationFrame(){return 0;},cancelAnimationFrame(){},setTimeout(fn){fn();return 0;},clearTimeout(){},
 setInterval(){return 0;},clearInterval(){},performance:{now:()=>0},URLSearchParams,location:{search:''},Event:class{},CustomEvent:class{}});
const cache=new Map();
function load(path) {
 if(cache.has(path))return cache.get(path);
 let text=readFileSync(path,'utf8');
 if(path.endsWith('/js/main.js'))text+=`
 // Test-only exports; these are never written into the shipped game module.
 export function testReset(kind='wolf') {
   battle = kind === 'wolf' ? makeWolfBattleState() : makeBattleState();
   applyTurnStartBuffs(); return battle;
 }
 export function testSkipAnimations() {
   playSkillCutin=async()=>{}; playDonSkillSprite=async(skill,id,count,hit)=>{for(let i=0;i<count;i++)await hit(i);};
   playEgoCinematic=async()=>{}; showClash=async()=>{}; floatDamage=async()=>{};
   spawnSlash=()=>{}; spawnCoinBurst=()=>{}; spawnClashImpact=()=>{}; playClashSfx=()=>{}; pulseClashNode=()=>{};
 }
 export { wolfAttack, enemyAttack, donAttack, resolveClash, resolvePlayerAction, executePlannedTurn,
   applyTurnStartBuffs, finishTurn, createTurnSlots, checkStagger, renderBattleHUD, renderEnemies,
   renderEnemyIntents, showEnemySkillInspector, wolfBattleSkills, donBattleSkills, battle as currentBattle };
 `;
 const mod=new vm.SourceTextModule(text,{context:ctx,identifier:path});cache.set(path,mod);
 return mod;
}
const main=load(resolve(root,'js/main.js'));
await main.link((specifier,ref)=>load(resolve(dirname(ref.identifier),specifier)));
await main.evaluate(); const api=main.namespace;
api.testSkipAnimations();
let b=api.testReset(); let wolf=b.enemies[0];
assert.equal(wolf.maxHp,1200);assert.equal(b.enemySlots.length,3);
api.renderBattleHUD();api.renderEnemies();api.renderEnemyIntents();api.showEnemySkillInspector(b.enemySlots[0]);
assert.match(nodes.get('enemyInspectorText').innerHTML,/Slash ×0.5/);
const attack=(key)=>({enemyId:0,skill:api.wolfBattleSkills[key],speed:4,targetSlotIndices:key==='mirageSlash'?[0,1,2]:[0],consumed:false});
await api.enemyAttack(attack('indigoBlade'));
assert.equal(b.don.hp,183);assert.equal(b.don.exhaust,2);
api.finishTurn();api.applyTurnStartBuffs();
assert.equal(b.don.exhaust,1);assert.ok(b.donSlots.every(s=>s.speed<=5));
b=api.testReset(); await api.enemyAttack(attack('azureRend'));
assert.equal(b.don.hp,170,'Azure deals HP damage on each surviving Coin');assert.equal(b.don.sp,0);
b=api.testReset();wolf=b.enemies[0];wolf.hp=400;wolf.staggerLevel=2;
await api.enemyAttack(attack('mirageSlash'));
assert.equal(b.don.hp,187,'AoE on 3 Don slots must deal 7 + 9 once each');
assert.equal(b.don.exhaust,4);
api.finishTurn();api.applyTurnStartBuffs();assert.equal(b.don.offenseLevelDown,3);
api.renderBattleHUD();assert.match(nodes.get('donStatus').innerHTML,/OFFENSE -3/);
b=api.testReset();wolf=b.enemies[0];b.turn=3;api.createTurnSlots();
const counter=b.enemySlots.find(s=>s.skill.counter);assert.ok(counter);
const hpBefore=b.don.hp;
await api.donAttack(b.donSlots[0],api.donBattleSkills.joust,wolf,1,false);
assert.ok(counter.consumed);assert.ok(b.don.hp<hpBefore);
const after=b.don.hp;
await api.donAttack(b.donSlots[1],api.donBattleSkills.joust,wolf,1,false);
assert.equal(b.don.hp,after,'Counter fires only once');
b=api.testReset();wolf=b.enemies[0];b.turn=3;api.createTurnSlots();wolf.hp=841;
await api.donAttack(b.donSlots[0],api.donBattleSkills.joust,wolf,1,false);
assert.ok(wolf.staggered);assert.equal(b.don.hp,203,'Stagger prevents Counter');
api.finishTurn();api.applyTurnStartBuffs();assert.ok(wolf.staggered);
api.finishTurn();api.applyTurnStartBuffs();assert.equal(wolf.staggered,false);
b=api.testReset();wolf=b.enemies[0];wolf.sp=-45;wolf.panicPending=true;
api.applyTurnStartBuffs();math.random=()=>.99;
const hpPanic=b.don.hp;await api.enemyAttack(attack('sever'));assert.equal(b.don.hp,hpPanic-2);
math.random=()=>0;
// Full action queues: Wolf and the existing bandit encounter must both complete.
for(const encounter of ['wolf','bandit']) {
 b=api.testReset(encounter);b.donSlots.forEach((s,i)=>{s.targetIntentId=b.enemySlots[i%b.enemySlots.length].id;});
 await api.executePlannedTurn();
 assert.ok(b.don.hp>=0 && b.don.hp<=b.don.maxHp);
 assert.ok(b.enemies.every(e=>e.hp>=0 && e.hp<=e.maxHp));
 assert.ok(b.enemySlots.every(s=>s.consumed || b.don.hp===0 || b.enemies.every(e=>e.hp===0)));
}
console.log('Real combat flow + mock DOM: PASS');
