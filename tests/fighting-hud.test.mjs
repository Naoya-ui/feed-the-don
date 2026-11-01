import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { getSkillIconForMove, getSkillShortLabel } from '../js/fighting/RealtimeBattleMode.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const html = read('index.html');
const css = read('css/realtime-battle.css');
const mode = read('js/fighting/RealtimeBattleMode.js');

assert.match(
  html,
  /id="rtPlayerSkillHistory"[^>]*class="rt-skill-history"/,
  'player skill-history strip exists under the health bar'
);
assert.match(
  mode,
  /data-skill-history/,
  'opponent skill-history strip is generated for every fighter'
);
assert.match(
  mode,
  /this\.#recordSkillUse\(fighter, move\)/,
  'move starts are recorded in the HUD history'
);
assert.match(mode, /history\.length > 4/, 'history stays compact and bounded');
assert.match(
  css,
  /\.rt-hp-track\s*\{[^}]*height:\s*20px/s,
  'desktop health bars are visibly larger'
);
assert.match(css, /\.rt-skill-chip\.is-latest/, 'most recent skill icon is highlighted');

const checks = [
  ['don', { id: 'light', name: 'Joust' }, 'joust-icon.png', 'S1'],
  ['don', { id: 'heavy', name: 'Gallop' }, 'gallop-icon.png', 'S2'],
  ['don', { id: 'special', name: 'Justice' }, 'justice-icon.png', 'S3'],
  ['don', { id: 'donEgo', name: 'La Sangre de Sancho', isEgo: true }, 'justice-badge.png', 'EGO'],
  ['heathcliff', { id: 'heathcliffSkill1', name: 'Bat Strike' }, 'skill1_1.png', 'S1'],
  ['heathcliff', { id: 'heathcliffSkill2', name: 'Ruthless Swing' }, 'skill2_1.png', 'S2'],
  ['heathcliff', { id: 'heathcliffEgo', name: 'E.G.O Burst' }, 'ego-sigil.png', 'EGO'],
  [
    'heathcliff',
    { id: 'heathcliffBodysack', name: 'Bodysack · Base Form E.G.O', isEgo: true },
    '20701_awaken_profile.png',
    'EGO',
  ],
  ['wolf', { id: 'wolfSlash', name: 'Wolf Slash' }, 'indigo-blade.png', 'ATK'],
];
for (const [drawKey, move, fileName, shortLabel] of checks) {
  const icon = getSkillIconForMove(drawKey, move);
  assert.ok(icon.endsWith(fileName), `${drawKey} ${move.name} maps to ${fileName}`);
  assert.ok(existsSync(new URL(`../${icon}`, import.meta.url)), `icon exists: ${icon}`);
  assert.equal(
    getSkillShortLabel(drawKey, move),
    shortLabel,
    `${drawKey} ${move.name} has a compact HUD label`
  );
}

console.log(
  'PASS fighting-hud: large life bars, recent skill icons, character-specific move icon mapping'
);
