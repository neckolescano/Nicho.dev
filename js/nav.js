/* Shared by every page: the side rail with its knob, the index panel, Lenis smooth scroll,
   and the sheet transition (a drafting grid fills from where you clicked, then clears to build the next sheet). */
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const file = location.pathname.split('/').pop() || 'index.html';
  const isHome = file === 'index.html';
  const home = isHome ? '' : 'index.html';
  const store = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} }, del: k => { try { sessionStorage.removeItem(k); } catch {} } };

  /* where each link leads, for the transition caption */
  const NAMES = { 'index.html': ['A-100', 'Cover'], 'projects.html': ['A-101', 'Projects'], 'about.html': ['A-102', 'About'], 'skills.html': ['A-103', 'Skills'],
    'certifications.html': ['A-104', 'Certifications'], 'contact.html': ['A-105', 'Contact'], 'resume.html': ['R-001', 'Resume'], 'desk.html': ['C-001', 'The room'] };
  const CASES = { kuwago: 'kuwaGO', cinematheque: 'Cinematheque', xpera: 'xpera CRM' };
  const nameOf = url => {
    const f = url.pathname.split('/').pop() || 'index.html', p = url.searchParams.get('p');
    if (f === 'projects.html' && CASES[p]) return ['A-101.' + (Object.keys(CASES).indexOf(p) + 1), CASES[p]];
    return NAMES[f] || ['Sheet', 'Next'];
  };

  /* ---------- build the rail and the panel ---------- */
  const SECTIONS = [['work', 'Work', 'Three builds'], ['process', 'Process', 'Brief to ship'], ['about', 'About', 'Who I am'],
    ['skills', 'Skills', 'Tools I use'], ['certs', 'Certificates', 'Certiport'], ['contact', 'Contact', 'Say hello']];
  const CASE_ROWS = [['kuwago', 'kuwaGO', 'Mobile app', 'assets/cs/kuwago-garden.jpg', '#5BB06A'], ['cinematheque', 'Cinematheque', 'Web system', 'assets/cs/cinematheque-title.jpg', '#E2763F'],
    ['xpera', 'xpera CRM', 'Desktop system', 'assets/cs/xpera-logo.jpg', '#F4506A']];
  const MORE = [['projects.html', 'All projects'], ['about.html', 'Profile'], ['skills.html', 'Skills'], ['certifications.html', 'Certificates'], ['resume.html', 'Resume'], ['desk.html', 'The room']];
  const motionIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c3-6 6-6 9 0s6 6 9 0"/></svg>';
  const pad = n => String(n).padStart(2, '0');
  const isCur = h => h === file || h === file + location.search;

  document.body.classList.add('has-rail');
  document.body.insertAdjacentHTML('afterbegin', `
<a class="skip" href="#main">Skip to content</a>
<aside class="rail" aria-label="Site">
  <a class="rail-mark" href="${home || 'index.html'}" aria-label="Nicho.dev, back to the start"><svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><path class="mk-crop" d="M3 9V3h6M31 3h6v6M37 31v6h-6M9 37H3v-6"/><path class="mk-guide" d="M8 6.5L31 35"/><path class="mk-n" d="M10 30V10h5l8 12V10h5v20h-5l-8-12v12z"/><path class="mk-base" d="M8 33.5h18M8 32v3M26 32v3"/><rect class="mk-dot" x="30" y="26.5" width="3.5" height="3.5"/></svg></a>
  <button class="rail-menu" aria-expanded="false" aria-controls="panel"><span class="burger" aria-hidden="true"><i></i><i></i></span><span class="rail-word">Index</span></button>
  <div class="rail-tools">
    <button class="rtool" data-motion-toggle>${motionIcon}<span class="sr">Motion</span></button>
  </div>
</aside>
<div class="scrim" aria-hidden="true"></div>
<div class="panel" id="panel" role="dialog" aria-modal="true" aria-label="Index" tabindex="-1" data-lenis-prevent inert>
  <div class="panel-head"><span class="mono">Index</span><button class="panel-close mono" type="button">Close <kbd>Esc</kbd></button></div>
  <nav class="p-sec" aria-label="Sections">
    <p class="p-label mono">On the main page</p>
    <ol class="p-list">${SECTIONS.map(([id, t, d], i) => `<li style="--i:${i}"><a href="${home}#${id}" data-id="${id}"><span class="p-no mono">${pad(i + 1)}</span><span class="p-t">${t}</span><span class="p-d mono">${d}</span></a></li>`).join('')}</ol>
  </nav>
  <nav class="p-cases" aria-label="Case studies">
    <p class="p-label mono">Case studies</p>
    ${CASE_ROWS.map(([id, n, k, img, acc], i) => `<a class="p-case" href="projects.html?p=${id}" style="--acc:${acc};--i:${i + 6}"${isCur('projects.html?p=' + id) ? ' aria-current="page"' : ''}><img src="${img}" alt="" loading="lazy"><span><strong>${n}</strong><small class="mono">${k}</small></span><i aria-hidden="true">→</i></a>`).join('')}
  </nav>
  <nav class="p-more" aria-label="More pages">
    <p class="p-label mono">More</p>
    <div>${MORE.map(([h, t]) => `<a class="mono" href="${h}"${isCur(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</div>
  </nav>
  <div class="p-foot">
    <div class="mono"><a href="mailto:neckolescano36@gmail.com">Email ↗</a><a href="https://github.com/neckolescano" target="_blank" rel="noopener">GitHub ↗</a><a href="assets/Nicho-Lescano-Resume.pdf" download>Resume ↓</a></div>
    <div class="p-tools"><button class="p-tool mono" type="button" data-motion-toggle><span>Motion</span></button></div>
  </div>
</div>`);

  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
  else if (main && main.id !== 'main') document.querySelector('.skip').href = '#' + main.id;

  /* ---------- panel open / close ---------- */
  const menu = document.querySelector('.rail-menu'), panel = document.getElementById('panel');
  let lenis = null;
  const setPanel = open => {
    root.classList.toggle('panel-open', open);
    menu.setAttribute('aria-expanded', open);
    panel.inert = !open;
    if (open) { lenis && lenis.stop(); setTimeout(() => panel.focus({ preventScroll: true }), 60); }
    else { lenis && lenis.start(); }
  };
  menu.addEventListener('click', () => setPanel(!root.classList.contains('panel-open')));
  panel.querySelector('.panel-close').addEventListener('click', () => { setPanel(false); menu.focus(); });
  document.querySelector('.scrim').addEventListener('click', () => setPanel(false));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && root.classList.contains('panel-open')) { setPanel(false); menu.focus(); }
    if (e.key === 'Tab' && root.classList.contains('panel-open')) {   // keep focus inside the open panel
      const f = [...panel.querySelectorAll('a, button')], first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- smooth scroll ---------- */
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    window.ndLenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToId = (id, instant) => {
    const el = document.getElementById(id); if (!el) return false;
    if (lenis) lenis.scrollTo(el, { duration: instant ? 0 : 1.6, immediate: !!instant, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: motion && !instant ? 'smooth' : 'auto' });
    return true;
  };
  window.ndScrollTo = scrollToId;

  /* ---------- the Index marks the section you are reading ---------- */
  window.ndSetNow = () => {};
  if (isHome && 'IntersectionObserver' in window) {
    const links = [...panel.querySelectorAll('.p-list a')];
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.toggleAttribute('aria-current', a.dataset.id === e.target.id));
    }), { rootMargin: '-45% 0px -54% 0px' });
    SECTIONS.forEach(([id]) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- the sheet transition ---------- */
  const ink = () => getComputedStyle(root).getPropertyValue('--line').trim() || '#161B26';
  const ease = t => 1 - Math.pow(1 - t, 3);
  const layout = (ox, oy) => {
    const s = innerWidth < 760 ? 34 : 52, cols = Math.ceil(innerWidth / s), rows = Math.ceil(innerHeight / s), cells = [];
    let max = 1;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = Math.hypot(c * s + s / 2 - ox, r * s + s / 2 - oy); if (d > max) max = d; cells.push([c * s, r * s, d]);
    }
    cells.forEach(k => (k[2] = k[2] / max * 0.6 + Math.random() * 0.1));
    return { s, cells };
  };
  const canvas = () => {
    const c = document.createElement('canvas'), d = Math.min(devicePixelRatio || 1, 2);
    c.className = 'tx'; c.setAttribute('aria-hidden', 'true'); c.width = innerWidth * d; c.height = innerHeight * d;
    document.body.appendChild(c); const g = c.getContext('2d'); g.scale(d, d); return [c, g];
  };
  const caption = (no, name) => {
    const el = document.createElement('div'); el.className = 'tx-cap'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<b>${no}</b>${name}`; document.body.appendChild(el); return el;
  };
  // one frame of the grid. dir 1: squares grow to cover; dir -1: squares shrink to reveal
  const draw = (g, s, cells, t, dir, col) => {
    g.clearRect(0, 0, innerWidth, innerHeight); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1;
    for (const [x, y, d] of cells) {
      const p = (t - d) / 0.3;
      if (dir > 0) {
        if (p >= 1) { g.fillRect(x, y, s + .5, s + .5); continue; }
        if (p > -0.35 && p < 0.4) {   // a registration mark arrives just before the square
          const a = p < 0 ? (p + 0.35) / 0.35 : 1 - p / 0.4, m = s * .16, cx = x + s / 2, cy = y + s / 2;
          g.globalAlpha = a; g.beginPath(); g.moveTo(cx - m, cy); g.lineTo(cx + m, cy); g.moveTo(cx, cy - m); g.lineTo(cx, cy + m); g.stroke(); g.globalAlpha = 1;
        }
        if (p > 0) { const z = s * ease(p); g.fillRect(x + (s - z) / 2, y + (s - z) / 2, z, z); }
      } else {
        if (p <= 0) { g.fillRect(x, y, s + .5, s + .5); continue; }
        if (p < 1) { const z = s * (1 - ease(p)); g.fillRect(x + (s - z) / 2, y + (s - z) / 2, z, z); }
        if (p > 0.5 && p < 1.4) {   // the mark stays behind for a moment as the sheet appears
          const a = p < 1 ? (p - .5) * 2 * .5 : (1.4 - p) / .4 * .5, m = s * .12, cx = x + s / 2, cy = y + s / 2;
          g.globalAlpha = a; g.beginPath(); g.moveTo(cx - m, cy); g.lineTo(cx + m, cy); g.moveTo(cx, cy - m); g.lineTo(cx, cy + m); g.stroke(); g.globalAlpha = 1;
        }
      }
    }
  };
  const run = (dir, ox, oy, dur, label, done, colour) => {
    const [c, g] = canvas(), { s, cells } = layout(ox, oy), col = colour || ink(), t0 = performance.now(), end = dir > 0 ? 1 : 1.18;
    const cap = label ? caption(label[0], label[1]) : null;
    if (cap) requestAnimationFrame(() => cap.classList.toggle('on', dir > 0));
    if (cap && dir < 0) cap.classList.add('on');
    if (dir < 0) { draw(g, s, cells, 0, -1, col); root.classList.remove('tx-hold'); setTimeout(() => cap && cap.classList.remove('on'), 120); }
    const step = now => {
      const t = (now - t0) / dur * end;
      draw(g, s, cells, t, dir, col);
      if (t < end) requestAnimationFrame(step);
      else { if (dir < 0) { c.remove(); cap && cap.remove(); } done && done(c, cap); }
    };
    requestAnimationFrame(step);
  };

  window.ndPixels = run;

  // arriving: clear the ink from where the last click was
  const saved = store.get('nd-tx'); store.del('nd-tx');
  if (motion && root.classList.contains('tx-hold')) {
    let o = { x: .5, y: .5, no: 'A-100', name: 'Nicho.dev' };
    try { if (saved) o = JSON.parse(saved); } catch {}
    run(-1, o.x * innerWidth, o.y * innerHeight, 900, [o.no, o.name]);
    if (isHome) store.set('nd-seen', '1');
  } else root.classList.remove('tx-hold');

  // leaving: cover from the click, then go
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download') || !/^https?:|^file:/.test(a.href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage && url.hash) {   // a section on this sheet: glide to it
      const id = url.hash.slice(1);
      if (document.getElementById(id)) { e.preventDefault(); setPanel(false); scrollToId(id); history.replaceState(null, '', url.hash); }
      return;
    }
    if (samePage) { e.preventDefault(); setPanel(false); lenis ? lenis.scrollTo(0, { duration: 1.4 }) : scrollTo(0, 0); return; }
    if (!motion) return;
    e.preventDefault();
    let x = e.clientX, y = e.clientY;
    if (!e.detail) { const r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }   // keyboard: start from the link itself
    const label = nameOf(url);
    store.set('nd-tx', JSON.stringify({ x: x / innerWidth, y: y / innerHeight, no: label[0], name: label[1] }));
    lenis && lenis.stop();
    run(1, x, y, 720, label, () => (location.href = a.href));
  });

  // back/forward from the cache: take away any leftover ink
  addEventListener('pageshow', e => { if (e.persisted) { document.querySelectorAll('.tx, .tx-cap').forEach(n => n.remove()); root.classList.remove('tx-hold'); lenis && lenis.start(); } });
})();
