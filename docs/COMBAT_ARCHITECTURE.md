# Combat architecture — Wandering Wolf web update

This is an HTML/CSS/JavaScript project. Run it through an HTTP server; no Unity or C# is involved.

## Responsibilities

| File | Responsibility |
|---|---|
| `js/data/enemies.js` | Wolf definition, resistances, skill parameters, three-turn pattern, inspector text |
| `js/core/Player.js` | Don's HP/SP, current statuses, Exhaust and Offense Level Down fields |
| `js/core/CoinSystem.js` | SP-dependent Heads probability; injectable RNG |
| `js/core/SkillSystem.js` | Base/Coin Power, missing-HP bonus, Panic penalty, rolls |
| `js/core/ClashSystem.js` | One comparison, level bonus, Lone Predator, losing Coin removal |
| `js/core/WolfBossSystem.js` | Exhaust timing, SP/Panic, Stagger thresholds, phase gating, passives |
| `js/core/EnemyAI.js` | Wolf rotation, enemy action slots, target selection, AoE unit deduplication |
| `js/core/BattleSystem.js` | Shared statuses, Poise and resistance/Fragile multipliers |
| `js/main.js` | Existing story, targeting UI, turn orchestration, combat effects and animations |

Core modules do not access the DOM. This is a scoped Wolf update, not a full rewrite of the app.
The previous document referred to missing TurnSystem/EgoSystem modules. Those do not exist in this version; turn sequencing and E.G.O remain in main.js.

## Resolution

1. Turn Start consumes any queued Exhaust proc, applies next-turn buffs, begins Panic and refreshes Lone Predator.
2. AI builds three Wolf slots. Don's speed uses the remaining Exhaust stacks and Haste.
3. The player assigns targets. Speed orders actions; the existing single-Don redirection behavior is retained.
4. Attack-vs-attack invokes the pure Clash resolver. It adds +1 Clash Power per full 3 points of positive Offense Level advantage, plus Lone Predator if applicable.
5. Wolf gains/loses 10 SP once per completed Clash. Azure Rend grants an additional 10 SP on a win. Wolf's current SP affects Heads chance.
6. Wolf attacks once per surviving Coin with accumulating positive Coin Power. Resistance and Stagger multipliers affect direct damage. Don retains the prototype's existing damage/crit formula with Wolf's resistances applied.
7. An armed Counter is excluded from the normal speed queue. After a direct Don attack finishes, it retaliates once only if Wolf and Don are alive and Wolf is not Staggered.
8. Turn End decays Exhaust and Stagger duration, clears temporary Fragile, and ends active Panic. E.G.O still unlocks on Turn 4 and retains its existing 20 SP cost.

## Test scope

`npm test` runs numeric/spec tests and real main.js combat flows against DOM/animation doubles.
Integration scenarios include two-Coin Exhaust, HP damage from Azure Rend, same-unit AoE deduplication, one-shot Counter, Stagger preventing Counter, Panic damage, HUD text and complete Wolf/bandit action queues.
These tests do not verify browser rendering, audio timing, or encounter balance. Browser visual QA still needs a local playthrough.
