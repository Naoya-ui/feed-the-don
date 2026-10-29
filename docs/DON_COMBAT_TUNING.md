# Don Real-time Combat Tuning

## Move configuration

Edit `js/fighting/Fighter.js` → `MOVE_DATA`:

- `startup`, `active`, `recovery`: frame data at 60 simulation frames per second.
- `hitboxWidth`, `hitboxHeight`, `hitboxCenterY`: rectangular AABB for the lance/attack. `hitboxCenterY` is measured as a ratio of the logical fighter body height from its top.
- `lungeStartFrame`, `lungeEndFrame`, `lungeSpeed`: optional forward slide window during a move.
- `hitWindows`: optional multi-hit pulses, relative to the start of active frames. `start` is inclusive, `end` is exclusive, and `damageMultiplier` scales that pulse's damage.

Current Don moves:

- J / Joust: long, narrow single thrust.
- K / Gallop: two distinct spear thrusts, each dealing half the move's configured damage.
- U / Justice: broad, low lance sweep with a forward slide. Only this move triggers the dramatic camera shake on impact.

## Sprite orientation and animation alignment

`js/fighting/RealtimeBattleMode.js` → `getSpriteFacingScale()` maps world-facing to each sprite sheet's native direction. Don's sheets are natively facing right; bandit and Wolf sheets are treated as natively facing left. To add more characters, update this helper if their artwork's native direction differs.

Don's horizontal lance poses use a consistent canvas height and a torso anchor near the left half of the wide sprite. Wide images are capped horizontally without shrinking the image height, avoiding the old effect where the character became shorter during attacks. Justice's frames 3 and 6 are slash-only effects and are rendered as overlays, not as replacement character sprites.

## Best-of-three boss/Versus match

Wolf encounters and standalone Versus matches use two round coins per side. A round winner receives one coin. The first side to two coins wins the match. If the score is 1–1 after two rounds, round three is the tiebreaker. Both sides restore their starting HP before the next round. This logic is in `RealtimeBattleMode.js`.
