import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const realtime = readFileSync(new URL('../js/fighting/RealtimeBattleMode.js', import.meta.url), 'utf8');
const fighter = readFileSync(new URL('../js/fighting/Fighter.js', import.meta.url), 'utf8');

const requiredMainButtons = ['storyModeBtn', 'versusModeBtn', 'trainingModeBtn', 'settingsModeBtn'];
for (const id of requiredMainButtons) assert.match(html, new RegExp(`id=\"${id}\"`), `${id} exists in the main menu`);
assert.match(html, /id=\"mainMenuView\"[\s\S]*?id=\"storyModeBtn\"[\s\S]*?id=\"settingsModeBtn\"/, 'the title screen is a mode-selection menu');
assert.match(html, /id=\"storyModeView\"[\s\S]*?id=\"newGameBtn\"[\s\S]*?id=\"continueBtn\"[\s\S]*?id=\"storyBackBtn\"/, 'New Game and Continue live inside Story Mode');
assert.doesNotMatch(html, /id=\"rtAutoDuel\"|id=\"rtDebugBoxes\"/, 'battle HUD no longer exposes auto battle or a hitbox checkbox');
assert.match(html, /id=\"showHitboxSettingRow\"[^>]*hidden[\s\S]*?id=\"showHitboxSetting\"/, 'hitbox toggle is in the Settings modal and hidden by default');
assert.match(main, /els\.showHitboxSettingRow\.hidden = !realtimeBattleActive/, 'hitbox option is shown only during real-time combat');
assert.match(main, /startStandaloneRealtime\(\"versus\", config\)/, 'Versus launches selected local multiplayer loadouts');
assert.match(main, /startStandaloneRealtime\(\"training\"\)/, 'Training launches the practice arena');
assert.match(realtime, /this\.standaloneMode && this\.input\.consumePress\('escape'\)/, 'Escape exits standalone modes');
assert.doesNotMatch(realtime, /autoDuel|AUTO DUEL|AUTO BATTLE SIMULATION/, 'automatic player control was removed from the real-time engine');

console.log('PASS menu-structure: Story Mode submenu, Versus, Training, Settings-only debug toggle, no auto battle');

assert.match(main, /localMultiplayer: true/, 'Versus selection enables local multiplayer');
assert.match(main, /KEY_BINDINGS_STORAGE_KEY/, 'keyboard bindings persist in settings');
assert.match(main, /CONTROLLER_STORAGE_KEY/, 'controller settings persist in settings');
assert.match(realtime, /team: isPlayer2 \? 'player2' : 'enemy'/, 'second Versus slot is controlled by player two, not AI');
assert.match(realtime, /GamepadInputAdapter/, 'controller input is wired into the real-time fight');
assert.match(realtime, /enemy\.update\(dt, this\.input, ARENA_BOUNDS\)/, 'Player 2 consumes keyboard/gamepad input instead of AI');
assert.match(fighter, /this\.egoEquipped && this\.egoMoveData && this\.egoMeter >= this\.egoMeterMax/, 'selected compatible E.G.O is used only when gauge is full');
assert.match(main, /globalSettingsButton\.hidden = !!\(els\.battleLoading && !els\.battleLoading\.hidden\)/, 'global Settings button is hidden only during loading');
