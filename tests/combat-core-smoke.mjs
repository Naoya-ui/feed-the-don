import { CoinSystem } from '../js/core/CoinSystem.js';
import { SkillSystem } from '../js/core/SkillSystem.js';
import { ClashSystem } from '../js/core/ClashSystem.js';
import { TurnSystem } from '../js/core/TurnSystem.js';
import { EgoSystem } from '../js/core/EgoSystem.js';
import { EnemyAI } from '../js/core/EnemyAI.js';
import { donBattleSkills } from '../js/data/skills.js';
import { wolfBattleSkills, wolfSkillRotation } from '../js/data/enemies.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAIL: ${message}`);
};

assert(CoinSystem.headsChancePercent(45) === 95, 'SP +45 => 95% Heads');
assert(CoinSystem.headsChancePercent(-45) === 5, 'SP -45 => 5% Heads');
assert(SkillSystem.maxPower(donBattleSkills.justice, 3, { speed: 10 }) === 18, 'Justice speed bonus');
assert(SkillSystem.maxPower(wolfBattleSkills.azureRend, 2, { speed: 6 }) === 17, 'per-Coin modifier');

const clash = ClashSystem.resolveRound({
  playerSkill: donBattleSkills.joust,
  enemySkill: wolfBattleSkills.mirageSlash,
  playerCoins: 1,
  enemyCoins: 1,
  playerRoll: { power: 12 },
  enemyRoll: { power: 10 },
});
assert(clash.verdict === 'enemy', 'Mirage Slash clash penalty');

const battle = { phase: 'planning' };
TurnSystem.transition(battle, 'combat');
TurnSystem.transition(battle, 'cleanup');
TurnSystem.transition(battle, 'planning');
assert(battle.phase === 'planning', 'turn state cycle');

const egoBattle = {
  encounter: 'wolf', turn: 4, egoActivated: false,
  don: { sp: 0, minSp: -45, changeSp(v) { this.sp = Math.max(-45, Math.min(45, this.sp + v)); } },
  sins: { Lust: 2, Pride: 2 },
};
assert(EgoSystem.canManifest(egoBattle, donBattleSkills.laSangre).ok, 'E.G.O manifest check');
assert(EgoSystem.payCost(egoBattle, donBattleSkills.laSangre).ok, 'E.G.O payment');
assert(egoBattle.don.sp === -10 && egoBattle.sins.Lust === 0 && egoBattle.sins.Pride === 0, 'E.G.O accounting');

const wolf = { id: 0, role: 'WOLF', spriteKey: 'wolf', haste: 0 };
const intents = EnemyAI.buildIntents({
  enemies: [wolf],
  turn: 5,
  getSkillPool: () => wolfSkillRotation.map((key) => wolfBattleSkills[key]),
  randomInt: (min) => min,
});
assert(intents.length === 3, 'Wolf turn 5 action count');
assert(intents[0].skill.key === 'mirageSlash', 'Wolf turn 5 rotation');

console.log('Combat-core smoke tests passed.');
