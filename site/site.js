// iolite.team : animations et interactions
(function () {
  var APP_STORE_URL = '';                 // à renseigner au lancement : https://apps.apple.com/fr/app/iolite/id…
  var doc = document.documentElement, body = document.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!APP_STORE_URL) {
    var toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status');
    toast.innerHTML = '<img src="/icon-192.png" alt=""><p><b>Bientôt sur l\'App Store</b>L\'app iPhone arrive très vite. En attendant, utilisez la version web avec le même compte.</p><a href="https://iolite-app.pages.dev">Version web</a>';
    body.appendChild(toast); var tt;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-store], a[href="#telecharger"]'); if (!a) return;
      if (a.hasAttribute('data-store')) e.preventDefault();
      clearTimeout(tt); toast.classList.add('on'); tt = setTimeout(function () { toast.classList.remove('on'); }, 5200);
    });
  }
  if (APP_STORE_URL) {
    document.querySelectorAll('[data-store]').forEach(function (a) { a.href = APP_STORE_URL; a.target = '_blank'; a.rel = 'noopener'; });
    document.querySelectorAll('[data-store-small]').forEach(function (s) { s.textContent = 'Télécharger dans'; });
  }

  /* ---------- barre de navigation ---------- */
  var nav = document.getElementById('nav'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    nav.classList.toggle('solid', y > 10);
    nav.classList.toggle('hide', y > 400 && y > lastY + 4 && !body.classList.contains('menu-open'));
    if (y < lastY - 4 || y < 400) nav.classList.remove('hide');
    lastY = y;
  }
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open); body.classList.toggle('menu-open', open);
    if (open) { mnav.hidden = false; requestAnimationFrame(function () { mnav.classList.add('open'); }); body.style.overflow = 'hidden'; }
    else { mnav.classList.remove('open'); body.style.overflow = ''; setTimeout(function () { if (!mnav.classList.contains('open')) mnav.hidden = true; }, 350); }
  }
  burger.addEventListener('click', function () { setMenu(mnav.hidden || !mnav.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- chronomètres « en service » ---------- */
  var timers = document.querySelectorAll('[data-timer]'), t0 = Date.now();
  function tick() {
    var el = (Date.now() - t0) / 1000;
    timers.forEach(function (t) {
      var s = Math.floor(+t.dataset.timer + el), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
      t.textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- compteurs ---------- */
  function fmt(v, f) { return f === 'eur' ? Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €' : String(Math.round(v)); }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseFloat(el.dataset.count), f = el.dataset.fmt, s = null, dur = 1600;
    if (reduce || to === 0) { el.textContent = fmt(to, f); return; }
    requestAnimationFrame(function step(t) { if (!s) s = t; var p = Math.min(1, (t - s) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e, f); if (p < 1) requestAnimationFrame(step); });
  }
  var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- souris : halo, inclinaisons, boutons aimantés ---------- */
  if (fine && !reduce) {
    body.classList.add('has-mouse');
    var fan = document.querySelector('.fan'), mx = 0, my = 0, raf = 0;
    addEventListener('pointermove', function (e) {
      doc.style.setProperty('--mx', e.clientX + 'px'); doc.style.setProperty('--my', e.clientY + 'px');
      mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
      if (fan && !raf) raf = requestAnimationFrame(function () { raf = 0; fan.style.setProperty('--ry', (-14 + mx * 22) + 'deg'); fan.style.setProperty('--rx', (8 - my * 14) + 'deg'); });
    }, { passive: true });
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .15s ease-out';
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 10) + 'deg) rotateY(' + (x * 12) + 'deg) translateZ(10px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; });
    });
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .22 + 'px,' + (e.clientY - r.top - r.height / 2) * .3 + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- histoire au défilement : l'écran du téléphone change ---------- */
  var steps = document.querySelectorAll('.step'), imgs = document.querySelectorAll('#storyPhone .ph-stack img'), dots = document.querySelectorAll('.story-dots i'), sp = document.getElementById('storyPhone');
  if (steps.length) {
    var setStep = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      if (sp && !reduce) sp.style.transform = 'rotateY(' + (i % 2 ? 14 : -14) + 'deg) rotateX(6deg) rotateZ(' + (i % 2 ? 2 : -2) + 'deg)';
    };
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setStep(+e.target.dataset.screen); }); }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
    setStep(0);
  }

  /* ---------- animations GSAP (si la bibliothèque est chargée) ---------- */
  function fallbackReveal() {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
    document.querySelectorAll('[data-float]').forEach(function (el, i) { el.classList.add('float-a'); el.style.animationDelay = (i * -1.4) + 's'; });
  }
  function initGsap() {
    var g = window.gsap, ST = window.ScrollTrigger;
    if (!g || !ST || reduce) { fallbackReveal(); return; }
    g.registerPlugin(ST); doc.classList.add('gsap-on');

    // entrée de page
    var has = function (sel) { return document.querySelector(sel); };
    var tl = g.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.display .ln>span', { yPercent: 115, rotate: 4, duration: 1, stagger: .08 })
      .from('[data-hero]:not(.display)', { y: 26, opacity: 0, duration: .9, stagger: .06 }, .15);
    if (document.querySelector('.fan')) {
      tl.from('.fan .phone', { y: 220, opacity: 0, rotateX: 36, duration: 1.2, stagger: .1, ease: 'power4.out' }, .1)
        .from('.hero-stage .chip', { scale: .6, opacity: 0, y: 30, duration: .8, stagger: .1, ease: 'back.out(1.7)' }, .6);
      g.to('.fan', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.f-l', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.f-r', { xPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    // cartes flottantes
    document.querySelectorAll('[data-float]').forEach(function (el, i) {
      g.to(el, { y: i % 2 ? 14 : -14, x: i % 2 ? -6 : 6, duration: 3 + i * .6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.6 });
    });
    // fond : léger défilement du dégradé
    g.to(doc, { '--by': '-18vh', ease: 'none', scrollTrigger: { trigger: body, start: 'top top', end: 'bottom bottom', scrub: true } });

    // apparitions au défilement
    g.set('[data-reveal]', { opacity: 0, y: 70 });
    ST.batch('[data-reveal]', { start: 'top 88%', once: true, onEnter: function (els) { g.to(els, { opacity: 1, y: 0, duration: 1.2, stagger: .09, ease: 'expo.out', overwrite: true }); } });

    // téléphones inclinés qui pivotent en défilant
    document.querySelectorAll('.tilt-l, .tilt-r').forEach(function (ph) {
      var l = ph.classList.contains('tilt-l');
      g.fromTo(ph, { rotationY: l ? 34 : -34, rotationX: 14, rotationZ: l ? -4 : 4, transformPerspective: 1600 },
        { rotationY: l ? 8 : -8, rotationX: 2, rotationZ: 0, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'center 40%', scrub: 1 } });
    });
    document.querySelectorAll('.duo .d2').forEach(function (ph) { g.fromTo(ph, { y: 140 }, { y: 40, ease: 'none', scrollTrigger: { trigger: ph.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1 } }); });

    // galerie horizontale
    var track = document.querySelector('.g-track');
    if (track) {
      g.to(track, { x: function () { return -(track.scrollWidth - innerWidth); }, ease: 'none',
        scrollTrigger: { trigger: '.gallery', start: 'top 90%', end: 'bottom -40%', scrub: 1, invalidateOnRefresh: true } });
    }
    // grand texte du pied de page
    if (has('.foot-big')) g.from('.foot-big', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 40%', scrub: true } });
    // téléphones de l'appel final
    if (has('.final-phones')) g.from('.final-phones .phone', { y: 200, rotateX: 30, opacity: 0, stagger: .1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 75%' } });
    // écran verrouillé et widgets
    document.querySelectorAll('.lock3d, .widgets, .islands').forEach(function (el) {
      g.from(el.classList.contains('lock3d') ? el : el.children, { rotateX: 30, y: 80, opacity: 0, duration: 1.3, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    if (has('.notif-stack')) g.from('.nt', { x: 120, opacity: 0, duration: 1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.notif-stack', start: 'top 80%' } });

    addEventListener('load', function () { ST.refresh(); });
  }
  if (window.gsap) initGsap(); else addEventListener('load', initGsap);
})();
