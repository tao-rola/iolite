/* Portfolio Tao ROLA : administration (projets, parcours, réglages).
   Connexion avec un compte Supabase du projet Iolite inscrit dans la table portfolio_admins. */
(function () {
  const { sb, icon, esc, CATEGORIES, kindOf, ytId, posterOf, devPlaceholder, topBar, toast, openModal, closeModal } = window.TR;
  const app = document.getElementById('app');
  const BUCKET = 'portfolio';
  const MAX_MB = 50;
  const isLegacy = (u) => /base44\.(app|com)|qtrypzzcjebvfcihiynt\.supabase\.co/.test(u || '');
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);

  let user = null, tab = 'projets', cat = 'audiovisuel';
  let projects = [], cv = [], settings = {};

  /* ---------- connexion ---------- */
  function renderLogin(err = '') {
    app.innerHTML = `
      <div class="max-w-md mx-auto mt-6 sm:mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-up">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">${icon('lock', 'w-5 h-5')}</div>
        <h2 class="text-2xl font-bold text-white mb-1">Connexion</h2>
        <p class="text-white/50 text-sm mb-6">Espace réservé à l'administration du portfolio.</p>
        <form id="login" class="space-y-4">
          <div><label class="text-sm text-white/70 mb-2 block" for="l-email">E-mail</label><input id="l-email" type="email" class="field" required autocomplete="username" inputmode="email"></div>
          <div><label class="text-sm text-white/70 mb-2 block" for="l-pass">Mot de passe</label><input id="l-pass" type="password" class="field" required autocomplete="current-password"></div>
          ${err ? `<p class="text-sm text-red-400">${esc(err)}</p>` : ''}
          <button class="btn-primary w-full" type="submit">Se connecter</button>
          <button type="button" id="forgot" class="w-full text-sm text-emerald-400 hover:text-emerald-300 pt-1">Première connexion ou mot de passe oublié ?</button>
        </form>
      </div>`;
    document.getElementById('forgot').onclick = async () => {
      const email = document.getElementById('l-email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Saisissez d'abord votre adresse e-mail.", 'error');
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/portfolio/admin' });
      if (error) return toast("L'e-mail n'a pas pu être envoyé : " + error.message, 'error');
      toast('Un lien pour choisir votre mot de passe vient de vous être envoyé par e-mail.');
    };
    document.getElementById('login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Connexion…';
      const { error } = await sb.auth.signInWithPassword({ email: document.getElementById('l-email').value.trim(), password: document.getElementById('l-pass').value });
      if (error) renderLogin("E-mail ou mot de passe incorrect.");
    });
  }

  function renderNewPassword() {
    app.innerHTML = `
      <div class="max-w-md mx-auto mt-6 sm:mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-up">
        <h2 class="text-2xl font-bold text-white mb-1">Nouveau mot de passe</h2>
        <p class="text-white/50 text-sm mb-6">Choisissez le mot de passe de votre espace administrateur (6 caractères minimum).</p>
        <form id="np" class="space-y-4">
          <input id="np1" type="password" class="field" required minlength="6" autocomplete="new-password" placeholder="Nouveau mot de passe">
          <input id="np2" type="password" class="field" required minlength="6" autocomplete="new-password" placeholder="Confirmer le mot de passe">
          <button class="btn-primary w-full" type="submit">Enregistrer</button>
        </form>
      </div>`;
    document.getElementById('np').onsubmit = async (e) => {
      e.preventDefault();
      const a = document.getElementById('np1').value, b = document.getElementById('np2').value;
      if (a.length < 6) return toast('6 caractères minimum.', 'error');
      if (a !== b) return toast('Les deux mots de passe ne correspondent pas.', 'error');
      const { error } = await sb.auth.updateUser({ password: a });
      if (error) return toast(error.message, 'error');
      toast('Mot de passe enregistré.');
      mustSetPassword = false; sessionStorage.removeItem('tr-set-password');
      history.replaceState(null, '', location.pathname);
      const { data } = await sb.auth.getSession(); start(data.session);
    };
  }

  function renderDenied() {
    app.innerHTML = `
      <div class="max-w-md mx-auto mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h2 class="text-xl font-bold text-white mb-2">Accès refusé</h2>
        <p class="text-white/60 text-sm mb-6">Le compte ${esc(user.email)} n'est pas administrateur du portfolio.</p>
        <button class="btn-ghost" id="out">${icon('logOut')}Se déconnecter</button>
      </div>`;
    document.getElementById('out').onclick = () => sb.auth.signOut();
  }

  /* ---------- données ---------- */
  async function loadAll() {
    const [p, c, s] = await Promise.all([
      sb.from('portfolio_projects').select('*').order('sort_order', { ascending: false }).order('created_at', { ascending: false }),
      sb.from('portfolio_cv').select('*').order('sort_order', { ascending: false }).order('created_at', { ascending: false }),
      sb.from('portfolio_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    projects = p.data || []; cv = c.data || []; settings = s.data || {};
    const err = p.error || c.error || s.error; if (err) toast(err.message, 'error');
  }

  async function upload(file, folder) {
    if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Fichier trop lourd (${(file.size / 1048576).toFixed(0)} Mo). Maximum ${MAX_MB} Mo : compressez-le (par exemple en 1080p ou 720p) avant de l'importer.`);
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 40);
    const path = `${folder}/${Date.now()}-${base}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  /* ---------- aperçus optimisés (générés dans le navigateur) ---------- */
  function makePoster(src) {
    return new Promise((resolve, reject) => {
      const v = document.createElement('video');
      const t = setTimeout(() => reject(new Error('délai dépassé')), 45000);
      v.crossOrigin = 'anonymous'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = src;
      v.onloadeddata = () => { v.currentTime = Math.min(0.6, (v.duration || 2) / 4); };
      v.onseeked = () => {
        const w = Math.min(720, v.videoWidth || 720), h = Math.round((v.videoHeight || 405) * w / (v.videoWidth || 720));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(v, 0, 0, w, h);
        c.toBlob((b) => { clearTimeout(t); b ? resolve(b) : reject(new Error('image impossible')); }, 'image/webp', 0.72);
      };
      v.onerror = () => { clearTimeout(t); reject(new Error('vidéo illisible')); };
    });
  }
  function makeThumb(src, size = 400) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        const s = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas'); c.width = c.height = size;
        const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
        x.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error('image impossible'))), 'image/webp', 0.75);
      };
      img.onerror = () => reject(new Error('image illisible')); img.src = src;
    });
  }
  async function uploadBlob(blob, path) {
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'image/webp', cacheControl: '31536000', upsert: true });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  /* ---------- tableau de bord ---------- */
  const legacyCount = () => projects.filter((p) => isLegacy(p.media_url)).length + (isLegacy(settings.photo_url) ? 1 : 0);
  const posterCount = () => projects.filter((p) => kindOf(p) === 'video' && !p.poster_url).length;

  function render() {
    const maint = legacyCount() + posterCount();
    const T = [['projets', 'Projets', 'layers', 0], ['parcours', 'Mon parcours', 'briefcase', 0], ['reglages', 'Réglages', 'settings', maint]];
    app.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div class="min-w-0">
          <h2 class="display text-5xl sm:text-6xl text-white">Administration</h2>
          <p class="text-white/40 text-sm truncate mt-2">${esc(user.email)}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <a href="./" class="btn-ghost !rounded-full">${icon('globe')}Voir le site</a>
          <button class="btn-ghost !rounded-full" id="out">${icon('logOut')}<span class="hidden sm:inline">Déconnexion</span></button>
        </div>
      </div>
      <div class="inline-flex max-w-full gap-1 p-1 bg-white/5 border border-white/10 rounded-full mb-8 overflow-x-auto no-scrollbar">
        ${T.map(([id, l, ic, n]) => `<button data-tab="${id}" class="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${tab === id ? 'bg-emerald-500 text-white' : 'text-white/70 hover:text-white'}">${icon(ic)}${l}${n ? `<span class="text-[11px] px-1.5 rounded-full ${tab === id ? 'bg-white/25' : 'bg-amber-500/20 text-amber-300'}">${n}</span>` : ''}</button>`).join('')}
      </div>
      <div id="panel"></div>`;
    document.getElementById('out').onclick = () => sb.auth.signOut();
    app.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    ({ projets: renderProjects, parcours: renderCv, reglages: renderSettings })[tab]();
  }

  /* ---------- projets : même mosaïque et même ordre que sur le site ---------- */
  function preview(p) {
    const k = kindOf(p);
    const shots = (p.gallery || []).filter(Boolean);
    const first = shots[0] || (k === 'image' ? p.media_url : '');
    if (k === 'youtube') return `<div class="relative aspect-video bg-black"><img src="${esc(posterOf(p))}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"></div>`;
    if (k === 'video') return p.poster_url
      ? `<img src="${esc(p.poster_url)}" alt="" loading="lazy" class="w-full h-auto block bg-black">`
      : `<video src="${esc(p.media_url)}#t=0.5" class="w-full h-auto block bg-black min-h-[180px]" muted playsinline preload="metadata"></video>`;
    if (p.device === 'phone') return `<div class="relative aspect-[16/10] overflow-hidden bg-[#0d0d0d]"><div class="absolute inset-y-[9%] left-[4%] flex gap-3">${shots.slice(0, 5).map((src) => `<img src="${esc(src)}" alt="" loading="lazy" class="h-full w-auto rounded-xl ring-1 ring-white/10">`).join('')}</div></div>`;
    if (p.device === 'desktop') return `<div class="relative aspect-[3/4] overflow-hidden bg-[#0d0d0d]">${first ? `<img src="${esc(first)}" alt="" loading="lazy" class="absolute top-0 left-0 w-full h-auto">` : ''}</div>`;
    if (shots.length > 1) return `<img src="${esc(first)}" alt="" loading="lazy" class="w-full h-auto block bg-black">`;
    if (k === 'image') return `<img src="${esc(p.media_url)}" alt="" loading="lazy" class="w-full h-auto block">`;
    return devPlaceholder(p, 'aspect-[16/10]');
  }

  const iconBtn = (attr, ic, label, extra = '') => `<button type="button" ${attr} class="w-9 h-9 inline-flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-25 disabled:pointer-events-none ${extra}" aria-label="${label}" title="${label}">${icon(ic)}</button>`;

  function adminCard(p, i, total) {
    const hidden = !p.published;
    return `
      <div class="mb-4" data-card="${p.id}" ${hidden ? '' : 'draggable="true"'}>
        <article class="relative rounded-lg overflow-hidden border border-white/10 bg-white/5 transition-all duration-200 ${hidden ? 'opacity-60' : ''}">
          <div class="relative ${hidden ? '' : 'cursor-grab active:cursor-grabbing'}">
            <div class="pointer-events-none select-none">${preview(p)}</div>
            ${hidden ? '' : `<span class="absolute top-3 left-3 min-w-8 h-8 px-2 inline-flex items-center justify-center rounded-full bg-black/70 backdrop-blur text-white text-sm font-semibold ring-1 ring-white/15">${i + 1}</span>
            <span class="absolute top-3 right-3 w-8 h-8 hidden [@media(hover:hover)]:inline-flex items-center justify-center rounded-full bg-black/70 backdrop-blur text-white/80 ring-1 ring-white/15">${icon('grip')}</span>`}
            <div class="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
              <h3 class="display text-2xl text-white">${esc(p.title)}</h3>
              ${hidden ? '<p class="text-amber-300 text-xs mt-1">Masqué sur le site</p>' : ''}
            </div>
          </div>
          <div class="flex items-center gap-1 px-2 py-1.5 border-t border-white/10">
            ${hidden ? '' : iconBtn(`data-move="-1" data-id="${p.id}" ${i === 0 ? 'disabled' : ''}`, 'chevronLeft', 'Placer avant') + iconBtn(`data-move="1" data-id="${p.id}" ${i === total - 1 ? 'disabled' : ''}`, 'chevronRight', 'Placer après')}
            <span class="flex-1"></span>
            ${iconBtn(`data-toggle="${p.id}"`, hidden ? 'eye' : 'eyeOff', hidden ? 'Afficher sur le site' : 'Masquer du site')}
            ${iconBtn(`data-edit="${p.id}"`, 'pencil', 'Modifier')}
            ${iconBtn(`data-del="${p.id}"`, 'trash', 'Supprimer', 'hover:!text-red-400')}
          </div>
        </article>
      </div>`;
  }

  const colCount = () => (innerWidth >= 1024 ? 3 : innerWidth >= 640 ? 2 : 1);
  const masonry = (html) => {
    const n = colCount(), cols = Array.from({ length: n }, () => []);
    html.forEach((h, i) => cols[i % n].push(h));
    return `<div class="flex gap-4 items-start">${cols.map((c) => `<div class="flex-1 min-w-0">${c.join('')}</div>`).join('')}</div>`;
  };
  let lastCols = colCount();
  addEventListener('resize', () => { const n = colCount(); if (n !== lastCols) { lastCols = n; if (tab === 'projets' && document.getElementById('pgrid')) renderProjects(); } });

  const ofCat = (c) => projects.filter((p) => p.category === c).sort((a, b) => b.sort_order - a.sort_order || String(b.created_at).localeCompare(String(a.created_at)));

  function renderProjects() {
    const all = ofCat(cat), shown = all.filter((p) => p.published), hidden = all.filter((p) => !p.published);
    document.getElementById('panel').innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">${Object.entries(CATEGORIES).map(([k, v]) => `<button data-cat="${k}" class="px-4 py-2 rounded-full text-sm border whitespace-nowrap transition-colors ${cat === k ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-white/60 hover:text-white'}">${v.label} <span class="opacity-60">${projects.filter((p) => p.category === k).length}</span></button>`).join('')}</div>
        <button class="btn-primary !rounded-full shrink-0" id="add">${icon('plus')}Ajouter un projet</button>
      </div>
      <p class="text-white/40 text-sm mb-6">Les projets apparaissent ici exactement comme sur la page ${esc(CATEGORIES[cat].label)}. Glissez-déposez une carte sur une autre pour échanger leur place, ou utilisez les flèches.</p>
      <div id="pgrid">${shown.length ? masonry(shown.map((p, i) => adminCard(p, i, shown.length))) : '<p class="text-white/40 text-center py-16">Aucun projet affiché dans cette catégorie.</p>'}</div>
      ${hidden.length ? `<h3 class="display text-3xl text-white mt-12 mb-2">Projets masqués</h3><p class="text-white/40 text-sm mb-6">Ils ne sont pas visibles sur le site. Cliquez sur l'œil pour les réafficher.</p>${masonry(hidden.map((p, i) => adminCard(p, i, hidden.length)))}` : ''}`;
    const panel = document.getElementById('panel');
    panel.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { cat = b.dataset.cat; renderProjects(); }));
    document.getElementById('add').onclick = () => editProject({ category: cat, published: true, tags: [], media_type: cat === 'developpement' ? 'image' : 'video', device: '' });
    panel.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => editProject(projects.find((p) => p.id === b.dataset.edit))));
    panel.querySelectorAll('[data-move]').forEach((b) => (b.onclick = () => {
      const i = shown.findIndex((p) => p.id === b.dataset.id);
      moveProject(shown, i, i + +b.dataset.move);
    }));
    panel.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = async () => {
      const p = projects.find((x) => x.id === b.dataset.toggle);
      const { error } = await sb.from('portfolio_projects').update({ published: !p.published, updated_at: new Date().toISOString() }).eq('id', p.id);
      if (error) return toast(error.message, 'error');
      p.published = !p.published; toast(p.published ? 'Projet affiché sur le site.' : 'Projet masqué.'); renderProjects();
    }));
    panel.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
      const p = projects.find((x) => x.id === b.dataset.del);
      if (!confirm(`Supprimer définitivement « ${p.title} » ? Cette action est irréversible.`)) return;
      const { error } = await sb.from('portfolio_projects').delete().eq('id', p.id);
      if (error) return toast(error.message, 'error');
      projects = projects.filter((x) => x.id !== p.id); toast('Projet supprimé.'); renderProjects();
    }));
    /* glisser-déposer (souris) */
    let dragId = null;
    panel.querySelectorAll('[data-card][draggable]').forEach((el) => {
      el.addEventListener('dragstart', (e) => { dragId = el.dataset.card; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); setTimeout(() => el.classList.add('opacity-40'), 0); });
      el.addEventListener('dragend', () => { el.classList.remove('opacity-40'); panel.querySelectorAll('article.ring-2').forEach((a) => a.classList.remove('ring-2', 'ring-emerald-500')); });
      el.addEventListener('dragover', (e) => { if (!dragId || dragId === el.dataset.card) return; e.preventDefault(); el.querySelector('article').classList.add('ring-2', 'ring-emerald-500'); });
      el.addEventListener('dragleave', () => el.querySelector('article').classList.remove('ring-2', 'ring-emerald-500'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = shown.findIndex((p) => p.id === dragId), to = shown.findIndex((p) => p.id === el.dataset.card);
        dragId = null; if (from > -1 && to > -1 && from !== to) moveProject(shown, from, to);
      });
    });
  }

  /* nouvel ordre : le premier projet reçoit la valeur la plus haute (le site trie du plus grand au plus petit) */
  async function persistOrder(list, table) {
    const n = list.length, changed = [];
    list.forEach((p, i) => { const want = n - i; if (p.sort_order !== want) { p.sort_order = want; changed.push(p); } });
    if (!changed.length) return;
    const res = await Promise.all(changed.map((p) => sb.from(table).update({ sort_order: p.sort_order }).eq('id', p.id)));
    const err = res.find((r) => r.error); if (err) { toast(err.error.message, 'error'); await loadAll(); render(); }
  }
  function moveProject(shown, from, to) {
    if (to < 0 || to >= shown.length) return;
    const list = [...shown]; const [it] = list.splice(from, 1); list.splice(to, 0, it);
    const hidden = ofCat(cat).filter((p) => !p.published);
    persistOrder([...list, ...hidden], 'portfolio_projects').then(() => toast('Emplacement enregistré.'));
    renderProjects();
  }
  const nextOrder = (c) => Math.max(0, ...projects.filter((p) => p.category === c).map((p) => p.sort_order)) + 1;

  function editProject(p) {
    const isNew = !p.id;
    openModal(`
      <form id="pf" class="p-5 sm:p-8 space-y-4">
        <h2 class="display text-4xl text-white pr-10">${isNew ? 'Nouveau projet' : 'Modifier le projet'}</h2>
        ${isNew ? '<p class="text-white/40 text-sm -mt-2">Il apparaîtra en première position ; vous pourrez le déplacer ensuite dans la mosaïque.</p>' : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="text-sm text-white/70 mb-2 block">Catégorie</label>
            <select name="category" class="field">${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${p.category === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
          <div><label class="text-sm text-white/70 mb-2 block">Format de la carte</label>
            <select name="device" class="field">${[['', 'Normal (image ou vidéo)'], ['phone', 'Application : écrans qui défilent'], ['desktop', 'Site internet : pages qui défilent']].map(([k, l]) => `<option value="${k}" ${(p.device || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        </div>
        <div><label class="text-sm text-white/70 mb-2 block">Titre *</label><input name="title" class="field" required value="${esc(p.title || '')}"></div>
        <div><label class="text-sm text-white/70 mb-2 block">Description</label><textarea name="description" class="field !min-h-[110px]">${esc(p.description || '')}</textarea></div>
        <div><label class="text-sm text-white/70 mb-2 block">Tags (séparés par des virgules)</label><input name="tags" class="field" value="${esc((p.tags || []).join(', '))}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label class="text-sm text-white/70 mb-2 block">Type de média</label>
            <select name="media_type" class="field">${[['video', 'Vidéo'], ['image', 'Image']].map(([k, l]) => `<option value="${k}" ${p.media_type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="sm:col-span-2"><label class="text-sm text-white/70 mb-2 block">Adresse du média</label><input name="media_url" class="field" placeholder="https://… (ou importez un fichier)" value="${esc(p.media_url || '')}"></div>
        </div>
        <label class="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 cursor-pointer text-sm text-center">
          ${icon('upload')}<span id="fname">Importer une vidéo ou une image (max ${MAX_MB} Mo)</span>
          <input type="file" name="file" accept="video/*,image/*" class="sr-only">
        </label>
        <div><label class="text-sm text-white/70 mb-2 block">Captures qui défilent dans la carte (sites et applications, une adresse par ligne)</label>
          <textarea name="gallery" class="field !min-h-[90px] font-mono text-xs" placeholder="https://…">${esc((p.gallery || []).join('\n'))}</textarea>
          <label class="mt-2 btn-ghost !h-9 cursor-pointer">${icon('upload')}Ajouter des captures<input type="file" name="gfiles" accept="image/*" multiple class="sr-only"></label>
          <span id="gcount" class="text-xs text-white/40 ml-2"></span></div>
        <div><label class="text-sm text-white/70 mb-2 block">Lien « Voir le projet » (site internet…)</label><input name="link" class="field" placeholder="https://" value="${esc(p.link || '')}"></div>
        <label class="flex items-center gap-3 text-sm text-white/80"><input type="checkbox" name="published" class="w-5 h-5 accent-emerald-500" ${p.published ? 'checked' : ''}>Visible sur le site</label>
        <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
          <button type="button" data-close class="btn-ghost !h-11">Annuler</button>
          <button type="submit" class="btn-primary">${isNew ? 'Créer' : 'Enregistrer'}</button>
        </div>
      </form>`, { wide: true });
    const f = document.getElementById('pf');
    f.file.onchange = () => {
      const file = f.file.files[0];
      document.getElementById('fname').textContent = file ? `${file.name} (${(file.size / 1048576).toFixed(1)} Mo)` : 'Importer…';
      if (file) f.media_type.value = file.type.startsWith('image') ? 'image' : 'video';
    };
    f.gfiles.onchange = () => { const n = f.gfiles.files.length; document.getElementById('gcount').textContent = n ? `${n} image(s) à envoyer` : ''; };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Enregistrement…';
      try {
        let media_url = f.media_url.value.trim();
        const file = f.file.files[0];
        let poster_url = p.poster_url || '';
        if (file) {
          btn.textContent = 'Envoi du fichier…'; media_url = await upload(file, f.category.value);
          poster_url = '';
          if (file.type.startsWith('video')) {
            btn.textContent = 'Création de l\'aperçu…';
            try { poster_url = await uploadBlob(await makePoster(URL.createObjectURL(file)), `posters/${Date.now()}.webp`); } catch (e) { console.warn(e); }
          }
        } else if (media_url !== (p.media_url || '')) poster_url = '';
        const gallery = f.gallery.value.split('\n').map((u) => u.trim()).filter(Boolean);
        for (const g of f.gfiles.files) { btn.textContent = 'Envoi des captures…'; gallery.push(await upload(g, f.category.value + '/captures')); }
        if (!media_url && gallery.length) media_url = gallery[0];
        let media_type = f.media_type.value;
        if (ytId(media_url)) throw new Error('Les vidéos YouTube ne sont plus acceptées : importez le fichier vidéo (MP4).');
        if (ytId(f.link.value)) throw new Error('Les liens YouTube ne sont plus acceptés.');
        if (!file && gallery.length && media_url === gallery[0]) media_type = 'image';
        const row = {
          category: f.category.value, title: f.title.value.trim(), description: f.description.value.trim(),
          tags: f.tags.value.split(',').map((t) => t.trim()).filter(Boolean), media_type, media_url,
          link: f.link.value.trim(), published: f.published.checked, poster_url, gallery, device: f.device.value,
          updated_at: new Date().toISOString(),
        };
        if (isNew || row.category !== p.category) row.sort_order = nextOrder(row.category);
        if (!row.title) throw new Error('Le titre est obligatoire.');
        const q = isNew ? sb.from('portfolio_projects').insert(row).select().single() : sb.from('portfolio_projects').update(row).eq('id', p.id).select().single();
        const { data, error } = await q;
        if (error) throw error;
        projects = isNew ? [data, ...projects] : projects.map((x) => (x.id === data.id ? data : x));
        cat = data.category;
        closeModal(); toast(isNew ? 'Projet créé.' : 'Projet enregistré.'); render();
      } catch (err) {
        toast(err.message || String(err), 'error'); btn.disabled = false; btn.textContent = isNew ? 'Créer' : 'Enregistrer';
      }
    };
  }

  /* ---------- mon parcours ---------- */
  const SECT = [['formation', 'graduationCap', 'Formation'], ['experience', 'briefcase', 'Expérience Professionnelle'], ['engagement', 'users', 'Engagement Associatif']];
  const ofSect = (k) => cv.filter((r) => r.section === k).sort((a, b) => b.sort_order - a.sort_order || String(b.created_at).localeCompare(String(a.created_at)));

  function renderCv() {
    const skills = Array.isArray(settings.skills) ? settings.skills : [];
    document.getElementById('panel').innerHTML = `
      <p class="text-white/40 text-sm mb-8">Tout ce qui est modifié ici apparaît sur la page Mon parcours, dans le même ordre.</p>
      ${SECT.map(([k, ic, title]) => {
        const rows = ofSect(k);
        return `
        <section class="mb-12">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-3 min-w-0">${icon(ic, 'w-6 h-6 text-emerald-500')}<h3 class="display text-3xl sm:text-4xl text-white truncate">${title}</h3></div>
            <button class="btn-ghost !rounded-full shrink-0" data-cvadd="${k}">${icon('plus')}<span class="hidden sm:inline">Ajouter</span></button>
          </div>
          <div class="space-y-2">
            ${rows.map((r, i) => `
              <div class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border ${r.published ? 'bg-white/5 border-white/10' : 'bg-white/[.02] border-white/5 opacity-60'}">
                <div class="flex flex-col shrink-0">
                  ${iconBtn(`data-cvmove="-1" data-id="${r.id}" ${i === 0 ? 'disabled' : ''}`, 'chevronUp', 'Monter', '!w-8 !h-8')}
                  ${iconBtn(`data-cvmove="1" data-id="${r.id}" ${i === rows.length - 1 ? 'disabled' : ''}`, 'chevronDown', 'Descendre', '!w-8 !h-8')}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-emerald-500 truncate">${esc(r.period)}${r.published ? '' : ' · <span class="text-amber-300">masqué</span>'}</p>
                  <p class="text-white font-semibold truncate">${esc(r.title)}</p>
                  <p class="text-white/50 text-sm truncate">${esc(r.place)}</p>
                </div>
                ${iconBtn(`data-cvtoggle="${r.id}"`, r.published ? 'eyeOff' : 'eye', r.published ? 'Masquer' : 'Afficher')}
                ${iconBtn(`data-cvedit="${r.id}"`, 'pencil', 'Modifier')}
                ${iconBtn(`data-cvdel="${r.id}"`, 'trash', 'Supprimer', 'hover:!text-red-400')}
              </div>`).join('') || '<p class="text-white/40 text-sm py-6 text-center">Rien pour l\'instant.</p>'}
          </div>
        </section>`;
      }).join('')}
      <section class="mb-6">
        <div class="flex items-center gap-3 mb-4">${icon('award', 'w-6 h-6 text-emerald-500')}<h3 class="display text-3xl sm:text-4xl text-white">Compétences</h3></div>
        <div class="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10">
          <div class="flex flex-wrap gap-2 mb-4" id="skills">${skills.map((s, i) => `
            <span draggable="true" data-skill="${i}" class="inline-flex items-center gap-1 pl-3 pr-1 h-9 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm cursor-grab">${esc(s)}<button type="button" data-skdel="${i}" class="w-7 h-7 inline-flex items-center justify-center rounded-full text-white/50 hover:text-red-400 hover:bg-white/10" aria-label="Retirer ${esc(s)}">${icon('x', 'w-3.5 h-3.5')}</button></span>`).join('')}</div>
          <form id="skadd" class="flex gap-2"><input name="s" class="field" placeholder="Nouvelle compétence (ex. Figma)" autocomplete="off"><button class="btn-primary shrink-0">${icon('plus')}Ajouter</button></form>
          <p class="text-white/30 text-xs mt-3">Glissez une compétence pour changer sa place.</p>
        </div>
      </section>`;
    const panel = document.getElementById('panel');
    panel.querySelectorAll('[data-cvadd]').forEach((b) => (b.onclick = () => editCv({ section: b.dataset.cvadd, published: true })));
    panel.querySelectorAll('[data-cvedit]').forEach((b) => (b.onclick = () => editCv(cv.find((r) => r.id === b.dataset.cvedit))));
    panel.querySelectorAll('[data-cvmove]').forEach((b) => (b.onclick = () => {
      const r = cv.find((x) => x.id === b.dataset.id), rows = ofSect(r.section), i = rows.indexOf(r), j = i + +b.dataset.cvmove;
      if (j < 0 || j >= rows.length) return;
      rows.splice(i, 1); rows.splice(j, 0, r);
      persistOrder(rows, 'portfolio_cv'); renderCv();
    }));
    panel.querySelectorAll('[data-cvtoggle]').forEach((b) => (b.onclick = async () => {
      const r = cv.find((x) => x.id === b.dataset.cvtoggle);
      const { error } = await sb.from('portfolio_cv').update({ published: !r.published, updated_at: new Date().toISOString() }).eq('id', r.id);
      if (error) return toast(error.message, 'error');
      r.published = !r.published; toast(r.published ? 'Affiché sur le site.' : 'Masqué du site.'); renderCv();
    }));
    panel.querySelectorAll('[data-cvdel]').forEach((b) => (b.onclick = async () => {
      const r = cv.find((x) => x.id === b.dataset.cvdel);
      if (!confirm(`Supprimer définitivement « ${r.title} » ? Cette action est irréversible.`)) return;
      const { error } = await sb.from('portfolio_cv').delete().eq('id', r.id);
      if (error) return toast(error.message, 'error');
      cv = cv.filter((x) => x.id !== r.id); toast('Supprimé.'); renderCv();
    }));
    /* compétences */
    const saveSkills = async (list, msg) => { if (await saveSettings({ skills: list })) { toast(msg); renderCv(); } };
    document.getElementById('skadd').onsubmit = (e) => {
      e.preventDefault(); const v = e.target.s.value.trim(); if (!v) return;
      if (skills.some((s) => s.toLowerCase() === v.toLowerCase())) return toast('Cette compétence existe déjà.', 'error');
      saveSkills([...skills, v], 'Compétence ajoutée.');
    };
    panel.querySelectorAll('[data-skdel]').forEach((b) => (b.onclick = () => saveSkills(skills.filter((_, i) => i !== +b.dataset.skdel), 'Compétence retirée.')));
    let drag = null;
    panel.querySelectorAll('[data-skill]').forEach((el) => {
      el.addEventListener('dragstart', (e) => { drag = +el.dataset.skill; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(drag)); });
      el.addEventListener('dragover', (e) => { if (drag === null) return; e.preventDefault(); el.classList.add('border-emerald-500'); });
      el.addEventListener('dragleave', () => el.classList.remove('border-emerald-500'));
      el.addEventListener('drop', (e) => {
        e.preventDefault(); const to = +el.dataset.skill; if (drag === null || drag === to) return;
        const list = [...skills]; const [s] = list.splice(drag, 1); list.splice(to, 0, s); drag = null;
        saveSkills(list, 'Ordre enregistré.');
      });
    });
  }

  function editCv(r) {
    const isNew = !r.id;
    openModal(`
      <form id="cf" class="p-5 sm:p-8 space-y-4">
        <h2 class="display text-4xl text-white pr-10">${isNew ? 'Ajouter au parcours' : 'Modifier'}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="text-sm text-white/70 mb-2 block">Rubrique</label>
            <select name="section" class="field">${SECT.map(([k, , l]) => `<option value="${k}" ${r.section === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label class="text-sm text-white/70 mb-2 block">Période</label><input name="period" class="field" placeholder="Septembre 2025 - Présent" value="${esc(r.period || '')}"></div>
        </div>
        <div><label class="text-sm text-white/70 mb-2 block">Intitulé (poste, diplôme…) *</label><input name="title" class="field" required value="${esc(r.title || '')}"></div>
        <div><label class="text-sm text-white/70 mb-2 block">Lieu (entreprise, école, ville)</label><input name="place" class="field" placeholder="Entreprise, Rouen" value="${esc(r.place || '')}"></div>
        <div><label class="text-sm text-white/70 mb-2 block">Description</label><textarea name="description" class="field !min-h-[120px]">${esc(r.description || '')}</textarea></div>
        <label class="flex items-center gap-3 text-sm text-white/80"><input type="checkbox" name="published" class="w-5 h-5 accent-emerald-500" ${r.published ? 'checked' : ''}>Visible sur le site</label>
        ${isNew ? '<p class="text-white/40 text-xs">Ajouté en haut de la rubrique ; utilisez les flèches pour le placer.</p>' : ''}
        <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
          <button type="button" data-close class="btn-ghost !h-11">Annuler</button>
          <button type="submit" class="btn-primary">${isNew ? 'Ajouter' : 'Enregistrer'}</button>
        </div>
      </form>`, { wide: true });
    const f = document.getElementById('cf');
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('[type=submit]'); btn.disabled = true;
      const row = { section: f.section.value, period: f.period.value.trim(), title: f.title.value.trim(), place: f.place.value.trim(), description: f.description.value.trim(), published: f.published.checked, updated_at: new Date().toISOString() };
      if (isNew || row.section !== r.section) row.sort_order = Math.max(0, ...cv.filter((x) => x.section === row.section).map((x) => x.sort_order)) + 1;
      const q = isNew ? sb.from('portfolio_cv').insert(row).select().single() : sb.from('portfolio_cv').update(row).eq('id', r.id).select().single();
      const { data, error } = await q;
      if (error) { btn.disabled = false; return toast(error.message, 'error'); }
      cv = isNew ? [data, ...cv] : cv.map((x) => (x.id === data.id ? data : x));
      closeModal(); toast(isNew ? 'Ajouté au parcours.' : 'Enregistré.'); renderCv();
    };
  }

  /* ---------- réglages ---------- */
  async function saveSettings(patch) {
    const { data, error } = await sb.from('portfolio_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
    if (error) { toast(error.message, 'error'); return false; }
    settings = data; return true;
  }
  function renderSettings() {
    const photo = settings.photo_thumb_url || settings.photo_url || 'assets/photo.webp';
    const legacy = legacyCount(), posters = posterCount();
    document.getElementById('panel').innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
          <div><p class="text-white font-semibold">Disponibilité</p><p class="text-sm text-white/50">${settings.available ? 'Disponible pour de nouveaux projets' : 'Indisponible pour de nouveaux projets'}</p></div>
          <button id="avail" role="switch" aria-checked="${!!settings.available}" aria-label="Disponibilité" class="relative w-14 h-8 shrink-0 rounded-full transition-colors ${settings.available ? 'bg-emerald-500' : 'bg-white/15'}"><span class="absolute top-1 ${settings.available ? 'left-7' : 'left-1'} w-6 h-6 rounded-full bg-white transition-all"></span></button>
        </div>
        <div class="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
          <img src="${esc(photo)}" alt="" class="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/60 shrink-0">
          <div class="flex-1 min-w-0"><p class="text-white font-semibold">Photo de profil</p><p class="text-sm text-white/50">Image carrée de préférence.</p></div>
          <label class="btn-ghost !rounded-full cursor-pointer shrink-0">${icon('upload')}Changer<input type="file" accept="image/*" id="photo-in" class="sr-only"></label>
        </div>
      </div>
      ${legacy + posters ? `
      <div class="mt-8 p-5 sm:p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <p class="text-white font-semibold mb-1">Maintenance des médias</p>
        <ul class="text-sm text-white/60 mb-4 space-y-1">
          ${legacy ? `<li>${legacy} média${legacy > 1 ? 's sont' : ' est'} encore hébergé${legacy > 1 ? 's' : ''} sur Base44 : à copier dans votre stockage Supabase pour ne plus en dépendre.</li>` : ''}
          ${posters ? `<li>${posters} vidéo${posters > 1 ? 's n\'ont' : ' n\'a'} pas d'image d'aperçu (affichage plus lent sur le site).</li>` : ''}
        </ul>
        <button class="btn-primary !rounded-full" id="fix">${icon('refresh')}Tout corriger</button>
        <p class="text-white/40 text-xs mt-3" id="fix-st">Gardez la page ouverte pendant l'opération.</p>
      </div>` : ''}`;
    document.getElementById('avail').onclick = async () => { if (await saveSettings({ available: !settings.available })) { toast('Disponibilité mise à jour.'); render(); } };
    document.getElementById('photo-in').onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      toast('Envoi en cours…');
      try {
        const url = await upload(file, 'profil');
        const thumb = await uploadBlob(await makeThumb(URL.createObjectURL(file)), `profil/photo-${Date.now()}.webp`);
        if (await saveSettings({ photo_url: url, photo_thumb_url: thumb })) { toast('Photo mise à jour.'); render(); }
      } catch (err) { toast(err.message || String(err), 'error'); }
    };
    const fix = document.getElementById('fix');
    if (fix) fix.onclick = async () => { fix.disabled = true; await migrateMedia(document.getElementById('fix-st')); await loadAll(); await makePosters(document.getElementById('fix-st')); await loadAll(); render(); };
  }

  /* copie des médias encore hébergés sur Base44 vers le stockage Supabase */
  async function migrateMedia(st) {
    const items = [
      ...projects.filter((p) => isLegacy(p.media_url)).map((p) => ({ kind: 'project', id: p.id, label: p.title, url: p.media_url })),
      ...(isLegacy(settings.photo_url) ? [{ kind: 'setting', id: 'photo_url', label: 'Photo de profil', url: settings.photo_url }] : []),
    ];
    let ok = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        st.textContent = `Copie ${i + 1}/${items.length} : ${it.label}…`;
        /* téléchargement par morceaux de 4 Mo : le serveur de Base44 coupe les longs transferts (copie tronquée sinon) */
        const parts = []; let got = 0, total = Infinity, ctype = '';
        while (got < total) {
          const res = await fetch(it.url, { cache: 'no-store', headers: { Range: `bytes=${got}-${got + 4194303}` } });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const buf = await res.arrayBuffer();
          ctype = ctype || res.headers.get('content-type') || '';
          const cr = res.headers.get('content-range');
          if (res.status === 206 && cr) total = +cr.split('/')[1] || total;
          else if (res.status === 200) { total = +res.headers.get('content-length') || buf.byteLength; parts.length = 0; got = 0; }
          if (!buf.byteLength) break;
          parts.push(buf); got += buf.byteLength;
          st.textContent = `Copie ${i + 1}/${items.length} : ${it.label} (${(got / 1048576).toFixed(0)}/${isFinite(total) ? (total / 1048576).toFixed(0) : '?'} Mo)…`;
          if (res.status === 200) break;
        }
        const blob = new Blob(parts, { type: ctype });
        /* contrôle : fichier complet et lisible avant de remplacer le lien (évite une copie tronquée) */
        if (isFinite(total) && blob.size < total) throw new Error('téléchargement incomplet');
        if (it.kind === 'project' && /\.(mp4|mov|webm)(\?|$)/i.test(it.url)) await new Promise((ok, ko) => {
          const v = document.createElement('video'); v.muted = true; v.preload = 'metadata'; v.src = URL.createObjectURL(blob);
          v.onloadedmetadata = () => (v.duration > 0 ? ok() : ko(new Error('vidéo illisible'))); v.onerror = () => ko(new Error('vidéo illisible'));
          setTimeout(() => ko(new Error('vidéo illisible')), 20000);
        });
        const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : (/\.(mp4|mov)(\?|$)/i.test(it.url) ? 'video/mp4' : /\.png(\?|$)/i.test(it.url) ? 'image/png' : undefined);
        const name = decodeURIComponent(it.url.split('?')[0].split('/').pop()).replace(/[^a-zA-Z0-9._-]+/g, '-');
        const path = `base44/${name}`;
        const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: true });
        if (error) throw error;
        const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
        const upd = it.kind === 'project'
          ? await sb.from('portfolio_projects').update({ media_url: url, updated_at: new Date().toISOString() }).eq('id', it.id)
          : await sb.from('portfolio_settings').update({ [it.id]: url }).eq('id', 1);
        if (upd.error) throw upd.error;
        ok++;
      } catch (err) { console.error(it, err); }
    }
    if (items.length) toast(`${ok}/${items.length} média(s) copié(s).`, ok === items.length ? 'ok' : 'error');
  }

  /* images d'aperçu des vidéos : affichage instantané sur le site */
  async function makePosters(st) {
    const todo = projects.filter((p) => kindOf(p) === 'video' && !p.poster_url);
    let ok = 0;
    for (let i = 0; i < todo.length; i++) {
      const p = todo[i];
      try {
        st.textContent = `Aperçu ${i + 1}/${todo.length} : ${p.title}…`;
        const url = await uploadBlob(await makePoster(p.media_url), `posters/${p.id}.webp`);
        const { error } = await sb.from('portfolio_projects').update({ poster_url: url }).eq('id', p.id);
        if (error) throw error;
        ok++;
      } catch (err) { console.error(p, err); }
    }
    if (todo.length) toast(`${ok}/${todo.length} aperçu(s) créé(s).`, ok === todo.length ? 'ok' : 'error');
  }

  /* ---------- démarrage ---------- */
  /* après le lien « mot de passe » reçu par e-mail : on affiche le formulaire tant que le mot de passe n'est pas enregistré */
  let mustSetPassword = /type=recovery/.test(location.hash) || sessionStorage.getItem('tr-set-password') === '1';
  if (mustSetPassword) sessionStorage.setItem('tr-set-password', '1');
  async function start(session) {
    user = session?.user || null;
    if (mustSetPassword && user) return renderNewPassword();
    if (!user) return renderLogin();
    const { data: admin } = await sb.rpc('portfolio_is_admin');
    if (!admin) return renderDenied();
    await loadAll(); render();
  }
  let started = false;
  sb.auth.onAuthStateChange((evt, session) => {
    if (evt === 'TOKEN_REFRESHED' || evt === 'USER_UPDATED') return;
    if (evt === 'PASSWORD_RECOVERY') { started = true; mustSetPassword = true; sessionStorage.setItem('tr-set-password', '1'); return setTimeout(renderNewPassword, 0); }
    if (evt === 'INITIAL_SESSION') { started = true; return setTimeout(() => start(session), 0); }
    if (started) setTimeout(() => start(session), 0);
  });
})();
