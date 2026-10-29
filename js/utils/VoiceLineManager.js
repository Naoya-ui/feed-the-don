/**
 * Reusable voice-line playback for real-time combat.
 * Audio is prepared once as templates, then cloned per play so a new line does not
 * rewind or cut off another currently playing line. Missing/empty buckets are no-ops.
 */
export class VoiceLineManager {
  constructor({ catalog = {}, volumeProvider = () => 1, enabledProvider = () => true, audioFactory = null } = {}) {
    this.catalog = catalog;
    this.volumeProvider = volumeProvider;
    this.enabledProvider = enabledProvider;
    this.audioFactory = audioFactory || ((src) => new Audio(src));
    this.templates = new Map();
    this.active = new Set();
    this.lastIndex = new Map();
    this.cooldownUntil = new Map();
    this.enabled = true;
    this.#indexCatalog();
  }

  #indexCatalog() {
    if (typeof this.audioFactory !== 'function') return;
    for (const character of Object.values(this.catalog || {})) {
      for (const bucketName of ['attacks', 'events', 'ambient']) {
        for (const entry of Object.values(character?.[bucketName] || {})) {
          const clips = Array.isArray(entry) ? entry : entry?.clips || [];
          for (const clip of clips) {
            const src = typeof clip === 'string' ? clip : clip?.src;
            if (!src || this.templates.has(src)) continue;
            try {
              const audio = this.audioFactory(src);
              audio.preload = 'auto';
              this.templates.set(src, audio);
            } catch {
              // Unsupported Audio implementations (e.g. a test runner) are ignored safely.
            }
          }
        }
      }
    }
  }

  setEnabled(enabled) { this.enabled = !!enabled; }

  playAttack(characterId, skillId, options = {}) {
    return this.#playBucket(characterId, 'attacks', skillId, options);
  }

  playEvent(characterId, eventId, options = {}) {
    return this.#playBucket(characterId, 'events', eventId, options);
  }

  /** Lobby / idle voice lines are separate from combat reactions. */
  playAmbient(characterId, ambientId, options = {}) {
    return this.#playBucket(characterId, 'ambient', ambientId, options);
  }

  #playBucket(characterId, bucketName, key, options) {
    if (!this.enabled || !this.enabledProvider()) return false;
    const character = this.catalog?.[characterId];
    const bucket = character?.[bucketName]?.[key];
    const clips = (Array.isArray(bucket) ? bucket : bucket?.clips || [])
      .map((clip) => typeof clip === 'string' ? { src: clip } : clip)
      .filter((clip) => clip?.src && typeof clip.src === 'string');
    if (!clips.length) return false;

    const cooldownKey = `${characterId}:${bucketName}:${key}`;
    const now = Date.now();
    if (now < (this.cooldownUntil.get(cooldownKey) || 0)) return false;
    const cooldownMs = Math.max(0, Number(options.cooldownMs ?? bucket?.cooldownMs ?? 0));
    if (cooldownMs) this.cooldownUntil.set(cooldownKey, now + cooldownMs);

    let index;
    if (Number.isInteger(options.index)) {
      index = Math.max(0, Math.min(clips.length - 1, options.index));
    } else {
      const previous = this.lastIndex.get(cooldownKey) ?? -1;
      index = (previous + 1) % clips.length;
    }
    this.lastIndex.set(cooldownKey, index);
    const clip = clips[index];
    return this.#playSource(clip.src, {
      volume: options.volume ?? clip.volume ?? bucket?.volume ?? 1,
      playbackRate: options.playbackRate ?? clip.playbackRate ?? 1,
    });
  }

  #playSource(src, { volume = 1, playbackRate = 1 } = {}) {
    let template = this.templates.get(src);
    if (!template) {
      try {
        template = this.audioFactory(src);
        template.preload = 'auto';
        this.templates.set(src, template);
      } catch {
        return false;
      }
    }
    let audio;
    try {
      audio = template.cloneNode(true);
    } catch {
      // Some minimal Audio mocks do not expose cloneNode; create a fresh element instead.
      try { audio = this.audioFactory(src); } catch { return false; }
    }
    const master = Number(this.volumeProvider());
    audio.volume = Math.max(0, Math.min(1, (Number.isFinite(master) ? master : 1) * Number(volume)));
    audio.playbackRate = Math.max(0.5, Math.min(1.5, Number(playbackRate) || 1));
    this.active.add(audio);
    const cleanup = () => this.active.delete(audio);
    audio.addEventListener?.('ended', cleanup, { once: true });
    audio.addEventListener?.('error', cleanup, { once: true });
    try {
      const result = audio.play?.();
      if (result && typeof result.catch === 'function') result.catch(cleanup);
    } catch {
      cleanup();
      return false;
    }
    return true;
  }

  stopAll() {
    for (const audio of this.active) {
      try { audio.pause?.(); audio.currentTime = 0; } catch { /* ignore cleanup errors */ }
    }
    this.active.clear();
  }
}
