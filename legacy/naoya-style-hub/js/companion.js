/* Naoya Hub companion v1 — independent of the music, notes and AFK timer. */
(() => {
  'use strict';
  const KEY = 'naoya.companion.v1';
  const characters = {
    don: {
      name: 'Don Quixote',
      image: '../../assets/companions/don.png',
      lines: [
        'Manager Esquire! Một cuộc phiêu lưu mới đang chờ!',
        'Cho ta xem dự án tiếp theo của ngươi nào!',
        'Một bài nhạc hay sẽ khiến hành trình vui hơn!',
        'Hôm nay ngươi đã nghỉ ngơi một chút chưa?',
        'Rocinante! Chúng ta lên đường thôi!',
      ],
    },
    plush: {
      name: 'Naoya Plush',
      image: '../../assets/companions/plush.png',
      lines: [
        'Chào mừng đến góc nhỏ của Naoya.',
        'Một chút nhạc, một chút code. Vậy là đủ.',
        'Có ý tưởng mới? Ghi vào Notepad nhé.',
        'Mình ngồi đây cùng bạn một lúc nhé.',
        'Đừng quên lưu việc đang làm nhé.',
      ],
    },
  };
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (_) {}
  let selected = Object.hasOwn(characters, saved.character) ? saved.character : 'don';
  let visible = saved.visible !== false,
    roaming = saved.roaming !== false;
  let position = { x: 0, y: 0 },
    drag = null,
    state = '',
    lastActivity = Date.now();
  let panelOpen = false,
    bubbleUntil = 0,
    happyUntil = 0,
    hover = false;
  let walkUntil = 0,
    nextWalk = Date.now() + 7000,
    direction = -1,
    frame = 0,
    lastFrame = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pet = document.createElement('div');
  pet.id = 'hubCompanion';
  pet.innerHTML = `<div class="companion-bubble" hidden><p role="status" aria-live="polite"></p><button type="button" class="companion-settings">Tùy chỉnh ↗</button></div>
    <span class="companion-zzz" aria-hidden="true">z Z z</span>
    <button class="companion-body" type="button"><img draggable="false" alt="" /></button>
    <span class="companion-shadow" aria-hidden="true"></span>`;
  document.body.append(pet);
  const body = pet.querySelector('.companion-body'),
    img = pet.querySelector('img');
  const bubble = pet.querySelector('.companion-bubble'),
    speech = bubble.querySelector('p');
  const trigger = document.createElement('button');
  trigger.id = 'companionTrigger';
  trigger.type = 'button';
  trigger.textContent = '✦ PET';
  trigger.setAttribute('aria-controls', 'companionPanel');
  trigger.setAttribute('aria-expanded', 'false');
  (document.querySelector('.topbar > div') || document.body).prepend(trigger);
  const panel = document.createElement('section');
  panel.id = 'companionPanel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Tùy chỉnh nhân vật');
  panel.innerHTML = `<div class="companion-panel-head"><div><small>YOUR LITTLE COMPANION</small><h3>Bạn đồng hành</h3></div><button type="button" data-action="close" aria-label="Đóng tùy chỉnh">×</button></div>
    <div class="companion-choices" role="group" aria-label="Chọn nhân vật">
      <button type="button" data-character="don"><img src="../../assets/companions/don.png" alt=""/><span>Don Quixote</span></button>
      <button type="button" data-character="plush"><img src="../../assets/companions/plush.png" alt=""/><span>Naoya Plush</span></button>
    </div>
    <label class="companion-option"><span>Hiển thị nhân vật</span><input type="checkbox" data-option="visible" /></label>
    <label class="companion-option"><span>Tự đi dạo</span><input type="checkbox" data-option="roaming" /></label>
    <p class="companion-hint">Chạm để trò chuyện · Kéo để đặt vị trí.<br>Khi bạn bận, nhân vật sẽ nghỉ rồi ngủ.</p>
    <div class="companion-panel-actions"><button type="button" data-action="home">Về góc màn hình</button><a href="https://feed-the-don.vercel.app/" target="_blank" rel="noopener noreferrer">Chơi cùng Don ↗</a></div>`;
  document.body.append(panel);
  const visibilityInput = panel.querySelector('[data-option="visible"]');
  const roamingInput = panel.querySelector('[data-option="roaming"]');
  const motionOff = () => reduced.matches || document.body.classList.contains('reduce-motion');
  const dimensions = () => ({
    w: innerWidth,
    h: innerHeight,
    size: pet.offsetWidth || (innerWidth <= 760 ? 88 : 116),
    bottom: innerWidth <= 760 ? 88 : 18,
  });
  function clamp() {
    const d = dimensions();
    position.x = Math.max(8, Math.min(position.x, Math.max(8, d.w - d.size - 8)));
    position.y = Math.max(
      Math.min(64, Math.max(8, d.h - d.size - d.bottom)),
      Math.min(position.y, Math.max(8, d.h - d.size - d.bottom))
    );
  }
  function paint() {
    pet.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    const d = dimensions();
    bubble.style.left = `${Math.max(8 - position.x, Math.min(d.size / 2 - 112, d.w - position.x - 232))}px`;
    pet.classList.toggle('bubble-below', position.y < 160);
  }
  function save() {
    const d = dimensions();
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          character: selected,
          visible,
          roaming,
          x: position.x / d.w,
          y: position.y / d.h,
        })
      );
    } catch (_) {}
  }
  function home() {
    const d = dimensions();
    position = { x: d.w - d.size - 28, y: d.h - d.size - d.bottom };
    clamp();
    paint();
    save();
  }
  function say(text) {
    speech.textContent = text;
    bubble.hidden = false;
    bubbleUntil = Date.now() + 5500;
  }
  function refresh() {
    img.src = characters[selected].image;
    body.setAttribute(
      'aria-label',
      `${characters[selected].name}: chạm để trò chuyện, kéo để di chuyển`
    );
    body.title = `${characters[selected].name} · Chạm hoặc kéo`;
    pet.hidden = !visible;
    visibilityInput.checked = visible;
    roamingInput.checked = roaming;
    panel
      .querySelectorAll('[data-character]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.character === selected)));
    trigger.setAttribute('aria-label', `Tùy chỉnh nhân vật, hiện ${visible ? 'bật' : 'tắt'}`);
    pet.classList.toggle('companion-still', motionOff());
    clamp();
    paint();
    tick();
  }
  function showPanel(open, restoreFocus = false) {
    panelOpen = open;
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      stopWalk();
      panel.querySelector('[data-action="close"]').focus();
    }
    if (!open && restoreFocus) trigger.focus();
    tick();
  }
  function stopWalk() {
    walkUntil = 0;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  }
  function animate(time) {
    frame = 0;
    if (
      document.hidden ||
      !visible ||
      panelOpen ||
      drag ||
      hover ||
      motionOff() ||
      !roaming ||
      Date.now() >= walkUntil
    ) {
      stopWalk();
      tick();
      return;
    }
    const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
    lastFrame = time;
    position.x += direction * 24 * dt;
    const d = dimensions();
    if (position.x <= 8 || position.x >= d.w - d.size - 8) direction *= -1;
    clamp();
    paint();
    frame = requestAnimationFrame(animate);
  }
  function tick() {
    if (!visible || document.hidden) {
      stopWalk();
      return;
    }
    const now = Date.now(),
      idle = now - lastActivity;
    if (now > bubbleUntil) bubble.hidden = true;
    let next = drag
      ? 'drag'
      : now < happyUntil
        ? 'happy'
        : idle >= 60000
          ? 'sleep'
          : idle >= 25000
            ? 'rest'
            : 'idle';
    if (next === 'idle' && roaming && !motionOff() && !panelOpen && !hover && now >= nextWalk) {
      walkUntil = now + 4000;
      nextWalk = now + 13000 + Math.random() * 7000;
      position.y = dimensions().h - dimensions().size - dimensions().bottom;
      if (!frame) frame = requestAnimationFrame(animate);
    }
    if (walkUntil > now && next === 'idle' && !hover && !panelOpen) next = 'walk';
    else if (next !== 'walk') stopWalk();
    if (state !== next) {
      state = next;
      pet.dataset.state = state;
    }
  }
  function activity() {
    lastActivity = Date.now();
    if (state === 'sleep' || state === 'rest') tick();
  }
  trigger.addEventListener('click', () => showPanel(!panelOpen));
  pet.querySelector('.companion-settings').addEventListener('click', () => showPanel(true));
  panel.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-character]');
    if (choice) {
      selected = choice.dataset.character;
      visible = true;
      activity();
      refresh();
      save();
      say(`Xin chào! Mình là ${characters[selected].name}.`);
    }
    if (e.target.closest('[data-action="close"]')) showPanel(false, true);
    if (e.target.closest('[data-action="home"]')) {
      home();
      nextWalk = Date.now() + 10000;
      say('Mình về chỗ rồi!');
    }
  });
  visibilityInput.addEventListener('change', () => {
    visible = visibilityInput.checked;
    refresh();
    save();
  });
  roamingInput.addEventListener('change', () => {
    roaming = roamingInput.checked;
    stopWalk();
    nextWalk = Date.now() + 2000;
    refresh();
    save();
  });
  document.addEventListener('pointerdown', (e) => {
    if (
      panelOpen &&
      !panel.contains(e.target) &&
      !trigger.contains(e.target) &&
      !pet.contains(e.target)
    )
      showPanel(false);
  });
  document.addEventListener('keydown', (e) => {
    activity();
    if (e.key === 'Escape') {
      if (panelOpen) showPanel(false, true);
      bubble.hidden = true;
    }
  });
  document.addEventListener('pointermove', activity, { passive: true });
  document.addEventListener('pointerdown', activity, { passive: true });
  document.addEventListener('scroll', activity, { passive: true });
  let suppressClick = false;
  body.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || drag) return;
    stopWalk();
    suppressClick = false;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    body.setPointerCapture(e.pointerId);
    tick();
  });
  body.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.moved) {
      position.x = drag.startX + dx;
      position.y = drag.startY + dy;
      clamp();
      paint();
    }
  });
  function drop(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    suppressClick = moved;
    if (body.hasPointerCapture(e.pointerId)) body.releasePointerCapture(e.pointerId);
    if (moved) {
      roaming = false;
      roamingInput.checked = false;
      say('Mình ở đây nhé! Bật “Tự đi dạo” để mình đi tiếp.');
      save();
    }
    nextWalk = Date.now() + 10000;
    tick();
  }
  body.addEventListener('pointerup', drop);
  body.addEventListener('pointercancel', drop);
  body.addEventListener('lostpointercapture', drop);
  body.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    activity();
    happyUntil = Date.now() + 900;
    nextWalk = Date.now() + 8000;
    const lines = characters[selected].lines;
    say(lines[Math.floor(Math.random() * lines.length)]);
    tick();
  });
  pet.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      hover = true;
      stopWalk();
      tick();
    }
  });
  pet.addEventListener('pointerleave', () => {
    hover = false;
  });
  body.addEventListener('focus', () => {
    hover = true;
    stopWalk();
    tick();
  });
  body.addEventListener('blur', () => {
    hover = false;
  });
  addEventListener('resize', () => {
    clamp();
    paint();
  });
  document.addEventListener('visibilitychange', () => {
    stopWalk();
    nextWalk = Date.now() + 5000;
    tick();
  });
  reduced.addEventListener('change', refresh);
  new MutationObserver(() => {
    if (motionOff()) stopWalk();
    refresh();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    position = { x: saved.x * innerWidth, y: saved.y * innerHeight };
    clamp();
    paint();
  } else home();
  refresh();
  setInterval(tick, 1000);
})();
