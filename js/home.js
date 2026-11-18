/* The cover sheet.
   INTRO  one project pulled apart into its four design layers. It tilts toward the cursor and spreads when you
          come close. The page does not scroll yet: the first scroll, swipe, key or tap plays the motion
          (the layers fan out, turn to face you, and the finished screen fills the window), then the page scrolls.
          Scrolling up at the very top plays it back.
   01     project plates on a light table: the light under the cursor turns the line drawing into the real screen
   02     one screen goes from brief to shipped as you scroll */
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- local time in Davao ---------- */
  const clock = document.getElementById('clock');
  const tick = () => { try { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' }); } catch { clock.textContent = ''; } };
  tick(); setInterval(tick, 30000);

  /* =====================================================================
     INTRO  the layer stack
     To add a project, add one entry to PROJECTS below. It needs a screenshot in assets/shots/ and a line drawing
     with the same file name in assets/sketch/ (made the same way as the others), plus a small thumbnail.
     `wire` is a rough wireframe on a 160 × 100 grid: [x, y, width, height] per box.
     ===================================================================== */
  const PROJECTS = [
    { name: 'kuwaGO', kind: 'Mobile app · 2026', href: 'projects.html?p=kuwago', thumb: 'assets/cs/kuwago-garden.jpg', acc: '#5BB06A', rgb: '91,176,106',
      phones: ['kuwago-garden', 'kuwago-home', 'kuwago-timer'], dims: ['3 screens · 390 pt', '844 pt'],
      stack: ['Flutter', 'Firebase', 'Gemini'], status: 'v1.0.5 · 18 testers',
      pal: [['#1F3B27', 'Forest'], ['#5BB06A', 'Leaf'], ['#F2D38A', 'Lamp'], ['#7A4E2D', 'Soil']], type: ['Pixel', 'Press Start · 8/400'],
      wire: [[22, 5, 32, 90], [64, 3, 32, 92], [106, 5, 32, 90], [25, 12, 26, 18], [25, 34, 26, 8], [67, 10, 26, 30], [67, 44, 26, 10], [67, 58, 26, 6], [109, 12, 26, 10], [109, 28, 26, 30], [109, 62, 26, 8]] },
    { name: 'Cinematheque', kind: 'Web system · 2026', href: 'projects.html?p=cinematheque', thumb: 'assets/cs/cinematheque-title.jpg', acc: '#E2763F', rgb: '226,118,63', img: 'cinematheque-home',
      dims: ['1440 px', '900 px'], stack: ['Laravel 12', 'MySQL', 'PayMongo'], status: '129 tests · client approved',
      pal: [['#141414', 'Ink'], ['#E2763F', 'Ember'], ['#F4EFE6', 'Paper'], ['#C9A227', 'Brass']], type: ['Aa', 'Display · 64/600'],
      wire: [[10, 3, 26, 5], [92, 3, 58, 5], [12, 11, 136, 50], [20, 24, 42, 9], [20, 38, 36, 3], [20, 46, 16, 6], [102, 15, 28, 42], [10, 72, 44, 8], [92, 72, 58, 7], [10, 84, 100, 5], [10, 92, 26, 8], [40, 92, 26, 8], [70, 92, 26, 8]] },
    { name: 'xpera CRM', kind: 'Desktop system · in progress', href: 'projects.html?p=xpera', thumb: 'assets/cs/xpera-logo.jpg', acc: '#F4506A', rgb: '244,80,106', img: 'xpera-sales',
      dims: ['1600 px', '945 px'], stack: ['C#', '.NET WinForms', 'SQL Server'], status: 'In progress · lab 1 done',
      pal: [['#101318', 'Carbon'], ['#F4506A', 'Signal'], ['#2A2F3A', 'Slate'], ['#E9ECF1', 'Bone']], type: ['Aa', 'Sora · 32/600'],
      wire: [[0, 0, 24, 100], [4, 8, 16, 5], [4, 18, 16, 4], [4, 26, 16, 4], [4, 34, 16, 4], [4, 42, 16, 4], [28, 4, 126, 8], [28, 16, 29, 16], [60, 16, 29, 16], [92, 16, 29, 16], [124, 16, 30, 16], [28, 36, 126, 58]] }
  ];
  const KIND = ['l-sketch', 'l-wire', 'l-colour', 'l-final'], LABELS = ['Sketch', 'Wireframe', 'Colour', 'Final'];
  const NOTES = p => ['Line pass of the real screen', `${p.wire.length} boxes · hierarchy first`, `${p.pal.length} swatches · ${p.type[1]}`, 'As shipped'];
  const DESC = [
    'The first pass. Rough lines over the layout, so ideas stay cheap to change before any pixels are pushed.',
    'Boxes only. Hierarchy, spacing and flow are settled here with no colour to distract from them.',
    'Palette and type are decided on their own sheet, then laid over the boxes.',
    'The shipped screen, built and tested to match every layer underneath it.'
  ];
  const DETAILS = (p, i) => [
    [['Source', p.phones ? `${p.phones.length} app screens` : 'Home screen'], ['Frame', p.dims.join(' × ')], ['Method', 'Line trace of the shipped UI']],
    [['Boxes', String(p.wire.length)], ['Grid', '160 × 100 units'], ['Settles', 'Layout · spacing · flow']],
    [['Palette', `<span class="sws">${p.pal.map(c => `<i style="--c:${c[0]}" title="${c[1]} ${c[0]}"></i>`).join('')}</span>`], ['Names', p.pal.map(c => c[1]).join(', ')], ['Type', p.type[1]]],
    [['Built with', p.stack.join(' · ')], ['Status', p.status], ['Kind', p.kind]]
  ][i];
  const SUB = p => ['Traced from the real screen', `${p.wire.length} boxes · hierarchy first`, p.pal.map(c => c[1]).join(' · '), p.stack.join(' · ')];
  const VIZ = (p, i) => [
    '<svg viewBox="0 0 120 14"><path d="M0 7 C10 1 20 13 30 7 S50 1 60 7 S80 13 90 7 S110 1 120 7"/></svg>',
    p.wire.map(() => '<i></i>').join(''),
    p.pal.map(c => `<i class="sw" style="--c:${c[0]}"></i>`).join(''),
    p.stack.map(s => `<em>${s}</em>`).join('')
  ][i];
  // where each label's line touches its layer (percent of the layer), and which side of the screen the label sits on
  const ANCH = [[30, 40, 'l', 1], [20, 22, 'l', 0], [9, 86, 'r', 1], [72, 30, 'r', 0]];
  const pad = n => String(n).padStart(2, '0');
  let autoOnInit = true;
  const intro = document.getElementById('intro'), stack = document.getElementById('stack'), scene = document.getElementById('scene');
  const ctag = intro.querySelector('.cursor-tag'), hintEl = document.getElementById('layerHint');
  const hud = document.getElementById('hud'), hudLinks = hud.querySelector('.hud-links'), hudLabels = hud.querySelector('.hud-labels');
  const closeBtn = intro.querySelector('.hud-close'), vpanel = document.getElementById('vpanel');
  const CHROME = ['.intro-copy', '.picker', '.intro-top', '.intro-enter', '.layer-hint'];
  const narrow = () => innerWidth < 900;
  const FOCUS_SC_D = .7; let FOCUS_SC = FOCUS_SC_D;
  const wantId = new URLSearchParams(location.search).get('project');
  const wanted = Math.max(0, PROJECTS.findIndex(p => p.href === 'projects.html?p=' + wantId));
  let cur = wantId ? wanted : 0, open = root.classList.contains('intro-on'), busy = false, tl = null, opening = null;

  const rects = (p, fill) => `<svg viewBox="0 0 160 100" preserveAspectRatio="none">${p.wire.map((r, i) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="${fill ? 1.2 : .6}"${fill ? ` fill="${p.pal[i % p.pal.length][0]}"` : ''}/>`).join('')}</svg>`;
  const shots = (p, dir) => p.phones ? `<div class="phones">${p.phones.map(n => `<img src="assets/${dir}/${n}.jpg" alt="" draggable="false">`).join('')}</div>` : `<img src="assets/${dir}/${p.img}.jpg" alt="" draggable="false">`;
  const content = (p, i) => [
    shots(p, 'sketch'),
    rects(p, false),
    rects(p, true) + `<div class="swatches">${p.pal.map(c => `<span style="--c:${c[0]}">${c[0]}</span>`).join('')}</div><div class="type-spec">${p.type[0]}<small>${p.type[1]}</small></div>`,
    shots(p, 'shots')
  ][i];
  const tagHTML = (p, i) => `<b>${pad(i + 1)}</b>${LABELS[i]}<em>${NOTES(p)[i]}</em>`;
  stack.innerHTML = KIND.map((k, i) => `<div class="layer ${k}" data-i="${i}"><span class="tag">${tagHTML(PROJECTS[cur], i)}</span><div class="lc">${content(PROJECTS[cur], i)}</div><i class="anc" style="left:${ANCH[i][0]}%;top:${ANCH[i][1]}%"></i></div>`).join('');
  const layers = $('.layer', stack), ancs = $('.anc', stack);
  const paintAccent = p => { intro.style.setProperty('--acc', p.acc); intro.style.setProperty('--acc-rgb', p.rgb); };
  paintAccent(PROJECTS[cur]);

  /* ---------- the picker ---------- */
  const row = document.getElementById('pkRow'), pkNo = document.getElementById('pkNo'), pkTitle = document.getElementById('pkTitle'), pkKind = document.getElementById('pkKind');
  document.getElementById('pkAll').textContent = pad(PROJECTS.length);
  row.innerHTML = PROJECTS.map((p, i) => `<button class="pk-chip" type="button" role="option" aria-selected="${i === cur}" aria-label="${p.name}, ${p.kind}" style="--acc:${p.acc};--acc-rgb:${p.rgb}"><img src="${p.thumb}" alt="" draggable="false"><span class="mono">${pad(i + 1)}</span><i class="pk-timer"></i></button>`).join('');
  const chips = [...row.children];
  pkNo.textContent = pad(cur + 1); pkTitle.textContent = PROJECTS[cur].name; pkKind.textContent = PROJECTS[cur].kind;
  if (wantId) autoOnInit = false;

  /* ---------- the pose of the stack ---------- */
  const S = { rx: 56, rz: -36, gap: 24, sc: 1, follow: 1, tag: 0, fan: 0, orbit: 0 };
  const drops = layers.map(() => ({ z: 0 }));
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, near: 0, tnear: 0 };
  let running = true, frame = 0, hudOn = false; const t0 = performance.now();
  let live = { rx: 0, rz: 0, gap: 0 };
  const render = now => {
    ptr.x += (ptr.tx - ptr.x) * .07; ptr.y += (ptr.ty - ptr.y) * .07; ptr.near += (ptr.tnear - ptr.near) * .08;
    const t = (now - t0) / 1000, f = S.follow, o = S.orbit, idle = 1 - o;
    const rx = S.rx + (-ptr.y * (10 + 22 * o) + Math.sin(t * .6) * 1.5 * idle) * f;
    const rz = S.rz + (ptr.x * (12 + 34 * o) + Math.sin(t * .45) * 2 * idle) * f;
    const gap = S.gap + ptr.near * 30 * f * idle;
    live = { rx, rz, gap };
    stack.style.transform = `translateY(${(Math.sin(t * .8) * 6 * f * idle).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${S.sc.toFixed(4)})`;
    layers.forEach((l, i) => {
      const k = i - 1.5;
      l.style.transform = `translate3d(${(-k * S.fan * 7).toFixed(2)}%, ${(-k * S.fan * 4).toFixed(2)}%, ${(k * gap + drops[i].z).toFixed(1)}px)`;
    });
    stack.style.setProperty('--tag', S.tag.toFixed(2));
    if (hudOn) drawHud();
  };
  const loop = now => { render(now); if (running) requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  /* ---------- the breakdown HUD ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  let marks = [], slots = [];
  const scramble = el => {
    const end = el.dataset.t || (el.dataset.t = el.textContent), glyphs = '▓▒░/<>01#_';
    let n = 0; const steps = 14;
    const go = () => { n++; el.textContent = end.split('').map((c, i) => (c === ' ' || i < end.length * n / steps) ? c : glyphs[(Math.random() * glyphs.length) | 0]).join(''); if (n < steps) setTimeout(go, 32); else el.textContent = end; };
    go();
  };
  const buildHud = () => {
    const p = PROJECTS[cur];
    hud.querySelector('.hud-no').innerHTML = `<b>${pad(cur + 1)}</b> / ${pad(PROJECTS.length)} · ${p.kind}`;
    hud.querySelector('.hud-name').textContent = p.name;
    hudLabels.innerHTML = LABELS.map((l, i) => `<div class="hl ${ANCH[i][2]}"><div class="hl-head"><span class="hl-no mono">${pad(i + 1)}</span><strong class="hl-t">${l}</strong></div><span class="hl-d">${SUB(p)[i]}</span>${i === 2 ? `<span class="hl-x">${VIZ(p, 2)}</span>` : ''}</div>`).join('');
    hudLinks.innerHTML = '';
    marks = LABELS.map(() => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = '<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><circle class="halo" r="6"/><circle class="dot" r="2.5"/>';
      hudLinks.appendChild(g);
      return { g, path: g.querySelector('path'), halo: g.querySelector('.halo'), dot: g.querySelector('.dot') };
    });
    placeLabels();
  };
  const placeLabels = () => {
    const els = $('.hl', hudLabels); if (!els.length) return;
    const w = stack.offsetWidth, cx = innerWidth / 2, cy = innerHeight / 2, lw = els[0].offsetWidth;
    const reach = w * FOCUS_SC * .86 + 30;
    const lx = Math.max(24, cx - reach - lw), rx = Math.min(innerWidth - 24 - lw, cx + reach);
    slots = els.map((el, i) => {
      const [, , side, low] = ANCH[i];
      const x = side === 'l' ? lx : rx, y = cy + (low ? 90 : -Math.min(170, innerHeight * .24));
      el.style.left = x + 'px'; el.style.top = y + 'px';
      return { x: side === 'l' ? x + lw + 10 : x - 10, y: y + 12, side };
    });
  };
  const drawHud = () => {
    marks.forEach((m, i) => {
      const s = slots[i]; if (!s) return;
      const a = ancs[i].getBoundingClientRect(), ax = a.left, ay = a.top;
      const ex = s.side === 'l' ? s.x + 48 : s.x - 48;
      m.path.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)} L${ex.toFixed(1)} ${s.y} L${s.x} ${s.y}`);
      [m.halo, m.dot].forEach(c => { c.setAttribute('cx', ax); c.setAttribute('cy', ay); });
      m.g.style.opacity = layers[i].classList.contains('out') ? .2 : 1;
    });
  };
  const revealHud = () => {
    gsap.fromTo(marks.map(m => m.path), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .9, stagger: .1, ease: 'power2.inOut' });
    gsap.fromTo(marks.map(m => m.dot), { opacity: 0 }, { opacity: 1, duration: .3, stagger: .1 });
    const els = $('.hl', hudLabels);
    gsap.fromTo(els, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6, stagger: .1, ease: 'power3.out', delay: .45,
      onStart: () => els.forEach(el => $('.hl-d', el).forEach(scramble)) });
    gsap.fromTo([hud.querySelector('.hud-title'), hud.querySelector('.hud-help')], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .2 });
  };

  /* ---------- switching projects ---------- */
  let swapping = false, autoOn = motion && autoOnInit, autoTween = null;
  const stopAuto = () => { autoOn = false; if (autoTween) autoTween.kill(); chips.forEach(c => (c.querySelector('.pk-timer').style.transform = 'scaleX(0)')); };
  const startAuto = () => {
    if (!autoOn || !hasGsap) return;
    autoTween = gsap.fromTo(chips[cur].querySelector('.pk-timer'), { scaleX: 0 }, { scaleX: 1, duration: 5.5, ease: 'none', onComplete: () => show((cur + 1) % PROJECTS.length) });
  };
  const show = (n, user) => {
    if (user) stopAuto();
    if (n === cur || swapping) return;
    if (float) putBack(true);
    swapping = true; const p = PROJECTS[n]; cur = n;
    chips.forEach((c, i) => { c.setAttribute('aria-selected', i === n); if (i !== n) c.querySelector('.pk-timer').style.transform = 'scaleX(0)'; });
    const chip = chips[n]; row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
    pkNo.textContent = pad(n + 1);
    paintAccent(p);
    const swapText = () => { pkTitle.textContent = p.name; pkKind.textContent = p.kind; };
    const fill = () => { layers.forEach((l, i) => { l.querySelector('.lc').innerHTML = content(p, i); l.querySelector('.tag').innerHTML = tagHTML(p, i); }); if (broken) { buildHud(); revealHud(); } };
    if (!hasGsap) { swapText(); fill(); swapping = false; return; }
    gsap.timeline().to([pkTitle, pkKind], { opacity: 0, y: -10, duration: .2, ease: 'power2.in' }).add(swapText).to([pkTitle, pkKind], { opacity: 1, y: 0, duration: .45, ease: 'power3.out' });
    const lcs = layers.map(l => l.querySelector('.lc'));
    gsap.timeline({ onComplete: () => { swapping = false; if (!broken) startAuto(); } })
      .to(lcs.slice().reverse(), { opacity: 0, y: -26, duration: .28, stagger: .06, ease: 'power2.in' })
      .add(fill)
      .fromTo(lcs, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .5, stagger: .07, ease: 'power3.out' });
  };
  chips.forEach((c, i) => c.addEventListener('click', e => { e.stopPropagation(); show(i, true); }));
  intro.querySelector('.pk-prev').addEventListener('click', e => { e.stopPropagation(); show((cur + PROJECTS.length - 1) % PROJECTS.length, true); });
  intro.querySelector('.pk-next').addEventListener('click', e => { e.stopPropagation(); show((cur + 1) % PROJECTS.length, true); });
  PROJECTS.slice(1).forEach(p => (p.phones || [p.img]).forEach(n => ['sketch', 'shots'].forEach(d => { const im = new Image(); im.src = `assets/${d}/${n}.jpg`; })));

  /* ---------- press: the stack moves to the centre, everything else steps away, and it breaks down ---------- */
  let broken = false, focusTl = null;
  const HINTS = { idle: '', broken: 'Drag a layer out · tap empty space to close', viewing: 'Drag it back, or tap outside to place it' };
  const setHint = () => { hintEl.textContent = float && inspecting != null ? HINTS.viewing : broken ? HINTS.broken : HINTS.idle; };
  const setBroken = (on, fast, cb) => {
    if (on === broken) { cb && cb(); return; }
    broken = on; stopAuto(); intro.classList.toggle('broken', on);
    stack.setAttribute('aria-pressed', on);
    if (!hasGsap) { cb && cb(); return; }
    if (focusTl) focusTl.kill();
    const sr = scene.getBoundingClientRect(), x0 = gsap.getProperty(scene, 'x'), y0 = gsap.getProperty(scene, 'y');
    const dx = on ? innerWidth / 2 - (sr.left - x0 + sr.width / 2) : 0, dy = on ? innerHeight / 2 - (sr.top - y0 + sr.height / 2) : 0;
    FOCUS_SC = narrow() ? .9 : Math.min(FOCUS_SC_D, (innerWidth - 560) / (stack.offsetWidth * 1.15));
    if (on) { buildHud(); hudOn = true; }
    focusTl = gsap.timeline({ onComplete: () => { if (!on) hudOn = false; cb && cb(); } })
      .to(CHROME, { autoAlpha: on ? 0 : 1, y: on ? -12 : 0, duration: on ? .45 : .5, stagger: on ? .03 : 0, ease: 'power2.inOut' }, 0)
      .to(scene, { x: dx, y: dy, duration: on ? 1.05 : .8, ease: 'expo.inOut' }, 0)
      .to(S, { gap: on ? 92 : 24, fan: on ? 1 : 0, orbit: on ? 1 : 0, rx: on ? 58 : 56, rz: on ? -30 : -36, sc: on ? FOCUS_SC : 1, tag: on && narrow() ? 1 : 0, duration: on ? 1.2 : .7, ease: 'expo.out', overwrite: 'auto' }, on ? .2 : 0)
      .to(hud, { autoAlpha: on ? 1 : 0, duration: on ? .4 : .3 }, on ? .55 : 0)
      .to(closeBtn, { autoAlpha: on ? 1 : 0, duration: .35 }, on ? .7 : 0);
    if (on) focusTl.add(revealHud, .6);
    if (fast) focusTl.timeScale(2.2);
    setHint();
  };
  closeBtn.addEventListener('click', e => { e.stopPropagation(); if (float) putBack(); setBroken(false); });

  /* ---------- pull a layer out to inspect it; drag it back to place it ---------- */
  let float = null, inspecting = null, drag = null, justDragged = false, qx = null, qy = null;
  const VW = () => narrow() ? innerWidth * .9 : Math.min(innerWidth - 580, 920);
  const viewPos = () => narrow() ? { x: innerWidth / 2, y: innerHeight * .3 } : { x: (innerWidth - 400) / 2 + 20, y: innerHeight * .53 };
  const homeOf = i => { const r = layers[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: Math.max(.2, r.width / VW() * .8) }; };
  const fillFloat = (el, i) => {
    const p = PROJECTS[cur];
    el.className = `float-sheet ${KIND[i]}${el.classList.contains('viewing') ? ' viewing' : ''}`;
    el.setAttribute('aria-label', `${p.name}, layer ${i + 1}: ${LABELS[i]}`);
    el.innerHTML = `<div class="lc">${content(p, i)}</div><i class="fs-brk"></i><i class="fs-brk"></i><i class="fs-brk"></i><i class="fs-brk"></i><span class="fs-w"><em>${p.dims[0]}</em></span><span class="fs-h"><em>${p.dims[1]}</em></span>`;
  };
  const panel = i => {
    const p = PROJECTS[cur];
    vpanel.innerHTML = `<div class="vp-top mono"><span><b>${pad(i + 1)}</b> / ${pad(LABELS.length)} · ${p.name}</span><span>Layer</span></div>
      <h3 class="vp-title">${LABELS[i]}</h3>
      <div class="vp-steps">${LABELS.map((l, j) => `<button type="button" data-j="${j}" aria-label="Show the ${l} layer" aria-current="${j === i}"></button>`).join('')}</div>
      <p class="vp-desc">${DESC[i]}</p>
      <dl class="vp-dl">${DETAILS(p, i).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <div class="vp-nav"><button type="button" class="vp-prev" aria-label="Previous layer">←</button><button type="button" class="vp-next" aria-label="Next layer">→</button><button type="button" class="vp-back">Place back</button></div>
      ${i === 3 ? `<a class="vp-case" href="${p.href}">Open the case study →</a>` : ''}`;
    vpanel.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => switchLayer(+b.dataset.j)));
    vpanel.querySelector('.vp-prev').addEventListener('click', () => switchLayer((inspecting + 3) % 4));
    vpanel.querySelector('.vp-next').addEventListener('click', () => switchLayer((inspecting + 1) % 4));
    vpanel.querySelector('.vp-back').addEventListener('click', () => putBack());
  };
  const showPanel = on => { if (hasGsap) gsap.to(vpanel, { autoAlpha: on ? 1 : 0, x: on ? 0 : 24, duration: on ? .5 : .25, ease: on ? 'power3.out' : 'power2.in', delay: on ? .25 : 0, overwrite: 'auto' }); };
  const makeFloat = i => {
    const el = document.createElement('div');
    el.setAttribute('role', 'dialog'); el.tabIndex = -1;
    fillFloat(el, i); el.style.setProperty('--vw', VW() + 'px');
    intro.appendChild(el);
    const h = homeOf(i);
    gsap.set(el, { xPercent: -50, yPercent: -50, x: h.x, y: h.y, scale: h.s, rotation: -14, opacity: 0, transformPerspective: 1400 });
    qx = gsap.quickTo(el, 'x', { duration: .35, ease: 'power3' }); qy = gsap.quickTo(el, 'y', { duration: .35, ease: 'power3' });
    layers[i].classList.add('out'); intro.classList.add('inspecting');
    float = el; inspecting = i; setHint();
    el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); drag = { x0: e.clientX, y0: e.clientY, lx: e.clientX, moved: false, onFloat: true }; });
    return el;
  };
  const view = () => {
    if (!float) return;
    float.classList.add('viewing'); panel(inspecting); showPanel(true);
    const v = viewPos();
    gsap.to(float, { x: v.x, y: v.y, scale: 1, rotation: 0, rotationY: 0, opacity: 1, duration: .85, ease: 'expo.out', overwrite: 'auto' });
    setHint(); float.focus({ preventScroll: true });
  };
  const inspect = i => { if (float) putBack(true); makeFloat(i); gsap.to(float, { opacity: 1, duration: .2 }); view(); };
  const switchLayer = j => {
    if (!float || j === inspecting) return;
    const el = float;
    gsap.to(el, { rotationY: 90, duration: .22, ease: 'power2.in', onComplete: () => {
      layers[inspecting].classList.remove('out'); inspecting = j; layers[j].classList.add('out');
      fillFloat(el, j); panel(j);
      gsap.fromTo(el, { rotationY: -90 }, { rotationY: 0, duration: .45, ease: 'power3.out' });
    } });
  };
  const putBack = instant => {
    if (!float) return;
    const el = float, i = inspecting, h = homeOf(i);
    float = null; inspecting = null; intro.classList.remove('inspecting'); el.classList.remove('viewing'); showPanel(false);
    const fin = () => { el.remove(); layers[i].classList.remove('out'); };
    if (instant || !hasGsap) { fin(); gsap.set(vpanel, { autoAlpha: 0 }); }
    else gsap.to(el, { x: h.x, y: h.y, scale: h.s, rotation: -14, rotationY: 0, opacity: 0, duration: .6, ease: 'power3.inOut', overwrite: 'auto', onComplete: fin });
    setHint(); stack.focus({ preventScroll: true });
  };
  layers.forEach((l, i) => l.addEventListener('pointerdown', e => {
    if (!broken || busy || float) return;
    e.preventDefault(); drag = { i, x0: e.clientX, y0: e.clientY, lx: e.clientX, moved: false, onFloat: false };
  }));
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
      drag.moved = true;
      const small = (stack.offsetWidth * .62) / VW();
      if (!drag.onFloat) { makeFloat(drag.i); gsap.to(float, { opacity: 1, scale: small, rotation: 0, duration: .35, ease: 'power3.out' }); }
      else { float.classList.remove('viewing'); showPanel(false); gsap.to(float, { scale: small, duration: .35, ease: 'power3.out' }); }
    }
    if (drag.moved && float) {
      qx(e.clientX); qy(e.clientY);
      const vx = e.clientX - drag.lx; drag.lx = e.clientX;
      gsap.to(float, { rotation: Math.max(-12, Math.min(12, vx * .6)), duration: .4, ease: 'power2.out', overwrite: false });
    }
  });
  addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved) { if (d.onFloat) view(); return; }
    justDragged = true; setTimeout(() => (justDragged = false), 60);
    const r = stack.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const near = Math.hypot(e.clientX - cx, e.clientY - cy) < Math.max(r.width, r.height) * .38;
    near ? putBack() : view();
  });

  /* ---------- the little label beside the cursor ---------- */
  const tx = hasGsap ? gsap.quickTo(ctag, 'x', { duration: .25, ease: 'power3' }) : null, ty = hasGsap ? gsap.quickTo(ctag, 'y', { duration: .25, ease: 'power3' }) : null;
  const tagFor = el => {
    if (busy || !open) return '';
    if (el.closest('.vpanel, .hud-close, .picker, .intro-top, .intro-enter')) return '';
    if (el.closest('.float-sheet')) return 'Drag back to place it';
    if (float) return 'Click to place it back';
    if (broken) return el.closest('.layer') ? 'Drag out · click to inspect' : 'Click to close';
    return '';
  };
  intro.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const label = tagFor(e.target);
    ctag.classList.toggle('on', !!label); if (label && ctag.textContent !== label) ctag.textContent = label;
    if (tx) { tx(e.clientX + 18); ty(e.clientY + 18); }
  });
  intro.addEventListener('pointerleave', () => ctag.classList.remove('on'));
  addEventListener('pointermove', e => {
    if (!open) return;
    ptr.tx = e.clientX / innerWidth - .5; ptr.ty = e.clientY / innerHeight - .5;
    const r = scene.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    ptr.tnear = Math.max(0, 1 - Math.hypot(e.clientX - cx, e.clientY - cy) / (r.width * .45));
  }, { passive: true });
  addEventListener('resize', () => { if (broken) { placeLabels(); if (hasGsap) { const sr = scene.getBoundingClientRect(), x0 = gsap.getProperty(scene, 'x'), y0 = gsap.getProperty(scene, 'y'); gsap.set(scene, { x: innerWidth / 2 - (sr.left - x0 + sr.width / 2), y: innerHeight / 2 - (sr.top - y0 + sr.height / 2) }); } } });

  /* ---------- clicks inside the intro ---------- */
  intro.addEventListener('pointerdown', e => { if (!e.target.closest('.picker')) stopAuto(); });
  intro.addEventListener('click', e => {
    if (busy || justDragged) return;
    if (e.target.closest('.picker, .intro-top, .intro-enter, .float-sheet, .vpanel, .hud-close')) return;
    if (float) { putBack(); return; }
    const onLayer = e.target.closest('.layer');
    if (!broken) return;   // the breakdown now lives in How it works
    if (onLayer) inspect(+onLayer.dataset.i); else setBroken(false);
  });

  /* ---------- entering and leaving (scroll only) ---------- */
  const lock = on => { root.classList.toggle('intro-on', on); const L = window.ndLenis; if (L) on ? L.stop() : L.start(); };
  // the exit: the layers fold flat into one sheet, the finished screen comes forward, and you pass through it into the page
  const LEAD = ['.lead-kick', '.lead-name', '.lead-line', '.cover-actions', '.cover-meta'];
  const build = () => {
    if (tl) tl.kill();
    gsap.set(scene, { left: 0, x: 0, y: 0 });
    const sr = stack.getBoundingClientRect(), dx = innerWidth / 2 - (sr.left + sr.width / 2), dy = innerHeight / 2 - (sr.top + sr.height / 2);
    tl = gsap.timeline({ paused: true })
      .to(S, { follow: 0, duration: .4, ease: 'power2.out' }, 0)
      .to(CHROME, { opacity: 0, y: -14, duration: .35, stagger: .03, ease: 'power2.in' }, 0)
      .to(scene, { x: dx, y: dy, duration: .75, ease: 'power3.inOut' }, 0)
      .to(S, { rx: 0, rz: 0, gap: 0, sc: 1.02, duration: .75, ease: 'power3.inOut' }, 0)
      .to('.stack-shadow', { opacity: 0, duration: .3 }, 0)
      .to(layers.slice(0, 3), { opacity: 0, duration: .3, ease: 'power1.out' }, .5)
      .to(S, { sc: 2.6, duration: .75, ease: 'power2.in' }, .8)
      .to(intro, { opacity: 0, duration: .5, ease: 'power1.in' }, 1.05);
  };
  const enter = () => {
    if (!open || !hasGsap) return;
    if (opening && opening.progress() < 1) { opening.progress(1); busy = false; }
    if (busy) return;
    busy = true; stopAuto(); ctag.classList.remove('on');
    if (float) putBack(true);
    const go = () => {
      scrollTo(0, 0); window.ndLenis && ndLenis.scrollTo(0, { immediate: true });
      build();
      tl.eventCallback('onReverseComplete', null);
      tl.eventCallback('onComplete', () => { gsap.set(intro, { autoAlpha: 0 }); running = false; lock(false); busy = false; open = false; document.getElementById('lead-name').focus({ preventScroll: true }); });
      tl.call(() => gsap.fromTo(LEAD, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'power3.out' }), null, 1.1);
      tl.play(0);
    };
    if (broken) setBroken(false, true, go); else go();
  };
  const replay = () => {
    if (open || busy) return;
    busy = true; open = true; lock(true); running = true; requestAnimationFrame(loop);
    if (!tl) build();
    gsap.set(intro, { visibility: 'visible' });
    tl.eventCallback('onComplete', null);
    tl.eventCallback('onReverseComplete', () => { busy = false; setHint(); startAuto(); });
    tl.reverse();
  };

  if (motion && hasGsap) {
    gsap.set(scene, { left: 0, position: 'relative' });
    gsap.set([hud, closeBtn, vpanel], { autoAlpha: 0 });
    if (!open) { build(); tl.progress(1).pause(); gsap.set(intro, { autoAlpha: 0 }); busy = false; running = false; }
    else {
      // the opening: a drafting line is drawn, lifts away, and the four sheets are laid down one by one
      const arriving = root.classList.contains('tx-hold');
      const quick = !!wantId;
      gsap.set(layers, { opacity: 0 }); drops.forEach((d, i) => (d.z = 420 + i * 70));
      gsap.set(['.intro-top', '.picker', '.intro-enter', '.it-role', '.layer-hint'], { opacity: 0 });
      gsap.set('.it-name .ln > span', { yPercent: 110 });
      gsap.set(['.intro-grid', '.stack-shadow'], { opacity: 0 });
      Object.assign(S, { rx: 72, rz: -64, sc: .86, gap: 60 });
      busy = true;
      opening = gsap.timeline({ delay: arriving ? .7 : .2, onComplete: () => { busy = false; if (!wantId) startAuto(); } })
        .to('.intro-grid', { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0)
        .to('.boot-line', { scaleX: quick ? 0 : 1, duration: quick ? .01 : .9, ease: 'expo.inOut' }, 0)
        .to('.boot-label', { opacity: 1, duration: .4 }, .3)
        .to('.boot-label', { opacity: 0, duration: .3 }, .95)
        .to('.boot-line', { scaleX: 0, transformOrigin: '100% 50%', duration: .6, ease: 'expo.in' }, 1.0)
        .to(layers, { opacity: 1, duration: .45, stagger: .16, ease: 'power1.out' }, 1.15)
        .to(drops, { z: 0, duration: 1.2, stagger: .16, ease: 'expo.out' }, 1.15)
        .to(S, { rx: 56, rz: -36, sc: 1, gap: 24, duration: 2.1, ease: 'expo.out' }, 1.1)
        .to('.stack-shadow', { opacity: .9, duration: 1.2 }, 1.4)
        .to('.it-name .ln > span', { yPercent: 0, duration: 1.1, stagger: .1, ease: 'expo.out' }, 1.6)
        .to(['.it-role', '.intro-top', '.picker', '.intro-enter', '.layer-hint'], { opacity: 1, duration: .8, stagger: .08, ease: 'power2.out' }, 1.9);
    }
    setHint();

    addEventListener('wheel', e => {
      if (root.classList.contains('panel-open')) return;
      if (open) { e.preventDefault(); if (e.deltaY > 4) enter(); return; }
      if (scrollY <= 2 && e.deltaY < -10) replay();
    }, { passive: false });
    let ty0 = null, tSkip = false;
    addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; tSkip = !!e.target.closest('.scene, .float-sheet, .pk-row, .vpanel'); }, { passive: true });
    addEventListener('touchmove', e => {
      if (ty0 == null) return;
      const dy = ty0 - e.touches[0].clientY;
      if (open) { if (e.target.closest('.pk-row, .vpanel')) return; e.preventDefault(); if (!tSkip && dy > 30) { enter(); ty0 = null; } }
      else if (scrollY <= 2 && dy < -70) { replay(); ty0 = null; }
    }, { passive: false });
    addEventListener('keydown', e => {
      if (!open) return;
      if (e.key === 'Escape') { if (float) putBack(); else if (broken) setBroken(false); return; }
      if (busy && !(opening && opening.progress() < 1)) return;
      const onStack = e.target === stack, onButton = e.target.closest && e.target.closest('button, a');

      if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !onButton)) { e.preventDefault(); enter(); return; }
      if (float && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { switchLayer((inspecting + (e.key === 'ArrowRight' ? 1 : 3)) % 4); return; }
      if (e.key === 'ArrowRight') show((cur + 1) % PROJECTS.length, true);
      if (e.key === 'ArrowLeft') show((cur + PROJECTS.length - 1) % PROJECTS.length, true);
      if (broken && /^[1-4]$/.test(e.key)) inspect(+e.key - 1);
    });
    intro.querySelector('.intro-enter').addEventListener('click', e => { e.stopPropagation(); enter(); });
    document.addEventListener('click', e => {
      const m = e.target.closest('.rail-mark'); if (!m) return;
      e.preventDefault(); e.stopPropagation();
      if (open) return;
      (window.ndLenis ? ndLenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)); requestAnimationFrame(replay);
    }, true);
    document.querySelector('.replay').addEventListener('click', () => { (window.ndLenis ? ndLenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)); requestAnimationFrame(replay); });
  } else {
    lock(false); intro.hidden = true;
    document.querySelector('.replay').hidden = true;
  }

  /* =====================================================================
     01  plates on the light table
     ===================================================================== */
  const lights = [];
  $('.plate').forEach(plate => {
    const glass = plate.querySelector('.glass');
    glass.insertAdjacentHTML('beforeend', '<i class="g-scan" aria-hidden="true"></i>');
    const st = { p: 0 };
    const set = () => glass.style.setProperty('--p', st.p.toFixed(4));
    const light = on => {
      plate.classList.toggle('lit', on);
      if (!motion || !hasGsap) { st.p = on ? 1 : 0; set(); return; }
      gsap.to(st, { p: on ? 1 : 0, duration: on ? 1.1 : .6, ease: on ? 'power2.inOut' : 'power2.out', onUpdate: set, overwrite: true });
    };
    glass.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') light(true); });
    glass.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') light(false); });
    glass.addEventListener('focus', () => light(true)); glass.addEventListener('blur', () => light(false));
    lights.push({ plate, light });
  });
  if (!fine && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { const l = lights.find(x => x.plate === e.target); if (l) l.light(e.isIntersecting); }), { threshold: .55 });
    lights.forEach(l => io.observe(l.plate));
  }

  /* the desk preview is rendered at desktop size, then scaled to fit its frame */

  /* small lights: the desk, the legend rows, the certificates */
  $('.desk-plate, .lg-row, .home .cert').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* the closing line inks under the cursor */
  const big = document.getElementById('bigInk');
  big.addEventListener('pointermove', e => { const r = big.getBoundingClientRect(); big.style.setProperty('--mx', (e.clientX - r.left) + 'px'); big.style.setProperty('--my', (e.clientY - r.top) + 'px'); big.style.setProperty('--r2', '150px'); });
  big.addEventListener('pointerleave', () => big.style.setProperty('--r2', '0px'));

  /* =====================================================================
     02  how it works: one screen (Cinematheque's home page) taken apart layer by layer as you scroll
     ===================================================================== */
  const howP = PROJECTS.find(p => p.name === 'Cinematheque') || PROJECTS[0];
  const howSec = document.getElementById('process'), howStack = document.getElementById('howStack');
  howSec.style.setProperty('--acc', howP.acc); howSec.style.setProperty('--acc-rgb', howP.rgb);
  // what each layer shows, pointed out with a line: [x %, y % on the screen, label, detail]
  const ANNS = [
    [[14, 5, 'Header', 'Logo and nav, roughed in'], [26, 28, 'Hero', 'The film title, biggest of all'], [72, 36, 'Poster', 'Beside the title, 3 : 4'], [22, 78, 'Below', 'Screenings, then the schedule']],
    [[75, 5, 'Nav', 'Links, top right'], [50, 34, 'Hero block', '136 × 50 on a 160 × 100 grid'], [17, 49, 'One action', 'Book seats, nothing beside it'], [30, 95, 'Cards', 'Three across, same height']],
    [[17, 49, 'Ember', 'Only on the one action'], [72, 36, 'Poster', 'Framed in the accent'], [12, 92, 'Palette', 'Ink · Ember · Paper · Brass'], [90, 92, 'Type', 'Display · 64 / 600']],
    [[26, 28, 'Title', '64 / 600, as designed'], [17, 49, 'Book seats', '44 px tall, easy to hit'], [72, 36, 'Poster', 'The real one, 3 : 4'], [60, 82, 'Shipped', '129 tests passing']]
  ];
  // the stack, with a small anchor on each part a line will point to
  howStack.innerHTML = KIND.map((k, i) => `<div class="layer ${k}"><div class="lc">${content(howP, i)}</div>${ANNS[i].map(([x, y]) => `<i class="hpt" style="left:${x}%;top:${y}%"></i>`).join('')}</div>`).join('');
  const hLayers = [...howStack.children], hPanels = $('.how-panels li'), hTabs = $('.how-tabs button'), hBar = howSec.querySelector('.how-bar i'), hPct = howSec.querySelector('.how-pct');
  const lines = document.getElementById('howLines'), anns = document.getElementById('howAnns'), detail = howSec.querySelector('.how-detail');
  // the pose: closed for the brief, opened into layers, closed again at the end.
  // `OUT` is how far each layer has come out; `away` moves the whole stack aside (to the left, smaller) while one is out.
  const H = { rx: 8, rz: 0, gap: 0, sc: .94, away: 0 }, OUT = [0, 0, 0, 0];
  const hScene = howSec.querySelector('.how-scene'), copyCol = howSec.querySelector('.how-left');
  let annOn = -1, annEls = [];
  const rad = d => d * Math.PI / 180;
  // a screen-space offset, expressed in the stack's own (rotated, scaled) space: undo rotateX then rotateZ, then the scale
  const toLocal = (x, y, z, s) => {
    const ax = rad(-H.rx), az = rad(-H.rz);
    const y1 = y * Math.cos(ax) - z * Math.sin(ax), z1 = y * Math.sin(ax) + z * Math.cos(ax);
    const x2 = x * Math.cos(az) - y1 * Math.sin(az), y2 = x * Math.sin(az) + y1 * Math.cos(az);
    return [x2 / s, y2 / s, z1 / s];
  };
  const renderHow = () => {
    const W = detail.clientWidth, Hh = detail.clientHeight, a = H.away;
    // where the stack sits: centre stage, or aside in the bottom-left corner under the text
    const d = detail.getBoundingClientRect(), c = copyCol.getBoundingClientRect();
    const asideX = (c.left + c.width * .5) - (d.left + W * .5), asideY = Hh * .24;
    const px = asideX * a, py = asideY * a, ps = 1 - .45 * a;
    hScene.style.transform = `translate(-50%, -50%) translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(${ps.toFixed(4)})`;
    howStack.style.transform = `rotateX(${H.rx.toFixed(2)}deg) rotateZ(${H.rz.toFixed(2)}deg) scale(${H.sc.toFixed(4)})`;
    const any = Math.max(...OUT), total = ps * H.sc;
    // where a pulled layer lands: facing you, left of the labels, a little larger than the stack
    const want = Math.min(W * .56, Hh * .62 * 1.6, 620), tx = W * .5 - (W * .5 + px), ty = Hh * .5 - (Hh * .52 + py), [lx, ly, lz] = toLocal(tx, ty, 30, total), big = want / (howStack.offsetWidth || want) / total;
    hLayers.forEach((l, i) => {
      const o = OUT[i], k = i - 1.5, bz = k * H.gap;
      const x = lx * o, y = ly * o, z = bz + (lz - bz) * o, sc = 1 + (big - 1) * o;
      l.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${(-H.rz * o).toFixed(2)}deg) rotateX(${(-H.rx * o).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      l.style.opacity = (1 - (any - o) * .7).toFixed(3);
      l.style.zIndex = o > .01 ? 5 : '';
    });
    if (annOn >= 0) placeAnns();
  };
  // the lines: from each anchor on the slid-out layer to its label in the column on the right
  // the lines: scattered around the layer. Parts in its top half get a label above it, the bottom half below it,
  // each label near its own part, spread apart so none overlap
  const placeAnns = () => {
    const d = detail.getBoundingClientRect(), card = hLayers[annOn].getBoundingClientRect();
    const cT = card.top - d.top, cB = card.bottom - d.top, cL = card.left - d.left, cR = card.right - d.left, mid = (cT + cB) / 2;
    const pts = [...hLayers[annOn].querySelectorAll('.hpt')].map(p => { const r = p.getBoundingClientRect(); return [r.left - d.left, r.top - d.top]; });
    const GAP = 190;
    ['t', 'b'].forEach(side => {
      const ids = pts.map((p, k) => k).filter(k => (pts[k][1] < mid) === (side === 't')).sort((a, b) => pts[a][0] - pts[b][0]);
      let last = -Infinity;
      ids.forEach(k => {
        const el = annEls[k]; if (!el) return;
        const [px, py] = pts[k];
        let lx = Math.max(cL, Math.min(cR - 150, px - 8)); if (lx < last + GAP) lx = last + GAP; last = lx;
        const edge = side === 't' ? cT - 16 : cB + 16;
        el.path.setAttribute('d', `M${px.toFixed(1)} ${py.toFixed(1)} L${px.toFixed(1)} ${edge.toFixed(1)} L${(lx + 4).toFixed(1)} ${edge.toFixed(1)}`);
        el.dot.setAttribute('cx', px.toFixed(1)); el.dot.setAttribute('cy', py.toFixed(1)); el.ring.setAttribute('cx', px.toFixed(1)); el.ring.setAttribute('cy', py.toFixed(1));
        el.label.className = 'how-ann ' + side;
        el.label.style.left = lx + 'px'; el.label.style.top = (side === 't' ? edge - 8 - el.label.offsetHeight : edge + 8) + 'px';
      });
    });
  };
  const clearAnns = () => { annOn = -1; annEls = []; lines.innerHTML = ''; anns.innerHTML = ''; };
  const drawAnns = n => {
    clearAnns(); if (n < 1) return;
    annOn = n - 1;
    annEls = ANNS[annOn].map(([, , label, text]) => {
      const ns = 'http://www.w3.org/2000/svg', path = document.createElementNS(ns, 'path'), ring = document.createElementNS(ns, 'circle'), dot = document.createElementNS(ns, 'circle');
      ring.setAttribute('class', 'ring'); ring.setAttribute('r', 7); dot.setAttribute('r', 2.6);
      lines.append(path, ring, dot);
      const el = document.createElement('div'); el.className = 'how-ann'; el.innerHTML = `<b>${label}</b><span>${text}</span>`; anns.appendChild(el);
      return { path, ring, dot, label: el };
    });
    placeAnns();
    if (hasGsap && motion) annEls.forEach((e, k) => {
      const len = e.path.getTotalLength();
      gsap.fromTo(e.path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: .6, delay: .05 + k * .09, ease: 'power2.out' });
      gsap.fromTo([e.dot, e.ring], { opacity: 0 }, { opacity: 1, duration: .3, delay: k * .09 });
      gsap.fromTo(e.label, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .5, delay: .3 + k * .09, ease: 'power2.out' });
    }); else annEls.forEach(e => (e.label.style.opacity = 1));
  };
  // one layer at a time: the last one slides home, then the next slides out and its lines draw
  let howNow = -1, move = null;
  const pullOut = n => {
    if (move) move.kill();
    clearAnns();
    const layer = n >= 1 && n <= 4 ? n - 1 : -1;
    if (!hasGsap || !motion) { OUT.fill(0); if (layer >= 0) OUT[layer] = 1; H.away = layer >= 0 ? 1 : 0; renderHow(); drawAnns(layer + 1); return; }
    const from = OUT.slice(), back = { k: 0 }, homeNeeded = from.some((v, i) => v > .01 && i !== layer);
    move = gsap.timeline({ onUpdate: renderHow });
    // the layer that was out goes home first
    if (homeNeeded) move.to(back, { k: 1, duration: .6, ease: 'power2.inOut', onUpdate: () => from.forEach((v, i) => { if (i !== layer) OUT[i] = v * (1 - back.k); }) });
    if (layer >= 0) {
      move.to(H, { away: 1, duration: .7, ease: 'power3.inOut' }, homeNeeded ? '-=.35' : 0)
          .to(OUT, { [layer]: 1, duration: .95, ease: 'power3.inOut' }, homeNeeded ? '-=.3' : '-=.45')
          .call(() => drawAnns(layer + 1));
    } else {
      move.to(H, { away: 0, duration: .8, ease: 'power3.inOut' }, homeNeeded ? '-=.2' : 0);   // back to centre, still in 3D
    }
  };
  const setHow = n => {
    if (n === howNow) return; howNow = n;
    const m = Math.min(4, n);   // step 5 is "done": the last panel stays, and the stack goes back together
    hPanels.forEach((li, i) => li.classList.toggle('on', i === m));
    hTabs.forEach((b, i) => i === m ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    pullOut(n);
  };
  const howProgress = p => { hBar.style.width = (p * 100).toFixed(1) + '%'; hPct.textContent = Math.round(p * 100) + '%'; setHow(p > .95 ? 5 : Math.min(4, Math.floor(p * 5))); };
  renderHow(); setTimeout(() => { if (howNow < 0) setHow(0); }, 0);
  addEventListener('resize', () => { if (annOn >= 0) placeAnns(); });

  /* =====================================================================
     scroll motion
     ===================================================================== */
  if (!motion || !hasGsap) {
    Object.assign(H, { rx: 56, rz: -36, gap: 40, sc: 1 }); renderHow(); setHow(1);
    hTabs.forEach((b, i) => b.addEventListener('click', () => { setHow(i); hBar.style.width = ((i + 1) * 20) + '%'; hPct.textContent = ((i + 1) * 20) + '%'; }));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  $('.sec-head .rule').forEach(r => gsap.from(r, { scaleX: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 90%', once: true } }));
  const rise = $('[data-rise]');
  gsap.set(rise, { opacity: 0, y: 40 });
  ScrollTrigger.batch(rise, { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .08, overwrite: true }) });

  const wraps = $('.plate-wrap');
  const stackMQ = matchMedia('(min-width: 1001px)');
  wraps.forEach((w, i) => {
    const plate = w.querySelector('.plate');
    gsap.from(plate, { y: 80, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: w, start: 'top 92%', once: true } });
    if (i < wraps.length - 1 && stackMQ.matches) { const dim = document.createElement('i'); dim.className = 'plate-dim'; plate.appendChild(dim);
      gsap.timeline({ scrollTrigger: { trigger: wraps[i + 1], start: 'top bottom', end: 'top 10%', scrub: .4 } }).to(plate, { scale: .94, ease: 'none', force3D: true }, 0).to(dim, { opacity: .55, ease: 'none' }, 0); }
  });

  // the stack opens as the work starts and closes once it has shipped; the layers themselves are pulled out step by step
  const hTl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onUpdate: renderHow });
  hTl.to(H, { rx: 56, rz: -36, gap: 40, sc: 1, duration: .8 }, .2).to(H, { gap: 40, duration: 3.3 }, 1).to(H, { gap: 8, duration: .5 }, 4.5);
  const pin = ScrollTrigger.create({
    trigger: '.how-pin', start: 'top top', end: () => '+=' + Math.round(innerHeight * 3.4), pin: '.how-pin', anticipatePin: 1, scrub: .6, invalidateOnRefresh: true,
    animation: hTl, onUpdate: s => howProgress(s.progress)
  });
  hTabs.forEach((b, i) => b.addEventListener('click', () => {
    const y = pin.start + (pin.end - pin.start) * ((i + .5) / 5);
    window.ndLenis ? ndLenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
  }));

  $('.seal').forEach((s, i) => gsap.from(s, { opacity: 0, scale: 1.8, rotate: -12, duration: .5, delay: .25 + i * .12, ease: 'back.out(2)', scrollTrigger: { trigger: '.cert-row', start: 'top 80%', once: true } }));
  gsap.fromTo(big, { '--fill': '0%' }, { '--fill': '115%', duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: big, start: 'top 75%', once: true } });

  // nav.js starts smooth scroll before this file runs: hold it while the intro is up
  if (open && window.ndLenis) ndLenis.stop();

  addEventListener('load', () => {
    ScrollTrigger.refresh();
    const id = location.hash.slice(1);
    if (id && document.getElementById(id) && window.ndScrollTo) requestAnimationFrame(() => window.ndScrollTo(id, true));
  });
})();
