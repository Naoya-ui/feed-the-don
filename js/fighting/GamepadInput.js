/** Maps one standard Gamepad API controller to the selected local fighter's action keys. */
export class GamepadInputAdapter {
  constructor({ getGamepads = () => globalThis.navigator?.getGamepads?.() || [] } = {}) {
    this.getGamepads = getGamepads;
    this.previousKeys = new Set();
    this.previousInput = null;
    this.lastGamepadId = '';
  }

  update({ input, controls, settings = {} } = {}) {
    if (!input || !controls) return { connected: false, id: '', slot: -1 };
    const pads = Array.from(this.getGamepads?.() || []);
    const requestedIndex = Number.isInteger(Number(settings.index)) ? Number(settings.index) : -1;
    const gamepad =
      requestedIndex >= 0
        ? pads.find((pad) => pad && pad.connected && pad.index === requestedIndex)
        : pads.find((pad) => pad && pad.connected);

    if (this.previousInput && this.previousInput !== input) this.#release(this.previousInput);
    this.previousInput = input;
    const nextKeys = new Set();
    if (gamepad) {
      const deadzone = Math.max(0.15, Math.min(0.8, Number(settings.deadzone) || 0.35));
      const axes = gamepad.axes || [];
      const buttons = gamepad.buttons || [];
      const pressed = (index) => !!buttons[Number(index)]?.pressed;
      const axesLeft = Number(axes[0]) < -deadzone;
      const axesRight = Number(axes[0]) > deadzone;
      const down = pressed(13) || Number(axes[1]) > deadzone;
      const up = pressed(12) || Number(axes[1]) < -deadzone;
      if (axesLeft || pressed(14)) nextKeys.add(controls.left);
      if (axesRight || pressed(15)) nextKeys.add(controls.right);
      if (up) nextKeys.add(controls.jump);
      if (down) nextKeys.add(controls.guard);
      const buttonMap = settings.buttons || {};
      for (const action of ['jump', 'guard', 'light', 'heavy', 'special', 'dash', 'ego']) {
        const defaultIndex = { jump: 0, dash: 1, light: 2, heavy: 3, special: 4, guard: 5, ego: 6 }[
          action
        ];
        const index = Number.isInteger(Number(buttonMap[action]))
          ? Number(buttonMap[action])
          : defaultIndex;
        if (pressed(index)) nextKeys.add(controls[action]);
      }
      for (const key of this.previousKeys) if (!nextKeys.has(key)) input.setVirtualKey(key, false);
      for (const key of nextKeys) if (!this.previousKeys.has(key)) input.setVirtualKey(key, true);
      this.previousKeys = nextKeys;
      this.lastGamepadId = gamepad.id || `Gamepad ${gamepad.index + 1}`;
      return { connected: true, id: this.lastGamepadId, slot: gamepad.index };
    }

    this.#release(input);
    this.lastGamepadId = '';
    return { connected: false, id: '', slot: -1 };
  }

  #release(input) {
    for (const key of this.previousKeys) input?.setVirtualKey?.(key, false);
    this.previousKeys.clear();
  }

  dispose() {
    if (this.previousInput) this.#release(this.previousInput);
    this.previousInput = null;
    this.lastGamepadId = '';
  }
}
