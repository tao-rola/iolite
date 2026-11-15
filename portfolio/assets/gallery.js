/* Portfolio Tao ROLA : pages galerie (Audiovisuel, Graphisme, Développement) */
(function () {
  const { icon, esc, withProjects, kindOf, ytId, hostOf, posterOf, ytLoopSrc, projectLink, topBar, footer, projectModal, devPlaceholder, watchVideo } = window.TR;
  const cat = document.body.dataset.category;
  const grid = document.getElementById('grid');
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);
  document.getElementById('pied').innerHTML = footer();

  const skeleton = (n) => `<div class="columns-1 sm:columns-2 lg:columns-3 gap-4">${Array.from({ length: n }, (_, i) => `<div class="break-inside-avoid mb-4 rounded-lg bg-white/5 border border-white/10 animate-pulse" style="height:${[220, 320, 260][i % 3]}px"></div>`).join('')}</div>`;
  grid.innerHTML = skeleton(6);

  function media(p) {
    const k = kindOf(p);
    if (k === 'youtube') {
      /* vignette affichée tout de suite, puis la vidéo YouTube muette en boucle (sans interaction) dès qu'elle est à l'écran */
      return `<div class="relative aspect-video bg-black overflow-hidden">
        <img src="${posterOf(p)}" alt="${esc(p.title)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover">
        <iframe data-yt="${ytId(p.media_url)}" class="yt absolute inset-0 w-full h-full pointer-events-none scale-[1.2] opacity-0 transition-opacity duration-700" title="${esc(p.title)}" allow="autoplay; encrypted-media" tabindex="-1" aria-hidden="true"></iframe>
      </div>`;
    }
    if (k === 'video') {
      const poster = p.poster_url ? `poster="${esc(p.poster_url)}"` : '';
      return `<video src="${esc(p.media_url)}${p.poster_url ? '' : '#t=0.1'}" ${poster} class="w-full h-auto block bg-black ${p.poster_url ? '' : 'min-h-[180px]'}" muted loop playsinline preload="${p.poster_url ? 'none' : 'metadata'}"></video>`;
    }
    const slides = (p.gallery || []).filter(Boolean);
    const shots = slides.length ? slides : (k === 'image' ? [p.media_url] : []);
    /* images qui défilent en fondu (une seule image = image fixe) */
    const screen = (fallback) => shots.length ? `<div class="absolute inset-0" ${shots.length > 1 ? 'data-slides' : ''}>
        ${shots.map((src, i) => `<img src="${esc(src)}" alt="${i ? '' : esc(p.title)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover object-top ${i ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000">`).join('')}
        ${shots.length > 1 ? `<div class="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none">${shots.map((_, i) => `<span class="dot w-1.5 h-1.5 rounded-full shadow transition-colors duration-500 ${i ? 'bg-white/40' : 'bg-white'}"></span>`).join('')}</div>` : ''}
      </div>` : fallback;
    const initial = `<div class="absolute inset-0 bg-grid flex flex-col items-center justify-center gap-3"><div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">${esc(String(p.title || '?').trim().charAt(0).toUpperCase())}</div><p class="text-white font-semibold text-center px-4">${esc(p.title)}</p></div>`;
    const stage = (inner) => `<div class="relative overflow-hidden bg-[#0d0d0d] px-6 py-7 sm:px-8 sm:py-9">
        <div class="glow" style="width:70%;height:70%;top:15%;left:15%;background:radial-gradient(circle,#10b981 0%,transparent 70%);opacity:.28"></div>
        <div class="relative">${inner}</div>
      </div>`;

    /* format téléphone (applications) */
    if (p.device === 'phone') return stage(`
      <div class="relative mx-auto w-[64%] max-w-[260px] aspect-[9/19] rounded-[2.2rem] bg-black border-[7px] border-[#1c1c1e] shadow-[0_25px_60px_-15px_rgba(0,0,0,.8)] ring-1 ring-white/10 overflow-hidden">
        ${screen(initial)}
        <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-[34%] h-[18px] rounded-full bg-black z-10"></div>
      </div>`);

    /* format ordinateur (sites internet) */
    if (p.device === 'desktop') return stage(`
      <div class="rounded-lg overflow-hidden bg-black ring-1 ring-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,.8)]">
        <div class="flex items-center gap-1.5 px-3 h-7 bg-[#1c1c1e] border-b border-white/10">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
          <span class="ml-2 flex-1 min-w-0 truncate text-[10px] text-white/40 bg-white/5 rounded px-2 py-0.5">${esc(hostOf(p.link) || '')}</span>
        </div>
        <div class="relative aspect-[16/10]">${screen(initial)}</div>
      </div>`);

    if (slides.length > 1) return `<div class="relative overflow-hidden bg-black aspect-[16/10]">${screen('')}</div>`;
    if (k === 'image') return `<img src="${esc(p.media_url)}" alt="${esc(p.title)}" loading="lazy" decoding="async" class="w-full h-auto block">`;
    return devPlaceholder(p, 'aspect-[16/10]');
  }

  function card(p, i) {
    const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    return `
      <div class="break-inside-avoid mb-4 animate-fade-up" style="animation-delay:${Math.min(i, 8) * 60}ms">
        <article class="group relative bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300">
          <div role="button" tabindex="0" data-open="${p.id}" class="block w-full text-left cursor-pointer" aria-label="Ouvrir ${esc(p.title)}">
            ${media(p)}
            <!-- souris : informations au survol, comme sur le site d'origine -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden [@media(hover:hover)]:block">
              <div class="absolute bottom-0 inset-x-0 p-4">
                <h3 class="text-white font-semibold mb-1">${esc(p.title)}</h3>
                ${p.description ? `<p class="text-white/70 text-sm mb-2 line-clamp-2">${esc(p.description)}</p>` : ''}
                ${tags ? `<div class="flex flex-wrap gap-1 mb-2">${tags}</div>` : ''}
                ${projectLink(p) ? `<a href="${esc(projectLink(p))}" target="_blank" rel="noopener noreferrer" data-ext class="inline-flex items-center gap-1 text-emerald-400 text-sm hover:text-emerald-300">${icon('externalLink')}Voir le projet</a>` : `<span class="inline-flex items-center gap-1 text-emerald-400 text-sm">${icon('externalLink')}Détails</span>`}
              </div>
            </div>
          </div>
          <!-- écran tactile : titre toujours visible sous le média -->
          <div class="[@media(hover:hover)]:hidden px-4 py-3 border-t border-white/10">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-white font-semibold text-[15px] leading-snug">${esc(p.title)}</h3>
              ${projectLink(p) ? `<a href="${esc(projectLink(p))}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-emerald-400 text-sm font-medium">Voir le projet</a>` : `<button type="button" data-open="${p.id}" class="shrink-0 text-emerald-400 text-sm font-medium">Détails</button>`}
            </div>
            ${tags ? `<div class="flex gap-1 mt-2 overflow-x-auto no-scrollbar whitespace-nowrap -mx-1 px-1">${tags}</div>` : ''}
          </div>
        </article>
      </div>`;
  }

  let byId = {};
  function render(projects) {
    if (!projects.length) {
      grid.innerHTML = `<div class="text-center py-24"><div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">${icon('layers', 'w-6 h-6')}</div><p class="text-white/60">Les projets arrivent bientôt.</p></div>`;
      return;
    }
    byId = Object.fromEntries(projects.map((p) => [p.id, p]));
    grid.innerHTML = `<div class="columns-1 sm:columns-2 lg:columns-3 gap-4">${projects.map(card).join('')}</div>`;
    grid.querySelectorAll('video').forEach(watchVideo);
    grid.querySelectorAll('iframe.yt').forEach((f) => ytObs && ytObs.observe(f));
  }

  /* YouTube : chargé quand visible, déchargé quand il sort largement de l'écran (fluidité) */
  const ytObs = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach(({ target: f, isIntersecting }) => {
    if (isIntersecting) {
      if (!f.src) { f.src = ytLoopSrc(f.dataset.yt); clearTimeout(f._t); f._t = setTimeout(() => f.src && f.classList.remove('opacity-0'), 4500); /* on attend que l'habillage YouTube de démarrage disparaisse */ }
    } else if (f.src) { clearTimeout(f._t); f.removeAttribute('src'); f.classList.add('opacity-0'); }
  }), { rootMargin: '300px 0px' }) : null;

  /* diaporamas : avancent toutes les 3 s, uniquement quand ils sont à l'écran */
  const visible = new Set();
  const slideObs = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { threshold: 0.2 }) : null;
  new MutationObserver(() => grid.querySelectorAll('[data-slides]').forEach((el) => (slideObs ? slideObs.observe(el) : visible.add(el)))).observe(grid, { childList: true });
  setInterval(() => {
    if (document.hidden) return;
    visible.forEach((el) => {
      if (!el.isConnected) return visible.delete(el);
      const imgs = el.querySelectorAll('img'), dots = el.querySelectorAll('.dot');
      const cur = +(el.dataset.i || 0), next = (cur + 1) % imgs.length;
      imgs[cur].classList.replace('opacity-100', 'opacity-0'); imgs[next].classList.replace('opacity-0', 'opacity-100');
      dots[cur]?.classList.replace('bg-white', 'bg-white/40'); dots[next]?.classList.replace('bg-white/40', 'bg-white');
      el.dataset.i = next;
    });
  }, 3000);

  grid.addEventListener('click', (e) => {
    if (e.target.closest('a')) return; /* liens externes (YouTube, site) */
    const b = e.target.closest('[data-open]');
    if (b && byId[b.dataset.open]) projectModal(byId[b.dataset.open]);
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-open]')) { e.preventDefault(); projectModal(byId[e.target.dataset.open]); }
  });

  withProjects(cat, render);
})();
