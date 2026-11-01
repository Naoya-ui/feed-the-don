import { DOM as els } from "./ui/DOMManager.js";
import { Helpers } from "./utils/Helpers.js";
import { Player } from "./core/Player.js";
import { BattleSystem } from "./core/BattleSystem.js";
import { CoinSystem } from "./core/CoinSystem.js";
import { SkillSystem } from "./core/SkillSystem.js";
import { ClashSystem } from "./core/ClashSystem.js";
import { TurnSystem } from "./core/TurnSystem.js";
import { RealtimeBattleMode } from "./fighting/RealtimeBattleMode.js";
import { VERSUS_ROSTER, getVersusCharacter, getVersusEgo } from "./data/versusRoster.js";
import { normalizeKey, displayKey } from "./fighting/InputHandler.js";
import { VoiceLineManager } from "./utils/VoiceLineManager.js";
import { VOICE_LINE_CATALOG } from "./data/voiceLines.js";
import { LimbusContentLibrary } from "./data/LimbusContentLibrary.js";
import { EgoSystem } from "./core/EgoSystem.js";
import { EnemyAI } from "./core/EnemyAI.js";
import { assets, battleDonSprites, battleDonAnimations, battleUiIcons, itemDB, characters } from "./data/characters.js";
import { enemySprites, enemyBattleSkills, enemySkillText, enemySkillEffects, wolfBoss, wolfBattleSkills, wolfSkillRotation } from "./data/enemies.js";
import { donBattleSkills, keywordDescriptions } from "./data/skills.js";
import { travelTime, wolfIntroDialogue } from "./data/story.js";
import { AssetManager } from "./core/AssetManager.js";
import assetManifest from "./core/asset-manifest.json" with { type: "json" };
import { AudioManager } from "./utils/AudioManager.js";
import { ASSETS } from "./core/Constants.js";
import { CharacterSelect } from "./ui/CharacterSelect.js";

const loaderText = document.getElementById('assetLoadingText');
const loaderFill = document.getElementById('assetLoadingFill');
await AssetManager.preload(assetManifest, { concurrency: 12, onProgress(done, total) {
  const percent = total ? Math.round(done / total * 100) : 100;
  if (loaderText) loaderText.textContent = `LOADING ASSETS · ${percent}%`;
  if (loaderFill) loaderFill.style.transform = `scaleX(${percent / 100})`;
} });
document.getElementById('assetLoadingScreen')?.classList.add('is-ready');

  const SAVE_KEY = "raise-don-quixote-html-save-v1";
  const BUILD_TAG = "v74-local-versus-loadouts-global-settings";

  const battleImagePreload = [
    ...Object.values(battleDonSprites),
    ...Object.values(battleDonAnimations).flatMap((animation) => animation.frames || []),
    ...Object.values(enemySprites).flatMap((poses) => Object.values(poses)),
    ...Object.values(battleUiIcons.sins),
    battleUiIcons.attack, battleUiIcons.defense, battleUiIcons.evade, battleUiIcons.sanity, battleUiIcons.target,
  ];
  [...new Set(battleImagePreload)].forEach((src) => {
    if (!src) return;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });

  const mapImages = {
    Bus: assets.backgrounds.bus,
    Town: assets.backgrounds.town,
    Shop: assets.backgrounds.shop,
    Forest: assets.backgrounds.forest,
  };


  const STATUS_ICON_ASSETS = {
    haste: 'assets/images/battle/icons/statuses/haste.png',
    bleed: 'assets/images/battle/icons/statuses/bleed.png',
    rupture: 'assets/images/battle/icons/statuses/rupture.png',
    poise: 'assets/images/battle/icons/statuses/poise.png',
    attackUp: 'assets/images/battle/icons/statuses/attack-up.png',
    damageUp: 'assets/images/battle/icons/statuses/damage-up.png',
    stagger: 'assets/images/battle/icons/statuses/stagger.png',
    sanity: 'assets/images/battle/icons/statuses/sanity.png',
    shield: 'assets/images/battle/icons/statuses/shield.png',
    burn: 'assets/images/battle/icons/statuses/burn.png',
  };

  const STATUS_HELP = {
    haste: 'Haste raises Speed next turn.',
    bleed: 'Bleed deals damage equal to Potency whenever the unit flips coins, reducing Count after each trigger.',
    rupture: 'Rupture deals bonus damage when the unit is hit, then spends 1 Count.',
    poise: 'Poise grants a Critical chance based on Potency. A Critical spends 1 Poise Count.',
    attackUp: 'Attack Up increases Don Quixote\'s outgoing attack power this turn.',
    damageUp: 'Damage Up increases the final damage dealt by that unit.',
    stagger: 'A Staggered unit cannot Clash and takes double damage from one-sided attacks.',
    sanity: 'SP / Sanity affects coin flips and certain skills.',
    shield: 'A defensive effect that helps absorb pressure.',
    burn: 'Burn deals damage at turn-based triggers depending on the encounter rules.',
  };

  Object.values(STATUS_ICON_ASSETS).forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });


  const DAMAGE_TYPE_ICONS = {
    Slash: 'assets/images/battle/ui/v60/slash.png',
    Pierce: 'assets/images/battle/ui/v60/pierce.png',
    Blunt: 'assets/images/battle/ui/v60/blunt.png',
  };
  const V60_UI = {
    targetRing: 'assets/images/battle/ui/v60/target-ring.png',
    staggerBurst: 'assets/images/battle/ui/v60/stagger-burst.png',
    startGear: 'assets/images/battle/ui/v60/start-gear.png',
    actionSlot: 'assets/images/battle/ui/v60/action-slot-frame.png',
    unitGauge: 'assets/images/battle/ui/v60/unit-gauge-ring.png',
  };
  [...Object.values(DAMAGE_TYPE_ICONS), ...Object.values(V60_UI)].forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });

  function damageTypeIcon(type = '') {
    const label = String(type || '').trim();
    return DAMAGE_TYPE_ICONS[label] || '';
  }
  function damageTypeMarkup(type = '', cls = 'lc60-type-icon') {
    const src = damageTypeIcon(type);
    return src ? `<img class="${cls}" src="${src}" alt="${escapeHTML(String(type))}" />` : '';
  }

  const EGO_ASSETS = {
    card: 'assets/images/battle/ego/ego-card-composite.png',
    art: 'assets/images/battle/ego/frame-art.png',
    info: 'assets/images/battle/ego/skill-info.png',
    portrait: 'assets/images/battle/ego/cutin-portrait.png',
    shatter: 'assets/images/battle/ego/shatter.png',
    frames: Array.from({ length: 7 }, (_, i) => `assets/images/battle/ego/frames/ego_${String(i + 1).padStart(2, '0')}.png`),
  };
  [EGO_ASSETS.card, EGO_ASSETS.art, EGO_ASSETS.info, EGO_ASSETS.portrait, EGO_ASSETS.shatter, ...EGO_ASSETS.frames].forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });

  // Battle mechanics are rebuilt from the uploaded gameplay reference:
  // command phase -> speed/action slots -> targeting lines -> clash resolution -> attack phase.
  // Don battle sprites/skill GIFs below are the user-supplied assets for this project.
  function getEnemySkillPool(enemy) {
    if (!enemy) return enemyBattleSkills.club;
    if (enemy.spriteKey === "wolf") {
      return wolfSkillRotation.map((key) => wolfBattleSkills[key]).filter(Boolean);
    }
    return enemyBattleSkills[enemy.spriteKey] || enemyBattleSkills[enemy.role?.toLowerCase?.()] || enemyBattleSkills.club;
  }

  const battleTutorialSteps = [
    { title: "DRAG A SKILL TO TARGET", text: "Choose one of the two skill cards in a speed slot, then drag that card onto an enemy action. No target is chosen for you at the start." },
    { title: "READ THE CLASH LINE", text: "Once a skill is targeted, a colored arrow appears. Green is favorable, gold is close, and red is dangerous." },
    { title: "AUTO CHAIN IS OPTIONAL", text: "WIN RATE automatically builds safer clashes. DAMAGE automatically builds a higher-damage chain. These are the only automatic targeting buttons." },
    { title: "RESOLVE THE TURN", text: "When every action has a target, press START. Clash winners attack; unopposed actions strike without a Clash." },
  ];

  let state = makeInitialState();
  let advanceHandler = null;
  let backpackReminderTimer = null;
  let noticeTimer = null;
  let dialogueTypeTimer = null;
  let dialogueTyping = false;
  let dialogueFullText = "";
  let interactionLocked = false;
  let battle = null;
  let realtimeMode = null;
  let realtimeBattleActive = false;
  let battleInputResolver = null;
  let enemyInspectorHoverTimer = null;
  let battleResultResolver = null;
  let standaloneStarting = false;
  const HITBOX_SETTING_KEY = "raise-don-quixote-show-hitboxes-v1";
  const KEY_BINDINGS_STORAGE_KEY = "raise-don-quixote-key-bindings-v1";
  const CONTROLLER_STORAGE_KEY = "raise-don-quixote-controller-settings-v1";
  const DEFAULT_KEY_BINDINGS = Object.freeze({
    p1: Object.freeze({ left: "a", right: "d", jump: "w", guard: "s", light: "j", heavy: "k", special: "u", ego: "i", dash: "l" }),
    p2: Object.freeze({ left: "arrowleft", right: "arrowright", jump: "arrowup", guard: "arrowdown", light: "numpad1", heavy: "numpad2", special: "numpad3", dash: "numpad4", ego: "numpad5" }),
  });
  const CONTROL_ACTIONS = [
    { key: "left", label: "Move left" }, { key: "right", label: "Move right" },
    { key: "jump", label: "Jump" }, { key: "guard", label: "Guard" },
    { key: "light", label: "Skill 1 / Light" }, { key: "heavy", label: "Skill 2 / Heavy" },
    { key: "special", label: "Skill 3" }, { key: "ego", label: "E.G.O Move / Form" }, { key: "dash", label: "Dash" },
  ];
  const DEFAULT_CONTROLLER_SETTINGS = {
    player: "p1", index: -1, deadzone: 0.35,
    buttons: { jump: 0, dash: 1, light: 2, heavy: 3, special: 4, guard: 5, ego: 6 },
  };
  function readJsonSetting(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch { return fallback; }
  }
  function loadKeyBindings() {
    const saved = readJsonSetting(KEY_BINDINGS_STORAGE_KEY, {});
    return {
      p1: { ...DEFAULT_KEY_BINDINGS.p1, ...(saved.p1 || {}) },
      p2: { ...DEFAULT_KEY_BINDINGS.p2, ...(saved.p2 || {}) },
    };
  }
  function loadControllerSettings() {
    const saved = readJsonSetting(CONTROLLER_STORAGE_KEY, {});
    return {
      ...DEFAULT_CONTROLLER_SETTINGS, ...saved,
      buttons: { ...DEFAULT_CONTROLLER_SETTINGS.buttons, ...(saved.buttons || {}) },
    };
  }
  let keyBindings = loadKeyBindings();
  let controllerSettings = loadControllerSettings();
  let showHitboxesSetting = (() => {
    try { return localStorage.getItem(HITBOX_SETTING_KEY) === "true"; }
    catch { return false; }
  })();
  let sfxContext = null;
  let targetLineRaf = 0;
  let targetLinePointer = null;
  let dragHoverIntentId = null;


  // ===== V48 AUDIO =====
  const audioEngine = new AudioManager();
  const battleBgm = new Audio("assets/audio/canto-1-battle-theme-a2.wav");
  battleBgm.loop = true;
  battleBgm.preload = "auto";
  battleBgm.volume = 0;

  let musicMode = "story";
  const musicFadeTokens = new WeakMap();

  const DON_SKILL_SFX = {
    joust: ["assets/audio/don-skills/028_donquixote_base_skill1_a_v1.wav"],
    gallop: ["assets/audio/don-skills/029_donquixote_base_skill2_a_v1.wav"],
    justice: [
      "assets/audio/don-skills/030_donquixote_base_skill3-1_a_v1.wav",
      "assets/audio/don-skills/030_donquixote_base_skill3-2_a_v1.wav",
      "assets/audio/don-skills/030_donquixote_base_skill3-3_a_v1.wav",
    ],
    laSangre: [
      "assets/audio/don-skills/030_donquixote_base_skill3-1_a_v1.wav",
      "assets/audio/don-skills/030_donquixote_base_skill3-2_a_v1.wav",
      "assets/audio/don-skills/030_donquixote_base_skill3-3_a_v1.wav",
    ],
  };

  const ENEMY_ATTACK_SFX = {
    clumsyChop: "assets/audio/enemy/001_backstreet_mob_skill1_a_v1.wav",
    clunkyStab: "assets/audio/enemy/002_backstreet_mob_skill2_a_v1.wav",
    weakBlow: "assets/audio/enemy/003_backstreet_mob_skill3_a_v1.wav",
    heavyStrike: "assets/audio/enemy/004_backstreet_boss_skill2_a_v1.wav",
  };
  // Decode the most-used combat cues while the loading screen is still active; actual playback
  // remains gated by browser user gesture, but the first frame no longer pays decode cost.
  void audioEngine.preloadSfx({
    'sfx:don:joust:0': DON_SKILL_SFX.joust[0], 'sfx:don:gallop:0': DON_SKILL_SFX.gallop[0],
    'sfx:heathcliff:heathcliffSkill1': 'assets/audio/heathcliff/040_heathclif_base_skill1_a_v1.wav',
    'sfx:heathcliff:heathcliffSkill2': 'assets/audio/heathcliff/041_heathclif_base_skill2_a_v1.wav',
    'sfx:enemy:clumsyChop': ENEMY_ATTACK_SFX.clumsyChop, 'sfx:enemy:heavyStrike': ENEMY_ATTACK_SFX.heavyStrike,
  });

  function masterVolume() {
    return Math.max(0, Math.min(1, Number(state?.volume ?? 20) / 100));
  }

  // Voice lines play when a move begins, so they remain audible on a whiff or a blocked hit.
  // Populate event buckets in js/data/voiceLines.js when additional local clips are imported.
  const voiceLineManager = new VoiceLineManager({
    catalog: VOICE_LINE_CATALOG,
    volumeProvider: () => masterVolume() * 0.94,
    enabledProvider: () => true,
  });

  // An optional, editable local database for Limbus-related records. Failure to load this
  // extra catalogue never blocks the main game. Add permanent records to the JSON file;
  // DevTools can use window.DonLimbusLibrary for search/upsert while developing.
  const limbusContentLibrary = new LimbusContentLibrary({ url: "assets/data/limbus-library/catalog.json" });
  if (typeof window !== "undefined") window.DonLimbusLibrary = limbusContentLibrary;
  const limbusContentLibraryReady = limbusContentLibrary.load().catch((error) => {
    console.warn("[Limbus content library] Optional catalogue was not loaded:", error.message);
    return null;
  });
  if (typeof window !== "undefined") window.DonLimbusLibraryReady = limbusContentLibraryReady;

  function voiceCharacterId(fighter) {
    if (!fighter) return "don";
    if (fighter.drawKey === "don") return "don";
    if (fighter.drawKey === "wolf") return "wolf";
    if (fighter.drawKey === "heathcliff") return "heathcliff";
    return "club";
  }

  function playRealtimeMoveVoice({ attacker, move }) {
    if (!attacker || !move) return;
    const characterId = voiceCharacterId(attacker);
    // Animation keys are stable catalogue keys for both player and AI moves.
    const attackKey = move.animationKey || move.id || "joust";
    voiceLineManager.playAttack(characterId, attackKey);
    if (attacker.drawKey === 'heathcliff') {
      const skill = move.id === 'heathcliffSkill2' ? '041_heathclif_base_skill2_a_v1.wav'
        : (move.id === 'heathcliffSkill3' || move.id === 'heathcliffBodysack' || move.id === 'heathcliffEgo') ? '042_heathclif_base_skill3-1_a_v1.wav'
          : '040_heathclif_base_skill1_a_v1.wav';
      void audioEngine.playSFX(`heathcliff:${move.id}`, `assets/audio/heathcliff/${skill}`, { volume: masterVolume() * 0.88, maxVoices: 2, minIntervalMs: 40 });
    } else if (attacker.drawKey === 'don' && (move.isEgo || move.id === 'donEgo')) {
      playDonSkillHitSfx('laSangre', 0);
    }
  }

  function playRealtimeReactionVoice(event) {
    const target = event?.target;
    if (!target) return;

    // Use the supplied LCB "kill" line only when Don defeats a target but the
    // encounter still has another living opponent. The final KO is followed by
    // the dedicated victory line, avoiding two long voice clips overlapping.
    if (!target.alive) {
      const anotherOpponentAlive = !!realtimeMode?.enemies?.some((fighter) => fighter.alive);
      if (event.attacker?.team === "player" && anotherOpponentAlive) {
        voiceLineManager.playEvent("don", "kill", { cooldownMs: 800 });
      }
      return;
    }

    const characterId = voiceCharacterId(target);
    const eventKey = event.evaded ? "evade" : event.blocked ? "block" : "hurt";
    voiceLineManager.playEvent(characterId, eventKey, { cooldownMs: 450 });
  }

  // Lobby/idle voices are only started following a click, respecting browser
  // autoplay rules. The greeting is picked by the player's local time.
  function playDonLobbyVoice() {
    const hour = new Date().getHours();
    const ambientKey = hour < 11 ? "lobbyMorning" : hour < 18 ? "lobbyNoon" : "lobbyNight";
    return voiceLineManager.playAmbient("don", ambientKey, { cooldownMs: 30000 });
  }

  function playDonSmalltalk() {
    return voiceLineManager.playAmbient("don", "smalltalk", { cooldownMs: 12000 });
  }

  // Small development hook to preview a registered line without coupling future
  // character-data tools to the battle controller.
  if (typeof window !== "undefined") {
    window.DonVoiceLines = Object.freeze({
      playAttack: (...args) => voiceLineManager.playAttack(...args),
      playEvent: (...args) => voiceLineManager.playEvent(...args),
      playAmbient: (...args) => voiceLineManager.playAmbient(...args),
      stopAll: () => voiceLineManager.stopAll(),
    });
  }

  function fadeAudio(audio, targetVolume, duration = 600, pauseWhenSilent = false) {
    if (!audio) return;
    const token = Symbol("audio-fade");
    musicFadeTokens.set(audio, token);
    const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
    const endVolume = Math.max(0, Math.min(1, targetVolume));
    const startedAt = performance.now();

    const step = (now) => {
      if (musicFadeTokens.get(audio) !== token) return;
      const t = Math.min(1, Math.max(0, (now - startedAt) / Math.max(1, duration)));
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      audio.volume = startVolume + (endVolume - startVolume) * eased;
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      audio.volume = endVolume;
      if (pauseWhenSilent && endVolume <= 0.001) audio.pause();
    };

    requestAnimationFrame(step);
  }

  function playBattleTheme() {
    musicMode = "battle";
    const target = masterVolume();
    fadeAudio(els.bgm, 0, 550, true);
    battleBgm.pause();
    void audioEngine.playBGM('battle', ASSETS.audio.bgm.story, { volume: target, loop: true, fadeSeconds: 0.7 });
  }

  function restoreStoryTheme() {
    musicMode = "story";
    const target = masterVolume();
    if (els.bgm) {
      els.bgm.volume = 0;
      els.bgm.play().catch(() => {});
    }
    audioEngine.stopBGM(0.55);
    fadeAudio(els.bgm, target, 700);
  }

  function resetBattleAudio() {
    musicFadeTokens.delete(battleBgm);
    battleBgm.pause();
    battleBgm.currentTime = 0;
    battleBgm.volume = 0;
    audioEngine.stopBGM(0);
    musicMode = "story";
  }

  function playDonSkillHitSfx(skillKey, hitIndex = 0) {
    const sounds = DON_SKILL_SFX[skillKey];
    if (!sounds?.length || (!['justice', 'laSangre'].includes(skillKey) && hitIndex > 0)) return false;
    const index = ['justice', 'laSangre'].includes(skillKey) ? Math.min(hitIndex, sounds.length - 1) : 0;
    void audioEngine.playSFX(`don:${skillKey}:${index}`, sounds[index], { volume: masterVolume() * 0.9, maxVoices: 3, minIntervalMs: 24 });
    return true;
  }

  function playEnemyAttackSfx(skillKey) {
    const src = ENEMY_ATTACK_SFX[skillKey];
    if (!src) return false;
    void audioEngine.playSFX(`enemy:${skillKey}`, src, { volume: masterVolume() * 0.92, maxVoices: 3, minIntervalMs: 28 });
    return true;
  }

  function makeInitialState() {
    return {
      version: 3,
      scene: "start",
      step: 0,
      playerName: "Dante",
      currentLocation: "Bus",
      lastLocation: "Bus",
      gameTime: 0,
      inventory: {},
      mapUnlocked: { Bus: true, Town: false, Shop: false, Forest: false },
      questClear: { Tutorial: false, GoTown: false, ForestPass: false },
      forestIntroSeen: false,
      forestBattleSeen: false,
      forestBattleWon: false,
      wolfIntroSeen: false,
      wolfBattleSeen: false,
      wolfBattleWon: false,
      heathcliffIntroSeen: false,
      heathcliffBattleSeen: false,
      heathcliffBattleWon: false,
      battleIntroSeen: false,
      backpackOpened: false,
      tutorialActive: true,
      volume: 20,
    };
  }

  function setBackground(name) {
    const src = assets.backgrounds[name];
    els.background.style.backgroundImage = src ? `url("${src}")` : "none";
    els.background.style.backgroundColor = name === "black" ? "#000" : "#08090a";
  }

  function setCharacter(name, visible = true) {
    els.character.classList.remove("wolf-portrait", "heathcliff-portrait");
    const src = assets.characters[name];
    if (!visible || !src) {
      els.character.hidden = true;
      return;
    }
    els.character.src = src;
    els.character.hidden = false;
  }

  function setWolfCharacter(visible = true) {
    if (!visible) {
      els.character.classList.remove("wolf-portrait");
      els.character.hidden = true;
      return;
    }
    els.character.classList.remove("heathcliff-portrait");
    els.character.src = "assets/images/characters/wolf.png";
    els.character.classList.add("wolf-portrait");
    els.character.hidden = false;
  }

  function setHeathcliffCharacter(visible = true) {
    if (!visible) {
      els.character.classList.remove("heathcliff-portrait");
      els.character.hidden = true;
      return;
    }
    els.character.classList.remove("wolf-portrait");
    els.character.src = assets.characters.heathcliff || "assets/images/characters/heathcliff.png";
    els.character.classList.add("heathcliff-portrait");
    els.character.hidden = false;
  }

  function addItem(name, amount = 1) {
    state.inventory[name] = (state.inventory[name] || 0) + amount;
    updateBackpackCount();
  renderKeyboardBindings();
  renderControllerSettings();
  syncGlobalSettingsButton();
  }

  function updateBackpackCount() {
    const count = Object.values(state.inventory).reduce((a, b) => a + b, 0);
    els.backpackCount.textContent = String(count);
  }

  function storyLocationLabel() {
    if (state.scene === "start" || state.scene === "story1" || state.scene === "backpack" || state.scene === "mapTutorial") return "DON QUIXOTE'S ROOM";
    if (state.currentLocation === "Bus") return "MEPHISTOPHELES INTERIOR";
    if (state.currentLocation === "Town") return "TOWN DISTRICT";
    if (state.currentLocation === "Shop") return "SHOP";
    if (state.currentLocation === "Forest" || state.scene === "forestEncounter") return "FOREST OUTSKIRTS";
    return String(state.currentLocation || "STORY").toUpperCase();
  }

  function speakerRoleFor(name) {
    if (!name) return "";
    if (name === "Don Quixote") return "LCB SINNER";
    if (name === "Bandit Leader") return "FOREST BANDIT";
    if (name === "Wolf") return "FOREST WANDERER";
    if (name === state.playerName) return "MANAGER";
    return "STORY CHARACTER";
  }

  function setStoryChromeVisible(visible) {
    document.getElementById("game")?.classList.toggle("story-mode", !!visible);
    if (els.storyLocationPlaque) els.storyLocationPlaque.hidden = !visible;
    if (els.storyMenuHex) els.storyMenuHex.hidden = !visible;
    if (visible && els.storyLocationText) els.storyLocationText.textContent = storyLocationLabel();
  }

  function updateHUD() {
    els.hudLocation.textContent = state.currentLocation;
    els.hudTime.textContent = `${state.gameTime} min`;
    els.mapTime.textContent = `${state.gameTime} min`;
    els.mapLocation.textContent = state.currentLocation;
    if (els.storyLocationText) els.storyLocationText.textContent = storyLocationLabel();
  }

  function showNotice(text, duration = 1800) {
    clearTimeout(noticeTimer);
    els.notice.textContent = text;
    els.notice.hidden = false;
    noticeTimer = setTimeout(() => { els.notice.hidden = true; }, duration);
  }

  function finishDialogueTyping() {
    if (dialogueTypeTimer) clearTimeout(dialogueTypeTimer);
    dialogueTypeTimer = null;
    dialogueTyping = false;
    els.dialogue.textContent = dialogueFullText;
    els.dialogueBox.classList.remove("is-typing");
  }

  function startDialogueTyping(text) {
    dialogueFullText = String(text ?? "");
    if (dialogueTypeTimer) clearTimeout(dialogueTypeTimer);
    els.dialogue.textContent = "";
    dialogueTyping = true;
    els.dialogueBox.classList.add("is-typing");
    let index = 0;
    const tick = () => {
      if (!dialogueTyping) return;
      if (index >= dialogueFullText.length) {
        finishDialogueTyping();
        return;
      }
      const ch = dialogueFullText[index++];
      els.dialogue.textContent += ch;
      let delayMs = 16;
      if (/[,.!?;:]/.test(ch)) delayMs = 34;
      else if (ch === "\n") delayMs = 0;
      else if (ch === " ") delayMs = 10;
      dialogueTypeTimer = setTimeout(tick, delayMs);
    };
    tick();
  }

  function say(speaker, text) {
    closeChoices();
    els.speaker.textContent = speaker || "";
    els.speaker.hidden = !speaker;
    if (els.speakerRole) {
      const role = speakerRoleFor(speaker);
      els.speakerRole.textContent = role;
      els.speakerRole.hidden = !role;
    }
    els.dialogueBox.hidden = false;
    startDialogueTyping(text);
    interactionLocked = false;
    return waitForAdvance();
  }

  function waitForAdvance() {
    return new Promise((resolve) => {
      advanceHandler = () => {
        if (interactionLocked) return;
        if (dialogueTyping) {
          finishDialogueTyping();
          return;
        }
        advanceHandler = null;
        resolve();
      };
    });
  }

  function choose(options) {
    els.dialogueBox.hidden = true;
    els.choices.innerHTML = "";
    els.choices.hidden = false;
    return new Promise((resolve) => {
      options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.dataset.index = String(i + 1).padStart(2, "0");
        btn.textContent = opt.label;
        btn.addEventListener("click", () => {
          closeChoices();
          resolve(opt.value ?? opt.label);
        });
        els.choices.appendChild(btn);
      });
    });
  }

  function closeChoices() {
    els.choices.hidden = true;
    els.choices.innerHTML = "";
  }

  function showNameInput() {
    interactionLocked = true;
    els.dialogueBox.hidden = true;
    els.nameModal.hidden = false;
    els.nameInput.value = state.playerName === "Manager" ? "" : state.playerName;
    setTimeout(() => els.nameInput.focus(), 50);
    return new Promise((resolve) => {
      const finish = () => {
        const value = els.nameInput.value.trim().slice(0, 16) || "Dante";
        state.playerName = value;
        els.nameModal.hidden = true;
        interactionLocked = false;
        els.nameConfirm.removeEventListener("click", finish);
        resolve(value);
      };
      els.nameConfirm.addEventListener("click", finish);
      els.nameInput.onkeydown = (event) => { if (event.key === "Enter") finish(); };
    });
  }

  function renderInventory() {
    const entries = Object.entries(state.inventory);
    els.inventoryList.innerHTML = "";
    if (!entries.length) {
      els.inventoryList.innerHTML = `<div class="empty-state">You have no items.</div>`;
      return;
    }
    entries.forEach(([name, qty]) => {
      const meta = itemDB[name] || { desc: "Unknown item.", icon: "" };
      const row = document.createElement("div");
      row.className = "inventory-item";
      row.innerHTML = `
        <img src="${meta.icon}" alt="${escapeHTML(name)}" />
        <div><h3>${escapeHTML(name)}</h3><p>${escapeHTML(meta.desc)}</p></div>
        <div class="item-qty">×${qty}</div>`;
      els.inventoryList.appendChild(row);
    });
  }

  function openInventory() {
    renderInventory();
    els.inventoryModal.hidden = false;
    state.backpackOpened = true;
    clearTimeout(backpackReminderTimer);
    els.inventoryModal.dispatchEvent(new Event("inventoryOpened"));
  }

  function waitForInventoryTutorial() {
    return new Promise((resolve) => {
      state.backpackOpened = false;
      els.backpackBtn.hidden = false;

      // Non-blocking reminder: prevents the old async dialogue race after clicking the backpack.
      backpackReminderTimer = setTimeout(() => {
        if (!state.backpackOpened && state.scene === "backpack") {
          setCharacter("lilMad");
          showNotice("Don: Pls just click the backpack icon.");
        }
      }, 5000);

      const onOpened = () => {
        clearTimeout(backpackReminderTimer);
        showNotice("Backpack opened — close it when you're ready.");
      };
      const onClosed = () => {
        if (state.scene !== "backpack") return;
        els.inventoryModal.removeEventListener("inventoryOpened", onOpened);
        els.inventoryModal.removeEventListener("inventoryClosed", onClosed);
        resolve();
      };

      els.inventoryModal.addEventListener("inventoryOpened", onOpened);
      els.inventoryModal.addEventListener("inventoryClosed", onClosed);
    });
  }

  function renderMap() {
    updateHUD();
    els.mapGrid.innerHTML = "";
    const locations = ["Bus", "Town", "Shop", "Forest"];
    locations.forEach((loc) => {
      const unlocked = !!state.mapUnlocked[loc];
      const btn = document.createElement("button");
      btn.className = "map-node";
      btn.disabled = !unlocked;
      btn.innerHTML = `
        <img src="${mapImages[loc]}" alt="" onerror="this.style.display='none'" />
        ${unlocked ? "" : `<div class="locked-label">LOCKED</div>`}
        <div class="map-node-info"><strong>${loc}</strong><small>${travelTime[loc]} min travel</small></div>`;
      if (unlocked) btn.addEventListener("click", () => selectLocation(loc));
      els.mapGrid.appendChild(btn);
    });
  }

  function openMap() {
    renderMap();
    els.mapModal.hidden = false;
  }

  function selectLocation(loc) {
    const previous = state.currentLocation;
    state.lastLocation = previous;
    state.currentLocation = loc;
    if (loc !== previous) state.gameTime += travelTime[loc] || 0;
    updateHUD();
    els.mapModal.hidden = true;
    document.dispatchEvent(new CustomEvent("locationSelected", { detail: loc }));
  }

  function waitForLocation() {
    openMap();
    return new Promise((resolve) => {
      const handler = (e) => {
        document.removeEventListener("locationSelected", handler);
        resolve(e.detail);
      };
      document.addEventListener("locationSelected", handler);
    });
  }

  const clamp = Helpers.clamp.bind(Helpers);
  const randomInt = Helpers.randomInt.bind(Helpers);
  const headsChance = CoinSystem.headsChancePercent.bind(CoinSystem);

  function mkBattleEnemy(id, name, hp, role, spriteKey) {
    return {
      id, name, role, hp, maxHp: hp,
      spriteKey, pose: "idle",
      bleedPotency: 0, bleedCount: 0,
      rupturePotency: 0, ruptureCount: 0,
      poisePotency: 0, poiseCount: 0,
      staggered: false, staggerTurns: 0, staggerLevel: 0,
      thresholds: [Math.floor(hp * .62), Math.floor(hp * .31)],
    };
  }

  function buildWaveEnemies(wave) {
    if (wave === 2) {
      return [
        mkBattleEnemy(0, "Roadside Thug", 118, "CLUB", "club"),
        mkBattleEnemy(1, "Knife Bandit", 104, "KNIFE", "knife"),
        mkBattleEnemy(2, "Gang Leader", 156, "LEADER", "leader"),
        mkBattleEnemy(3, "Elite Marauder", 214, "ELITE", "elite"),
      ];
    }
    return [
      mkBattleEnemy(0, "Roadside Thug", 118, "CLUB", "club"),
      mkBattleEnemy(1, "Knife Bandit", 104, "KNIFE", "knife"),
      mkBattleEnemy(2, "Gang Leader", 156, "LEADER", "leader"),
    ];
  }

  function makeBattleState() {
    return {
      active: true,
      phase: "planning",
      wave: 1,
      totalWaves: 2,
      turn: 1,
      tutorialStep: 0,
      focusSlot: 0,
      deckCursor: 0,
      totalDamage: 0,
      dragSlot: null,
      selectedEnemyId: null,
      dragMoved: false,
      suppressSkillClickUntil: 0,
      openHandSlot: null,
      guideMessage: "",
      autoMode: null,
      don: Object.assign(new Player(characters.donQuixote), { staggered: false }),
      enemies: buildWaveEnemies(1),
      donSlots: [],
      enemySlots: [],
      sins: { Lust: 0, Envy: 0, Gluttony: 0, Pride: 0 },
      egoUnlocked: false,
      egoActivated: false,
      egoTutorialShown: false,
      egoUsed: false,
      egoSkillReady: false,
    };
  }

  function makeWolfBattleState() {
    const wolf = mkBattleEnemy(0, wolfBoss.name, wolfBoss.maxHp || 360, "WOLF", "wolf");
    wolf.thresholds = [...(wolfBoss.staggerThresholds || [230, 115])];
    wolf.sp = 10;
    wolf.nextHaste = 0;
    wolf.haste = 0;
    wolf.damageUp = 1;
    wolf.poisePotency = 2;
    wolf.poiseCount = 3;
    wolf.mirageUsed = false;
    return {
      active: true,
      encounter: "wolf",
      phase: "planning",
      wave: 1,
      totalWaves: 1,
      turn: 1,
      tutorialStep: battleTutorialSteps.length - 1,
      focusSlot: 0,
      deckCursor: 0,
      totalDamage: 0,
      dragSlot: null,
      selectedEnemyId: 0,
      dragMoved: false,
      suppressSkillClickUntil: 0,
      openHandSlot: null,
      guideMessage: "BOSS DUEL — Wolf is empowered. Survive to Turn 4 to awaken E.G.O.",
      autoMode: null,
      don: Object.assign(new Player(characters.donQuixote), { staggered: false }),
      enemies: [wolf],
      donSlots: [],
      enemySlots: [],
      sins: { Lust: 0, Envy: 0, Gluttony: 0, Pride: 0 },
      egoUnlocked: false,
      egoActivated: false,
      egoTutorialShown: false,
      egoUsed: false,
      egoSkillReady: false,
    };
  }

  function makeHeathcliffBattleState() {
    const next = makeBattleState();
    const heathcliff = mkBattleEnemy(0, "Heathcliff", 560, "HEATHCLIFF", "heathcliff");
    heathcliff.egoMeter = 0;
    heathcliff.egoMeterMax = 100;
    next.encounter = "heathcliff";
    next.phase = "realtime";
    next.wave = 1;
    next.totalWaves = 1;
    next.turn = 1;
    next.enemies = [heathcliff];
    next.selectedEnemyId = 0;
    next.guideMessage = "HEATHCLIFF — He builds E.G.O. from combat contact. Guard, evade, and punish his E.G.O recovery.";
    next.egoUnlocked = true;
    return next;
  }

  function makeVersusBattleState(versusConfig = {}) {
    const base = makeBattleState();
    const p1 = getVersusCharacter(versusConfig.player1?.characterId || "don");
    const p2 = getVersusCharacter(versusConfig.player2?.characterId || "heathcliff");
    const p1Ego = getVersusEgo(p1.id, versusConfig.player1?.egoId || "none");
    const p2Ego = getVersusEgo(p2.id, versusConfig.player2?.egoId || "none");
    base.don = Object.assign(new Player({ id: p1.id, name: p1.name, maxHp: p1.maxHp }), {
      staggered: false, drawKey: p1.drawKey, identityId: p1.identity.id,
      egoId: p1Ego.id, egoEquipped: p1Ego.id !== "none",
    });
    const p2Combatant = mkBattleEnemy(902, p2.name, p2.maxHp, "PLAYER2", p2.drawKey);
    p2Combatant.identityId = p2.identity.id;
    p2Combatant.egoId = p2Ego.id;
    p2Combatant.egoEquipped = p2Ego.id !== "none";
    base.active = true;
    base.phase = "realtime";
    base.encounter = "versus";
    base.wave = 1;
    base.totalWaves = 1;
    base.enemies = [p2Combatant];
    base.selectedEnemyId = p2Combatant.id;
    base.guideMessage = "LOCAL VERSUS — P1: WASD + J/K/U/L · P2: ARROWS + NUMPAD 1–4.";
    return base;
  }

  const skillDeck = ["joust", "joust", "gallop", "joust", "justice", "gallop", "joust", "justice"];

  function aliveEnemies() {
    return battle ? battle.enemies.filter((enemy) => enemy.hp > 0) : [];
  }

  function activeEnemySlots(enemyId) {
    return battle ? battle.enemySlots.filter((slot) => slot.enemyId === enemyId && !slot.consumed) : [];
  }

  function firstEnemyIntent(enemyId) {
    return activeEnemySlots(enemyId)[0] || null;
  }

  function setSelectedEnemy(enemyId, preferredIntentId = null, rerender = false) {
    if (!battle) return null;
    const live = aliveEnemies();
    const fallback = live[0]?.id ?? null;
    battle.selectedEnemyId = live.some((enemy) => enemy.id === enemyId) ? enemyId : fallback;
    const selectedSlot = preferredIntentId ? enemySlotById(preferredIntentId) : firstEnemyIntent(battle.selectedEnemyId);
    if (rerender) {
      renderEnemies();
      renderEnemyIntents();
    }
    return selectedSlot;
  }

  function getEnemySprite(enemy, pose = null) {
    const set = enemySprites[enemy?.spriteKey] || enemySprites.club;
    const wanted = enemy?.hp <= 0 ? "dead" : (pose || enemy?.pose || "idle");
    return set[wanted] || set.idle;
  }

  function setEnemyPose(enemyId, pose = "idle", resetDelay = 0) {
    const enemy = enemyById(enemyId);
    if (!enemy) return;
    enemy.pose = pose;
    renderEnemies();
    if (resetDelay > 0) {
      setTimeout(() => {
        const again = enemyById(enemyId);
        if (!again || again.hp <= 0) return;
        again.pose = "idle";
        renderEnemies();
      }, resetDelay);
    }
  }

  function battleWon() {
    return !!battle && battle.enemies.every((enemy) => enemy.hp <= 0);
  }


  function advanceToNextWave() {
    if (!battle || battle.wave >= (battle.totalWaves || 1)) return false;
    battle.wave += 1;
    battle.turn = 1;
    battle.tutorialStep = 0;
    battle.focusSlot = 0;
    battle.dragSlot = null;
    battle.dragMoved = false;
    battle.autoMode = null;
    battle.guideMessage = `WAVE ${battle.wave} begins. A new enemy joins the ambush!`;
    battle.enemies = buildWaveEnemies(battle.wave);
    battle.don.haste = battle.don.nextHaste || 0;
    battle.don.attackUp = battle.don.nextAttackUp || 0;
    battle.don.nextHaste = 0;
    battle.don.nextAttackUp = 0;
    battle.donSlots = [];
    battle.enemySlots = [];
    return true;
  }

  function enemyById(id) {
    return battle?.enemies.find((enemy) => enemy.id === Number(id)) || null;
  }

  function enemySlotById(id) {
    return battle?.enemySlots.find((slot) => slot.id === id) || null;
  }

  function getSelectedSkill(slot) {
    if (slot.defense) return donBattleSkills.evade;
    return donBattleSkills[slot.options[slot.selected]];
  }

  function createTurnSlots() {
    const living = aliveEnemies();
    const actionCount = Math.min(2 + battle.turn, 6);
    battle.donSlots = [];
    for (let i = 0; i < actionCount; i += 1) {
      const a = skillDeck[(battle.deckCursor + i * 2) % skillDeck.length];
      const b = skillDeck[(battle.deckCursor + i * 2 + 1) % skillDeck.length];
      battle.donSlots.push({
        index: i,
        speed: randomInt(3, 6) + battle.don.haste,
        options: [a, b],
        selected: 0,
        defense: false,
        targetIntentId: null,
      });
    }
    battle.deckCursor = (battle.deckCursor + actionCount * 2) % skillDeck.length;

    // Enemy intent planning is isolated from UI so bosses can later use
    // conditional/weighted behavior without rewriting the command phase.
    battle.enemySlots = EnemyAI.buildIntents({
      enemies: living,
      turn: battle.turn,
      getSkillPool: getEnemySkillPool,
      randomInt,
    });

    // No automatic targeting at turn start. Drag manually or use WIN RATE / DAMAGE.
    battle.donSlots.forEach((slot) => {
      slot.targetIntentId = null;
    });
    battle.autoMode = null;
    if (battle.egoActivated && !battle.egoUsed) injectEgoSkillIntoTurn();
    battle.guideMessage = "";
    battle.focusSlot = Math.min(battle.focusSlot, Math.max(0, battle.donSlots.length - 1));
  }

  // V9 safety net: the tutorial UI must never render before the first action
  // slots and enemy intents exist. This also repairs an in-progress battle if an
  // older save / hot reload leaves the transient slot arrays empty.
  function ensureBattleTurnSlots() {
    if (!battle || battleWon()) return false;
    const living = aliveEnemies();
    const hasDonSlots = Array.isArray(battle.donSlots) && battle.donSlots.length > 0;
    const hasLiveEnemyIntent = Array.isArray(battle.enemySlots) && battle.enemySlots.some((slot) => {
      const enemy = enemyById(slot.enemyId);
      return enemy && enemy.hp > 0 && !slot.consumed;
    });
    if (!hasDonSlots || (living.length > 0 && !hasLiveEnemyIntent)) {
      createTurnSlots();
      return true;
    }
    return false;
  }

  function getSkillCoinPower(skill, unitSpeed, coinNumber = 1) {
    return SkillSystem.getCoinPower(skill, coinNumber, { speed: unitSpeed });
  }

  function maxSkillPower(skill, slotSpeed = 0, attackUp = 0) {
    return SkillSystem.maxPower(skill, skill.coins, { speed: slotSpeed, attackBonus: attackUp });
  }

  function expectedSkillPower(skill, slotSpeed = 0, sp = 0, attackUp = 0) {
    return SkillSystem.expectedPower(skill, skill.coins, { speed: slotSpeed, sp, attackBonus: attackUp });
  }

  function enemyMaxPower(enemySlot) {
    if (!enemySlot) return 0;
    return enemySlot.skill.base + enemySlot.skill.coinPower * enemySlot.skill.coins;
  }

  function clashForecast(slot) {
    const skill = getSelectedSkill(slot);
    const enemySlot = enemySlotById(slot.targetIntentId);
    if (!enemySlot) return { label: "SELECT TARGET", cls: "untargeted", delta: -999 };
    const enemy = enemyById(enemySlot.enemyId);
    if (!enemy || enemy.hp <= 0 || enemy.staggered || enemySlot.consumed)
      return { label: "UNOPPOSED", cls: "unopposed", delta: 99 };
    const clashPenalty = enemySlot.skill.opponentClashPowerModifier || 0;
    const delta = maxSkillPower(skill, slot.speed, battle.don.attackUp) + clashPenalty - enemyMaxPower(enemySlot);
    if (skill.defense) {
      if (delta >= 4) return { label: "SAFE EVADE", cls: "favored", delta };
      if (delta >= 0) return { label: "EVEN EVADE", cls: "neutral", delta };
      return { label: "RISKY EVADE", cls: "struggling", delta };
    }
    if (delta >= 6) return { label: "DOMINATING", cls: "dominating", delta };
    if (delta >= 2) return { label: "FAVORED", cls: "favored", delta };
    if (delta >= -1) return { label: "NEUTRAL", cls: "neutral", delta };
    if (delta >= -5) return { label: "STRUGGLING", cls: "struggling", delta };
    return { label: "HOPELESS", cls: "hopeless", delta };
  }


  function guessEffectIconKey(text = '') {
    const value = String(text || '').toLowerCase();
    if (value.includes('bleed')) return 'bleed';
    if (value.includes('rupture')) return 'rupture';
    if (value.includes('poise')) return 'poise';
    if (value.includes('haste')) return 'haste';
    if (value.includes('damage up')) return 'damageUp';
    if (value.includes('attack up')) return 'attackUp';
    if (value.includes('stagger')) return 'stagger';
    if (value.includes('sp')) return 'sanity';
    if (value.includes('shield') || value.includes('guard') || value.includes('defense')) return 'shield';
    if (value.includes('burn')) return 'burn';
    return null;
  }

  function statusBadgeHTML(kind, label, extraClass = '', titleText = '') {
    const icon = STATUS_ICON_ASSETS[kind];
    const classes = ['lc4-status', kind, extraClass].filter(Boolean).join(' ');
    const title = escapeHTML(titleText || STATUS_HELP[kind] || label);
    return `<span class="${classes}" title="${title}">${icon ? `<img class="lc4-status-icon" src="${icon}" alt="" />` : ''}<span>${escapeHTML(label)}</span></span>`;
  }

  function formatPoiseLabel(unit) {
    const chance = BattleSystem.poiseCritChance(unit);
    return `POISE ${unit.poisePotency}/${unit.poiseCount} · ${chance}%`;
  }

  function donStatusBadgesHTML() {
    const badges = [];
    if (battle.don.haste) badges.push(statusBadgeHTML('haste', `HASTE ${battle.don.haste}`));
    if (battle.don.attackUp) badges.push(statusBadgeHTML('attackUp', `ATK+ ${battle.don.attackUp}`));
    if (battle.don.statuses?.bleed?.count > 0) badges.push(statusBadgeHTML('bleed', `BLEED ${battle.don.statuses.bleed.potency}/${battle.don.statuses.bleed.count}`));
    if (battle.don.poiseCount > 0 && battle.don.poisePotency > 0) badges.push(statusBadgeHTML('poise', formatPoiseLabel(battle.don)));
    if (battle?.egoActivated) badges.push(statusBadgeHTML('sanity', battle.egoUsed ? 'EGO SPENT' : 'EGO READY', 'ego', 'La Sangre de Sancho is manifested. Using it costs 20 SP.'));
    if (battle.don.staggered || battle.don.isStaggered) badges.push(statusBadgeHTML('stagger', 'STAGGER'));
    return badges.join('') || '<span class="lc4-status ready">READY</span>';
  }

  function enemyStatusBadgesHTML(enemy) {
    const badges = [];
    if (enemy.staggered) badges.push(statusBadgeHTML('stagger', 'STAGGER'));
    if (enemy.bleedCount > 0) badges.push(statusBadgeHTML('bleed', `BLEED ${enemy.bleedPotency}/${enemy.bleedCount}`));
    if (enemy.ruptureCount > 0) badges.push(statusBadgeHTML('rupture', `RUPTURE ${enemy.rupturePotency}/${enemy.ruptureCount}`));
    if (enemy.poiseCount > 0 && enemy.poisePotency > 0) badges.push(statusBadgeHTML('poise', formatPoiseLabel(enemy)));
    if ((enemy.haste || 0) > 0) badges.push(statusBadgeHTML('haste', `HASTE ${enemy.haste}`));
    if ((enemy.damageUp || 0) > 0) badges.push(statusBadgeHTML('damageUp', `DMG+ ${enemy.damageUp}`));
    return badges.join('');
  }

  function decorateEffectText(effectText) {
    const key = guessEffectIconKey(effectText);
    const icon = key ? `<img class="lc21-effect-icon" src="${STATUS_ICON_ASSETS[key]}" alt="" />` : '';
    return `${icon}<span>${escapeHTML(effectText)}</span>`;
  }

  function renderBattleHUD() {
    els.battleWave.textContent = `${battle.wave}/${battle.totalWaves || 1}`;
    els.battleTurn.textContent = String(battle.turn);
    els.phaseLabel.textContent = battle.phase === "planning" ? "COMMAND PHASE" : "COMBAT PHASE";
    els.donHpText.textContent = `${Math.max(0, battle.don.hp)}/${battle.don.maxHp}`;
    els.donHpBar.style.width = `${clamp((battle.don.hp / battle.don.maxHp) * 100, 0, 100)}%`;
    els.donSpText.textContent = `${battle.don.sp >= 0 ? "+" : ""}${battle.don.sp}`;
    els.donSpBar.style.width = `${clamp(((battle.don.sp + 45) / 90) * 100, 0, 100)}%`;
    els.managerSp.textContent = `${battle.don.sp >= 0 ? "+" : ""}${battle.don.sp}`;
    if (els.managerHpText) els.managerHpText.textContent = `${Math.max(0, battle.don.hp)}/${battle.don.maxHp}`;
    if (els.managerHpBar) els.managerHpBar.style.width = `${clamp((battle.don.hp / battle.don.maxHp) * 100, 0, 100)}%`;
    if (els.managerSpBar) {
      const sp = clamp(battle.don.sp, -45, 45);
      const ratio = Math.abs(sp) / 45;
      els.managerSpBar.style.width = `${ratio * 50}%`;
      els.managerSpBar.style.left = sp >= 0 ? '50%' : `${50 - ratio * 50}%`;
      els.managerSpBar.classList.toggle('negative', sp < 0);
    }
    const maxSpeed = battle.donSlots.length ? Math.max(...battle.donSlots.map((slot) => slot.speed)) : 3;
    els.donSpeed.textContent = String(maxSpeed);
    if (els.donStatus) els.donStatus.innerHTML = donStatusBadgesHTML();
    els.sinLust.textContent = String(battle.sins.Lust);
    els.sinEnvy.textContent = String(battle.sins.Envy);
    els.sinGluttony.textContent = String(battle.sins.Gluttony);
  }

  function banditBodyHTML(enemy) {
    const src = getEnemySprite(enemy);
    return `<div class="lc4-bandit sprite-${enemy.spriteKey || "club"} pose-${enemy.pose || "idle"}" aria-label="${escapeHTML(enemy.name)}">
      <img class="lc4-bandit-sprite" src="${src}" alt="${escapeHTML(enemy.name)} battle sprite">
    </div>`;
  }

  function renderEnemies() {
    if (!els.enemyRoster) return;
    els.enemyRoster.innerHTML = "";
    const liveIds = aliveEnemies().map((enemy) => enemy.id);
    if (battle.selectedEnemyId == null || !liveIds.includes(battle.selectedEnemyId)) battle.selectedEnemyId = liveIds[0] ?? null;
    const columnCount = Math.max(3, battle.enemies.length);
    els.enemyRoster.style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;
    els.enemyRoster.dataset.count = String(columnCount);
    battle.enemies.forEach((enemy) => {
      const card = document.createElement("article");
      card.className = `lc4-enemy ${enemy.hp <= 0 ? "is-dead" : ""} ${enemy.staggered ? "is-staggered" : ""} ${battle.selectedEnemyId === enemy.id ? "is-selected" : ""}`;
      card.dataset.enemyId = String(enemy.id);
      const hpPct = clamp((enemy.hp / enemy.maxHp) * 100, 0, 100);
      const nextThreshold = enemy.thresholds[enemy.staggerLevel];
      const staggerPct = nextThreshold == null ? 0 : clamp((nextThreshold / enemy.maxHp) * 100, 0, 100);
      const statusBadges = enemyStatusBadgesHTML(enemy);
      const staggerText = nextThreshold == null ? "NO STAGGER" : `STAG ${nextThreshold}`;
      card.innerHTML = `
        <div class="lc4-enemy-name"><small>${escapeHTML(enemy.role)}</small><b>${escapeHTML(enemy.name)}</b><span class="lc34-enemy-tag">HOSTILE</span></div>
        <div class="lc4-enemy-stage"><div class="lc4-shadow"></div><div class="lc4-enemy-focus"></div>${banditBodyHTML(enemy)}<div class="lc4-unit-float" data-float-enemy="${enemy.id}" hidden></div></div>
        <div class="lc4-enemy-hud">
          <div class="lc34-enemy-vital-head"><span>HP</span><b>${Math.max(0, enemy.hp)}/${enemy.maxHp}</b></div>
          <div class="lc4-enemy-hp"><i style="width:${hpPct}%"></i>${nextThreshold == null ? "" : `<em class="lc10-stagger-mark" style="left:${staggerPct}%"></em>`}</div>
          <div class="lc10-stagger-track"><i style="width:${Math.max(0, 100-hpPct)}%"></i><span>${staggerText}</span></div>
          <div class="lc4-statuses">${statusBadges}</div>
        </div>`;
      if (enemy.hp > 0) {
        card.addEventListener("click", () => {
          if (battle.phase !== "planning") return;
          const picked = autoTargetEnemy(enemy.id);
          battle.guideMessage = picked?.slot && picked?.intent
            ? `${enemy.name} auto-targeted for slot ${picked.slot.index + 1}. Click another enemy to redirect quickly.`
            : `${enemy.name} selected. Check the skill effect at the upper-right panel.`;
          tutorialForTurn();
          renderPlanning();
        });
        card.addEventListener("pointerup", () => {
          if (battle.phase !== "planning" || battle.dragSlot === null) return;
          const slot = firstEnemyIntent(enemy.id);
          const drag = battle.donSlots[battle.dragSlot];
          if (slot && drag) {
            drag.targetIntentId = slot.id;
            battle.autoMode = null;
            battle.focusSlot = battle.dragSlot;
            battle.dragSlot = null;
      battle.openHandSlot = null;
            battle.guideMessage = `${enemy.name} targeted. The top-right panel now shows that enemy action.`;
            setSelectedEnemy(enemy.id, slot.id);
            renderPlanning();
          }
        });
      }
      els.enemyRoster.appendChild(card);
    });
  }

  function positionEnemyIntents() {
    if (!els.enemyIntentSlots || els.enemyIntentSlots.hidden) return;
    const layerRect = els.enemyIntentSlots.getBoundingClientRect();
    const buttons = [...els.enemyIntentSlots.querySelectorAll(".lc4-intent")];

    buttons.forEach((btn) => {
      const enemyId = Number(btn.dataset.enemyId);
      const enemyCard = els.enemyRoster?.querySelector?.(`[data-enemy-id="${enemyId}"]`);
      const sprite = enemyCard?.querySelector?.(".lc4-bandit") || enemyCard?.querySelector?.(".lc4-enemy-stage");
      if (!sprite) return;

      const siblings = buttons.filter((node) => Number(node.dataset.enemyId) === enemyId);
      const sibIndex = Math.max(0, siblings.indexOf(btn));
      const total = Math.max(1, siblings.length);
      const spread = total === 1 ? 0 : (sibIndex - (total - 1) / 2) * 26;

      const box = sprite.getBoundingClientRect();
      const x = box.left + box.width / 2 - layerRect.left + spread;
      // Anchor intent cards above the enemy sprite instead of overlapping the body.
      // This also gives targeting curves a clean endpoint that does not cross the character art.
      const intentHeight = btn.getBoundingClientRect().height || 66;
      const y = box.top - layerRect.top - intentHeight * 0.78 - 10 - Math.abs(spread) * 0.05;

      btn.style.left = `${x}px`;
      btn.style.top = `${Math.max(76, y)}px`;
    });
  }

  function renderEnemyIntents() {
    els.enemyIntentSlots.innerHTML = "";
    battle.enemySlots.forEach((slot) => {
      const enemy = enemyById(slot.enemyId);
      if (!enemy || enemy.hp <= 0 || slot.consumed) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `lc4-intent ${intentTypeClass(slot.skill.type)} ${slot.skill.defense ? "is-defense" : ""}`;
      btn.dataset.intentId = slot.id;
      btn.dataset.enemyId = String(enemy.id);

      const intentGlyph = intentTypeGlyph(slot.skill.type, !!slot.skill.defense);
      const intentTypeImage = slot.skill.defense ? '' : damageTypeMarkup(slot.skill.type, 'lc60-intent-type-icon');
      btn.innerHTML = `<span class="lc4-intent-speed">${slot.speed}</span><span class="lc4-intent-frame"></span><span class="lc34-intent-sigil">${intentTypeImage}<span class="lc34-intent-glyph">${intentGlyph}</span></span>${slot.skill.art ? `<img class="lc4-intent-art" src="${escapeHTML(slot.skill.art)}" alt="" />` : ""}<span class="lc32-intent-type">${escapeHTML((slot.skill.type || "ATK").toUpperCase())}</span><span class="lc32-intent-coin">${slot.skill.coins || 1} COIN</span><b title="${escapeHTML(slot.skill.name)}">${escapeHTML(slot.skill.name)}</b><small>${slot.skill.base} + ${slot.skill.coinPower}</small>`;

      if (battle.selectedEnemyId === enemy.id) btn.classList.add("is-selected");

      btn.addEventListener("click", () => {
        if (battle.phase !== "planning") return;
        const picked = autoTargetEnemy(enemy.id, slot.id);
        battle.guideMessage = picked?.slot
          ? `${picked.slot.index + 1} locked onto ${enemy.name}'s ${slot.skill.name}.`
          : "Selected enemy action.";
        tutorialForTurn();
        renderPlanning();
      });

      btn.addEventListener("mouseenter", () => {
        battle.selectedEnemyId = enemy.id;
        scheduleEnemyInspector(slot);
      });
      btn.addEventListener("mouseleave", hideEnemyInspectorHoverDelay);

      btn.addEventListener("pointerup", () => {
        if (battle.phase !== "planning" || battle.dragSlot === null) return;
        const drag = battle.donSlots[battle.dragSlot];
        if (drag) {
          drag.targetIntentId = slot.id;
          battle.autoMode = null;
          battle.guideMessage = "Target set. Drag the remaining skill cards, or use WIN RATE / DAMAGE to auto-chain.";
        }
        battle.focusSlot = battle.dragSlot;
        battle.dragSlot = null;
        renderPlanning();
      });

      els.enemyIntentSlots.appendChild(btn);
    });

    requestAnimationFrame(positionEnemyIntents);
  }

  function renderTurnOrder() {
    if (!els.turnOrder) return;
    els.turnOrder.innerHTML = "";
    els.turnOrder.hidden = true;
  }

  function showKeywordPanel(skill) {
    if (els.battleKeywordPanel) els.battleKeywordPanel.hidden = true;
    return;
    const key = skill.keywords?.find((k) => keywordDescriptions[k]) || skill.keywords?.[0];
    if (!key) { els.battleKeywordPanel.hidden = true; return; }
    if (key.toLowerCase() === "bleed") {
      els.keywordName.innerHTML = `${bleedMarkup("")}`;
    } else {
      els.keywordName.textContent = key.toUpperCase();
    }
    els.keywordText.textContent = keywordDescriptions[key] || `${key} modifies this skill during battle.`;
    els.battleKeywordPanel.hidden = false;
  }

  function showEnemySkillInspector(enemySlot) {
    if (!els.enemySkillInspector || !enemySlot) return;
    els.enemySkillInspector.classList.remove("is-visible");
    els.enemySkillInspector.hidden = true;
    const skill = enemySlot.skill;
    const enemy = enemyById(enemySlot.enemyId);
    battle.selectedEnemyId = enemy?.id ?? battle.selectedEnemyId;
    const typeLabel = (skill.type || "Attack").toUpperCase();
    const desc = enemySkillText[skill.key] || `A ${skill.type} attack. Clash it, redirect it, or leave it unopposed at your own risk.`;
    const effects = enemySkillEffects[skill.key] || [];
    const effectMarkup = effects.length
      ? effects.map((effect) => `
          <div class="lc21-skillfx-row">
            <span class="lc21-skillfx-tag">${escapeHTML(effect.tag)}</span>
            <b>${decorateEffectText(effect.text)}</b>
          </div>`).join("")
      : `<div class="lc21-skillfx-row"><span class="lc21-skillfx-tag">[Info]</span><b><span>No special effect.</span></b></div>`;

    els.enemyInspectorName.textContent = `${enemy?.name || "Enemy"} · ${skill.name}`;
    if (els.enemyInspectorArt) {
      if (skill.art) {
        els.enemyInspectorArt.src = skill.art;
        els.enemyInspectorArt.hidden = false;
      } else {
        els.enemyInspectorArt.hidden = true;
      }
    }
    if (els.enemyInspectorType) {
      els.enemyInspectorType.innerHTML = `${damageTypeMarkup(skill.type, 'lc60-inspector-type-icon')}<span>${escapeHTML(typeLabel)}</span>`;
      els.enemyInspectorType.className = `lc10-chip lc60-type-chip ${intentTypeClass(skill.type)}`;
    }
    if (els.enemyInspectorCoins) els.enemyInspectorCoins.textContent = `${skill.coins} COIN${skill.coins > 1 ? "S" : ""}`;
    els.enemyInspectorPower.textContent = `${skill.base} + ${skill.coinPower} · ${skill.coins} Coin${skill.coins > 1 ? "s" : ""}`;
    els.enemyInspectorText.innerHTML = `
      <div class="lc21-inspector-body">
        <div class="lc21-inspector-formula">
          <span class="lc21-power-num">${skill.base}</span>
          <span class="lc21-op">+</span>
          <span class="lc21-power-num is-coin">${skill.coinPower}</span>
          <span class="lc21-op">·</span>
          <span class="lc21-coin-count">${skill.coins} Coin${skill.coins > 1 ? "s" : ""}</span>
        </div>
        <div class="lc21-inspector-desc">${escapeHTML(desc)}</div>
        ${skill.keywords?.includes("Bleed") ? `<div class="lc21-bleed-row">${bleedMarkup("status on hit")}</div>` : ""}
        <div class="lc21-section">
          <div class="lc21-section-title">SKILL EFFECTS</div>
          <div class="lc21-skillfx-list">${effectMarkup}</div>
        </div>
      </div>`;
    els.enemySkillInspector.hidden = false;
    requestAnimationFrame(() => els.enemySkillInspector.classList.add("is-visible"));
  }

  function renderMatchupPreview() {
    if (!els.battleMatchup) return;
    els.battleMatchup.hidden = true;
  }

  function showSkillInspector(skill, slot) {
    els.battleInspector.hidden = false;
    els.inspectorName.textContent = skill.name;
    if (els.inspectorArt && skill.badge) {
      els.inspectorArt.src = skill.badge;
      els.inspectorArt.alt = `${skill.name} skill art`;
    }
    els.inspectorPower.textContent = `${skill.base} + ${getSkillCoinPower(skill, slot.speed)} · ${skill.coins} Coin${skill.coins > 1 ? "s" : ""}`;
    els.inspectorText.textContent = skill.effect;
    els.inspectorKeywords.innerHTML = skill.keywords.map((word) => `<span>${escapeHTML(word)}</span>`).join("");
  }

  function hideSkillInspector() {
    els.battleInspector.hidden = true;
    if (els.battleKeywordPanel) els.battleKeywordPanel.hidden = true;
  }

  function intentTypeClass(type = "") {
    const key = String(type).toLowerCase();
    if (key.includes("slash")) return "type-slash";
    if (key.includes("pierce")) return "type-pierce";
    if (key.includes("blunt")) return "type-blunt";
    if (key.includes("defense") || key.includes("guard") || key.includes("evade") || key.includes("block")) return "type-defense";
    return "type-generic";
  }

  function intentTypeGlyph(type = "", defense = false) {
    const key = String(type).toLowerCase();
    if (defense || key.includes("defense") || key.includes("guard") || key.includes("evade") || key.includes("block")) return "▣";
    return damageTypeIcon(type) ? "" : "◆";
  }

  function bleedMarkup(textValue) {
    return `<span class="lc10-inline-bleed"><img src="assets/images/battle/ui/bleed-logo.png" alt="Bleed" /><b>Bleed</b>${textValue ? `<span>${escapeHTML(textValue)}</span>` : ""}</span>`;
  }

  function scheduleEnemyInspector(slot) {
    clearTimeout(enemyInspectorHoverTimer);
    enemyInspectorHoverTimer = setTimeout(() => showEnemySkillInspector(slot), 70);
  }

  function hideEnemyInspectorHoverDelay() {
    clearTimeout(enemyInspectorHoverTimer);
    if (!els.enemySkillInspector) return;
    enemyInspectorHoverTimer = setTimeout(() => {
      const hoveringIntent = document.querySelector('.lc4-intent:hover');
      const hoveringInspector = els.enemySkillInspector.matches(':hover');
      if (!hoveringIntent && !hoveringInspector) {
        els.enemySkillInspector.classList.remove('is-visible');
        els.enemySkillInspector.hidden = true;
      }
    }, 90);
  }

  if (els.enemySkillInspector) {
    els.enemySkillInspector.addEventListener('mouseenter', () => clearTimeout(enemyInspectorHoverTimer));
    els.enemySkillInspector.addEventListener('mouseleave', hideEnemyInspectorHoverDelay);
  }

  function skillSigil(skill) {
    if (skill.defense) return "◇";
    if (skill.key === "justice") return "Ⅲ";
    if (skill.key === "gallop") return "Ⅱ";
    return "Ⅰ";
  }

  function skillCardHTML(skill, slot, back = false) {
    const cp = getSkillCoinPower(skill, slot.speed);
    const affinityIcon = battleUiIcons.sins[skill.affinity] || "";
    const typeIcon = skill.defense ? battleUiIcons.evade : (damageTypeIcon(skill.type) || battleUiIcons.attack);
    return `<img class="lc7-skill-art" src="${escapeHTML(skill.art || "")}" alt="" />
      <span class="lc7-card-shade"></span>
      <span class="lc4-skill-aff">${affinityIcon ? `<img src="${escapeHTML(affinityIcon)}" alt="" />` : ""}${escapeHTML(skill.affinity)}</span>
      <img class="lc24-card-type" src="${escapeHTML(typeIcon)}" alt="" />
      <span class="lc4-sigil">${skillSigil(skill)}</span>
      <strong>${escapeHTML(skill.name)}</strong>
      <span class="lc4-skill-power"><b>${skill.base}</b><i>+${cp}</i></span>
      <span class="lc4-skill-coins">${Array.from({ length: skill.coins }, () => "●").join("")}</span>`;
  }

  function beginTargetDrag(event, index, forcedChoice = null) {
    if (battle.phase !== "planning") return;
    const slot = battle.donSlots[index];
    if (!slot) return;

    if (forcedChoice !== null) {
      slot.selected = forcedChoice;
      slot.defense = false;
    }

    battle.dragSlot = index;
    battle.openHandSlot = index;
    battle.dragMoved = false;
    battle.focusSlot = index;
    const startX = event.clientX;
    const startY = event.clientY;
    let hoveredIntentId = null;
    showSkillInspector(getSelectedSkill(slot), slot);
    document.body.classList.add("lc4-targeting");

    const updateHover = (clientX, clientY) => {
      const hovered = document.elementFromPoint(clientX, clientY)?.closest?.(".lc4-intent");
      hoveredIntentId = hovered?.dataset?.intentId || null;
      setDragHoverIntent(hoveredIntentId);
      if (hoveredIntentId) {
        const targetRect = hovered.getBoundingClientRect();
        scheduleTargetLines({ x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 });
      } else {
        scheduleTargetLines({ x: clientX, y: clientY });
      }
    };

    const onMove = (moveEvent) => {
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) battle.dragMoved = true;
      updateHover(moveEvent.clientX, moveEvent.clientY);
    };

    const onUp = (upEvent) => {
      const target = hoveredIntentId ? els.enemyIntentSlots.querySelector(`[data-intent-id="${hoveredIntentId}"]`) : document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest?.(".lc4-intent");
      if (target && slot && battle.dragMoved) {
        slot.targetIntentId = target.dataset.intentId;
        battle.autoMode = null;
        battle.guideMessage = "Target snapped. Press START when your chain looks good.";
        snapIntentButton(slot.targetIntentId);
      }
      if (battle.dragMoved) battle.suppressSkillClickUntil = performance.now() + 220;
      battle.dragSlot = null;
      document.body.classList.remove("lc4-targeting");
      setDragHoverIntent(null);
      scheduleTargetLines(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      renderPlanning();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { once: true });
    updateHover(event.clientX, event.clientY);
    event.preventDefault();
  }

  function renderActionRail() {
    els.actionRail.innerHTML = "";
    battle.donSlots.forEach((slot) => {
      const selected = getSelectedSkill(slot);
      const altKey = slot.options[slot.selected === 0 ? 1 : 0];
      const alternate = donBattleSkills[altKey];
      const forecast = clashForecast(slot);
      const wrap = document.createElement("div");
      wrap.className = `lc4-action ${battle.focusSlot === slot.index ? "is-focus" : ""} ${battle.openHandSlot === slot.index ? "is-hand-open" : ""}`;
      wrap.dataset.actionSlot = String(slot.index);
      wrap.innerHTML = `
        <div class="lc4-forecast ${slot.targetIntentId ? forecast.cls : "unassigned"}">${slot.targetIntentId ? forecast.label : "WIN RATE"}</div>
        <button class="lc4-skill-back lc4-aff-${alternate.css}" type="button" aria-label="Switch to ${escapeHTML(alternate.name)}">${skillCardHTML(alternate, slot, true)}</button>
        <button class="lc4-skill-front lc4-aff-${selected.css}" type="button">${skillCardHTML(selected, slot)}</button>
        <button class="lc4-slot-core lc62-slot-core" type="button" aria-label="Target slot ${slot.index + 1}, speed ${slot.speed}">
          <span class="lc62-slot-dash">—</span>
        </button>
        <button class="lc4-defense-toggle ${slot.defense ? "active" : ""}" type="button" title="Evade">◇</button>`;
      const front = wrap.querySelector(".lc4-skill-front");
      const back = wrap.querySelector(".lc4-skill-back");
      const core = wrap.querySelector(".lc4-slot-core");
      const defense = wrap.querySelector(".lc4-defense-toggle");
      const frontChoice = slot.selected;
      const backChoice = slot.selected === 0 ? 1 : 0;

      core.addEventListener("click", (event) => {
        if (battle.phase !== "planning") return;
        event.stopPropagation();
        battle.focusSlot = slot.index;
        battle.openHandSlot = battle.openHandSlot === slot.index ? null : slot.index;
        battle.guideMessage = battle.openHandSlot === slot.index
          ? "Skill hand opened. Pick a card, then target an enemy."
          : "Skill hand closed.";
        renderPlanning();
      });

      front.addEventListener("pointerdown", (event) => beginTargetDrag(event, slot.index, frontChoice));
      back.addEventListener("pointerdown", (event) => beginTargetDrag(event, slot.index, backChoice));

      front.addEventListener("click", () => {
        if (performance.now() < battle.suppressSkillClickUntil) return;
        battle.focusSlot = slot.index;
        slot.selected = frontChoice;
        slot.defense = false;
        battle.openHandSlot = null;
        battle.guideMessage = "Skill selected. Drag it onto an enemy action to create a target arrow.";
        showSkillInspector(getSelectedSkill(slot), slot);
        renderPlanning();
      });
      back.addEventListener("click", () => {
        if (performance.now() < battle.suppressSkillClickUntil) return;
        battle.focusSlot = slot.index;
        slot.selected = backChoice;
        slot.defense = false;
        battle.openHandSlot = null;
        battle.guideMessage = "Skill selected. Drag it onto an enemy action to create a target arrow.";
        renderPlanning();
        showSkillInspector(getSelectedSkill(slot), slot);
      });
      core.addEventListener("click", () => {
        battle.focusSlot = slot.index;
        battle.guideMessage = "You can drag either skill card itself onto an enemy action.";
        showSkillInspector(getSelectedSkill(slot), slot);
        renderPlanning();
      });
      core.addEventListener("pointerdown", (event) => beginTargetDrag(event, slot.index));
      defense.addEventListener("click", () => {
        battle.focusSlot = slot.index;
        slot.defense = !slot.defense;
        renderPlanning();
        showSkillInspector(getSelectedSkill(slot), slot);
      });
      front.addEventListener("mouseenter", () => showSkillInspector(selected, slot));
      back.addEventListener("mouseenter", () => showSkillInspector(alternate, slot));
      wrap.addEventListener("mouseleave", hideSkillInspector);
      els.actionRail.appendChild(wrap);
    });

    // V65: keep the command cluster in its dedicated footer column.
    // Moving it into the scrollable action rail caused large dead zones and inconsistent spacing.
    if (els.commandCluster) {
      if (els.autoCluster && els.autoWinBtn && els.autoWinBtn.parentElement !== els.autoCluster) {
        els.autoCluster.prepend(els.autoWinBtn);
      }
      els.autoWinBtn?.classList.remove("lc38-winrate-inline");
      els.commandCluster.classList.remove("lc39-inline-command");
    }
  }


  function egoCanAppear() {
    return EgoSystem.isUnlocked(battle);
  }

  function egoNeedsPrompt() {
    return egoCanAppear() && !battle.egoActivated;
  }

  function updateEgoButton() {
    if (!els.egoActivateBtn) return;
    const show = !!battle && battle.phase === 'planning' && battle.encounter === 'wolf';
    els.egoActivateBtn.hidden = !show;
    if (!show) return;
    const unlocked = egoCanAppear();
    const affordability = unlocked ? EgoSystem.affordability(battle, donBattleSkills.laSangre) : { ok: false };
    els.egoActivateBtn.disabled = !!battle.egoActivated || !unlocked || !affordability.ok;
    els.egoActivateBtn.setAttribute('aria-disabled', els.egoActivateBtn.disabled ? 'true' : 'false');
    els.egoActivateBtn.classList.toggle('is-locked', !unlocked || (unlocked && !affordability.ok));
    els.egoActivateBtn.classList.toggle('is-ready', unlocked && affordability.ok && !battle.egoActivated);
    els.egoActivateBtn.classList.toggle('is-active', !!battle.egoActivated);
    const label = els.egoActivateBtn.querySelector('.lc61-ego-label');
    const state = els.egoActivateBtn.querySelector('.lc61-ego-state');
    if (label) label.textContent = battle.egoActivated ? 'E.G.O READY' : 'E.G.O';
    if (state) state.textContent = battle.egoActivated ? (battle.egoUsed ? 'SPENT' : 'MANIFESTED') : (unlocked ? (affordability.ok ? 'CLICK' : 'NEED COST') : 'TURN 4');
  }

  function positionPlayerIntentAnchor() {
    if (!els.playerIntentAnchor || !battle || battle.phase !== 'planning' || els.battleScreen.hidden) {
      if (els.playerIntentAnchor) els.playerIntentAnchor.hidden = true;
      return;
    }
    const rect = els.battleScreen.getBoundingClientRect();
    const donRect = els.battleDon.getBoundingClientRect();
    if (!donRect.width || !donRect.height) {
      els.playerIntentAnchor.hidden = true;
      return;
    }
    const x = donRect.left + donRect.width * 0.5 - rect.left;
    // The intent anchor belongs above Don's head. Keeping it here makes hostile targeting readable
    // and prevents long horizontal lines from cutting through the full battlefield.
    const y = donRect.top - rect.top - 36;
    els.playerIntentAnchor.style.left = `${Math.max(72, Math.min(rect.width - 72, x))}px`;
    els.playerIntentAnchor.style.top = `${Math.max(92, Math.min(rect.height - 170, y))}px`;
  }

  function renderPlayerIntentAnchor() {
    if (!els.playerIntentAnchor) return;
    if (!battle || battle.phase !== 'planning') {
      els.playerIntentAnchor.hidden = true;
      return;
    }
    const slot = battle.donSlots?.[battle.focusSlot] || battle.donSlots?.[0];
    const speed = slot?.speed ?? battle.donSlots?.[0]?.speed ?? battle.don.speed ?? 0;
    els.playerIntentAnchor.className = `lc4-intent lc4-intent-player ${battle.egoActivated ? 'ego-live' : ''} type-defense`;
    els.playerIntentAnchor.innerHTML = `<span class="lc4-intent-speed">${speed}</span><span class="lc4-intent-frame"></span><span class="lc34-intent-sigil"><span class="lc34-intent-glyph">◈</span></span><b>DON QUIXOTE</b><small>${battle.egoActivated ? (battle.egoUsed ? 'E.G.O SPENT' : 'E.G.O READY') : 'TARGET'}</small>`;
    els.playerIntentAnchor.hidden = false;
    requestAnimationFrame(positionPlayerIntentAnchor);
  }

  function openEgoManifest() {
    if (!battle || !egoCanAppear() || battle.egoActivated || !els.egoManifestModal) return;
    if (els.egoPreviewCard) els.egoPreviewCard.src = EGO_ASSETS.card;
    if (els.egoPreviewInfo) els.egoPreviewInfo.src = EGO_ASSETS.info;
    if (els.egoPreviewIcon) els.egoPreviewIcon.src = EGO_ASSETS.portrait;
    const spChip = els.egoManifestModal.querySelector('[data-ego-sp]');
    const resChip = els.egoManifestModal.querySelector('[data-ego-resources]');
    if (spChip) spChip.textContent = `SP ${battle.don.sp} / COST 10`;
    if (resChip) resChip.textContent = `LUST ${battle.sins.Lust || 0}/2 · PRIDE ${battle.sins.Pride || 0}/2`;
    const affordability = EgoSystem.affordability(battle, donBattleSkills.laSangre);
    if (els.egoManifestConfirm) {
      els.egoManifestConfirm.disabled = !affordability.ok;
      els.egoManifestConfirm.textContent = affordability.ok ? 'MANIFEST E.G.O' : 'INSUFFICIENT RESOURCES';
    }
    els.egoManifestModal.hidden = false;
  }

  function closeEgoManifest() {
    if (!els.egoManifestModal) return;
    els.egoManifestModal.hidden = true;
  }

  function injectEgoSkillIntoTurn() {
    if (!battle?.donSlots?.length) return;
    const slot = battle.donSlots[0];
    if (!slot) return;
    slot.options = ['laSangre', 'laSangre'];
    slot.selected = 0;
    slot.defense = false;
  }

  function activateEgo() {
    if (!battle || battle.egoActivated) return;
    const manifestCheck = EgoSystem.canManifest(battle, donBattleSkills.laSangre);
    if (!manifestCheck.ok) {
      showNotice(manifestCheck.reason === 'LOCKED' ? 'E.G.O LOCKED' : 'NOT ENOUGH SP / SIN RESOURCES', 2200);
      updateEgoButton();
      return;
    }
    closeEgoManifest();
    battle.egoActivated = true;
    battle.egoSkillReady = true;
    battle.egoTutorialShown = true;
    injectEgoSkillIntoTurn();
    battle.focusSlot = 0;
    battle.guideMessage = 'E.G.O manifested. Slot 1 is now La Sangre de Sancho. Use cost: 10 SP + 2 Lust + 2 Pride. Drag it to an enemy intent, then press START.';
    showNotice('E.G.O MANIFESTED — COST 10 SP · 2 LUST · 2 PRIDE', 3200);
    renderPlanning();
  }

  async function playEgoCinematic() {
    const panel = els.egoCinematic;
    const sprite = els.egoCinematicSprite;
    if (!panel || !sprite) {
      await rawDelay(900);
      return;
    }

    let skipped = false;
    const skip = () => { skipped = true; };
    els.egoCinematicClose?.addEventListener('click', skip, { once: true });
    panel.hidden = false;
    panel.classList.add('is-playing');
    if (els.egoCinematicBackdrop) els.egoCinematicBackdrop.src = EGO_ASSETS.art;
    if (els.egoCinematicShatter) els.egoCinematicShatter.src = EGO_ASSETS.shatter;

    const previousBattleVolume = battleBgm.volume;
    fadeAudio(battleBgm, Math.max(0.04, previousBattleVolume * 0.38), 220);

    for (let i = 0; i < EGO_ASSETS.frames.length && !skipped; i += 1) {
      sprite.src = EGO_ASSETS.frames[i];
      sprite.classList.remove('ego-frame-pop');
      void sprite.offsetWidth;
      sprite.classList.add('ego-frame-pop');

      if (i === 0 || i === 3 || i === 6) {
        const cue = i === 0 ? 0 : i === 3 ? 1 : 2;
        playDonSkillHitSfx('laSangre', cue);
      }
      if (i === 3 || i === 5 || i === 6) {
        els.egoBloodSlash?.classList.remove('hit');
        void els.egoBloodSlash?.offsetWidth;
        els.egoBloodSlash?.classList.add('hit');
        els.battleScreen?.classList.remove('lc59-ego-shake');
        void els.battleScreen?.offsetWidth;
        els.battleScreen?.classList.add('lc59-ego-shake');
        flashBattle();
      }
      if (i === 5 && els.egoCinematicShatter) els.egoCinematicShatter.classList.add('show');
      await rawDelay(i < 3 ? 150 : 115);
    }

    await rawDelay(skipped ? 0 : 180);
    panel.classList.remove('is-playing');
    panel.hidden = true;
    els.egoCinematicShatter?.classList.remove('show');
    els.egoBloodSlash?.classList.remove('hit');
    els.battleScreen?.classList.remove('lc59-ego-shake');
    fadeAudio(battleBgm, previousBattleVolume, 260);
  }

  function tutorialForTurn() {
    const targeted = battle.donSlots.filter((slot) => !!slot.targetIntentId).length;
    const total = battle.donSlots.length;
    let step = battleTutorialSteps[Math.min(battle.tutorialStep, battleTutorialSteps.length - 1)];

    if (egoNeedsPrompt()) {
      step = {
        title: 'E.G.O AWAKENED',
        text: 'Turn 4: E.G.O is ready. Click Don’s E.G.O icon at the bottom-left, review La Sangre de Sancho, then manifest it before START. The E.G.O skill costs 20 SP when used.'
      };
    } else if (battle.turn === 1) {
      if (battle.autoMode) {
        step = {
          title: battle.autoMode === 'win' ? 'WIN RATE AUTO-CHAIN' : 'DAMAGE AUTO-CHAIN',
          text: 'Automatic targeting is active because you pressed an auto button. Review the arrows, then press START.'
        };
      } else if (targeted === 0) {
        step = {
          title: 'SKILLS + ENEMY INTENTS',
          text: 'Your skill cards are at the bottom. Enemy action icons are above the bandits. Drag a skill card onto an enemy action to create a target.'
        };
      } else if (targeted < total) {
        step = { title: `TARGETS ${targeted}/${total}`, text: 'Good. Keep dragging skill cards onto enemy actions until every action slot has a target.' };
      } else {
        step = { title: 'CHAIN READY', text: 'Every action is targeted. Check the arrow colors and Clash labels, then press START.' };
      }
    }

    els.tutorialTitle.textContent = step.title;
    els.tutorialText.textContent = battle.guideMessage || step.text;
    els.battleTutorial.hidden = !(battle.turn <= 4 || egoNeedsPrompt());
    els.battleScreen.classList.toggle('lc9-show-target-help', battle.turn === 1 && targeted === 0 && !battle.autoMode);
  }

  function drawTargetLines(pointer = null) {
    if (!battle || battle.phase !== 'planning' || els.battleScreen.hidden) return;
    const svg = els.targetLines;
    const rect = els.battleScreen.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    [...svg.querySelectorAll('path.lc4-link, path.lc4-link-shadow, circle.lc4-link-origin')].forEach((node) => node.remove());

    const getCardStart = (slotIndex) => {
      const action = els.actionRail?.querySelector(`.lc4-action[data-action-slot="${slotIndex}"]`);
      const core = action?.querySelector('.lc4-slot-core');
      const card = action?.querySelector('.lc4-skill-front');
      const source = core || card;
      if (source) {
        const c = source.getBoundingClientRect();
        return { x: c.left + c.width * 0.5 - rect.left, y: c.top + c.height * 0.35 - rect.top };
      }
      return { x: rect.width * 0.5, y: rect.height - 130 };
    };

    const getIntentPoint = (btn, biasY = 0.7) => {
      const b = btn.getBoundingClientRect();
      return { x: b.left + b.width / 2 - rect.left, y: b.top + b.height * biasY - rect.top };
    };

    const buildCurve = (x1, y1, x2, y2, hostile = false, laneOffset = 0) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / distance;
      const ny = dx / distance;

      // A small normal offset gives each connection its own lane. This prevents the
      // "all arrows are one straight line" problem when several slots target nearby intents.
      const lane = Math.max(-54, Math.min(54, laneOffset));
      const baseLift = hostile
        ? Math.max(20, Math.min(78, distance * 0.10))
        : Math.max(42, Math.min(126, distance * 0.17));

      const c1x = x1 + dx * (hostile ? 0.26 : 0.24) + nx * lane;
      const c1y = y1 + dy * (hostile ? 0.26 : 0.18) - baseLift + ny * lane;
      const c2x = x1 + dx * (hostile ? 0.73 : 0.76) + nx * lane * 0.56;
      const c2y = y1 + dy * (hostile ? 0.73 : 0.82) + (hostile ? -baseLift * 0.34 : baseLift * 0.12) + ny * lane * 0.56;
      return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
    };

    const appendArrow = (cls, markerId, start, end, focus = false, laneOffset = 0) => {
      const hostile = cls.includes('hostile');
      const d = buildCurve(start.x, start.y, end.x, end.y, hostile, laneOffset);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('lc4-link', ...cls.split(' '), focus ? 'is-focus' : 'is-secondary');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      path.setAttribute('marker-end', `url(#${markerId})`);
      svg.appendChild(path);
    };

    battle.donSlots.forEach((slot) => {
      if (!slot.targetIntentId) return;
      const to = els.enemyIntentSlots.querySelector(`[data-intent-id="${slot.targetIntentId}"]`);
      if (!to) return;
      const from = getCardStart(slot.index);
      const toPoint = getIntentPoint(to, 0.76);
      const forecast = clashForecast(slot);
      const marker = forecast.cls === 'dominating' || forecast.cls === 'favored' ? 'arrowGreen' : forecast.cls === 'neutral' ? 'arrowGold' : forecast.cls === 'unopposed' ? 'arrowBlue' : 'arrowRed';
      const lane = (slot.index - (battle.donSlots.length - 1) / 2) * 16;
      appendArrow(forecast.cls, marker, from, toPoint, slot.index === battle.focusSlot, lane);
    });

    if (battle.dragSlot !== null && dragHoverIntentId) {
      const hovered = els.enemyIntentSlots.querySelector(`[data-intent-id="${dragHoverIntentId}"]`);
      if (hovered) {
        appendArrow('dragging', 'arrowGold', getCardStart(battle.dragSlot), getIntentPoint(hovered, 0.76), true, 0);
      }
    }

    const anchor = els.playerIntentAnchor;
    if (anchor && !anchor.hidden) {
      const anchorRect = anchor.getBoundingClientRect();
      const anchorPoint = (anchorRect.width > 10 && anchorRect.height > 10)
        ? { x: anchorRect.left + anchorRect.width * 0.5 - rect.left, y: anchorRect.top + anchorRect.height * 0.56 - rect.top }
        : { x: rect.width * 0.18, y: rect.height * 0.58 };
      const liveEnemySlots = battle.enemySlots.filter((slot) => !slot.consumed && enemyById(slot.enemyId)?.hp > 0);
      liveEnemySlots.forEach((slot, index) => {
        const fromBtn = els.enemyIntentSlots.querySelector(`[data-intent-id="${slot.id}"]`);
        if (!fromBtn) return;
        const from = getIntentPoint(fromBtn, 0.82);
        const centerIndex = (liveEnemySlots.length - 1) / 2;
        const lane = (index - centerIndex) * 14;
        const end = { x: anchorPoint.x + (index - centerIndex) * 5, y: anchorPoint.y + Math.abs(index - centerIndex) * 3 };
        appendArrow('hostile struggling', 'arrowHostile', from, end, battle.selectedEnemyId === slot.enemyId, lane);
      });
    }
  }


  function renderPlanning() {
    if (!battle) return;
    if (battle.encounter === 'wolf' && battle.turn >= 4 && !battle.egoUnlocked) {
      battle.egoUnlocked = true;
      battle.egoPromptAutoOpen = true;
      EgoSystem.grantTutorialResources(battle, donBattleSkills.laSangre, { sp: 45 });
      battle.guideMessage = 'E.G.O READY: Don restored to +45 SP and tutorial resources are ready. Click the glowing E.G.O icon, manifest La Sangre de Sancho, then assign it before pressing START.';
    }
    ensureBattleTurnSlots();
    TurnSystem.transition(battle, TurnSystem.PHASE.PLANNING);
    els.battleScreen.classList.remove("is-resolving", "hit-shake");
    els.planningPanel.hidden = false;
    els.targetLines.hidden = false;
    els.enemyIntentSlots.hidden = false;
    if (els.battleMatchup) els.battleMatchup.hidden = true;
    if (els.turnOrder) els.turnOrder.hidden = true;
    if (els.combatTotal) els.combatTotal.hidden = true;
    renderBattleHUD();
    renderEnemies();
    renderEnemyIntents();
    renderPlayerIntentAnchor();
    updateEgoButton();
    if (battle.egoPromptAutoOpen && !battle.egoActivated) {
      battle.egoPromptAutoOpen = false;
      setTimeout(() => {
        if (battle && battle.phase === 'planning' && egoCanAppear() && !battle.egoActivated) openEgoManifest();
      }, 120);
    }
    if (battle.selectedEnemyId != null) setSelectedEnemy(battle.selectedEnemyId);
    renderTurnOrder();
    renderActionRail();
    const liveIntents = battle.enemySlots.filter((intent) => !intent.consumed && enemyById(intent.enemyId)?.hp > 0);
    const chainReady = !liveIntents.length || battle.donSlots.every((slot) => !!slot.targetIntentId);
    els.startCombatBtn?.classList.toggle('is-ready', chainReady);
    els.startCombatBtn?.setAttribute('aria-label', chainReady ? 'Start combat — chain ready' : 'Start combat — assign all targets first');
    renderMatchupPreview();
    tutorialForTurn();
    scheduleTargetLines();
    requestAnimationFrame(positionEnemyIntents);
    requestAnimationFrame(positionPlayerIntentAnchor);
  }

  function autoSelect(mode) {
    if (!battle || battle.phase !== "planning") return;
    ensureBattleTurnSlots();
    const liveIntents = battle.enemySlots.filter((intent) => !intent.consumed && enemyById(intent.enemyId)?.hp > 0);
    battle.autoMode = mode;
    battle.guideMessage = mode === "win"
      ? "WIN RATE built a safer automatic chain. Only the focused target line is shown to keep the screen clear."
      : "DAMAGE built a higher-damage automatic chain. Only the focused target line is shown to keep the screen clear.";
    battle.donSlots.forEach((slot, index) => {
      if (mode === "win") {
        let best = null;
        [0, 1].forEach((choice) => {
          slot.selected = choice;
          slot.defense = false;
          liveIntents.forEach((intent) => {
            slot.targetIntentId = intent.id;
            const forecast = clashForecast(slot);
            const score = forecast.delta + slot.speed * .08;
            if (!best || score > best.score) best = { score, choice, target: intent.id };
          });
        });
        if (best) { slot.selected = best.choice; slot.targetIntentId = best.target; }
      } else {
        let bestChoice = 0;
        let bestDamage = -Infinity;
        [0, 1].forEach((choice) => {
          const skill = donBattleSkills[slot.options[choice]];
          const value = expectedSkillPower(skill, slot.speed, battle.don.sp, battle.don.attackUp) * Math.max(1, skill.coins);
          if (value > bestDamage) { bestDamage = value; bestChoice = choice; }
        });
        slot.selected = bestChoice;
        slot.defense = false;
        const targets = liveIntents.slice().sort((a, b) => (enemyById(a.enemyId)?.hp || 9999) - (enemyById(b.enemyId)?.hp || 9999));
        if (targets.length) slot.targetIntentId = targets[index % targets.length].id;
      }
    });
    renderPlanning();
  }

  function waitForBattleStart() {
    return new Promise((resolve) => { battleInputResolver = resolve; });
  }

  function triggerBattleStart() {
    if (!battleInputResolver || battle?.phase !== "planning") return;
    if (ensureBattleTurnSlots()) {
      renderPlanning();
    }
    const liveIntents = battle.enemySlots.filter((intent) => !intent.consumed && enemyById(intent.enemyId)?.hp > 0);
    if (liveIntents.length) {
      const unassigned = battle.donSlots.filter((slot) => !slot.targetIntentId);
      if (unassigned.length) {
        battle.guideMessage = `Assign ${unassigned.length} remaining action${unassigned.length > 1 ? "s" : ""}. Drag skill cards to enemy actions, or press WIN RATE / DAMAGE.`;
        tutorialForTurn();
        els.actionRail.classList.remove("lc8-needs-target");
        void els.actionRail.offsetWidth;
        els.actionRail.classList.add("lc8-needs-target");
        return;
      }
    }
    els.actionRail.classList.remove("lc8-needs-target");
    els.targetLines.hidden = true;
    [...els.targetLines.querySelectorAll('path.lc4-link, path.lc4-link-shadow, circle.lc4-link-origin')].forEach((node) => node.remove());
    if (els.playerIntentAnchor) els.playerIntentAnchor.hidden = true;
    const resolve = battleInputResolver;
    battleInputResolver = null;
    resolve();
  }

  function rollCoins(skill, activeCoins, slotSpeed, isEnemy = false) {
    const enemy = isEnemy ? enemyById?.(battle?.activeRollEnemyId) : null;
    const sp = isEnemy ? (enemy?.sp ?? 0) : battle.don.sp;
    const attackBonus = isEnemy || skill.defense ? 0 : battle.don.attackUp;
    const result = SkillSystem.rollPower(skill, activeCoins, {
      sp,
      speed: slotSpeed,
      attackBonus,
    });
    return { ...result, chance: Math.round(result.chance * 100) };
  }

  function renderClashCoins(container, flips, activeCoins) {
    container.innerHTML = "";
    for (let i = 0; i < activeCoins; i += 1) {
      const isHeads = !!flips?.[i];
      const coin = document.createElement("i");
      coin.className = `lc4-coin ${isHeads ? "heads" : "tails"}`;
      coin.setAttribute("aria-label", isHeads ? "Heads" : "Tails");
      coin.title = isHeads ? "Heads" : "Tails";

      const img = document.createElement("img");
      img.className = "lc4-coin-img";
      const side = container === els.clashCoinsDon ? "don" : "enemy";
      const activeSkill = side === "don" ? getSelectedSkill(battle.donSlots?.[battle.focusSlot] || battle.donSlots?.[0]) : null;
      const affinity = String(activeSkill?.affinity || "neutral").toLowerCase();
      const map = { lust:"coin-lust", gluttony:"coin-gluttony", envy:"coin-envy" };
      const frame = side === "enemy" ? "coin-neutral-dark" : (map[affinity] || "coin-neutral");
      img.src = `assets/images/ui/v67/${frame}${isHeads && side === "don" ? "-bright" : ""}.png`;
      if (isHeads && side === "don" && !["lust","gluttony","envy"].includes(affinity)) img.src = "assets/images/ui/v67/coin-neutral.png";
      img.alt = isHeads ? "Heads coin" : "Tails coin";

      coin.appendChild(img);
      container.appendChild(coin);
    }
  }

  async function animateClashRush(enemyId) {
    const motion = await dashDonToEnemy(enemyId, { duration: 240, movingState: true });
    if (!motion) return;
    const { donStage, enemyEl, dx, dy } = motion;
    const enemyStage = enemyEl?.querySelector?.(".lc4-enemy-stage") || enemyEl;

    els.battleScreen.classList.add("lc42-clash-rush");
    flashBattle();
    playClashSfx("hit");

    const enemyHit = enemyStage.animate([
      { transform: "translate3d(0,0,0)" },
      { transform: "translate3d(18px,-4px,0)" },
      { transform: "translate3d(0,0,0)" }
    ], { duration: 210, easing: "ease-out", fill: "forwards" });

    await Promise.allSettled([enemyHit.finished, rawDelay(70)]);
    await returnDonFromEnemy(donStage, dx, dy, 220);
    enemyHit.cancel();
    enemyStage.style.transform = "";
    setBattleDonState("idle");
    els.battleScreen.classList.remove("lc42-clash-rush");
  }


  async function showClash(slot, enemySlot, donCoins, enemyCoins, donRoll, enemyRoll, label = "CLASH") {
    const skill = getSelectedSkill(slot);
    const donPower = donRoll?.power ?? maxSkillPower(skill, slot.speed, battle.don.attackUp);
    const enemyPower = enemyRoll?.power ?? enemyMaxPower(enemySlot);
    const verdict = donPower > enemyPower ? "don" : donPower < enemyPower ? "enemy" : "tie";
    els.clashDonSkill.textContent = `${skill.name} · HEADS ${Math.round((donRoll?.chance ?? Helpers.calculateCoinChance(battle.don.sp)*100))}%`;
    if (els.clashDonArt && skill.art) els.clashDonArt.src = skill.art;
    els.clashEnemySkill.textContent = `${enemySlot.skill.name} · HEADS ${Math.round((enemyRoll?.chance ?? 50))}%`;
    if (els.clashEnemyArt) {
      els.clashEnemyArt.src = enemySlot.skill.art || "assets/images/battle/enemy-skills/clumsy-chop.png";
      els.clashEnemyArt.hidden = false;
    }
    els.clashResult.textContent = label;
    els.clashDonPower.textContent = String(donPower);
    els.clashEnemyPower.textContent = String(enemyPower);
    els.clashDonPower.className = `lc4-clash-power ${verdict === "don" ? "is-winning" : verdict === "enemy" ? "is-losing" : "is-even"}`;
    els.clashEnemyPower.className = `lc4-clash-power ${verdict === "enemy" ? "is-winning" : verdict === "don" ? "is-losing" : "is-even"}`;
    els.clashResult.className = verdict === "don" ? "is-don" : verdict === "enemy" ? "is-enemy" : "is-even";
    renderClashCoins(els.clashCoinsDon, donRoll?.flips || Array(donCoins).fill(false), donCoins);
    renderClashCoins(els.clashCoinsEnemy, enemyRoll?.flips || Array(enemyCoins).fill(false), enemyCoins);
    if (els.battleMatchup) {
      els.matchDonArt.src = skill.art || skill.badge || "";
      els.matchDonSkill.textContent = skill.name;
      els.matchDonSpeed.textContent = "DON QUIXOTE";
      els.matchDonCoins.textContent = `${donCoins} COIN${donCoins > 1 ? "S" : ""}`;
      els.matchDonPower.textContent = String(donPower);
      els.matchEnemySkill.textContent = enemySlot.skill.name;
      els.matchEnemySpeed.textContent = enemyById(enemySlot.enemyId)?.name?.toUpperCase() || "ENEMY";
      els.matchEnemyCoins.textContent = `${enemyCoins} COIN${enemyCoins > 1 ? "S" : ""}`;
      els.matchEnemyPower.textContent = String(enemyPower);
      els.matchForecast.textContent = label;
      els.battleMatchup.className = `lc10-matchup ${verdict === "don" ? "favored" : verdict === "enemy" ? "struggling" : "neutral"}`;
      els.battleMatchup.hidden = false;
    }
    els.battleScreen.classList.add("lc35-clash-cinematic", "lc40-clash-hud");
    els.clashOverlay.hidden = false;
    els.clashOverlay.classList.remove("is-don-win", "is-enemy-win", "is-tie", "is-active");
    void els.clashOverlay.offsetWidth;
    els.clashOverlay.classList.add("is-active", verdict === "don" ? "is-don-win" : verdict === "enemy" ? "is-enemy-win" : "is-tie");
    pulseClashNode(els.clashDonPower);
    pulseClashNode(els.clashEnemyPower);
    pulseClashNode(els.clashResult);
    spawnClashImpact(verdict);
    playClashSfx("start");
    playCoinFlipSequence(donRoll?.flips || [], enemyRoll?.flips || []);
    await delay(260);
    await animateClashRush(enemySlot.enemyId);
    await delay(260);
  }

  function combatLog(text, cls = "") {
    els.combatLog.className = `lc4-combat-log ${cls}`;
    els.combatLog.textContent = text;
    els.combatLog.classList.remove("show");
    void els.combatLog.offsetWidth;
    els.combatLog.classList.add("show");
  }

  async function floatDamage(target, amount, cls = "") {
    let el = null;
    if (target === "don") el = els.donDamage;
    else el = els.enemyRoster?.querySelector(`[data-float-enemy="${target}"]`);
    if (!el) return;
    const digitText = String(Math.max(0, Math.round(Number(amount) || 0)));
    el.innerHTML = `<span class="lc60-damage-digits">${[...digitText].map((d) => `<img src="assets/images/battle/ui/v60/digits/${d}.png" alt="${d}" />`).join('')}</span>`;
    el.className = `lc4-unit-float lc60-brush-damage ${target === "don" ? "don" : ""} ${cls}`;
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add("pop");
    await delay(300);
    el.hidden = true;
  }

  function setBattleDonState(state = "idle") {
    if (!els.battleDon) return;
    const src = battleDonSprites[state] || battleDonSprites.idle;
    els.battleDon.src = src;
    els.battleDon.dataset.battleState = state;
  }

  function setBattleDonExpression(key = "idle") {
    const semantic = ["hurt", "dead", "guard", "evade", "moving", "neutral"].includes(key) ? key : "idle";
    setBattleDonState(semantic);
  }

  function addSin(skill) {
    if (battle.sins[skill.affinity] !== undefined) battle.sins[skill.affinity] += 1;
  }

  function applyBleedTick(enemy, coinCount = 1) {
    if (!enemy || enemy.bleedCount <= 0 || enemy.bleedPotency <= 0) return 0;
    let total = 0;
    for (let i = 0; i < coinCount && enemy.bleedCount > 0; i += 1) {
      total += enemy.bleedPotency;
      enemy.bleedCount -= 1;
    }
    if (enemy.bleedCount <= 0) enemy.bleedPotency = 0;
    enemy.hp = Math.max(0, enemy.hp - total);
    return total;
  }

  function checkStagger(enemy) {
    if (!enemy || enemy.hp <= 0) return false;
    if (enemy.spriteKey === "wolf" && !enemy.mirageUsed && wolfBattleSkills.mirageSlash.cannotBeStaggeredUntilSkillUsed) return false;
    const next = enemy.thresholds[enemy.staggerLevel];
    if (next !== undefined && enemy.hp <= next) {
      enemy.staggerLevel += 1;
      enemy.staggered = true;
      enemy.staggerTurns = 1;
      return true;
    }
    return false;
  }

  function getCoinEffect(skill, coinNumber) {
    return (skill?.coinEffects || []).find((effect) => effect.coin === coinNumber) || null;
  }

  function isUnbreakableCoin(skill, coinNumber) {
    return ClashSystem.isUnbreakableCoin(skill, coinNumber);
  }

  async function resolveClash(slot, enemySlot) {
    const skill = getSelectedSkill(slot);
    const enemy = enemyById(enemySlot.enemyId);
    if (!enemy) return { winner: "don", remainingDon: skill.coins, remainingEnemy: 0 };
    setBattleDonState("guard");
    let donCoins = skill.coins;
    let enemyCoins = enemySlot.skill.coins;
    let crackedEnemyCoins = 0;
    if (enemySlot.skill.key === "mirageSlash") enemy.mirageUsed = true;
    let rounds = 0;
    while (donCoins > 0 && enemyCoins > 0 && rounds < 9) {
      rounds += 1;
      const donBleedDamage = BattleSystem.consumeBleed(battle.don, donCoins);
      if (donBleedDamage) {
        combatLog(`DON BLEED ${donBleedDamage}`, "bleed");
        await floatDamage("don", donBleedDamage, "bleed");
        renderBattleHUD();
        if (battle.don.hp <= 0) {
          setBattleDonState("dead");
          return { winner: "enemy", remainingDon: 0, remainingEnemy: enemyCoins };
        }
      }
      const bleedDamage = applyBleedTick(enemy, enemyCoins);
      if (bleedDamage) {
        combatLog(`BLEED ${bleedDamage}`, "bleed");
        await floatDamage(enemy.id, bleedDamage, "bleed");
        if (enemy.hp <= 0) {
          setBattleDonState("idle");
          return { winner: "don", remainingDon: donCoins, remainingEnemy: 0 };
        }
      }
      let dr = rollCoins(skill, donCoins, slot.speed, false);
      battle.activeRollEnemyId = enemySlot.enemyId;
      let er = rollCoins(enemySlot.skill, enemyCoins, enemySlot.speed, true);
      battle.activeRollEnemyId = null;

      const round = ClashSystem.resolveRound({
        playerSkill: skill,
        enemySkill: enemySlot.skill,
        playerCoins: donCoins,
        enemyCoins,
        playerRoll: dr,
        enemyRoll: er,
      });
      dr = round.playerRoll;
      er = round.enemyRoll;

      await showClash(slot, enemySlot, donCoins, enemyCoins, dr, er, rounds === 1 ? "CLASH" : `CLASH ${rounds}`);
      if (round.verdict === "player") {
        if (enemySlot.skill.key === "mirageSlash" && enemySlot.skill.onClashLose?.effect === "selfStagger") {
          enemy.staggered = true;
          enemy.staggerTurns = 1;
          enemy.mirageUsed = true;
          combatLog("WOLF STAGGER — MIRAGE SLASH LOST", "stagger");
        }
        const losingCoinNumber = round.lostCoinNumber;
        crackedEnemyCoins += round.crackedEnemyCoins;
        enemyCoins = round.enemyCoins;
        if (round.crackedEnemyCoins > 0) {
          combatLog("UNBREAKABLE COIN CRACKED — WILL COUNTER AFTER HIT", "neutral");
        }
        spawnCoinBurst(losingCoinNumber);
        spawnClashImpact("don");
        playClashSfx("win");
        battle.don.changeSp(2);
        els.clashOverlay.classList.remove("is-enemy-win", "is-tie");
        els.clashOverlay.classList.add("is-don-win", "lc39-impact-beat");
        setTimeout(() => els.clashOverlay?.classList.remove("lc39-impact-beat"), 220);
        els.clashResult.textContent = "CLASH WIN";
        pulseClashNode(els.clashResult);
        pulseClashNode(els.clashDonPower);
        combatLog("CLASH WIN", "win");
      } else if (round.verdict === "enemy") {
        donCoins = round.playerCoins;
        spawnCoinBurst(round.lostCoinNumber);
        spawnClashImpact("enemy");
        playClashSfx("lose");
        battle.don.changeSp(-2);
        els.clashOverlay.classList.remove("is-don-win", "is-tie");
        els.clashOverlay.classList.add("is-enemy-win", "lc39-impact-beat");
        setTimeout(() => els.clashOverlay?.classList.remove("lc39-impact-beat"), 220);
        els.clashResult.textContent = "CLASH LOSE";
        pulseClashNode(els.clashResult);
        pulseClashNode(els.clashEnemyPower);
        combatLog("CLASH LOSE", "lose");
      } else {
        spawnClashImpact("tie");
        playClashSfx("tie");
        els.clashOverlay.classList.remove("is-don-win", "is-enemy-win");
        els.clashOverlay.classList.add("is-tie", "lc39-impact-beat");
        setTimeout(() => els.clashOverlay?.classList.remove("lc39-impact-beat"), 220);
        els.clashResult.textContent = "TIE";
        pulseClashNode(els.clashResult);
        combatLog("TIE — REROLL", "neutral");
      }
      await delay(390);
    }
    els.clashOverlay.hidden = true;
    if (els.battleMatchup) els.battleMatchup.hidden = true;
    els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
    els.clashOverlay.classList.remove("is-active", "is-don-win", "is-enemy-win", "is-tie", "lc39-impact-beat");
    els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
    setBattleDonState("idle");
    return { winner: donCoins > 0 ? "don" : "enemy", remainingDon: Math.max(0, donCoins), remainingEnemy: Math.max(0, enemyCoins), crackedEnemy: crackedEnemyCoins };
  }

  function enemyElement(enemyId) {
    return els.enemyRoster?.querySelector(`[data-enemy-id="${enemyId}"]`);
  }

  function getDonAttackMotion(enemyId) {
    if (!els.battleDon) return null;
    const enemyEl = enemyElement(enemyId);
    const enemySprite = enemyEl?.querySelector?.(".lc4-bandit-sprite") || enemyEl?.querySelector?.(".lc4-bandit") || enemyEl;
    const donStage = els.battleDon.closest(".lc4-don-stage") || els.donUnit?.querySelector?.(".lc4-don-stage") || els.battleDon;
    if (!enemySprite || !donStage) return null;
    const donRect = els.battleDon.getBoundingClientRect();
    const enemyRect = enemySprite.getBoundingClientRect();
    const dx = enemyRect.left - donRect.right + Math.min(36, enemyRect.width * 0.18);
    const dy = enemyRect.top + enemyRect.height * 0.56 - (donRect.top + donRect.height * 0.56);
    return { donStage, enemyEl, enemySprite, dx, dy, enemyRect };
  }

  async function dashDonToEnemy(enemyId, options = {}) {
    const motion = getDonAttackMotion(enemyId);
    if (!motion) return null;
    const { donStage, dx, dy } = motion;
    const duration = options.duration ?? 260;
    const movingState = options.movingState ?? true;
    if (movingState) setBattleDonState("moving");
    const anim = donStage.animate([
      { transform: "translate3d(0,0,0)" },
      { transform: `translate3d(${dx}px,${dy}px,0)` }
    ], { duration, easing: "cubic-bezier(.2,.86,.28,1)", fill: "forwards" });
    await anim.finished.catch(() => {});
    anim.cancel();
    donStage.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    return motion;
  }

  async function returnDonFromEnemy(donStage, dx, dy, duration = 235) {
    if (!donStage) return;
    const anim = donStage.animate([
      { transform: `translate3d(${dx}px,${dy}px,0)` },
      { transform: "translate3d(0,0,0)" }
    ], { duration, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    await anim.finished.catch(() => {});
    anim.cancel();
    donStage.style.transform = "";
  }

  function flashBattle() {
    if (!els.screenFlash) return;
    els.screenFlash.hidden = false;
    els.screenFlash.classList.remove("go");
    void els.screenFlash.offsetWidth;
    els.screenFlash.classList.add("go");
    setTimeout(() => { els.screenFlash.hidden = true; els.screenFlash.classList.remove("go"); }, 220);
  }

  async function playSkillCutin(skill) {
    if (!els.skillCutin) return;
    if (els.skillCutinArt && skill.badge) els.skillCutinArt.src = skill.badge;
    els.skillCutinAffinity.textContent = `${skill.affinity.toUpperCase()} · ${skill.type.toUpperCase()}`;
    els.skillCutinName.textContent = skill.name;
    els.skillCutin.className = `lc5-skill-cutin lc5-cutin-${skill.css}`;
    els.skillCutin.hidden = false;
    void els.skillCutin.offsetWidth;
    els.skillCutin.classList.add("show");
    await delay(360);
    els.skillCutin.hidden = true;
    els.skillCutin.classList.remove("show");
  }

  function spawnCoinBurst(count = 4) {
    if (!els.coinBurst) return;
    els.coinBurst.innerHTML = "";
    els.coinBurst.hidden = false;
    els.coinBurst.classList.add("show");
    const n = clamp(count + 2, 4, 9);
    for (let i = 0; i < n; i += 1) {
      const c = document.createElement("i");
      c.className = "lc5-coin-shard";
      const angle = (Math.PI * 2 * i) / n + Math.random() * .4;
      const dist = 42 + Math.random() * 70;
      c.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
      c.style.setProperty("--y", `${Math.sin(angle) * dist}px`);
      c.style.setProperty("--r", `${randomInt(-420, 420)}deg`);
      els.coinBurst.appendChild(c);
    }
    setTimeout(() => { els.coinBurst.innerHTML = ""; els.coinBurst.hidden = true; els.coinBurst.classList.remove("show"); }, 650);
  }

  function spawnAfterimage(src, rect, dx = -18, dy = 0) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "lc5-afterimage";
    img.style.left = `${rect.left}px`;
    img.style.top = `${rect.top}px`;
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    img.style.setProperty("--ax", `${dx}px`);
    img.style.setProperty("--ay", `${dy}px`);
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 420);
  }

  function spawnSpeedStreaks(fromX, fromY, toX, toY, count = 7) {
    if (!els.battleFxLayer) return;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    for (let i = 0; i < count; i += 1) {
      const streak = document.createElement("i");
      streak.className = "lc5-speed-streak";
      streak.style.left = `${fromX + randomInt(-20, 45)}px`;
      streak.style.top = `${fromY + randomInt(-90, 90)}px`;
      streak.style.width = `${randomInt(85, 220)}px`;
      streak.style.transform = `rotate(${angle + randomInt(-5, 5)}deg)`;
      streak.style.animationDelay = `${i * 24}ms`;
      els.battleFxLayer.appendChild(streak);
      setTimeout(() => streak.remove(), 600);
    }
  }

  function spawnWeaponTrail(enemyId, skill, coinIndex = 0) {
    const enemyEl = enemyElement(enemyId);
    if (!enemyEl || !els.battleFxLayer) return;
    const root = els.battleScreen.getBoundingClientRect();
    const r = enemyEl.getBoundingClientRect();
    const trail = document.createElement("i");
    trail.className = "lc5-weapon-trail";
    const colors = { lust: "#e05d74", envy: "#a78bd1", gluttony: "#b8d85f", defense: "#e6d3a2" };
    trail.style.setProperty("--trail", colors[skill.css] || "#f2d98a");
    trail.style.setProperty("--rot", `${skill.key === "justice" ? -45 + coinIndex * 34 : skill.key === "gallop" ? -12 : -28}deg`);
    trail.style.left = `${r.left - root.left + r.width * .15}px`;
    trail.style.top = `${r.top - root.top + r.height * (.24 + coinIndex * .12)}px`;
    els.battleFxLayer.appendChild(trail);
    setTimeout(() => trail.remove(), 480);
  }

  function spawnImpactBurst(enemyId) {
    const enemyEl = enemyElement(enemyId);
    if (!enemyEl || !els.battleFxLayer) return;
    const root = els.battleScreen.getBoundingClientRect();
    const r = enemyEl.getBoundingClientRect();
    const hit = document.createElement("i");
    hit.className = "lc5-impact";
    hit.style.left = `${r.left - root.left + r.width * .5}px`;
    hit.style.top = `${r.top - root.top + r.height * .42}px`;
    els.battleFxLayer.appendChild(hit);
    const body = enemyEl.querySelector(".lc4-bandit");
    if (body) {
      setEnemyPose(enemyId, "hurt", 240);
      body.classList.remove("lc5-hit");
      void body.offsetWidth;
      body.classList.add("lc5-hit");
      setTimeout(() => body.classList.remove("lc5-hit"), 340);
    }
    setTimeout(() => hit.remove(), 420);
  }

  async function animateDonLunge(enemyId, skill, coinIndex = 0) {
    const motion = await dashDonToEnemy(enemyId, { duration: skill.key === "gallop" ? 260 : 235, movingState: true });
    if (!motion || !els.battleDon) return;
    const { donStage, dx, dy } = motion;
    els.battleScreen.classList.add("lc5-combat-cinema");
    els.battleDon.classList.remove("lc5-joust", "lc5-gallop", "lc5-justice", "lc5-evade", "lc5-laSangre");
    els.battleDon.classList.add(`lc5-${skill.key}`);

    const meta = battleDonAnimations[skill.key];
    if (meta?.frames?.length) {
      await playDonFrameSequence(els.battleDon, meta.frames, Math.max(320, meta.duration * 0.7));
    } else {
      await rawDelay(150);
    }
    spawnWeaponTrail(enemyId, skill, coinIndex);
    flashBattle();
    await rawDelay(50);
    await returnDonFromEnemy(donStage, dx, dy, 230);
    els.battleDon.classList.remove(`lc5-${skill.key}`);
    els.battleScreen.classList.remove("lc5-combat-cinema");
    setBattleDonState("idle");
  }


  function restartBattleGif(img, src) {
    if (!img) return;
    img.removeAttribute("src");
    void img.offsetWidth;
    img.src = `${src}?play=${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const rawDelay = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

  function playDonFrameSequence(img, frames, duration) {
    if (!img || !frames?.length) return Promise.resolve();
    let raf = 0;
    let lastFrame = -1;
    const start = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        const progress = Math.min(1, Math.max(0, (now - start) / duration));
        const frameIndex = Math.min(frames.length - 1, Math.floor(progress * frames.length));
        if (frameIndex !== lastFrame) {
          lastFrame = frameIndex;
          img.src = frames[frameIndex];
        }
        if (progress < 1) raf = requestAnimationFrame(tick);
        else resolve();
      };
      img.src = frames[0];
      raf = requestAnimationFrame(tick);
    });
  }

  async function playDonSkillSprite(skill, enemyId, coinCount, onHit) {
    const meta = battleDonAnimations[skill.key];
    if (!meta || !els.battleDon || !meta.frames?.length) {
      for (let i = 0; i < coinCount; i += 1) {
        await animateDonLunge(enemyId, skill, i);
        const customSoundPlayed = playDonSkillHitSfx(skill.key, i);
        if (!customSoundPlayed) playClashSfx("hit");
        await onHit(i);
      }
      return;
    }

    const target = enemyElement(enemyId);
    target?.classList.add("lc6-targeted");
    els.battleScreen.classList.add("lc5-combat-cinema");

    const motion = await dashDonToEnemy(enemyId, { duration: skill.key === "gallop" ? 280 : 245, movingState: true });
    if (!motion) {
      target?.classList.remove("lc6-targeted");
      els.battleScreen.classList.remove("lc5-combat-cinema");
      return;
    }
    const { donStage, dx, dy } = motion;

    els.battleDon.classList.remove("lc5-joust", "lc5-gallop", "lc5-justice", "lc5-evade", "lc5-laSangre");
    els.battleDon.classList.add(`lc5-${skill.key}`);

    const startTime = performance.now();
    const sequence = playDonFrameSequence(els.battleDon, meta.frames, Math.max(380, meta.duration * 0.72));
    const hitTimes = meta.hitTimes.slice(0, Math.max(1, coinCount));
    for (let i = 0; i < hitTimes.length; i += 1) {
      const targetTime = startTime + Math.max(380, meta.duration * 0.72) * hitTimes[i];
      const wait = Math.max(0, targetTime - performance.now());
      if (wait) await rawDelay(wait);
      spawnWeaponTrail(enemyId, skill, i);
      flashBattle();
      const customSoundPlayed = playDonSkillHitSfx(skill.key, i);
      if (!customSoundPlayed) playClashSfx("hit");
      await onHit(i);
    }
    await sequence;
    await rawDelay(50);
    await returnDonFromEnemy(donStage, dx, dy, 240);

    els.battleDon.classList.remove(`lc5-${skill.key}`);
    setBattleDonState("idle");
    target?.classList.remove("lc6-targeted");
    els.battleScreen.classList.remove("lc5-combat-cinema");
  }


  function spawnSlash(enemyId, affinity = "lust") {
    const enemyEl = enemyElement(enemyId);
    if (!enemyEl) return;
    const slash = document.createElement("i");
    slash.className = `lc4-hit-slash ${affinity}`;
    enemyEl.appendChild(slash);
    spawnImpactBurst(enemyId);
    setTimeout(() => slash.remove(), 420);
  }

  async function donAttack(slot, skill, enemy, coinCount, clashWon = false) {
    if (!enemy || enemy.hp <= 0 || coinCount <= 0) return;

    // E.G.O consumes its cost when the attack actually begins. Normal skills
    // generate their Sin resource instead.
    if (skill.ego) {
      const payment = EgoSystem.payCost(battle, skill);
      if (!payment.ok) {
        combatLog('E.G.O FAILED — INSUFFICIENT RESOURCES', 'lose');
        battle.egoActivated = false;
        battle.egoSkillReady = false;
        return 0;
      }
    } else {
      addSin(skill);
    }
    await playSkillCutin(skill);
    let total = 0;

    const resolveHit = async (i) => {
      if (enemy.hp <= 0) return;
      const roll = rollCoins(skill, 1, slot.speed, false);
      const crit = roll.flips[0] && randomInt(1, 100) <= 18;
      const variance = skill.key === 'laSangre' ? 0 : randomInt(1, 4);
      const raw = skill.base + roll.heads * getSkillCoinPower(skill, slot.speed) + battle.don.attackUp + variance;
      let damage = Math.max(1, Math.round(raw * (crit ? 1.35 : 1)));
      if (enemy.staggered) damage = Math.round(damage * 2);
      enemy.hp = Math.max(0, enemy.hp - damage);
      total += damage;
      battle.totalDamage += damage;
      spawnSlash(enemy.id, skill.css);
      const enemyEl = enemyElement(enemy.id);
      enemyEl?.animate([
        { transform: "translateX(0)" }, { transform: "translateX(16px) rotate(2deg)" }, { transform: "translateX(-8px)" }, { transform: "translateX(0)" },
      ], { duration: 340 });
      els.battleScreen.classList.remove("hit-shake");
      void els.battleScreen.offsetWidth;
      els.battleScreen.classList.add("hit-shake");
      void floatDamage(enemy.id, damage, crit ? "critical" : "");
      combatLog(`${skill.name}  ${damage}${crit ? "  CRITICAL" : ""}`, crit ? "critical" : "win");

      if (skill.key === "gallop" && roll.flips[0]) {
        enemy.bleedPotency += 2;
        enemy.bleedCount += 2;
      }
      if (skill.key === "justice") {
        if (roll.flips[0]) enemy.bleedPotency += 1;
        enemy.bleedCount += 1;
      }
      if (skill.key === 'laSangre' && roll.flips[0]) {
        enemy.bleedPotency += 4;
        enemy.bleedCount += 1;
      }
      if (battle.egoPassiveActive && (enemy.bleedPotency || 0) > 0) {
        const beforeHp = battle.don.hp;
        battle.don.hp = Math.min(battle.don.maxHp || beforeHp, beforeHp + 3);
        if (battle.don.hp > beforeHp) combatLog(`IMMODERATE PASSION · HEAL ${battle.don.hp - beforeHp}`, 'win');
      }
      if (checkStagger(enemy)) combatLog("STAGGER", "stagger");
      renderEnemies();
      renderBattleHUD();
    };

    if (skill.key === 'laSangre') {
      await playEgoCinematic();
      for (let i = 0; i < Math.max(1, coinCount); i += 1) await resolveHit(i);
    } else {
      await playDonSkillSprite(skill, enemy.id, Math.max(1, coinCount), resolveHit);
    }
    if (skill.key === 'laSangre') {
      battle.egoUsed = true;
      battle.egoSkillReady = false;
      // Cost was committed before the attack started by EgoSystem.payCost().
      // Immoderate Passion: after E.G.O is used, On Hit against a Bleeding target heals 3 HP.
      battle.egoPassiveActive = true;
      combatLog('La Sangre de Sancho · -10 SP · -2 Lust · -2 Pride', 'critical');
      renderBattleHUD();
    }
    if (skill.key === "joust" && clashWon) battle.don.nextHaste += 2;
    if (skill.key === "gallop" && clashWon) battle.don.nextAttackUp += 2;
    return total;
  }

  function getWolfCriticalBonusPercent(enemy, skill, poisePotencyAtUse = 0) {
    if (!enemy || enemy.spriteKey !== "wolf") return 20;
    if (skill?.key === "mirageSlash") return 200;
    if (skill?.key === "indigoBlade") {
      return 100 + Math.min(50, Math.max(0, poisePotencyAtUse) * 2);
    }
    return 20;
  }

  function rollEnemyPoiseCriticals(enemy, coinCount) {
    const results = [];
    const count = Math.max(1, coinCount || 1);
    for (let i = 0; i < count; i += 1) {
      results.push(BattleSystem.rollPoiseCritical(enemy));
    }
    return results;
  }

  async function enemyAttack(enemySlot, remainingCoins = null, options = {}) {
    const enemy = enemyById(enemySlot.enemyId);
    if (!enemy || enemy.hp <= 0 || enemy.staggered || battle.don.hp <= 0) {
      enemySlot.consumed = true;
      return;
    }
    const coins = Math.max(1, remainingCoins ?? enemySlot.skill.coins);
    const attackSkill = options.cracked
      ? { ...enemySlot.skill, coinPower: enemySlot.skill.coinPower >= 0 ? 1 : -1, coins }
      : enemySlot.skill;
    const bleedDamage = applyBleedTick(enemy, coins);
    if (bleedDamage) {
      combatLog(`BLEED ${bleedDamage}`, "bleed");
      await floatDamage(enemy.id, bleedDamage, "bleed");
      renderEnemies();
      if (enemy.hp <= 0) { enemySlot.consumed = true; return; }
    }
    const attackPose = enemy.spriteKey === "wolf"
      ? (enemySlot.skill?.key || "attack")
      : "attack";
    setEnemyPose(enemy.id, attackPose, 920);
    const enemyEl = enemyElement(enemy.id)?.querySelector(".lc4-bandit");
    if (enemyEl) {
      const er = enemyEl.getBoundingClientRect();
      const dr = els.battleDon.getBoundingClientRect();
      const dx = Math.min(-54, dr.right - er.left + 46);
      const dy = (dr.top + dr.height * .52) - (er.top + er.height * .52);
      enemyEl.animate([
        { transform: "translate3d(0,0,0) scale(1)" },
        { transform: `translate3d(${dx * .72}px,${dy * .72}px,0) scale(1.04)`, offset: .48 },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(1.08)`, offset: .67 },
        { transform: `translate3d(${dx * .9}px,${dy * .9}px,0) scale(1.06)`, offset: .78 },
        { transform: "translate3d(0,0,0) scale(1)" },
      ], { duration: enemy.spriteKey === "wolf" ? 760 : 820, easing: "cubic-bezier(.16,.84,.24,1)" });
    }
    await delay(400);
    battle.activeRollEnemyId = enemySlot.enemyId;
    const roll = rollCoins(attackSkill, coins, enemySlot.speed, true);
    battle.activeRollEnemyId = null;
    const damageScale = attackSkill.defense ? 0.38 : 0.72;
    const poisePotencyAtUse = enemy.poisePotency || 0;
    const poiseChanceAtUse = BattleSystem.poiseCritChance(enemy);
    const poiseRolls = attackSkill.defense ? [] : rollEnemyPoiseCriticals(enemy, coins);
    const criticalCount = poiseRolls.filter((result) => result.critical).length;
    const critBonusPercent = getWolfCriticalBonusPercent(enemy, enemySlot.skill, poisePotencyAtUse);
    const critShare = criticalCount / Math.max(1, coins);
    const critMultiplier = 1 + (critBonusPercent / 100) * critShare;
    let damage = Math.max(1, Math.round((roll.power + (enemy.damageUp || 0) + randomInt(1, 4)) * damageScale * critMultiplier));
    let damageResult = { staggerTriggered: false };
    const isWolf = enemy.spriteKey === "wolf";
    if (isWolf && enemySlot.skill.key === "azureRend") {
      const spDamage = Math.max(3, Math.round(damage * 0.8));
      battle.don.changeSp(-spDamage);
      damage = 0;
      combatLog(`AZURE REND  -${spDamage} SP`, "lose");
    } else {
      damageResult = battle.don.takeDamage(damage);
      battle.don.staggered = battle.don.isStaggered;
    }
    for (const effect of enemySlot.skill.applyOnHit || []) {
      BattleSystem.addStatus(battle.don, effect.type, effect.potency, effect.count);
    }
    if (isWolf) {
      if (enemySlot.skill.key === "sever") {
        enemy.nextHaste = (enemy.nextHaste || 0) + 1;
        BattleSystem.gainPoise(enemy, 2, 4);
        combatLog(`WOLF GAINS POISE ${enemy.poisePotency}/${enemy.poiseCount}`, "neutral");
      }
      if (enemySlot.skill.key === "indigoBlade") enemy.sp = clamp((enemy.sp || 0) + 10, -45, 45);
      if (enemySlot.skill.key === "shimmeringCleave") {
        enemy.sp = clamp((enemy.sp || 0) + 6, -45, 45);
        enemy.damageUp = Math.min(6, (enemy.damageUp || 0) + 2);
        // Coin II grants Poise Potency on hit; its Heads Hit grants +4 Count.
        const coinTwoHead = !!roll.flips?.[Math.max(0, roll.flips.length - 1)];
        BattleSystem.gainPoise(enemy, 4, coinTwoHead ? 4 : 0);
        combatLog(`WOLF GAINS POISE ${enemy.poisePotency}/${enemy.poiseCount}${coinTwoHead ? " (HEADS +4 COUNT)" : ""}`, "neutral");
      }
    }
    if (damageResult.staggerTriggered) combatLog("DON STAGGER", "stagger");
    if (criticalCount > 0) {
      combatLog(`CRITICAL x${criticalCount} · POISE ${poisePotencyAtUse} (${poiseChanceAtUse}%) · +${critBonusPercent}% CRIT DMG`, "critical");
    }
    if (!playEnemyAttackSfx(enemySlot.skill.key)) playClashSfx("hit");
    setBattleDonState(battle.don.hp <= 0 ? "dead" : "hurt");
    enemySlot.consumed = true;
    els.battleScreen.classList.remove("hit-shake");
    void els.battleScreen.offsetWidth;
    els.battleScreen.classList.add("hit-shake");
    if (!(enemy.spriteKey === "wolf" && enemySlot.skill.key === "azureRend")) {
      combatLog(`${enemySlot.skill.name}${options.cracked ? " [CRACKED]" : ""}  ${damage}`, "lose");
      await floatDamage("don", damage, criticalCount > 0 ? "critical" : "lose");
    } else {
      await floatDamage("don", "SP", "lose");
    }
    renderBattleHUD();
    await delay(260);
    if (battle.don.hp > 0) setBattleDonState("idle");
  }

  async function resolveEvade(slot, enemySlot) {
    const enemy = enemyById(enemySlot.enemyId);
    if (!enemy || enemy.hp <= 0) { enemySlot.consumed = true; return; }
    const skill = donBattleSkills.evade;
    await playSkillCutin(skill);
    const dr = rollCoins(skill, 1, slot.speed, false);
    battle.activeRollEnemyId = enemySlot.enemyId;
    const er = rollCoins(enemySlot.skill, enemySlot.skill.coins, enemySlot.speed, true);
    battle.activeRollEnemyId = null;
    await showClash(slot, enemySlot, 1, enemySlot.skill.coins, dr, er, "EVADE");
    if (dr.power >= er.power) {
      enemySlot.consumed = true;
      battle.don.sp = clamp(battle.don.sp + 5, -45, 45);
      combatLog("EVADE", "win");
      setBattleDonState("evade");
      const r = els.battleDon.getBoundingClientRect();
      spawnAfterimage(battleDonSprites.evade, r, 70, 0);
      spawnSpeedStreaks(r.left, r.top + r.height * .45, r.left - 120, r.top + r.height * .45, 9);
      els.battleDon.classList.add("lc5-evade");
      els.battleDon.animate([
        { transform: "translateX(0) skewX(0)" }, { transform: "translateX(-110px) skewX(10deg)", offset:.42 }, { transform: "translateX(-128px) skewX(6deg)", offset:.62 }, { transform: "translateX(0) skewX(0)" },
      ], { duration: 700, easing:"cubic-bezier(.12,.8,.2,1)" });
      await delay(520);
      els.battleDon.classList.remove("lc5-evade");
      setBattleDonState("idle");
    } else {
      els.clashOverlay.hidden = true;
      if (els.battleMatchup) els.battleMatchup.hidden = true;
    if (els.battleMatchup) els.battleMatchup.hidden = true;
    els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
      els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
      await enemyAttack(enemySlot, Math.max(1, enemySlot.skill.coins));
    }
    els.clashOverlay.hidden = true;
    if (els.battleMatchup) els.battleMatchup.hidden = true;
    els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
  }

  async function resolvePlayerAction(slot) {
    if (!slot || battle.don.hp <= 0 || battleWon()) return;
    const enemySlot = enemySlotById(slot.targetIntentId);
    if (!enemySlot) return;
    const enemy = enemyById(enemySlot.enemyId);
    if (!enemy || enemy.hp <= 0) return;
    const skill = getSelectedSkill(slot);

    if (battle.don.staggered || battle.don.isStaggered) {
      combatLog("DON STAGGERED — UNOPPOSED", "stagger");
      await enemyAttack(enemySlot, enemySlot.skill.coins);
      battle.don.staggered = false;
      battle.don.isStaggered = false;
      battle.don.staggerTurns = 0;
      return;
    }

    if (enemySlot.consumed || enemy.staggered) {
      combatLog(`${skill.name} — UNOPPOSED`, "unopposed");
      if (!skill.defense) await donAttack(slot, skill, enemy, skill.coins, false);
      return;
    }

    if (skill.defense) {
      await resolveEvade(slot, enemySlot);
      return;
    }

    const result = await resolveClash(slot, enemySlot);
    enemySlot.consumed = true;
    if (result.winner === "don") {
      battle.don.changeSp(10);
      await donAttack(slot, skill, enemy, Math.max(1, result.remainingDon), true);
      if ((result.crackedEnemy || 0) > 0 && enemy.hp > 0 && !enemy.staggered && battle.don.hp > 0) {
        combatLog("CRACKED UNBREAKABLE COIN — COUNTER", "neutral");
        await enemyAttack(enemySlot, result.crackedEnemy, { cracked: true });
      }
    } else if (enemy.hp > 0) {
      battle.don.changeSp(-10);
      await enemyAttack(enemySlot, Math.max(1, result.remainingEnemy));
    }
  }

  async function executePlannedTurn() {
    TurnSystem.transition(battle, TurnSystem.PHASE.COMBAT);
    battle.totalDamage = 0;
    renderBattleHUD();
    els.battleScreen.classList.add("is-resolving");
    els.planningPanel.hidden = true;
    els.targetLines.hidden = true;
    els.enemyIntentSlots.hidden = true;
    if (els.playerIntentAnchor) els.playerIntentAnchor.hidden = true;
    if (els.egoActivateBtn) els.egoActivateBtn.hidden = true;
    els.battleTutorial.hidden = true;
    hideSkillInspector();
    if (els.combatTotal) {
      els.combatTotal.hidden = false;
      els.combatTotal.querySelector("b").textContent = "0";
    }
    await delay(380);

    const processed = new Set();
    const queue = TurnSystem.buildActionQueue(battle.donSlots, battle.enemySlots);

    for (const action of queue) {
      if (battle.don.hp <= 0 || battleWon()) break;
      if (action.type === "don") {
        if (processed.has(`d${action.slot.index}`)) continue;
        processed.add(`d${action.slot.index}`);
        await resolvePlayerAction(action.slot);
      } else {
        if (action.slot.consumed) continue;
        const targeter = battle.donSlots.find((slot) => !processed.has(`d${slot.index}`) && slot.targetIntentId === action.slot.id);
        if (targeter) {
          processed.add(`d${targeter.index}`);
          await resolvePlayerAction(targeter);
        } else {
          await enemyAttack(action.slot);
        }
      }
      if (els.combatTotal) els.combatTotal.querySelector("b").textContent = String(battle.totalDamage);
      renderEnemies();
      renderBattleHUD();
      await delay(120);
    }

    els.clashOverlay.hidden = true;
    if (els.battleMatchup) els.battleMatchup.hidden = true;
    els.battleScreen.classList.remove("lc35-clash-cinematic", "lc40-clash-hud", "lc40-clash-rush", "lc42-clash-rush");
    setBattleDonExpression("idle");
    await delay(360);
    els.battleScreen.classList.remove("is-resolving");
    TurnSystem.transition(battle, TurnSystem.PHASE.CLEANUP);
  }

  function applyTurnStartBuffs() {
    battle.don.haste = battle.don.nextHaste;
    battle.don.nextHaste = 0;
    battle.don.attackUp = battle.don.nextAttackUp;
    battle.don.nextAttackUp = 0;
    battle.enemies.forEach((enemy) => {
      if (enemy.staggerTurns <= 0) enemy.staggered = false;
      if (enemy.spriteKey === "wolf") {
        enemy.haste = enemy.nextHaste || 0;
        enemy.nextHaste = 0;
      }
    });
    if (battle.don.staggerTurns <= 0) { battle.don.staggered = false; battle.don.isStaggered = false; }
    createTurnSlots();
  }

  function finishTurn() {
    battle.enemies.forEach((enemy) => {
      if (enemy.staggerTurns > 0) enemy.staggerTurns -= 1;
      if ((enemy.poiseCount || 0) > 0) {
        const before = enemy.poiseCount;
        BattleSystem.decayPoise(enemy, 1);
        if (enemy.spriteKey === "wolf" && before !== enemy.poiseCount) {
          combatLog(enemy.poiseCount > 0 ? `POISE COUNT ${before} → ${enemy.poiseCount}` : "POISE EXPIRED", "neutral");
        }
      }
    });
    if (battle.don.staggerTurns > 0) battle.don.staggerTurns -= 1;
    battle.turn += 1;
    if (battle.encounter === 'wolf' && battle.turn >= 4 && !battle.egoUnlocked) {
      battle.egoUnlocked = true;
      battle.egoPromptAutoOpen = true;
      EgoSystem.grantTutorialResources(battle, donBattleSkills.laSangre, { sp: 45 });
      battle.guideMessage = 'E.G.O READY: Don restored to +45 SP and tutorial resources are ready. Click the glowing E.G.O icon, manifest La Sangre de Sancho, then assign it before pressing START.';
      showNotice('TURN 4 — DON RESTORED TO +45 SP · E.G.O READY', 2600);
    }
    battle.tutorialStep = Math.min(battle.tutorialStep + 1, battleTutorialSteps.length - 1);
  }

  function showBattleResult(victory) {
    setBattleDonState(victory ? "neutral" : "dead");
    els.battleResultSmall.textContent = victory ? "ENCOUNTER COMPLETE" : "DON QUIXOTE IS DOWN";
    els.battleResultTitle.textContent = victory ? "VICTORY" : "DEFEAT";
    els.battleContinue.textContent = victory ? "CONTINUE" : "RETRY";
    els.battleResult.hidden = false;
    return new Promise((resolve) => { battleResultResolver = resolve; });
  }

  const battleIntroPages = [
    { title: "SKILLS & SPEED", text: "Each action slot belongs to Don and has a Speed value plus two skill cards. Click a card to inspect it; the front card is the one that will be used." },
    { title: "DRAG TO TARGET", text: "Drag the skill card itself onto an enemy action icon. That creates the target arrow and Clash forecast. Nothing is targeted automatically when a turn begins." },
    { title: "WIN RATE / DAMAGE", text: "WIN RATE and DAMAGE are optional auto-chain buttons. Pressing one automatically selects skills and targets, which is when automatic arrows appear. Press START after the chain is ready." },
  ];

  function showBattleIntro() {
    if (!els.battleIntro) return Promise.resolve();
    return new Promise((resolve) => {
      let page = 0;
      const render = () => {
        const data = battleIntroPages[page];
        els.battleIntroStep.textContent = `${String(page + 1).padStart(2, "0")} / ${String(battleIntroPages.length).padStart(2, "0")}`;
        els.battleIntroTitle.textContent = data.title;
        els.battleIntroText.textContent = data.text;
        els.battleIntroPrev.disabled = page === 0;
        els.battleIntroNext.textContent = page === battleIntroPages.length - 1 ? "GOT IT" : "NEXT";
      };
      const finish = () => {
        els.battleIntro.hidden = true;
        els.battleIntroPrev.onclick = null;
        els.battleIntroNext.onclick = null;
        els.battleIntroSkip.onclick = null;
        state.battleIntroSeen = true;
        saveCheckpoint();
        resolve();
      };
      els.battleIntroPrev.onclick = () => { if (page > 0) { page -= 1; render(); } };
      els.battleIntroNext.onclick = () => {
        if (page >= battleIntroPages.length - 1) finish();
        else { page += 1; render(); }
      };
      els.battleIntroSkip.onclick = finish;
      els.battleIntro.hidden = false;
      render();
    });
  }

  async function showWaveTransition() {
    if (!battle || !els.battleGuideTitle || !els.battleGuideText) return;
    els.battleGuideTitle.textContent = `WAVE ${battle.wave}`;
    if (battle.wave === 2) {
      els.battleGuideText.textContent = "The same 3 bandits return with 1 elite reinforcement. Prepare a new command chain.";
    } else {
      els.battleGuideText.textContent = `Wave ${battle.wave} begins.`;
    }
    await delay(900);
  }

  async function showBattleLoading(encounter = "bandit") {
    if (!els.battleLoading) return;
    const wolf = encounter === "wolf";
    const heathcliff = encounter === "heathcliff";
    const versus = encounter === "versus";
    const training = encounter === "training";
    if (els.battleLoadingArea) els.battleLoadingArea.textContent = wolf || heathcliff ? "FOREST // DEEP SECTOR" : training ? "TRAINING GROUNDS" : versus ? "VERSUS ARENA" : "FOREST // OUTSKIRTS";
    if (els.battleLoadingTitle) els.battleLoadingTitle.textContent = wolf ? "WOLF // BOSS ENCOUNTER" : heathcliff ? "HEATHCLIFF // FRIENDLY SPAR" : training ? "TRAINING MODE" : versus ? "VERSUS MATCH" : "BACKSTREET AMBUSH";
    if (els.battleLoadingHint) els.battleLoadingHint.textContent = wolf
      ? "Boss threat detected. Manage spacing, guard the slash, and punish recovery."
      : heathcliff
        ? "A friendly spar with Don’s fellow Sinner. Heathcliff builds E.G.O gauge during combat; the spar ends with respect, not enmity."
        : training
        ? "Practice movement, defense, spacing and all three skills. Press Escape to leave."
        : versus
          ? "A real-time duel. Read startup, defend, and punish recovery."
          : "Initializing real-time combat. Move, jump, guard, dash, and strike when in range...";
    if (els.battleLoadingBar) els.battleLoadingBar.style.width = "0%";
    if (els.battleLoadingPercent) els.battleLoadingPercent.textContent = "00%";
    els.battleLoading.classList.remove("is-leaving");
    els.battleLoading.hidden = false;
    syncGlobalSettingsButton();

    const steps = [7, 16, 28, 43, 59, 74, 88, 100];
    for (const progress of steps) {
      if (els.battleLoadingBar) els.battleLoadingBar.style.width = `${progress}%`;
      if (els.battleLoadingPercent) els.battleLoadingPercent.textContent = `${String(progress).padStart(2, "0")}%`;
      await rawDelay(progress === 100 ? 180 : 80 + Math.round(progress * .45));
    }
    els.battleLoading.classList.add("is-leaving");
    await rawDelay(360);
    els.battleLoading.hidden = true;
    els.battleLoading.classList.remove("is-leaving");
    syncGlobalSettingsButton();
  }

  async function startBattleTutorial(encounter = "bandit") {
    const isWolfEncounter = encounter === "wolf";
    const isHeathcliffEncounter = encounter === "heathcliff";
    battle = isWolfEncounter ? makeWolfBattleState() : isHeathcliffEncounter ? makeHeathcliffBattleState() : makeBattleState();
    state.scene = isWolfEncounter ? "wolfBattle" : isHeathcliffEncounter ? "heathcliffBattle" : "forestBattle";
    if (isWolfEncounter) state.wolfBattleSeen = true;
    else if (isHeathcliffEncounter) state.heathcliffBattleSeen = true;
    else state.forestBattleSeen = true;
    saveCheckpoint();
    els.dialogueBox.hidden = true;
    closeChoices();
    els.character.hidden = true;
    els.hud.hidden = true;
    els.quickMenu.hidden = true;
    setStoryChromeVisible(false);
    els.backpackBtn.hidden = true;
    els.battleResult.hidden = true;
    els.battleScreen.hidden = true;
    await showBattleLoading(encounter);
    els.battleScreen.hidden = false;
    els.battleScreen.classList.add("rt-active");
    const rtArena = document.getElementById("realtimeArena");
    if (rtArena) rtArena.hidden = false;
    playBattleTheme();
    setBattleDonExpression("idle");

    // This is the main game's battle entry point. Story/dialogue, encounter data,
    // original character art and the existing result/retry flow stay in use; only
    // the turn-planning combat resolver is replaced by the real-time engine.
    realtimeBattleActive = true;
    let victory = false;
    try {
      realtimeMode = new RealtimeBattleMode({
        root: rtArena,
        onFps: (fps) => {
          const fpsNode = document.getElementById("rtFpsStatus");
          if (fpsNode && fps > 0) fpsNode.textContent = `${Math.round(fps)} FPS · FIXED 60 Hz SIMULATION`;
        },
        onMoveStart: playRealtimeMoveVoice,
        onRoundStart: ({ round = 1 } = {}) => voiceLineManager.playEvent(
          "don",
          round === 1 ? "encounterStart" : "roundStart",
          { cooldownMs: 500 },
        ),
        onHit: playRealtimeReactionVoice,
      });
      realtimeMode.setDebugBoxes(showHitboxesSetting);
      while (battle.active && battle.don.hp > 0) {
        const roundResult = await realtimeMode.runRound(battle, encounter);
        if (roundResult === "reset") continue;
        if (roundResult === "defeat" || battle.don.hp <= 0) break;
        if (battleWon()) {
          if (advanceToNextWave()) {
            realtimeMode.setMessage(`WAVE ${battle.wave}: reinforcements enter the forest. Keep fighting!`);
            await delay(950);
            continue;
          }
          victory = true;
          break;
        }
      }

      battle.active = false;
      voiceLineManager.playEvent("don", victory ? "victory" : "defeat");
      const result = await realtimeMode.showResult(victory);
      realtimeMode.dispose();
      realtimeMode = null;
      realtimeBattleActive = false;
      els.battleScreen.classList.remove("rt-active");
      els.battleScreen.hidden = true;
      if (result === "retry") {
        const retryEncounter = isWolfEncounter ? "wolf" : encounter;
        battle = null;
        return startBattleTutorial(retryEncounter);
      }

      restoreStoryTheme();
      battle = null;
      els.hud.hidden = false;
      els.quickMenu.hidden = false;
      setStoryChromeVisible(true);
      els.backpackBtn.hidden = false;
      return victory;
    } catch (error) {
      console.error("[REALTIME BATTLE] Encounter failed:", error);
      realtimeMode?.dispose();
      realtimeMode = null;
      realtimeBattleActive = false;
      els.battleScreen.classList.remove("rt-active");
      els.battleScreen.hidden = true;
      if (rtArena) rtArena.hidden = true;
      restoreStoryTheme();
      els.hud.hidden = false;
      els.quickMenu.hidden = false;
      setStoryChromeVisible(true);
      els.backpackBtn.hidden = false;
      showNotice("Real-time combat could not start. Open DevTools for the error details.", 5000);
      battle = null;
      return false;
    }
  }


  /** Standalone Versus and Training use the same renderer/combat modules as story encounters. */
  async function startStandaloneRealtime(mode = "versus", versusConfig = null) {
    if (standaloneStarting || realtimeBattleActive) return;
    standaloneStarting = true;
    const training = mode === "training";
    const localVersus = mode === "versus" && !!versusConfig?.localMultiplayer;
    try {
      resetUIForNewGame();
      els.titleScreen.hidden = true;
      els.hud.hidden = true;
      els.quickMenu.hidden = true;
      els.backpackBtn.hidden = true;
      setStoryChromeVisible(false);
      els.dialogueBox.hidden = true;
      closeChoices();
      els.battleResult.hidden = true;
      await showBattleLoading(training ? "training" : "versus");

      els.battleScreen.hidden = false;
      els.battleScreen.classList.add("rt-active");
      const rtArena = document.getElementById("realtimeArena");
      if (rtArena) rtArena.hidden = false;
      if (els.versusSelectScreen) els.versusSelectScreen.hidden = true;
      playBattleTheme();
      realtimeBattleActive = true;

      realtimeMode = new RealtimeBattleMode({
        root: rtArena,
        standaloneMode: true,
        trainingMode: training,
        versusConfig: localVersus ? versusConfig : null,
        controlsConfig: keyBindings,
        controllerConfig: controllerSettings,
        onFps: (fps) => {
          const fpsNode = document.getElementById("rtFpsStatus");
          if (fpsNode && fps > 0) fpsNode.textContent = `${Math.round(fps)} FPS · FIXED 60 Hz SIMULATION`;
        },
        onMoveStart: playRealtimeMoveVoice,
        onRoundStart: ({ round = 1 } = {}) => voiceLineManager.playEvent(
          "don",
          round === 1 ? "encounterStart" : "roundStart",
          { cooldownMs: 500 },
        ),
        onHit: playRealtimeReactionVoice,
      });
      realtimeMode.setDebugBoxes(showHitboxesSetting);

      let nextAction = "retry";
      while (nextAction !== "main-menu" && nextAction !== "exit") {
        battle = localVersus ? makeVersusBattleState(versusConfig) : makeBattleState();
        battle.active = true;
        battle.wave = 1;
        battle.totalWaves = 1;
        battle.encounter = mode;
        if (training) battle.enemies = [mkBattleEnemy(900, "Training Dummy", 999999, "CLUB", "club")];
        else if (!localVersus) battle.enemies = [mkBattleEnemy(901, "Roadside Thug", 220, "CLUB", "club")];

        const roundResult = await realtimeMode.runRound(battle, training ? "training" : "versus");
        if (roundResult === "reset") continue;
        if (roundResult === "exit") {
          nextAction = "exit";
          break;
        }
        voiceLineManager.playEvent("don", roundResult === "win" ? "victory" : "defeat");
        nextAction = await realtimeMode.showResult(roundResult === "win", { standalone: true, training, versusConfig: localVersus ? versusConfig : null });
      }
    } catch (error) {
      console.error(`[${mode.toUpperCase()}] startup failed:`, error);
      showNotice(`${mode.toUpperCase()} mode could not start. Open DevTools for details.`, 5000);
    } finally {
      realtimeMode?.dispose();
      realtimeMode = null;
      realtimeBattleActive = false;
      standaloneStarting = false;
      battle = null;
      els.systemModal.hidden = true;
      els.systemModal.style.zIndex = "";
      els.battleScreen.classList.remove("rt-active");
      els.battleScreen.hidden = true;
      const rtArena = document.getElementById("realtimeArena");
      if (rtArena) rtArena.hidden = true;
      els.battleLoading.hidden = true;
      els.titleScreen.hidden = false;
      if (els.versusSelectScreen) els.versusSelectScreen.hidden = true;
      els.mainMenuView.hidden = false;
      els.storyModeView.hidden = true;
      els.hud.hidden = true;
      els.quickMenu.hidden = true;
      els.backpackBtn.hidden = true;
      setStoryChromeVisible(false);
      setBackground("don_room");
      restoreStoryTheme();
      updateContinueButton();
    }
  }

  async function startWolfBattleEncounter() {
    state.scene = "wolfBattlePrep";
    saveCheckpoint();
    setWolfCharacter(true);
    await say("Wolf", "Enough talking. Show me whether that justice of yours can survive a real blade.");
    setWolfCharacter(false);
    const victory = await startBattleTutorial("wolf");
    if (!victory) return false;
    state.wolfBattleWon = true;
    state.scene = "wolfAfterBattle";
    saveCheckpoint();
    setBackground("forest");
    setWolfCharacter(true);
    await say("Wolf", "...So you really do keep getting back up.");
    setCharacter("superHappy");
    await say("Don Quixote", "Naturally! Justice does not yield so easily!");
    setWolfCharacter(true);
    await say("Wolf", "Do not misunderstand. This changes nothing between us.");
    await say("Wolf", "But for today... I have seen enough.");
    setWolfCharacter(false);
    setCharacter("idle");

    // Narrative hand-off: Heathcliff appears immediately after Don defeats Wolf.
    // His encounter is saved independently so a failed attempt can be retried later.
    if (!state.heathcliffBattleWon) await startHeathcliffEncounter();
    return true;
  }

  async function startHeathcliffEncounter() {
    const returning = !!state.heathcliffIntroSeen;
    state.scene = "heathcliffIntro";
    state.heathcliffBattleSeen = true;
    saveCheckpoint();
    setBackground("forest");
    setHeathcliffCharacter(true);
    if (!returning) {
      await say("Heathcliff", "Oi. You're the one who just beat Wolf?");
      setHeathcliffCharacter(false);
      setCharacter("happy");
      await say("Don Quixote", "A fellow Sinner! Then let us test our skills in a friendly spar, comrade!");
      setHeathcliffCharacter(true);
      await say("Heathcliff", "Heathcliff. Fine. A spar, not a grudge. Try to keep up.");
      state.heathcliffIntroSeen = true;
      saveCheckpoint();
    } else {
      await say("Heathcliff", "Round two, Don. Just practice—I'm not trying to put you in the ground.");
    }
    setHeathcliffCharacter(false);
    setCharacter("idle");

    const victory = await startBattleTutorial("heathcliff");
    state.heathcliffBattleSeen = true;
    state.heathcliffBattleWon = !!victory;
    saveCheckpoint();
    setBackground("forest");
    if (victory) {
      setHeathcliffCharacter(true);
      await say("Heathcliff", "Hah. You can actually keep up. Not bad for a partner.");
      setHeathcliffCharacter(false);
      setCharacter("happy");
      await say("Don Quixote", "An excellent bout, comrade! We shall both grow stronger from this!");
    } else {
      setHeathcliffCharacter(true);
      await say("Heathcliff", "That's enough for now. Catch your breath; we can spar again when you're ready.");
      setHeathcliffCharacter(false);
    }
    setCharacter("idle");
    state.scene = "heathcliffAfterBattle";
    saveCheckpoint();
    return !!victory;
  }

  async function playWolfIntroConversation() {
    state.scene = "wolfIntro";
    setBackground("forest");
    setStoryChromeVisible(true);
    for (const line of wolfIntroDialogue) {
      if (line.portrait === "wolf") setWolfCharacter(true);
      else setCharacter(line.expression || "idle");
      await say(line.speaker, line.text);
    }
    state.wolfIntroSeen = true;
    state.scene = "wolfBattlePrep";
    saveCheckpoint();
    return startWolfBattleEncounter();
  }

  async function forestEncounter() {
    if (state.forestBattleWon) {
      if (!state.wolfIntroSeen) {
        await playWolfIntroConversation();
      } else if (!state.wolfBattleWon) {
        setBackground("forest");
        setWolfCharacter(true);
        await say("Wolf", "You came back. Good. We finish this now.");
        setWolfCharacter(false);
        await startWolfBattleEncounter();
      } else if (!state.heathcliffBattleWon) {
        await startHeathcliffEncounter();
      } else {
        setCharacter("happy");
        await say("Don Quixote", "The forest road is peaceful for now... though I suspect Wolf and Heathcliff may cross my path again!");
      }
      await mapLoop();
      return;
    }

    state.scene = "forestEncounter";
    setCharacter("idle");
    await say("", "Branches snap somewhere ahead. Several figures step onto the path and block the way.");
    setCharacter("lilMad");
    await say("Bandit Leader", "Stop there. Hand over the bag and turn around.");
    setCharacter("angry");
    await say("Don Quixote", "A whole band of highway villains, in this very forest?!");
    await say("Don Quixote", "Then I shall demonstrate the proper course of JUSTICE!");
    setCharacter("idle", false);

    const victory = await startBattleTutorial();
    if (!victory) return;
    state.forestBattleWon = true;
    state.questClear.ForestPass = true;
    state.scene = "forestAfterBattle";
    saveCheckpoint();
    setBackground("forest");
    setCharacter("superHappy");
    await say("Don Quixote", "Hah! A most educational victory!");
    setCharacter("happy");
    await say("Don Quixote", `${state.playerName}, didst thou witness that splendid display?`);
    await playWolfIntroConversation();
    await mapLoop();
  }

  async function runLocation(loc) {
    if (loc === "Bus") {
      setBackground("bus");
      setCharacter("happy");
      await say("Don Quixote", "Back at the bus.");
      if (!state.questClear.Tutorial) {
        state.questClear.Tutorial = true;
        state.mapUnlocked.Forest = true;
        showNotice("Map unlocked: Forest.");
      }
      await story2();
      return;
    }
    if (loc === "Town") {
      setBackground("town");
      setCharacter("happy");
      await say("Don Quixote", "Town at last!");
      if (state.gameTime > 30)
        await say("Don Quixote", "We've been traveling for a while...");
      await mapLoop();
      return;
    }
    if (loc === "Shop") {
      setBackground("shop");
      setCharacter("idle", false);
      await say("Don Quixote", "Time to shop!");
      await mapLoop();
      return;
    }
    if (loc === "Forest") {
      setBackground("forest");
      setCharacter("idle");
      if (!state.forestIntroSeen) {
        state.forestIntroSeen = true;
        await say("", "The forest feels different… quieter, yet alive.");
        await say("", "You sense that something important awaits you here.");
      }
      await forestEncounter();
    }
  }

  async function mapLoop() {
    state.scene = "map";
    saveCheckpoint();
    const loc = await waitForLocation();
    await runLocation(loc);
  }

  async function story2() {
    state.scene = "story2";
    saveCheckpoint();
    setCharacter("superHappy");
    await say("Don Quixote", "Ok um. Let go to the forest,you know");
    await say("Don Quixote", "I want to walk");
    setCharacter("idle");
    await mapLoop();
  }

  async function backpackTutorial() {
    state.scene = "backpack";
    setBackground("black");
    setCharacter("idle");
    await say("Don Quixote", "Here, take this potion as my gift.");
    addItem("Potion");
    showNotice("+1 Potion");
    await say("Don Quixote", "Ok, see that backpack icon?");
    await say("Don Quixote", "Just click that to open your inventory.");
    await waitForInventoryTutorial();
    setCharacter("superHappy");
    await say("Don Quixote", "Nice! You opened it.");
    await say("Don Quixote", "This is where your items go.");
    await say("Don Quixote", "Ok next!!");

    state.scene = "mapTutorial";
    setBackground("don_room");
    setCharacter("idle");
    state.mapUnlocked.Town = true;
    showNotice("Map unlocked: Town.");
    await say("Don Quixote", "You can now visit the Town!");
    await mapLoop();
  }

  async function story1() {
    state.scene = "story1";
    setBackground("black");
    setCharacter("happy");
    await delay(450);
    await say("Don Quixote", "Hope it tastes good.");
    await say("Don Quixote", "Ummm mom mom— Okay.");
    await say("Don Quixote", "So tell me your name.");
    await showNameInput();
    await say("Don Quixote", `Hello, ${state.playerName}!`);
    await say("Don Quixote", "Feel free as home.");
    await backpackTutorial();
  }

  async function startStory() {
    state.scene = "start";
    setBackground("don_room");
    setCharacter("idle");
    await say("Don Quixote", "Hi, this is Don Quixote.");
    await say("Don Quixote", "pls feed me");
    await say("Don Quixote", "i'm so hungry!");
    // Ren'Py menu caption: "what?"
    els.dialogueBox.hidden = false;
    els.speaker.textContent = "";
    els.speaker.hidden = true;
    if (els.speakerRole) els.speakerRole.hidden = true;
    els.dialogue.textContent = "what?";
    const first = await choose([
      { label: "u suck", value: "suck" },
      { label: "alright", value: "alright" },
    ]);

    if (first === "suck") {
      setCharacter("cry");
      await say("Don Quixote", "pls i need this!");
      await say("Don Quixote", "my mom is kinda homeless");
      // Ren'Py menu caption: "this dih"; the source currently has one selectable choice.
      els.dialogueBox.hidden = false;
      els.speaker.textContent = "";
      els.speaker.hidden = true;
      if (els.speakerRole) els.speakerRole.hidden = true;
      els.dialogue.textContent = "this dih";
      await choose([{ label: "fine", value: "fine" }]);
      await say("", "give her some bread");
      setCharacter("superHappy");
      await say("Don Quixote", "yay tysm!!");
      await story1();
      return;
    }

    setCharacter("superHappy");
    await say("Don Quixote", "yay free food!!");
    await story1();
  }

  function snapshot() {
    return { ...state, savedAt: new Date().toISOString() };
  }

  function saveCheckpoint(showMessage = false) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot()));
    updateContinueButton();
    if (showMessage) showNotice("Game saved.");
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function updateContinueButton() {
    const saved = loadSave();
    els.continueBtn.hidden = !saved;
    if (saved?.savedAt)
      els.continueBtn.title = `Saved ${new Date(saved.savedAt).toLocaleString()}`;
  }

  async function resumeSavedGame(saved) {
    if (!saved) return;
    state = { ...makeInitialState(), ...saved };
    state.inventory = saved.inventory || {};
    state.mapUnlocked = {
      ...makeInitialState().mapUnlocked,
      ...(saved.mapUnlocked || {}),
    };
    state.questClear = {
      ...makeInitialState().questClear,
      ...(saved.questClear || {}),
    };
    applyVolume();
    launchGameShell();
    updateBackpackCount();
    updateHUD();
    els.backpackBtn.hidden = false;
    showNotice("Save loaded.");

    // Resume from stable checkpoints only; story text is intentionally replayed from the nearest section.
    if (["forestBattle", "forestEncounter", "forestAfterBattle", "wolfIntro", "wolfBattlePrep", "wolfBattle", "wolfAfterBattle", "heathcliffIntro", "heathcliffBattle", "heathcliffAfterBattle"].includes(state.scene)) {
      state.currentLocation = "Forest";
      setBackground("forest");
      setCharacter("idle");
      await forestEncounter();
    } else if (state.scene === "map" || state.scene === "story2") {
      setBackground(
        state.currentLocation === "Town"
          ? "town"
          : state.currentLocation === "Forest"
            ? "forest"
            : "bus",
      );
      setCharacter("idle");
      await mapLoop();
    } else if (state.scene === "backpack" || state.scene === "mapTutorial") {
      await backpackTutorial();
    } else if (state.scene === "story1") {
      await story1();
    } else {
      await startStory();
    }
  }

  function launchGameShell() {
    musicMode = "story";
    els.titleScreen.hidden = true;
    els.hud.hidden = false;
    els.quickMenu.hidden = false;
    setStoryChromeVisible(true);
    els.backpackBtn.hidden = false;
    els.bgm.volume = state.volume / 100;
    els.volumeSlider.value = String(state.volume);
    els.bgm.play().catch(() => {});
  }

  function applyVolume() {
    state.volume = Math.max(0, Math.min(100, Number(state.volume ?? 35)));
    const volume = state.volume / 100;
    els.volumeSlider.value = String(state.volume);
    if (musicMode === "battle") {
      battleBgm.volume = 0;
      audioEngine.setBgmVolume(volume);
      els.bgm.volume = 0;
    } else {
      els.bgm.volume = volume;
      battleBgm.volume = 0;
    }
  }

  function resetUIForNewGame() {
    resetBattleAudio();
    if (realtimeMode) {
      realtimeMode.dispose();
      realtimeMode = null;
    }
    realtimeBattleActive = false;
    els.battleScreen?.classList.remove("rt-active");
    const rtArena = document.getElementById("realtimeArena");
    if (rtArena) rtArena.hidden = true;
    advanceHandler = null;
    clearTimeout(backpackReminderTimer);
    closeChoices();
    [els.nameModal, els.inventoryModal, els.mapModal, els.systemModal, els.battleScreen].forEach(
      (el) => (el.hidden = true),
    );
    els.battleResult.hidden = true;
    battle = null;
    battleInputResolver = null;
    battleResultResolver = null;
    els.dialogueBox.hidden = true;
    els.character.hidden = true;
    setStoryChromeVisible(false);
    els.notice.hidden = true;
  }

  function escapeHTML(str) {
    return String(str).replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[c],
    );
  }

  const battleTempo = () => 1.28;
  const pace = (ms) => Math.round(ms * battleTempo());
  const delay = (ms) => new Promise((r) => setTimeout(r, pace(ms)));

  function ensureSfxContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!sfxContext) sfxContext = new AC();
    if (sfxContext.state === "suspended") sfxContext.resume().catch(() => {});
    return sfxContext;
  }

  function playTone({ freq = 440, duration = 0.08, type = "sine", gain = 0.045, attack = 0.003, release = 0.07, pan = 0, when = 0, endFreq = null } = {}) {
    const ctx = ensureSfxContext();
    if (!ctx) return;
    const volumeScale = Math.max(0, Math.min(1, Number(state?.volume ?? 20) / 100));
    const start = ctx.currentTime + when;
    const end = start + duration;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), end);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volumeScale), start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    if (panner) {
      panner.pan.setValueAtTime(pan, start);
      osc.connect(amp);
      amp.connect(panner);
      panner.connect(ctx.destination);
    } else {
      osc.connect(amp);
      amp.connect(ctx.destination);
    }
    osc.start(start);
    osc.stop(end + 0.02);
  }

  function playNoise({ duration = 0.06, gain = 0.025, filterFreq = 1200, pan = 0, when = 0 } = {}) {
    const ctx = ensureSfxContext();
    if (!ctx) return;
    const volumeScale = Math.max(0, Math.min(1, Number(state?.volume ?? 20) / 100));
    const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    const amp = ctx.createGain();
    const start = ctx.currentTime + when;
    const end = start + duration;
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volumeScale), start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    if (panner) {
      panner.pan.setValueAtTime(pan, start);
      source.connect(filter);
      filter.connect(amp);
      amp.connect(panner);
      panner.connect(ctx.destination);
    } else {
      source.connect(filter);
      filter.connect(amp);
      amp.connect(ctx.destination);
    }
    source.start(start);
    source.stop(end + 0.02);
  }

  function playClashSfx(kind = "start") {
    ensureSfxContext();
    const metal = (base = 540, pan = 0) => {
      playTone({ freq: base, endFreq: base * 1.52, duration: 0.065, gain: 0.018, type: "triangle", pan });
      playTone({ freq: base * 1.85, endFreq: base * 1.34, duration: 0.05, gain: 0.014, type: "sine", pan: -pan, when: 0.006 });
      playNoise({ duration: 0.045, gain: 0.018, filterFreq: 2400, pan });
    };
    switch (kind) {
      case "start":
        playNoise({ duration: 0.09, gain: 0.016, filterFreq: 1900, pan: -0.08 });
        playTone({ freq: 170, endFreq: 360, duration: 0.09, gain: 0.02, type: "sawtooth", pan: -0.18 });
        playTone({ freq: 260, endFreq: 640, duration: 0.09, gain: 0.018, type: "triangle", pan: 0.18, when: 0.012 });
        metal(840, 0);
        break;
      case "coin-heads":
        playTone({ freq: 1180, endFreq: 1700, duration: 0.05, gain: 0.022, type: "triangle" });
        playTone({ freq: 2100, endFreq: 1540, duration: 0.036, gain: 0.009, type: "sine", when: 0.008 });
        break;
      case "coin-tails":
        playTone({ freq: 460, endFreq: 240, duration: 0.06, gain: 0.018, type: "square" });
        playNoise({ duration: 0.028, gain: 0.01, filterFreq: 820, when: 0.006 });
        break;
      case "win":
        metal(960, -0.16);
        metal(1260, 0.16);
        playTone({ freq: 620, endFreq: 990, duration: 0.16, gain: 0.026, type: "sawtooth", when: 0.018 });
        break;
      case "lose":
        metal(620, 0.2);
        playTone({ freq: 380, endFreq: 150, duration: 0.17, gain: 0.025, type: "sawtooth", pan: 0.18 });
        playNoise({ duration: 0.07, gain: 0.018, filterFreq: 700 });
        break;
      case "tie":
        metal(760, 0);
        playTone({ freq: 520, endFreq: 560, duration: 0.08, gain: 0.015, type: "triangle", when: 0.01 });
        break;
      case "hit":
        metal(700, 0);
        playNoise({ duration: 0.05, gain: 0.025, filterFreq: 1200 });
        playTone({ freq: 170, endFreq: 84, duration: 0.08, gain: 0.018, type: "square" });
        break;
      default:
        break;
    }
  }

  function playCoinFlipSequence(donFlips = [], enemyFlips = []) {
    const flips = [...donFlips, ...enemyFlips];
    flips.forEach((isHeads, index) => {
      const delayTime = 0.04 + index * 0.055;
      setTimeout(() => playClashSfx(isHeads ? "coin-heads" : "coin-tails"), delayTime * 1000);
    });
  }

  function pulseClashNode(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function spawnClashImpact(verdict = "tie") {
    if (!els.clashOverlay) return;
    const fx = document.createElement("span");
    fx.className = `lc20-clash-impact ${verdict}`;
    els.clashOverlay.appendChild(fx);
    setTimeout(() => fx.remove(), 420);
  }

  function getAutoTargetSlot() {
    if (!battle?.donSlots?.length) return null;
    if (battle.focusSlot != null && battle.donSlots[battle.focusSlot]) return battle.donSlots[battle.focusSlot];
    return battle.donSlots.find((slot) => !slot.targetIntentId) || battle.donSlots[0] || null;
  }

  function autoTargetEnemy(enemyId, preferredIntentId = null) {
    if (!battle || battle.phase !== "planning") return null;
    const intent = preferredIntentId ? enemySlotById(preferredIntentId) : firstEnemyIntent(enemyId);
    const slot = getAutoTargetSlot();
    if (slot && intent) {
      slot.targetIntentId = intent.id;
      slot.defense = false;
      battle.focusSlot = slot.index;
      battle.autoMode = null;
    }
    if (intent) setSelectedEnemy(enemyId, intent.id);
    else setSelectedEnemy(enemyId);
    return { slot, intent };
  }

  function setDragHoverIntent(intentId = null) {
    dragHoverIntentId = intentId;
    const buttons = els.enemyIntentSlots?.querySelectorAll?.('.lc4-intent') || [];
    buttons.forEach((btn) => btn.classList.toggle('is-drop-target', btn.dataset.intentId === intentId));
  }

  function scheduleTargetLines(pointer = null) {
    targetLinePointer = pointer;
    if (targetLineRaf) return;
    targetLineRaf = requestAnimationFrame(() => {
      targetLineRaf = 0;
      drawTargetLines(targetLinePointer);
    });
  }

  function snapIntentButton(intentId) {
    const btn = els.enemyIntentSlots?.querySelector?.(`[data-intent-id="${intentId}"]`);
    if (!btn) return;
    btn.classList.remove('is-snap');
    void btn.offsetWidth;
    btn.classList.add('is-snap');
    setTimeout(() => btn.classList.remove('is-snap'), 260);
  }

  function anyModalOpen() {
    return [
      els.nameModal,
      els.inventoryModal,
      els.mapModal,
      els.systemModal,
    ].some((el) => !el.hidden);
  }

  document.addEventListener("pointerdown", () => { ensureSfxContext(); }, { once: true });

  const characterSelect = new CharacterSelect({
    root: els.versusSelectScreen,
    roster: Object.values(VERSUS_ROSTER),
    fadeMs: 1500,
    onCancel: () => {
      els.titleScreen.hidden = false;
      els.mainMenuView.hidden = false;
      els.storyModeView.hidden = true;
      syncGlobalSettingsButton();
    },
    onStart: async (selection) => {
      // CharacterSelect emits its clean app-domain shape. Adapt it to the battle engine's
      // existing player1/player2 loadout contract at this boundary only.
      const toCombatantId = (id) => id === 'don_quixote' ? 'don' : id;
      const config = {
        localMultiplayer: true,
        timeLimit: Number.isFinite(selection.timeLimit) ? selection.timeLimit : 0,
        player1: { characterId: toCombatantId(selection.p1.character), egoId: selection.p1.ego },
        player2: { characterId: toCombatantId(selection.p2.character), egoId: selection.p2.ego },
      };
      await startStandaloneRealtime('versus', config);
    },
  });

  function openVersusSelection() {
    els.titleScreen.hidden = true;
    characterSelect.open();
    syncGlobalSettingsButton();
  }

  let newGameStarting = false;
  async function startNewGameFlow() {
    if (newGameStarting) return;
    newGameStarting = true;
    try {
      state = makeInitialState();
      resetUIForNewGame();
      launchGameShell();
      applyVolume();
      await startStory();
    } catch (error) {
      console.error('[NEW GAME] startup failed:', error);
      resetUIForNewGame();
      els.titleScreen.hidden = false;
      els.mainMenuView.hidden = true;
      els.storyModeView.hidden = false;
      els.hud.hidden = true;
      els.quickMenu.hidden = true;
      showNotice('NEW GAME startup error. Open DevTools for details.', 4000);
    } finally {
      newGameStarting = false;
    }
  }
  els.storyModeBtn?.addEventListener("click", () => {
    playDonLobbyVoice();
    els.mainMenuView.hidden = true;
    els.storyModeView.hidden = false;
    updateContinueButton();
    els.newGameBtn?.focus?.();
  });
  els.storyBackBtn?.addEventListener("click", () => {
    els.storyModeView.hidden = true;
    els.mainMenuView.hidden = false;
    playDonSmalltalk();
  });
  els.versusModeBtn?.addEventListener("click", openVersusSelection);
  els.trainingModeBtn?.addEventListener("click", () => startStandaloneRealtime("training"));
  els.newGameBtn?.addEventListener("click", startNewGameFlow);
  window.__RQ_NEW_GAME_SMOKE__ = startNewGameFlow;
  window.__RQ_BUILD__ = BUILD_TAG;
  window.__RQ_LOADING_SMOKE__ = showBattleLoading;

  els.continueBtn.addEventListener("click", async () => {
    const saved = loadSave();
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });

  els.dialogueBox.addEventListener("click", () => {
    if (advanceHandler) advanceHandler();
  });
  document.addEventListener("keydown", (event) => {
    if (realtimeBattleActive) return;
    if (!els.battleScreen.hidden) {
      if (/^[1-6]$/.test(event.key) && battle?.phase === "planning") {
        const slot = battle.donSlots[Number(event.key) - 1];
        if (slot) {
          battle.focusSlot = slot.index;
          slot.defense = false;
          slot.selected = slot.selected === 0 ? 1 : 0;
          renderPlanning();
        }
      }
      if (event.key === "Enter" && battle?.phase === "planning") triggerBattleStart();
      if ((event.key.toLowerCase() === "p" || event.key.toLowerCase() === "w") && battle?.phase === "planning") {
        event.preventDefault();
        autoSelect("win");
      }
      if (event.key.toLowerCase() === "d" && battle?.phase === "planning") {
        event.preventDefault();
        autoSelect("damage");
      }
      return;
    }
    if (anyModalOpen()) return;
    if ((event.key === "Enter" || event.key === " ") && advanceHandler) {
      event.preventDefault();
      advanceHandler();
    }
    if (!els.choices.hidden && /^[1-9]$/.test(event.key)) {
      const btn = els.choices.children[Number(event.key) - 1];
      if (btn) btn.click();
    }
    if (event.key.toLowerCase() === "i" && !els.backpackBtn.hidden)
      openInventory();
    if (event.key.toLowerCase() === "m" && !els.quickMenu.hidden) openMap();
  });

  els.backpackBtn.addEventListener("click", openInventory);
  els.inventoryClose.addEventListener("click", () => {
    els.inventoryModal.hidden = true;
    els.inventoryModal.dispatchEvent(new Event("inventoryClosed"));
  });
  els.mapBtn.addEventListener("click", openMap);
  els.quickSaveBtn?.addEventListener("click", () => {
    if (!els.battleScreen.hidden) {
      showNotice("Please save from story scenes, not during battle.");
      return;
    }
    saveCheckpoint(true);
  });
  els.quickLoadBtn?.addEventListener("click", async () => {
    const saved = loadSave();
    if (!saved) {
      showNotice("No save found.");
      return;
    }
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });
  els.mapClose.addEventListener("click", () => {
    els.mapModal.hidden = true;
  });
  const globalSettingsButton = document.getElementById("globalSettingsButton");
  let pendingKeyBinding = null;
  const gamepadActionOptions = [
    { key: "jump", label: "Jump" }, { key: "guard", label: "Guard" },
    { key: "light", label: "Skill 1" }, { key: "heavy", label: "Skill 2" },
    { key: "special", label: "Skill 3 / E.G.O" }, { key: "dash", label: "Dash" },
  ];
  const gamepadButtonNames = ["South / A / Cross", "East / B / Circle", "West / X / Square", "North / Y / Triangle", "LB / L1", "RB / R1", "LT / L2", "RT / R2", "Select / Share", "Start / Options", "L3", "R3", "D-pad Up", "D-pad Down", "D-pad Left", "D-pad Right"];

  function saveKeyBindings() {
    try { localStorage.setItem(KEY_BINDINGS_STORAGE_KEY, JSON.stringify(keyBindings)); } catch { /* Private mode may block storage. */ }
    realtimeMode?.setControlsConfig?.(keyBindings);
  }
  function saveControllerSettings() {
    try { localStorage.setItem(CONTROLLER_STORAGE_KEY, JSON.stringify(controllerSettings)); } catch { /* Private mode may block storage. */ }
    realtimeMode?.setControllerConfig?.(controllerSettings);
    refreshControllerStatus();
  }
  function renderKeyboardBindings() {
    if (!els.keyboardBindings) return;
    els.keyboardBindings.replaceChildren();
    for (const playerKey of ["p1", "p2"]) {
      const group = document.createElement("section");
      group.className = "keyboard-bindings-group";
      const heading = document.createElement("h4");
      heading.textContent = playerKey === "p1" ? "PLAYER 1 · KEYBOARD" : "PLAYER 2 · KEYBOARD";
      group.append(heading);
      for (const action of CONTROL_ACTIONS) {
        const row = document.createElement("div");
        row.className = "keybind-row";
        const label = document.createElement("span");
        label.textContent = action.label;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "keybind-button";
        button.dataset.player = playerKey;
        button.dataset.action = action.key;
        button.textContent = displayKey(keyBindings[playerKey][action.key]);
        button.addEventListener("click", () => beginKeyBindingCapture(playerKey, action.key, button));
        row.append(label, button);
        group.append(row);
      }
      els.keyboardBindings.append(group);
    }
  }
  function beginKeyBindingCapture(playerKey, action, button) {
    if (pendingKeyBinding) {
      window.removeEventListener("keydown", pendingKeyBinding.handler, true);
      pendingKeyBinding.button?.classList.remove("is-listening");
    }
    const handler = (event) => {
      const key = normalizeKey(event);
      if (key === "escape") {
        event.preventDefault(); event.stopImmediatePropagation();
        window.removeEventListener("keydown", handler, true);
        button.classList.remove("is-listening");
        pendingKeyBinding = null;
        if (els.keyboardBindingStatus) els.keyboardBindingStatus.textContent = "Binding cancelled.";
        return;
      }
      if (!key || ["control", "alt", "shift", "meta", "tab", "backspace", "delete", "enter"].includes(key)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const duplicate = ["p1", "p2"].some((p) => CONTROL_ACTIONS.some((candidate) => {
        return !(p === playerKey && candidate.key === action) && keyBindings[p][candidate.key] === key;
      }));
      if (duplicate) {
        if (els.keyboardBindingStatus) els.keyboardBindingStatus.textContent = `${displayKey(key)} is already assigned. Choose a different key.`;
        return;
      }
      keyBindings[playerKey][action] = key;
      saveKeyBindings();
      window.removeEventListener("keydown", handler, true);
      pendingKeyBinding = null;
      renderKeyboardBindings();
      if (els.keyboardBindingStatus) els.keyboardBindingStatus.textContent = `${playerKey.toUpperCase()} ${action}: ${displayKey(key)} saved.`;
    };
    pendingKeyBinding = { handler, button };
    button.classList.add("is-listening");
    button.textContent = "PRESS KEY…";
    if (els.keyboardBindingStatus) els.keyboardBindingStatus.textContent = "Listening for one key. Press Escape to cancel.";
    window.addEventListener("keydown", handler, true);
  }
  function getConnectedGamepads() {
    try { return Array.from(navigator.getGamepads?.() || []).filter((pad) => pad && pad.connected); }
    catch { return []; }
  }
  function renderControllerSettings() {
    if (els.controllerPlayerSelect) els.controllerPlayerSelect.value = controllerSettings.player === "p2" ? "p2" : "p1";
    if (els.controllerDeviceSelect) {
      const current = String(controllerSettings.index ?? -1);
      const pads = getConnectedGamepads();
      els.controllerDeviceSelect.replaceChildren();
      const any = document.createElement("option"); any.value = "-1"; any.textContent = "Any connected controller"; els.controllerDeviceSelect.append(any);
      for (const pad of pads) {
        const option = document.createElement("option"); option.value = String(pad.index); option.textContent = `Controller ${pad.index + 1} · ${pad.id || "Gamepad"}`; els.controllerDeviceSelect.append(option);
      }
      els.controllerDeviceSelect.value = [...els.controllerDeviceSelect.options].some((option) => option.value === current) ? current : "-1";
    }
    if (els.controllerButtonMappings) {
      els.controllerButtonMappings.replaceChildren();
      for (const action of gamepadActionOptions) {
        const row = document.createElement("label"); row.className = "controller-map-row";
        const caption = document.createElement("span"); caption.textContent = action.label;
        const select = document.createElement("select"); select.dataset.controllerAction = action.key; select.setAttribute("aria-label", `Controller button for ${action.label}`);
        gamepadButtonNames.forEach((name, index) => {
          const option = document.createElement("option"); option.value = String(index); option.textContent = `B${index} · ${name}`; select.append(option);
        });
        select.value = String(controllerSettings.buttons[action.key] ?? DEFAULT_CONTROLLER_SETTINGS.buttons[action.key]);
        select.addEventListener("change", () => {
          controllerSettings.buttons[action.key] = Number(select.value);
          saveControllerSettings();
        });
        row.append(caption, select); els.controllerButtonMappings.append(row);
      }
    }
    refreshControllerStatus();
  }
  function refreshControllerStatus() {
    if (!els.controllerStatus) return;
    const pads = getConnectedGamepads();
    if (!pads.length) {
      els.controllerStatus.textContent = "No controller detected. Connect a standard Gamepad, then open Settings again; keyboard still works.";
      return;
    }
    const selected = controllerSettings.index >= 0 ? pads.find((pad) => pad.index === controllerSettings.index) : pads[0];
    els.controllerStatus.textContent = `${selected ? `Connected: ${selected.id || `Controller ${selected.index + 1}`}` : "Selected controller not connected"} · assigned to ${controllerSettings.player === "p2" ? "Player 2" : "Player 1"}. Left stick / D-pad moves; button assignments are configurable above.`;
  }
  function syncGlobalSettingsButton() {
    if (!globalSettingsButton) return;
    globalSettingsButton.hidden = !!(els.battleLoading && !els.battleLoading.hidden);
  }
  if (globalSettingsButton) globalSettingsButton.addEventListener("click", () => {
    if (els.battleLoading && !els.battleLoading.hidden) return;
    openSystemMenu({ settingsOnly: true });
  });
  if (typeof MutationObserver !== "undefined" && els.battleLoading) {
    new MutationObserver(syncGlobalSettingsButton).observe(els.battleLoading, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (typeof MutationObserver !== "undefined" && els.systemModal) {
    new MutationObserver(syncGlobalSettingsButton).observe(els.systemModal, { attributes: true, attributeFilter: ["hidden"] });
  }
  els.controllerPlayerSelect?.addEventListener("change", () => { controllerSettings.player = els.controllerPlayerSelect.value; saveControllerSettings(); });
  els.controllerDeviceSelect?.addEventListener("change", () => { controllerSettings.index = Number(els.controllerDeviceSelect.value); saveControllerSettings(); });
  window.addEventListener("gamepadconnected", () => renderControllerSettings());
  window.addEventListener("gamepaddisconnected", () => renderControllerSettings());

  function openSystemMenu({ settingsOnly = false } = {}) {
    const saved = loadSave();
    const atTitleMenu = !els.titleScreen.hidden;
    const atVersusSelection = !!els.versusSelectScreen && !els.versusSelectScreen.hidden;
    const settingsView = settingsOnly || atTitleMenu || realtimeBattleActive || atVersusSelection;
    if (els.systemTitle) els.systemTitle.textContent = settingsView ? "SETTINGS" : "GAME MENU";
    if (els.systemActions) els.systemActions.hidden = settingsOnly || atTitleMenu || atVersusSelection || realtimeBattleActive;
    if (els.showHitboxSettingRow) els.showHitboxSettingRow.hidden = !realtimeBattleActive;
    if (els.showHitboxSetting) els.showHitboxSetting.checked = showHitboxesSetting;
    if (els.saveInfo) {
      els.saveInfo.hidden = settingsOnly || atTitleMenu || atVersusSelection || realtimeBattleActive;
      els.saveInfo.textContent = saved?.savedAt
        ? `Last save: ${new Date(saved.savedAt).toLocaleString()}`
        : "No save yet.";
    }
    els.systemModal.style.zIndex = realtimeBattleActive ? "110" : "";
    els.systemModal.hidden = false;
    renderKeyboardBindings();
    renderControllerSettings();
    syncGlobalSettingsButton();
    if (realtimeBattleActive) realtimeMode?.pause();
  }
  els.systemBtn.addEventListener("click", () => openSystemMenu());
  els.storyMenuHex?.addEventListener("click", () => openSystemMenu());
  els.settingsModeBtn?.addEventListener("click", () => openSystemMenu({ settingsOnly: true }));
  els.rtSettingsButton?.addEventListener("click", () => openSystemMenu({ settingsOnly: true }));
  els.systemClose.addEventListener("click", () => {
    els.systemModal.hidden = true;
    els.systemModal.style.zIndex = "";
    if (realtimeBattleActive) realtimeMode?.resume();
  });
  els.showHitboxSetting?.addEventListener("change", () => {
    showHitboxesSetting = !!els.showHitboxSetting.checked;
    try { localStorage.setItem(HITBOX_SETTING_KEY, String(showHitboxesSetting)); } catch { /* Storage may be disabled. */ }
    realtimeMode?.setDebugBoxes(showHitboxesSetting);
  });
  els.volumeSlider.addEventListener("input", () => {
    state.volume = Number(els.volumeSlider.value);
    applyVolume();
  });
  els.saveBtn.addEventListener("click", () => saveCheckpoint(true));
  els.loadBtn.addEventListener("click", async () => {
    const saved = loadSave();
    if (!saved) {
      showNotice("No save found.");
      return;
    }
    els.systemModal.hidden = true;
    els.systemModal.style.zIndex = "";
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });
  els.restartBtn.addEventListener("click", () => {
    if (confirm("Restart the game from the beginning?")) location.reload();
  });

  els.startCombatBtn.addEventListener("click", triggerBattleStart);
  els.battleDon?.addEventListener("click", () => {
    if (!battle || battle.phase !== "planning") return;
    const slot = battle.donSlots?.[battle.focusSlot] || battle.donSlots?.[0];
    if (!slot) return;
    battle.guideMessage = "Don selected. Check her current skill on the left-side inspector.";
    showSkillInspector(getSelectedSkill(slot), slot);
    tutorialForTurn();
  });
  els.autoWinBtn.addEventListener("click", () => autoSelect("win"));
  els.autoDamageBtn.addEventListener("click", () => autoSelect("damage"));
  els.egoActivateBtn?.addEventListener('pointerdown', (event) => { if (egoCanAppear() && !battle?.egoActivated) event.stopPropagation(); });
  els.egoActivateBtn?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openEgoManifest(); });
  els.egoManifestClose?.addEventListener('click', closeEgoManifest);
  els.egoManifestConfirm?.addEventListener('click', activateEgo);
  window.addEventListener("resize", () => {
    if (battle?.phase === "planning" && !els.battleScreen.hidden) {
      scheduleTargetLines();
      requestAnimationFrame(positionEnemyIntents);
      requestAnimationFrame(positionPlayerIntentAnchor);
    }
  });

  els.battleContinue.addEventListener("click", () => {
    if (!battleResultResolver) return;
    const resolver = battleResultResolver;
    battleResultResolver = null;
    resolver(battle && !battleWon() ? "retry" : "continue");
  });

  // Title presentation.
  setBackground("don_room");
  els.volumeSlider.value = String(state.volume ?? 20);
  els.mainMenuView.hidden = false;
  els.storyModeView.hidden = true;
  if (els.showHitboxSetting) els.showHitboxSetting.checked = showHitboxesSetting;
  updateContinueButton();
  updateHUD();
  updateBackpackCount();
