/* Projects: an index of three builds, and a scrolling case study for each (projects.html?p=id). */
(() => {
  const root = document.getElementById('cs');
  if (!root) return;

  const P = [
    { id: 'kuwago', no: 'A-101.1', t: 'kuwaGO', kind: 'Mobile app', year: 'Sep – Oct 2026', team: 'Solo', role: 'Concept, design, pixel art, Firebase, testing', status: 'v1.0.5 · 18 testers',
      device: 'phone', tag: 'A cozy pixel-art study garden. Finish a focus session and your plant grows; give up and it wilts.', tall: true, poster: 'assets/video/kuwago-poster.jpg',
      link: ['https://neckolescano.github.io/kuwaGO/', 'Visit the kuwaGO site'],
      stats: [[30, '', 'days from idea to tester build'], [18, '', 'real testers'], [72, '', 'automated tests'], [13, '', 'plants to unlock']],
      problem: 'Your phone keeps stealing your focus. Studying alone is easy to quit, and rereading notes feels like work but teaches little.',
      idea: 'What if studying grew a garden instead? Every focus session grows a pixel plant, giving up makes it wilt, and AI turns your own notes into quizzes and flashcards.',
      features: [
        ['A focus timer you can lock', 'Pick five minutes to two hours. Deep Focus pins the app so everything else is locked away until the session ends. Leave anyway and you have ten seconds to come back. It came straight from a tester asking for it.', 'shots/kuwago-timer'],
        ['Plants that grow, or wilt', 'Five growth stages, from seed to full grown. Finish a session and your plant grows a stage. Give up and it wilts until your next session revives it.', 'shots/kuwago-home'],
        ['Flashcards from your own notes', 'Write notes during a session. One tap turns them into flashcards you sort into Learned or Review again.', 'shots/kuwago-flashcard'],
        ['Quizzes, summaries and key ideas', 'Multiple choice, true or false and identification, with a score at the end. Summary, Key Ideas and Explain work too, and a built-in maker keeps them working offline.', 'shots/kuwago-summary'],
        ['Harvest and collect', 'Fully grown plants are harvested into your garden. Thirteen species unlock as you keep studying, one of them secret.', 'shots/kuwago-garden'] ],
      partTitle: 'How I built it',
      part: ['Came up with the concept and the game rules, and designed every screen in Figma.', 'Drew the core pixel art by hand in Piskel, and set the style for everything else.', 'Directed the build with AI-assisted development (Claude), reviewing and testing every change on a real phone.', 'Set up Firebase myself: sign-in, Firestore and its security rules, AI Logic and App Check, plus a Cloudflare Worker so no AI key ships inside the app.', 'Shared test builds with 18 testers and turned their feedback into features.'],
      stack: [['App', ['Flutter', 'Dart']], ['Backend', ['Firebase Auth', 'Firestore', 'App Check', 'Cloudflare Workers']], ['AI', ['Gemini', 'Groq (backup)']], ['Design', ['Figma', 'Piskel']]],
      gallery: [['shots/kuwago-home', 'The greenhouse and your growing plant'], ['shots/kuwago-timer', 'A focus session in the Firefly Forest'], ['shots/kuwago-flashcard', 'Flashcards made from your notes'], ['shots/kuwago-summary', 'A summary of your notes'], ['shots/kuwago-garden', 'The garden archive and the next unlock']] },

    { id: 'cinematheque', no: 'A-101.2', t: 'Cinematheque', full: 'Cinematheque Centre Davao', kind: 'Web system', year: '2026', team: 'Group of three', role: 'Group project · System Integration and Architecture', status: 'Revised after client evaluation',
      device: 'laptop', url: 'cinemathequecentredavao', tag: 'Pick your seat. Pay online. Walk right in. A ticketing and reservation system for a real cinema in Davao City.', poster: 'assets/video/cinematheque-poster.jpg',
      stats: [[120, '', 'seats on the real floor plan'], [129, '', 'automated tests passing'], [15, ' min', 'hold on an unpaid booking'], [20, '%', 'off for PWD and Seniors']],
      problem: 'A real cinema needed bookings it could trust: no seat sold twice, payments that are actually verified, and a monthly report that matches the head office sheets exactly.',
      idea: 'Every seat is a ticket with one named guest. Payment is confirmed by asking PayMongo directly, and the staff side turns each screening into the report the head office already uses.',
      features: [
        ['Pick your exact seat', 'The real floor plan: rows J to A, screen at the front, 120 seats. A seat is locked the moment someone books it, so it can never be sold twice.', 'shots/cinematheque-seats'],
        ['Pay online, priced per ticket', 'GCash or Maya through PayMongo. A PWD or Senior ID takes 20% off that one ticket. The server checks every payment with PayMongo itself, because a redirect alone proves nothing.', 'shots/cinematheque-attendees'],
        ['An e-ticket, then the door', 'The e-ticket is emailed once payment is verified. Check-in opens 20 minutes before the film, and staff admit each guest at the door.', 'shots/cinematheque-staff-roster'],
        ['The head office report', 'Every program becomes the report Manila already uses, exported to .xlsx in their own layout. Once submitted it stays locked until the Super Admin unlocks it.', 'shots/cinematheque-staff-reports'] ],
      partTitle: 'How it is built',
      part: ['Laravel 12 on PHP 8.2 with MySQL, server-rendered with Blade and hand-written CSS and JavaScript.', 'PayMongo hosted checkout, with a signature-checked webhook as a backup for customers who close the tab.', 'Draft, review and publish for films and screenings, with batch scheduling that refuses overlapping showtimes.', 'A small .xlsx writer of its own, because the usual library needed an extension the server did not have.', 'Revised after the client evaluation: programs, automatic approval, a compulsory review step and a Super Admin role.'],
      stack: [['Backend', ['Laravel 12', 'PHP 8.2', 'MySQL']], ['Payments and mail', ['PayMongo', 'SMTP']], ['Front end', ['Blade', 'HTML', 'CSS', 'JavaScript']], ['Quality', ['PHPUnit · 129 tests']]],
      gallery: [['shots/cinematheque-home', 'Now showing, on the customer site'], ['shots/cinematheque-film', 'A film page with its showtimes'], ['shots/cinematheque-staff-dashboard', 'The staff dashboard'], ['shots/cinematheque-staff-roster', 'The roster at the door']] },

    { id: 'xpera', no: 'A-101.3', t: 'xpera CRM', kind: 'Desktop system', year: 'Oct 2026 – present', team: 'Solo', role: 'Brand, design, use cases, app and databases', status: 'In progress · Lab 1 done',
      device: 'monitor', tag: 'XP + era: level up every customer. A customer system for small stores that sell gaming PC parts.', poster: 'assets/video/xpera-poster.jpg',
      stats: [[15, '', 'use cases'], [4, '', 'user roles'], [3, '', 'subscription plans'], [200, '+', 'seeded sales per store']],
      problem: 'Small PC parts stores keep customers in notebooks and memory: who bought what, who still owes, who asked for a part that was out of stock.',
      idea: 'A CRM sold as a subscription. Each store gets its own database so its records stay its own, and its plan decides how much it can do.',
      features: [
        ['Know who they are', 'Every customer of the store in one list, with what they spent, when they last came in, and whether they owe anything.', 'shots/xpera-customers'],
        ['Know what they buy', 'A simple checkout that starts with the customer, not the cart. Prices always come from the database, never from the screen.', 'shots/xpera-sales'],
        ['Know what they owe', 'Credit sales and payments, applied oldest first, so every balance and due date stays right.', 'shots/xpera-payments'],
        ['Customer care that follows up', 'Inquiries, complaints and feedback each have a status. Asking for a part that is out of stock keeps the inquiry open, so staff call back when it returns.', 'shots/xpera-inquiries'] ],
      partTitle: 'How I built it',
      part: ['Wrote the rationale and the 15 use cases, and planned the schedule in ProjectLibre.', 'Designed the brand: three blades for the store, one long red blade for the customer relationship growing.', 'Designed the screens in Figma and built them in C# WinForms, with custom controls and a dark mode.', 'Split the solution into UI, domain, infrastructure and API projects, with EF Core code-first migrations.', 'Gave every store its own SQL login, and checked that one store cannot read another.'],
      stack: [['App', ['C#', '.NET WinForms']], ['Data', ['SQL Server', 'EF Core']], ['Service', ['ASP.NET API']], ['Planning and design', ['Figma', 'ProjectLibre']]],
      gallery: [['shots/xpera-products', 'Products and their availability'], ['shots/xpera-feedback', 'Feedback with a rating'], ['shots/xpera-sales', 'A sale, ready to save'], ['shots/xpera-customers', 'Every customer in one list']] }
  ];

  const id = new URLSearchParams(location.search).get('p');
  const p = P.find(x => x.id === id);
  const img = n => n.includes('/') ? `assets/${n}.jpg` : `assets/cs/${n}.jpg`;
  // a phone, a laptop or a monitor around the real screenshots
  const device = (p, screens) => p.device === 'phone'
    ? `<div class="device phone"><i class="island"></i><div class="screen">${screens}</div></div>`
    : p.device === 'laptop'
    ? `<div class="device laptop"><div class="lid"><div class="chrome"><i></i><i></i><i></i><span>${p.url || ''}</span></div><div class="screen">${screens}</div></div><div class="base"><i></i></div></div>`
    : `<div class="device monitor"><div class="lid"><div class="screen">${screens}</div><i class="logo"></i></div><div class="neck"></div><div class="foot"></div></div>`;
  const chips = list => list.map(c => `<span class="chip">${c}</span>`).join('');

  /* ---------- the index: three builds ---------- */
  if (!p) {
    root.classList.add('cs-index');
    root.innerHTML = `
      <p class="mono kicker rv">Frame 01 — Selected work</p>
      <h1 class="h-display rv">Projects</h1>
      <p class="lede rv">Three builds, each one started as a drawing. Pick one to see it in detail.</p>
      <div class="pcards">${P.map((x, i) => `
        <a class="pcard rv${x.tall ? ' tall' : ''}" href="projects.html?p=${x.id}" data-go>
          <span class="pc-media"><img src="${x.poster}" alt="" loading="lazy"><video src="assets/video/${x.id}.mp4" muted loop playsinline preload="none"></video></span>
          <span class="pc-text">
            <span class="mono pc-no">${x.no} · ${x.kind} · ${x.year}</span>
            <span class="pc-title">${x.t}</span>
            <span class="pc-tag">${x.tag}</span>
            <span class="pc-go mono">Open the case study <i>&rarr;</i></span>
          </span>
        </a>`).join('')}</div>`;
    root.querySelectorAll('.pcard').forEach(c => {
      const v = c.querySelector('video');
      c.addEventListener('pointerenter', () => v.play().catch(() => {}));
      c.addEventListener('pointerleave', () => v.pause());
    });
    return;
  }

  /* ---------- one case study ---------- */
  document.title = `${p.full || p.t} — Nicho.dev`;
  document.body.classList.add('single');
  const next = P[(P.indexOf(p) + 1) % P.length];
  root.innerHTML = `
    <section class="cs-hero">
      <p class="mono kicker rv">Frame ${p.no} — ${p.kind}</p>
      <h1 class="cs-title rv">${p.full || p.t}</h1>
      <p class="cs-tag rv">${p.tag}</p>
      <dl class="cs-meta rv">
        <div><dt>Year</dt><dd>${p.year}</dd></div><div><dt>Team</dt><dd>${p.team}</dd></div>
        <div><dt>Role</dt><dd>${p.role}</dd></div><div><dt>Status</dt><dd>${p.status}</dd></div>
      </dl>
    </section>

    <section class="cs-film${p.tall ? ' tall' : ''}" id="film">
      <div class="film-frame">
        <video src="assets/video/${p.id}.mp4" poster="${p.poster}" muted loop playsinline autoplay preload="auto" aria-label="${p.t} film"></video>
        <button class="film-btn mono" type="button" aria-label="Pause the film"><span>Pause</span></button>
      </div>
      ${p.tall ? `<div class="film-notes l">${p.features.slice(0, 2).map((f, i) => `<p class="rv"><b class="mono">0${i + 1}</b>${f[0]}</p>`).join('')}</div><div class="film-notes r">${p.features.slice(2, 4).map((f, i) => `<p class="rv"><b class="mono">0${i + 3}</b>${f[0]}</p>`).join('')}</div>` : ''}
      <p class="mono film-cap">Fig. 01 — ${p.tall ? 'The app, recorded on a real phone' : 'Pitch film'}</p>
    </section>

    <section class="cs-stats">${p.stats.map(s => `<div class="stat rv"><b data-count="${s[0]}" data-suffix="${s[1]}">0${s[1]}</b><span>${s[2]}</span></div>`).join('')}</section>

    <section class="cs-brief">
      <div class="rv"><p class="mono sec-no">01 — The problem</p><p class="big">${p.problem}</p></div>
      <div class="rv"><p class="mono sec-no">02 — The idea</p><p class="big">${p.idea}</p></div>
    </section>

    <section class="cs-feat">
      <p class="mono sec-no rv">03 — What it does</p>
      <div class="feat-grid">
        <div class="feat-stage dev-${p.device}" aria-hidden="true">${device(p, p.features.map((f, i) => `<img src="${img(f[2])}" alt="" class="${i ? '' : 'on'}" data-i="${i}">`).join(''))}<span class="mono feat-count"><b>01</b> / 0${p.features.length}</span></div>
        <ol class="feat-steps">${p.features.map((f, i) => `<li class="step" data-i="${i}"><span class="step-dev dev-${p.device}">${device(p, `<img class="on" src="${img(f[2])}" alt="" loading="lazy">`)}</span><span class="mono">0${i + 1}</span><h3>${f[0]}</h3><p>${f[1]}</p></li>`).join('')}</ol>
      </div>
    </section>

    <section class="cs-part">
      <div class="rv"><p class="mono sec-no">04 — ${p.partTitle}</p></div>
      <ol class="part-list">${p.part.map((x, i) => `<li class="rv"><span class="mono">${String(i + 1).padStart(2, '0')}</span><p>${x}</p></li>`).join('')}</ol>
    </section>

    <section class="cs-stack">
      <p class="mono sec-no rv">05 — Built with</p>
      <div class="stack-grid">${p.stack.map(s => `<div class="rv"><h4 class="mono">${s[0]}</h4><p class="chips">${chips(s[1])}</p></div>`).join('')}</div>
      ${p.link ? `<a class="btn solid rv" href="${p.link[0]}" target="_blank" rel="noopener">${p.link[1]} ↗</a>` : ''}
    </section>

    <section class="cs-gallery">
      <p class="mono sec-no rv">06 — Sheets</p>
      <div class="strip${p.tall ? ' tall' : ''} dev-${p.device}" tabindex="0" aria-label="Gallery, scroll sideways">${p.gallery.map((g, i) => `<figure class="rv"><img src="${img(g[0])}" alt="${g[1]}" loading="lazy"><figcaption class="mono"><b>Fig. 0${i + 2}</b> ${g[1]}</figcaption></figure>`).join('')}</div>
    </section>

    <a class="cs-next" href="projects.html?p=${next.id}" data-go>
      <span class="mono">Next project</span>
      <span class="next-title">${next.full || next.t} <i>&rarr;</i></span>
      <span class="next-media"><img src="${next.poster}" alt="" loading="lazy"></span>
    </a>
    <p class="cs-all"><a class="mono" href="projects.html" data-go>All projects</a></p>`;

  /* the film: pause/play, and it grows to full size as it scrolls into view */
  const film = document.getElementById('film'), vid = film.querySelector('video'), fbtn = film.querySelector('.film-btn');
  const paint = () => { fbtn.querySelector('span').textContent = vid.paused ? 'Play' : 'Pause'; fbtn.setAttribute('aria-label', vid.paused ? 'Play the film' : 'Pause the film'); };
  fbtn.addEventListener('click', () => { vid.paused ? vid.play() : vid.pause(); paint(); });
  vid.addEventListener('play', paint); vid.addEventListener('pause', paint);

  /* the device leans a little toward the pointer */
  const dev = root.querySelector('.feat-stage .device');
  if (dev && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.querySelector('.feat-stage').addEventListener('pointermove', e => {
      const r = e.currentTarget.getBoundingClientRect();
      dev.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg');
      dev.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg');
    });
    root.querySelector('.feat-stage').addEventListener('pointerleave', () => { dev.style.removeProperty('--ry'); dev.style.removeProperty('--rx'); });
  }

  /* features: the picture on the left follows the step you are reading */
  const stage = root.querySelector('.feat-stage'), count = stage.querySelector('.feat-count b');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = e.target.dataset.i;
    root.querySelectorAll('.step').forEach(s => s.classList.toggle('on', s.dataset.i === i));
    stage.querySelectorAll('.screen img').forEach(im => im.classList.toggle('on', im.dataset.i === i));
    count.textContent = String(+i + 1).padStart(2, '0');
  }), { rootMargin: '-45% 0px -45% 0px' });
  root.querySelectorAll('.step').forEach(s => io.observe(s));
})();
