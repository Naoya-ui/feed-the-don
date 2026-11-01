/** Web Audio based BGM/SFX engine with decoded-buffer cache, voice caps and duplicate guards. */
export class AudioManager {
  constructor(audioElement = null, { maxVoicesPerSfx = 4, duplicateWindowMs = 35 } = {}) {
    this.audio = audioElement; // backwards-compatible handle for the existing HTMLAudio helper use
    this.maxVoicesPerSfx = maxVoicesPerSfx;
    this.duplicateWindowMs = duplicateWindowMs;
    this.context = null;
    this.master = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.buffers = new Map();
    this.pending = new Map();
    this.voices = new Map();
    this.lastPlayedAt = new Map();
    this.bgmSource = null;
    this.bgmKey = null;
    this.bgmFallback = null;
    this.unlocked = false;
  }

  #ensureContext() {
    if (this.context) return this.context;
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) return null;
    this.context = new Context();
    this.master = this.context.createGain();
    this.bgmGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.bgmGain.connect(this.master);
    this.sfxGain.connect(this.master);
    this.master.connect(this.context.destination);
    this.master.gain.value = 1;
    return this.context;
  }

  /** Call from the first user gesture to comply with browser autoplay restrictions. */
  async unlock() {
    const context = this.#ensureContext();
    if (context?.state === 'suspended') await context.resume().catch(() => {});
    this.unlocked = true;
    return !!context;
  }

  setVolume(value) {
    this.setMasterVolume(value);
  }
  setMasterVolume(value) {
    if (this.#ensureContext()) this.master.gain.value = this.#clamp(value);
    if (this.audio) this.audio.volume = this.#clamp(value);
  }
  setBgmVolume(value) {
    if (!this.#ensureContext()) return;
    const target = this.#clamp(value);
    if (this.bgmTrack?.gain)
      this.bgmTrack.gain.gain.setTargetAtTime(target, this.context.currentTime, 0.025);
    else this.bgmGain.gain.value = target;
  }
  setSfxVolume(value) {
    if (this.#ensureContext()) this.sfxGain.gain.value = this.#clamp(value);
  }
  #clamp(value) {
    const n = Number(value);
    return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 1));
  }

  async loadSfx(key, url) {
    if (this.buffers.has(key)) return this.buffers.get(key);
    if (this.pending.has(key)) return this.pending.get(key);
    const task = (async () => {
      const context = this.#ensureContext();
      if (!context) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Audio HTTP ${response.status}: ${url}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        this.buffers.set(key, buffer);
        return buffer;
      } catch (error) {
        console.warn(`[AudioManager] Could not load ${key}`, error);
        return null;
      } finally {
        this.pending.delete(key);
      }
    })();
    this.pending.set(key, task);
    return task;
  }

  async preloadSfx(entries = {}) {
    await Promise.all(Object.entries(entries).map(([key, url]) => this.loadSfx(key, url)));
  }

  async playBGM(key, url, { volume = 0.55, loop = true, fadeSeconds = 0.45 } = {}) {
    if (this.bgmKey === key && (this.bgmSource || this.bgmFallback)) return;
    this.stopBGM(fadeSeconds);
    this.bgmKey = key;
    const context = this.#ensureContext();
    if (context?.state === 'suspended') await context.resume().catch(() => {});
    if (!context) {
      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = this.#clamp(volume);
      this.bgmFallback = audio;
      try {
        await audio.play();
      } catch {}
      return;
    }
    const buffer = await this.loadSfx(`bgm:${key}`, url);
    if (!buffer || this.bgmKey !== key) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(
      this.#clamp(volume),
      context.currentTime + Math.max(0.01, fadeSeconds)
    );
    source.connect(gain);
    gain.connect(this.bgmGain);
    source.start();
    this.bgmSource = source;
    this.bgmTrack = { source, gain };
  }

  stopBGM(fadeSeconds = 0.25) {
    this.bgmKey = null;
    if (this.bgmFallback) {
      this.bgmFallback.pause();
      this.bgmFallback.src = '';
      this.bgmFallback = null;
    }
    if (this.bgmSource && this.context) {
      const source = this.bgmSource;
      this.bgmSource = null;
      const duration = Math.max(0, fadeSeconds);
      try {
        if (this.bgmTrack?.source === source) {
          this.bgmTrack.gain.gain.cancelScheduledValues(this.context.currentTime);
          this.bgmTrack.gain.gain.setTargetAtTime(
            0,
            this.context.currentTime,
            Math.max(0.01, duration / 4)
          );
        }
        source.stop(this.context.currentTime + duration);
      } catch {
        try {
          source.stop();
        } catch {}
      }
      if (this.bgmTrack?.source === source) this.bgmTrack = null;
    }
  }

  async playSFX(
    key,
    url,
    {
      volume = 1,
      rate = 1,
      maxVoices = this.maxVoicesPerSfx,
      minIntervalMs = this.duplicateWindowMs,
    } = {}
  ) {
    const now = globalThis.performance?.now?.() ?? Date.now();
    if (now - (this.lastPlayedAt.get(key) ?? -Infinity) < minIntervalMs) return false;
    this.lastPlayedAt.set(key, now);
    const context = this.#ensureContext();
    if (context?.state === 'suspended') await context.resume().catch(() => {});
    if (!context) {
      const voice = new Audio(url);
      voice.volume = this.#clamp(volume);
      voice.playbackRate = rate;
      voice.play().catch(() => {});
      return true;
    }
    const buffer = await this.loadSfx(`sfx:${key}`, url);
    if (!buffer) return false;
    let active = (this.voices.get(key) || []).filter((voice) => voice.source && !voice.ended);
    if (active.length >= maxVoices) {
      const oldest = active.shift();
      try {
        oldest.gain.gain.setTargetAtTime(0, context.currentTime, 0.012);
        oldest.source.stop(context.currentTime + 0.04);
      } catch {}
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const gain = context.createGain();
    gain.gain.value = this.#clamp(volume);
    source.connect(gain);
    gain.connect(this.sfxGain);
    const voice = { source, gain, ended: false };
    source.onended = () => {
      voice.ended = true;
      this.voices.set(
        key,
        (this.voices.get(key) || []).filter((item) => item !== voice)
      );
    };
    active.push(voice);
    this.voices.set(key, active);
    source.start();
    return true;
  }

  async play() {
    try {
      await this.audio?.play();
    } catch {}
  }
  pause() {
    this.audio?.pause();
  }
  dispose() {
    this.stopBGM(0);
    for (const voices of this.voices.values())
      for (const voice of voices) {
        try {
          voice.source.stop();
        } catch {}
      }
    this.voices.clear();
    this.context?.close?.();
    this.context = null;
  }
}

export default AudioManager;
