(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    game: $("game"), background: $("background"), titleScreen: $("titleScreen"), newGameBtn: $("newGameBtn"), continueBtn: $("continueBtn"),
    hud: $("hud"), hudLocation: $("hudLocation"), hudTime: $("hudTime"), character: $("character"), dialogueBox: $("dialogueBox"),
    speaker: $("speaker"), dialogue: $("dialogue"), choices: $("choices"), backpackBtn: $("backpackBtn"), backpackCount: $("backpackCount"),
    nameModal: $("nameModal"), nameInput: $("nameInput"), nameConfirm: $("nameConfirm"), inventoryModal: $("inventoryModal"), inventoryClose: $("inventoryClose"), inventoryList: $("inventoryList"),
    mapModal: $("mapModal"), mapClose: $("mapClose"), mapGrid: $("mapGrid"), mapTime: $("mapTime"), mapLocation: $("mapLocation"),
    systemModal: $("systemModal"), systemBtn: $("systemBtn"), systemClose: $("systemClose"), volumeSlider: $("volumeSlider"), saveBtn: $("saveBtn"), loadBtn: $("loadBtn"), restartBtn: $("restartBtn"), saveInfo: $("saveInfo"),
    notice: $("notice"), quickMenu: $("quickMenu"), mapBtn: $("mapBtn"), bgm: $("bgm")
  };

  const SAVE_KEY = "raise-don-quixote-html-save-v1";

  const assets = {
    backgrounds: {
      black: null,
      don_room: "assets/backgrounds/don-room.png",
      bus: "assets/backgrounds/bus.png",
      town: "assets/backgrounds/town.png",
      forest: "assets/backgrounds/forest.jpeg",
      shop: "assets/backgrounds/shop.png"
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
      superMad: "assets/characters/super-mad.png"
    }
  };

  const itemDB = {
    Potion: { desc: "Heals 45 SP.", icon: "assets/items/potion.webp" },
    Lunacy: { desc: "A gamble flower.", icon: "assets/items/lunacy.webp" },
    Coin: { desc: "A shiny gold coin.", icon: "assets/items/coin.png" }
  };

  const travelTime = { Bus: 0, Town: 10, Shop: 5, Forest: 15 };
  const mapImages = { Bus: assets.backgrounds.bus, Town: assets.backgrounds.town, Shop: assets.backgrounds.shop, Forest: assets.backgrounds.forest };

  let state = makeInitialState();
  let advanceHandler = null;
  let backpackReminderTimer = null;
  let noticeTimer = null;
  let interactionLocked = false;

  function makeInitialState() {
    return {
      version: 1,
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
      backpackOpened: false,
      tutorialActive: true,
      volume: 35
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
    els.nameInput.value = state.playerName === "Dante" ? "" : state.playerName;
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
      if (state.gameTime > 30) await say("Don Quixote", "We've been traveling for a while...");
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
      setCharacter("idle", false);
      if (!state.forestIntroSeen) {
        state.forestIntroSeen = true;
        await say("", "The forest feels different… quieter, yet alive.");
        await say("", "You sense that something important awaits you here.");
      }
      await say("", "The original Ren'Py project does not contain the forest_main story yet. This is the end of the current demo content.");
      await mapLoop();
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
      { label: "alright", value: "alright" }
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
    } catch { return null; }
  }

  function updateContinueButton() {
    const saved = loadSave();
    els.continueBtn.hidden = !saved;
    if (saved?.savedAt) els.continueBtn.title = `Saved ${new Date(saved.savedAt).toLocaleString()}`;
  }

  async function resumeSavedGame(saved) {
    if (!saved) return;
    state = { ...makeInitialState(), ...saved };
    state.inventory = saved.inventory || {};
    state.mapUnlocked = { ...makeInitialState().mapUnlocked, ...(saved.mapUnlocked || {}) };
    state.questClear = { ...makeInitialState().questClear, ...(saved.questClear || {}) };
    applyVolume();
    launchGameShell();
    updateBackpackCount();
    updateHUD();
    els.backpackBtn.hidden = false;
    showNotice("Save loaded.");

    // Resume from stable checkpoints only; story text is intentionally replayed from the nearest section.
    if (state.scene === "map" || state.scene === "story2") {
      setBackground(state.currentLocation === "Town" ? "town" : state.currentLocation === "Forest" ? "forest" : "bus");
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
    [els.nameModal, els.inventoryModal, els.mapModal, els.systemModal].forEach((el) => el.hidden = true);
    els.dialogueBox.hidden = true;
    els.character.hidden = true;
    els.notice.hidden = true;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  }

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function anyModalOpen() {
    return [els.nameModal, els.inventoryModal, els.mapModal, els.systemModal].some((el) => !el.hidden);
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

  els.dialogueBox.addEventListener("click", () => { if (advanceHandler) advanceHandler(); });
  document.addEventListener("keydown", (event) => {
    if (anyModalOpen()) return;
    if ((event.key === "Enter" || event.key === " ") && advanceHandler) {
      event.preventDefault(); advanceHandler();
    }
    if (!els.choices.hidden && /^[1-9]$/.test(event.key)) {
      const btn = els.choices.children[Number(event.key) - 1];
      if (btn) btn.click();
    }
    if (event.key.toLowerCase() === "i" && !els.backpackBtn.hidden) openInventory();
    if (event.key.toLowerCase() === "m" && !els.quickMenu.hidden) openMap();
  });

  els.backpackBtn.addEventListener("click", openInventory);
  els.inventoryClose.addEventListener("click", () => {
    els.inventoryModal.hidden = true;
    els.inventoryModal.dispatchEvent(new Event("inventoryClosed"));
  });
  els.mapBtn.addEventListener("click", openMap);
  els.mapClose.addEventListener("click", () => { els.mapModal.hidden = true; });
  els.systemBtn.addEventListener("click", () => {
    const saved = loadSave();
    els.saveInfo.textContent = saved?.savedAt ? `Last save: ${new Date(saved.savedAt).toLocaleString()}` : "No save yet.";
    els.systemModal.hidden = false;
  });
  els.systemClose.addEventListener("click", () => { els.systemModal.hidden = true; });
  els.volumeSlider.addEventListener("input", () => {
    state.volume = Number(els.volumeSlider.value);
    applyVolume();
  });
  els.saveBtn.addEventListener("click", () => saveCheckpoint(true));
  els.loadBtn.addEventListener("click", async () => {
    const saved = loadSave();
    if (!saved) { showNotice("No save found."); return; }
    els.systemModal.hidden = true;
    resetUIForNewGame();
    await resumeSavedGame(saved);
  });
  els.restartBtn.addEventListener("click", () => {
    if (confirm("Restart the game from the beginning?")) location.reload();
  });

  // Title presentation.
  setBackground("don_room");
  updateContinueButton();
  updateHUD();
  updateBackpackCount();
})();
