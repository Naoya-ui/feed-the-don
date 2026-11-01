/** Fixed-step game loop. Simulation runs at a deterministic rate; rendering interpolates. */
export class GameLoop {
  constructor({
    update,
    render,
    fixedDelta = 1 / 60,
    maxFrameDelta = 0.1,
    maxSubSteps = 5,
    raf = globalThis.requestAnimationFrame?.bind(globalThis),
    caf = globalThis.cancelAnimationFrame?.bind(globalThis),
    now = () => globalThis.performance?.now?.() ?? Date.now(),
  } = {}) {
    if (typeof update !== 'function' || typeof render !== 'function') {
      throw new TypeError('GameLoop requires update(dt) and render(alpha, frameDelta) callbacks.');
    }
    if (typeof raf !== 'function')
      throw new Error('requestAnimationFrame is not available. Run this game in a browser.');
    this.updateCallback = update;
    this.renderCallback = render;
    this.fixedDelta = Math.max(1 / 240, fixedDelta);
    this.maxFrameDelta = Math.max(this.fixedDelta, maxFrameDelta);
    this.maxSubSteps = Math.max(1, Math.floor(maxSubSteps));
    this.raf = raf;
    this.caf = caf;
    this.now = now;
    this.running = false;
    this.rafId = null;
    this.lastTime = null;
    this.accumulator = 0;
    this.simulationFrames = 0;
    this.fps = 0;
    this._fpsFrames = 0;
    this._fpsElapsed = 0;
    this._tick = (timestamp) => this.#tick(timestamp);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = null;
    this.accumulator = 0;
    this.rafId = this.raf(this._tick);
  }

  stop() {
    this.running = false;
    if (this.rafId != null && typeof this.caf === 'function') this.caf(this.rafId);
    this.rafId = null;
    this.lastTime = null;
    this.accumulator = 0;
  }

  #tick(timestamp) {
    if (!this.running) return;
    const current = Number.isFinite(timestamp) ? timestamp : this.now();
    if (this.lastTime == null) this.lastTime = current;
    const rawDelta = Math.max(0, (current - this.lastTime) / 1000);
    const frameDelta = Math.min(rawDelta, this.maxFrameDelta);
    this.lastTime = current;
    this.accumulator += frameDelta;

    let steps = 0;
    while (this.running && this.accumulator >= this.fixedDelta && steps < this.maxSubSteps) {
      this.updateCallback(this.fixedDelta, this.simulationFrames);
      this.accumulator -= this.fixedDelta;
      this.simulationFrames += 1;
      steps += 1;
    }
    // Drop excess whole steps after a long stall; preserve the fractional remainder.
    if (steps === this.maxSubSteps && this.accumulator >= this.fixedDelta) {
      this.accumulator %= this.fixedDelta;
    }

    if (!this.running) return;
    this.renderCallback(this.accumulator / this.fixedDelta, frameDelta);
    this._fpsFrames += 1;
    this._fpsElapsed += rawDelta;
    if (this._fpsElapsed >= 0.5) {
      this.fps = this._fpsFrames / this._fpsElapsed;
      this._fpsFrames = 0;
      this._fpsElapsed = 0;
    }
    if (this.running) this.rafId = this.raf(this._tick);
  }
}
