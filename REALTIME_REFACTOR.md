# Raise Don Quixote — Real-time Combat Refactor

## What changed

The real-time combat mode is now wired into the existing `index.html` / `js/main.js` game flow. It is not a separate product page: the existing title screen, story dialogue, map, save flow, loading screen, encounter state, background art, Don sprites, enemy sprites, health data, bandit waves, and Wolf encounter continue to be used.

When the story reaches a bandit encounter or the Wolf encounter, `startBattleTutorial()` now starts `RealtimeBattleMode` instead of waiting for command-chain planning, coin flips, clashes, and turn execution. The old turn-based modules remain in the repository for reference/rollback but are no longer the active combat resolver for those story encounters.

## Combat controls

- `A` / `D`: move left / right
- `W` or `Space`: jump
- `S`: guard
- `J`: light attack
- `K`: heavy attack
- `L`: dash
- `R`: restart the current round

## Engine modules

- `js/fighting/InputHandler.js`: keyboard hold state, edge presses, 8-simulation-frame buffer, key-repeat suppression, blur cleanup.
- `js/fighting/GameLoop.js`: `requestAnimationFrame` loop with a fixed 60 Hz simulation and bounded catch-up.
- `js/fighting/Fighter.js`: acceleration, walk, jump/gravity, dash, facing, state timers, startup/active/recovery frame data, hitstun, blockstun, knockback.
- `js/fighting/CombatSystem.js`: AABB hitbox/hurtbox checks, per-target hit-once tracking, simultaneous attack snapshots, deterministic damage and guard chip.
- `js/fighting/RealtimeBattleMode.js`: connects the engine to the existing Don/enemy objects and sprites, renders the canvas within the existing battle screen, controls AI, health UI, wave progression integration, debug boxes, round reset and result/retry UI.
- `css/realtime-battle.css`: real-time layer styling inside the original battle scene.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000/index.html`.

Run the real-time core tests with `npm test`. Run the existing core smoke test with `npm run test:legacy`.
