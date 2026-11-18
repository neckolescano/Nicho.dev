/* The studio desk: "I draw it, I design it, I build it."
   A glass desk in one 3D scene. Every object does one job:
     drawing tablet  -> doodle on it; its tab opens About        (the artist)
     monitor         -> drop a project proof on it to load it     (the designer and programmer)
     drawer          -> envelopes of project proofs               (the archive)
     wall board      -> Certifications · pen cup -> Skills · phone -> Contact */
(() => {
  const root = document.documentElement;
  const room = document.getElementById('room');
  if (!room) return;
  const small = matchMedia('(max-width: 820px), (max-height: 520px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const motionOn = () => root.classList.contains('motion');
  const how = document.getElementById('how');
  const W = 1240, D = 760, FW = 820, FD = 600, TW = 380, TH = 250;
  const MOVE = 1100;
  let store; try { store = sessionStorage; } catch { store = null; }

  /* ---------- the work: three projects, each an envelope of proofs ---------- */
  const P = [
    { id: 'kuwago', no: '01', t: 'kuwaGO', kind: 'Mobile app', tall: true, at: [40, 232, -3], proofs: [['kuwago-home', 'Home · 390×844'], ['kuwago-timer', 'Focus · 390×844'], ['kuwago-flashcard', 'Flashcards · 390×844']] },
    { id: 'cinematheque', no: '02', t: 'Cinematheque', kind: 'Web system', at: [290, 240, 2], proofs: [['cinematheque-home', 'Home · 1440×900'], ['cinematheque-seats', 'Seats · 1440×900'], ['cinematheque-staff-dashboard', 'Staff · 1440×900']] },
    { id: 'xpera', no: '03', t: 'xpera CRM', kind: 'Desktop system', at: [540, 228, -2], proofs: [['xpera-sales', 'Sales · 1782×1053'], ['xpera-customers', 'Customers · 1782×1053'], ['xpera-payments', 'Payments · 1782×1053']] }
  ];
  const CARDS = new Map();
  P.forEach(p => p.proofs.forEach((x, i) => { const c = { p, i, shot: x[0], cap: x[1], key: `${p.id}-${i}` }; p.cards = p.cards || []; p.cards.push(c); CARDS.set(c.key, c); }));
  const href = p => `projects.html?p=${p.id}`;

  const proofHTML = c => `<div class="proof${c.p.tall ? ' tall' : ''}"><div class="pf-img"><img src="assets/shots/${c.shot}.jpg" alt="" draggable="false"></div><div class="pf-cap"><i></i><b>${c.p.t}</b><span>${c.cap}</span></div></div>`;
  const envHTML = p => `<div class="ff" data-f="${p.id}" style="left:${p.at[0]}px;top:${p.at[1]}px;--r:${p.at[2]}deg" tabindex="0" role="button" aria-expanded="false" aria-label="${p.t} envelope, ${p.cards.length} proofs">
      <span class="k"></span>
      <span class="sheets">${p.cards.map(c => `<button class="ps" data-k="${c.key}" style="--i:${c.i};--n:${p.cards.length}" tabindex="-1" aria-label="Take out the ${p.t} ${c.cap.split(' ·')[0]} proof">${proofHTML(c)}</button>`).join('')}</span>
      <span class="kf"><span class="bt"></span><span class="lb"><i>${p.no} · ${p.kind}</i><b>${p.t}</b><small>${p.cards.length} proofs</small></span></span>
      <svg class="str" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 4 C 2 10, 2 18, 15 22 C 28 26, 28 34, 15 38 C 2 34, 2 26, 15 22 C 28 18, 28 10, 15 4"/></svg>
      <span class="flap"><i class="fo"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,0 100,0 86,100 14,100"/></svg></i><i class="fi"></i></span>
    </div>`;

  /* ---------- build the scene ---------- */
  room.innerHTML = `<div class="cam" id="cam"><div class="tilt" id="tilt"><div class="world" id="world">
    <div class="wall" id="wall" data-tip="Certifications · on the board" role="link" tabindex="0" aria-label="Open Certifications">
      <span class="mk dk" style="left:0;top:0"></span><span class="mk dk" style="left:1200px;top:0"></span>
      <div class="board">
        <span class="pin-title">Moodboard · 2026</span>
        <figure class="cert c1"><i class="seal"></i><b>HTML and CSS</b><span>IT Specialist</span></figure>
        <figure class="cert c2"><i class="seal"></i><b>Databases</b><span>IT Specialist</span></figure>
        <figure class="cert c3"><i class="seal"></i><b>Java</b><span>IT Specialist</span></figure>
        <figure class="print p1"><img src="assets/shots/kuwago-garden.jpg" alt=""></figure>
        <figure class="print p2"><img src="assets/shots/xpera-customers.jpg" alt=""></figure>
        <span class="chipset"><i style="--c:#C4432D"></i><i style="--c:#161B26"></i><i style="--c:#F3F1EC"></i><i style="--c:#3F8F4E"></i><i style="--c:#EBBC00"></i></span>
        <span class="note n1">ship it,<br>then polish</span>
        <span class="note n2">certified ✓</span>
      </div>
    </div>
    <div class="leg l"></div><div class="leg r"></div><div class="leg bl"></div><div class="leg br"></div>
    <div class="dtop" id="dtop">
      <span class="mk dk" style="left:0;top:0"></span><span class="mk dk" style="left:${W}px;top:0"></span><span class="mk dk" style="left:${W}px;top:${D}px"></span><span class="mk dk" style="left:0;top:${D}px"></span>
      <div class="glass"></div>
      <div class="pad"></div>
      <div class="kbd" aria-hidden="true">${'<i></i>'.repeat(42)}<i class="space"></i></div>
      <div class="mouse" aria-hidden="true"></div>
      <div class="tablet" id="tablet">
        <span class="mk tk" style="left:24px;top:24px"></span><span class="mk tk" style="left:${24 + TW}px;top:24px"></span><span class="mk tk" style="left:${24 + TW}px;top:${24 + TH}px"></span><span class="mk tk" style="left:24px;top:${24 + TH}px"></span>
        <div class="t-area"><canvas id="ink" width="${TW * 2}" height="${TH * 2}"></canvas>
          <svg class="t-hello" viewBox="0 0 380 250" aria-hidden="true"><text x="34" y="118">hi, I'm Nicho</text><text class="s" x="36" y="170">I draw, design &amp; build things</text></svg></div>
        <span class="t-led"></span>
        <button class="t-tab" id="aboutTab" type="button" data-tip="About me">About me <b>&rarr;</b></button>
      </div>
      <div class="stylus" aria-hidden="true"></div>
      <a class="phone" id="phone" href="contact.html" data-tip="Contact · say hi" aria-label="Open Contact" draggable="false">
        <span class="ph-screen"><span class="ph-time">9:41</span><span class="ph-note"><b>New message</b>Let's build something.</span><span class="ph-note n2"><b>Email</b>neckolescano36@gmail.com</span></span>
      </a>
      <span class="swatch s1"></span><span class="swatch s2"></span><span class="swatch s3"></span>
      <span class="sticky">drop a project<br>on the screen →</span>
    </div>
    <div class="a-top"></div><div class="a-l"><span class="mk dk" style="left:0;top:134px"></span></div><div class="a-r"><span class="mk dk" style="left:210px;top:134px"></span></div><div class="a-b"></div>
    <div class="mon" id="mon">
      <div class="mon-base"></div><div class="mon-neck"></div>
      <div class="mon-body">
        <span class="mk mm" style="left:16px;top:16px"></span><span class="mk mm" style="left:664px;top:16px"></span><span class="mk mm" style="left:664px;top:394px"></span><span class="mk mm" style="left:16px;top:394px"></span>
        <div class="mon-screen" id="screen">
          <div class="fig" aria-hidden="true">
            <div class="fig-top"><i></i><i></i><i></i><span>portfolio.fig — Nicho Lescano</span><b>Share</b></div>
            <div class="fig-left"><span>Layers</span><em>Frame · Hero</em><em class="in">Name</em><em class="in">Role</em><em>Frame · Work</em><em class="in">kuwaGO</em><em class="in">Cinematheque</em><em class="in">xpera CRM</em></div>
            <div class="fig-canvas"><div class="frame-hero"><span class="fl">Hero — 1440</span><h2>Nicho Lescano</h2><p>UI/UX designer · artist · programmer</p><span class="drop">Drop a project proof here</span></div>
              <span class="cursor"><svg viewBox="0 0 12 16"><path d="M0 0 L0 13 L3.5 10 L6 15.5 L8 14.6 L5.6 9.3 L10 9.3 Z"/></svg><b>Nicho</b></span></div>
          </div>
          <div class="play" id="play" role="link" tabindex="-1">
            <video muted loop playsinline preload="none"></video>
            <div class="play-bar"><span class="mono" id="playNo"></span><b id="playTitle"></b><span class="open">Press to open the case study &rarr;</span><button type="button" id="eject" aria-label="Back to the desk">&times;</button></div>
          </div>
        </div>
        <span class="mon-logo"></span>
      </div>
    </div>
    <div class="cup" id="cup" data-tip="Skills · my tools" role="link" tabindex="0" aria-label="Open Skills">
      <svg viewBox="0 0 110 190" aria-hidden="true">
        <g class="pens"><rect x="22" y="14" width="9" height="96" rx="3" fill="#C4432D" transform="rotate(-10 26 110)"/><rect x="40" y="2" width="9" height="106" rx="3" fill="#2a2f38"/><rect x="58" y="20" width="9" height="90" rx="3" fill="#3F8F4E" transform="rotate(8 62 110)"/><rect x="74" y="30" width="9" height="80" rx="3" fill="#EBBC00" transform="rotate(16 78 110)"/></g>
        <path d="M14 96 H96 L90 184 H20 Z" class="cup-body"/><path d="M14 96 H96" class="cup-rim"/>
        <text x="55" y="146" text-anchor="middle">TOOLS</text>
      </svg>
    </div>
    <div class="drawer" id="drawer">
      <div class="dr-floor" id="floor"><span class="mk wk" style="left:0;top:40px"></span><span class="mk wk" style="left:820px;top:40px"></span>
        <span class="mk fk" style="left:0;top:0"></span><span class="mk fk" style="left:${FW}px;top:0"></span><span class="mk fk" style="left:${FW}px;top:${FD}px"></span><span class="mk fk" style="left:0;top:${FD}px"></span>${P.map(envHTML).join('')}</div>
      <div class="dr-back"></div><div class="dr-wall l"></div><div class="dr-wall r"></div>
      <div class="dr-rim l"></div><div class="dr-rim r"></div><div class="dr-rim b"></div>
      <div class="dr-ftop"></div>
      <button class="dr-front" id="front" aria-expanded="false">
        <span class="holder"><i>Drawer 01</i><b>Projects · proofs</b></span>
        <span class="pull" aria-hidden="true"><i></i></span>
        <span class="state">Open</span>
        <span class="mk wk" style="left:0;top:142px"></span><span class="mk wk" style="left:852px;top:142px"></span>
      </button>
    </div>
  </div></div></div>
  <div class="tip" id="tip" aria-hidden="true"></div>`;
  const $ = s => document.getElementById(s);
  const cam = $('cam'), tilt = $('tilt'), world = $('world'), dtop = $('dtop'), front = $('front'), lamp = $('lamp'), screen = $('screen'), play = $('play'), tip = $('tip');

  /* ---------- camera: the desk, the open drawer, and the monitor ---------- */
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const VIEWS = { desk: { tilt: -28, marks: '.dk', open: null, max: 1.6 }, drawer: { tilt: -50, marks: '.wk', open: true, max: 1.4 }, monitor: { tilt: -8, marks: '.mm', open: null, max: 3 } };
  let view = 'desk', movingUntil = 0;
  const apply = name => {
    const v = VIEWS[name];
    tilt.style.setProperty('--tilt', v.tilt + 'deg');
    cam.style.setProperty('--s', v.s.toFixed(4)); cam.style.setProperty('--tx', v.tx.toFixed(1) + 'px'); cam.style.setProperty('--ty', v.ty.toFixed(1) + 'px');
  };
  const measure = () => {
    if (small.matches) return;
    const wasOpen = room.classList.contains('open');
    document.body.classList.add('measuring');
    world.style.setProperty('--rx', '0deg'); world.style.setProperty('--ry', '0deg');
    for (const [name, v] of Object.entries(VIEWS)) {
      tilt.style.setProperty('--tilt', v.tilt + 'deg');
      if (v.open !== null) room.classList.toggle('open', v.open);
      cam.style.setProperty('--s', 1); cam.style.setProperty('--tx', '0px'); cam.style.setProperty('--ty', '0px');
      const o = centre(cam), pts = [...room.querySelectorAll(v.marks)].map(centre);
      const xs = pts.map(p => p[0] - o[0]), ys = pts.map(p => p[1] - o[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const pad = name === 'monitor' ? 70 : 20, top = 64, availW = innerWidth - pad * 2, availH = innerHeight - top - 14 - (name === 'monitor' ? 40 : 0);
      v.s = Math.min(availW / (maxX - minX), availH / (maxY - minY), v.max);
      v.tx = -v.s * (minX + maxX) / 2;
      v.ty = top + availH / 2 - innerHeight / 2 - v.s * (minY + maxY) / 2;
      room.classList.toggle('open', wasOpen);
    }
    apply(view);
    cam.offsetHeight; document.body.classList.remove('measuring');
  };
  const say = t => { if (how) how.textContent = t; };
  const hint = () => {
    const open = room.classList.contains('open');
    front.querySelector('.state').textContent = !open ? 'Open' : view === 'drawer' ? 'Close' : 'Look inside';
    say(view === 'monitor' ? 'Press the screen to open the case study'
      : view === 'drawer' ? 'Open an envelope · drag a proof up to the monitor'
      : !open ? 'Open the drawer for projects · draw on the tablet'
      : 'Drop a proof on the monitor · move to the bottom edge for the drawer');
    document.body.classList.toggle('edge-up', open && view === 'drawer');
    document.body.classList.toggle('edge-down', open && view === 'desk');
  };
  const setView = name => { if (view === name) return; view = name; movingUntil = performance.now() + (motionOn() ? MOVE : 0); apply(name); hint(); };
  measure();
  addEventListener('resize', measure);
  if (document.fonts) document.fonts.ready.then(measure);

  /* ---------- the drawer ---------- */
  const openDrawer = on => { room.classList.toggle('open', on); front.setAttribute('aria-expanded', on); };
  front.addEventListener('click', () => {
    const open = room.classList.contains('open');
    if (!open) { openDrawer(true); setView('drawer'); }
    else if (view !== 'drawer') setView('drawer');
    else { openDrawer(false); setView('desk'); }
    hint();
  });
  const backToDesk = e => { if (view === 'drawer' && !e.target.closest('.ddoc, .tablet, .phone, .cup')) setView('desk'); };
  dtop.addEventListener('click', backToDesk);
  room.querySelectorAll('.a-top, .a-l, .a-r').forEach(el => el.addEventListener('click', backToDesk));

  /* ---------- screen <-> plane mapping (a homography from four corner markers) ---------- */
  const solve = (A, b) => {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
      for (let r = i + 1; r < n; r++) { const k = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= k * A[i][c]; b[r] -= k * b[i]; }
    }
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; }
    return x;
  };
  const inv3 = m => {
    const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
    return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det], [B / det, (a * i - c * g) / det, -(a * f - c * d) / det], [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
  };
  const applyH = (m, x, y) => { const w = m[2][0] * x + m[2][1] * y + m[2][2]; return [(m[0][0] * x + m[0][1] * y + m[0][2]) / w, (m[1][0] * x + m[1][1] * y + m[1][2]) / w]; };
  const planeMap = (marks, PW, PH) => {
    const src = [[0, 0], [PW, 0], [PW, PH], [0, PH]], dst = marks.map(centre);
    const A = [], b = [];
    src.forEach(([u, v], i) => { const [x, y] = dst[i]; A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x); A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y); });
    const h = solve(A, b), H = [[h[0], h[1], h[2]], [h[3], h[4], h[5]], [h[6], h[7], 1]], Hi = inv3(H);
    const toPlane = (x, y) => {
      const w = Hi[2][0] * x + Hi[2][1] * y + Hi[2][2], [u, v] = applyH(Hi, x, y);
      if (w > 0 && isFinite(u) && isFinite(v) && v > -PH && v < 2 * PH) return [u, v];
      const [tl, tr] = dst, farY = (tl[1] + tr[1]) / 2;
      return [((x - tl[0]) / (tr[0] - tl[0])) * PW, y < farY ? 0 : PH];
    };
    return { toScreen: (u, v) => applyH(H, u, v), toPlane };
  };
  const deskMap = () => planeMap([...dtop.querySelectorAll(':scope > .mk')], W, D);
  const floorMap = () => planeMap([...room.querySelectorAll('.dr-floor .fk')], FW, FD);
  const tabletMap = () => planeMap([...room.querySelectorAll('.tk')], TW, TH);
  const drawerTopY = () => Math.min(...[...room.querySelectorAll('.dr-floor .wk')].map(el => centre(el)[1]));
  const inQuad = (x, y, q) => { let inside = false; for (let i = 0, j = q.length - 1; i < q.length; j = i++) { const [xi, yi] = q[i], [xj, yj] = q[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; } return inside; };
  const overMonitor = (x, y) => inQuad(x, y, [...room.querySelectorAll('.mm')].map(centre));

  /* ---------- opening a page: the camera dives into the thing you pressed ---------- */
  const openPage = (el, to) => {
    if (!motionOn()) return (location.href = to);
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const k = Math.min(innerWidth / r.width, innerHeight / r.height) * 1.25;
    document.body.classList.add('leaving-desk');
    room.style.transformOrigin = `${cx}px ${cy}px`;
    room.classList.add('zoom');
    requestAnimationFrame(() => (room.style.transform = `translate(${innerWidth / 2 - cx}px, ${innerHeight / 2 - cy}px) scale(${k.toFixed(3)})`));
    const fade = document.createElement('div'); fade.className = 'fade'; document.body.append(fade);
    requestAnimationFrame(() => requestAnimationFrame(() => fade.classList.add('on')));
    setTimeout(() => (location.href = to), 880);
  };
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    room.classList.remove('zoom'); room.style.transform = ''; document.body.classList.remove('leaving-desk');
    document.querySelectorAll('.fade').forEach(f => f.remove());
  });

  /* ---------- the monitor: load a project, press to open it ---------- */
  let loaded = null;
  const vid = play.querySelector('video');
  const loadProject = p => {
    loaded = p;
    vid.src = `assets/video/${p.id}.mp4`; vid.poster = `assets/video/${p.id}-poster.jpg`;
    vid.classList.toggle('tall', !!p.tall);
    $('playNo').textContent = `${p.no} · ${p.kind}`; $('playTitle').textContent = p.t;
    screen.classList.add('on'); play.tabIndex = 0;
    vid.currentTime = 0; vid.play().catch(() => {});
    setView('monitor');
  };
  const eject = () => { screen.classList.remove('on'); play.tabIndex = -1; vid.pause(); loaded = null; setView('desk'); };
  $('eject').addEventListener('click', e => { e.stopPropagation(); eject(); });
  play.addEventListener('click', e => { if (loaded && !e.target.closest('#eject')) openPage(screen, href(loaded)); });
  play.addEventListener('keydown', e => { if (e.key === 'Enter' && loaded) openPage(screen, href(loaded)); });
  screen.addEventListener('click', e => { if (!loaded) { screen.classList.remove('nudge'); void screen.offsetWidth; screen.classList.add('nudge'); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && view === 'monitor') eject(); });

  /* ---------- proofs lying on the desk (remembered for this visit) ---------- */
  const placed = new Map();
  const save = () => { if (store) try { store.setItem('studio', JSON.stringify([...placed].map(([k, a]) => [k, parseFloat(a.style.left), parseFloat(a.style.top), a.style.getPropertyValue('--r')]))); } catch {} };
  const SPOTS = [[470, 600], [700, 610], [880, 560], [380, 520], [620, 520]];
  const freeSpot = () => SPOTS.find(([u, v]) => [...placed.values()].every(el => Math.hypot(parseFloat(el.style.left) - u, parseFloat(el.style.top) - v) > 150)) || [600 + (Math.random() - .5) * 300, 590];
  const markEnvelope = p => room.querySelector(`.ff[data-f="${p.id}"]`).classList.toggle('empty', p.cards.every(c => placed.has(c.key)));
  const makeGhost = (c, x, y) => {
    const el = document.createElement('div');
    el.className = 'ghost'; el.innerHTML = proofHTML(c);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.append(el); return el;
  };
  // a proof flies into the monitor and the project loads
  const toMonitor = (c, ghost, done) => {
    const [x, y] = centre(screen);
    const finish = () => { ghost.remove(); if (done) done(); loadProject(c.p); };
    if (!motionOn()) return finish();
    ghost.animate([{}, { left: x + 'px', top: y + 'px', transform: 'translate(-50%, -50%) scale(.4)', opacity: .2 }], { duration: 520, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).onfinish = finish;
  };
  const returnToEnvelope = (c, ghost) => setTimeout(() => {
    const ff = room.querySelector(`.ff[data-f="${c.p.id}"]`), [x, y] = centre(ff.querySelector('.kf'));
    const finish = () => {
      ghost.remove();
      const a = placed.get(c.key); if (a) a.remove();
      placed.delete(c.key);
      room.querySelector(`.ps[data-k="${c.key}"]`).classList.remove('gone', 'carried');
      ff.classList.remove('empty'); save(); hint();
    };
    if (!motionOn()) return finish();
    ghost.animate([{}, { left: x + 'px', top: y + 'px', transform: 'translate(-50%, -50%) rotate(0deg) scale(.45)', opacity: .5 }], { duration: 480, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).onfinish = finish;
  }, Math.max(0, movingUntil - performance.now()) + 20);

  const placeOnDesk = (c, u, v, r, animate = true) => {
    const a = document.createElement('a');
    a.className = 'ddoc' + (animate && motionOn() ? ' drop' : '');
    a.href = href(c.p); a.draggable = false;
    a.setAttribute('aria-label', `${c.p.t} proof: load it on the monitor`);
    a.dataset.tip = 'Press to load it on the monitor';
    a.style.left = u + 'px'; a.style.top = v + 'px';
    a.style.setProperty('--r', r || ((Math.random() - .5) * 10).toFixed(1) + 'deg');
    a.innerHTML = proofHTML(c);
    dtop.append(a); placed.set(c.key, a);
    room.querySelector(`.ps[data-k="${c.key}"]`).classList.add('gone'); markEnvelope(c.p); save();
    a.addEventListener('animationend', () => a.classList.remove('drop'), { once: true });
    // drag it on the desk; onto the monitor loads it; down past the edge sends it back to its envelope
    let g = null;
    const nearEdgeY = () => { const p = [...dtop.querySelectorAll(':scope > .mk')].map(centre); return (p[2][1] + p[3][1]) / 2; };
    const onMove = e => {
      if (!g) return;
      if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 6) { g.moved = true; a.classList.add('lift'); }
      if (!g.moved) return;
      if (!g.ghost && (e.clientY > nearEdgeY() + 24 || overMonitor(e.clientX, e.clientY))) { a.style.visibility = 'hidden'; a.classList.remove('lift'); g.ghost = makeGhost(c, e.clientX, e.clientY); }
      if (g.ghost) {
        g.ghost.style.left = e.clientX + 'px'; g.ghost.style.top = e.clientY + 'px';
        if (view === 'desk' && e.clientY > nearEdgeY() + 24) { openDrawer(true); setView('drawer'); }
        else if (view === 'drawer' && e.clientY < drawerTopY() + 20) setView('desk');
        return;
      }
      const [pu, pv] = g.m.toPlane(e.clientX, e.clientY);
      a.style.left = Math.max(130, Math.min(W - 130, pu + g.du)) + 'px';
      a.style.top = Math.max(90, Math.min(D - 90, pv + g.dv)) + 'px';
    };
    const done = () => { removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); };
    const onUp = e => {
      done();
      const was = g; g = null; a.classList.remove('lift');
      if (!was) return;
      if (was.ghost) {
        const x = e.clientX, y = e.clientY, ghost = was.ghost;
        if (view === 'drawer' && y > drawerTopY()) return returnToEnvelope(c, ghost);
        if (overMonitor(x, y)) return toMonitor(c, ghost, () => { a.style.visibility = ''; });
        return setTimeout(() => { ghost.remove(); a.style.visibility = ''; save(); }, Math.max(0, movingUntil - performance.now()) + 20);
      }
      if (was.moved) return save();
      if (view === 'drawer') return setView('desk');
      const [x, y] = centre(a); toMonitor(c, makeGhost(c, x, y));
    };
    a.addEventListener('dragstart', e => e.preventDefault());
    a.addEventListener('pointerdown', e => {
      if (e.button) return;
      e.preventDefault(); e.stopPropagation();
      const m = deskMap(), [pu, pv] = m.toPlane(e.clientX, e.clientY);
      g = { m, du: parseFloat(a.style.left) - pu, dv: parseFloat(a.style.top) - pv, sx: e.clientX, sy: e.clientY, moved: false, ghost: null };
      addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
    });
    a.addEventListener('click', e => { e.preventDefault(); if (e.detail === 0) { const [x, y] = centre(a); toMonitor(c, makeGhost(c, x, y)); } });
    hint();
    return a;
  };
  if (store) try { (JSON.parse(store.getItem('studio')) || []).forEach(([k, u, v, r]) => CARDS.has(k) && placeOnDesk(CARDS.get(k), u, v, r, false)); } catch {}

  /* ---------- envelopes: open them, move them around the drawer ---------- */
  const toggleEnvelope = (ff, on = !ff.classList.contains('open')) => {
    room.querySelectorAll('.ff.open').forEach(o => { if (o !== ff) { o.classList.remove('open'); o.setAttribute('aria-expanded', false); o.querySelectorAll('.ps').forEach(x => (x.tabIndex = -1)); } });
    ff.classList.toggle('open', on); ff.setAttribute('aria-expanded', on);
    ff.querySelectorAll('.ps').forEach(x => (x.tabIndex = on ? 0 : -1));
    if (on && view !== 'drawer') setView('drawer');
    say(on ? 'Drag a proof up to the monitor · or click it' : 'Open an envelope · drag a proof up to the monitor');
  };
  addEventListener('keydown', e => { if (e.key === 'Escape' && view !== 'monitor') room.querySelectorAll('.ff.open').forEach(o => toggleEnvelope(o, false)); });
  const saveEnvelopes = () => { if (store) try { store.setItem('envelopes', JSON.stringify([...room.querySelectorAll('.ff')].map(f => [f.dataset.f, parseFloat(f.style.left), parseFloat(f.style.top)]))); } catch {} };
  if (store) try { (JSON.parse(store.getItem('envelopes')) || []).forEach(([id, u, v]) => { const f = room.querySelector(`.ff[data-f="${id}"]`); if (f) { f.style.left = u + 'px'; f.style.top = v + 'px'; f.parentNode.append(f); } }); } catch {}
  room.querySelectorAll('.ff').forEach(ff => {
    let g = null;
    const onMove = e => {
      if (!g) return;
      if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 5) { g.moved = true; ff.classList.add('moving'); }
      if (!g.moved) return;
      const [pu, pv] = g.m.toPlane(e.clientX, e.clientY);
      ff.style.left = Math.max(10, Math.min(FW - 260, pu + g.du)) + 'px';
      ff.style.top = Math.max(48, Math.min(FD - 186, pv + g.dv)) + 'px';
    };
    const onUp = () => {
      removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp);
      if (g && g.moved) saveEnvelopes(); else if (g) toggleEnvelope(ff);
      g = null; ff.classList.remove('moving');
    };
    ff.addEventListener('pointerdown', e => {
      if (e.button || (e.target.closest('.ps') && ff.classList.contains('open'))) return;
      e.preventDefault();
      ff.parentNode.append(ff);
      const m = floorMap(), [pu, pv] = m.toPlane(e.clientX, e.clientY);
      g = { m, du: parseFloat(ff.style.left) - pu, dv: parseFloat(ff.style.top) - pv, sx: e.clientX, sy: e.clientY, moved: false };
      addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
    });
    ff.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === ff) { e.preventDefault(); toggleEnvelope(ff); } });
  });

  /* ---------- taking a proof out of an envelope ---------- */
  room.querySelectorAll('.ps').forEach(ps => {
    const c = CARDS.get(ps.dataset.k);
    let g = null;
    const putBack = ghost => {
      const [x, y] = centre(ps);
      if (!motionOn()) { ghost.remove(); ps.classList.remove('carried'); return; }
      ghost.animate([{}, { left: x + 'px', top: y + 'px', transform: 'translate(-50%, -50%) scale(.6)', opacity: .4 }], { duration: 380, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { ghost.remove(); ps.classList.remove('carried'); };
    };
    // a click sends it straight to the monitor
    const send = () => {
      const [x, y] = centre(ps), ghost = makeGhost(c, x, y); ps.classList.add('carried');
      setView('desk');
      setTimeout(() => toMonitor(c, ghost, () => ps.classList.remove('carried')), motionOn() ? MOVE * .8 : 0);
    };
    const onMove = e => {
      if (!g) return;
      if (!g.ghost && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 6) { g.ghost = makeGhost(c, e.clientX, e.clientY); ps.classList.add('carried'); }
      if (!g.ghost) return;
      g.ghost.style.left = e.clientX + 'px'; g.ghost.style.top = e.clientY + 'px';
      if (view === 'drawer' && e.clientY < drawerTopY() + 20) setView('desk');
    };
    const done = () => { removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onCancel); };
    const onCancel = () => { done(); if (g && g.ghost) putBack(g.ghost); g = null; };
    const onUp = e => {
      done();
      const was = g; g = null;
      if (!was) return;
      if (!was.ghost) return send();
      const x = e.clientX, y = e.clientY;
      if (view === 'drawer' && y > drawerTopY()) return putBack(was.ghost);
      setTimeout(() => {
        if (overMonitor(x, y)) return toMonitor(c, was.ghost, () => ps.classList.remove('carried'));
        let [u, v] = deskMap().toPlane(x, y);
        u = Math.max(130, Math.min(W - 130, u)); v = Math.max(90, Math.min(D - 90, v));
        const [tx, ty] = deskMap().toScreen(u, v);
        const land = () => { was.ghost.remove(); ps.classList.remove('carried'); placeOnDesk(c, u, v); };
        if (!motionOn() || Math.hypot(tx - x, ty - y) < 8) return land();
        was.ghost.animate([{}, { left: tx + 'px', top: ty + 'px', transform: 'translate(-50%, -50%) rotate(0deg) scale(.8)' }], { duration: 320, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }).onfinish = land;
      }, Math.max(0, movingUntil - performance.now()) + 20);
    };
    ps.addEventListener('dragstart', e => e.preventDefault());
    ps.addEventListener('pointerdown', e => {
      if (e.button || !ps.closest('.ff').classList.contains('open')) return;
      e.preventDefault(); e.stopPropagation();
      g = { sx: e.clientX, sy: e.clientY, ghost: null };
      addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onCancel);
    });
    ps.addEventListener('click', e => { if (e.detail === 0) send(); });
  });

  /* ---------- the drawing tablet: draw with the pointer; strokes fade like a sketch ---------- */
  const ink = $('ink'), ictx = ink.getContext('2d');
  const tablet = $('tablet');
  let drawing = null, tMap = null;
  const inkColor = () => getComputedStyle(document.body).getPropertyValue('--ink-pen').trim() || '#E8664D';
  const at = e => { const [u, v] = tMap.toPlane(e.clientX, e.clientY); return [u * 2, v * 2]; };
  tablet.addEventListener('pointerdown', e => {
    if (e.button || e.target.closest('.t-tab')) return;
    e.preventDefault(); e.stopPropagation();
    tMap = tabletMap(); drawing = at(e);
    tablet.classList.add('drawing'); tablet.querySelector('.t-hello').classList.add('away');
    addEventListener('pointermove', stroke); addEventListener('pointerup', endStroke);
  });
  const stroke = e => {
    if (!drawing) return;
    const p = at(e);
    ictx.strokeStyle = inkColor(); ictx.lineWidth = 5; ictx.lineCap = 'round'; ictx.lineJoin = 'round';
    ictx.beginPath(); ictx.moveTo(drawing[0], drawing[1]); ictx.lineTo(p[0], p[1]); ictx.stroke();
    drawing = p;
  };
  const endStroke = () => { drawing = null; tablet.classList.remove('drawing'); removeEventListener('pointermove', stroke); removeEventListener('pointerup', endStroke); };
  // the ink slowly fades so the tablet is always ready for the next visitor
  setInterval(() => {
    if (drawing) return;
    ictx.globalCompositeOperation = 'destination-out'; ictx.fillStyle = 'rgba(0,0,0,.06)'; ictx.fillRect(0, 0, ink.width, ink.height); ictx.globalCompositeOperation = 'source-over';
  }, 80);
  $('aboutTab').addEventListener('click', e => { e.stopPropagation(); openPage(tablet, 'about.html'); });

  /* ---------- the wall board, the pen cup and the phone ---------- */
  const linkTo = (el, to) => {
    el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPage(el, to); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') openPage(el, to); });
  };
  linkTo($('wall'), 'certifications.html'); linkTo($('cup'), 'skills.html'); linkTo($('phone'), 'contact.html');

  /* ---------- labels that follow the pointer over each object ---------- */
  if (fine) {
    addEventListener('pointermove', e => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      const label = t ? t.dataset.tip : (e.target.closest && e.target.closest('.mon-screen') ? (loaded ? 'Press to open the case study' : 'Drop a project proof here') : '');
      tip.textContent = label; tip.classList.toggle('on', !!label && !drawing);
      tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    }, { passive: true });
  }

  /* ---------- the camera follows the pointer to the top or bottom edge ---------- */
  document.body.insertAdjacentHTML('beforeend', '<div class="edge up mono" aria-hidden="true"><span>&uarr;</span> Desk</div><div class="edge down mono" aria-hidden="true"><span>&darr;</span> Drawer</div>');
  let zone = null, zoneTimer = 0, held = false;
  addEventListener('pointerdown', () => (held = true)); addEventListener('pointerup', () => (held = false));
  addEventListener('pointermove', e => {
    if (held || small.matches || !room.classList.contains('open') || view === 'monitor') return;
    const z = e.clientY < 90 && !e.target.closest('.bar a, .bar button') ? 'up' : e.clientY > innerHeight - 64 && !e.target.closest('.dr-front') ? 'down' : null;
    if (z === zone) return;
    zone = z; clearTimeout(zoneTimer);
    if (z) zoneTimer = setTimeout(() => setView(z === 'up' ? 'desk' : 'drawer'), 180);
  }, { passive: true });
  hint();

  /* ---------- the lamp follows the pointer; the desk leans a little ---------- */
  const m = { x: innerWidth / 2, y: innerHeight * .4, tx: innerWidth / 2, ty: innerHeight * .4 };
  addEventListener('pointermove', e => { m.tx = e.clientX; m.ty = e.clientY; }, { passive: true });
  const tick = () => {
    m.x += (m.tx - m.x) * .1; m.y += (m.ty - m.y) * .1;
    lamp.style.setProperty('--mx', m.x.toFixed(1) + 'px'); lamp.style.setProperty('--my', m.y.toFixed(1) + 'px');
    if (motionOn() && !held && view !== 'monitor') {
      world.style.setProperty('--ry', ((m.x / innerWidth - .5) * 2).toFixed(2) + 'deg');
      world.style.setProperty('--rx', ((.5 - m.y / innerHeight) * 1).toFixed(2) + 'deg');
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
