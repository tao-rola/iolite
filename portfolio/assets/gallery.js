/* Portfolio Tao ROLA : pages galerie (Audiovisuel, Graphisme, Développement) */
(function () {
  const { icon, esc, withProjects, kindOf, hostOf, posterOf, projectLink, topBar, footer, projectModal, devPlaceholder, watchVideo } = window.TR;
  const cat = document.body.dataset.category;
  const grid = document.getElementById('grid');
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);
  document.getElementById('pied').innerHTML = footer();

  const skeleton = (n) => `<div class="columns-1 sm:columns-2 lg:columns-3 gap-4">${Array.from({ length: n }, (_, i) => `<div class="break-inside-avoid mb-4 rounded-lg bg-white/5 border border-white/10 animate-pulse" style="height:${[220, 320, 260][i % 3]}px"></div>`).join('')}</div>`;
  grid.innerHTML = skeleton(6);

  function media(p) {
    const k = kindOf(p);
    if (k === 'youtube') {
      /* ancien lien YouTube : image fixe (plus aucune lecture via YouTube) en attendant le fichier vidéo */
      return `<div class="relative aspect-video bg-black overflow-hidden">
        <img src="${posterOf(p)}" alt="${esc(p.title)}" loading="lazy" decoding="async" onload="if(this.naturalWidth<=120)this.src=this.src.replace('maxresdefault','hqdefault')" class="absolute inset-0 w-full h-full object-cover">
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
        ${shots.map((src, i) => `<img src="${esc(src)}" alt="${i ? '' : esc(p.title)}" loading="${i ? 'eager' : 'lazy'}" decoding="async" class="absolute inset-0 w-full h-full object-cover object-top ${i ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000">`).join('')}
        ${shots.length > 1 ? `<div class="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none">${shots.map((_, i) => `<span class="dot w-1.5 h-1.5 rounded-full shadow transition-colors duration-500 ${i ? 'bg-white/40' : 'bg-white'}"></span>`).join('')}</div>` : ''}
      </div>` : fallback;
    const initial = `<div class="absolute inset-0 bg-grid flex flex-col items-center justify-center gap-3"><div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">${esc(String(p.title || '?').trim().charAt(0).toUpperCase())}</div><p class="text-white font-semibold text-center px-4">${esc(p.title)}</p></div>`;
    const stage = (inner) => `<div class="relative overflow-hidden bg-[#0d0d0d] px-6 py-7 sm:px-8 sm:py-9">
        <div class="glow" style="width:70%;height:70%;top:15%;left:15%;background:radial-gradient(circle,#10b981 0%,transparent 70%);opacity:.28"></div>
        <div class="relative">${inner}</div>
      </div>`;

    /* applications : carte verticale (format téléphone), les écrans se succèdent en fondu */
    if (p.device === 'phone') {
      if (!shots.length) return `<div class="relative aspect-[9/19] bg-[#0d0d0d]">${initial}</div>`;
      return `<div class="relative aspect-[9/19] overflow-hidden bg-black" ${shots.length > 1 ? 'data-slides' : ''}>
        ${shots.map((src, i) => `<img src="${esc(src)}" alt="${i ? '' : esc(p.title)}" loading="${i ? 'eager' : 'lazy'}" decoding="async" class="absolute inset-0 w-full h-full object-cover object-top ${i ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000">`).join('')}
        ${shots.length > 1 ? `<div class="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 pointer-events-none">${shots.map((_, i) => `<span class="dot w-1.5 h-1.5 rounded-full shadow transition-colors duration-500 ${i ? 'bg-white/40' : 'bg-white'}"></span>`).join('')}</div>` : ''}
      </div>`;
    }

    /* sites internet : carte horizontale (format ordinateur portable).
       Site hébergé sur iolite.team : le vrai site s'affiche en direct et défile doucement (animations comprises).
       Autre hébergeur (le navigateur interdit de faire défiler une page d'un autre domaine) : capture pleine page qui défile. */
    if (p.device === 'desktop') {
      if (!shots.length && !p.link) return `<div class="relative aspect-[16/10] bg-[#0d0d0d]">${initial}</div>`;
      const live = liveUrl(p);
      if (live) return `<div class="relative aspect-[16/10] overflow-hidden bg-[#0d0d0d]" data-live="${esc(live)}">
        ${shots[0] ? `<img src="${esc(shots[0])}" alt="${esc(p.title)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover object-top">` : ''}
      </div>`;
      return `<div class="relative aspect-[16/10] overflow-hidden bg-[#0d0d0d]" data-pagescroll>
        ${shots.map((src, i) => `<img src="${esc(src)}" alt="${i ? '' : esc(p.title)}" loading="${i ? 'eager' : 'lazy'}" decoding="async" class="absolute top-0 left-0 w-full h-auto will-change-transform transition-opacity duration-700 ${i ? 'opacity-0' : 'opacity-100'}">`).join('')}
      </div>`;
    }

    /* diaporama : la carte prend le format de la première image (carrée, verticale, horizontale…) */
    if (slides.length > 1) return `<div class="relative overflow-hidden bg-black"><img src="${esc(slides[0])}" alt="" aria-hidden="true" loading="lazy" decoding="async" class="block w-full h-auto invisible">${screen('')}</div>`;
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
            <!-- informations par-dessus l'aperçu : au survol à la souris, toujours visibles sur écran tactile -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-black/0 opacity-100 [text-shadow:0_1px_8px_rgba(0,0,0,.6)] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div class="absolute bottom-0 inset-x-0 p-4 pointer-events-auto">
                <h3 class="display text-3xl text-white mb-2">${esc(p.title)}</h3>
                ${tags ? `<div class="flex gap-1 mb-2 overflow-x-auto no-scrollbar whitespace-nowrap [@media(hover:hover)]:flex-wrap [@media(hover:hover)]:whitespace-normal">${tags}</div>` : ''}
                ${projectLink(p) ? `<a href="${esc(projectLink(p))}" target="_blank" rel="noopener noreferrer" data-ext class="inline-flex items-center gap-1 text-emerald-400 text-sm hover:text-emerald-300">${icon('externalLink')}Voir le projet</a>` : `<span class="inline-flex items-center gap-1 text-emerald-400 text-sm">${icon('externalLink')}Détails</span>`}
              </div>
            </div>
          </div>
        </article>
      </div>`;
  }

  /* adresse affichable en direct : uniquement les sites du même domaine que le portfolio */
  function liveUrl(p) {
    try { const u = new URL(p.link, location.href); return u.origin === location.origin && !u.pathname.startsWith('/portfolio/admin') ? u.href : ''; } catch { return ''; }
  }

  /* aperçu en direct : le site est affiché comme sur un écran de 1280 x 800, réduit à la taille de la carte,
     puis défile lentement de haut en bas en boucle (il ne tourne que lorsqu'il est visible) */
  const LIVE_W = 1280, LIVE_H = 800;
  /* défilement « humain » : des coups de molette de longueur variable, accélérés puis freinés, entrecoupés de courtes pauses */
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  function liveSite(box) {
    let frame = null, raf = 0, visible = false, ready = false, busy = false;
    let y = 0, seg = null, waitUntil = 0;
    const fit = () => { if (frame) frame.style.transform = `scale(${box.clientWidth / LIVE_W})`; };
    new ResizeObserver(fit).observe(box);
    function step(t) {
      raf = 0; if (!visible || !ready) return;
      const win = frame.contentWindow, doc = frame.contentDocument;
      if (!win || !doc) return;
      const max = Math.max(0, doc.documentElement.scrollHeight - LIVE_H);
      if (!busy && t >= waitUntil) {
        if (!seg) {
          if (y >= max - 2) {
            /* fin de page : pause, fondu, retour en haut */
            busy = true;
            setTimeout(() => { frame.style.opacity = '0'; setTimeout(() => { y = 0; win.scrollTo(0, 0); waitUntil = performance.now() + 1800; busy = false; frame.style.opacity = '1'; }, 600); }, 1500);
          } else {
            const dist = Math.min(max - y, rand(380, 1100));
            seg = { from: y, to: y + dist, t0: t, dur: rand(700, 1300) + dist * 0.4 };
          }
        }
        if (seg) {
          const k = Math.min(1, (t - seg.t0) / seg.dur);
          y = seg.from + (seg.to - seg.from) * ease(k);
          win.scrollTo(0, y);
          if (k >= 1) { seg = null; waitUntil = t + rand(350, 1500); }
        }
      }
      raf = requestAnimationFrame(step);
    }
    function start() {
      if (frame) return;
      frame = document.createElement('iframe');
      frame.src = box.dataset.live;
      frame.title = 'Aperçu en direct du site';
      frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
      frame.style.cssText = `position:absolute;top:0;left:0;width:${LIVE_W}px;height:${LIVE_H}px;border:0;transform-origin:0 0;pointer-events:none;opacity:0;transition:opacity .6s`;
      fit();
      frame.addEventListener('load', () => {
        try {
          const st = frame.contentDocument.createElement('style');
          st.textContent = 'html,body{scroll-behavior:auto!important;scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}';
          frame.contentDocument.head.appendChild(st);
        } catch {}
        setTimeout(() => { ready = true; frame.style.opacity = '1'; y = 0; waitUntil = performance.now() + 1500; if (visible && !raf) raf = requestAnimationFrame(step); }, 900);
      });
      box.appendChild(frame);
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { start(); if (ready && !raf) raf = requestAnimationFrame(step); }
    }, { rootMargin: '200px 0px' }).observe(box);
  }

  /* visite des pages d'un site : défilement vers le bas, pause, fondu vers la page suivante */
  function pageTour(box) {
    const imgs = [...box.querySelectorAll('img')], dots = box.querySelectorAll('.dot');
    let i = 0, anim = null, timer = null;
    const ready = (img) => (img.complete && img.naturalHeight ? Promise.resolve() : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }));
    async function play() {
      if (!box.isConnected) return;
      const img = imgs[i];
      await ready(img);
      const d = Math.max(0, img.offsetHeight - box.offsetHeight);
      img.style.transform = 'translateY(0)';
      if (anim) anim.cancel();
      /* même défilement « humain » que les sites en direct : par à-coups variés avec pauses */
      const frames = [{ transform: 'translateY(0)', offset: 0 }]; const marks = [0]; let pos = 0, time = 0;
      while (pos < d) { const dist = Math.min(d - pos, rand(200, 520) * (box.clientWidth / 800)); time += rand(700, 1300) + dist; pos += dist; marks.push([time, pos]); time += rand(350, 1400); marks.push([time, pos]); }
      const total = Math.max(time, 1);
      marks.slice(1).forEach(([tm, ps]) => frames.push({ transform: `translateY(-${ps}px)`, offset: Math.min(1, tm / total), easing: 'cubic-bezier(.65,0,.35,1)' }));
      frames[0].easing = 'cubic-bezier(.65,0,.35,1)';
      for (let k = 1; k < frames.length; k++) if (frames[k].offset < frames[k - 1].offset) frames[k].offset = frames[k - 1].offset;
      frames[frames.length - 1].offset = 1;
      anim = img.animate(frames, { duration: total, delay: 900, fill: 'forwards' });
      anim.onfinish = () => {
        timer = setTimeout(async () => {
          if (imgs.length > 1) await ready(imgs[(i + 1) % imgs.length]);
          if (imgs.length === 1) { img.animate([{ transform: `translateY(-${d}px)` }, { transform: 'translateY(0)' }], { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }).onfinish = play; return; }
          const next = (i + 1) % imgs.length, prev = imgs[i];
          try { await imgs[next].decode(); } catch {}
          /* fondu enchaîné : la page suivante apparaît par-dessus, puis la précédente disparaît (aucun flash blanc) */
          imgs[next].getAnimations().forEach((a) => a.cancel());
          imgs[next].style.transform = 'translateY(0)';
          imgs[next].style.zIndex = '2'; prev.style.zIndex = '1';
          imgs[next].classList.replace('opacity-0', 'opacity-100');
          dots[i]?.classList.replace('bg-white', 'bg-white/50'); dots[next]?.classList.replace('bg-white/50', 'bg-white');
          setTimeout(() => { prev.classList.replace('opacity-100', 'opacity-0'); prev.style.zIndex = ''; prev.getAnimations().forEach((a) => a.cancel()); }, 750);
          i = next; play();
        }, 1200);
      };
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) play();
  }

  /* écran de chargement : attend que les aperçus du haut de page soient prêts (5 s maximum) */
  let loaderDone = false;
  function finishLoader() {
    if (loaderDone) return; loaderDone = true;
    const l = document.getElementById('loader'); if (!l) return;
    const bar = document.getElementById('loader-bar'); if (bar) bar.style.width = '100%';
    setTimeout(() => { l.style.opacity = '0'; l.style.pointerEvents = 'none'; setTimeout(() => l.remove(), 550); }, 200);
  }
  function waitForMedia() {
    if (loaderDone) return;
    const limit = innerHeight * 1.6;
    const near = (el) => el.getBoundingClientRect().top < limit;
    const waits = [];
    const imgReady = (img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }));
    grid.querySelectorAll('img').forEach((img) => {
      if (!near(img.closest('article') || img)) return;
      img.loading = 'eager';
      waits.push(imgReady(img).then(() => (img.decode ? img.decode().catch(() => {}) : null)));
    });
    /* vidéos visibles dès l'arrivée : l'écran de chargement attend qu'elles tournent vraiment (mobile compris) ;
       les suivantes commencent à se charger en arrière-plan */
    const playing = (v) => (!v.paused && v.currentTime > 0 && v.readyState >= 3 ? Promise.resolve() : new Promise((r) => {
      const ok = () => { if (v.currentTime > 0) { v.removeEventListener('timeupdate', ok); r(); } };
      v.addEventListener('timeupdate', ok); v.addEventListener('error', r, { once: true });
    }));
    grid.querySelectorAll('video').forEach((v) => {
      if (!near(v)) return;
      v.muted = true; v.preload = 'auto';
      if (v.poster) { const im = new Image(); im.src = v.poster; waits.push(imgReady(im)); }
      if (v.getBoundingClientRect().top < innerHeight) { v.play().catch(() => {}); waits.push(playing(v)); }
      else v.load();
    });
    const bar = document.getElementById('loader-bar');
    let done = 0; const total = waits.length || 1;
    waits.forEach((w) => w.then(() => { done++; if (bar) bar.style.width = `${Math.max(8, Math.round((done / total) * 100))}%`; }));
    Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 12000))]).then(finishLoader); /* plafond : 12 s même sur une connexion lente */
  }
  setTimeout(finishLoader, 7000); /* sécurité : jamais bloqué sur l'écran de chargement */

  let byId = {}, items = [], cols = 0;
  const colCount = () => (innerWidth >= 1024 ? 3 : innerWidth >= 640 ? 2 : 1);
  function layout() {
    const n = colCount(); if (n === cols || !items.length) return; cols = n;
    const wrap = grid.querySelector('.masonry'); if (!wrap) return;
    const columns = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'flex-1 min-w-0'; return c; });
    items.forEach((el, i) => columns[i % n].appendChild(el));
    wrap.replaceChildren(...columns);
  }
  addEventListener('resize', layout);
  function render(projects) {
    if (!projects.length) {
      finishLoader();
      grid.innerHTML = `<div class="text-center py-24"><div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">${icon('layers', 'w-6 h-6')}</div><p class="text-white/60">Les projets arrivent bientôt.</p></div>`;
      return;
    }
    byId = Object.fromEntries(projects.map((p) => [p.id, p]));
    /* mosaïque façon Pinterest, remplie de gauche à droite : les projets voisins dans la liste se retrouvent dans des colonnes différentes */
    grid.innerHTML = `<div class="masonry flex gap-4 items-start"></div><div class="hidden">${projects.map(card).join('')}</div>`;
    items = [...grid.lastElementChild.children];
    cols = 0; layout();
    grid.lastElementChild.remove();
    grid.querySelectorAll('[data-pagescroll]').forEach(pageTour);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) grid.querySelectorAll('[data-live]').forEach(liveSite);
    requestAnimationFrame(waitForMedia);
    grid.querySelectorAll('video').forEach(watchVideo);
  }

  /* diaporamas : avancent toutes les 3 s, uniquement quand ils sont à l'écran */
  const visible = new Set();
  const slideObs = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { threshold: 0.2 }) : null;
  new MutationObserver(() => grid.querySelectorAll('[data-slides]').forEach((el) => (slideObs ? slideObs.observe(el) : visible.add(el)))).observe(grid, { childList: true, subtree: true });
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
