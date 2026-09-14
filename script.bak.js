(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    game: $("game"),
    background: $("background"),
    titleScreen: $("titleScreen"),
    newGameBtn: $("newGameBtn"),
    continueBtn: $("continueBtn"),
    hud: $("hud"),
    hudLocation: $("hudLocation"),
    hudTime: $("hudTime"),
    character: $("character"),
    dialogueBox: $("dialogueBox"),
    speaker: $("speaker"),
    dialogue: $("dialogue"),
    choices: $("choices"),
    backpackBtn: $("backpackBtn"),
    backpackCount: $("backpackCount"),
    nameModal: $("nameModal"),
    nameInput: $("nameInput"),
    nameConfirm: $("nameConfirm"),
    inventoryModal: $("inventoryModal"),
    inventoryClose: $("inventoryClose"),
    inventoryList: $("inventoryList"),
    mapModal: $("mapModal"),
    mapClose: $("mapClose"),
    mapGrid: $("mapGrid"),
    mapTime: $("mapTime"),
    mapLocation: $("mapLocation"),
    systemModal: $("systemModal"),
    systemBtn: $("systemBtn"),
    systemClose: $("systemClose"),
    volumeSlider: $("volumeSlider"),
    saveBtn: $("saveBtn"),
    loadBtn: $("loadBtn"),
    restartBtn: $("restartBtn"),
    saveInfo: $("saveInfo"),
    notice: $("notice"),
    quickMenu: $("quickMenu"),
    mapBtn: $("mapBtn"),
    bgm: $("bgm"),
    battleScreen: $("battleScreen"),
    battleWave: $("battleWave"),
    battleTurn: $("battleTurn"),
    phaseLabel: $("phaseLabel"),
    targetLines: $("targetLines"),
    turnOrder: $("turnOrder"),
    battleDon: $("battleDon"),
    battleEnemy: $("battleEnemy"),
    donUnit: $("donUnit"),
    enemyUnit: $("enemyUnit"),
    donHpBar: $("donHpBar"),
    donHpText: $("donHpText"),
    donSpBar: $("donSpBar"),
    donSpText: $("donSpText"),
    donSpeed: $("donSpeed"),
    donStatus: $("donStatus"),
    enemyHpBar: $("enemyHpBar"),
    enemyHpText: $("enemyHpText"),
    enemyStaggerBar: $("enemyStaggerBar"),
    enemyStaggerText: $("enemyStaggerText"),
    enemySpeed: $("enemySpeed"),
    enemyStatus: $("enemyStatus"),
    battleInspector: $("battleInspector"),
    inspectorName: $("inspectorName"),
    inspectorPower: $("inspectorPower"),
    inspectorText: $("inspectorText"),
    inspectorKeywords: $("inspectorKeywords"),
    battleTutorial: $("battleTutorial"),
    tutorialTitle: $("tutorialTitle"),
    tutorialText: $("tutorialText"),
    enemyIntentSlots: $("enemyIntentSlots"),
    actionRail: $("actionRail"),
    planningPanel: $("planningPanel"),
    startCombatBtn: $("startCombatBtn"),
    autoWinBtn: $("autoWinBtn"),
    autoDamageBtn: $("autoDamageBtn"),
    managerSp: $("managerSp"),
    sinLust: $("sinLust"),
    sinEnvy: $("sinEnvy"),
    sinGluttony: $("sinGluttony"),
    clashOverlay: $("clashOverlay"),
    clashDonSkill: $("clashDonSkill"),
    clashEnemySkill: $("clashEnemySkill"),
    clashDonPower: $("clashDonPower"),
    clashEnemyPower: $("clashEnemyPower"),
    clashCoinsDon: $("clashCoinsDon"),
    clashCoinsEnemy: $("clashCoinsEnemy"),
    clashResult: $("clashResult"),
    combatLog: $("combatLog"),
    donDamage: $("donDamage"),
    enemyDamage: $("enemyDamage"),
    battleResult: $("battleResult"),
    battleResultSmall: $("battleResultSmall"),
    battleResultTitle: $("battleResultTitle"),
    battleContinue: $("battleContinue"),
  };

  const SAVE_KEY = "raise-don-quixote-html-save-v1";

  const assets = {
    backgrounds: {
      black: null,
      don_room: "assets/backgrounds/don-room.png",
      bus: "assets/backgrounds/bus.png",
      town: "assets/backgrounds/town.png",
      forest: "assets/backgrounds/forest.jpeg",
      shop: "assets/backgrounds/shop.png",
    },
    characters: {
      idle: "assets/characters/idle.png",
      happy: "assets/characters/happy.png",
      superHappy: "assets/characters/super-happy.png",
      cry: "assets/characters/cry.png",
      lilMad: "assets/characters/lil-mad.png",
      angry: "assets/characters/angry.png",
      lilAngry: "assets/characters/lil-angry.png",
      sad: "assets/characters/sad.png",
      sup: "assets/characters/sup.png",
      superMad: "assets/characters/super-mad.png",
    },
  };

  const itemDB = {
    Potion: { desc: "Heals 45 SP.", icon: "assets/items/potion.webp" },
    Lunacy: { desc: "A gamble flower.", icon: "assets/items/lunacy.webp" },
    Coin: { desc: "A shiny gold coin.", icon: "assets/items/coin.png" },
  };

  const travelTime = { Bus: 0, Town: 10, Shop: 5, Forest: 15 };
  const mapImages = {
    Bus: assets.backgrounds.bus,
    Town: assets.backgrounds.town,
    Shop: assets.backgrounds.shop,
    Forest: assets.backgrounds.forest,
  };

  // Battle mechanics are rebuilt from the uploaded gameplay reference:
  // command phase -> speed/action slots -> targeting lines -> clash resolution -> attack phase.
  // Art remains original to this project; no assets are ripped from the reference video.
  const donBattleSkills = {
    joust: {
      key: "joust", name: "Joust", affinity: "Lust", css: "lust", type: "Pierce",
      base: 4, coinPower: 7, coins: 1,
      effect: "[Clash Win] Gain 2 Haste next turn.",
      keywords: ["Haste", "Clash Win"], expression: "lilAngry", animation: "lc-anim-joust",
    },
    gallop: {
      key: "gallop", name: "Galloping Tilt", affinity: "Envy", css: "envy", type: "Pierce",
      base: 4, coinPower: 12, coins: 1,
      effect: "[Clash Win] Gain 2 Attack Power Up next turn. [Heads Hit] Inflict 2 Bleed.",
      keywords: ["Attack Power Up", "Bleed"], expression: "sup", animation: "lc-anim-gallop",
    },
    justice: {
      key: "justice", name: "For Justice!", affinity: "Gluttony", css: "gluttony", type: "Pierce",
      base: 3, coinPower: 3, coins: 3,
      effect: "3 Coins. At 10+ Speed, Coin Power +2. Hits build Bleed.",
      keywords: ["Bleed", "Multi-Coin"], expression: "angry", animation: "lc-anim-justice",
    },
    evade: {
      key: "evade", name: "Evade", affinity: "Lust", css: "defense", type: "Defense",
      base: 2, coinPower: 10, coins: 1, defense: true,
      effect: "Defense skill. Win the defensive roll to avoid the incoming attack.",
      keywords: ["Defense", "Evade"], expression: "happy", animation: "lc-anim-evade",
    },
  };

  const enemyBattleSkills = [
    { key: "swing", name: "Dirty Swing", base: 3, coinPower: 5, coins: 1, type: "Blunt" },
    { key: "rush", name: "Desperate Rush", base: 4, coinPower: 4, coins: 2, type: "Blunt" },
    { key: "feint", name: "Low Feint", base: 5, coinPower: 4, coins: 1, type: "Blunt" },
    { key: "club", name: "Crushing Club", base: 3, coinPower: 6, coins: 2, type: "Blunt" },
  ];

  const battleTutorialSteps = [
    { title: "CHAIN YOUR ACTIONS", text: "Each speed slot draws two skills. Click a skill card to swap its option. The green, gold, or red label estimates the Clash." },
    { title: "TARGETING & CLASHES", text: "Target lines connect your action slots to enemy actions. Click TARGET on a slot to cycle targets. Lower Clash Power loses one Coin each round." },
    { title: "COINS, SP & STATUS", text: "Heads chance is 50% + SP. Winning Clashes raises SP. Bleed, Haste, Attack Power Up, and Stagger can change later actions." },
    { title: "FREE COMBAT", text: "Use WIN RATE for safer automatic choices or DAMAGE for stronger attacks, then press START to resolve the chain." },
  ];

  let state = makeInitialState();
  let advanceHandler = null;
  let backpackReminderTimer = null;
  let noticeTimer = null;
  let interactionLocked = false;
  let battle = null;
  let battleInputResolver = null;
  let battleResultResolver = null;

  function makeInitialState() {
    return {
      version: 2,
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
      backpackOpened: false,
      tutorialActive: true,
      volume: 35,
    };
  }

  function setBackground(name) {
    const src = assets.backgrounds[name];
    els.background.style.backgroundImage = src ? `url("${src}")` : "none";
    els.background.style.backgroundColor = name === "black" ? "#000" : "#08090a";
  }

  function setCharacter(name, visible = true) {
    const src = assets.characters[name];
    if (!visible || !src) {
      els.character.hidden = true;
      return;
    }
    els.character.src = src;
    els.character.hidden = false;
  }

  function addItem(name, amount = 1) {
    state.inventory[name] = (state.inventory[name] || 0) + amount;
    updateBackpackCount();
  }

  function updateBackpackCount() {
    const count = Object.values(state.inventory).reduce((a, b) => a + b, 0);
    els.backpackCount.textContent = String(count);
  }

  function updateHUD() {
    els.hudLocation.textContent = state.currentLocation;
    els.hudTime.textContent = `${state.gameTime} min`;
    els.mapTime.textContent = `${state.gameTime} min`;
    els.mapLocation.textContent = state.currentLocation;
  }

  function showNotice(text, duration = 1800) {
    clearTimeout(noticeTimer);
    els.notice.textContent = text;
    els.notice.hidden = false;
    noticeTimer = setTimeout(() => { els.notice.hidden = true; }, duration);
  }

  function say(speaker, text) {
    closeChoices();
    els.speaker.textContent = speaker || "";
    els.speaker.hidden = !speaker;
    els.dialogue.textContent = text;
    els.dialogueBox.hidden = false;
    interactionLocked = false;
    return waitForAdvance();
  }

  function waitForAdvance() {
    return new Promise((resolve) => {
      advanceHandler = () => {
        if (interactionLocked) return;
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
  }

  function waitForInventoryTutorial() {
    return new Promise((resolve) => {
      state.backpackOpened = false;
      els.backpackBtn.hidden = false;
      backpackReminderTimer = setTimeout(async () => {
        if (!state.backpackOpened && state.scene === "backpack") {
          setCharacter("lilMad");
          await say("Don Quixote", "Pls just click that, I got stuff to do.");
        }
      }, 5000);
      const onClosed = () => {
        if (state.scene !== "backpack") return;
        els.inventoryModal.removeEventListener("inventoryClosed", onClosed);
        resolve();
      };
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

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function headsChance(sp) { return clamp(50 + sp, 5, 95); }

  function makeBattleState() {
    return {
      active: true,
      phase: "planning",
      wave: 1,
      turn: 1,
      tutorialStep: 0,
      focusSlot: 0,
      don: {
        hp: 203, maxHp: 203, sp: 0,
        haste: 0, nextHaste: 0, attackUp: 0, nextAttackUp: 0,
      },
      enemy: {
        hp: 520, maxHp: 520,
        bleedPotency: 0, bleedCount: 0,
        staggerThresholds: [364, 182], staggered: false, staggerTurns: 0,
      },
      donSlots: [],
      enemySlots: [],
      sins: { Lust: 0, Envy: 0, Gluttony: 0 },
      deckCursor: 0,
    };
  }

  const skillDeck = ["joust", "joust", "gallop", "joust", "justice", "gallop"];

  function drawSkillKey(offset = 0) {
    const key = skillDeck[(battle.deckCursor + offset) % skillDeck.length];
    return key;
  }

  function createTurnSlots() {
    const actionCount = Math.min(5, 2 + battle.turn);
    const enemyCount = Math.min(3, 1 + Math.ceil(battle.turn / 2));
    battle.donSlots = [];
    battle.enemySlots = [];

    for (let i = 0; i < actionCount; i += 1) {
      let a = drawSkillKey(i * 2);
      let b = drawSkillKey(i * 2 + 1);
      if (a === b) b = a === "joust" ? "gallop" : "joust";
      battle.donSlots.push({
        index: i,
        speed: randomInt(3, 6) + battle.don.haste,
        options: [a, b],
        selected: 0,
        defense: false,
        target: i % enemyCount,
      });
    }
    battle.deckCursor = (battle.deckCursor + actionCount * 2) % skillDeck.length;

    for (let i = 0; i < enemyCount; i += 1) {
      battle.enemySlots.push({
        index: i,
        speed: randomInt(2, 5),
        skill: enemyBattleSkills[(battle.turn + i - 1) % enemyBattleSkills.length],
        consumed: false,
      });
    }
  }

  function getSelectedSkill(slot) {
    return slot.defense ? donBattleSkills.evade : donBattleSkills[slot.options[slot.selected]];
  }

  function getSkillCoinPower(skill, unitSpeed) {
    return skill.key === "justice" && unitSpeed >= 10 ? skill.coinPower + 2 : skill.coinPower;
  }

  function maxSkillPower(skill, slotSpeed = 0, attackUp = 0) {
    const attackBonus = skill.defense ? 0 : attackUp;
    return skill.base + attackBonus + getSkillCoinPower(skill, slotSpeed) * skill.coins;
  }

  function expectedSkillPower(skill, slotSpeed = 0, sp = 0, attackUp = 0) {
    const h = headsChance(sp) / 100;
    return skill.base + (skill.defense ? 0 : attackUp) + skill.coins * getSkillCoinPower(skill, slotSpeed) * h;
  }

  function enemyMaxPower(enemySlot) {
    const skill = enemySlot.skill;
    return skill.base + skill.coinPower * skill.coins;
  }

  function clashForecast(slot) {
    const skill = getSelectedSkill(slot);
    const target = battle.enemySlots[slot.target] || battle.enemySlots[0];
    if (!target) return { label: "UNOPPOSED", cls: "favored", delta: 99 };
    const delta = maxSkillPower(skill, slot.speed, battle.don.attackUp) - enemyMaxPower(target);
    if (skill.defense) return { label: delta >= 0 ? "FAVORED EVADE" : "RISKY EVADE", cls: delta >= 0 ? "favored" : "struggling", delta };
    if (delta >= 7) return { label: "DOMINATING", cls: "dominating", delta };
    if (delta >= 2) return { label: "FAVORED", cls: "favored", delta };
    if (delta >= -1) return { label: "NEUTRAL", cls: "neutral", delta };
    if (delta >= -5) return { label: "STRUGGLING", cls: "struggling", delta };
    return { label: "HOPELESS", cls: "hopeless", delta };
  }

  function renderBattleHUD() {
    const d = battle.don, e = battle.enemy;
    els.battleWave.textContent = `${battle.wave}/1`;
    els.battleTurn.textContent = String(battle.turn);
    els.phaseLabel.textContent = battle.phase === "planning" ? "COMMAND PHASE" : "COMBAT PHASE";
    els.donHpText.textContent = `${Math.max(0, Math.ceil(d.hp))}/${d.maxHp}`;
    els.donHpBar.style.width = `${clamp(d.hp / d.maxHp * 100, 0, 100)}%`;
    els.donSpText.textContent = `${d.sp >= 0 ? "+" : ""}${d.sp}`;
    els.donSpBar.style.width = `${clamp((d.sp + 45) / 90 * 100, 0, 100)}%`;
    els.managerSp.textContent = `${d.sp >= 0 ? "+" : ""}${d.sp} SP`;
    const topSpeed = battle.donSlots.length ? Math.max(...battle.donSlots.map((slot) => slot.speed)) : 3;
    els.donSpeed.textContent = String(topSpeed);
    const dbuffs = [];
    if (d.haste) dbuffs.push(`HASTE ${d.haste}`);
    if (d.attackUp) dbuffs.push(`ATK UP ${d.attackUp}`);
    els.donStatus.textContent = dbuffs.join(" · ") || "READY";

    els.enemyHpText.textContent = `${Math.max(0, Math.ceil(e.hp))}/${e.maxHp}`;
    els.enemyHpBar.style.width = `${clamp(e.hp / e.maxHp * 100, 0, 100)}%`;
    const threshold = e.staggerThresholds.find((x) => e.hp > x);
    const thresholdPct = threshold ? Math.round(threshold / e.maxHp * 100) : 0;
    els.enemyStaggerBar.style.width = `${thresholdPct}%`;
    els.enemyStaggerText.textContent = e.staggered ? "STAGGER" : `${thresholdPct}%`;
    const eSpeed = battle.enemySlots.length ? Math.max(...battle.enemySlots.map((slot) => slot.speed)) : 2;
    els.enemySpeed.textContent = String(eSpeed);
    const estatus = [];
    if (e.staggered) estatus.push("STAGGERED");
    if (e.bleedPotency && e.bleedCount) estatus.push(`BLEED ${e.bleedPotency}×${e.bleedCount}`);
    els.enemyStatus.textContent = estatus.join(" · ") || "HOSTILE";
    els.battleEnemy.classList.toggle("staggered", e.staggered);

    els.sinLust.textContent = String(battle.sins.Lust || 0);
    els.sinEnvy.textContent = String(battle.sins.Envy || 0);
    els.sinGluttony.textContent = String(battle.sins.Gluttony || 0);
  }

  function skillCardHTML(skill, slot, isAlt = false) {
    const cp = getSkillCoinPower(skill, slot.speed);
    return `
      <span class="lc-card-affinity">${escapeHTML(skill.affinity)} · ${escapeHTML(skill.type)}</span>
      <strong>${escapeHTML(skill.name)}</strong>
      <span class="lc-card-power"><b>${skill.base}</b><i>+${cp}</i></span>
      <span class="lc-card-coins">${Array.from({length: skill.coins}, () => "●").join("")}</span>
      ${isAlt ? '<span class="lc-alt-label">ALT</span>' : ''}`;
  }

  function showSkillInspector(skill, slot) {
    els.battleInspector.hidden = false;
    els.inspectorName.textContent = skill.name;
    els.inspectorPower.textContent = `${skill.base} + ${getSkillCoinPower(skill, slot.speed)} · ${skill.coins} Coin${skill.coins > 1 ? "s" : ""}`;
    els.inspectorText.textContent = skill.effect;
    els.inspectorKeywords.innerHTML = skill.keywords.map((x) => `<span>${escapeHTML(x)}</span>`).join("");
  }

  function hideSkillInspector() { els.battleInspector.hidden = true; }

  function renderEnemyIntents() {
    els.enemyIntentSlots.innerHTML = "";
    battle.enemySlots.forEach((slot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lc-enemy-intent-card";
      btn.dataset.enemySlot = String(slot.index);
      btn.innerHTML = `
        <span class="lc-intent-speed">${slot.speed}</span>
        <span class="lc-intent-icon">⚔</span>
        <strong>${escapeHTML(slot.skill.name)}</strong>
        <small>${slot.skill.base}+${slot.skill.coinPower} · ${slot.skill.coins}C</small>`;
      btn.addEventListener("click", () => {
        const focus = battle.donSlots[battle.focusSlot] || battle.donSlots[0];
        if (!focus || battle.phase !== "planning") return;
        focus.target = slot.index;
        renderPlanning();
      });
      els.enemyIntentSlots.appendChild(btn);
    });
  }

  function renderActionRail() {
    els.actionRail.innerHTML = "";
    battle.donSlots.forEach((slot) => {
      const selected = getSelectedSkill(slot);
      const alternate = donBattleSkills[slot.options[slot.selected === 0 ? 1 : 0]];
      const forecast = clashForecast(slot);
      const wrap = document.createElement("div");
      wrap.className = `lc-action-slot${battle.focusSlot === slot.index ? " focused" : ""}`;
      wrap.dataset.actionSlot = String(slot.index);
      wrap.innerHTML = `
        <span class="lc-forecast ${forecast.cls}">${forecast.label}</span>
        <button class="lc-main-skill lc-aff-${selected.css}" type="button">${skillCardHTML(selected, slot)}</button>
        <button class="lc-alt-skill lc-aff-${alternate.css}" type="button" aria-label="Switch to ${escapeHTML(alternate.name)}">${skillCardHTML(alternate, slot, true)}</button>
        <div class="lc-slot-core">
          <span class="lc-speed-die">${slot.speed}</span>
          <span class="lc-portrait"><img src="assets/characters/idle.png" alt="" /></span>
        </div>
        <div class="lc-slot-actions">
          <button class="lc-target-cycle" type="button">TARGET ${slot.target + 1}</button>
          <button class="lc-defense" type="button">${slot.defense ? "SKILL" : "EVADE"}</button>
        </div>`;
      const mainBtn = wrap.querySelector(".lc-main-skill");
      const altBtn = wrap.querySelector(".lc-alt-skill");
      const targetBtn = wrap.querySelector(".lc-target-cycle");
      const defenseBtn = wrap.querySelector(".lc-defense");
      const focus = () => { battle.focusSlot = slot.index; };
      mainBtn.addEventListener("click", () => {
        if (battle.phase !== "planning") return;
        focus();
        if (slot.defense) slot.defense = false;
        slot.selected = slot.selected === 0 ? 1 : 0;
        renderPlanning();
      });
      altBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (battle.phase !== "planning") return;
        focus();
        slot.defense = false;
        slot.selected = slot.selected === 0 ? 1 : 0;
        renderPlanning();
      });
      targetBtn.addEventListener("click", () => {
        if (battle.phase !== "planning") return;
        focus();
        slot.target = (slot.target + 1) % battle.enemySlots.length;
        renderPlanning();
      });
      defenseBtn.addEventListener("click", () => {
        if (battle.phase !== "planning") return;
        focus();
        slot.defense = !slot.defense;
        renderPlanning();
      });
      [mainBtn, altBtn].forEach((btn) => {
        btn.addEventListener("mouseenter", () => showSkillInspector(btn === mainBtn ? selected : alternate, slot));
        btn.addEventListener("focus", () => showSkillInspector(btn === mainBtn ? selected : alternate, slot));
        btn.addEventListener("mouseleave", hideSkillInspector);
      });
      els.actionRail.appendChild(wrap);
    });
  }

  function renderTurnOrder() {
    const items = [
      ...battle.donSlots.map((slot) => ({ side: "don", speed: slot.speed, text: `D${slot.index + 1}` })),
      ...battle.enemySlots.map((slot) => ({ side: "enemy", speed: slot.speed, text: `E${slot.index + 1}` })),
    ].sort((a,b) => b.speed - a.speed);
    els.turnOrder.innerHTML = items.map((x) => `<span class="${x.side}"><b>${x.speed}</b>${x.text}</span>`).join("");
  }

  function drawTargetLines() {
    if (!battle || battle.phase !== "planning" || els.battleScreen.hidden) return;
    const rect = els.battleScreen.getBoundingClientRect();
    els.targetLines.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    const defs = els.targetLines.querySelector("defs").outerHTML;
    const paths = [];
    battle.donSlots.forEach((slot) => {
      const from = els.actionRail.querySelector(`[data-action-slot="${slot.index}"] .lc-main-skill`);
      const to = els.enemyIntentSlots.querySelector(`[data-enemy-slot="${slot.target}"]`);
      if (!from || !to) return;
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const x1 = a.left + a.width/2 - rect.left;
      const y1 = a.top + 4 - rect.top;
      const x2 = b.left + b.width/2 - rect.left;
      const y2 = b.top + b.height/2 - rect.top;
      const c1y = y1 - Math.max(70, (y1-y2)*.46);
      const c2y = y2 + Math.max(45, (y1-y2)*.22);
      const fc = clashForecast(slot);
      const stroke = fc.cls === "hopeless" || fc.cls === "struggling" ? "#ce554b" : fc.cls === "neutral" ? "#e0b94f" : "#b7dc58";
      const marker = fc.cls === "hopeless" || fc.cls === "struggling" ? "arrowRed" : fc.cls === "neutral" ? "arrowGold" : "arrowGreen";
      paths.push(`<path d="M ${x1} ${y1} C ${x1} ${c1y}, ${x2} ${c2y}, ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="2.2" opacity=".82" marker-end="url(#${marker})"/>`);
    });
    els.targetLines.innerHTML = defs + paths.join("");
  }

  function renderPlanning() {
    if (!battle) return;
    battle.phase = "planning";
    els.battleScreen.classList.remove("is-resolving");
    els.planningPanel.hidden = false;
    els.enemyIntentSlots.hidden = false;
    els.targetLines.hidden = false;
    els.clashOverlay.hidden = true;
    const tut = battleTutorialSteps[Math.min(battle.tutorialStep, battleTutorialSteps.length - 1)];
    els.tutorialTitle.textContent = tut.title;
    els.tutorialText.textContent = tut.text;
    els.battleTutorial.hidden = false;
    renderBattleHUD();
    renderEnemyIntents();
    renderActionRail();
    renderTurnOrder();
    requestAnimationFrame(drawTargetLines);
  }

  function autoSelect(mode = "win") {
    if (!battle || battle.phase !== "planning") return;
    battle.donSlots.forEach((slot, i) => {
      slot.defense = false;
      let best = 0, bestScore = -Infinity;
      slot.options.forEach((key, idx) => {
        const skill = donBattleSkills[key];
        const target = battle.enemySlots[slot.target] || battle.enemySlots[0];
        const score = mode === "damage"
          ? expectedSkillPower(skill, slot.speed, battle.don.sp, battle.don.attackUp) * skill.coins
          : maxSkillPower(skill, slot.speed, battle.don.attackUp) - enemyMaxPower(target);
        if (score > bestScore) { bestScore = score; best = idx; }
      });
      slot.selected = best;
      slot.target = i % battle.enemySlots.length;
    });
    renderPlanning();
  }

  function waitForBattleStart() {
    return new Promise((resolve) => { battleInputResolver = resolve; });
  }

  function triggerBattleStart() {
    if (!battle?.active || battle.phase !== "planning" || !battleInputResolver) return;
    const resolver = battleInputResolver;
    battleInputResolver = null;
    resolver();
  }

  function rollCoins(skill, activeCoins, slotSpeed, isEnemy = false) {
    const chance = isEnemy ? 50 : headsChance(battle.don.sp);
    const flips = [];
    let heads = 0;
    for (let i = 0; i < activeCoins; i += 1) {
      const head = Math.random() * 100 < chance;
      flips.push(head);
      if (head) heads += 1;
    }
    const attackBonus = isEnemy || skill.defense ? 0 : battle.don.attackUp;
    const coinPower = isEnemy ? skill.coinPower : getSkillCoinPower(skill, slotSpeed);
    return { power: skill.base + attackBonus + heads * coinPower, flips, heads };
  }

  function renderClashCoins(container, flips, activeCoins) {
    container.innerHTML = "";
    for (let i = 0; i < activeCoins; i += 1) {
      const coin = document.createElement("i");
      const head = flips?.[i];
      coin.className = `lc-clash-coin${head === false ? " tails" : head === true ? " heads" : ""}`;
      coin.textContent = head === false ? "T" : head === true ? "H" : "●";
      container.appendChild(coin);
    }
  }

  function setBattleDonExpression(key = "idle") {
    els.battleDon.src = assets.characters[key] || assets.characters.idle;
  }

  function combatLog(text, kind = "") {
    els.combatLog.textContent = text;
    els.combatLog.className = `lc-combat-log ${kind}`;
    els.combatLog.hidden = false;
    clearTimeout(els.combatLog._timer);
    els.combatLog._timer = setTimeout(() => { els.combatLog.hidden = true; }, 1200);
  }

  async function floatNumber(target, amount, opts = {}) {
    const el = target === "don" ? els.donDamage : els.enemyDamage;
    el.textContent = `${opts.heal ? "+" : ""}${Math.round(amount)}${opts.critical ? " CRIT" : ""}`;
    el.className = `lc-floating-number${opts.heal ? " heal" : ""}${opts.critical ? " critical" : ""}`;
    el.hidden = false;
    await delay(540);
    el.hidden = true;
  }

  function impact(target, className) {
    target.classList.remove(className);
    void target.offsetWidth;
    target.classList.add(className);
    setTimeout(() => target.classList.remove(className), 520);
    els.battleScreen.classList.remove("lc-screen-shake");
    void els.battleScreen.offsetWidth;
    els.battleScreen.classList.add("lc-screen-shake");
  }

  function triggerBleedOnEnemyCoinToss() {
    const e = battle.enemy;
    if (e.bleedPotency > 0 && e.bleedCount > 0) {
      const dmg = e.bleedPotency;
      e.hp = Math.max(0, e.hp - dmg);
      e.bleedCount -= 1;
      if (e.bleedCount <= 0) e.bleedPotency = 0;
      return dmg;
    }
    return 0;
  }

  function checkEnemyStagger() {
    const e = battle.enemy;
    if (e.staggered) return false;
    const hit = e.staggerThresholds.find((threshold) => e.hp <= threshold && !e[`threshold_${threshold}`]);
    if (!hit) return false;
    e[`threshold_${hit}`] = true;
    e.staggered = true;
    e.staggerTurns = 2;
    combatLog("STAGGER!", "stagger");
    return true;
  }

  function addSin(skill) {
    if (battle.sins[skill.affinity] !== undefined) battle.sins[skill.affinity] += 1;
  }

  async function showClash(slot, enemySlot, donCoins, enemyCoins, donRoll = null, enemyRoll = null, label = "CLASH") {
    const donSkill = getSelectedSkill(slot);
    const enemySkill = enemySlot.skill;
    els.clashDonSkill.textContent = donSkill.name;
    els.clashEnemySkill.textContent = enemySkill.name;
    els.clashDonPower.textContent = donRoll ? String(donRoll.power) : String(maxSkillPower(donSkill, slot.speed, battle.don.attackUp));
    els.clashEnemyPower.textContent = enemyRoll ? String(enemyRoll.power) : String(enemyMaxPower(enemySlot));
    els.clashResult.textContent = label;
    renderClashCoins(els.clashCoinsDon, donRoll?.flips, donCoins);
    renderClashCoins(els.clashCoinsEnemy, enemyRoll?.flips, enemyCoins);
    els.clashOverlay.hidden = false;
    await delay(260);
  }

  async function resolveClash(slot, enemySlot) {
    const donSkill = getSelectedSkill(slot);
    const enemySkill = enemySlot.skill;
    let donCoins = donSkill.coins;
    let enemyCoins = enemySkill.coins;
    await showClash(slot, enemySlot, donCoins, enemyCoins, null, null, "CLASH");
    await delay(300);

    while (donCoins > 0 && enemyCoins > 0) {
      const bleed = triggerBleedOnEnemyCoinToss();
      if (bleed) {
        renderBattleHUD();
        floatNumber("enemy", bleed);
        if (battle.enemy.hp <= 0) return { won: true, remainingDonCoins: donCoins };
      }
      const dr = rollCoins(donSkill, donCoins, slot.speed, false);
      const er = rollCoins(enemySkill, enemyCoins, enemySlot.speed, true);
      await showClash(slot, enemySlot, donCoins, enemyCoins, dr, er, "CLASH");
      if (dr.power === er.power) {
        els.clashResult.textContent = "TIE";
        combatLog("Power tied — clash again");
      } else if (dr.power > er.power) {
        enemyCoins -= 1;
        battle.don.sp = clamp(battle.don.sp + 3, -45, 45);
        els.clashResult.textContent = "WIN";
        combatLog(`${donSkill.name} wins the clash`, "win");
      } else {
        donCoins -= 1;
        battle.don.sp = clamp(battle.don.sp - 3, -45, 45);
        els.clashResult.textContent = "LOSE";
        combatLog(`${enemySkill.name} wins the clash`, "lose");
      }
      renderBattleHUD();
      await delay(520);
    }
    const won = enemyCoins <= 0;
    battle.don.sp = clamp(battle.don.sp + (won ? 5 : -5), -45, 45);
    await delay(180);
    return { won, remainingDonCoins: donCoins };
  }

  async function donAttack(slot, skill, coinCount, clashWon = false) {
    setBattleDonExpression(skill.expression);
    els.battleDon.className = "lc-fighter lc-don";
    void els.battleDon.offsetWidth;
    els.battleDon.classList.add(skill.animation);
    addSin(skill);
    const count = Math.max(1, coinCount);
    for (let i = 0; i < count; i += 1) {
      await delay(i === 0 ? 170 : 210);
      const roll = rollCoins(skill, 1, slot.speed, false);
      let damage = Math.max(1, Math.round((skill.base + roll.heads * getSkillCoinPower(skill, slot.speed) + battle.don.attackUp) * (skill.coins > 1 ? .92 : 1.05) + randomInt(1,4)));
      if (clashWon) damage = Math.round(damage * 1.08);
      if (battle.enemy.staggered) damage = Math.round(damage * 2);
      const crit = Math.random() < .08;
      if (crit) damage = Math.round(damage * 1.3);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
      impact(els.battleEnemy, "lc-enemy-hit");
      floatNumber("enemy", damage, { critical: crit });
      combatLog(`${skill.name}  ${damage}`, crit ? "critical" : "win");

      if (skill.key === "gallop" && roll.flips[0]) {
        battle.enemy.bleedPotency += 2;
        battle.enemy.bleedCount += 1;
      }
      if (skill.key === "justice") {
        battle.enemy.bleedPotency += i < 2 ? 1 : 0;
        battle.enemy.bleedCount += i < 2 ? 1 : 2;
      }
      checkEnemyStagger();
      renderBattleHUD();
      await delay(260);
      if (battle.enemy.hp <= 0) break;
    }
    if (skill.key === "joust" && clashWon) battle.don.nextHaste += 2;
    if (skill.key === "gallop" && clashWon) battle.don.nextAttackUp += 2;
    setBattleDonExpression("idle");
  }

  async function enemyAttack(enemySlot) {
    if (battle.enemy.staggered) {
      combatLog("Enemy is staggered — action cancelled", "stagger");
      await delay(450);
      return;
    }
    const skill = enemySlot.skill;
    els.battleEnemy.classList.remove("lc-enemy-attack");
    void els.battleEnemy.offsetWidth;
    els.battleEnemy.classList.add("lc-enemy-attack");
    const roll = rollCoins(skill, skill.coins, enemySlot.speed, true);
    await delay(250);
    const damage = Math.max(1, Math.round(roll.power * .68 + randomInt(0,3)));
    battle.don.hp = Math.max(0, battle.don.hp - damage);
    impact(els.battleDon, "lc-don-hit");
    floatNumber("don", damage);
    combatLog(`${skill.name}  ${damage}`, "lose");
    renderBattleHUD();
    await delay(460);
  }

  async function resolveEvade(slot, enemySlot) {
    const skill = donBattleSkills.evade;
    setBattleDonExpression("happy");
    els.battleDon.className = "lc-fighter lc-don";
    void els.battleDon.offsetWidth;
    els.battleDon.classList.add("lc-anim-evade");
    const dr = rollCoins(skill, 1, slot.speed, false);
    const er = rollCoins(enemySlot.skill, enemySlot.skill.coins, enemySlot.speed, true);
    await showClash(slot, enemySlot, 1, enemySlot.skill.coins, dr, er, "EVADE");
    await delay(430);
    if (dr.power >= er.power) {
      battle.don.sp = clamp(battle.don.sp + 3, -45, 45);
      els.clashResult.textContent = "EVADED";
      combatLog("Attack evaded", "win");
    } else {
      els.clashResult.textContent = "FAILED";
      await delay(230);
      await enemyAttack(enemySlot);
    }
    setBattleDonExpression("idle");
  }

  async function executeAction(slot, enemySlot) {
    if (battle.enemy.hp <= 0 || battle.don.hp <= 0) return;
    const skill = getSelectedSkill(slot);
    if (!enemySlot || enemySlot.consumed || battle.enemy.staggered) {
      combatLog(`${skill.name} — UNOPPOSED`, "win");
      els.clashOverlay.hidden = true;
      await donAttack(slot, skill, skill.coins, false);
      return;
    }
    enemySlot.consumed = true;
    if (skill.defense) {
      await resolveEvade(slot, enemySlot);
      return;
    }
    const result = await resolveClash(slot, enemySlot);
    if (result.won) {
      els.clashResult.textContent = "CLASH WON";
      await delay(220);
      els.clashOverlay.hidden = true;
      await donAttack(slot, skill, result.remainingDonCoins, true);
    } else {
      els.clashResult.textContent = "CLASH LOST";
      await delay(220);
      els.clashOverlay.hidden = true;
      await enemyAttack(enemySlot);
    }
  }

  async function executePlannedTurn() {
    battle.phase = "combat";
    els.phaseLabel.textContent = "COMBAT PHASE";
    els.battleScreen.classList.add("is-resolving");
    els.planningPanel.hidden = true;
    els.enemyIntentSlots.hidden = true;
    els.targetLines.hidden = true;
    els.battleTutorial.hidden = true;
    hideSkillInspector();

    const order = [...battle.donSlots].sort((a,b) => b.speed - a.speed);
    for (const slot of order) {
      if (battle.enemy.hp <= 0 || battle.don.hp <= 0) break;
      const enemySlot = battle.enemySlots[slot.target];
      await executeAction(slot, enemySlot);
      await delay(180);
    }

    for (const enemySlot of battle.enemySlots.filter((x) => !x.consumed).sort((a,b) => b.speed-a.speed)) {
      if (battle.enemy.hp <= 0 || battle.don.hp <= 0) break;
      await enemyAttack(enemySlot);
    }
    els.clashOverlay.hidden = true;
  }

  function applyTurnStartBuffs() {
    battle.don.haste = battle.don.nextHaste;
    battle.don.nextHaste = 0;
    battle.don.attackUp = battle.don.nextAttackUp;
    battle.don.nextAttackUp = 0;
    if (battle.enemy.staggerTurns <= 0) battle.enemy.staggered = false;
    createTurnSlots();
  }

  function finishTurn() {
    if (battle.enemy.staggerTurns > 0) battle.enemy.staggerTurns -= 1;
    battle.turn += 1;
    battle.tutorialStep = Math.min(battle.tutorialStep + 1, battleTutorialSteps.length - 1);
  }

  function showBattleResult(victory) {
    els.battleResultSmall.textContent = victory ? "ENCOUNTER COMPLETE" : "DON QUIXOTE IS DOWN";
    els.battleResultTitle.textContent = victory ? "VICTORY" : "DEFEAT";
    els.battleContinue.textContent = victory ? "CONTINUE" : "RETRY";
    els.battleResult.hidden = false;
    return new Promise((resolve) => { battleResultResolver = resolve; });
  }

  async function startBattleTutorial() {
    battle = makeBattleState();
    state.scene = "forestBattle";
    state.forestBattleSeen = true;
    saveCheckpoint();
    els.dialogueBox.hidden = true;
    closeChoices();
    els.character.hidden = true;
    els.hud.hidden = true;
    els.quickMenu.hidden = true;
    els.backpackBtn.hidden = true;
    els.battleResult.hidden = true;
    els.battleScreen.hidden = false;
    setBattleDonExpression("idle");

    while (battle.active && battle.enemy.hp > 0 && battle.don.hp > 0) {
      applyTurnStartBuffs();
      renderPlanning();
      await waitForBattleStart();
      await executePlannedTurn();
      if (battle.enemy.hp <= 0 || battle.don.hp <= 0) break;
      finishTurn();
      await delay(320);
    }

    const victory = battle.enemy.hp <= 0;
    battle.active = false;
    const result = await showBattleResult(victory);
    els.battleResult.hidden = true;
    if (result === "retry") {
      els.battleScreen.hidden = true;
      battle = null;
      return startBattleTutorial();
    }
    els.battleScreen.hidden = true;
    battle = null;
    els.hud.hidden = false;
    els.quickMenu.hidden = false;
    els.backpackBtn.hidden = false;
    return victory;
  }

  async function forestEncounter() {
    if (state.forestBattleWon) {
      setCharacter("happy");
      await say("Don Quixote", "The forest road is peaceful now. Justice prevails!");
      await mapLoop();
      return;
    }

    state.scene = "forestEncounter";
    setCharacter("idle");
    await say("", "Branches snap somewhere ahead. Someone steps onto the path and blocks the way.");
    setCharacter("lilMad");
    await say("Bandit", "Stop there. Hand over the bag and turn around.");
    setCharacter("angry");
    await say("Don Quixote", "A highway villain, in this very forest?!");
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
    await say("", "Battle tutorial cleared. Forest exploration can continue from here in a later chapter.");
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
    if (state.scene === "forestBattle" || state.scene === "forestEncounter" || state.scene === "forestAfterBattle") {
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
    els.titleScreen.hidden = true;
    els.hud.hidden = false;
    els.quickMenu.hidden = false;
    els.backpackBtn.hidden = false;
    els.bgm.volume = state.volume / 100;
    els.volumeSlider.value = String(state.volume);
    els.bgm.play().catch(() => {});
  }

  function applyVolume() {
    state.volume = Math.max(0, Math.min(100, Number(state.volume ?? 35)));
    els.bgm.volume = state.volume / 100;
    els.volumeSlider.value = String(state.volume);
  }

  function resetUIForNewGame() {
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

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function anyModalOpen() {
    return [
      els.nameModal,
      els.inventoryModal,
      els.mapModal,
      els.systemModal,
    ].some((el) => !el.hidden);
  }

  els.newGameBtn.addEventListener("click", async () => {
    state = makeInitialState();
    resetUIForNewGame();
    launchGameShell();
    applyVolume();
    await startStory();
  });

  els.continueBtn.addEventListener("click", async () => {
    const saved = loadSave();
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });

  els.dialogueBox.addEventListener("click", () => {
    if (advanceHandler) advanceHandler();
  });
  document.addEventListener("keydown", (event) => {
    if (!els.battleScreen.hidden) {
      if (/^[1-5]$/.test(event.key) && battle?.phase === "planning") {
        const slot = battle.donSlots[Number(event.key) - 1];
        if (slot) {
          battle.focusSlot = slot.index;
          slot.defense = false;
          slot.selected = slot.selected === 0 ? 1 : 0;
          renderPlanning();
        }
      }
      if (event.key === "Enter" && battle?.phase === "planning") triggerBattleStart();
      if (event.key.toLowerCase() === "w" && battle?.phase === "planning") autoSelect("win");
      if (event.key.toLowerCase() === "d" && battle?.phase === "planning") autoSelect("damage");
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
  els.mapClose.addEventListener("click", () => {
    els.mapModal.hidden = true;
  });
  els.systemBtn.addEventListener("click", () => {
    const saved = loadSave();
    els.saveInfo.textContent = saved?.savedAt
      ? `Last save: ${new Date(saved.savedAt).toLocaleString()}`
      : "No save yet.";
    els.systemModal.hidden = false;
  });
  els.systemClose.addEventListener("click", () => {
    els.systemModal.hidden = true;
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
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });
  els.restartBtn.addEventListener("click", () => {
    if (confirm("Restart the game from the beginning?")) location.reload();
  });

  els.startCombatBtn.addEventListener("click", triggerBattleStart);
  els.autoWinBtn.addEventListener("click", () => autoSelect("win"));
  els.autoDamageBtn.addEventListener("click", () => autoSelect("damage"));
  window.addEventListener("resize", () => {
    if (battle?.phase === "planning" && !els.battleScreen.hidden) requestAnimationFrame(drawTargetLines);
  });

  els.battleContinue.addEventListener("click", () => {
    if (!battleResultResolver) return;
    const resolver = battleResultResolver;
    battleResultResolver = null;
    resolver(battle?.enemy.hp > 0 ? "retry" : "continue");
  });

  // Title presentation.
  setBackground("don_room");
  updateContinueButton();
  updateHUD();
  updateBackpackCount();
})();
