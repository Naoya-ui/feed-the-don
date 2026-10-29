/** Minimal explicit finite-state machine with a validated transition graph and history. */
export class StateMachine {
  constructor(initialState = 'Idle', transitions = {}) {
    if (!initialState) throw new TypeError('StateMachine requires an initial state.');
    this.current = initialState;
    this.previous = null;
    this.transitions = new Map(
      Object.entries(transitions).map(([state, nextStates]) => [state, new Set(nextStates)]),
    );
    this.history = [{ from: null, to: initialState, at: 0 }];
    this.rejectedTransitions = [];
    this.elapsedFrames = 0;
  }

  canTransition(nextState) {
    return nextState === this.current || this.transitions.get(this.current)?.has(nextState) === true;
  }

  transition(nextState, { force = false } = {}) {
    if (!nextState) return false;
    if (nextState === this.current) return true;
    if (!force && !this.canTransition(nextState)) {
      this.rejectedTransitions.push({ from: this.current, to: nextState, at: this.elapsedFrames });
      if (this.rejectedTransitions.length > 20) this.rejectedTransitions.shift();
      return false;
    }
    this.previous = this.current;
    this.current = nextState;
    this.elapsedFrames = 0;
    this.history.push({ from: this.previous, to: nextState, at: 0 });
    if (this.history.length > 32) this.history.shift();
    return true;
  }

  tick() {
    this.elapsedFrames += 1;
    const last = this.history[this.history.length - 1];
    if (last) last.at = this.elapsedFrames;
  }
}
