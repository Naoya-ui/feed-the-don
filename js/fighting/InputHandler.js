/**
 * Frame-buffered keyboard / virtual input adapter.
 * Canonical key names are lowercase KeyboardEvent.key values, except arrows and numpad
 * keys which are preserved (`arrowleft`, `numpad1`, etc.) so two local players do not
 * accidentally share the same movement bindings.
 */
const SUPPORTED_KEYS = new Set([
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''),
  'space',
  'escape',
  'arrowleft',
  'arrowright',
  'arrowup',
  'arrowdown',
  ...Array.from({ length: 10 }, (_, i) => `numpad${i}`),
  'enter',
  'backspace',
  'tab',
  'delete',
  'home',
  'end',
  'pageup',
  'pagedown',
]);
const ALIASES = new Map([
  [' ', 'space'],
  ['Spacebar', 'space'],
  ['Space', 'space'],
  ['ArrowLeft', 'arrowleft'],
  ['ArrowRight', 'arrowright'],
  ['ArrowUp', 'arrowup'],
  ['ArrowDown', 'arrowdown'],
  ['Escape', 'escape'],
  ['Enter', 'enter'],
]);

export function normalizeKey(eventOrKey) {
  if (typeof eventOrKey === 'string') {
    return ALIASES.get(eventOrKey) || eventOrKey.toLowerCase();
  }
  const event = eventOrKey || {};
  if (typeof event.code === 'string' && /^Numpad\d$/.test(event.code))
    return event.code.toLowerCase();
  if (typeof event.code === 'string' && /^Arrow(Left|Right|Up|Down)$/.test(event.code))
    return event.code.toLowerCase();
  const raw = event.key ?? '';
  return ALIASES.get(raw) || String(raw).toLowerCase();
}

export function displayKey(key) {
  const value = normalizeKey(key);
  const names = {
    space: 'SPACE',
    escape: 'ESC',
    arrowleft: '←',
    arrowright: '→',
    arrowup: '↑',
    arrowdown: '↓',
    numpad0: 'NUM 0',
    numpad1: 'NUM 1',
    numpad2: 'NUM 2',
    numpad3: 'NUM 3',
    numpad4: 'NUM 4',
    numpad5: 'NUM 5',
    numpad6: 'NUM 6',
    numpad7: 'NUM 7',
    numpad8: 'NUM 8',
    numpad9: 'NUM 9',
  };
  return names[value] || value.toUpperCase();
}

export class InputHandler {
  constructor({ target = globalThis.window, bufferFrames = 8, preventDefault = true } = {}) {
    this.target = target;
    this.bufferFrames = Math.max(0, Math.floor(bufferFrames));
    this.preventDefault = preventDefault;
    this.physicalHeld = new Set();
    this.virtualHeld = new Set();
    this.held = new Set(); // union of keyboard and gamepad-fed keys
    this.buffer = [];
    this.frame = 0;
    this.sequence = 0;
    this.disposed = false;
    this._onKeyDown = (event) => {
      const key = normalizeKey(event);
      if (!SUPPORTED_KEYS.has(key)) return;
      if (
        this.preventDefault &&
        (key.length === 1 || key.startsWith('arrow') || key.startsWith('numpad') || key === 'space')
      ) {
        event.preventDefault?.();
      }
      if (event.repeat || this.physicalHeld.has(key)) return;
      this.physicalHeld.add(key);
      this.#refreshHeld(key, true);
    };
    this._onKeyUp = (event) => {
      const key = normalizeKey(event);
      this.physicalHeld.delete(key);
      this.#refreshHeld(key, false);
    };
    this._onBlur = () => this.clear();
    this.target?.addEventListener?.('keydown', this._onKeyDown);
    this.target?.addEventListener?.('keyup', this._onKeyUp);
    this.target?.addEventListener?.('blur', this._onBlur);
  }

  #refreshHeld(key, fromPress) {
    const wasHeld = this.held.has(key);
    const isHeld = this.physicalHeld.has(key) || this.virtualHeld.has(key);
    if (isHeld) this.held.add(key);
    else this.held.delete(key);
    if (fromPress && !wasHeld && isHeld) {
      this.buffer.push({
        key,
        pressedAt: this.frame,
        expiresAt: this.frame + this.bufferFrames,
        sequence: ++this.sequence,
      });
    }
  }

  /** Feed a logical key from a gamepad while retaining real-keyboard state independently. */
  setVirtualKey(key, down) {
    const normalized = normalizeKey(key);
    const wasVirtual = this.virtualHeld.has(normalized);
    if (down && !wasVirtual) this.virtualHeld.add(normalized);
    else if (!down && wasVirtual) this.virtualHeld.delete(normalized);
    if (down && !wasVirtual) this.#refreshHeld(normalized, true);
    else this.#refreshHeld(normalized, false);
  }

  isHeld(key) {
    return this.held.has(normalizeKey(key));
  }

  consumePress(key) {
    const normalized = normalizeKey(key);
    const index = this.buffer.findIndex(
      (entry) => entry.key === normalized && entry.expiresAt >= this.frame
    );
    if (index < 0) return false;
    this.buffer.splice(index, 1);
    return true;
  }

  hasBufferedPress(key) {
    const normalized = normalizeKey(key);
    return this.buffer.some((entry) => entry.key === normalized && entry.expiresAt >= this.frame);
  }

  advanceFrame() {
    this.frame += 1;
    this.buffer = this.buffer.filter((entry) => entry.expiresAt >= this.frame);
  }

  clearBuffer() {
    this.buffer.length = 0;
  }

  clear() {
    this.physicalHeld.clear();
    this.virtualHeld.clear();
    this.held.clear();
    this.clearBuffer();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();
    this.target?.removeEventListener?.('keydown', this._onKeyDown);
    this.target?.removeEventListener?.('keyup', this._onKeyUp);
    this.target?.removeEventListener?.('blur', this._onBlur);
  }
}
