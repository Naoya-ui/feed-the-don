# Raise Don Quixote — Web v68

V60 keeps the stable modular/New Game fixes from v59 and adds the requested Wolf balance pass, battle loading scene, and the latest supplied Limbus-style UI assets.

## V60 changes

- **Wolf boss buffed**
  - HP: **780**
  - Stagger thresholds: **585 / 390 / 195**
  - Higher clash power across Wolf's six-skill rotation
  - Starts with **2 Poise Potency / 3 Poise Count** and **Damage Up 1**
  - Gains a second action from Turn 4 onward
  - Wolf Speed range is now 4–7
  - Goal: the duel lasts long enough for Don's E.G.O tutorial/unlock at Turn 4.

- **Rupture removed from Don**
  - Joust no longer applies Rupture.
  - Don's Player status container no longer includes Rupture.
  - Don's status HUD no longer renders Rupture.
  - Enemy attacks no longer consume Rupture from Don.

- **Battle loading scene**
  - Plays before both bandit and Wolf battles.
  - Wolf loading copy warns that E.G.O synchronization becomes available at Turn 4.
  - Uses supplied gear imagery plus Slash / Pierce / Blunt icons.

- **New supplied UI assets integrated**
  - Slash / Pierce / Blunt icons on skill cards, enemy intents and enemy inspector.
  - Supplied action-slot frame on Don's command slots.
  - Supplied unit-gauge ring around Don's manager portrait.
  - Supplied START gear replaces the generic CSS-only start circle.
  - Supplied E.G.O / targeting ring highlights selected enemy intents and the E.G.O button.
  - Supplied golden Stagger effect appears over Staggered enemies.
  - Supplied handwritten number sheet is cropped into 0–9 sprites and used for damage popups.
  - Supplied Operation UI art is used as an intent-frame backing.

## E.G.O

- La Sangre de Sancho is still unlocked from **Turn 4** in the Wolf encounter.
- 12 base power, +11 Coin Power, 1 Coin.
- Costs 20 SP when used.
- Heads Hit inflicts 4 Bleed.
- Sprite sequence + sound cues + screen shake + blood slash remain from v59.

## Validation before ZIP

- Every JS file syntax-checked.
- `main.js` syntax-checked as an ES module.
- HTML IDs checked against `DOMManager.js`: no missing IDs.
- Literal local asset references scanned: no missing files.
- Mock-DOM **NEW GAME** smoke test passed.
- Mock-DOM **Wolf battle loading scene** test reached 100%, used the Wolf title, and closed cleanly.
- Static assertions verify Wolf HP / thresholds and confirm Don's skill/player files contain no Rupture.
- ZIP integrity is tested after packaging.


## v61 UI pass
- Replaced hand-drawn WAVE/TURN HUD with crops from the supplied BattleUI_UpperLeft_1 sheet.
- WIN RATE is above DAMAGE.
- Enemy intent uses the supplied horizontal-bar action slot art.
- START glows only when the current chain is fully targeted.
- Don E.G.O control moved to the bottom-left and unlocks on Turn 4 with tutorial guidance.
- Added compact Don HP and -45..+45 Sanity gauges under the E.G.O control.


## v64
- Fixed WAVE/TURN frame placement and clipping.
- Removed the Roman numeral rail from markup.
- Fixed hostile SVG arrow fill bug that created a giant red band.
- Centered Don HP/SP panel under Don.
- Made E.G.O unlock robust at Turn 4, restores SP to +45, auto-opens tutorial once, and keeps the E.G.O button clickable.

## v65 Professional Battle Layout Pass

- Consolidated Don HUD: HP/SP remains under Don; the duplicate footer HP/SP block is hidden.
- Moved E.G.O control beside Don's HUD so the combat information is spatially grouped.
- Kept START / WIN RATE / DAMAGE in a dedicated command column rather than inside the scrollable skill rail.
- Reworked targeting curves into separated Bezier lanes to reduce overlapping straight lines.
- Player arrows now originate from the action-slot core and enemy intents are anchored above their sprites.
- Enemy hostile arrows now converge on Don's intent anchor above the character instead of cutting horizontally through the field.
- Added a simple battle-layer contract: background -> entities -> targeting -> HUD.
- Added viewport-safe spacing and responsive footer behavior without redesigning gameplay.


## v67 Combat Systems / E.G.O / Coin UI
- La Sangre de Sancho updated from the supplied E.G.O info: ZAYIN / Lust, 10 SP, 2 Lust + 2 Pride resources.
- Added Immoderate Passion prototype passive: On Hit against a Bleeding target, heal 3 HP.
- Added E.G.O resource grants in the Turn 4 tutorial so the solo prototype can actually demonstrate the E.G.O.
- Don and Wolf coin Heads chance now follows SP: 50% + SP, clamped to 5–95%.
- Wolf per-coin Coin Power modifiers are included in Clash rolls.
- Added simplified Unbreakable Coin behavior: losing Unbreakable Coins crack instead of disappearing, then counter with fixed ±1 Coin Power unless Wolf is Staggered.
- Clash coin visuals now use the supplied BattleUI_NewCoin sheet, with Lust / Gluttony / Envy / neutral variants.
- E.G.O info panel uses the supplied E.G.O screenshot and resource icons.
- Wolf attack movement now calculates the dash from Wolf to Don using live DOM positions instead of a fixed viewport translation.


## v68 Modular Combat Core

This pass separates combat rules from presentation while preserving the existing battle UI and animations.

- **CoinSystem** — SP-based Heads chance and injectable RNG for deterministic tests/replays.
- **SkillSystem** — one source of truth for Base Power, Coin Power, per-Coin modifiers, max power and expected power.
- **ClashSystem** — pure clash-round reducer, opponent Clash Power modifiers, Coin loss and Unbreakable Coin cracking.
- **TurnSystem** — explicit Planning -> Combat -> Cleanup finite-state flow plus speed-based action queue construction.
- **EgoSystem** — E.G.O unlock/affordability/resource payment. Costs are committed when the E.G.O attack actually starts.
- **EnemyAI** — enemy action-count, readable rotation selection, speed range and intent generation isolated from UI.
- Don/Enemy Clash rolling now uses the same centralized skill-power interpreter.
- Wolf intent generation now comes from EnemyAI rather than being embedded in `main.js`.
- Turn 4 E.G.O tutorial grants are centralized and survive resumed/late-created command phases consistently.


## Versus-style real-time battle

The existing story battle now uses a real-time Canvas arena with a split HP HUD, damage / block / evade feedback, slash and impact effects, and a main menu with **Story Mode**, **Versus**, **Training**, and **Settings**. Hitbox / hurtbox debug drawing is available inside Settings only during real-time combat. See [docs/VERSUS_MODE_DESIGN.md](docs/VERSUS_MODE_DESIGN.md) for the reference analysis and controls.
