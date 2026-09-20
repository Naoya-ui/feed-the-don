# Raise Don Quixote Web — V50 Combined

V50 combines the latest stable V49 project with the audio and story additions requested after it.

## Included

- Modular project structure (`data / core / ui / utils`).
- NEW GAME bootstrap fix from V48.
- Forest bandit encounter with two waves.
- Don skill SFX:
  - Joust
  - Galloping Tilt
  - For Justice! hit 1 / hit 2 / hit 3
- Forest battle theme: `Canto I Battle Theme A2`.
  - Story BGM fades out at battle start.
  - Battle BGM loops through both waves.
  - Story BGM returns after leaving the battle result.
- Enemy attack SFX:
  - Clumsy Chop -> mob skill 1
  - Clunky Stab -> mob skill 2
  - Weak Blow -> mob skill 3
  - Heavy Strike -> boss skill 2
  - Skills without a supplied custom WAV keep the generic hit fallback.
- Wolf portrait included in the VN scene.
- Post-bandit Don/Wolf argument scene added.
- Wolf boss fight is activated after the post-bandit argument (see V51+ notes below).
- Wolf skill data prepared in `js/data/enemies.js`:
  - Sever
  - Indigo Blade
  - Azure Rend
  - Shimmering Cleave
  - Mirage Slash
  - Exhaust
  - Track remains a future mechanic hook.

## Battle mechanics already present

- SP / Sanity: -45 to +45.
- Coin-based Clash loop.
- Stagger thresholds and x2 damage while staggered.
- Bleed Potency / Count.
- Rupture Potency / Count.
- Save / Load and story flow preserved.

## Run

Because the project uses ES modules, serve the folder through HTTP:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## V51 — Wolf boss battle enabled

After the forest bandit encounter, the Don/Wolf argument now flows directly into a playable one-wave Wolf boss duel.

- Wolf uses the six supplied skills in rotation: Sever, Indigo Blade, Azure Rend, Shimmering Cleave, Mirage Slash, and Exhaust.
- The battle uses the existing command/target/clash system and the supplied Wolf portrait as the temporary battlefield sprite.
- Wolf's source screenshots did not show an HP value, so this build uses a temporary tuning value of **360 HP** with stagger thresholds at **230 / 115**. These are balancing values, not source-derived stats.
- Mirage Slash applies its displayed -4 opponent Clash Power rule and self-staggers on Clash Lose.
- Azure Rend damages Don's SP instead of HP in this implementation.
- Indigo Blade applies Bleed using the existing status engine. Poise / Track remain partial/future mechanics because the current battle core does not yet model them fully.
- Winning the duel sets `wolfBattleWon`, plays a short post-battle exchange, and returns to the map loop.
- Save resume recognizes the Wolf intro, prep, battle, and post-battle checkpoints.


## V52 — Poise

Wolf now has a functional Poise system. Poise Potency grants 5% Critical chance per point while Poise Count is above 0. A Critical consumes 1 Count; Count also decays by 1 at turn end, and when Count reaches 0 the Potency is cleared. Standard Wolf Criticals gain +20% damage. Indigo Blade uses +100% Critical damage plus +2% per stored Poise Potency (maximum +50% extra), while Mirage Slash uses +200% Critical damage as shown in the supplied skill references. Sever and Shimmering Cleave now build Poise and the HUD displays Potency / Count / current Critical chance.


## V53 NEW GAME FIX

- Fixed a JavaScript module parse error in `js/data/story.js` caused by an unescaped apostrophe in Wolf dialogue (`someone else\'s forest`).
- Updated the `main.js` cache-busting query to `v=53-newgame-fixed`.
- This parse error prevented `main.js` from loading, so the NEW GAME click handler was never attached.


## V54 — Wolf sprite integration

- Integrated the four Wolf sprite sheets supplied by the user into `assets/images/battle/wolf/`.
- Extracted normalized transparent battle frames for idle, hurt, Exhaust, Sever, Indigo Blade, Azure Rend, Shimmering Cleave, and Mirage Slash.
- Wolf now switches to a skill-specific battle sprite when an action resolves, then returns to idle.
- Original sprite sheets are retained in the Wolf asset folder for later frame-by-frame animation work.
- Wolf's visual-novel portrait is scaled to match Don's main-speaker size instead of appearing tiny.
- Preserves V53 NEW GAME fix, V52 Poise, Wolf boss battle, Don/enemy SFX, battle BGM, save/load and modular structure.
