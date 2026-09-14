# Raise Don Quixote — HTML Edition

This is a browser remake of the uploaded Ren'Py prototype.

## Run

Open `index.html` directly, or for the most consistent browser behavior run a small local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Included systems

- Visual-novel dialogue and choices
- Name input
- Don Quixote expression changes
- Backpack/inventory tutorial
- Potion item and inventory UI
- World map, location/time tracking, unlocks
- Background music and volume control
- Local browser save/load via `localStorage`
- Responsive desktop/mobile layout
- Keyboard shortcuts: Enter/Space advance, number keys choose, `I` inventory, `M` map

## Source-project issues handled in this remake

The Ren'Py source currently has incomplete/broken progression around the map/forest section (including a missing `forest_main` label and quest gates that are never set). The HTML version keeps the existing story text but makes the current demo playable: Town can be visited after it is unlocked, Forest becomes available after the Bus tutorial step, and Forest ends with a neutral “current demo content ends here” message rather than inventing new story.

The uploaded custom font file is intentionally not redistributed in this remake.


## Forest Battle V3 — command-chain combat

The Forest bandit encounter has been rebuilt after reviewing the uploaded Limbus Company gameplay reference. The battle now has two distinct phases:

- **Command phase:** multiple Don speed/action slots, two skill choices per slot, clash forecasts, enemy intent slots, targeting lines, turn order, `WIN RATE` and `DAMAGE` auto-select, and a circular `START` command.
- **Combat phase:** speed-based resolution, Coin/Clash rounds, SP-based Heads chance, clash win/loss, unopposed attacks, multi-Coin hits, damage popups, camera shake, Stagger, Bleed, Haste, Attack Power Up, and Sin resource counters.

Don's playable actions in this prototype are **Joust**, **Galloping Tilt**, **For Justice!**, and **Evade**. The battle presentation uses only this project's existing art and original HTML/CSS animation; no UI graphics, sprites, video frames, or audio are copied from the reference video.

### Battle controls

- Click a skill card to swap between the two drawn skills for that speed slot.
- Click `TARGET` to cycle which enemy action that slot clashes with, or click an enemy intent after focusing a slot.
- Click `EVADE` to convert a slot to the defensive action.
- `WIN RATE` chooses safer clash options.
- `DAMAGE` chooses higher expected damage.
- Press **START** or **Enter** to resolve the turn.
- Number keys **1–5** switch the corresponding action slot's skill.
- **W** = Win Rate auto-select, **D** = Damage auto-select.

### Update GitHub

After replacing the updated files in your existing `Don` repository:

```bash
git add .
git commit -m "rebuild forest battle system"
git push
```

## Forest Battle V4

The Forest encounter was rebuilt around the interaction model in the supplied gameplay reference rather than the previous large-card prototype.

- Three-bandit encounter with independent HP, stagger state, speed and intents.
- Solo Don action chain grows from 3 to 6 action slots across turns.
- Each slot draws two skills; click the rear card to switch, or choose Evade.
- Click an enemy intent to target it, or drag a Don speed slot onto an enemy intent.
- Curved targeting lines are colored by clash forecast: Dominating/Favored/Neutral/Struggling/Hopeless/Unopposed.
- Win Rate and Damage auto-selection modes.
- Speed-order resolution, clashes, losing coins, SP-based Heads chance, unopposed attacks, defensive evade, stagger, bleed, haste, attack power up, Sin resources and total turn damage.
- Combat phase collapses command UI and uses close-in attacks, screen shake, clash overlay, coin flips and damage popups.
- Uses only the existing project art and generated CSS shapes for enemies; no game assets were copied from the reference video.

## V5 battle presentation update
- Added skill cut-ins, speed streaks, afterimages, weapon trails, impact bursts, coin-break bursts, stronger per-skill movement, and a combat cinematic mode.
- Uses the project's existing Don character images and original CSS-generated VFX. It does not include ripped sprites, UI art, audio, or other proprietary assets from Limbus Company or the reference video.

## V6 — supplied battle sprite integration

The Forest battle now uses the Don Quixote battle assets supplied directly with this project update:

- `assets/battle/don/idle-animation.gif` / `idle.png` — battle idle
- `guard.png` — clash-ready stance
- `hurt.png` — damage reaction
- `evade.png` / `moving.png` — defensive movement
- `dead.png` — defeat state
- `skill-1.gif` — Joust animation
- `skill-2.gif` — Galloping Tilt animation
- `skill-3.gif` — For Justice! animation

Skill GIFs are replayed as the actual combat animation layer, with damage/coin hits synchronized to the supplied animation timing. The normal story sprites remain unchanged.


## V7 skill artwork
- Uses the four skill screenshots supplied by the project owner to create in-game art for Joust, Galloping Tilt, For Justice!, and Evade.
- Skill artwork now appears on action cards, the hover inspector, Clash UI, and attack cut-in.
- V6 active HTML/CSS/JS are preserved as index.v6.bak.html, style.v6.bak.css, and script.v6.bak.js.
