# Don Real-time Combat Tuning

## Move configuration

Edit `js/fighting/Fighter.js` → `MOVE_DATA`:

- `startup`, `active`, `recovery`: frame data at 60 simulation frames per second.
- `hitboxWidth`, `hitboxHeight`, `hitboxCenterY`: rectangular AABB for the lance/attack. `hitboxCenterY` is measured as a ratio of the logical fighter body height from its top.
- `lungeStartFrame`, `lungeEndFrame`, `lungeSpeed`: optional forward slide window during a move.
- `movementPhases`: timed movement segments (`start`/`end` are move frames) supporting `forward` and `away` dashes; `faceOpponentAt` turns a fighter at a phase boundary.
- `hitWindows`: optional multi-hit pulses relative to active-frame start. `start` is inclusive, `end` is exclusive; use `damage` for fixed per-hit power or `damageMin`/`damageMax` for a rolled hit.

Current realtime move profiles:

- Don J / Joust: 10 raw damage, one narrow lance thrust.
- Don K / Gallop: 20 raw total, two separate 10-damage thrusts.
- Don U / Justice: three 15-damage hit windows; entry lunge, cross-through/backstep, then a returning lunge. 20-second cooldown and Super Armor.
- Don I / La Sangre: dedicated E.G.O move when equipped and gauge is full.
- Heathcliff J: 10 raw damage, quick bat attack.
- Heathcliff K / Groundbreaker: 11 damage + knockdown, followed 13 active frames later by a rolled 8–11 damage slam.
- Heathcliff U / Quick Suppression: four 10-damage bat hits, a retreat step, then a 20-damage Homerun. 20-second cooldown and Super Armor.
- Heathcliff I / Bodysack: dedicated E.G.O move when equipped and gauge is full.

Combat is simulated at 60 fixed frames per second. `hitWindows` timing is relative to startup's end; `movementPhases` timing is measured from the move's first frame.

## Sprite orientation and animation alignment

`js/fighting/RealtimeBattleMode.js` → `getSpriteFacingScale()` maps world-facing to each sprite sheet's native direction. Don's sheets are natively facing right; bandit and Wolf sheets are treated as natively facing left. To add more characters, update this helper if their artwork's native direction differs.

Don's horizontal lance poses use a consistent canvas height and a torso anchor near the left half of the wide sprite. Wide images are capped horizontally without shrinking the image height, avoiding the old effect where the character became shorter during attacks. Justice's frames 3 and 6 are slash-only effects and are rendered as overlays, not as replacement character sprites.

## Best-of-three boss/Versus match

Wolf encounters and standalone Versus matches use two round coins per side. A round winner receives one coin. The first side to two coins wins the match. If the score is 1–1 after two rounds, round three is the tiebreaker. Both sides restore their starting HP before the next round. This logic is in `RealtimeBattleMode.js`.
