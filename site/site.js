// iolite.team : interactions du site de présentation
(function () {
  // Liens à mettre à jour au lancement
  var APP_STORE_URL = '';                          // ex. https://apps.apple.com/fr/app/iolite/id…
  var WEB_APP_URL = 'https://iolite-app.pages.dev';

  document.querySelectorAll('[data-webapp]').forEach(function (a) { a.href = WEB_APP_URL; });
  if (APP_STORE_URL) {
    document.querySelectorAll('[data-store]').forEach(function (a) { a.href = APP_STORE_URL; a.target = '_blank'; a.rel = 'noopener'; });
    document.querySelectorAll('[data-store-small]').forEach(function (s) { s.textContent = 'Télécharger dans'; });
  }

  // barre de navigation : fond flouté au défilement
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // menu mobile
  var burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
  function setMenu(open) { burger.setAttribute('aria-expanded', open); mnav.hidden = !open; }
  burger.addEventListener('click', function () { setMenu(mnav.hidden); });
  mnav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1060) setMenu(false); });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // compteurs animés
  function fmt(v, f) {
    if (f === 'h') { var m = Math.round(v * 60); return Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0'); }
    return Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €';
  }
  function count(el) {
    var to = parseFloat(el.dataset.count), f = el.dataset.fmt, t0 = null, dur = 1400;
    if (reduce) { el.textContent = fmt(to, f); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e, f);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // apparitions au défilement
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });
  // compteurs du haut de page
  setTimeout(function () { document.querySelectorAll('.hero [data-count]').forEach(count); }, 500);

  // chronomètres « en service »
  var timers = document.querySelectorAll('[data-timer]'), start = Date.now();
  function tick() {
    var el = (Date.now() - start) / 1000;
    timers.forEach(function (t) {
      var s = Math.floor(+t.dataset.timer + el), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
      t.textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    });
  }
  tick(); setInterval(tick, 1000);
})();
