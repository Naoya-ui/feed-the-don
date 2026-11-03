import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const realtime = readFileSync(
  new URL('../js/fighting/RealtimeBattleMode.js', import.meta.url),
  'utf8'
);
const fighter = readFileSync(new URL('../js/fighting/Fighter.js', import.meta.url), 'utf8');
const characterSelect = readFileSync(new URL('../js/ui/CharacterSelect.js', import.meta.url), 'utf8');
const realtimeCss = readFileSync(new URL('../css/realtime-battle.css', import.meta.url), 'utf8');
const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const requiredMainButtons = ['storyModeBtn', 'versusModeBtn', 'trainingModeBtn', 'settingsModeBtn'];
for (const id of requiredMainButtons)
  assert.match(html, new RegExp(`id=\"${id}\"`), `${id} exists in the main menu`);
assert.match(
  html,
  /id=\"mainMenuView\"[\s\S]*?id=\"storyModeBtn\"[\s\S]*?id=\"settingsModeBtn\"/,
  'the title screen is a mode-selection menu'
);
assert.match(
  html,
  /id=\"storyModeView\"[\s\S]*?id=\"newGameBtn\"[\s\S]*?id=\"continueBtn\"[\s\S]*?id=\"storyBackBtn\"/,
  'New Game and Continue live inside Story Mode'
);
assert.doesNotMatch(
  html,
  /id=\"rtAutoDuel\"|id=\"rtDebugBoxes\"/,
  'battle HUD no longer exposes auto battle or a hitbox checkbox'
);
assert.match(
  html,
  /id=\"showHitboxSettingRow\"[^>]*hidden[\s\S]*?id=\"showHitboxSetting\"/,
  'hitbox toggle is in the Settings modal and hidden by default'
);
assert.match(
  main,
  /els\.showHitboxSettingRow\.hidden = !realtimeBattleActive/,
  'hitbox option is shown only during real-time combat'
);
assert.match(
  main,
  /startStandaloneRealtime\('versus', config, \{ skipLoading: true \}\)/,
  'Versus selection adapts locked P1/P2 loadouts into combat after the VS intro'
);
assert.match(
  main,
  /new CharacterSelect\(/,
  'Versus uses the dedicated dual-cursor CharacterSelect module'
);
assert.match(html, /css\/style\.css\?v=melty-versus-loading-v4/, 'Versus CSS changes use a fresh cache-busting version');
assert.match(styleCss, /\.lc60-versus-center\s*\{[^}]*inset:\s*0;/, 'VS overlay fills the loading screen so its title can center on the viewport');
assert.match(styleCss, /\.lc60-versus-center > span\s*\{[^}]*left:\s*50%;[^}]*top:\s*50%;/, 'VS title is anchored at the exact center');
assert.match(styleCss, /@keyframes lc60VersusReveal[\s\S]*?opacity:\s*0;[\s\S]*?scale\(0\.24\)/, 'VS title fades and scales in from its center');
assert.match(characterSelect, /character\.idleSprite \|\| character\.avatar/, 'grid prefers character idle sprites');
assert.match(characterSelect, /selectedEgo\?\.icon \|\| character\.idleSprite/, 'E.G.O preview uses a static icon, never the animated preview');
assert.doesNotMatch(characterSelect, /selectedEgo\?\.icon \|\| selectedEgo\?\.preview/, 'animated E.G.O preview GIFs are not displayed in Phase 2');
assert.match(realtimeCss, /@keyframes mbCharacterIdleBreath/, 'idle sprites gently breathe in the select grid');
assert.match(
  main,
  /startStandaloneRealtime\(['\"]training['\"]\)/,
  'Training launches the practice arena'
);
assert.match(
  realtime,
  /this\.standaloneMode && this\.input\.consumePress\('escape'\)/,
  'Escape exits standalone modes'
);
assert.doesNotMatch(
  realtime,
  /autoDuel|AUTO DUEL|AUTO BATTLE SIMULATION/,
  'automatic player control was removed from the real-time engine'
);

console.log(
  'PASS menu-structure: Story Mode submenu, Versus, Training, Settings-only debug toggle, no auto battle'
);

assert.match(main, /localMultiplayer: true/, 'Versus selection enables local multiplayer');
assert.match(main, /KEY_BINDINGS_STORAGE_KEY/, 'keyboard bindings persist in settings');
assert.match(main, /CONTROLLER_STORAGE_KEY/, 'controller settings persist in settings');
assert.match(
  realtime,
  /team: isPlayer2 \? 'player2' : 'enemy'/,
  'second Versus slot is controlled by player two, not AI'
);
assert.match(realtime, /GamepadInputAdapter/, 'controller input is wired into the real-time fight');
assert.match(
  realtime,
  /enemy\.update\(dt, this\.input, ARENA_BOUNDS\)/,
  'Player 2 consumes keyboard/gamepad input instead of AI'
);
assert.match(
  fighter,
  /this\.egoEquipped && this\.egoMoveData && this\.egoMeter >= this\.egoMeterMax/,
  'selected compatible E.G.O is used only when gauge is full'
);
assert.match(
  main,
  /globalSettingsButton\.hidden = !!\(els\.battleLoading && !els\.battleLoading\.hidden\)/,
  'global Settings button is hidden only during loading'
);
assert.match(html, /class="lc60-versus-loading"/, 'versus loading has its own animated match-up scene');
assert.match(html, /versusLoadingP1Name[\s\S]*versusLoadingP2Name/, 'versus loading labels both selected fighters');
assert.match(main, /classList\.toggle\('is-versus-loading', versus\)/, 'versus loading activates its dedicated theme');
assert.match(main, /async function showVersusScreen\(p1, p2, initCombatScene/, 'VS transition awaits before combat initialization');
assert.match(main, /versusLoadingP1Ego/, 'loading scene shows the selected E.G.O names');
const style = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
assert.match(style, /@keyframes lc60VersusSlideP1/, 'P1 full-body art slides in from the left');
assert.match(style, /@keyframes lc60VersusSlideP2/, 'P2 full-body art slides in from the right');
