/* Blueprint to build — all motion on the page follows one rule:
   things first appear as blue outlines (the plan), then fill in with ink (the build). */
(() => {
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const force = /[?&]motion=on/.test(location.search);
  if (force) root.classList.add('force-motion');
  const reduce = !force && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const desktop = matchMedia('(min-width: 1000px)');

  /* ---------- prepare the DOM ---------- */
  // letters that go outline → fill
  $('[data-chars]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'char'; s.textContent = c; s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      el.append(s);
    });
  });
  const build = (el, gap = 500) => { el.classList.add('drawn'); setTimeout(() => el.classList.add('built'), gap); };

  // words that ink in while you scroll
  $('[data-words]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });

  // Fig. 02: the cinema's real plan — rows J to A, 12 seats each
  const seats = document.getElementById('seats');
  [...'JIHGFEDCBA'].forEach((row, r) => {
    seats.insertAdjacentHTML('beforeend', `<span class="row">${row}</span>`);
    for (let c = 1; c <= 12; c++) {
      if (c === 7) seats.insertAdjacentHTML('beforeend', '<span></span>');
      const pick = row === 'F' && (c === 6 || c === 7);
      const taken = !pick && (r * 5 + c * 3) % 7 < 2;
      seats.insertAdjacentHTML('beforeend', `<i class="seat${pick ? ' pick' : taken ? ' taken' : ''}"></i>`);
    }
  });

  // Fig. 03: eleven months of sales, growing
  const bars = document.getElementById('bars');
  [22, 30, 27, 38, 44, 41, 55, 62, 70, 84, 96].forEach(h => {
    bars.insertAdjacentHTML('beforeend', `<i class="bar" style="--h:${h}%"></i>`);
  });

  // every figure gets a wireframe twin on top, plus the build line that wipes it away
  const visuals = $('[data-build]');
  visuals.forEach(v => {
    const wire = v.querySelector('.mock').cloneNode(true);
    wire.classList.add('wire'); wire.setAttribute('aria-hidden', 'true');
    $('[id]', wire).forEach(n => n.removeAttribute('id'));
    const line = document.createElement('div'); line.className = 'buildline';
    v.append(wire, line);
  });
  const setBuild = (v, p) => {
    v.style.setProperty('--p', p.toFixed(4));
    v.classList.toggle('is-building', p > 0.01 && p < 0.99);
    const built = p >= 0.99;
    if (built !== v.classList.contains('is-built')) {
      v.classList.toggle('is-built', built);
      v.querySelector('.state').textContent = built ? 'Built' : 'Draft';
    }
  };

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- page progress: ruler fills, graph paper fades ---------- */
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    root.style.setProperty('--prog', p.toFixed(4));
    root.style.setProperty('--grid', (1 - p * 0.92).toFixed(3));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- crosshair cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const coords = cursor.querySelector('span');
  const pad = n => String(Math.round(n)).padStart(4, '0');
  addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    coords.textContent = `x ${pad(e.clientX)} · y ${pad(e.clientY + scrollY)}`;
    cursor.classList.toggle('hot', !!e.target.closest('a, button'));
    cursor.classList.add('live');
  }, { passive: true });

  /* ---------- things that start once the loader lifts ---------- */
  const watch = (els, fn, opts = { threshold: 0.2 }) => {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); }
    }), opts);
    els.forEach(el => io.observe(el));
  };

  const countUp = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1500;
    if (reduce) { el.textContent = end; return; }
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const tweenBuild = v => {            // fallback when GSAP is not available
    const t0 = performance.now();
    const tick = t => {
      const k = Math.min(1, (t - t0) / 1400);
      setBuild(v, k);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  function start() {
    $('.hero-title .line').forEach((l, i) => setTimeout(() => build(l), i * 180));
    watch($('.reveal, .sec-head'), el => el.classList.add('in'), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    watch($('.contact-title .line'), el => build(el), { threshold: 0.4 });
    watch($('[data-count]'), countUp, { threshold: 0.6 });

    // "Sheet 03 / 06 — Work" in the nav
    const sheets = $('[data-sheet]');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      document.getElementById('sheetNo').textContent = String(sheets.indexOf(en.target) + 1).padStart(2, '0');
      document.getElementById('sheetName').textContent = en.target.dataset.sheet;
    }), { rootMargin: '-45% 0px -45% 0px' });
    sheets.forEach(s => io.observe(s));

    const steps = $('.step');

    if (!hasGsap || reduce) {
      $('.statement .w').forEach(w => (w.style.color = 'inherit'));
      if (reduce) visuals.forEach(v => setBuild(v, 1)); else watch(visuals, tweenBuild, { threshold: 0.35 });
      watch(steps, el => el.classList.add('on'), { threshold: 0.5 });
      return;
    }

    // the statement inks in word by word
    gsap.to('.statement .w', {
      color: '#121212', stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top 82%', end: 'bottom 48%', scrub: 0.4 }
    });

    // the name drifts up a little as you leave the cover
    gsap.to('.hero-title', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // each figure is built by scrolling: the build line sweeps left → right
    visuals.forEach(v => {
      const o = { p: 0 };
      gsap.to(o, {
        p: 1, ease: 'none', onUpdate: () => setBuild(v, o.p),
        scrollTrigger: { trigger: v, start: 'top 80%', end: 'top 18%', scrub: 0.5 }
      });
    });

    // process: on wide screens the five steps scroll sideways along one line
    const mm = gsap.matchMedia();
    const track = document.querySelector('.track');
    mm.add('(min-width: 1000px)', () => {
      const pin = document.querySelector('.process-pin');
      const dist = () => {
        const cs = getComputedStyle(pin);
        return Math.max(0, track.offsetWidth - (pin.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      };
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.process', start: 'center center', end: () => '+=' + (dist() * 1.3 + 300),
          pin: true, scrub: 0.5, invalidateOnRefresh: true,
          onUpdate: self => {
            track.style.setProperty('--tp', self.progress.toFixed(4));
            steps.forEach((s, i) => s.classList.toggle('on', self.progress * steps.length >= i - 0.15));
          }
        }
      });
      return () => { tw.kill(); gsap.set(track, { clearProps: 'x' }); };
    });
    mm.add('(max-width: 999px)', () => { watch(steps, el => el.classList.add('on'), { threshold: 0.5 }); });

    // buttons lean toward the pointer
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $('.btn').forEach(b => {
        b.addEventListener('mousemove', e => {
          const r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 });
        });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' }));
      });
    }

    addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- loader: draft the sheet, then lift it ---------- */
  const loader = document.querySelector('.loader');
  if (reduce) { loader.remove(); start(); return; }

  if (lenis) lenis.stop();
  root.style.overflow = 'hidden';
  scrollTo(0, 0);
  const count = loader.querySelector('.loader-count');
  const mark = loader.querySelector('.loader-mark');
  setTimeout(() => build(mark, 650), 150);
  const t0 = performance.now(), dur = 1700;
  const tick = t => {
    const k = Math.min(1, (t - t0) / dur);
    count.textContent = String(Math.round(k * 100)).padStart(3, '0');
    if (k < 1) return requestAnimationFrame(tick);
    loader.querySelector('.loader-status').textContent = 'Built';
    setTimeout(() => {
      loader.classList.add('done');
      root.style.overflow = '';
      if (lenis) lenis.start();
      setTimeout(start, 350);
      setTimeout(() => loader.remove(), 1200);
    }, 380);
  };
  requestAnimationFrame(tick);
})();
