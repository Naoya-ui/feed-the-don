const ALLOWED_TYPES = new Set([
  'character',
  'identity',
  'ego',
  'skill',
  'passive',
  'enemy',
  'status',
  'stage',
  'asset',
  'voiceLine',
]);
const DEFAULT_STORAGE_KEY = 'raise-don-quixote.limbus-library-overrides.v1';

/**
 * Loads the editable local JSON catalogue and supports runtime additions for modding.
 * Runtime additions are saved to localStorage; permanent game data should be committed
 * to assets/data/limbus-library/catalog.json instead.
 */
export class LimbusContentLibrary {
  constructor({
    url = 'assets/data/limbus-library/catalog.json',
    fetchImpl = (...args) => fetch(...args),
    storage = null,
    storageKey = DEFAULT_STORAGE_KEY,
  } = {}) {
    this.url = url;
    this.fetchImpl = fetchImpl;
    try {
      this.storage = storage || globalThis.localStorage || null;
    } catch {
      this.storage = null;
    }
    this.storageKey = storageKey;
    this.records = new Map();
    this.overrides = new Map();
    this.removedIds = new Set();
    this.loaded = false;
    this.loadError = null;
  }

  async load() {
    let payload;
    try {
      const response = await this.fetchImpl(this.url, { cache: 'no-cache' });
      if (!response?.ok)
        throw new Error(`Catalogue request failed (${response?.status ?? 'no response'}).`);
      payload = await response.json();
    } catch (error) {
      this.loadError = error;
      throw new Error(`Could not load Limbus content catalogue at ${this.url}: ${error.message}`);
    }
    if (!payload || payload.schemaVersion !== 1 || !Array.isArray(payload.records)) {
      throw new TypeError(
        'Invalid Limbus catalogue: expected schemaVersion 1 and a records array.'
      );
    }

    this.records.clear();
    for (const record of payload.records) {
      this.#validate(record);
      this.records.set(record.id, structuredClone(record));
    }
    this.#loadOverrides();
    for (const id of this.removedIds) this.records.delete(id);
    for (const [id, record] of this.overrides) this.records.set(id, structuredClone(record));
    this.loaded = true;
    this.loadError = null;
    return this;
  }

  #validate(record) {
    if (!record || typeof record !== 'object')
      throw new TypeError('A content record must be an object.');
    if (typeof record.id !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/i.test(record.id)) {
      throw new TypeError(
        'Content record id must be a stable non-empty ID using letters, digits, dot, underscore or hyphen.'
      );
    }
    if (!ALLOWED_TYPES.has(record.type))
      throw new TypeError(`Unsupported content type: ${record.type}`);
    if (typeof record.name !== 'string' || !record.name.trim())
      throw new TypeError(`Content record ${record.id} needs a name.`);
    if (
      record.assetPaths != null &&
      (typeof record.assetPaths !== 'object' || Array.isArray(record.assetPaths))
    ) {
      throw new TypeError(`assetPaths on ${record.id} must be an object of path strings.`);
    }
    return record;
  }

  #loadOverrides() {
    this.overrides.clear();
    this.removedIds.clear();
    try {
      const raw = this.storage?.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Accept the first array format for backward compatibility with an early prototype.
      const records = Array.isArray(parsed) ? parsed : parsed?.records;
      const removedIds = Array.isArray(parsed?.removedIds) ? parsed.removedIds : [];
      for (const id of removedIds) if (typeof id === 'string') this.removedIds.add(id);
      if (!Array.isArray(records)) return;
      for (const record of records) {
        try {
          this.#validate(record);
          this.overrides.set(record.id, record);
        } catch {
          /* ignore corrupt local record */
        }
      }
    } catch {
      /* storage can be disabled; the static catalogue still works */
    }
  }

  get(id) {
    return this.records.get(String(id)) || null;
  }

  list(type = null) {
    const values = [...this.records.values()];
    return values
      .filter((record) => !type || record.type === type)
      .map((record) => structuredClone(record));
  }

  search(query, { type = null, limit = 100 } = {}) {
    const q = String(query || '')
      .trim()
      .toLocaleLowerCase();
    if (!q) return this.list(type).slice(0, Math.max(0, limit));
    return this.list(type)
      .filter((record) => {
        const text = [
          record.id,
          record.name,
          record.characterId,
          ...(record.tags || []),
          ...(record.aliases || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();
        return text.includes(q);
      })
      .slice(0, Math.max(0, limit));
  }

  upsert(record) {
    this.#validate(record);
    const copy = structuredClone(record);
    this.records.set(copy.id, copy);
    this.overrides.set(copy.id, copy);
    this.removedIds.delete(copy.id);
    this.#persistOverrides();
    return structuredClone(copy);
  }

  remove(id) {
    const key = String(id);
    const existed = this.records.delete(key);
    if (!existed) return false;
    this.overrides.delete(key);
    this.removedIds.add(key);
    this.#persistOverrides();
    return true;
  }

  #persistOverrides() {
    try {
      this.storage?.setItem(
        this.storageKey,
        JSON.stringify({ records: [...this.overrides.values()], removedIds: [...this.removedIds] })
      );
    } catch (error) {
      console.warn('[LimbusContentLibrary] Could not persist local overrides:', error);
    }
  }

  exportJSON() {
    return JSON.stringify({ schemaVersion: 1, records: this.list() }, null, 2);
  }
}

export const LIMBUS_CONTENT_TYPES = Object.freeze([...ALLOWED_TYPES]);
