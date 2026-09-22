# Raise Don Quixote — Web v60

V60 keeps the stable modular/New Game fixes from v59 and adds the requested Wolf balance pass, battle loading scene, and the latest supplied Limbus-style UI assets.

## V60 changes

- **Wolf boss buffed**
  - HP: **780**
  - Stagger thresholds: **585 / 390 / 195**
  - Higher clash power across Wolf's six-skill rotation
  - Starts with **2 Poise Potency / 3 Poise Count** and **Damage Up 1**
  - Gains a second action from Turn 4 onward
  - Wolf Speed range is now 4–7
  - Goal: the duel lasts long enough for Don's E.G.O tutorial/unlock at Turn 6.

- **Rupture removed from Don**
  - Joust no longer applies Rupture.
  - Don's Player status container no longer includes Rupture.
  - Don's status HUD no longer renders Rupture.
  - Enemy attacks no longer consume Rupture from Don.

- **Battle loading scene**
  - Plays before both bandit and Wolf battles.
  - Wolf loading copy warns that E.G.O synchronization becomes available at Turn 6.
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

- La Sangre de Sancho is still unlocked from **Turn 6** in the Wolf encounter.
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
