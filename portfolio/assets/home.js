/* Portfolio Tao ROLA : page d'accueil */
(function () {
  const { icon, esc, CATEGORIES, CONTACT, getProjects, kindOf, ytId, homeNav, footer, devPlaceholder } = window.TR;
  const snap = document.getElementById('snap');
  const SECTIONS = ['accueil', 'audiovisuel', 'graphisme', 'developpement'];

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
  const dots = document.getElementById('dots');
  dots.innerHTML = SECTIONS.map((id) => `<button type="button" data-goto="${id}" class="group relative flex items-center p-1.5 -m-1.5" aria-label="Aller à ${id}"><span class="dot block rounded-full transition-all duration-300" style="width:4px;height:8px;background:rgba(255,255,255,.4)"></span></button>`).join('');
  const goTo = (id) => { const el = document.getElementById(id); if (el) snap.scrollTo({ top: el.offsetTop, behavior: 'smooth' }); };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b) { e.preventDefault(); goTo(b.dataset.goto); } });

  function setActive(id) {
    dots.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.goto === id, d = b.querySelector('.dot');
      d.style.height = on ? '28px' : '8px'; d.style.background = on ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)';
    });
    document.querySelectorAll('#nav .nav-btn').forEach((b) => {
      const on = b.dataset.goto === id;
      b.querySelector('.nav-pill').classList.toggle('opacity-100', on); b.querySelector('.nav-pill').classList.toggle('opacity-0', !on);
      const l = b.querySelector('.nav-label');
      l.classList.toggle('text-white', on); l.classList.toggle('text-white/70', !on);
    });
    dots.style.opacity = id === 'pied' ? '0' : '1';
  }
  const secObs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setActive(e.target.id); sectionVisible(e.target.id); } }), { root: snap, threshold: 0.55 });
  [...SECTIONS, 'pied'].forEach((id) => secObs.observe(document.getElementById(id)));
  setActive('accueil');

  /* sections catégories avec fonds animés */
  const rotators = {};
  function sectionShell(cat) {
    const c = CATEGORIES[cat];
    return `
      <section class="relative w-full h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
        <div class="bg-layers absolute inset-0"></div>
        <div class="absolute inset-0 bg-black/75"></div>
        <div class="relative z-10 pt-28 md:pt-24 px-6 md:px-12">
          <h2 class="text-4xl sm:text-5xl font-bold text-white">${c.label}</h2>
          <p class="text-white/50 text-lg mt-3">${c.sub}</p>
        </div>
        <div class="preview relative z-10 flex-1 min-h-0 px-6 md:px-12 flex items-center"></div>
        <div class="relative z-10 px-6 md:px-12 pb-10 md:pb-12 pb-safe">
          <a href="${c.href}" class="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/5 transition-all duration-300">${icon(c.icon)}${c.cta}</a>
        </div>
      </section>`;
  }

  function layerFor(p) {
    const k = kindOf(p);
    const cls = 'w-full h-full object-cover blur-sm animate-zoom';
    if (k === 'video') return `<video data-src="${esc(p.media_url)}" class="${cls}" muted loop playsinline preload="none"></video>`;
    if (k === 'youtube') return `<img src="https://i.ytimg.com/vi/${ytId(p.media_url)}/hqdefault.jpg" alt="" class="${cls}" loading="lazy">`;
    if (k === 'image') return `<img src="${esc(p.media_url)}" alt="" class="${cls}" loading="lazy">`;
    return '';
  }

  async function buildSection(cat) {
    const host = document.getElementById(cat);
    host.innerHTML = sectionShell(cat);
    const projects = (await getProjects(cat));
    const withMedia = projects.filter((p) => kindOf(p) !== 'none').slice(0, 6);
    const layers = host.querySelector('.bg-layers');
    if (!withMedia.length) {
      layers.innerHTML = `<div class="absolute inset-0 bg-grid animate-zoom"></div>
        <div class="glow animate-float w-[320px] h-[320px] md:w-[520px] md:h-[520px] top-[20%] left-[5%]" style="background:radial-gradient(circle,#10b981 0%,transparent 70%)"></div>
        <div class="glow animate-float w-[280px] h-[280px] md:w-[420px] md:h-[420px] bottom-[5%] right-[5%]" style="background:radial-gradient(circle,#059669 0%,transparent 70%);animation-delay:2s"></div>`;
    } else {
      layers.innerHTML = withMedia.map((p, i) => `<div class="layer absolute inset-0 transition-opacity duration-1000 ${i ? 'opacity-0' : 'opacity-100'}">${layerFor(p)}</div>`).join('');
      rotators[cat] = { i: 0, n: withMedia.length, layers: [...layers.querySelectorAll('.layer')], timer: null };
    }
    /* aperçu des projets de développement (section sans vidéos) */
    if (cat === 'developpement' && projects.length) {
      host.querySelector('.preview').innerHTML = `
        <div class="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          ${projects.slice(0, 2).map((p, i) => `
            <a href="developpement" class="${i ? 'hidden sm:block' : ''} group rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 bg-black/40">
              ${kindOf(p) === 'image' ? `<img src="${esc(p.media_url)}" alt="${esc(p.title)}" class="w-full aspect-[16/9] object-cover">` : devPlaceholder(p, 'aspect-[16/9] max-h-[32dvh]')}
            </a>`).join('')}
        </div>`;
    }
  }

  function playLayer(cat, on) {
    const r = rotators[cat]; if (!r) return;
    r.layers.forEach((l, idx) => {
      const v = l.querySelector('video'); if (!v) return;
      if (on && idx === r.i) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    });
  }
  let current = null;
  function sectionVisible(id) {
    if (current && current !== id) { const r = rotators[current]; if (r) { clearInterval(r.timer); r.timer = null; } playLayer(current, false); }
    current = id;
    const r = rotators[id]; if (!r) return;
    playLayer(id, true);
    if (r.n > 1 && !r.timer) r.timer = setInterval(() => {
      r.layers[r.i].classList.replace('opacity-100', 'opacity-0');
      r.i = (r.i + 1) % r.n;
      r.layers[r.i].classList.replace('opacity-0', 'opacity-100');
      playLayer(id, true);
    }, 6000);
  }

  Promise.all(['audiovisuel', 'graphisme', 'developpement'].map(buildSection)).then(() => { if (current) sectionVisible(current); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && current) playLayer(current, false); else if (current) playLayer(current, true); });
})();
