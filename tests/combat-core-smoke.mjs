import assert from 'node:assert/strict';
import { CoinSystem } from '../js/core/CoinSystem.js';
import { SkillSystem } from '../js/core/SkillSystem.js';
import { ClashSystem } from '../js/core/ClashSystem.js';
import { BattleSystem } from '../js/core/BattleSystem.js';
import { Player } from '../js/core/Player.js';
import { donBattleSkills as don } from '../js/data/skills.js';
import { wolfBoss, wolfBattleSkills as wolf } from '../js/data/enemies.js';

assert.equal(CoinSystem.headsChancePercent(45), 95);
assert.equal(CoinSystem.headsChancePercent(-45), 5);
assert.equal(CoinSystem.headsChancePercent(100), 95);
assert.deepEqual(CoinSystem.roll(3, 45, () => .96).flips, [false,false,false]);
assert.equal(SkillSystem.maxPower(don.justice, 3, {speed:10}), 18);
assert.equal(SkillSystem.roll(wolf.azureRend, 3, {unit:{sp:45},rng:()=>0}).power, 14);
assert.equal(SkillSystem.roll(wolf.azureRend, 3, {unit:{sp:-45},rng:()=>.1}).power, 5);
assert.equal(SkillSystem.maxPower(wolf.shimmeringCleave, 1, {unit:{hp:240,maxHp:1200}}), 14);
assert.equal(SkillSystem.basePower(wolf.sever, {unit:{panicActive:true}}), 2);
const input = {
 playerSkill: don.joust, enemySkill:wolf.sever, playerCoins:1, enemyCoins:1,
 playerRoll:{power:10}, enemyRoll:{power:10},
 playerUnit:{offenseLevel:35}, enemyUnit:{offenseLevel:38,clashPowerUp:1},
};
let result = ClashSystem.resolveRound(input);
assert.equal(result.enemyRoll.power,12);
assert.equal(result.verdict,'enemy');
assert.equal(result.playerCoins,0);
assert.equal(input.enemyRoll.power,10, 'round must not mutate the input roll');
result = ClashSystem.resolveRound({...input, playerUnit:{offenseLevel:35,offenseLevelDown:3}});
assert.equal(result.enemyRoll.power,13, 'Exhaust must change the actual Clash comparison');
result = ClashSystem.resolveRound({...input, playerUnit:{offenseLevel:38},enemyUnit:{offenseLevel:38}});
assert.equal(result.verdict,'tie');
assert.equal(result.playerCoins,1);
assert.equal(result.enemyCoins,1);
assert.equal(BattleSystem.resistanceMultiplier({resistances:wolfBoss.resistances},don.gallop),2);
assert.equal(BattleSystem.resistanceMultiplier({resistances:wolfBoss.resistances},wolf.sever),.5);
assert.equal(BattleSystem.resistanceMultiplier({resistances:wolfBoss.resistances,fragile:1},don.gallop),2.2);
const player = new Player();
player.changeSp(-500);
assert.equal(player.sp,-45);
assert.equal(player.takeDamage(83).staggerTriggered,true);
assert.equal(player.hp,120);
console.log('Combat core smoke: PASS');
