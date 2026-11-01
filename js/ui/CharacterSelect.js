import { VERSUS_ROSTER } from '../data/versusRoster.js';

const CONFIG = Object.freeze({
  player1: { keys: ['a', 'd', 'w', 's'], confirm: 'j', cursorClass: 'is-p1-cursor' },
  player2: {
    keys: ['arrowleft', 'arrowright', 'arrowup', 'arrowdown'],
    confirm: '1',
    cursorClass: 'is-p2-cursor',
  },
});
const normalize = (key) => String(key || '').toLowerCase();

/** Full Melty-inspired dual-player selector. P1 and P2 own independent character/E.G.O states. */
export class CharacterSelect {
  constructor({
    root,
    roster = Object.values(VERSUS_ROSTER),
    onStart = () => {},
    onCancel = () => {},
    selectSfx = null,
    fadeMs = 1500,
  } = {}) {
    if (!root) throw new Error('CharacterSelect requires #versusSelectScreen');
    this.root = root;
    this.roster = roster;
    this.onStart = onStart;
    this.onCancel = onCancel;
    this.selectSfx = selectSfx || (() => this.#beep());
    this.fadeMs = fadeMs;
    this.grid = root.querySelector('#mbCharacterGrid');
    this.timeSelect = root.querySelector('#mbTimeLimit');
    this.startButton = root.querySelector('#mbStartButton');
    this.active = false;
    this.transitioning = false;
    this.players = {
      player1: {
        phase: 'character',
        characterId: 'don',
        characterCursor: 14,
        egoCursor: 0,
        egoId: null,
      },
      player2: {
        phase: 'character',
        characterId: 'heathcliff',
        characterCursor: 17,
        egoCursor: 0,
        egoId: null,
      },
    };
    this._onKeyDown = (event) => this.#onKeyDown(event);
    this.root.querySelector('#versusCancelBtn')?.addEventListener('click', () => this.close());
    this.startButton?.addEventListener('click', () => void this.#beginFight());
    this.root.querySelectorAll('.mb-ego-list').forEach((node) =>
      node.addEventListener('click', (event) => {
        const button = event.target.closest('[data-ego-id]');
        if (!button) return;
        const key = node.id === 'mbP1Egos' ? 'player1' : 'player2';
        const state = this.players[key];
        state.egoId = button.dataset.egoId;
        state.egoCursor =
          this.#egos(state)[state.egoCursor]?.id === state.egoId
            ? state.egoCursor
            : this.#egos(state).findIndex((ego) => ego.id === state.egoId);
        this.#render();
      })
    );
    this.#renderGrid();
  }

  open() {
    this.players.player1 = {
      phase: 'character',
      characterId: 'don',
      characterCursor: 14,
      egoCursor: 0,
      egoId: null,
    };
    this.players.player2 = {
      phase: 'character',
      characterId: 'heathcliff',
      characterCursor: 17,
      egoCursor: 0,
      egoId: null,
    };
    this.active = true;
    this.transitioning = false;
    this.root.hidden = false;
    this.root.classList.remove('is-transitioning');
    window.addEventListener('keydown', this._onKeyDown);
    this.#render();
  }

  close() {
    if (!this.active || this.transitioning) return;
    this.active = false;
    window.removeEventListener('keydown', this._onKeyDown);
    this.root.hidden = true;
    this.onCancel();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    this.active = false;
  }

  #character(state) {
    return this.roster.find((item) => item.id === state.characterId) || this.roster[0];
  }
  #egos(state) {
    return this.#character(state)?.egos || [];
  }
  #isComplete() {
    return ['player1', 'player2'].every(
      (key) => this.players[key].phase === 'locked' && this.players[key].egoId
    );
  }
  #gridIndex(character, index) {
    return Number.isInteger(character.gridIndex) ? character.gridIndex : index;
  }

  #renderGrid() {
    if (!this.grid) return;
    this.grid.replaceChildren();
    const cells = Array.from({ length: 24 }, () => null);
    this.roster.forEach((character, index) => {
      cells[this.#gridIndex(character, index) % 24] = character;
    });
    cells.forEach((character, cellIndex) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'mb-character-tile';
      tile.setAttribute('role', 'gridcell');
      tile.dataset.cell = String(cellIndex);
      if (!character) {
        tile.classList.add('is-locked');
        tile.disabled = true;
        tile.innerHTML = '<span class="mb-locked-glyph">×</span>';
      } else {
        tile.dataset.characterId = character.id;
        tile.setAttribute('aria-label', character.name);
        const img = document.createElement('img');
        img.src = character.avatar || character.portrait;
        img.alt = '';
        img.draggable = false;
        const label = document.createElement('small');
        label.textContent = character.shortName || character.name;
        tile.append(img, label);
        tile.addEventListener('click', () => {
          for (const key of ['player1', 'player2'])
            if (this.players[key].phase === 'character') {
              this.players[key].characterId = character.id;
              this.players[key].characterCursor = cellIndex;
            }
          this.#render();
        });
      }
      this.grid.append(tile);
    });
  }

  #moveCharacter(playerKey, dx, dy) {
    const state = this.players[playerKey];
    const current =
      this.roster.find((char, i) => this.#gridIndex(char, i) === state.characterCursor) ||
      this.#character(state);
    const col = state.characterCursor % 6;
    const row = Math.floor(state.characterCursor / 6);
    const choices = this.roster
      .map((char, i) => ({
        char,
        cell: this.#gridIndex(char, i),
        col: this.#gridIndex(char, i) % 6,
        row: Math.floor(this.#gridIndex(char, i) / 6),
      }))
      .filter((item) => item.char.id !== current?.id || this.roster.length === 1);
    if (!choices.length) return;
    const forward = choices.filter((item) =>
      dx ? (dx > 0 ? item.col > col : item.col < col) : dy > 0 ? item.row > row : item.row < row
    );
    const pool = forward.length ? forward : choices;
    pool.sort((a, b) => {
      const primaryA = dx ? Math.abs(a.col - col) : Math.abs(a.row - row);
      const primaryB = dx ? Math.abs(b.col - col) : Math.abs(b.row - row);
      const secondaryA = dx ? Math.abs(a.row - row) : Math.abs(a.col - col);
      const secondaryB = dx ? Math.abs(b.row - row) : Math.abs(b.col - col);
      return primaryA - primaryB || secondaryA - secondaryB;
    });
    const next = pool[0];
    if (next) {
      state.characterId = next.char.id;
      state.characterCursor = next.cell;
    }
  }

  #moveEgo(state, delta) {
    const options = this.#egos(state);
    if (!options.length) return;
    state.egoCursor = (state.egoCursor + delta + options.length) % options.length;
    state.egoId = options[state.egoCursor].id;
  }

  #confirm(playerKey) {
    const state = this.players[playerKey];
    if (state.phase === 'character') {
      const char = this.#character(state);
      if (!char) return;
      state.phase = 'ego';
      state.egoCursor = 0;
      state.egoId = this.#egos(state)[0]?.id || null;
      this.#flashTile(state.characterCursor);
      this.selectSfx(playerKey, 'character');
    } else if (state.phase === 'ego') {
      const ego = this.#egos(state)[state.egoCursor];
      if (!ego) return;
      state.egoId = ego.id;
      state.phase = 'locked';
      this.selectSfx(playerKey, 'ego');
    }
    this.#render();
    if (this.#isComplete()) void this.#beginFight();
  }

  #onKeyDown(event) {
    if (!this.active || this.transitioning || event.repeat) return;
    const key = event.code === 'Numpad1' ? '1' : normalize(event.key);
    if (key === 'escape') {
      this.close();
      return;
    }
    for (const playerKey of ['player1', 'player2']) {
      const keys = CONFIG[playerKey].keys;
      if (!keys.includes(key)) continue;
      event.preventDefault();
      const state = this.players[playerKey];
      if (state.phase === 'character') {
        const dx = key === keys[0] ? -1 : key === keys[1] ? 1 : 0;
        const dy = key === keys[2] ? -1 : key === keys[3] ? 1 : 0;
        this.#moveCharacter(playerKey, dx, dy);
      } else if (state.phase === 'ego') {
        const delta = key === keys[0] || key === keys[2] ? -1 : 1;
        this.#moveEgo(state, delta);
      }
      this.#render();
    }
    if (key === CONFIG.player1.confirm) {
      event.preventDefault();
      this.#confirm('player1');
    }
    if (key === CONFIG.player2.confirm) {
      event.preventDefault();
      this.#confirm('player2');
    }
  }

  #flashTile(cell) {
    const tile = this.grid?.querySelector(`[data-cell="${cell}"]`);
    tile?.classList.remove('is-flashing');
    if (tile) {
      void tile.offsetWidth;
      tile.classList.add('is-flashing');
      setTimeout(() => tile.classList.remove('is-flashing'), 420);
    }
  }

  #beep() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioContext ||= new AudioContextClass();
      if (this.audioContext.state === 'suspended') void this.audioContext.resume();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 840;
      gain.gain.setValueAtTime(0.045, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.065);
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.07);
    } catch {}
  }

  #renderPlayer(playerKey) {
    const state = this.players[playerKey];
    const p1 = playerKey === 'player1';
    const panel = this.root.querySelector(p1 ? '#mbP1Panel' : '#mbP2Panel');
    const character = this.#character(state);
    if (!character) return;
    const img = this.root.querySelector(p1 ? '#mbP1Portrait' : '#mbP2Portrait');
    const name = this.root.querySelector(p1 ? '#mbP1Name' : '#mbP2Name');
    const identity = this.root.querySelector(p1 ? '#mbP1Identity' : '#mbP2Identity');
    const phaseLabel = this.root.querySelector(p1 ? '#mbP1Phase' : '#mbP2Phase');
    const egoList = this.root.querySelector(p1 ? '#mbP1Egos' : '#mbP2Egos');
    const path =
      state.phase === 'ego' || state.phase === 'locked'
        ? this.#egos(state).find((ego) => ego.id === state.egoId)?.preview
        : null;
    const nextSrc = path || character.fullBody || character.portrait;
    if (img.dataset.src !== nextSrc) {
      img.classList.add('is-changing');
      const apply = () => {
        img.src = nextSrc;
        img.dataset.src = nextSrc;
        requestAnimationFrame(() => img.classList.remove('is-changing'));
      };
      if (img.complete && img.src) setTimeout(apply, 70);
      else apply();
    }
    img.classList.toggle('is-flipped', !p1 && character.flipP2 !== false);
    name.textContent = character.name.toUpperCase();
    identity.textContent =
      state.phase === 'ego' || state.phase === 'locked'
        ? this.#egos(state).find((ego) => ego.id === state.egoId)?.name || 'E.G.O'
        : character.subtitle || 'LCB SINNER';
    phaseLabel.textContent =
      state.phase === 'character'
        ? 'SELECT FIGHTER'
        : state.phase === 'ego'
          ? 'SELECT E.G.O'
          : 'READY';
    panel.classList.toggle('is-locked', state.phase === 'locked');
    panel.classList.toggle('is-ego-phase', state.phase === 'ego' || state.phase === 'locked');
    egoList.hidden = state.phase !== 'ego' && state.phase !== 'locked';
    egoList.replaceChildren();
    if (state.phase === 'ego' || state.phase === 'locked') {
      this.#egos(state).forEach((ego, index) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.dataset.egoId = ego.id;
        tile.className = `mb-ego-choice${index === state.egoCursor ? ' is-ego-cursor' : ''}${state.egoId === ego.id ? ' is-ego-selected' : ''}`;
        const label = document.createElement('span');
        label.textContent = ego.name;
        const hint = document.createElement('small');
        hint.textContent =
          index === state.egoCursor
            ? state.phase === 'locked'
              ? 'LOCKED'
              : 'PRESS CONFIRM'
            : 'USE ARROWS';
        tile.append(label, hint);
        egoList.append(tile);
      });
    }
  }

  #render() {
    this.#renderPlayer('player1');
    this.#renderPlayer('player2');
    this.grid
      ?.querySelectorAll('.mb-character-tile')
      .forEach((tile) =>
        tile.classList.remove('is-p1-cursor', 'is-p2-cursor', 'is-p1-locked', 'is-p2-locked')
      );
    for (const [playerKey, config] of Object.entries(CONFIG)) {
      const state = this.players[playerKey];
      const panelClass = playerKey === 'player1' ? '#mbP1Panel' : '#mbP2Panel';
      this.root
        .querySelector(panelClass)
        ?.classList.toggle(config.cursorClass, state.phase === 'character');
      const tile = this.grid?.querySelector(`[data-character-id="${state.characterId}"]`);
      tile?.classList.toggle(config.cursorClass, state.phase === 'character');
      tile?.classList.toggle(
        playerKey === 'player1' ? 'is-p1-locked' : 'is-p2-locked',
        state.phase === 'ego' || state.phase === 'locked'
      );
    }
    this.startButton.disabled = !this.#isComplete() || this.transitioning;
    this.root.classList.toggle(
      'has-ego-phase',
      Object.values(this.players).some((state) => state.phase === 'ego' || state.phase === 'locked')
    );
    this.root.querySelector('#mbSelectHint').textContent = this.#isComplete()
      ? 'BOTH FIGHTERS READY · STARTING MATCH'
      : 'P1 WASD + J · P2 ARROWS + NUM 1 · CONFIRM CHARACTER, THEN E.G.O';
  }

  async #beginFight() {
    if (this.transitioning || !this.#isComplete()) return;
    this.transitioning = true;
    this.startButton.disabled = true;
    this.root.classList.add('is-transitioning');
    await new Promise((resolve) => setTimeout(resolve, this.fadeMs));
    const player = (key) => {
      const state = this.players[key];
      const character = this.#character(state);
      return { character: character.id === 'don' ? 'don_quixote' : character.id, ego: state.egoId };
    };
    const timeValue = this.timeSelect.value;
    const config = {
      p1: player('player1'),
      p2: player('player2'),
      timeLimit: timeValue === 'Infinity' ? Infinity : Number(timeValue),
    };
    this.active = false;
    window.removeEventListener('keydown', this._onKeyDown);
    await this.onStart(config);
  }
}

export default CharacterSelect;
