import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOICE_LINE_CATALOG } from '../js/data/voiceLines.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const voiceDir = path.join(projectRoot, 'assets/audio/voice-lines/don-lcb');
const expectedFiles = [
  'battle_select_10301_1.wav',
  'formation_10301_1.wav',
  'battle_allydead_10301_1.wav',
  'battle_s2_10301_1.wav',
  'lobby_noon_10301_1.wav',
  'lobby_night_10301_1.wav',
  'battle_break_10301_1.wav',
  'get_10301_1.wav',
  'battle_endcommand_10301_1.wav',
  'neglect_10301_1.wav',
  'choice_success_p_10301_1.wav',
  'smalltalk_10301_2.wav',
  'choice_fail_n_10301_1.wav',
  'choice_fail_p_10301_1.wav',
  'battleentry_10301_1.wav',
  'battle_kill_10301_1.wav',
  'lobby_morning_10301_1.wav',
  'battle_clear_ex_10301_1.wav',
  'battle_clear_10301_1.wav',
  'battle_defeat_10301_1.wav',
  'smalltalk_10301_1.wav',
  'smalltalk_10301_3.wav',
  'choice_success_n_10301_1.wav',
  'battle_enemy_break_10301_1.wav',
  'battle_s3_10301_1_2.wav',
  'battle_s3_10301_1_1.wav',
  'battle_s3_10301_1_3.wav',
];

for (const name of expectedFiles) {
  const filePath = path.join(voiceDir, name);
  assert.ok(fs.existsSync(filePath), `imported voice asset is missing: ${name}`);
  assert.ok(fs.statSync(filePath).size > 0, `voice asset is empty: ${name}`);
}

assert.equal(VOICE_LINE_CATALOG.don.attacks.gallop[0], 'assets/audio/voice-lines/don-lcb/battle_s2_10301_1.wav');
assert.equal(VOICE_LINE_CATALOG.don.attacks.justice.length, 3);
assert.equal(VOICE_LINE_CATALOG.don.events.encounterStart[0], 'assets/audio/voice-lines/don-lcb/battleentry_10301_1.wav');
assert.equal(VOICE_LINE_CATALOG.don.events.victory.length, 2);
assert.equal(VOICE_LINE_CATALOG.don.ambient.smalltalk.length, 3);

const contentCatalog = JSON.parse(fs.readFileSync(path.join(projectRoot, 'assets/data/limbus-library/catalog.json'), 'utf8'));
const importedRecords = contentCatalog.records.filter((record) =>
  record.type === 'voiceLine' && record.sourceArchive === 'LCB Sinner'
);
assert.equal(importedRecords.length, 27, 'every imported audio file must have one searchable content record');
for (const record of importedRecords) {
  assert.ok(record.assetPaths?.audio, `voice-line record needs an audio asset path: ${record.id}`);
  assert.ok(fs.existsSync(path.join(projectRoot, record.assetPaths.audio)), `content catalogue points to missing audio: ${record.id}`);
}

for (const bucketName of ['attacks', 'events', 'ambient']) {
  for (const bucket of Object.values(VOICE_LINE_CATALOG.don[bucketName] || {})) {
    for (const item of (Array.isArray(bucket) ? bucket : bucket.clips || [])) {
      const src = typeof item === 'string' ? item : item.src;
      if (!src) continue;
      if (src.startsWith('assets/audio/voice-lines/don-lcb/')) {
        assert.ok(fs.existsSync(path.join(projectRoot, src)), `catalogued clip is missing: ${src}`);
      }
    }
  }
}

console.log(`PASS Don voice pack: ${expectedFiles.length} original WAVs, attack/context mappings and ambient catalogue`);
