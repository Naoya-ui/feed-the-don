# Heathcliff — Runtime Encounter

This is a new story opponent, added after Don defeats Wolf. The content is kept modular so additional identities, skills, E.G.O variants, or characters can be registered later without rewriting the main renderer.

## Story flow

- Wolf victory triggers Heathcliff's introduction and a real-time duel.
- `heathcliffIntroSeen`, `heathcliffBattleSeen`, and `heathcliffBattleWon` are saved in the game state.
- Revisiting the forest retries the encounter if Heathcliff has not been defeated. Completing the fight records `heathcliffAfterBattle` before returning to the story map.

## Combat

- `js/data/heathcliff.js` contains sprite paths, animation sequences, E.G.O tuning and gauge helpers.
- `js/fighting/Fighter.js` defines Heathcliff's `Bat Strike`, `Ruthless Swing`, and `E.G.O Burst` frame data.
- `js/fighting/RealtimeBattleMode.js` contains the AI decision to spend a full gauge when Don is in E.G.O range; it will approach if Don is too far away.
- The E.G.O gauge max is 100. Current gain values are in `HEATHCLIFF_EGO_CONFIG`: on-hit 18, on-block 11, received hit 13, received blocked hit 8. Evasion events do not award gauge.
- Once charged, Heathcliff automatically activates E.G.O in range, spends the gauge, plays a cut-in, and executes the longer multi-hit move. The move uses fixed frame data, not random damage rolls.

## Assets

- Runtime character sprites and skill/effect frames: `assets/images/battle/heathcliff/`
- Portrait: `assets/images/characters/heathcliff.png`
- Expression reference sheet: `assets/images/characters/heathcliff-expression-sheet.png`
- Audio: `assets/audio/heathcliff/`
- Unmodified source images/atlases: `assets/limbus-source/heathcliff/LCB Sinner/`
- Character voice catalogue: `js/data/voiceLines.js`
- Content library records: `assets/data/limbus-library/catalog.json`

The source files are retained alongside the runtime files so future work can add new identities or animation sets without losing the originals. The current runtime maps the supplied Base Appearance assets; the C6/source atlases are preserved for future use, but are not yet wired as a separate playable identity.

## Adding another Identity or character later

1. Put runtime-ready sprites in a new folder under `assets/images/battle/<character-id>/`.
2. Add a data module alongside `js/data/heathcliff.js`, defining sprite paths, frame sequences and any meter configuration.
3. Register move frame data in `Fighter.js` or move into a dedicated move-data module if the character count grows.
4. Add the character's combat voice keys in `js/data/voiceLines.js` and register asset records in `catalog.json`.
5. Add focused tests for gauge/event behavior, animation paths and story encounter transitions.

## Notes

The character's story dialogue and numerical balance here are new implementation choices for this game prototype. Limbus Company voice and image assets are treated as user-provided local resources; the implementation does not fetch assets at runtime.
