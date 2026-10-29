# Versus-style real-time combat — design notes

## Reference analysis

The supplied 46-second reference clip shows a forest-stage duel with two combatants, long health bars along the top edge, a centered versus emblem, readable attack poses, short hit-stop, sweeping slash effects, floating damage numbers, and explicit `BLOCKED` / `EVADED` feedback. It emphasizes a clean silhouette and immediate combat readability rather than turn-planning panels.

The public Limbus Archive README describes its `Versus` feature as a configurable fight between two identities, E.G.O forms, or enemies on a stage, with optional HP/damage displays, clash/skill sequences, death finales, intro/WIN cards, effects and battle music. Its `Auto Battler` adds teams, target selection, roles and cooldowns. This project adapts those broad presentation ideas rather than copying its code, renderer, or proprietary interface assets.

Reference: https://github.com/Schirke/limbus-archive

## Adaptation in Raise Don Quixote

- Keep the existing game's story, save flow, encounter data, forest background, Don artwork, enemy artwork and audio.
- Keep the game's normal battle entry point. `index.html`'s existing `#realtimeArena` is the presentation surface; `js/main.js` continues to own story and encounter progression.
- Use a split top HUD with player/enemy HP, a central `VS` seal, fighter state readout, and an opening `FIGHT!` card.
- Use the existing 60 Hz `GameLoop`, `InputHandler`, `Fighter` state machine and AABB `CombatSystem` for actual hits.
- Display animated slash arcs, impact bursts, floating damage, `BLOCKED`, `EVADED`, camera shake and short hit-stop. A dash's invulnerability is surfaced as an evasion event without applying damage.
- The player always directly controls Don in real-time combat. Auto-battle was removed; opponents remain AI-controlled.
- The original story encounters may contain several opponents; the Wolf encounter is a direct single-opponent boss duel. This is not a 1:1 clone of Limbus Archive or the original Limbus Company renderer.

## Main menu modes

- **Story Mode** opens its own submenu containing `New Game`, `Continue` (only when a save exists), and `Back`.
- **Versus** starts a one-on-one real-time duel against one AI-controlled opponent. `Esc` returns to the main menu; the result panel offers rematch or menu.
- **Training** starts against a passive, high-HP dummy. `R` resets the practice round and `Esc` returns to the main menu.
- **Settings** contains the master volume slider. `Show hitboxes / hurtboxes` is intentionally added to the Settings modal only while a real-time fight is active; opening Settings pauses simulation until it is closed.

## Controls

- A / D: move
- W or Space: jump
- S: guard
- J: light attack
- K: heavy attack
- L: dash / timed evade
- R: restart the current round
- During a fight, open SETTINGS to toggle hitbox/hurtbox debug drawing. The debug option is hidden outside combat.

## Tests

Run `npm test` for realtime input, fixed-step game loop, state machine, combat resolution, and integrated arena checks. Run `npm run test:legacy` for the legacy combat smoke test.
