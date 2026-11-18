/* The laptop's desktop: a Windows-style workspace that opens when you dive into the laptop screen.
   The screen is a fixed 1280 x 800 stage (the laptop's 16:10 panel), scaled to fit. Because every position is fixed,
   the same layout is painted onto the laptop's screen in the room (ndOS.paint), so the closed laptop and the open
   desktop look the same.
   It is Tinta's lab: kuwaGO's pixel garden, the promo drafts side by side, and two notes from building kuwaGO.
   The room calls window.ndOS.open(onExit); every "Back to the room" control calls onExit. */
(() => {
  const SW = 1280, SH = 800, BAR = 48;
  const F = '"Segoe UI", "IBM Plex Sans", system-ui, sans-serif';
  const MONO = '"IBM Plex Mono", Consolas, monospace';
  const COND = '"IBM Plex Sans Condensed", "Arial Narrow", sans-serif';

  const PROJECTS = [
    { id: 'kuwago', name: 'kuwaGO', kind: 'Mobile app', year: '2026', c: '#5BB06A', icon: 'tinta/assets/icons/kuwago.png', img: 'assets/cs/kuwago-garden.jpg',
      text: 'A cozy pixel-art study garden. Finish a focus session and your plant grows; give up and it wilts. AI turns your own notes into quizzes and flashcards.',
      points: ['Flutter · Firebase · Gemini', '30 days to ship · 18 testers', '72 automated tests'] },
    { id: 'cinematheque', name: 'Cinematheque', kind: 'Web system', year: '2026', c: '#E2763F', icon: 'tinta/assets/icons/cinematheque.png', img: 'assets/cs/cinematheque-title.jpg',
      text: 'Ticketing for a real cinema. Moviegoers pick exact seats, pay online and get an e-ticket; staff schedule films, admit guests and export the head-office report.',
      points: ['Laravel 12 · MySQL · PayMongo', 'Group of three, for a real client', '129 automated tests'] },
    { id: 'xpera', name: 'xpera CRM', kind: 'Desktop system', year: 'In progress', c: '#F4506A', icon: 'tinta/assets/icons/xpera.png', img: 'assets/cs/xpera-logo.jpg',
      text: 'A customer system for small stores that sell gaming PC parts: who each customer is, what they buy, what they owe and what they need.',
      points: ['C# · .NET WinForms · SQL Server', 'One database per store', '15 use cases · 4 user roles'] }
  ];
  const IC = { nicho: 'tinta/assets/icons/nicho.svg', browser: 'tinta/assets/icons/browser.svg', folder: 'tinta/assets/icons/folder.svg', notepad: 'tinta/assets/icons/notepad.svg', pdf: 'tinta/assets/icons/pdf.svg', room: 'tinta/assets/icons/room.svg' };
  PROJECTS.forEach(p => (IC[p.id] = p.icon));
  IC.garden = 'tinta/assets/icons/garden.svg'; IC.film = 'tinta/assets/icons/film.svg';
  // the laptop is the lab: small things that are not case studies
  const APPS = {
    garden: { t: 'Garden', icon: IC.garden },
    promo: { t: 'Promo drafts', icon: IC.film },
    notepad: { t: 'Notepad', icon: IC.notepad }
  };
  const PLANTS = ['owlbloom', 'storm_orchid', 'eternal_sakura', 'aurora_bell', 'crystal_lotus', 'desert_cactus', 'dragonheart_rose', 'forest_fern', 'glory_tree', 'moonpetal_lily', 'phoenix_bloom', 'starfall_willow'];
  const plantName = id => id.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const sheetOf = id => `tinta/assets/plants/${id}.png`;
  const BUILD_LOG = `kuwaGO · build log
==================
47 commits in 30 days.

22 Sep  first commit ("first butang")
27 Sep  notes feature
28 Sep  Firebase set up; the first AI study tools
29 Sep  splash screen and profile card
30 Sep  release setup: new app ID, signing, a Google Sign-In fix
02 Oct  AI batching, the study quiz, Groq as the backup AI
20 Oct  owl tours, Deep Focus, the flashcard deck, AI study tools
21 Oct  account deletion, privacy pages, the store kit
21 Oct  version 1.0.5 goes to testers

Next: a Google Play developer account, closed testing, release.
`;
  const AI_NOTE = `No keys in the app
==================
An Android app can be unpacked, so any API key inside it can be read.

So kuwaGO never ships one. The first version didn't fake it either:
with no AI connected, it said "not connected" instead of pretending.

Now the app calls a small Cloudflare Worker. The Worker holds the
Groq key and talks to Groq; the app only knows the Worker's address.

Gemini is the main AI and Groq is the backup. If both are down,
kuwaGO falls back to study material that works offline.
`;
  const ABOUT = `About me
========

Name      Nicho Lescano
Based in  Davao City, Philippines
Studying  BS Information Technology, 3rd year, University of Mindanao

What I do
- UI/UX design: I draw every screen first, then design it in Figma.
- Development: web, mobile and desktop systems.
- Machine learning and building with AI automation.

How I work
1. Brief    what it's for and who uses it
2. Sketch   rough lines, cheap to change
3. Design   type, colour and states in Figma
4. Build    feature by feature, AI-assisted
5. Ship     tested with real people

Off the clock
Cars, games and badminton.

Contact
neckolescano36@gmail.com
github.com/neckolescano
`;
  // line icons, 24-unit boxes: drawn as <svg> in the page and as Path2D on the laptop screen
  const P = {
    back: 'M15 6l-6 6 6 6', fwd: 'M9 6l6 6-6 6', up: 'M12 19V6M6 11l6-6 6 6', refresh: 'M19 12a7 7 0 1 1-2.05-4.95M19 4.5v4h-4',
    home: 'M4 11l8-7 8 7M6.5 9.5V20h11V9.5', ext: 'M14 5h5v5M19 5l-8 8M17 14v5H5V7h5', search: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13zM15.5 15.5L21 21',
    min: 'M6 12h12', max: 'M6.5 6.5h11v11h-11z', restore: 'M9 6h9v9M6 9h9v9H6z', close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
    wifi: 'M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 15.8a4.6 4.6 0 0 1 6.4 0M12 19.2v.1',
    vol: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11', mute: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5',
    bat: 'M4 7.5h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM22.5 10.5v3M5 10.5h10v3H5z',
    chev: 'M7 14.5l5-5 5 5', power: 'M12 3.5v8M7 6.5a7 7 0 1 0 10 0', moon: 'M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z',
    sun: 'M12 8.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
    focus: 'M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z', lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
    restart: 'M5 12a7 7 0 1 0 2.05-4.95M5 4.5v4h4', door: 'M14 4H6v16h8M10 12h11M17 8l4 4-4 4', save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
    print: 'M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z', star: 'M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', list: 'M4 6h16M4 12h16M4 18h16', plus: 'M12 5v14M5 12h14', check: 'M5 12.5l4.5 4.5L19 7.5'
  };
  const svg = (k, cls = '') => `<svg class="oi ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[k]}"/></svg>`;
  const img = (src, cls = '') => `<img class="${cls}" src="${src}" alt="" draggable="false">`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const now = () => { const d = new Date(); let t = '', day = ''; try { t = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' }); day = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Manila' }); } catch {} return [t, day]; };

  /* ---------- layout: the same numbers drive the page and the painted screen ---------- */
  const DESK = [
    { id: 'garden', t: 'Garden', icon: IC.garden, open: () => openApp('garden') },
    { id: 'promo', t: 'Promo drafts', icon: IC.film, open: () => openApp('promo') },
    { id: 'log', t: 'Build log.txt', icon: IC.notepad, open: () => openNote('Build log.txt', BUILD_LOG) },
    { id: 'key', t: 'No keys in the app.txt', icon: IC.notepad, open: () => openNote('No keys in the app.txt', AI_NOTE) },
    { id: 'site', t: 'Nicho.dev ↗', icon: IC.nicho, open: () => leave('index.html') },
    { id: 'room', t: 'Back to the room', icon: IC.room, open: () => exit() }
  ];
  const ROOT_ORDER = ['garden', 'promo', 'log', 'key', 'site', 'room'];
  let order = ROOT_ORDER.slice(), iconSize = 'm';
  const CELL = { m: [84, 96, 44], l: [104, 120, 60] };
  const iconPos = (i, h = SH - BAR) => { const [cw, ch] = CELL[iconSize], rows = Math.max(1, Math.floor((h - 8) / ch)); return [8 + Math.floor(i / rows) * cw, 8 + (i % rows) * ch]; };
  const WIN0 = { x: 196, y: 64, w: 622, h: 430 };
  const TB = { x0: 522, step: 48, w: 44, items: ['start', 'search', 'garden', 'promo', 'notepad'] };
  const WALLS = { drafting: 'Drafting', blueprint: 'Layers', dots: 'Dots' };
  const st = { wall: 'drafting', bright: 1, night: false, focus: false, wifi: true, sound: true, opened: false };

  /* ---------- wallpapers, painted (one function for the page and the laptop screen) ---------- */
  const paintWall = (g, kind = st.wall, W = SW, H = SH) => {
    g.save(); g.scale(W / SW, H / SH);
    g.fillStyle = '#07080A'; g.fillRect(0, 0, SW, SH);
    const ink = a => `rgba(236,233,226,${a})`, red = a => `rgba(224,83,63,${a})`;
    if (kind === 'blueprint') {
      g.lineWidth = 1;
      for (let x = 0; x <= SW; x += 32) { g.strokeStyle = x % 160 ? 'rgba(120,160,230,.045)' : 'rgba(120,160,230,.1)'; g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, SH); g.stroke(); }
      for (let y = 0; y <= SH; y += 32) { g.strokeStyle = y % 160 ? 'rgba(120,160,230,.045)' : 'rgba(120,160,230,.1)'; g.beginPath(); g.moveTo(0, y + .5); g.lineTo(SW, y + .5); g.stroke(); }
      const L = [['FINAL', red(.85), red(.08)], ['COLOUR', 'rgba(91,176,106,.7)', 'rgba(91,176,106,.05)'], ['WIREFRAME', ink(.45), ink(.03)], ['SKETCH', ink(.25), ink(.015)]];
      L.slice().reverse().forEach(([, s, f], j) => { const i = 3 - j; g.save(); g.translate(900, 300 + i * 62); g.transform(1, -.5, 1, .5, 0, 0); g.fillStyle = f; g.fillRect(-130, -80, 260, 170); g.strokeStyle = s; g.lineWidth = 1.4; g.strokeRect(-130, -80, 260, 170); g.restore(); });
      g.font = `500 11px ${MONO}`; g.textBaseline = 'middle';
      L.forEach(([n, s], i) => { const y = 300 + i * 62; g.strokeStyle = ink(.25); g.beginPath(); g.moveTo(1085, y); g.lineTo(1150, y); g.stroke(); g.fillStyle = s; g.fillRect(1083, y - 2, 4, 4); g.fillStyle = ink(.5); g.fillText(n, 1158, y); });
      g.textBaseline = 'alphabetic';
    } else {
      g.fillStyle = ink(kind === 'dots' ? .09 : .07);
      for (let x = 16; x < SW; x += 32) for (let y = 16; y < SH; y += 32) g.fillRect(x - .7, y - .7, 1.4, 1.4);
      if (kind === 'dots') { g.font = `600 30px ${COND}`; g.fillStyle = ink(.16); g.fillText('N', 1196, 724); g.fillStyle = red(.8); g.fillRect(1220, 712, 10, 10); }
    }
    if (kind === 'drafting') {
      g.lineWidth = 1; g.strokeStyle = red(.3); g.setLineDash([6, 6]);
      [[700, 250, 1250, 250], [700, 610, 1250, 610], [800, 170, 800, 690], [1120, 170, 1120, 690]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b + .5); g.lineTo(c, d + .5); g.stroke(); });
      g.strokeStyle = red(.2); g.beginPath(); g.arc(800, 610, 360, -Math.PI / 2, 0); g.stroke(); g.setLineDash([]);
      g.beginPath(); [[800, 610], [800, 250], [856, 250], [1064, 520], [1064, 250], [1120, 250], [1120, 610], [1064, 610], [856, 340], [856, 610]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = ink(.025); g.fill(); g.strokeStyle = ink(.3); g.lineWidth = 1.5; g.stroke();
      g.fillStyle = red(.85); g.fillRect(1146, 554, 56, 56);
      g.strokeStyle = ink(.35); g.lineWidth = 1;
      const tick = (x, y) => { g.beginPath(); g.moveTo(x - 5, y + 5); g.lineTo(x + 5, y - 5); g.stroke(); };
      g.beginPath(); g.moveTo(800, 214.5); g.lineTo(1120, 214.5); g.moveTo(764.5, 250); g.lineTo(764.5, 610); g.stroke();
      tick(800, 214.5); tick(1120, 214.5); tick(764.5, 250); tick(764.5, 610);
      g.fillStyle = ink(.5); g.font = `500 11px ${MONO}`; g.textAlign = 'center'; g.fillText('320', 960, 205);
      g.save(); g.translate(754, 430); g.rotate(-Math.PI / 2); g.fillText('360', 0, 0); g.restore();
      g.textAlign = 'left'; g.fillStyle = red(.7); g.fillText('T-000', 1146, 640);
      g.strokeStyle = ink(.18); g.strokeRect(1000.5, 676.5, 264, 60); g.beginPath(); g.moveTo(1180.5, 676.5); g.lineTo(1180.5, 736.5); g.stroke();
      g.fillStyle = ink(.7); g.font = `600 15px ${COND}`; g.fillText('TINTA STUDIO', 1012, 700);
      g.fillStyle = ink(.4); g.font = `400 10.5px ${MONO}`; g.fillText('THE LAB', 1012, 722); g.fillText('SHEET', 1192, 700); g.fillText('01 / 01', 1192, 722);
    }
    g.restore();
  };

  /* ---------- painting the whole screen for the laptop in the room ---------- */
  const IMGS = {};
  let onChange = null;
  const loadImg = src => { if (IMGS[src]) return IMGS[src]; const im = new Image(); im.onload = () => onChange && onChange(); im.src = src; return (IMGS[src] = im); };
  Object.values(IC).forEach(loadImg); PLANTS.forEach(id => loadImg(sheetOf(id)));
  const ok = im => im && im.complete && im.naturalWidth;
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
  const glyph = (g, k, x, y, s, c, lw = 1.6) => { g.save(); g.translate(x, y); g.scale(s / 24, s / 24); g.strokeStyle = c; g.lineWidth = lw * 24 / s; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(new Path2D(P[k])); g.restore(); };
  const pic = (g, src, x, y, s) => { const im = loadImg(src); if (ok(im)) g.drawImage(im, x, y, s, s); };
  const wrap = (g, text, maxW) => { const words = text.split(' '), out = []; let line = ''; words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); return out.slice(0, 2); };

  // the Garden window, painted for the laptop screen: the twelve plants in full bloom
  const bloomAt = (g, id, x, y, s) => { const im = loadImg(sheetOf(id)); if (!ok(im)) return; g.imageSmoothingEnabled = false; g.drawImage(im, 9 * 128, 3 * 128, 128, 128, x, y, s, s); g.imageSmoothingEnabled = true; };
  const paintGarden = (g, r) => {
    const { x, y, w, h } = r;
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#1C1D22'; rr(g, x, y, w, h, 8); g.fill(); g.restore();
    g.save(); rr(g, x, y, w, h, 8); g.clip(); g.translate(x, y);
    g.fillStyle = '#141519'; g.fillRect(0, 0, w, 36);
    pic(g, IC.garden, 12, 10, 16); g.fillStyle = '#E8E9EC'; g.font = `400 12px ${F}`; g.fillText('Garden', 38, 22.5);
    glyph(g, 'min', w - 138 + 15, 10, 16, '#C9CCD3', 1.2); glyph(g, 'max', w - 92 + 15, 10, 16, '#C9CCD3', 1.2); glyph(g, 'close', w - 46 + 15, 10, 16, '#C9CCD3', 1.2);
    g.fillStyle = '#E8E9EC'; g.font = `600 20px ${F}`; g.fillText('Garden', 20, 70);
    g.fillStyle = '#8E93A0'; g.font = `400 12px ${F}`; g.fillText('12 plants I drew for kuwaGO. Pick one to watch it grow.', 20, 90);
    PLANTS.forEach((id, i) => { const c = i % 6, rw = Math.floor(i / 6), tx = 14 + c * 96, ty = 110 + rw * 168;
      bloomAt(g, id, tx + 4, ty, 88); g.textAlign = 'center'; g.fillStyle = '#C9CCD3'; g.font = `400 11.5px ${F}`; wrap(g, plantName(id), 88).forEach((l, j) => g.fillText(l, tx + 48, ty + 104 + j * 14)); g.textAlign = 'left'; });
    g.restore();
  };
  const paintFrame = (g, r, t, icon) => {   // any other open window: its frame and title
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 36; g.shadowOffsetY = 16; g.fillStyle = '#1C1D22'; rr(g, r.x, r.y, r.w, r.h, 8); g.fill(); g.restore();
    g.save(); rr(g, r.x, r.y, r.w, r.h, 8); g.clip(); g.fillStyle = '#141519'; g.fillRect(r.x, r.y, r.w, 36); pic(g, icon, r.x + 12, r.y + 10, 16);
    g.fillStyle = '#E8E9EC'; g.font = `400 12px ${F}`; g.fillText(t, r.x + 38, r.y + 22.5); g.fillStyle = '#0d0e11'; g.fillRect(r.x, r.y + 80, r.w, r.h - 80); pic(g, icon, r.x + r.w / 2 - 28, r.y + r.h / 2 - 10, 56); g.restore();
  };
  const paint = (g, W = SW, H = SH) => {
    g.save(); g.scale(W / SW, H / SH);
    paintWall(g);
    if (!st.focus) {
      const [cw, ch, is] = CELL[iconSize];
      g.textAlign = 'center'; g.font = `400 12px ${F}`;
      order.forEach((id, i) => { const d = DESK.find(x => x.id === id) || extra.find(x => x.id === id); if (!d) return; const [x, y] = iconPos(i); pic(g, d.icon, x + (cw - is) / 2, y + 8, is);
        g.fillStyle = '#F1F2F5'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 4; wrap(g, d.t, cw - 8).forEach((l, j) => g.fillText(l, x + cw / 2, y + is + 24 + j * 15)); g.shadowBlur = 0; });
      g.textAlign = 'left';
    }
    const list = st.opened ? Object.entries(wins).filter(([, w]) => !w.el.hidden).sort((a, b) => (+a[1].el.style.zIndex || 0) - (+b[1].el.style.zIndex || 0)) : [['garden', null]];
    list.forEach(([k, w]) => { const r = w ? rect(w.el) : WIN0; if (k === 'garden' && (!w || w.view === null)) paintGarden(g, r); else paintFrame(g, r, w ? w.title : APPS[k].t, APPS[k].icon); });
    // taskbar
    g.fillStyle = 'rgba(19,20,25,.96)'; g.fillRect(0, SH - BAR, SW, BAR); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, SH - BAR, SW, 1);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.04)'; rr(g, 10.5, 760.5, 150, 31, 6); g.fill(); g.stroke();
    g.fillStyle = '#F1F2F5'; g.font = `400 12.5px ${F}`; g.fillText('← Back to the room', 23, 780.5);
    TB.items.forEach((k, i) => { const x = TB.x0 + i * TB.step; if (k === 'start') pic(g, IC.nicho, x + 10, 764, 24); else if (k === 'search') glyph(g, 'search', x + 12, 766, 20, '#E8E9EC'); else pic(g, APPS[k].icon, x + 10, 764, 24);
      const w = st.opened ? wins[k] : (k === 'garden' ? { el: { hidden: false } } : null);
      if (w) { const active = st.opened ? top === k && !w.el.hidden : true; g.fillStyle = active ? '#9DB8FF' : '#8E93A0'; rr(g, x + 22 - (active ? 8 : 3), 794, active ? 16 : 6, 3, 1.5); g.fill(); } });
    glyph(g, 'chev', 1043, 764, 16, '#E8E9EC');
    g.fillStyle = '#E8E9EC'; g.font = `400 12px ${F}`; g.textAlign = 'center'; g.fillText('ENG', 1086, 780);
    glyph(g, st.wifi ? 'wifi' : 'wifi', 1118, 768, 16, st.wifi ? '#E8E9EC' : '#5C606A'); glyph(g, st.sound ? 'vol' : 'mute', 1144, 768, 16, '#E8E9EC'); glyph(g, 'bat', 1170, 768, 16, '#E8E9EC');
    const [t, d] = now(); g.textAlign = 'right'; g.fillText(t, 1262, 772); g.fillText(d, 1262, 790); g.textAlign = 'left';
    if (st.night) { g.fillStyle = 'rgba(255,140,40,.1)'; g.fillRect(0, 0, SW, SH); }
    if (st.bright < 1) { g.fillStyle = `rgba(0,0,0,${(1 - st.bright) * .7})`; g.fillRect(0, 0, SW, SH); }
    g.restore();
  };

  /* ---------- building the desktop ---------- */
  let root = null, stage = null, layer = null, onExit = null, z = 10, tick = null, top = null, fluid = false, k = 1;
  const wins = {};
  const extra = [];   // text documents made from the desktop's New menu
  const el = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
  const $ = (s, r = root) => r.querySelector(s);
  const rect = w => ({ x: w.offsetLeft, y: w.offsetTop, w: w.offsetWidth, h: w.offsetHeight });
  const changed = () => onChange && onChange();

  const build = () => {
    root = el(`<div class="os" role="dialog" aria-modal="true" aria-label="Laptop desktop">
      <div class="os-stage">
        <canvas class="os-wall" width="${SW}" height="${SH}" aria-hidden="true"></canvas>
        <div class="os-icons" role="listbox" aria-label="Desktop"></div>
        <div class="os-layer"></div>
        <div class="os-fly os-start" hidden></div>
        <div class="os-fly os-qs" hidden></div>
        <div class="os-fly os-cal" hidden></div>
        <div class="os-fly os-tray-more" hidden></div>
        <div class="os-ctx" hidden role="menu"></div>
        <div class="os-bar">
          <button type="button" class="os-room" data-exit>← Back to the room</button>
          <div class="os-bar-mid">
            <button type="button" class="os-tb" data-tb="start" aria-label="Start">${img(IC.nicho)}</button>
            <button type="button" class="os-tb" data-tb="search" aria-label="Search">${svg('search', 'big')}</button>
            ${Object.entries(APPS).map(([key, a]) => `<button type="button" class="os-tb" data-tb="${key}" aria-label="${a.t}">${img(a.icon)}<i class="os-run"></i></button>`).join('')}
          </div>
          <button type="button" class="os-tray-b os-chev" data-fly="tray-more" aria-label="Show hidden icons">${svg('chev')}</button>
          <button type="button" class="os-tray-b os-lang" data-fly="qs" aria-label="Input language">ENG</button>
          <button type="button" class="os-tray-b os-qsb" data-fly="qs" aria-label="Quick settings">${svg('wifi', 'wf')}${svg('vol', 'vl')}${svg('bat')}</button>
          <button type="button" class="os-tray-b os-clock" data-fly="cal" aria-label="Calendar"><b></b><b></b></button>
          <button type="button" class="os-showdesk" aria-label="Show desktop" title="Show desktop"></button>
        </div>
        <div class="os-shade" aria-hidden="true"></div>
        <div class="os-lock" hidden><b></b><span></span><small>Click anywhere to unlock</small></div>
        <div class="os-boot" hidden><i></i></div>
      </div>
    </div>`);
    stage = $('.os-stage'); layer = $('.os-layer');
    document.querySelector('.room').appendChild(root);
    paintWall($('.os-wall').getContext('2d'));
    renderIcons(); renderStart(); renderQS(); renderTrayMore();

    root.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('[data-exit]')) { exit(); return; }
      const tb = t.closest('[data-tb]');
      if (tb) { const key = tb.dataset.tb; if (key === 'start') fly('start'); else if (key === 'search') { fly('start', true); $('.os-start input').focus(); } else toggleApp(key); return; }
      const f = t.closest('[data-fly]'); if (f) { fly(f.dataset.fly); return; }
      if (t.closest('.os-showdesk')) { showDesktop(); return; }
      if (!t.closest('.os-fly')) fly(null);
      if (!t.closest('.os-ctx')) ctx(null);
      if (!t.closest('.os-ic')) root.querySelectorAll('.os-ic.sel').forEach(x => x.classList.remove('sel'));
    });
    $('.os-icons').addEventListener('contextmenu', e => { e.preventDefault(); const ic = e.target.closest('.os-ic'); ctx(e, ic ? ic.dataset.id : null); });
    $('.os-lock').addEventListener('click', () => { $('.os-lock').hidden = true; });
    root.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return; e.stopPropagation();
      if (!$('.os-ctx').hidden) ctx(null); else if (root.querySelector('.os-fly:not([hidden])')) fly(null); else exit();
    });
    addEventListener('resize', fit);
    fit();
  };

  // the stage keeps the laptop's 16:10 panel and scales to the window; small or tall screens get a fluid layout
  const fit = () => {
    if (!root) return;
    const W = root.clientWidth, H = root.clientHeight;
    fluid = Math.min(W / SW, H / SH) < .5 || W / H < 1.05;
    stage.classList.toggle('fluid', fluid);
    if (fluid) { k = 1; stage.style.transform = ''; }
    else { k = Math.min(W / SW, H / SH); stage.style.transform = `translate(${((W - SW * k) / 2).toFixed(1)}px, ${((H - SH * k) / 2).toFixed(1)}px) scale(${k.toFixed(4)})`; }
    placeIcons();
  };

  /* ---------- desktop icons ---------- */
  const allIcons = () => DESK.concat(extra);
  const renderIcons = () => {
    const box = $('.os-icons');
    box.innerHTML = order.map(id => { const d = allIcons().find(x => x.id === id); return d ? `<button type="button" class="os-ic" role="option" data-id="${d.id}">${img(d.icon)}<span>${esc(d.t)}</span></button>` : ''; }).join('');
    box.classList.toggle('large', iconSize === 'l');
    box.querySelectorAll('.os-ic').forEach(b => {
      const d = allIcons().find(x => x.id === b.dataset.id);
      b.addEventListener('click', () => { box.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); d.open(); });
      b.addEventListener('keydown', e => { if (e.key === 'Enter') d.open(); });
    });
    placeIcons();
  };
  const placeIcons = () => { if (!root) return; const h = fluid ? $('.os-icons').clientHeight || layer.clientHeight : SH - BAR; root.querySelectorAll('.os-ic').forEach((b, i) => { const [x, y] = iconPos(i, h); b.style.left = x + 'px'; b.style.top = y + 'px'; }); };

  /* ---------- right-click menu ---------- */
  const ctx = (e, id) => {
    const m = $('.os-ctx');
    if (!e) { m.hidden = true; return; }
    const item = (act, label, icon = '', on = false) => `<button type="button" role="menuitem" data-act="${act}">${icon ? svg(icon) : '<i></i>'}<span>${label}</span>${on ? svg('check', 'ck') : ''}</button>`;
    m.innerHTML = id
      ? item('open', 'Open') + (DESK.find(x => x.id === id) ? '' : item('del', 'Delete')) + '<hr>' + item('refresh', 'Refresh', 'refresh')
      : item('large', 'Large icons', 'grid', iconSize === 'l') + item('medium', 'Medium icons', 'grid', iconSize === 'm') + item('sort', 'Sort by name', 'list') + item('refresh', 'Refresh', 'refresh') + '<hr>'
        + item('new', 'New text document', 'plus') + '<hr>' + Object.entries(WALLS).map(([w, n]) => item('wall:' + w, 'Wallpaper: ' + n, 'star', st.wall === w)).join('') + '<hr>' + item('room', 'Back to the room', 'door');
    m.hidden = false;
    const b = stage.getBoundingClientRect(), x = (e.clientX - b.left) / k, y = (e.clientY - b.top) / k, W = stage.offsetWidth, H = stage.offsetHeight;
    m.style.left = Math.min(x, W - m.offsetWidth - 6) + 'px'; m.style.top = Math.min(y, H - BAR - m.offsetHeight - 6) + 'px';
    m.onclick = ev => {
      const a = ev.target.closest('[data-act]'); if (!a) return; const act = a.dataset.act; m.hidden = true;
      if (act === 'open') allIcons().find(x => x.id === id).open();
      else if (act === 'del') { const i = extra.findIndex(x => x.id === id); extra.splice(i, 1); order = order.filter(x => x !== id); renderIcons(); }
      else if (act === 'large' || act === 'medium') { iconSize = act === 'large' ? 'l' : 'm'; renderIcons(); }
      else if (act === 'sort') { order.sort((p, q) => allIcons().find(x => x.id === p).t.localeCompare(allIcons().find(x => x.id === q).t)); renderIcons(); }
      else if (act === 'refresh') { const box = $('.os-icons'); box.style.opacity = 0; setTimeout(() => { order = order.slice(); renderIcons(); box.style.opacity = ''; }, 160); }
      else if (act === 'new') newDoc();
      else if (act.startsWith('wall:')) setWall(act.slice(5));
      else if (act === 'room') exit();
      changed();
    };
  };
  const newDoc = () => {
    let n = 1; while (allIcons().some(x => x.t === (n === 1 ? 'New Text Document.txt' : `New Text Document (${n}).txt`))) n++;
    const t = n === 1 ? 'New Text Document.txt' : `New Text Document (${n}).txt`, id = 'doc' + Date.now();
    const d = { id, t, icon: IC.notepad, text: '', open: () => openNote(t, d.text, d) };
    extra.push(d); order.push(id); renderIcons(); d.open();
  };

  /* ---------- flyouts: start, quick settings, calendar, hidden icons ---------- */
  const fly = (name, keepOpen) => {
    root.querySelectorAll('.os-fly').forEach(f => { const on = f.classList.contains('os-' + name) && (keepOpen || f.hidden); f.hidden = !on; });
    root.querySelectorAll('[data-tb="start"], [data-fly]').forEach(b => b.classList.toggle('on', !!name && !$('.os-' + name).hidden && (b.dataset.tb === name || b.dataset.fly === name)));
    if (name === 'cal' && !$('.os-cal').hidden) renderCal(new Date());
    if (name === 'start' && !$('.os-start').hidden) { const i = $('.os-start input'); i.value = ''; filterStart(''); }
  };
  const renderStart = () => {
    const s = $('.os-start');
    const pins = [['app:garden', 'Garden', IC.garden], ['app:promo', 'Promo drafts', IC.film], ['log', 'Build log.txt', IC.notepad], ['key', 'No keys in the app.txt', IC.notepad], ['site', 'Nicho.dev', IC.nicho], ['room', 'The room', IC.room]];
    s.innerHTML = `<label class="os-search">${svg('search')}<input type="search" placeholder="Search the lab" aria-label="Search"></label>
      <div class="os-start-h"><b>Pinned</b></div>
      <div class="os-start-grid">${pins.map(([a, t, i]) => `<button type="button" data-go="${a}">${img(i)}<span>${t}</span></button>`).join('')}</div>
      <div class="os-start-h"><b>Recommended</b></div>
      <div class="os-rec">${PROJECTS.map(p => `<button type="button" data-go="case:${p.id}">${img(p.icon)}<span><b>${p.name} case study</b><small>${p.kind} · ${p.year}</small></span></button>`).join('')}
        <button type="button" data-go="url:index.html#process">${img(IC.nicho)}<span><b>How I work</b><small>nicho.dev/#process</small></span></button></div>
      <p class="os-none" hidden>Nothing found. Try “garden” or “kuwaGO”.</p>
      <div class="os-start-foot"><button type="button" class="os-user" data-go="url:index.html#about"><i>NL</i>Nicho Lescano</button>
        <div class="os-pw"><button type="button" class="os-power" aria-label="Power" aria-expanded="false">${svg('power')}</button>
          <div class="os-pwm" hidden><button type="button" data-go="lock">${svg('lock')}Lock</button><button type="button" data-go="restart">${svg('restart')}Restart</button><button type="button" data-go="room">${svg('door')}Back to the room</button></div></div></div>`;
    s.addEventListener('click', e => {
      if (e.target.closest('.os-power')) { const m = $('.os-pwm', s); m.hidden = !m.hidden; $('.os-power', s).setAttribute('aria-expanded', !m.hidden); return; }
      const b = e.target.closest('[data-go]'); if (!b) return; fly(null); $('.os-pwm', s).hidden = true; go(b.dataset.go);
    });
    const inp = $('input', s);
    inp.addEventListener('input', () => filterStart(inp.value));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = s.querySelector('[data-go]:not([hidden])'); if (b) b.click(); } });
  };
  const filterStart = q => {
    const s = $('.os-start'); q = q.trim().toLowerCase(); let any = false;
    s.querySelectorAll('.os-start-grid [data-go], .os-rec [data-go]').forEach(b => { const on = !q || b.textContent.toLowerCase().includes(q) || (q.includes('cv') && b.textContent.includes('Resume')); b.hidden = !on; any = any || on; });
    $('.os-none', s).hidden = any;
  };
  const go = a => {
    if (a.startsWith('app:')) openApp(a.slice(4));
    else if (a.startsWith('case:')) leave('projects.html?p=' + a.slice(5));
    else if (a.startsWith('url:')) leave(a.slice(4));
    else if (a === 'log') openNote('Build log.txt', BUILD_LOG);
    else if (a === 'key') openNote('No keys in the app.txt', AI_NOTE);
    else if (a === 'site') leave('index.html');
    else if (a === 'room') exit();
    else if (a === 'lock') lockScreen();
    else if (a === 'restart') restart();
  };
  const renderQS = () => {
    const q = $('.os-qs');
    const tile = (key, icon, label) => `<button type="button" class="os-tile" data-tog="${key}" aria-pressed="${!!st[key]}">${svg(icon)}<span>${label}</span></button>`;
    q.innerHTML = `<div class="os-tiles">${tile('wifi', 'wifi', 'Wi-Fi')}${tile('sound', 'vol', 'Sound')}${tile('night', 'moon', 'Night light')}${tile('focus', 'focus', 'Focus')}</div>
      <label class="os-slider">${svg('sun')}<input type="range" min="35" max="100" value="${st.bright * 100}" aria-label="Brightness"></label>
      <p class="os-qs-h">Wallpaper</p>
      <div class="os-walls">${Object.entries(WALLS).map(([w, n]) => `<button type="button" data-wall="${w}" aria-pressed="${st.wall === w}"><canvas width="128" height="80"></canvas><span>${n}</span></button>`).join('')}</div>
      <div class="os-qs-foot"><span>${svg('bat')} 86%</span><button type="button" data-exit>${svg('door')} Back to the room</button></div>`;
    q.querySelectorAll('.os-walls canvas').forEach(c => paintWall(c.getContext('2d'), c.parentNode.dataset.wall, 128, 80));
    q.addEventListener('click', e => {
      const t = e.target.closest('[data-tog]'); if (t) { const key = t.dataset.tog; st[key] = !st[key]; t.setAttribute('aria-pressed', st[key]); applyState(); return; }
      const w = e.target.closest('[data-wall]'); if (w) setWall(w.dataset.wall);
    });
    $('input', q).addEventListener('input', e => { st.bright = e.target.value / 100; applyState(); });
  };
  const renderTrayMore = () => {
    const m = $('.os-tray-more');
    m.innerHTML = `<button type="button" data-go="app:garden" title="Garden">${img(IC.garden)}</button><button type="button" data-go="site" title="Nicho.dev">${img(IC.nicho)}</button><button type="button" data-go="room" title="Back to the room">${img(IC.room)}</button>`;
    m.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { fly(null); go(b.dataset.go); } });
  };
  let calMonth = null;
  const renderCal = d => {
    calMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const c = $('.os-cal'), today = new Date(), first = calMonth.getDay(), days = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    const head = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const cells = []; for (let i = 0; i < first; i++) cells.push('<span></span>');
    for (let i = 1; i <= days; i++) { const isT = i === today.getDate() && calMonth.getMonth() === today.getMonth() && calMonth.getFullYear() === today.getFullYear(); cells.push(`<button type="button" class="${isT ? 'today' : ''}">${i}</button>`); }
    c.innerHTML = `<p class="os-cal-top">${head}</p>
      <div class="os-cal-h"><b>${calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b><button type="button" data-m="-1" aria-label="Previous month">${svg('up', 'r0')}</button><button type="button" data-m="1" aria-label="Next month">${svg('up', 'r180')}</button></div>
      <div class="os-cal-g">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(x => `<i>${x}</i>`).join('')}${cells.join('')}</div>
      <p class="os-cal-note">${svg('focus')} Next up: shipping xpera CRM</p>`;
    c.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); renderCal(new Date(calMonth.getFullYear(), calMonth.getMonth() + +b.dataset.m, 1)); }));
    c.querySelectorAll('.os-cal-g button').forEach(b => b.addEventListener('click', () => { c.querySelectorAll('.os-cal-g .sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); }));
  };
  const setWall = w => { st.wall = w; paintWall($('.os-wall').getContext('2d')); root.querySelectorAll('[data-wall]').forEach(b => b.setAttribute('aria-pressed', b.dataset.wall === w)); changed(); };
  const applyState = () => {
    const sh = $('.os-shade');
    sh.style.background = st.night ? 'rgba(255,140,40,.1)' : 'transparent';
    sh.style.boxShadow = `inset 0 0 0 9999px rgba(0,0,0,${((1 - st.bright) * .7).toFixed(3)})`;
    $('.os-icons').hidden = st.focus;
    $('.os-qsb .wf').style.opacity = st.wifi ? 1 : .35;
    $('.os-qsb .vl').innerHTML = `<path d="${P[st.sound ? 'vol' : 'mute']}"/>`;
    changed();
  };
  const showDesktop = () => { const any = Object.values(wins).some(w => !w.el.hidden); Object.values(wins).forEach(w => (w.el.hidden = any)); if (!any) { const t = Object.keys(wins).pop(); if (t) focusWin(t); } mark(); };
  const lockScreen = () => { const l = $('.os-lock'); const [t] = now(); $('b', l).textContent = t; $('span', l).textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); l.hidden = false; };
  const restart = () => {
    const b = $('.os-boot'); b.hidden = false;
    Object.keys(wins).forEach(closeApp);
    setTimeout(() => { b.hidden = true; openApp('garden'); }, 1400);
  };

  /* ---------- windows ---------- */
  const titleBar = (key, t, icon) => `<header class="os-title">${img(icon)}<span>${esc(t)}</span><div class="os-ctl"><button type="button" data-min aria-label="Minimise">${svg('min')}</button><button type="button" data-max aria-label="Maximise">${svg('max')}</button><button type="button" data-close aria-label="Close">${svg('close')}</button></div></header>`;
  const makeWin = (key, t, icon, r) => {
    const w = el(`<section class="os-win" data-app="${key}" role="dialog" aria-label="${esc(t)}">${titleBar(key, t, icon)}<div class="os-body"></div></section>`);
    const W = layer.clientWidth, H = layer.clientHeight;
    if (!r) { const n = Object.keys(wins).length; r = { w: Math.min(W - 24, { promo: 780, notepad: 560 }[key] || 720), h: Math.min(H - 24, { promo: 560, notepad: 460 }[key] || 500) }; r.x = Math.max(12, (W - r.w) / 2 + (n - 1) * 26); r.y = Math.max(12, Math.min(H - r.h - 12, 56 + (n - 1) * 22)); }
    Object.assign(w.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    layer.appendChild(w);
    const o = wins[key] = { el: w, title: t, view: null };
    $('[data-close]', w).addEventListener('click', () => closeApp(key));
    $('[data-min]', w).addEventListener('click', () => { w.hidden = true; if (top === key) top = null; mark(); });
    const max = () => { w.classList.toggle('max'); $('[data-max]', w).innerHTML = svg(w.classList.contains('max') ? 'restore' : 'max'); changed(); };
    $('[data-max]', w).addEventListener('click', max);
    $('.os-title', w).addEventListener('dblclick', e => { if (!e.target.closest('button')) max(); });
    w.addEventListener('pointerdown', () => focusWin(key));
    drag(w, max);
    new ResizeObserver(() => changed()).observe(w);
    requestAnimationFrame(() => w.classList.add('in'));
    return o;
  };
  const setTitle = (key, t) => { const o = wins[key]; if (!o) return; o.title = t; $('.os-title span', o.el).textContent = t; o.el.setAttribute('aria-label', t); };
  const openApp = key => {
    fly(null); ctx(null);
    let o = wins[key];
    const fresh = !o;
    if (fresh) o = makeWin(key, APPS[key].t, APPS[key].icon, key === 'garden' && !st.opened ? { ...WIN0 } : null);
    st.opened = true;
    if (fresh && key === 'garden') garden(o);
    if (fresh && key === 'promo') promo(o);
    o.el.hidden = false; focusWin(key); mark();
    return o;
  };
  const leave = url => {
    fly(null);
    let gone = false; const go = () => { if (gone) return; gone = true; location.href = url; };
    try { const pj = PROJECTS.find(p => url.includes('p=' + p.id)); sessionStorage.setItem('nd-tx', JSON.stringify({ x: .5, y: .5, no: 'Case study', name: pj ? pj.name : 'Nicho.dev' })); } catch {}
    if (window.ndPixels) { try { window.ndPixels(1, innerWidth / 2, innerHeight / 2, 620, null, go, '#07080A'); } catch { go(); } setTimeout(go, 1100); return; }
    go();
  };
  const closeApp = key => { const o = wins[key]; if (!o) return; o.el.classList.remove('in'); const n = o.el; setTimeout(() => n.remove(), 180); delete wins[key]; if (top === key) top = null; mark(); changed(); };
  const toggleApp = key => {
    const o = wins[key];
    if (!o) { key === 'notepad' ? openNote('Build log.txt', BUILD_LOG) : openApp(key); return; }
    if (o.el.hidden || top !== key) { o.el.hidden = false; focusWin(key); } else { o.el.hidden = true; top = null; }
    mark();
  };
  const focusWin = key => { const o = wins[key]; if (!o) return; top = key; o.el.style.zIndex = ++z; root.querySelectorAll('.os-win').forEach(x => x.classList.toggle('top', x === o.el)); mark(); };
  const mark = () => { root.querySelectorAll('.os-tb[data-tb]').forEach(b => { const o = wins[b.dataset.tb]; b.classList.toggle('open', !!o); b.classList.toggle('active', !!o && !o.el.hidden && top === b.dataset.tb); }); changed(); };
  const drag = (w, max) => {
    const bar = $('.os-title', w); let sx, sy, ox, oy, on = false;
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || fluid) return;
      on = true; sx = e.clientX; sy = e.clientY;
      if (w.classList.contains('max')) { const fx = (e.clientX - stage.getBoundingClientRect().left) / k; max(); w.style.left = Math.max(0, fx - w.offsetWidth / 2) + 'px'; w.style.top = '0px'; }
      ox = w.offsetLeft; oy = w.offsetTop; bar.setPointerCapture(e.pointerId); root.classList.add('dragging'); w.classList.add('dragging');
    });
    bar.addEventListener('pointermove', e => { if (!on) return; w.style.left = Math.max(-w.offsetWidth + 100, Math.min(layer.clientWidth - 100, ox + (e.clientX - sx) / k)) + 'px'; w.style.top = Math.max(0, Math.min(layer.clientHeight - 36, oy + (e.clientY - sy) / k)) + 'px'; });
    bar.addEventListener('pointerup', e => { if (!on) return; on = false; root.classList.remove('dragging'); w.classList.remove('dragging'); if ((e.clientY - stage.getBoundingClientRect().top) / k < 4) max(); changed(); });
  };

  /* ---------- app: the garden (kuwaGO's pixel plants) ---------- */
  const drawFrame = (cv, id, f) => { const g = cv.getContext('2d'), im = loadImg(sheetOf(id)); g.clearRect(0, 0, cv.width, cv.height); if (!ok(im)) { im.addEventListener('load', () => drawFrame(cv, id, f), { once: true }); return; } g.imageSmoothingEnabled = false; g.drawImage(im, (f % 10) * 128, Math.floor(f / 10) * 128, 128, 128, 0, 0, cv.width, cv.height); };
  const garden = o => {
    const w = o.el, body = $('.os-body', w);
    body.innerHTML = `<div class="lab-garden">
        <div class="lab-h"><h3>Garden</h3><p>12 plants I drew for kuwaGO, pixel by pixel. Pick one to watch it grow.</p></div>
        <div class="lab-plants">${PLANTS.map((id, i) => `<button type="button" data-plant="${i}"><canvas width="128" height="128"></canvas><span>${plantName(id)}</span></button>`).join('')}</div>
        <div class="lab-grow" hidden><canvas width="256" height="256"></canvas><div class="lab-grow-t"><p class="mono lab-frame"></p><h3></h3><p>Seed to bloom in 40 frames, drawn in Piskel at 128 × 128.</p>
          <div class="lab-acts"><button type="button" class="os-btn" data-desk>Plant it on the desk</button><button type="button" class="os-btn ghost" data-replay>Grow it again</button><button type="button" class="os-btn ghost" data-all>All plants</button></div><p class="lab-ok mono" hidden>Planted. It's growing on the desk.</p></div></div>
      </div>`;
    body.querySelectorAll('[data-plant] canvas').forEach((cv, i) => drawFrame(cv, PLANTS[i], 39));
    const grid = $('.lab-plants', w), grow = $('.lab-grow', w), big = $('.lab-grow canvas', w), lab = $('.lab-frame', w);
    let cur = 0, timer = null;
    const play = () => { clearInterval(timer); let f = 0; $('.lab-ok', w).hidden = true; const step = () => { drawFrame(big, PLANTS[cur], f); lab.textContent = `Frame ${String(f + 1).padStart(2, '0')} / 40`; if (++f > 39) clearInterval(timer); }; step(); timer = setInterval(step, 110); };
    const show = i => { cur = i; o.view = PLANTS[i]; grid.hidden = true; grow.hidden = false; $('.lab-h', w).hidden = true; $('h3', grow).textContent = plantName(PLANTS[i]); setTitle('garden', 'Garden · ' + plantName(PLANTS[i])); play(); changed(); };
    const all = () => { clearInterval(timer); o.view = null; grid.hidden = false; grow.hidden = true; $('.lab-h', w).hidden = false; setTitle('garden', 'Garden'); changed(); };
    w.addEventListener('click', e => {
      const b = e.target.closest('[data-plant]'); if (b) { show(+b.dataset.plant); return; }
      if (e.target.closest('[data-all]')) all();
      if (e.target.closest('[data-replay]')) play();
      if (e.target.closest('[data-desk]')) { window.ndPlant && window.ndPlant(PLANTS[cur]); $('.lab-ok', w).hidden = false; }
    });
  };

  /* ---------- app: the promo drafts (first and last, side by side) ---------- */
  const DRAFTS = { 1: ['v1', '30 s', 'Opens on a phone mock-up and an instruction.'], 4: ['v4', '47 s', 'Opens on a question instead.'], 7: ['v7', '47.5 s', 'Opens on the question, in a tighter frame.'] };
  const promo = o => {
    const w = o.el, body = $('.os-body', w), src = v => `tinta/assets/archive/kuwago-promo-v${v}.jpg`;
    body.innerHTML = `<div class="lab-promo">
        <div class="lab-compare"><img class="lab-a" src="${src(1)}" alt="kuwaGO promo, draft v1"><div class="lab-b"><img src="${src(7)}" alt="kuwaGO promo, final v7"></div><i class="lab-line"></i>
          <span class="lab-tag l mono">v1</span><span class="lab-tag r mono">v7</span><input type="range" min="0" max="100" value="50" aria-label="Compare the drafts"></div>
        <div class="lab-side"><h3>Promo drafts</h3><p>The kuwaGO promo went through seven versions. Drag across the picture to compare an early draft with the final one.</p>
          <p class="lab-pick-l mono">Compare with</p><div class="lab-pick">${[1, 4].map(v => `<button type="button" data-v="${v}" aria-pressed="${v === 1}">${DRAFTS[v][0]}<small>${DRAFTS[v][1]}</small></button>`).join('')}</div>
          <p class="lab-note"></p><p class="mono lab-fin">Final: v7 · 47.5 s</p></div></div>`;
    const range = $('input', w), b = $('.lab-b', w), line = $('.lab-line', w), note = $('.lab-note', w);
    const set = v => { b.style.clipPath = `inset(0 0 0 ${v}%)`; line.style.left = v + '%'; };
    const pick = v => { $('.lab-a', w).src = src(v); $('.lab-tag.l', w).textContent = DRAFTS[v][0]; note.textContent = `${DRAFTS[v][0]}: ${DRAFTS[v][2]} v7: ${DRAFTS[7][2]}`; w.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', x.dataset.v == v)); };
    range.addEventListener('input', () => set(range.value));
    w.addEventListener('click', e => { const x = e.target.closest('[data-v]'); if (x) pick(+x.dataset.v); });
    set(50); pick(1);
  };

  /* ---------- app: notepad ---------- */
  const openNote = (name, text, doc) => {
    const fresh = !wins.notepad;
    const o = fresh ? makeWin('notepad', name + ' - Notepad', IC.notepad) : wins.notepad;
    st.opened = true;
    if (fresh) {
      o.zoom = 100; o.wrap = true; o.bar = true;
      $('.os-body', o.el).innerHTML = `<div class="os-menu" role="menubar">
          <div><button type="button" data-menu>File</button><div class="os-dd" hidden><button type="button" data-n="new">New<kbd>Ctrl+N</kbd></button><button type="button" data-n="save">Save as .txt<kbd>Ctrl+S</kbd></button><button type="button" data-n="print">Print<kbd>Ctrl+P</kbd></button><hr><button type="button" data-n="close">Close</button></div></div>
          <div><button type="button" data-menu>Edit</button><div class="os-dd" hidden><button type="button" data-n="undo">Undo<kbd>Ctrl+Z</kbd></button><button type="button" data-n="copy">Copy all</button><button type="button" data-n="all">Select all<kbd>Ctrl+A</kbd></button><button type="button" data-n="date">Time/Date<kbd>F5</kbd></button></div></div>
          <div><button type="button" data-menu>View</button><div class="os-dd" hidden><button type="button" data-n="zin">Zoom in<kbd>Ctrl++</kbd></button><button type="button" data-n="zout">Zoom out<kbd>Ctrl+-</kbd></button><button type="button" data-n="z0">Restore zoom</button><hr><button type="button" data-n="wrap">Word wrap<i class="ck"></i></button><button type="button" data-n="bar">Status bar<i class="ck"></i></button></div></div></div>
        <textarea class="os-pre" spellcheck="false" aria-label="Text"></textarea>
        <div class="os-npbar"><span class="pos">Ln 1, Col 1</span><span class="zm">100%</span><span>Windows (CRLF)</span><span>UTF-8</span></div>`;
      const w = o.el, ta = $('textarea', w), dd = () => w.querySelectorAll('.os-dd').forEach(d => (d.hidden = true));
      const paint = () => { ta.style.fontSize = (13.5 * o.zoom / 100) + 'px'; ta.style.whiteSpace = o.wrap ? 'pre-wrap' : 'pre'; $('.zm', w).textContent = o.zoom + '%'; $('.os-npbar', w).hidden = !o.bar; w.querySelector('[data-n="wrap"] .ck').innerHTML = o.wrap ? svg('check') : ''; w.querySelector('[data-n="bar"] .ck').innerHTML = o.bar ? svg('check') : ''; };
      const pos = () => { const v = ta.value.slice(0, ta.selectionStart).split('\n'); $('.pos', w).textContent = `Ln ${v.length}, Col ${v[v.length - 1].length + 1}`; };
      const act = n => {
        dd();
        if (n === 'new') { o.doc = null; o.name = 'Untitled.txt'; ta.value = ''; setTitle('notepad', 'Untitled - Notepad'); ta.focus(); }
        if (n === 'save') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ta.value.replace(/\n/g, '\r\n')], { type: 'text/plain' })); a.download = o.name || 'Untitled.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
        if (n === 'print') { const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;width:0;height:0;border:0'; document.body.appendChild(f); f.contentDocument.body.innerHTML = '<pre style="font:13px Consolas,monospace;white-space:pre-wrap"></pre>'; f.contentDocument.querySelector('pre').textContent = ta.value; f.contentWindow.print(); setTimeout(() => f.remove(), 1000); }
        if (n === 'close') closeApp('notepad');
        if (n === 'undo') { ta.focus(); document.execCommand('undo'); }
        if (n === 'copy') { (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).catch(() => { ta.select(); document.execCommand('copy'); }); }
        if (n === 'all') { ta.focus(); ta.select(); }
        if (n === 'date') { ta.focus(); const d = new Date(); document.execCommand('insertText', false, d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-GB')); }
        if (n === 'zin') o.zoom = Math.min(300, o.zoom + 10); if (n === 'zout') o.zoom = Math.max(50, o.zoom - 10); if (n === 'z0') o.zoom = 100;
        if (n === 'wrap') o.wrap = !o.wrap; if (n === 'bar') o.bar = !o.bar;
        paint();
      };
      w.addEventListener('click', e => {
        const m = e.target.closest('[data-menu]'); if (m) { const d = m.nextElementSibling, was = d.hidden; dd(); d.hidden = !was; return; }
        const n = e.target.closest('[data-n]'); if (n) { act(n.dataset.n); return; }
        if (!e.target.closest('.os-dd')) dd();
      });
      w.addEventListener('pointerover', e => { const m = e.target.closest('[data-menu]'); if (m && w.querySelector('.os-dd:not([hidden])')) { dd(); m.nextElementSibling.hidden = false; } });
      ta.addEventListener('keydown', e => {
        if (!(e.ctrlKey || e.metaKey) && e.key !== 'F5') return;
        const map = { s: 'save', p: 'print', n: 'new', '=': 'zin', '+': 'zin', '-': 'zout', '0': 'z0' }; const n = e.key === 'F5' ? 'date' : map[e.key.toLowerCase()];
        if (n) { e.preventDefault(); act(n); }
      });
      ta.addEventListener('input', () => { if (o.doc) o.doc.text = ta.value; pos(); });
      ['click', 'keyup', 'select'].forEach(ev => ta.addEventListener(ev, pos));
      o.paintNp = paint; paint();
    }
    o.doc = doc || null; o.name = name;
    const ta = $('textarea', o.el); ta.value = text; ta.scrollTop = 0;
    setTitle('notepad', name + ' - Notepad');
    o.el.hidden = false; focusWin('notepad'); mark();
    if (!text) setTimeout(() => ta.focus(), 50);
  };

  /* ---------- open / close ---------- */
  const paintClock = () => { if (!root) return; const [t, d] = now(); const b = root.querySelectorAll('.os-clock b'); b[0].textContent = t; b[1].textContent = d; };
  const open = exitFn => {
    onExit = exitFn; if (!root) build();
    root.classList.add('on'); fit(); paintClock(); clearInterval(tick); tick = setInterval(paintClock, 15000);
    if (!st.opened) openApp('garden');
    setTimeout(() => { const f = root.querySelector('.os-ic'); f && f.focus({ preventScroll: true }); }, 400);
  };
  const exit = () => { if (!root) return; fly(null); ctx(null); root.classList.remove('on'); clearInterval(tick); changed(); onExit && onExit(); };
  window.ndOS = {
    open, exit, paint, paintWall, SW, SH,
    get isOpen() { return !!root && root.classList.contains('on'); },
    set onChange(fn) { onChange = fn; }
  };
})();
