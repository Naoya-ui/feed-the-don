export class AudioManager {
  constructor(audioElement) { this.audio = audioElement; }
  setVolume(value) { if (this.audio) this.audio.volume = Math.max(0, Math.min(1, value)); }
  async play() { try { await this.audio?.play(); } catch (_) {} }
  pause() { this.audio?.pause(); }
}
