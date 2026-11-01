# Realtime performance / character selection / combat update

## Suggested ES module layout

```text
assets/{images,audio}/       # source media only
css/{style,realtime-battle}.css
js/core/{AssetLoader,GameLoop,CombatSystem}.js
js/entities/{Fighter,Player,Enemy}.js
js/input/{InputHandler,GamepadInput}.js
js/ui/{DOMManager,MenuUI,BattleUI}.js
js/data/{characters,enemies,skills,versusRoster}.js
js/fighting/RealtimeBattleMode.js
js/main.js                    # composition root / event wiring
```

The project already has `js/core`, `js/fighting`, `js/ui`, `js/data` and `js/utils`; keep its existing imports stable while moving one module at a time. Move a file, fix its relative imports, then run `npm test` before proceeding. Avoid moving `assets/` paths unless the manifest and all references are updated.

## Apply / verify

1. `AssetLoader` plus `js/core/asset-manifest.json` handles the startup preload/cache. Update that manifest whenever new assets are added; the loading overlay closes after successes and failed optional files (e.g. not-yet-uploaded E.G.O art) are skipped rather than blocking the menu.
2. Versus selection is built from `VERSUS_ROSTER`; use A/D + J for P1 and ←/→ + 1 for P2, then continue to the existing E.G.O loadout step. Add a roster entry and portrait in `js/data/versusRoster.js` to add a fighter.
3. In the arena, health bars use transform scaling and are cached instead of querying the DOM every simulation frame. Skill icons are recorded once when a move starts.
4. Run `npm test` to verify combat, HUD, game loop, selection and Heathcliff encounter regressions.

- `J` is the 10-damage light; `K` is the 20-damage Don lunge / Heathcliff's bat combo; `U` is Skill 3 with a 20-second cooldown and super armor. `I` is reserved for the equipped E.G.O form (requires a full meter); its move data uses the existing E.G.O art/VFX pipeline and can be replaced when new model assets arrive.
- `L` remains a short dash. It no longer grants invulnerability: contacts during its movement resolve as normal hits.
- Story encounters count down from 99 seconds; the Wolf boss is untimed. Versus exposes 99 / 199 / infinite time selection in the loadout stage.
- Heathcliff spar opens with a short taunting exchange. Mob health UI track is reduced in size to limit visual clutter.

To tune the move timings and hitboxes edit `MOVE_DATA` in `js/fighting/Fighter.js`. To change the Versus time presets, edit `#versusTimeLimit` in `index.html`; `0` means infinite. For custom E.G.O art, after the assets are supplied, register their state/animation paths with `await realtimeMode.setEgoSpriteSet('don', { idle: 'assets/images/ego/don/idle.png', attack: ['assets/images/ego/don/attack-1.png'] })` (or `'heathcliff'`). The module preloads them before assigning the set. `Fighter.activateEgoForm()` changes only the visual set: fighter dimensions and hitboxes stay fixed. Add the files to `js/core/asset-manifest.json` so they are also available during startup.
