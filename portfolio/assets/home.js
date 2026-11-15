/* Portfolio Tao ROLA : page d'accueil */
(function () {
  const { icon, esc, CATEGORIES, CONTACT, getProjects, kindOf, ytId, homeNav, footer, devPlaceholder } = window.TR;
  const snap = document.getElementById('snap');

  document.getElementById('nav').innerHTML = homeNav('accueil');
  document.getElementById('pied').innerHTML = footer();
  document.getElementById('socials').innerHTML = [
    [CONTACT.instagram, 'instagram', 'Instagram'], [CONTACT.linkedin, 'linkedin', 'LinkedIn'], ['mailto:' + CONTACT.email, 'mail', 'E-mail'],
  ].map(([h, i, l]) => `<a href="${h}" target="_blank" rel="noopener noreferrer" aria-label="${l}" class="w-11 h-11 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white/60 transition-all duration-300 hover:scale-110">${icon(i)}</a>`).join('');

  /* texte qui s'écrit */
  const WORDS = ['Photographe', 'Développeur', 'Vidéaste', 'Designer', 'Créatif'];
  const typed = document.getElementById('typed');
  let w = 0, txt = '', del = false;
  (function tick() {
    const word = WORDS[w];
    if (del) {
      if (txt.length) txt = txt.slice(0, -1); else { del = false; w = (w + 1) % WORDS.length; }
      typed.textContent = txt; return setTimeout(tick, 50);
    }
    if (txt.length < word.length) { txt = word.slice(0, txt.length + 1); typed.textContent = txt; return setTimeout(tick, 100); }
    setTimeout(() => { del = true; tick(); }, 1500);
  })();

  /* repères à droite + navigation */
  const SECS = ['accueil', 'categories'];
  const CATS = ['audiovisuel', 'graphisme', 'developpement'];
  const dots = document.getElementById('dots');
  dots.innerHTML = SECS.map((id) => `<button type="button" data-goto="${id}" class="group relative flex items-center p-1.5 -m-1.5" aria-label="Aller à ${id}"><span class="dot block rounded-full transition-all duration-300" style="width:4px;height:8px;background:rgba(255,255,255,.4)"></span></button>`).join('');
  const goTo = (id) => { const el = document.getElementById(id); if (el) snap.scrollTo({ top: el.offsetTop, behavior: 'smooth' }); };
  const highlight = (cat) => {
    const c = document.querySelector(`[data-card="${cat}"]`); if (!c) return;
    c.classList.add('ring-2', 'ring-emerald-500/70');
    setTimeout(() => c.classList.remove('ring-2', 'ring-emerald-500/70'), 1400);
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]'); if (!b) return;
    e.preventDefault();
    const id = b.dataset.goto;
    if (CATS.includes(id)) { goTo('categories'); setTimeout(() => highlight(id), 450); setActive('categories', id); }
    else goTo(id);
  });

  let lastCat = null;
  function setActive(id, cat) {
    if (cat) lastCat = cat; else if (id === 'categories') cat = lastCat; else lastCat = null;
    dots.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.goto === id, d = b.querySelector('.dot');
      d.style.height = on ? '28px' : '8px'; d.style.background = on ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)';
    });
    const navOn = id === 'accueil' ? 'accueil' : cat || null;
    document.querySelectorAll('#nav .nav-btn').forEach((b) => {
      const on = b.dataset.goto === navOn;
      b.querySelector('.nav-pill').classList.toggle('opacity-100', on); b.querySelector('.nav-pill').classList.toggle('opacity-0', !on);
      const l = b.querySelector('.nav-label');
      l.classList.toggle('text-white', on); l.classList.toggle('text-white/70', !on);
    });
    dots.style.opacity = id === 'pied' ? '0' : '1';
  }
  const secObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    setActive(e.target.id);
  }), { root: snap, threshold: 0.55 });
  [...SECS, 'pied'].forEach((id) => secObs.observe(document.getElementById(id)));
  setActive('accueil');

  /* trois grandes cases avec exemples qui défilent en fond flouté */
  const rotators = {};
  function cardShell(cat) {
    const c = CATEGORIES[cat];
    return `
      <a href="${c.href}" data-card="${cat}" class="group relative block h-full min-h-0 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 bg-[#0a0a0a] transition-all duration-500">
        <div class="bg-layers absolute inset-0 transition-transform duration-700 group-hover:scale-105"></div>
        <div class="absolute inset-0 ${cat === 'developpement' ? 'bg-black/40 group-hover:bg-black/25' : 'bg-black/70 group-hover:bg-black/55'} transition-colors duration-500"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
        <div class="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6 lg:p-8">
          <div>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">${c.label}</h2>
            <p class="text-white/50 text-sm sm:text-base lg:text-lg mt-1.5 lg:mt-3">${c.sub}</p>
          </div>
          <span class="self-start inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/30 text-white text-xs sm:text-sm font-medium group-hover:bg-white/10 transition-all duration-300">${icon(c.icon)}${c.cta}</span>
        </div>
      </a>`;
  }

  function layerFor(p) {
    const k = kindOf(p);
    const cls = 'w-full h-full object-cover blur-sm animate-zoom';
    if (k === 'video') return `<video data-src="${esc(p.media_url)}" class="${cls}" muted loop playsinline preload="none"></video>`;
    if (k === 'youtube') return `<img src="https://i.ytimg.com/vi/${ytId(p.media_url)}/hqdefault.jpg" alt="" class="${cls}" loading="lazy">`;
    if (k === 'image') return `<img src="${esc(p.media_url)}" alt="" class="${cls}" loading="lazy">`;
    return '';
  }
  /* projets sans média (développement) : aperçu « navigateur » flouté */
  const devLayer = (p) => `<div class="w-full h-full blur-[2px] animate-zoom scale-110">${devPlaceholder(p, 'h-full')}</div>`;

  const cardsEl = document.getElementById('cards');
  cardsEl.innerHTML = CATS.map(cardShell).join('');

  async function buildCard(cat) {
    const card = cardsEl.querySelector(`[data-card="${cat}"]`);
    const layers = card.querySelector('.bg-layers');
    const projects = (await getProjects(cat)).slice(0, 6);
    const html = projects.map((p) => (kindOf(p) === 'none' ? (cat === 'developpement' ? devLayer(p) : '') : layerFor(p))).filter(Boolean);
    if (!html.length) {
      layers.innerHTML = `<div class="absolute inset-0 bg-grid animate-zoom"></div><div class="glow animate-float w-[70%] h-[70%] top-[15%] left-[15%]" style="background:radial-gradient(circle,#10b981 0%,transparent 70%)"></div>`;
      return;
    }
    layers.innerHTML = html.map((h, i) => `<div class="layer absolute inset-0 transition-opacity duration-1000 ${i ? 'opacity-0' : 'opacity-100'}">${h}</div>`).join('');
    rotators[cat] = { i: 0, n: html.length, layers: [...layers.querySelectorAll('.layer')] };
  }

  function playLayer(cat, on) {
    const r = rotators[cat]; if (!r) return;
    r.layers.forEach((l, idx) => {
      const v = l.querySelector('video'); if (!v) return;
      if (on && idx === r.i) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    });
  }
  let playing = false, timer = null;
  function setPlaying(on) {
    playing = on && !document.hidden;
    CATS.forEach((c) => playLayer(c, playing));
    clearInterval(timer); timer = null;
    if (!playing) return;
    let step = 0;
    /* les trois cases changent d'exemple en décalé, toutes les 6 s chacune */
    timer = setInterval(() => {
      const cat = CATS[step++ % CATS.length], r = rotators[cat];
      if (!r || r.n < 2) return;
      r.layers[r.i].classList.replace('opacity-100', 'opacity-0');
      r.i = (r.i + 1) % r.n;
      r.layers[r.i].classList.replace('opacity-0', 'opacity-100');
      playLayer(cat, true);
    }, 2000);
  }

  let inCats = false;
  new IntersectionObserver(([e]) => { inCats = e.isIntersecting; setPlaying(inCats); }, { root: snap, threshold: 0.3 }).observe(document.getElementById('categories'));
  Promise.all(CATS.map(buildCard)).then(() => setPlaying(inCats));
  document.addEventListener('visibilitychange', () => setPlaying(inCats));
})();
