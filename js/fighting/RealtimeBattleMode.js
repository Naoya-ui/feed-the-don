import { InputHandler } from './InputHandler.js';
import { AssetLoader } from '../core/AssetLoader.js';
import { GamepadInputAdapter } from './GamepadInput.js';
import { GameLoop } from './GameLoop.js';
import { Fighter, MOVE_DATA } from './Fighter.js';
import { CombatSystem } from './CombatSystem.js';
import { battleDonSprites, battleDonAnimations } from '../data/characters.js';
import { VERSUS_ROSTER, getVersusCharacter, getVersusEgo } from '../data/versusRoster.js';
import { enemySprites } from '../data/enemies.js';
import {
  heathcliffSprites,
  heathcliffAnimations,
  HEATHCLIFF_EGO_CONFIG,
  chargeHeathcliffEgoFromEvent,
} from '../data/heathcliff.js';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const GROUND_Y = 584;
const ARENA_BOUNDS = { minX: 72, maxX: 1208 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ENEMY_MOVE_BY_ROLE = Object.freeze({
  WOLF: MOVE_DATA.wolfSlash,
  ELITE: MOVE_DATA.enemyHeavy,
  LEADER: MOVE_DATA.enemyHeavy,
  CLUB: MOVE_DATA.enemyLight,
  KNIFE: MOVE_DATA.enemyLight,
});

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '-');
}

/** Return an existing project icon for the move that was actually started. */
export function getSkillIconForMove(drawKey, move = {}) {
  const key = String(drawKey || 'club').toLowerCase();
  const id = String(move.id || '').toLowerCase();
  const name = String(move.name || '').toLowerCase();
  const isEgo = !!move.isEgo || id.includes('ego') || name.includes('e.g.o');
  if (key === 'don') {
    if (isEgo) return 'assets/images/battle/skills/justice-badge.png';
    if (id.includes('heavy') || id.includes('gallop') || name.includes('gallop'))
      return 'assets/images/battle/skills/gallop-icon.png';
    if (id.includes('special') || id.includes('justice') || name.includes('justice'))
      return 'assets/images/battle/skills/justice-icon.png';
    return 'assets/images/battle/skills/joust-icon.png';
  }
  if (key === 'heathcliff') {
    if (id === 'heathcliffbodysack')
      return 'assets/images/ego/heathcliff/bodysack/20701_awaken_profile.png';
    if (isEgo) return 'assets/images/battle/heathcliff/ego-sigil.png';
    if (id.includes('skill3') || name.includes('savage') || name.includes('special'))
      return 'assets/images/battle/heathcliff/skill3_1.png';
    if (id.includes('skill2') || id.includes('heavy') || name.includes('swing'))
      return 'assets/images/battle/heathcliff/skill2_1.png';
    return 'assets/images/battle/heathcliff/skill1_1.png';
  }
  if (key === 'wolf') {
    if (id.includes('mirage') || name.includes('mirage'))
      return 'assets/images/battle/wolf-skills/mirage-slash.png';
    if (id.includes('heavy') || name.includes('rend'))
      return 'assets/images/battle/wolf-skills/azure-rend.png';
    return 'assets/images/battle/wolf-skills/indigo-blade.png';
  }
  if (isEgo || id.includes('special')) return 'assets/images/battle/enemy-skills/heavy-strike.png';
  if (id.includes('heavy') || name.includes('heavy'))
    return 'assets/images/battle/enemy-skills/heavy-strike.png';
  if (id.includes('guard') || name.includes('block'))
    return 'assets/images/battle/enemy-skills/block.png';
  return 'assets/images/battle/enemy-skills/weak-blow.png';
}

/** Compact label shown alongside the icon in the recent-move HUD. */
export function getSkillShortLabel(drawKey, move = {}) {
  const key = String(drawKey || '').toLowerCase();
  const id = String(move.id || '').toLowerCase();
  const name = String(move.name || '').toLowerCase();
  if (move.isEgo || id.includes('ego') || name.includes('e.g.o')) return 'EGO';
  if (key === 'don') {
    if (id.includes('heavy') || id.includes('gallop') || name.includes('gallop')) return 'S2';
    if (id.includes('special') || id.includes('justice') || name.includes('justice')) return 'S3';
    return 'S1';
  }
  if (key === 'heathcliff') {
    if (id.includes('skill3') || name.includes('savage') || name.includes('special')) return 'S3';
    if (id.includes('skill2') || id.includes('heavy') || name.includes('swing')) return 'S2';
    return 'S1';
  }
  if (id.includes('heavy') || name.includes('heavy')) return 'HVY';
  if (id.includes('special') || name.includes('special')) return 'SP';
  return 'ATK';
}

/** Sprite art in this project is not authored facing the same direction: Don faces right,
 * while the bandit and Wolf sheets are drawn facing left. Convert desired world direction
 * into a flip relative to each sheet's native orientation. */
export function getSpriteFacingScale(team, facing, drawKey = null) {
  const desiredFacing = Math.sign(facing) || 1;
  // Don and Heathcliff's supplied attack art natively face right; bandits/Wolf face left.
  const nativeFacing = drawKey === 'don' || drawKey === 'heathcliff' || team === 'player' ? 1 : -1;
  return desiredFacing === nativeFacing ? 1 : -1;
}

export class RealtimeBattleMode {
  constructor({
    root = document.getElementById('realtimeArena'),
    onFps = () => {},
    onHit = () => {},
    onMoveStart = () => {},
    onRoundStart = () => {},
    trainingMode = false,
    standaloneMode = false,
    versusConfig = null,
    controlsConfig = null,
    controllerConfig = null,
  } = {}) {
    if (!root)
      throw new Error('Realtime battle overlay #realtimeArena is missing from index.html.');
    this.root = root;
    this.canvas = root.querySelector('#realtimeCanvas');
    this.ctx = this.canvas?.getContext('2d');
    if (!this.canvas || !this.ctx) throw new Error('Realtime canvas could not be initialized.');
    this.onFps = onFps;
    this.onHit = onHit;
    this.onMoveStart = onMoveStart;
    this.onRoundStart = onRoundStart;
    this.input = new InputHandler({ target: window, bufferFrames: 8, preventDefault: true });
    this.debugBoxes = false;
    this.trainingMode = !!trainingMode;
    this.standaloneMode = !!standaloneMode;
    this.versusConfig = versusConfig;
    this.controlsConfig = controlsConfig || { p1: {}, p2: {} };
    this.controllerConfig = controllerConfig || { player: 'p1', index: -1, buttons: {} };
    this.gamepadAdapter = new GamepadInputAdapter();
    this.playerBar = root.querySelector('#rtPlayerHpFill');
    this.playerHpLabel = root.querySelector('#rtPlayerHpLabel');
    this.playerNameLabel = root.querySelector('#rtPlayerName');
    this.playerIdentityLabel = root.querySelector('#rtPlayerIdentity');
    this.playerEgoName = root.querySelector('#rtPlayerEgoName');
    this.playerEgoMeter = root.querySelector('#rtPlayerEgoMeter');
    this.playerEgoFill = root.querySelector('#rtPlayerEgoFill');
    this.playerEgoLabel = root.querySelector('#rtPlayerEgoLabel');
    this.playerSkillHistory = root.querySelector('#rtPlayerSkillHistory');
    this.skillHistory = new Map();
    this.enemyHudRefs = new Map();
    this.enemyHud = root.querySelector('#rtEnemyHud');
    this.message = root.querySelector('#rtMessage');
    this.fightLabel = root.querySelector('#rtEncounterLabel');
    this.resultPanel = root.querySelector('#rtResult');
    this.resultEyebrow = root.querySelector('#rtResultEyebrow');
    this.resultTitle = root.querySelector('#rtResultTitle');
    this.resultCopy = root.querySelector('#rtResultCopy');
    this.resultButton = root.querySelector('#rtResultButton');
    this.resetButton = root.querySelector('#rtResetRound');
    this.mainMenuButton = root.querySelector('#rtMainMenuButton');
    this.modeBadge = root.querySelector('#rtModeBadge');
    this.controlsSummary = root.querySelector('#rtControlsSummary');
    this.seriesHud = root.querySelector('#rtSeriesScore');
    this.liveStatus = root.querySelector('#rtLiveStatus');
    this.fpsStatus = root.querySelector('#rtFpsStatus');
    this.timerLabel = root.querySelector('#rtTimer');
    this.remainingSeconds = Infinity;
    this.battle = null;
    this.encounter = 'bandit';
    this.player = null;
    this.enemies = [];
    this.fighters = [];
    this.hitstopFrames = 0;
    this.events = [];
    this.effectClock = 0;
    this.effects = [];
    this.cameraShake = 0;
    this.renderAlpha = 1;
    this.renderDelta = 1 / 60;
    // Sprite changes fade over a few render frames so low-frame-count source art does not pop.
    this.poseTransitions = new Map();
    this.openingCardFrames = 0;
    this.aiActionCounter = 0;
    // Fixed positions and phase offsets make the atmospheric particles reproducible.
    this.ambientParticles = Array.from({ length: 14 }, (_, index) => ({
      x: (index * 197 + 73) % LOGICAL_WIDTH,
      y: (index * 127 + 41) % LOGICAL_HEIGHT,
      size: 0.7 + (index % 4) * 0.45,
      speed: 8 + (index % 5) * 4,
      phase: index * 1.73,
    }));
    this.runningRound = false;
    this._paused = false;
    this.roundResolver = null;
    this.initialHP = new Map();
    this.seriesActive = false;
    this.seriesScores = { player: 0, enemy: 0 };
    this.seriesRound = 1;
    this.seriesRoundEndFrames = 0;
    this.seriesRoundWinner = null;
    this.egoCutinFrames = 0;
    this.egoActivationCount = 0;
    this._resultResolver = null;
    this._resultVictory = false;
    this._standaloneResult = false;
    this._roundResetRequested = false;
    this._disposed = false;
    this._assets = new Map();
    this._background = this._image('assets/images/backgrounds/forest-battle.png');
    this._heathcliffEgoCutin = this._image(heathcliffSprites.egoCutin);
    this._lastRenderAt = 0;

    this.resetButton?.addEventListener('click', () => {
      if (this.runningRound) this._roundResetRequested = true;
    });
    this.resultButton?.addEventListener('click', () => {
      if (!this._resultResolver) return;
      const resolve = this._resultResolver;
      this._resultResolver = null;
      resolve(this._standaloneResult ? 'retry' : this._resultVictory ? 'continue' : 'retry');
    });
    this.mainMenuButton?.addEventListener('click', () => {
      if (!this._resultResolver) return;
      const resolve = this._resultResolver;
      this._resultResolver = null;
      resolve('main-menu');
    });

    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: (alpha, dt) => this.render(alpha, dt),
      fixedDelta: 1 / 60,
      maxSubSteps: 5,
    });
    this.#preloadSprites();
  }

  #preloadSprites() {
    const paths = [
      ...Object.values(battleDonSprites),
      ...Object.values(battleDonAnimations).flatMap((animation) => [
        ...(animation.frames || []),
        ...(animation.effectFrames || []).map((frame) => frame.src),
      ]),
      ...Object.values(enemySprites).flatMap((poses) => Object.values(poses)),
      ...Object.values(heathcliffSprites),
      ...Object.values(heathcliffAnimations).flatMap((animation) => [
        ...(animation.frames || []),
        ...(animation.effectFrames || []).map((frame) => frame.src),
      ]),
      ...Object.values(VERSUS_ROSTER).flatMap((character) =>
        character.egos.map((ego) => ego.preview).filter(Boolean)
      ),
      this._background.src,
    ];
    [...new Set(paths.filter(Boolean))].forEach((src) => this._image(src));
  }

  _image(src) {
    if (!src) return null;
    if (this._assets.has(src)) return this._assets.get(src);
    const image = AssetLoader.imageCache.get(src) || new Image();
    image.decoding = 'async';
    if (!image.src) image.src = src;
    this._assets.set(src, image);
    return image;
  }

  _isReady(image) {
    return !!image && image.complete && image.naturalWidth > 0;
  }

  async runRound(battle, encounter = 'bandit') {
    if (this._disposed) throw new Error('RealtimeBattleMode was disposed.');
    this.battle = battle;
    this.encounter = encounter;
    const bossEncounter = encounter === 'wolf';
    const versusSeconds = Number(this.versusConfig?.timeLimit ?? 99);
    this.remainingSeconds =
      bossEncounter || (encounter === 'versus' && versusSeconds === 0)
        ? Infinity
        : encounter === 'versus'
          ? versusSeconds
          : 99;
    this.#renderTimer();
    this.seriesActive =
      encounter === 'wolf' || encounter === 'heathcliff' || encounter === 'versus';
    this.seriesScores = { player: 0, enemy: 0 };
    this.seriesRound = 1;
    this.seriesRoundEndFrames = 0;
    this.seriesRoundWinner = null;
    this.resultPanel.hidden = true;
    this.root.hidden = false;
    this._roundResetRequested = false;
    this._paused = false;
    if (this.mainMenuButton) this.mainMenuButton.hidden = true;
    this.input.clear();
    this.gamepadAdapter?.dispose?.();
    this.gamepadAdapter = new GamepadInputAdapter();
    this.hitstopFrames = 0;
    this.effects = [];
    this.effectClock = 0;
    this.cameraShake = 0;
    this.egoCutinFrames = 0;
    this.openingCardFrames = 52;
    this.poseTransitions.clear();
    this.#buildFighters();
    this.onRoundStart({
      encounter: this.encounter,
      round: this.seriesRound || 1,
      fighters: this.fighters,
    });
    this.#updateModeBadge();
    this.#renderEnemyHud();
    this.#updateHud();
    this.#updateSeriesHud();
    this.fightLabel.textContent =
      encounter === 'wolf'
        ? 'BOSS DUEL · WOLF'
        : encounter === 'heathcliff'
          ? 'FRIENDLY SPAR · HEATHCLIFF / E.G.O'
          : encounter === 'training'
            ? 'TRAINING ROOM'
            : encounter === 'versus'
              ? 'VERSUS MATCH'
              : `FOREST AMBUSH · WAVE ${battle.wave}/${battle.totalWaves}`;
    this.setMessage(
      encounter === 'training'
        ? 'TRAINING — Practice JOUST (J), GALLOP (K), JUSTICE (U), dash (L) and guard (S). Press ESC to leave.'
        : encounter === 'heathcliff'
          ? 'HEATHCLIFF: “What are you grinning at, tin-can?” DON: “A noble challenger! Let justice ring!” Heathcliff snarls and charges—Don braces for the clash.'
          : 'READY — FIGHT!  A/D Move · W Jump · S Guard · J Joust · K Gallop · U Justice · L Dash'
    );
    this.runningRound = true;
    this.loop.start();
    return new Promise((resolve) => {
      this.roundResolver = resolve;
    });
  }

  #renderTimer() {
    if (this.timerLabel)
      this.timerLabel.textContent = Number.isFinite(this.remainingSeconds)
        ? String(Math.ceil(this.remainingSeconds)).padStart(2, '0')
        : '∞';
  }

  /** Pause simulation while the in-battle Settings modal is open. */
  pause() {
    if (!this.runningRound || this._paused) return;
    this._paused = true;
    this.input.clear();
    this.loop.stop();
  }

  resume() {
    if (!this.runningRound || !this._paused || this._disposed) return;
    this._paused = false;
    this.loop.start();
  }

  #updateModeBadge() {
    if (this.modeBadge)
      this.modeBadge.textContent = this.trainingMode
        ? 'TRAINING'
        : this.encounter === 'versus' && this.versusConfig?.localMultiplayer
          ? 'LOCAL VERSUS'
          : 'PLAYER';
    if (this.controlsSummary)
      this.controlsSummary.textContent = this.trainingMode
        ? 'Practice controls · ESC Return to Menu'
        : this.encounter === 'versus' && this.versusConfig?.localMultiplayer
          ? 'P1 WASD + J/K/U/L · P2 ARROWS + NUMPAD 1–4'
          : 'A/D Move · W Jump · S Guard · J Joust · K Gallop · U Justice · L Dash';
  }

  #updateSeriesHud() {
    if (!this.seriesHud) return;
    this.seriesHud.hidden = !this.seriesActive;
    if (!this.seriesActive) return;
    const coins = (count) => `${'●'.repeat(count)}${'○'.repeat(Math.max(0, 2 - count))}`;
    const localVersus = this.encounter === 'versus' && !!this.versusConfig?.localMultiplayer;
    const leftName = localVersus ? this.player?.name || 'PLAYER 1' : 'DON';
    const opponent = this.enemies[0]?.name || 'OPPONENT';
    const roundLabel = this.seriesRound === 3 ? 'FINAL ROUND' : `ROUND ${this.seriesRound}/3`;
    this.seriesHud.textContent = `${roundLabel}  ·  ${leftName.toUpperCase()} ${coins(this.seriesScores.player)}  —  ${opponent.toUpperCase()} ${coins(this.seriesScores.enemy)}`;
  }

  #completeSeriesRound(winner) {
    if (!this.seriesActive || this.seriesRoundEndFrames > 0 || !this.runningRound) return;
    this.seriesRoundWinner = winner;
    this.seriesScores[winner] += 1;
    this.seriesRoundEndFrames = 84; // hold the result long enough to read the awarded round coin
    const localVersus = this.encounter === 'versus' && !!this.versusConfig?.localMultiplayer;
    const winnerLabel =
      winner === 'player'
        ? localVersus
          ? this.player?.name
          : 'DON QUIXOTE'
        : this.enemies[0]?.name || 'OPPONENT';
    this.setMessage(
      `${winnerLabel.toUpperCase()} WINS ROUND ${this.seriesRound} · ${this.seriesScores.player}–${this.seriesScores.enemy} COINS`
    );
    this.#updateSeriesHud();
    this.#updateHud();
  }

  #advanceSeries() {
    if (this.seriesScores.player >= 2) {
      this.#endRound('win');
      return;
    }
    if (this.seriesScores.enemy >= 2) {
      this.#endRound('defeat');
      return;
    }

    this.seriesRound += 1;
    // Each round starts at full HP, as in a best-of-three fighting-game boss match.
    for (const [id, hp] of this.initialHP) {
      if (id === 'don') this.battle.don.hp = hp;
      else {
        const rawId = id.slice('enemy-'.length);
        const enemy = this.battle.enemies.find((item) => String(item.id) === rawId);
        if (enemy) enemy.hp = hp;
      }
    }
    this.hitstopFrames = 0;
    this.effects = [];
    this.cameraShake = 0;
    this.poseTransitions.clear();
    this.openingCardFrames = 46;
    this.seriesRoundEndFrames = 0;
    this.seriesRoundWinner = null;
    this.#buildFighters();
    this.onRoundStart({
      encounter: this.encounter,
      round: this.seriesRound,
      fighters: this.fighters,
    });
    this.#renderEnemyHud();
    this.#updateHud();
    this.#updateSeriesHud();
    this.setMessage(
      this.seriesRound === 3
        ? 'TIEBREAKER — 1–1. The winner of this round takes the match!'
        : `ROUND ${this.seriesRound} — Fighters recovered to full HP. FIGHT!`
    );
  }

  /** Called from Settings; hitboxes are deliberately not exposed as a battle-HUD toggle. */
  setDebugBoxes(enabled) {
    this.debugBoxes = !!enabled;
  }

  #buildFighters() {
    const battle = this.battle;
    const localVersus = this.encounter === 'versus' && !!this.versusConfig?.localMultiplayer;
    const p1Roster = localVersus
      ? getVersusCharacter(this.versusConfig.player1?.characterId || 'don')
      : null;
    const p1Ego = localVersus
      ? getVersusEgo(p1Roster.id, this.versusConfig.player1?.egoId || 'none')
      : null;
    const don = battle.don;
    const p1DrawKey = localVersus ? p1Roster.drawKey : don.drawKey || 'don';
    const p1Controls = this.controlsConfig?.p1 || {};
    const p1IsHeathcliff = p1DrawKey === 'heathcliff';
    this.player = new Fighter({
      id: 'don',
      name: don.name || p1Roster?.name || 'Don Quixote',
      team: 'player',
      combatant: don,
      x: 230,
      groundY: GROUND_Y,
      bodyWidth: p1IsHeathcliff ? 82 : 72,
      bodyHeight: p1IsHeathcliff ? 154 : 150,
      facing: 1,
      walkSpeed: 330,
      acceleration: 2650,
      friction: 3050,
      gravity: 2100,
      jumpSpeed: 760,
      controls: p1Controls,
      lightMoveData: p1IsHeathcliff ? MOVE_DATA.heathcliffSkill1 : MOVE_DATA.light,
      heavyMoveData: p1IsHeathcliff ? MOVE_DATA.heathcliffSkill2 : MOVE_DATA.heavy,
      specialMoveData: p1IsHeathcliff ? MOVE_DATA.heathcliffSkill3 : MOVE_DATA.special,
      egoMoveData:
        p1Ego?.id === 'none'
          ? this.encounter === 'heathcliff'
            ? p1IsHeathcliff
              ? MOVE_DATA.heathcliffBodysack
              : MOVE_DATA.donEgo
            : null
          : p1IsHeathcliff
            ? p1Ego?.id === 'bodysack'
              ? MOVE_DATA.heathcliffBodysack
              : MOVE_DATA.heathcliffEgo
            : MOVE_DATA.donEgo,
      egoEquipped:
        (!!p1Ego && p1Ego.id !== 'none') || (this.encounter === 'heathcliff' && !p1IsHeathcliff),
    });
    this.player.drawKey = p1DrawKey;
    this.player.egoId = p1Ego?.id || 'none';
    this.player.egoPreviewPath =
      p1Ego?.preview ||
      (this.encounter === 'heathcliff' && !p1IsHeathcliff
        ? 'assets/images/ego/don/la-sangre-preview.gif'
        : null);
    if (this.playerNameLabel) this.playerNameLabel.textContent = this.player.name.toUpperCase();
    if (this.playerIdentityLabel)
      this.playerIdentityLabel.textContent = p1Roster?.identity?.name || 'JOUST / GALLOP / JUSTICE';
    if (this.playerEgoName)
      this.playerEgoName.textContent = p1Ego?.id && p1Ego.id !== 'none' ? p1Ego.name : 'E.G.O';
    this.player.egoMeter = 0;
    this.player.egoMeterMax = 100;
    this.player.aiAttackRange = 154;
    this.player.aiMove = this.player.lightMoveData;
    this.player.aiCooldownFrames = 28;
    this.player.aiDefenseCooldownFrames = 0;
    this.player.aiActionCount = 0;

    this.enemies = battle.enemies.map((enemy, index) => {
      const x = localVersus
        ? 1010
        : battle.encounter === 'wolf' || encounterIsWolf(this.encounter)
          ? 1000
          : battle.encounter === 'heathcliff' || this.encounter === 'heathcliff'
            ? 1010
            : [800, 990, 1130, 1160][index] || 1130;
      const p2Roster = localVersus
        ? getVersusCharacter(this.versusConfig.player2?.characterId || 'heathcliff')
        : null;
      const p2Ego = localVersus
        ? getVersusEgo(p2Roster.id, this.versusConfig.player2?.egoId || 'none')
        : null;
      const drawKey = localVersus ? p2Roster.drawKey : enemy.spriteKey || 'club';
      const isPlayer2 = localVersus;
      const isHeathcliff = drawKey === 'heathcliff';
      const fighter = new Fighter({
        id: `enemy-${enemy.id}`,
        name: enemy.name,
        team: isPlayer2 ? 'player2' : 'enemy',
        combatant: enemy,
        x,
        groundY: GROUND_Y,
        bodyWidth: drawKey === 'wolf' ? 112 : isHeathcliff ? 82 : 72,
        bodyHeight: drawKey === 'wolf' ? 172 : isHeathcliff ? 154 : 150,
        facing: -1,
        walkSpeed: isHeathcliff ? 330 : 320,
        acceleration: 2500,
        friction: 3000,
        gravity: 2100,
        jumpSpeed: 760,
        aiIndex: index,
        controls: isPlayer2 ? this.controlsConfig?.p2 || {} : null,
        lightMoveData: isHeathcliff ? MOVE_DATA.heathcliffSkill1 : MOVE_DATA.light,
        heavyMoveData: isHeathcliff ? MOVE_DATA.heathcliffSkill2 : MOVE_DATA.heavy,
        specialMoveData: isHeathcliff ? MOVE_DATA.heathcliffSkill3 : MOVE_DATA.special,
        egoMoveData:
          p2Ego?.id === 'none'
            ? null
            : isHeathcliff
              ? p2Ego?.id === 'bodysack'
                ? MOVE_DATA.heathcliffBodysack
                : MOVE_DATA.heathcliffEgo
              : MOVE_DATA.donEgo,
        egoEquipped: !!p2Ego && p2Ego.id !== 'none',
      });
      fighter.drawKey = drawKey;
      fighter.egoId = p2Ego?.id || 'none';
      fighter.egoPreviewPath = p2Ego?.preview || null;
      fighter.egoMeter = 0;
      fighter.egoMeterMax = 100;
      fighter.aiCooldownFrames = 54 + index * 24;
      fighter.aiDefenseCooldownFrames = 50 + index * 35;
      fighter.aiGuardFrames = 0;
      fighter.aiAttackRange = drawKey === 'wolf' ? 198 : isHeathcliff ? 232 : 178;
      fighter.aiMove = isHeathcliff
        ? MOVE_DATA.heathcliffSkill1
        : ENEMY_MOVE_BY_ROLE[enemy.role] || MOVE_DATA.enemyLight;
      if (drawKey === 'wolf') fighter.aiMove = MOVE_DATA.wolfSlash;
      fighter.aiActionCount = 0;
      return fighter;
    });
    this.fighters = [this.player, ...this.enemies];
    this.skillHistory = new Map(this.fighters.map((fighter) => [fighter.id, []]));
    this.#renderSkillHistory(this.player);
    this.initialHP.set('don', don.hp);
    this.battle.enemies.forEach((enemy) => this.initialHP.set(`enemy-${enemy.id}`, enemy.hp));
  }

  /** Register late-supplied E.G.O pose paths; preload before attaching to avoid frame hitching. */
  async setEgoSpriteSet(characterId, spriteSet) {
    const fighter = this.fighters.find(
      (item) => item.drawKey === characterId && (item.team === 'player' || item.team === 'player2')
    );
    if (!fighter || !spriteSet || typeof spriteSet !== 'object') return false;
    const paths = Object.values(spriteSet)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value) => typeof value === 'string');
    await Promise.all(
      paths.map(
        (src) =>
          new Promise((resolve) => {
            const image = this._image(src);
            if (!image || image.complete) return resolve();
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
      )
    );
    fighter.egoSpriteSet = spriteSet;
    return true;
  }

  setControlsConfig(config = {}) {
    this.controlsConfig = config || { p1: {}, p2: {} };
    const p1 = this.fighters.find((fighter) => fighter.team === 'player');
    const p2 = this.fighters.find((fighter) => fighter.team === 'player2');
    if (p1) p1.controls = { ...p1.controls, ...(this.controlsConfig.p1 || {}) };
    if (p2) p2.controls = { ...p2.controls, ...(this.controlsConfig.p2 || {}) };
  }

  setControllerConfig(config = {}) {
    this.controllerConfig = {
      ...this.controllerConfig,
      ...(config || {}),
      buttons: { ...(this.controllerConfig.buttons || {}), ...(config?.buttons || {}) },
    };
  }

  #updateGamepad() {
    if (!(this.encounter === 'versus' && this.versusConfig?.localMultiplayer)) return;
    const playerKey = this.controllerConfig?.player === 'p2' ? 'p2' : 'p1';
    const fighter = this.fighters.find(
      (item) => item.team === (playerKey === 'p2' ? 'player2' : 'player')
    );
    if (!fighter) return;
    this.gamepadAdapter.update({
      input: this.input,
      controls: fighter.controls,
      settings: this.controllerConfig,
    });
  }

  #renderEnemyHud() {
    if (!this.enemyHud) return;
    this.enemyHud.replaceChildren();
    this.enemyHudRefs.clear();
    for (const fighter of this.enemies) {
      const card = document.createElement('div');
      card.className = 'rt-enemy-card';
      card.dataset.enemyId = fighter.id;
      if (
        fighter.egoEquipped ||
        (fighter.drawKey === 'heathcliff' && this.encounter === 'heathcliff')
      )
        card.classList.add('has-ego');
      const label = document.createElement('div');
      label.className = 'rt-enemy-label';
      label.textContent = fighter.name;
      const value = document.createElement('span');
      value.className = 'rt-enemy-hp-label';
      value.dataset.hpLabel = fighter.id;
      value.textContent = `${fighter.hp}/${fighter.maxHp}`;
      const track = document.createElement('div');
      track.className = 'rt-hp-track rt-enemy-track';
      const fill = document.createElement('i');
      fill.className = 'rt-hp-fill rt-enemy-hp-fill';
      fill.dataset.hpFill = fighter.id;
      fill.style.width = '100%';
      fill.style.transformOrigin = 'left center';
      fill.style.transform = `scaleX(${clamp(fighter.hp / fighter.maxHp, 0, 1)})`;
      track.append(fill);
      const skillHistory = document.createElement('div');
      skillHistory.className = 'rt-skill-history';
      skillHistory.dataset.skillHistory = fighter.id;
      skillHistory.setAttribute('aria-label', `${fighter.name} recent skills`);
      card.append(label, value, track, skillHistory);
      let cachedEgoFill = null;
      let cachedEgoLabel = null;
      if (
        fighter.egoEquipped ||
        (fighter.drawKey === 'heathcliff' && this.encounter === 'heathcliff')
      ) {
        const egoMeter = document.createElement('div');
        egoMeter.className = 'rt-ego-meter';
        const egoHeader = document.createElement('div');
        egoHeader.className = 'rt-ego-header';
        const egoName = document.createElement('span');
        egoName.textContent = 'E.G.O';
        const egoValue = document.createElement('strong');
        egoValue.dataset.egoLabel = fighter.id;
        egoValue.setAttribute('data-ego-label', fighter.id);
        cachedEgoLabel = egoValue;
        egoValue.textContent = '0%';
        egoHeader.append(egoName, egoValue);
        const egoTrack = document.createElement('div');
        egoTrack.className = 'rt-ego-track';
        const egoFill = document.createElement('i');
        egoFill.dataset.egoFill = fighter.id;
        egoFill.setAttribute('data-ego-fill', fighter.id);
        cachedEgoFill = egoFill;
        egoFill.style.transform = `scaleX(${(fighter.egoMeter || 0) / HEATHCLIFF_EGO_CONFIG.maxGauge})`;
        egoFill.style.width = '100%';
        egoFill.style.transformOrigin = 'left center';
        egoTrack.append(egoFill);
        const egoHint = document.createElement('small');
        egoHint.className = 'rt-ego-hint';
        egoHint.textContent = fighter.egoEquipped
          ? `Equipped · ${fighter.egoId || 'E.G.O'}`
          : 'Builds on hit / block';
        egoMeter.append(egoHeader, egoTrack, egoHint);
        card.append(egoMeter);
      }
      this.enemyHud.append(card);
      this.enemyHudRefs.set(fighter.id, {
        fill,
        label: value,
        card,
        skillHistory,
        egoFill: cachedEgoFill,
        egoLabel: cachedEgoLabel,
      });
      this.#renderSkillHistory(fighter);
    }
  }

  #recordSkillUse(fighter, move) {
    if (!fighter || !move) return;
    const history = this.skillHistory.get(fighter.id) || [];
    history.push({
      id: String(move.id || move.name || 'move'),
      name: String(move.name || move.id || 'Move'),
      icon: getSkillIconForMove(fighter.drawKey, move),
      shortLabel: getSkillShortLabel(fighter.drawKey, move),
    });
    // Keep a short rolling history to prevent the HUD from growing during long rounds.
    if (history.length > 4) history.splice(0, history.length - 4);
    this.skillHistory.set(fighter.id, history);
    this.#renderSkillHistory(fighter);
  }

  #renderSkillHistory(fighter) {
    const container =
      fighter === this.player
        ? this.playerSkillHistory
        : this.enemyHud?.querySelector?.(`[data-skill-history="${safeId(fighter?.id || '')}"]`);
    if (!container) return;
    const history = this.skillHistory.get(fighter.id) || [];
    container.replaceChildren();
    if (!history.length) {
      const empty = document.createElement('span');
      empty.className = 'rt-skill-history-empty';
      empty.textContent = 'SKILL LOG · USE A MOVE';
      container.append(empty);
      return;
    }
    history.forEach((item, index) => {
      const chip = document.createElement('span');
      chip.className = `rt-skill-chip${index === history.length - 1 ? ' is-latest' : ''}`;
      chip.title = item.name;
      chip.setAttribute(
        'aria-label',
        `${item.name}${index === history.length - 1 ? ', most recent' : ''}`
      );
      const image = document.createElement('img');
      image.src = item.icon;
      image.alt = '';
      image.loading = 'eager';
      image.draggable = false;
      const label = document.createElement('b');
      label.textContent = item.shortLabel;
      chip.append(image, label);
      container.append(chip);
    });
  }

  setMessage(text) {
    if (this.message) this.message.textContent = text;
  }

  update(dt) {
    if (!this.runningRound || !this.battle) return;
    this.effectClock += dt;
    this.hudRefreshTimer = (this.hudRefreshTimer || 0) + dt;
    if (this.hudRefreshTimer >= 0.12) {
      this.hudRefreshTimer = 0;
      this.#updateHud();
    }
    if (Number.isFinite(this.remainingSeconds)) {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
      this.#renderTimer();
      if (this.remainingSeconds <= 0) {
        this.#endRound(this.player.hp >= (this.enemies[0]?.hp || 0) ? 'victory' : 'defeat');
        return;
      }
    }
    this.cameraShake = Math.max(0, this.cameraShake - 36 * dt);
    this.egoCutinFrames = Math.max(0, this.egoCutinFrames - 1);
    this.openingCardFrames = Math.max(0, this.openingCardFrames - 1);
    this.effects = this.effects.filter((effect) => this.effectClock - effect.at < effect.duration);
    if (this.input.consumePress('r')) this._roundResetRequested = true;
    if (this.standaloneMode && this.input.consumePress('escape')) {
      this.#endRound('exit');
      return;
    }
    if (this._roundResetRequested) {
      this._roundResetRequested = false;
      for (const [id, hp] of this.initialHP) {
        if (id === 'don') this.battle.don.hp = hp;
        else {
          const rawId = id.slice('enemy-'.length);
          const enemy = this.battle.enemies.find((item) => String(item.id) === rawId);
          if (enemy) enemy.hp = hp;
        }
      }
      this.#endRound('reset');
      return;
    }

    if (this.seriesRoundEndFrames > 0) {
      this.seriesRoundEndFrames -= 1;
      this.input.advanceFrame();
      this.#updateHud();
      if (this.seriesRoundEndFrames <= 0) this.#advanceSeries();
      return;
    }

    if (this.hitstopFrames > 0) {
      this.hitstopFrames -= 1;
      this.input.advanceFrame();
      this.#updateHud();
      return;
    }

    this.#updateGamepad();
    const target = this.player;
    // Capture move IDs before the fixed update so a voice line plays once when an
    // attack starts, not only after a hit. This keeps calls audible on whiff/block too.
    const previousMoveIds = new Map(
      this.fighters.map((fighter) => [fighter.id, fighter.currentMove?.data?.id ?? null])
    );
    // Don keeps the last direction the player chose with A/D. Do not auto-turn toward an
    // opponent while standing still; the player may deliberately face either way.
    const opponent = this.enemies
      .filter((enemy) => enemy.alive)
      .sort((a, b) => Math.abs(a.x - target.x) - Math.abs(b.x - target.x))[0];
    target.opponentX = opponent?.x;
    target.update(dt, this.input, ARENA_BOUNDS);
    for (const enemy of this.enemies) this.#updateEnemy(enemy, target, dt);
    for (const fighter of this.fighters) {
      const move = fighter.currentMove?.data;
      const previousId = previousMoveIds.get(fighter.id) ?? null;
      if (move && move.id !== previousId) {
        this.#recordSkillUse(fighter, move);
        if (
          move.isEgo ||
          move.id === 'donEgo' ||
          move.id === 'heathcliffEgo' ||
          move.id === 'heathcliffBodysack'
        ) {
          this.egoCutinImage = this._image(
            move.cinematicPath ||
              fighter.egoPreviewPath ||
              (fighter.drawKey === 'heathcliff'
                ? heathcliffSprites.egoCutin
                : 'assets/images/battle/ego/frame-art.png')
          );
          this.egoCutinLabel = `${fighter.name.toUpperCase()} · ${move.name.toUpperCase()}`;
          this.egoCutinFrames = 90;
        }
        this.onMoveStart({ attacker: fighter, move, encounter: this.encounter });
      }
    }

    const combatants = [target, ...this.enemies];
    const hitEvents = CombatSystem.resolve(combatants, combatants, (event) => this.#onHit(event));
    if (hitEvents.length) this.#updateHud();
    this.input.advanceFrame();

    if (!target.alive) {
      if (this.seriesActive) this.#completeSeriesRound('enemy');
      else this.#endRound('defeat');
      return;
    }
    if (this.battle.enemies.every((enemy) => enemy.hp <= 0)) {
      if (this.seriesActive) this.#completeSeriesRound('player');
      else this.#endRound('win');
    }
  }

  #updateEnemy(enemy, player, dt) {
    enemy.opponentX = player.x;
    if (enemy.team === 'player2') {
      enemy.update(dt, this.input, ARENA_BOUNDS);
      return;
    }
    if (this.trainingMode) {
      enemy.aiDirection = 0;
      enemy.blockHeld = false;
      enemy.update(dt, null, ARENA_BOUNDS);
      return;
    }
    if (!enemy.alive || !player.alive) {
      enemy.aiDirection = 0;
      enemy.blockHeld = false;
      enemy.update(dt, null, ARENA_BOUNDS);
      return;
    }
    if (enemy.aiCooldownFrames > 0) enemy.aiCooldownFrames -= 1;
    if (enemy.aiDefenseCooldownFrames > 0) enemy.aiDefenseCooldownFrames -= 1;
    enemy.aiDirection = 0;
    if (enemy.aiGuardFrames > 0) {
      enemy.aiGuardFrames -= 1;
      enemy.blockHeld = true;
    } else {
      enemy.blockHeld = false;
    }

    const dx = player.x - enemy.x;
    const distance = Math.abs(dx);
    enemy.facing = dx >= 0 ? 1 : -1;
    const playerMove = player.currentMove;
    const playerFrame = playerMove?.frame ?? -1;
    const dangerRange = (playerMove?.data?.range || 145) + enemy.bodyWidth * 0.82;
    const incoming =
      !!playerMove &&
      playerFrame >= Math.max(1, playerMove.data.startup - 2) &&
      playerFrame <= playerMove.data.startup + playerMove.data.active + 1 &&
      distance <= dangerRange;

    // Enemies read the same startup window the player sees: some retreat through an
    // invulnerable dash, others guard briefly. The pattern is deterministic, not damage RNG.
    if (incoming && enemy.canAct() && !enemy.blockHeld && enemy.aiDefenseCooldownFrames <= 0) {
      if (enemy.aiIndex % 2 === 0 && enemy.dashCooldownFrames <= 0 && enemy.onGround) {
        enemy.beginDash(-Math.sign(dx));
      } else {
        enemy.aiGuardFrames = 8;
        enemy.blockHeld = true;
      }
      enemy.aiDefenseCooldownFrames = 118 + (enemy.aiIndex % 3) * 24;
    }

    if (!enemy.blockHeld && enemy.canAct()) {
      const egoReady =
        enemy.drawKey === 'heathcliff' && enemy.egoMeter >= HEATHCLIFF_EGO_CONFIG.maxGauge;
      if (egoReady && distance <= HEATHCLIFF_EGO_CONFIG.activationRange) {
        if (enemy.beginAttack(MOVE_DATA.heathcliffEgo)) {
          enemy.egoMeter = 0;
          enemy.egoActivationCount = (enemy.egoActivationCount || 0) + 1;
          enemy.aiCooldownFrames = 150;
          this.egoCutinFrames = 54;
          this.setMessage(
            'E.G.O ACTIVATED — Heathcliff unleashes a full-gauge burst! Guard or evade, then punish the long recovery.'
          );
        }
      } else if (distance > enemy.aiAttackRange * 0.78) {
        enemy.aiDirection = dx >= 0 ? 1 : -1;
      } else if (enemy.aiCooldownFrames <= 0) {
        let move = enemy.aiMove || MOVE_DATA.enemyLight;
        if (enemy.drawKey === 'heathcliff') {
          // Alternate the fast bat strike and the slower double-pulse swing.
          move =
            enemy.aiActionCount % 3 === 2 ? MOVE_DATA.heathcliffSkill2 : MOVE_DATA.heathcliffSkill1;
          enemy.aiActionCount = (enemy.aiActionCount || 0) + 1;
        }
        if (enemy.beginAttack(move)) {
          // Offset enemy timing so the fight has readable beats instead of one synchronized swarm.
          enemy.aiCooldownFrames =
            (move.id === 'wolfSlash' ? 73 : move.id === 'heathcliffEgo' ? 150 : 67) +
            enemy.aiIndex * 28;
          this.setMessage(
            move.id === 'heathcliffEgo'
              ? 'Heathcliff is gathering E.G.O power — prepare to defend.'
              : `${enemy.name} is winding up — guard with S or time a dash through the swing.`
          );
        }
      }
    }
    enemy.update(dt, null, ARENA_BOUNDS);
  }

  #onHit(event) {
    if (event.evaded) {
      this.effects.push({
        kind: 'evade',
        x: event.target.x,
        y: event.target.y + 28,
        text: 'EVADED',
        detail: '',
        at: this.effectClock,
        duration: 0.56,
        attackerX: event.attacker.x,
        targetX: event.target.x,
      });
      this.setMessage(`${event.target.name} evaded ${event.attacker.name}'s ${event.move.name}.`);
      this.onHit(event);
      return;
    }

    // Impact overlays are anchored to the actual collision event (not a guessed timeout),
    // so multi-hit animation, hitstop and follow-up frames stay in lockstep.
    if (
      !event.blocked &&
      event.attacker?.drawKey === 'heathcliff' &&
      event.move?.id === 'heathcliffSkill2'
    ) {
      this.effects.push({
        kind: 'sprite',
        src:
          event.hitIndex === 0
            ? heathcliffAnimations.skill2.effectFrames[0].src
            : heathcliffAnimations.skill2.effectFrames.at(-1).src,
        x: event.target.x,
        y: event.target.y + event.target.bodyHeight * 0.62,
        facing: event.attacker.facing,
        width: 250,
        height: 170,
        at: this.effectClock,
        duration: 0.22,
      });
    }
    if (this.encounter !== 'versus') chargeHeathcliffEgoFromEvent(event);
    if (this.encounter === 'versus' && !event.evaded) {
      if (event.attacker?.egoEquipped)
        event.attacker.egoMeter = clampEgoMeter(
          (event.attacker.egoMeter || 0) + (event.blocked ? 8 : 12),
          100
        );
      if (event.target?.egoEquipped)
        event.target.egoMeter = clampEgoMeter(
          (event.target.egoMeter || 0) + (event.blocked ? 4 : 7),
          100
        );
    }
    const kind = event.blocked ? 'block' : 'hit';
    this.hitstopFrames = Math.max(this.hitstopFrames, event.hitstop || (event.blocked ? 1 : 0));
    // Regular hits/blocks use hitstop and hit VFX, but never shake the whole screen.
    // Only Don's original third skill (U / Justice) keeps the dramatic camera shake.
    if (
      event.move?.id === 'special' ||
      event.move?.id === 'donEgo' ||
      event.move?.id === 'heathcliffEgo' ||
      event.move?.id === 'heathcliffBodysack'
    ) {
      const shakeStrength = event.blocked ? 3.5 : 9 + Math.min(5, event.damage * 0.07);
      this.cameraShake = Math.max(this.cameraShake, shakeStrength);
    }
    this.effects.push({
      kind,
      x: event.target.x,
      y: event.target.y + 35,
      text: event.blocked ? 'BLOCKED' : String(event.damage),
      detail: event.blocked ? `-${event.damage} CHIP` : event.move.name.toUpperCase(),
      at: this.effectClock,
      duration: event.blocked ? 0.62 : 0.82,
      attackerX: event.attacker.x,
      targetX: event.target.x,
      damage: event.damage,
    });
    if (!event.blocked) {
      // A compact slash burst remains attached to the impact point while the numbers rise.
      this.effects.push({
        kind: 'impact',
        x: event.target.x,
        y: event.target.y + event.target.bodyHeight * 0.36,
        text: '',
        detail: '',
        at: this.effectClock,
        duration: 0.32,
        attackerX: event.attacker.x,
        targetX: event.target.x,
      });
    }
    if (event.blocked)
      this.setMessage(`${event.target.name} BLOCKED the hit · ${event.damage} chip damage.`);
    else
      this.setMessage(`${event.attacker.name} landed ${event.move.name} · ${event.damage} damage.`);
    this.onHit(event);
    this.#updateHud();
  }

  #endRound(result) {
    if (!this.runningRound) return;
    this.runningRound = false;
    this.loop.stop();
    const resolve = this.roundResolver;
    this.roundResolver = null;
    resolve?.(result);
  }

  #updateHud() {
    if (this.playerBar)
      this.playerBar.style.transform = `scaleX(${clamp((this.player?.hp || 0) / (this.player?.maxHp || 1), 0, 1)})`;
    if (this.playerHpLabel && this.player)
      this.playerHpLabel.textContent = `${this.player.hp} / ${this.player.maxHp}`;
    if (this.playerEgoMeter && this.player) {
      this.playerEgoMeter.hidden = !this.player.egoEquipped;
      const meter = clampEgoMeter(this.player.egoMeter || 0, 100);
      if (this.playerEgoFill) this.playerEgoFill.style.transform = `scaleX(${meter / 100})`;
      if (this.playerEgoLabel) this.playerEgoLabel.textContent = `${meter}%`;
      this.playerEgoMeter.classList.toggle('is-ego-ready', meter >= 100);
    }
    for (const fighter of this.enemies) {
      const refs = this.enemyHudRefs.get(fighter.id);
      const fill = refs?.fill;
      const label = refs?.label;
      if (fill) fill.style.transform = `scaleX(${clamp(fighter.hp / fighter.maxHp, 0, 1)})`;
      if (label) label.textContent = `${fighter.hp}/${fighter.maxHp}`;
      const card = refs?.card;
      if (card) card.classList.toggle('is-defeated', !fighter.alive);
      if (
        fighter.egoEquipped ||
        (fighter.drawKey === 'heathcliff' && this.encounter === 'heathcliff')
      ) {
        const meter = clampEgoMeter(fighter.egoMeter || 0, 100);
        const egoFill = refs?.egoFill;
        const egoLabel = refs?.egoLabel;
        if (egoFill) egoFill.style.transform = `scaleX(${meter / 100})`;
        if (egoLabel) egoLabel.textContent = `${meter}%`;
        if (card) card.classList.toggle('is-ego-ready', meter >= HEATHCLIFF_EGO_CONFIG.maxGauge);
      }
    }
    if (this.liveStatus) {
      this.liveStatus.textContent = `${this.player?.state || 'Idle'} · ${this.player?.currentMove?.data?.name || 'Neutral'} · ${this.input.held.size ? [...this.input.held].join(' + ').toUpperCase() : 'NO INPUT'}`;
    }
    this.#updateSeriesHud();
  }

  render(alpha = 1, frameDelta = 1 / 60) {
    this.renderAlpha = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
    this.renderDelta = clamp(Number.isFinite(frameDelta) ? frameDelta : 1 / 60, 0, 0.05);
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.save();
    if (this.cameraShake > 0) {
      const shakeX = Math.sin(this.effectClock * 91) * this.cameraShake;
      const shakeY = Math.cos(this.effectClock * 73) * this.cameraShake * 0.38;
      ctx.translate(shakeX, shakeY);
    }
    this.#drawBackground(ctx);
    this.#drawAtmosphere(ctx);
    this.#drawStage(ctx);
    for (const fighter of this.fighters.slice().sort((a, b) => a.y - b.y))
      this.#drawFighter(ctx, fighter, this.renderAlpha);
    this.#drawEffects(ctx);
    ctx.restore();
    this.#drawEgoCutin(ctx);
    this.#drawCombatReadout(ctx);
    if (this.openingCardFrames > 0) this.#drawOpeningCard(ctx);
    this.onFps(this.loop.fps);
    if (this.fpsStatus)
      this.fpsStatus.textContent = `${Math.round(this.loop.fps || 60)} FPS · FIXED 60 Hz SIMULATION`;
  }

  #drawAtmosphere(ctx) {
    // Subtle cold motes and warm embers echo the reference's moving forest stage without
    // importing third-party art. They are decorative only and never affect combat timing.
    for (const particle of this.ambientParticles) {
      const age = this.effectClock * particle.speed + particle.phase;
      const x = (particle.x + Math.sin(age * 0.17) * 26 + LOGICAL_WIDTH) % LOGICAL_WIDTH;
      const y = (((particle.y - age * 0.42) % LOGICAL_HEIGHT) + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
      const alpha = 0.12 + (Math.sin(age * 0.3) + 1) * 0.12;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.phase % 3 < 1 ? '#cce6ec' : '#e8ba70';
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  #drawOpeningCard(ctx) {
    const progress = 1 - this.openingCardFrames / 52;
    const alpha = Math.min(1, progress * 5, (1 - progress) * 5 + 0.18);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = 'rgba(5,7,10,.48)';
    ctx.fillRect(0, 255, LOGICAL_WIDTH, 190);
    ctx.strokeStyle = 'rgba(230,194,118,.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 280);
    ctx.lineTo(960, 280);
    ctx.moveTo(320, 421);
    ctx.lineTo(960, 421);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d8bd7b';
    ctx.font = '900 13px system-ui,sans-serif';
    ctx.fillText(
      this.seriesActive
        ? this.seriesRound === 3
          ? 'FINAL ROUND · TIEBREAKER'
          : `ROUND ${this.seriesRound} OF 3`
        : this.trainingMode
          ? 'TRAINING MODE'
          : this.encounter === 'versus'
            ? 'VERSUS MATCH'
            : 'REAL-TIME FIGHTING',
      LOGICAL_WIDTH / 2,
      317
    );
    ctx.fillStyle = '#fff0cc';
    ctx.font = '1000 58px Georgia,serif';
    ctx.shadowColor = '#f7c65d';
    ctx.shadowBlur = 20;
    ctx.fillText('FIGHT!', LOGICAL_WIDTH / 2, 385);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#dfd0b5';
    ctx.font = '800 11px system-ui,sans-serif';
    ctx.fillText(
      `${this.player?.name || 'DON QUIXOTE'}  //  ${this.enemies.filter((enemy) => enemy.alive)[0]?.name || 'OPPONENT'}`.toUpperCase(),
      LOGICAL_WIDTH / 2,
      405
    );
    ctx.restore();
  }

  #drawBackground(ctx) {
    const bg = this._background;
    if (this._isReady(bg)) {
      const scale = Math.max(LOGICAL_WIDTH / bg.naturalWidth, LOGICAL_HEIGHT / bg.naturalHeight);
      const w = bg.naturalWidth * scale;
      const h = bg.naturalHeight * scale;
      ctx.drawImage(bg, (LOGICAL_WIDTH - w) / 2, (LOGICAL_HEIGHT - h) / 2, w, h);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      gradient.addColorStop(0, '#17202c');
      gradient.addColorStop(1, '#30241f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }
    ctx.fillStyle = 'rgba(7, 9, 14, .28)';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    const vignette = ctx.createRadialGradient(
      LOGICAL_WIDTH / 2,
      LOGICAL_HEIGHT / 2,
      150,
      LOGICAL_WIDTH / 2,
      LOGICAL_HEIGHT / 2,
      820
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.68)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  #drawStage(ctx) {
    ctx.fillStyle = 'rgba(6, 8, 12, .62)';
    ctx.beginPath();
    ctx.ellipse(LOGICAL_WIDTH / 2, GROUND_Y + 13, 620, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 196, 126, .36)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, GROUND_Y + 18);
    ctx.lineTo(LOGICAL_WIDTH - 50, GROUND_Y + 18);
    ctx.stroke();
  }

  #spriteFor(fighter) {
    // E.G.O sheets are optional until supplied. Once loaded, choose an E.G.O pose without
    // changing bodyWidth/bodyHeight, hurtboxes, or the canvas's logical scale.
    if (fighter.egoFormActive && fighter.egoSpriteSet) {
      const poseKey =
        fighter.state === 'Attack' && fighter.currentMove
          ? fighter.currentMove.data.animationKey || 'attack'
          : fighter.state.toLowerCase();
      const pose = fighter.egoSpriteSet[poseKey] || fighter.egoSpriteSet.idle;
      if (Array.isArray(pose) && pose.length)
        return pose[Math.floor(this.effectClock * 12) % pose.length];
      if (typeof pose === 'string') return pose;
    }
    if (fighter.drawKey === 'don') {
      if (fighter.state === 'Knockdown' || !fighter.alive) return battleDonSprites.dead;
      if (fighter.state === 'Hit') return battleDonSprites.hurt;
      if (fighter.state === 'Block' || fighter.state === 'Blockstun') return battleDonSprites.guard;
      if (fighter.state === 'Dash') return battleDonSprites.evade || battleDonSprites.moving;
      if (fighter.state === 'Run' || fighter.state === 'Jump') return battleDonSprites.moving;
      if (fighter.state === 'Attack' && fighter.currentMove) {
        // Read animationKey from the move data so Joust, Gallop and Justice each use
        // the correct original frame sequence rather than collapsing skill 2 into skill 3.
        const animationKey = fighter.currentMove.data.animationKey || 'joust';
        const animation = battleDonAnimations[animationKey];
        const frames = animation?.frames || [];
        if (frames.length) {
          const animationDuration =
            fighter.currentMove.data.animationFrames || fighter.moveTotalFrames;
          const frame = Math.max(
            0,
            Math.min(
              frames.length - 1,
              Math.floor(
                (fighter.currentMove.frame / Math.max(1, animationDuration)) * frames.length
              )
            )
          );
          return frames[frame];
        }
      }
      return battleDonSprites.idle;
    }
    if (fighter.drawKey === 'heathcliff') {
      if (!fighter.alive || fighter.state === 'Knockdown') return heathcliffSprites.hurt;
      if (fighter.state === 'Hit') return heathcliffSprites.hurt;
      if (fighter.state === 'Block' || fighter.state === 'Blockstun')
        return heathcliffSprites.guard;
      if (fighter.state === 'Dash' || fighter.state === 'Run' || fighter.state === 'Jump')
        return heathcliffSprites.moving;
      if (fighter.state === 'Attack' && fighter.currentMove) {
        const move = fighter.currentMove;
        const animation =
          heathcliffAnimations[move.data.animationKey] || heathcliffAnimations.skill1;
        const frames = animation.frames || [];
        if (frames.length) {
          const duration =
            move.data.animationFrames || animation.animationFrames || fighter.moveTotalFrames;
          if (move.data.animationKey === 'bodysack' && move.frame < move.data.startup)
            return heathcliffSprites.egoCharge;
          const animationFrame =
            move.data.animationKey === 'bodysack' ? move.frame - move.data.startup : move.frame - 1;
          const progress = clamp(animationFrame / Math.max(1, duration), 0, 0.9999);
          return frames[Math.min(frames.length - 1, Math.floor(progress * frames.length))];
        }
      }
      return (fighter.egoMeter || 0) >= HEATHCLIFF_EGO_CONFIG.maxGauge
        ? heathcliffSprites.egoCharge
        : heathcliffSprites.idle;
    }
    const spriteSet = enemySprites[fighter.drawKey] || enemySprites.club;
    if (!fighter.alive || fighter.state === 'Knockdown')
      return spriteSet.dead || spriteSet.hurt || spriteSet.idle;
    if (fighter.state === 'Hit') return spriteSet.hurt || spriteSet.idle;
    if (fighter.state === 'Block' || fighter.state === 'Blockstun')
      return spriteSet.windup || spriteSet.idle;
    if (fighter.state === 'Dash') return spriteSet.hurt || spriteSet.idle;
    if (fighter.state === 'Attack' && fighter.currentMove) {
      const frame = fighter.currentMove.frame;
      const move = fighter.currentMove.data;
      if (frame < move.startup) return spriteSet.windup || spriteSet.idle;
      if (fighter.drawKey === 'wolf') {
        const key =
          move.id === 'wolfSlash' ? 'sever' : move.id === 'enemyHeavy' ? 'mirageSlash' : 'attack';
        return spriteSet[key] || spriteSet.attack || spriteSet.idle;
      }
      return spriteSet.attack || spriteSet.windup || spriteSet.idle;
    }
    return spriteSet.idle || spriteSet.neutral;
  }

  #drawFighter(ctx, fighter, alpha = 1) {
    // Interpolate between fixed-step positions: eliminates visible 60 Hz stepping on 90/120/144 Hz displays.
    const renderX = fighter.previousX + (fighter.x - fighter.previousX) * alpha;
    const renderY = fighter.previousY + (fighter.y - fighter.previousY) * alpha;
    const source = this.#spriteFor(fighter);
    const isPlayer = fighter.team === 'player' || fighter.team === 'player2';
    const phase = (fighter.aiIndex || 0) * 0.83 + (isPlayer ? 0.4 : 0);
    const speedRatio = clamp(Math.abs(fighter.vx) / Math.max(1, fighter.walkSpeed), 0, 1.4);
    const movingPose = ['Run', 'Dash'].includes(fighter.state);

    // Keep the same base size across Idle/Run/Attack. The previous implementation changed
    // between e.g. 330px idle and 222px run instantly, making both characters visibly pop.
    // Enemy source art is lower resolution, so draw it a little smaller to avoid pixelation.
    // Don's run and lance-technique sheets are laid out in wide canvases around 330px high,
    // while his idle/guard sheets are portrait canvases. Use a matching reference height for
    // horizontal poses so his body does not become shorter just because the lance is long.
    const isDon = fighter.drawKey === 'don';
    const horizontalDonPose =
      isDon && (source?.includes('/base/skill') || source?.endsWith('/moving.png'));
    let visualHeight = isDon
      ? horizontalDonPose
        ? 330
        : 254
      : fighter.drawKey === 'wolf'
        ? 276
        : fighter.drawKey === 'heathcliff'
          ? 252
          : 218;
    if (fighter.state === 'Knockdown' || !fighter.alive) visualHeight *= 0.78;

    const groundOffset = Math.max(0, fighter.groundY - (renderY + fighter.bodyHeight));
    const baseY = GROUND_Y + 4 - groundOffset;
    const idleBob = fighter.state === 'Idle' ? Math.sin(this.effectClock * 3.1 + phase) * 2.2 : 0;
    const runBob = movingPose
      ? Math.sin(
          this.effectClock * (fighter.state === 'Dash' ? 25 : 15) + phase + renderX * 0.018
        ) *
        (1.4 + speedRatio * 1.8)
      : 0;
    const bob = idleBob + runBob;

    // Small procedural anticipation/follow-through adds life without adding fake sprite frames.
    let rotation = fighter.state === 'Hit' ? -fighter.facing * 0.065 : 0;
    let scaleX = 1;
    let scaleY = 1;
    if (fighter.state === 'Idle') {
      const breath = Math.sin(this.effectClock * 2.7 + phase) * 0.008;
      scaleX += breath * 0.5;
      scaleY -= breath;
    } else if (fighter.state === 'Run') {
      scaleY = 1 - Math.abs(Math.sin(this.effectClock * 15 + phase)) * 0.018 * speedRatio;
      scaleX = 1 + Math.abs(Math.sin(this.effectClock * 15 + phase)) * 0.009 * speedRatio;
      rotation = -Math.sign(fighter.vx || fighter.facing) * 0.025 * speedRatio;
    } else if (fighter.state === 'Dash') {
      scaleX = 1.045;
      scaleY = 0.965;
      rotation = -fighter.dashDirection * 0.035;
    } else if (fighter.state === 'Jump') {
      scaleX = 0.985;
      scaleY = 1.018;
    } else if (fighter.state === 'Attack' && fighter.currentMove) {
      const move = fighter.currentMove;
      const activeEnd = move.data.startup + move.data.active;
      if (move.frame < move.data.startup) {
        const windup = Math.sin((move.frame / Math.max(1, move.data.startup)) * Math.PI * 0.5);
        scaleX = 1 - windup * 0.025;
        scaleY = 1 + windup * 0.018;
        rotation = -fighter.facing * 0.045 * windup;
      } else if (move.frame < activeEnd) {
        scaleX = 1.035;
        scaleY = 0.975;
        rotation = fighter.facing * 0.035;
      } else {
        const recovery = clamp((move.frame - activeEnd) / Math.max(1, move.data.recovery), 0, 1);
        scaleX = 1.025 - recovery * 0.025;
        scaleY = 0.98 + recovery * 0.02;
      }
    }

    // Ground shadow is drawn at the interpolated position and tightens while airborne.
    ctx.save();
    ctx.globalAlpha = Math.max(0.07, 0.22 - groundOffset / 1050);
    ctx.fillStyle = '#020407';
    ctx.beginPath();
    const roughWidth = isPlayer
      ? visualHeight * 0.34
      : visualHeight * (fighter.drawKey === 'wolf' ? 0.48 : 0.45);
    ctx.ellipse(
      renderX,
      GROUND_Y + 10,
      Math.max(24, roughWidth * (groundOffset > 0 ? 0.72 : 1)),
      12 + Math.max(0, 14 - groundOffset * 0.03),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    const recoil = rotation;
    const pivotY = baseY + bob;
    ctx.save();
    ctx.translate(renderX, pivotY);
    ctx.scale(getSpriteFacingScale(fighter.team, fighter.facing, fighter.drawKey), 1);
    ctx.rotate(recoil);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-renderX, -pivotY);

    const pose = this.#getPoseBlend(fighter.id, source);
    const drawPose = (src, opacity) => {
      if (!src || opacity <= 0.001) return;
      const image = this._image(src);
      if (!this._isReady(image)) return;
      let height = visualHeight;
      let width = height * (image.naturalWidth / image.naturalHeight);
      // Bound wide poses horizontally but never shrink their height: the earlier uniform
      // max-width scale made the entire Don sprite shrink during attacks. Horizontal
      // compression is preferable to changing the character's floor/standing height.
      const maxWidth = isDon
        ? source?.endsWith('/moving.png')
          ? 520
          : 460
        : fighter.drawKey === 'wolf'
          ? 318
          : fighter.drawKey === 'heathcliff'
            ? 400
            : 218;
      if (width > maxWidth) width = maxWidth;
      const anchorX = this.#spriteAnchorX(fighter, src);
      ctx.save();
      ctx.globalAlpha *= opacity;
      ctx.drawImage(image, renderX - width * anchorX, baseY - height + bob, width, height);
      ctx.restore();
    };
    if (pose.previous && pose.progress < 1) drawPose(pose.previous, 1 - pose.progress);
    drawPose(source, pose.progress);
    if (fighter.flashFrames > 0 && fighter.flashFrames % 2 === 1) {
      // A compact white flash reads as impact feedback without shaking the screen.
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff4d8';
      ctx.fillRect(renderX - 24, baseY - visualHeight * 0.72, 48, visualHeight * 0.62);
    }
    ctx.restore();

    this.#drawSwingVfx(ctx, fighter, renderX, renderY);
    if (fighter.drawKey === 'heathcliff')
      this.#drawHeathcliffVfx(ctx, fighter, renderX, baseY + bob, visualHeight);

    // In the multi-enemy story encounter, unobtrusive labels keep each target identifiable.
    if (this.enemies.length > 1 && !isPlayer && fighter.alive) {
      ctx.font = '800 11px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(8,9,12,.72)';
      ctx.fillRect(renderX - 63, GROUND_Y + 25, 126, 19);
      ctx.fillStyle = '#e6d7bd';
      ctx.fillText(fighter.name.toUpperCase(), renderX, GROUND_Y + 38);
    }

    if (this.debugBoxes) {
      const hurt = fighter.getHurtbox();
      ctx.strokeStyle = '#5de1ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(hurt.x, hurt.y, hurt.width, hurt.height);
      const attack = fighter.getAttackBox();
      if (attack) {
        ctx.strokeStyle = '#ff5151';
        ctx.strokeRect(attack.x, attack.y, attack.width, attack.height);
      }
    }
  }

  #getPoseBlend(fighterId, source) {
    let transition = this.poseTransitions.get(fighterId);
    if (!transition) {
      transition = { current: source, previous: null, elapsed: this.renderDelta, progress: 1 };
      this.poseTransitions.set(fighterId, transition);
    } else if (transition.current !== source) {
      transition.previous = transition.current;
      transition.current = source;
      transition.elapsed = 0;
      transition.progress = 0;
    }
    if (transition.progress < 1) {
      transition.elapsed += this.renderDelta;
      transition.progress = clamp(transition.elapsed / 0.055, 0, 1);
      if (transition.progress >= 1) transition.previous = null;
    }
    return transition;
  }

  #spriteAnchorX(fighter, source) {
    // Anchor the visible body, not the center of long weapon trails in the source image.
    // This prevents Don's wide movement/skill poses from sliding away from their hurtbox.
    if (fighter.drawKey === 'don') {
      if (source?.endsWith('/moving.png')) return 0.7;
      if (source?.includes('/don/base/skill')) return 0.38;
      return 0.5;
    }
    if (source?.endsWith('/club-idle.png')) return 0.68;
    if (source?.endsWith('/leader-idle.png')) return 0.63;
    if (source?.endsWith('/elite-idle.png')) return 0.6;
    if (fighter.drawKey === 'heathcliff') {
      if (source?.endsWith('/moving.png')) return 0.54;
      if (source?.includes('/skill')) return 0.53;
      return 0.5;
    }
    return 0.5;
  }

  #drawHeathcliffVfx(ctx, fighter, renderX, baseY, visualHeight) {
    const move = fighter.currentMove;
    if (!move || !fighter.alive) return;
    const data = move.data;
    const activeEnd = data.startup + data.active;
    if (move.frame < data.startup || move.frame >= activeEnd) return;
    const animation = heathcliffAnimations[data.animationKey];
    const effects = animation?.effectFrames || [];
    if (!effects.length) return;
    const progress = clamp((move.frame - data.startup) / Math.max(1, data.active), 0, 0.999);
    const effect = effects[Math.min(effects.length - 1, Math.floor(progress * effects.length))];
    const image = this._image(effect.src);
    if (!this._isReady(image)) return;

    const isEgo = data.isEgo || data.animationKey === 'ego';
    const height = isEgo ? Math.max(150, visualHeight * 0.95) : Math.max(110, visualHeight * 0.62);
    const width = Math.min(isEgo ? 510 : 380, height * (image.naturalWidth / image.naturalHeight));
    const centerX = renderX + fighter.facing * (fighter.bodyWidth * 0.82 + (isEgo ? 65 : 34));
    const centerY = baseY - visualHeight * (isEgo ? 0.59 : 0.52);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(fighter.facing, 1);
    ctx.globalAlpha = isEgo ? 0.78 : 0.55;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(image, -width * 0.5, -height * 0.5, width, height);
    ctx.restore();
  }

  #drawEgoCutin(ctx) {
    if (this.egoCutinFrames <= 0) return;
    const image = this.egoCutinImage || this._heathcliffEgoCutin;
    const progress = this.egoCutinFrames / 90;
    const edgeFade = Math.min(1, (1 - progress) * 8 + 0.16, progress * 8 + 0.16);
    const alpha = clamp(edgeFade, 0, 0.94);
    const x = 700;
    const y = 92;
    const width = 548;
    const height = 308;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(13,7,17,.88)';
    ctx.fillRect(x - 8, y - 8, width + 16, height + 16);
    ctx.strokeStyle = 'rgba(182,106,255,.92)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 8, y - 8, width + 16, height + 16);
    if (this._isReady(image)) ctx.drawImage(image, x, y, width, height);
    ctx.fillStyle = 'rgba(8,5,12,.82)';
    ctx.fillRect(x, y + height - 30, width, 30);
    ctx.fillStyle = '#d6aaff';
    ctx.textAlign = 'left';
    ctx.font = '1000 15px system-ui,sans-serif';
    ctx.fillText(this.egoCutinLabel || 'E.G.O  //  ACTIVATION', x + 13, y + height - 10);
    ctx.restore();
  }

  #drawSwingVfx(ctx, fighter, renderX = fighter.x, renderY = fighter.y) {
    const move = fighter.currentMove;
    if (!move || !fighter.alive) return;
    const { data, frame } = move;
    const startupEnd = data.startup;
    const activeEnd = data.startup + data.active;
    const originX = renderX + fighter.facing * (fighter.bodyWidth * 0.42);
    const originY = renderY + fighter.bodyHeight * 0.43;

    if (frame < startupEnd) {
      const charge = 0.35 + 0.35 * Math.sin((frame / Math.max(1, startupEnd)) * Math.PI);
      ctx.save();
      ctx.globalAlpha = charge;
      ctx.strokeStyle = '#f4d47b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(originX + fighter.facing * 25, originY, 10 + frame * 1.7, -0.8, 0.8);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (frame >= activeEnd) return;

    const activeProgress = clamp((frame - startupEnd) / Math.max(1, data.active), 0, 1);
    const reach = (data.range || data.hitboxWidth || 110) * (0.78 + activeProgress * 0.22);
    if (data.id === 'special' || data.id === 'donEgo') {
      const animationKey = data.animationKey || 'justice';
      const effects = battleDonAnimations[animationKey]?.effectFrames || [];
      const windows = data.hitWindows || [{ start: 0 }];
      windows.forEach((window, index) => {
        const impactFrame = data.startup + window.start;
        if (frame < impactFrame || frame > impactFrame + 2) return;
        const fx = effects[index % Math.max(1, effects.length)];
        if (!fx) return;
        const image = this._image(fx.src);
        if (!this._isReady(image)) return;
        const fxHeight = 78;
        const fxWidth = fxHeight * (image.naturalWidth / image.naturalHeight);
        ctx.save();
        ctx.translate(originX + fighter.facing * 54, originY - 8);
        ctx.scale(fighter.facing, 1);
        ctx.globalAlpha = 0.92 - Math.abs(frame - impactFrame) * 0.2;
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(image, -fxWidth * 0.28, -fxHeight * 0.5, Math.min(370, fxWidth), fxHeight);
        ctx.restore();
      });
    }
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(fighter.facing, 1);
    ctx.globalAlpha = 0.78 - activeProgress * 0.18;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#14171a';
    ctx.lineWidth = ['heavy', 'special', 'wolfSlash'].includes(data.id) ? 25 : 16;
    ctx.beginPath();
    ctx.moveTo(4, 8);
    ctx.quadraticCurveTo(reach * 0.55, -58 - activeProgress * 10, reach, -7);
    ctx.stroke();
    ctx.strokeStyle = '#e9e2d0';
    ctx.lineWidth = ['heavy', 'special', 'wolfSlash'].includes(data.id) ? 7 : 4;
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.quadraticCurveTo(reach * 0.52, -52 - activeProgress * 9, reach - 5, -5);
    ctx.stroke();
    ctx.strokeStyle = '#d1b36b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(19, 13);
    ctx.quadraticCurveTo(reach * 0.55, -20, reach - 12, 0);
    ctx.stroke();
    ctx.restore();
  }

  #drawEffects(ctx) {
    for (const effect of this.effects) {
      const age = this.effectClock - effect.at;
      const progress = clamp(age / effect.duration, 0, 1);
      const fade = 1 - progress;
      if (effect.kind === 'sprite') {
        const image = this._image(effect.src);
        if (!this._isReady(image)) continue;
        ctx.save();
        ctx.globalAlpha = fade;
        const width = effect.width || 220;
        const height = effect.height || 150;
        ctx.translate(effect.x, effect.y);
        ctx.scale(effect.facing || 1, 1);
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
        continue;
      }
      if (effect.kind === 'impact') {
        const radius = 12 + progress * 55;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.lineCap = 'round';
        for (let i = 0; i < 9; i += 1) {
          const angle = (Math.PI * 2 * i) / 9 + 0.12;
          const inner = radius * (0.34 + (i % 3) * 0.04);
          const outer = radius + (i % 2) * 12;
          ctx.strokeStyle = i % 3 === 0 ? '#fff4c8' : '#e6bd67';
          ctx.lineWidth = i % 3 === 0 ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner * 0.65);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer * 0.65);
          ctx.stroke();
        }
        ctx.strokeStyle = '#fff0c5';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y, radius * 0.62, radius * 0.25, -0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      const y = effect.y - progress * (effect.kind === 'evade' ? 32 : 48);
      ctx.save();
      ctx.globalAlpha = fade;
      if (effect.kind === 'evade') {
        ctx.font = '1000 18px system-ui,sans-serif';
        ctx.fillStyle = '#b6f0ff';
        ctx.strokeStyle = '#08262e';
        ctx.lineWidth = 5;
      } else if (effect.kind === 'block') {
        ctx.font = '1000 17px system-ui,sans-serif';
        ctx.fillStyle = '#ffe18a';
        ctx.strokeStyle = '#3f2810';
        ctx.lineWidth = 5;
      } else {
        const size = 22 + Math.min(12, (effect.damage || 0) * 0.18);
        ctx.font = `1000 ${size}px system-ui,sans-serif`;
        ctx.fillStyle = (effect.damage || 0) >= 25 ? '#ffe08a' : '#fff8e9';
        ctx.strokeStyle = '#241a13';
        ctx.lineWidth = 5;
      }
      ctx.textAlign = 'center';
      ctx.strokeText(effect.text, effect.x, y);
      ctx.fillText(effect.text, effect.x, y);
      if (effect.detail) {
        ctx.font = '800 9px system-ui,sans-serif';
        ctx.fillStyle = effect.kind === 'block' ? '#efc870' : '#e7ddca';
        ctx.strokeStyle = '#121217';
        ctx.lineWidth = 3;
        ctx.strokeText(effect.detail, effect.x, y + 15);
        ctx.fillText(effect.detail, effect.x, y + 15);
      }
      ctx.restore();
    }
  }

  #drawCombatReadout(ctx) {
    if (!this.player) return;
    const x = 24;
    const y = LOGICAL_HEIGHT - 128;
    ctx.save();
    ctx.fillStyle = 'rgba(7,9,13,.72)';
    ctx.fillRect(x, y, 365, 63);
    ctx.strokeStyle = 'rgba(219,197,138,.45)';
    ctx.strokeRect(x, y, 365, 63);
    ctx.textAlign = 'left';
    ctx.font = '900 12px system-ui,sans-serif';
    ctx.fillStyle = this.trainingMode ? '#8ddbc9' : '#f1d99b';
    ctx.fillText(
      `${this.trainingMode ? 'TRAINING' : 'PLAYER'}  /  ${this.player.state.toUpperCase()}`,
      x + 12,
      y + 19
    );
    ctx.font = '12px system-ui,sans-serif';
    ctx.fillStyle = '#f5f1e7';
    const move = this.player.currentMove;
    ctx.fillText(
      move
        ? `${move.data.name} · ${move.frame}/${this.player.moveTotalFrames}f`
        : 'Neutral · Waiting for input',
      x + 12,
      y + 37
    );
    if (move) {
      const data = move.data;
      const frame = move.frame;
      const phase =
        frame < data.startup
          ? 'STARTUP'
          : frame < data.startup + data.active
            ? 'ACTIVE'
            : 'RECOVERY';
      ctx.textAlign = 'right';
      ctx.fillStyle = phase === 'ACTIVE' ? '#ffd75e' : '#f7efe2';
      ctx.font = '900 11px system-ui,sans-serif';
      ctx.fillText(`${phase}  ${data.startup}/${data.active}/${data.recovery}`, x + 352, y + 53);
    } else {
      ctx.font = '800 9px system-ui,sans-serif';
      ctx.fillStyle = '#bdb29f';
      ctx.fillText('FRAME DATA: STARTUP / ACTIVE / RECOVERY', x + 12, y + 53);
    }
    ctx.restore();
  }

  async showResult(victory, { standalone = false, training = false } = {}) {
    this.loop.stop();
    this.runningRound = false;
    this._paused = false;
    this._resultVictory = !!victory;
    this._standaloneResult = !!standalone;
    if (this.mainMenuButton) this.mainMenuButton.hidden = !standalone;
    this.resultPanel.hidden = false;
    const localVersus = this.encounter === 'versus' && !!this.versusConfig?.localMultiplayer;
    const friendlySpar = this.encounter === 'heathcliff';
    this.resultEyebrow.textContent = friendlySpar
      ? 'FRIENDLY SPAR COMPLETE'
      : victory
        ? 'ENCOUNTER COMPLETE'
        : 'FIGHT OVER';
    this.resultTitle.textContent = localVersus
      ? 'MATCH COMPLETE'
      : friendlySpar
        ? 'SPAR COMPLETE'
        : victory
          ? 'VICTORY'
          : 'DEFEAT';
    this.resultCopy.textContent = this.seriesActive
      ? `${localVersus ? (victory ? this.player?.name : this.enemies[0]?.name) : friendlySpar ? (victory ? 'Don' : this.enemies[0]?.name || 'Heathcliff') : victory ? 'Don' : this.enemies[0]?.name || 'Opponent'} wins the best-of-three ${friendlySpar ? 'spar' : 'match'} ${Math.max(this.seriesScores.player, this.seriesScores.enemy)}–${Math.min(this.seriesScores.player, this.seriesScores.enemy)}. ${victory ? 'Two round coins secured.' : 'The opponent secured two round coins.'}`
      : standalone
        ? training
          ? 'Training round complete. Reset, rematch, or return to the main menu.'
          : victory
            ? 'Victory. Rematch or return to the main menu.'
            : 'Defeat. Try again or return to the main menu.'
        : victory
          ? 'The path is clear. Continue the story when ready.'
          : 'The opponent got the better of Don. Retry the encounter to try again.';
    this.resultButton.textContent = standalone
      ? training
        ? 'RESET TRAINING'
        : 'REMATCH'
      : victory
        ? 'CONTINUE STORY'
        : 'RETRY ENCOUNTER';
    this.resultButton.classList.toggle('is-defeat', !victory);
    this.resultButton.focus?.();
    return new Promise((resolve) => {
      this._resultResolver = resolve;
    });
  }

  dispose() {
    this._disposed = true;
    this.runningRound = false;
    this._paused = false;
    this.loop.stop();
    this.gamepadAdapter?.dispose?.();
    this.input.dispose();
    this.root.hidden = true;
    this.resultPanel.hidden = true;
  }
}

function clampEgoMeter(value, max) {
  return Math.max(0, Math.min(max, Number(value) || 0));
}

function encounterIsWolf(encounter) {
  return encounter === 'wolf';
}
