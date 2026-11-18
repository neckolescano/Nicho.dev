/* Shared by every sheet: vellum/blueprint switch, motion switch, drafting crosshair,
   the sheet border and title block, page transitions, and each page's small interactions. */
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const motionOn = () => root.classList.contains('motion');

  /* ---------- sheet border + crosshair ---------- */
  document.body.insertAdjacentHTML('beforeend',
    '<div class="sheetframe" aria-hidden="true"></div>');
  if (false) {   // the coordinate crosshair was retired: it made the sheets busier than they need to be
    const h = document.querySelector('.xh.h'), v = document.querySelector('.xh.v'), xy = document.querySelector('.xy');
    const pad = n => String(Math.max(0, Math.round(n))).padStart(4, '0');
    addEventListener('pointermove', e => {
      root.classList.add('xh-on');
      h.style.transform = `translateY(${e.clientY}px)`; v.style.transform = `translateX(${e.clientX}px)`;
      const flipX = e.clientX > innerWidth - 150, flipY = e.clientY > innerHeight - 40;
      xy.style.transform = `translate(${e.clientX + (flipX ? -128 : 10)}px, ${e.clientY + (flipY ? -20 : 8)}px)`;
      xy.textContent = `X ${pad(e.clientX)} · Y ${pad(e.clientY + scrollY)}`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('xh-on'));
  }

  /* ---------- title block at the foot of every inner sheet ---------- */
  const SHEETS = { projects: ['A-101', 'Projects'], about: ['A-102', 'About'], skills: ['A-103', 'Skills'], certifications: ['A-104', 'Certifications'], contact: ['A-105', 'Contact'] };
  const slug = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  const main = document.querySelector('main.page');
  if (main && SHEETS[slug]) main.dataset.frame = `${SHEETS[slug][1]} — Desktop 1440`;
  if (main && SHEETS[slug]) main.insertAdjacentHTML('beforeend',
    `<footer class="tblock"><table><tr><td><small>Project</small>Nicho.dev</td><td><small>Drawn by</small>N. Lescano</td><td><small>Scale</small>1 : 1</td><td><small>Rev.</small>2026.11</td><td><small>Sheet</small><span class="big">${SHEETS[slug][0]}</span></td><td><small>Title</small><span class="big">${SHEETS[slug][1]}</span></td></tr></table></footer>`);

  /* ---------- desk light under the sheet, following the pointer ---------- */
  if (main) {
    document.body.insertAdjacentHTML('afterbegin', '<div class="plamp" aria-hidden="true"></div>');
    const lamp = document.querySelector('.plamp'), m = { x: innerWidth / 2, y: innerHeight * .3, tx: innerWidth / 2, ty: innerHeight * .3 };
    addEventListener('pointermove', e => { m.tx = e.clientX; m.ty = e.clientY; }, { passive: true });
    const tick = () => { m.x += (m.tx - m.x) * .1; m.y += (m.ty - m.y) * .1; lamp.style.setProperty('--mx', m.x.toFixed(1) + 'px'); lamp.style.setProperty('--my', m.y.toFixed(1) + 'px'); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ---------- vellum / blueprint ---------- */
  const themeBtns = $('[data-theme-toggle]');
  const paintTheme = () => themeBtns.forEach(b => { const s = b.querySelector('span'); if (s) s.textContent = root.dataset.theme === 'dark' ? 'Switch to daylight' : 'Switch to lamp light'; });
  themeBtns.forEach(b => b.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('theme', root.dataset.theme); paintTheme();
  }));
  paintTheme();

  /* ---------- motion switch ---------- */
  $('[data-motion-toggle]').forEach(b => {
    const s = b.querySelector('span'); if (s) s.textContent = motionOn() ? 'Turn motion off' : 'Turn motion on';
    b.setAttribute('aria-pressed', motionOn());
    b.addEventListener('click', () => { store.set('motion', motionOn() ? 'off' : 'on'); location.reload(); });
  });

  /* leaving a page is handled by js/nav.js (the sheet transition) */
  addEventListener('pageshow', e => { if (e.persisted) { $('.cover').forEach(c => c.remove()); $('.drawer.open').forEach(d => d.classList.remove('open')); } });

  /* ---------- cards lean toward the pointer ---------- */
  if (finePointer) $('.cert[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });

  /* ---------- projects: one build at a time, with its film ---------- */
  $('.media video').forEach(v => v.addEventListener('click', () => (v.paused ? v.play() : v.pause())));
  const tabs = $('.proj-tab');
  const show = id => {
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.proj === id));
    $('.proj').forEach(p => {
      const on = p.id === id; p.hidden = !on;
      const v = p.querySelector('video');
      if (v) { if (on) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); }
    });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  };
  const one = new URLSearchParams(location.search).get('p');
  if (tabs.length && tabs.some(t => t.dataset.proj === one)) {
    // opened from one sheet on the desk: this page shows only that project
    const tab = tabs.find(t => t.dataset.proj === one), name = tab.querySelector('strong').textContent;
    document.body.classList.add('single');
    $('.proj').forEach(p => { const on = p.id === one; p.hidden = !on; const v = p.querySelector('video'); if (v && on) v.play().catch(() => {}); });
    const h = document.querySelector('.h-display'); if (h) h.firstChild.textContent = name;
    const k = document.querySelector('.kicker'); if (k) k.textContent = `Sheet A-101.${tabs.indexOf(tab) + 1} — Project`;
    document.title = `${name} — Nicho.dev`;
  } else if (tabs.length) {
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.proj)));
    const first = location.hash.slice(1);
    show(tabs.some(t => t.dataset.proj === first) ? first : tabs[0].dataset.proj);
    addEventListener('load', () => scrollTo(0, 0));   // a #project link should still open at the top of the sheet
  }

  /* ---------- skills: mark what each build used ---------- */
  const pills = $('.pill[data-used]'), trays = document.querySelector('.trays'), note = document.querySelector('.skill-note');
  pills.forEach(p => p.addEventListener('click', () => {
    const on = p.getAttribute('aria-pressed') !== 'true';
    pills.forEach(q => q.setAttribute('aria-pressed', q === p && on));
    const used = on ? p.dataset.used.split('|') : [];
    trays.classList.toggle('filtering', on);
    let n = 0;
    $('.chip', trays).forEach(c => { const hit = used.includes(c.textContent.trim()); c.classList.toggle('used', hit); if (hit) n++; });
    note.textContent = on ? `Note: ${n} of these went into ${p.textContent.trim()}.` : '';
  }));

  /* ---------- scroll: things rise into place as they come into view ---------- */
  // on the plain sheets, every block rises in as you reach it
  $('.page:not(.cs-page) > *, .about-grid aside > *, .about-grid > div > *, .good > div, .rows > div, .trays > .tray, .filter, .certs > .cert, .contact > *, .contact-row > *').forEach(el => el.classList.add('rv'));
  const reveal = $('.rv, .step');
  if (motionOn() && 'IntersectionObserver' in window) {
    root.classList.add('rv-on');
    const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveal.forEach((el, i) => { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); ro.observe(el); });
  }

  /* numbers count up once they are seen */
  const counters = $('[data-count]');
  const countUp = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    if (!motionOn()) { el.textContent = end + suf; return; }
    const tick = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } }), { threshold: .6 });
    counters.forEach(c => co.observe(c));
  } else counters.forEach(c => (c.textContent = c.dataset.count + (c.dataset.suffix || '')));

  /* a thin line across the top shows how far down the sheet you are; the film grows as it arrives */
  const bar = document.querySelector('.scrollbar i'), film = document.getElementById('film');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (film && motionOn()) {
      const r = film.getBoundingClientRect(), k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .9)));
      film.style.setProperty('--p', k.toFixed(3));
    }
  };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* ---------- contact: copy the email ---------- */
  const copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click', async () => {
    const out = document.querySelector('.copied');
    try { await navigator.clipboard.writeText(copy.dataset.copy); out.textContent = 'Copied to clipboard.'; }
    catch { out.textContent = copy.dataset.copy; }
  });
})();
