# Combat Architecture — v68

## Responsibility map

- `core/CoinSystem.js`
  - Converts SP into Heads chance.
  - Flips one or many Coins.
  - Supports injected RNG for tests/replays.

- `core/SkillSystem.js`
  - Interprets skill data.
  - Base Power, Coin Power, per-Coin modifiers, max power, expected power and live roll power.

- `core/ClashSystem.js`
  - Resolves one Clash round as a pure state change.
  - Applies `opponentClashPowerModifier`.
  - Removes the right-most active Coin from the loser.
  - Handles Unbreakable Coin cracking.

- `core/TurnSystem.js`
  - Combat finite-state machine: `planning -> combat -> cleanup -> planning`.
  - Builds the Speed-ordered action queue.

- `core/EgoSystem.js`
  - Unlock rule and resource validation.
  - Pays SP/Sin cost only when the E.G.O attack actually begins.
  - Centralizes solo-prototype tutorial grants.

- `core/EnemyAI.js`
  - Decides action count, skill rotation and Speed range.
  - Produces enemy intent slots without touching DOM/UI code.

- `core/BattleSystem.js`
  - Shared status helpers such as Bleed, Rupture, Poise, Critical and Stagger multipliers.

## Runtime flow

1. `applyTurnStartBuffs()` applies next-turn buffs and creates action slots.
2. `renderPlanning()` enters `planning` and renders targeting/UI.
3. Player assigns Skill -> enemy intent targets.
4. `executePlannedTurn()` enters `combat`.
5. `TurnSystem.buildActionQueue()` sorts all actions by Speed.
6. A contested action calls `resolveClash()`:
   - `SkillSystem` rolls Skill Power.
   - `ClashSystem` compares rolls and updates remaining Coins.
   - UI only animates the result.
7. Clash winner performs remaining Coin attacks; unopposed actions attack directly.
8. E.G.O calls `EgoSystem.payCost()` immediately before its attack begins.
9. End of resolution enters `cleanup`.
10. `finishTurn()` decays turn-based states and advances the turn counter.
11. Next command phase returns to `planning`.

## Extension rules

- New Skill numeric rules belong in `SkillSystem` or skill data, not in UI functions.
- New Clash-only rules belong in `ClashSystem`.
- New boss decision logic belongs in `EnemyAI`.
- New turn phases/status timing should be added to `TurnSystem`/`BattleSystem`.
- Do not make DOM functions authoritative for combat state.

## Next recommended refactor

The remaining major hard-coded section is Skill effect execution in `donAttack()` / `enemyAttack()` (Bleed application, Haste, Poise, passives). The next clean step is a trigger-based Effect Engine with events such as `onUse`, `clashWin`, `onHit`, `headsHit`, `turnStart`, and `turnEnd`.
