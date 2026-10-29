import assert from 'node:assert/strict';
import fs from 'node:fs';
const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const mode = fs.readFileSync(new URL('../js/fighting/RealtimeBattleMode.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/realtime-battle.css', import.meta.url), 'utf8');
const catalog = JSON.parse(fs.readFileSync(new URL('../assets/data/limbus-library/catalog.json', import.meta.url), 'utf8'));
assert.match(main, /async function startHeathcliffEncounter\(/, 'Story has a Heathcliff encounter entry');
assert.match(main, /if \(!state\.heathcliffBattleWon\) await startHeathcliffEncounter\(\)/, 'Wolf victory leads to Heathcliff');
assert.match(main, /function makeHeathcliffBattleState\(/, 'Heathcliff has a dedicated battle state');
assert.match(main, /heathcliffBattleWon/, 'Heathcliff result is saved for story progression');
assert.match(mode, /HEATHCLIFF_EGO_CONFIG\.maxGauge/, 'AI checks the full E.G.O gauge');
assert.match(mode, /MOVE_DATA\.heathcliffEgo/, 'AI automatically activates E.G.O');
assert.match(mode, /data-ego-fill/, 'E.G.O meter is displayed in enemy HUD');
assert.match(mode, /#drawEgoCutin\(ctx\)/, 'E.G.O activation cut-in is rendered');
assert.match(css, /\.rt-ego-meter/, 'E.G.O gauge has HUD styling');
for (const id of ['identity.heathcliff.lcb-base','skill.heathcliff.bat-strike','skill.heathcliff.ruthless-swing','ego.heathcliff.ego-burst']) {
  assert.ok(catalog.records.some(record => record.id === id), `Library contains ${id}`);
}
console.log('Heathcliff encounter tests passed.');
