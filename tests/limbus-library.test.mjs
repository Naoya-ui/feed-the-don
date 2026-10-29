import assert from 'node:assert/strict';
import { LimbusContentLibrary, LIMBUS_CONTENT_TYPES } from '../js/data/LimbusContentLibrary.js';

const payload = {
  schemaVersion: 1,
  records: [
    { id: 'identity.don.base', type: 'identity', name: 'Don Quixote — Base', tags: ['don', 'base'] },
    { id: 'skill.don.joust', type: 'skill', name: 'Joust', characterId: 'don' },
  ],
};
const storageMap = new Map();
const storage = {
  getItem(key) { return storageMap.has(key) ? storageMap.get(key) : null; },
  setItem(key, value) { storageMap.set(key, value); },
};
const fetchImpl = async () => ({ ok: true, status: 200, json: async () => structuredClone(payload) });
const library = new LimbusContentLibrary({ fetchImpl, storage });
await library.load();
assert.equal(library.get('identity.don.base')?.name, 'Don Quixote — Base');
assert.equal(library.list('skill').length, 1);
assert.equal(library.search('base', { type: 'identity' }).length, 1);
assert.ok(LIMBUS_CONTENT_TYPES.includes('ego'));
const added = library.upsert({ id: 'passive.don.example', type: 'passive', name: 'Example passive', characterId: 'don' });
assert.equal(added.id, 'passive.don.example');
assert.ok(storageMap.size > 0, 'runtime additions persist as browser-local overrides');
const reloaded = new LimbusContentLibrary({ fetchImpl, storage });
await reloaded.load();
assert.equal(reloaded.get('passive.don.example')?.name, 'Example passive', 'local overrides merge on the next load');
assert.equal(reloaded.remove('passive.don.example'), true);
const afterDelete = new LimbusContentLibrary({ fetchImpl, storage });
await afterDelete.load();
assert.equal(afterDelete.get('passive.don.example'), null);
assert.equal(afterDelete.remove('identity.don.base'), true, 'a base record can be hidden by a local tombstone');
const afterBaseDelete = new LimbusContentLibrary({ fetchImpl, storage });
await afterBaseDelete.load();
assert.equal(afterBaseDelete.get('identity.don.base'), null, 'base-record removal survives a reload');
afterBaseDelete.upsert({ id: 'identity.don.base', type: 'identity', name: 'Don Quixote — restored override' });
const afterRestore = new LimbusContentLibrary({ fetchImpl, storage });
await afterRestore.load();
assert.equal(afterRestore.get('identity.don.base')?.name, 'Don Quixote — restored override');
assert.throws(() => library.upsert({ id: 'bad.record', type: 'weapon', name: 'Not supported' }), /Unsupported content type/);
console.log('PASS limbus-library: load, query, type filtering, local additions, persistence and validation');
