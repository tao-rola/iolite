/* Portfolio Tao ROLA : administration (projets, messages, réglages, médias).
   Connexion avec un compte Supabase du projet Iolite inscrit dans la table portfolio_admins. */
(function () {
  const { sb, icon, esc, CATEGORIES, kindOf, ytId, topBar, toast, openModal, closeModal } = window.TR;
  const app = document.getElementById('app');
  const BUCKET = 'portfolio';
  const MAX_MB = 50;
  const isLegacy = (u) => /base44\.(app|com)|qtrypzzcjebvfcihiynt\.supabase\.co/.test(u || '');
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);

  let user = null, tab = 'projets', filter = 'all';
  let projects = [], messages = [], settings = {};

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
        </form>
      </div>`;
    document.getElementById('login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Connexion…';
      const { error } = await sb.auth.signInWithPassword({ email: document.getElementById('l-email').value.trim(), password: document.getElementById('l-pass').value });
      if (error) renderLogin("E-mail ou mot de passe incorrect.");
    });
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
    const [p, m, s] = await Promise.all([
      sb.from('portfolio_projects').select('*').order('category').order('sort_order', { ascending: false }).order('created_at', { ascending: false }),
      sb.from('portfolio_messages').select('*').order('created_at', { ascending: false }),
      sb.from('portfolio_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    projects = p.data || []; messages = m.data || []; settings = s.data || {};
  }

  async function upload(file, folder) {
    if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Fichier trop lourd (${(file.size / 1048576).toFixed(0)} Mo). Maximum ${MAX_MB} Mo : compressez-le ou mettez la vidéo sur YouTube.`);
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
  function render() {
    const unread = messages.filter((m) => !m.is_read).length;
    const legacy = projects.filter((p) => isLegacy(p.media_url)).length + ['photo_url', 'cv_pdf_url'].filter((k) => isLegacy(settings[k])).length + projects.filter((p) => kindOf(p) === 'video' && !p.poster_url).length;
    const T = [['projets', 'Projets', 'layers', projects.length], ['messages', 'Messages', 'inbox', unread], ['reglages', 'Réglages', 'settings', 0], ['medias', 'Médias', 'upload', legacy]];
    app.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h2 class="text-2xl sm:text-3xl font-bold text-white">Tableau de bord</h2><p class="text-white/40 text-sm truncate">${esc(user.email)}</p></div>
        <div class="flex gap-2"><a href="./" class="btn-ghost">${icon('globe')}Voir le site</a><button class="btn-ghost" id="out">${icon('logOut')}<span class="hidden sm:inline">Déconnexion</span></button></div>
      </div>
      <div class="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-full mb-6 overflow-x-auto no-scrollbar">
        ${T.map(([id, l, ic, n]) => `<button data-tab="${id}" class="flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === id ? 'bg-emerald-500 text-white' : 'text-white/70 hover:text-white'}">${icon(ic)}${l}${n ? `<span class="text-[11px] px-1.5 rounded-full ${tab === id ? 'bg-white/25' : 'bg-white/10'}">${n}</span>` : ''}</button>`).join('')}
      </div>
      <div id="panel"></div>`;
    document.getElementById('out').onclick = () => sb.auth.signOut();
    app.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    ({ projets: renderProjects, messages: renderMessages, reglages: renderSettings, medias: () => { renderMedia(); renderPosters(); } })[tab]();
  }

  /* ---------- projets ---------- */
  function thumb(p) {
    const k = kindOf(p), c = 'w-full h-full object-cover';
    if (k === 'youtube') return `<img src="https://i.ytimg.com/vi/${ytId(p.media_url)}/default.jpg" class="${c}" alt="">`;
    if (k === 'video') return `<video src="${esc(p.media_url)}#t=0.5" class="${c}" muted preload="metadata"></video>`;
    if (k === 'image') return `<img src="${esc(p.media_url)}" class="${c}" alt="" loading="lazy">`;
    return `<div class="w-full h-full flex items-center justify-center text-emerald-400">${icon('code')}</div>`;
  }

  function renderProjects() {
    const list = projects.filter((p) => filter === 'all' || p.category === filter);
    const chips = [['all', 'Tous'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])];
    document.getElementById('panel').innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">${chips.map(([k, l]) => `<button data-filter="${k}" class="px-3 py-1.5 rounded-full text-sm border whitespace-nowrap ${filter === k ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-white/60 hover:text-white'}">${l}</button>`).join('')}</div>
        <button class="btn-primary" id="add">${icon('plus')}Ajouter un projet</button>
      </div>
      <p class="text-white/40 text-xs mb-3">Les projets s'affichent du plus grand « ordre » au plus petit.</p>
      <div class="space-y-2">
        ${list.map((p) => `
          <div class="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
            <div class="w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden bg-black shrink-0">${thumb(p)}</div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate">${esc(p.title)}</p>
              <p class="text-xs text-white/40 truncate">${esc(CATEGORIES[p.category]?.label || p.category)} · ordre ${p.sort_order}${p.published ? '' : ' · <span class="text-amber-400">masqué</span>'}${isLegacy(p.media_url) ? ' · <span class="text-amber-400">média Base44</span>' : ''}</p>
            </div>
            <button data-toggle="${p.id}" class="hidden sm:inline-flex btn-ghost !h-9" title="${p.published ? 'Masquer' : 'Publier'}">${p.published ? 'Masquer' : 'Publier'}</button>
            <button data-edit="${p.id}" class="btn-ghost !h-9 !px-2.5" aria-label="Modifier">${icon('pencil')}</button>
            <button data-del="${p.id}" class="btn-ghost !h-9 !px-2.5 hover:!text-red-400" aria-label="Supprimer">${icon('trash')}</button>
          </div>`).join('') || '<p class="text-white/40 text-center py-12">Aucun projet.</p>'}
      </div>`;
    const panel = document.getElementById('panel');
    panel.querySelectorAll('[data-filter]').forEach((b) => (b.onclick = () => { filter = b.dataset.filter; renderProjects(); }));
    document.getElementById('add').onclick = () => editProject({ category: filter === 'all' ? 'audiovisuel' : filter, published: true, tags: [], sort_order: nextOrder(filter === 'all' ? 'audiovisuel' : filter), media_type: 'video' });
    panel.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => editProject(projects.find((p) => p.id === b.dataset.edit))));
    panel.querySelectorAll('[data-toggle]').forEach((b) => (b.onclick = async () => {
      const p = projects.find((x) => x.id === b.dataset.toggle);
      const { error } = await sb.from('portfolio_projects').update({ published: !p.published, updated_at: new Date().toISOString() }).eq('id', p.id);
      if (error) return toast(error.message, 'error');
      p.published = !p.published; renderProjects();
    }));
    panel.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
      const p = projects.find((x) => x.id === b.dataset.del);
      if (!confirm(`Supprimer définitivement « ${p.title} » ?`)) return;
      const { error } = await sb.from('portfolio_projects').delete().eq('id', p.id);
      if (error) return toast(error.message, 'error');
      projects = projects.filter((x) => x.id !== p.id); toast('Projet supprimé.'); render();
    }));
  }
  const nextOrder = (cat) => Math.max(0, ...projects.filter((p) => p.category === cat).map((p) => p.sort_order)) + 1;

  function editProject(p) {
    const isNew = !p.id;
    openModal(`
      <form id="pf" class="p-5 sm:p-8 space-y-4">
        <h2 class="text-2xl font-bold text-white pr-10">${isNew ? 'Nouveau projet' : 'Modifier le projet'}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="text-sm text-white/70 mb-2 block">Catégorie</label>
            <select name="category" class="field">${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}" ${p.category === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
          <div><label class="text-sm text-white/70 mb-2 block">Ordre d'affichage</label><input name="sort_order" type="number" class="field" value="${p.sort_order ?? 0}"></div>
        </div>
        <div><label class="text-sm text-white/70 mb-2 block">Titre *</label><input name="title" class="field" required value="${esc(p.title || '')}"></div>
        <div><label class="text-sm text-white/70 mb-2 block">Description</label><textarea name="description" class="field">${esc(p.description || '')}</textarea></div>
        <div><label class="text-sm text-white/70 mb-2 block">Tags (séparés par des virgules)</label><input name="tags" class="field" value="${esc((p.tags || []).join(', '))}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label class="text-sm text-white/70 mb-2 block">Type de média</label>
            <select name="media_type" class="field">${[['video', 'Vidéo'], ['image', 'Image'], ['youtube', 'YouTube']].map(([k, l]) => `<option value="${k}" ${p.media_type === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="sm:col-span-2"><label class="text-sm text-white/70 mb-2 block">Adresse du média</label><input name="media_url" class="field" placeholder="https://… (ou importez un fichier)" value="${esc(p.media_url || '')}"></div>
        </div>
        <label class="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 cursor-pointer text-sm text-center">
          ${icon('upload')}<span id="fname">Importer une vidéo ou une image (max ${MAX_MB} Mo)</span>
          <input type="file" name="file" accept="video/*,image/*" class="sr-only">
        </label>
        <div><label class="text-sm text-white/70 mb-2 block">Lien externe (YouTube, site…)</label><input name="link" class="field" placeholder="https://" value="${esc(p.link || '')}"></div>
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
        } else if (media_url !== p.media_url) poster_url = '';
        let media_type = f.media_type.value;
        if (ytId(media_url)) media_type = 'youtube';
        const row = {
          category: f.category.value, title: f.title.value.trim(), description: f.description.value.trim(),
          tags: f.tags.value.split(',').map((t) => t.trim()).filter(Boolean), media_type, media_url,
          link: f.link.value.trim(), sort_order: parseInt(f.sort_order.value, 10) || 0, published: f.published.checked, poster_url,
          updated_at: new Date().toISOString(),
        };
        if (!row.title) throw new Error('Le titre est obligatoire.');
        const q = isNew ? sb.from('portfolio_projects').insert(row).select().single() : sb.from('portfolio_projects').update(row).eq('id', p.id).select().single();
        const { data, error } = await q;
        if (error) throw error;
        projects = isNew ? [data, ...projects] : projects.map((x) => (x.id === data.id ? data : x));
        closeModal(); toast(isNew ? 'Projet créé.' : 'Projet enregistré.'); render();
      } catch (err) {
        toast(err.message || String(err), 'error'); btn.disabled = false; btn.textContent = isNew ? 'Créer' : 'Enregistrer';
      }
    };
  }

  /* ---------- messages ---------- */
  function renderMessages() {
    const fmt = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    document.getElementById('panel').innerHTML = messages.length ? `<div class="space-y-3">${messages.map((m) => `
      <article class="p-4 sm:p-5 rounded-xl border ${m.is_read ? 'bg-white/[.03] border-white/10' : 'bg-emerald-500/5 border-emerald-500/30'}">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
          <div class="min-w-0"><p class="text-white font-semibold truncate">${esc(m.subject)}</p><p class="text-sm text-white/50 truncate">${esc(m.name)} · <a class="text-emerald-400" href="mailto:${esc(m.email)}">${esc(m.email)}</a></p></div>
          <p class="text-xs text-white/40 shrink-0">${fmt(m.created_at)}</p>
        </div>
        <p class="text-white/70 text-sm whitespace-pre-line break-words">${esc(m.message)}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <a class="btn-ghost !h-9" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re : ' + m.subject)}">${icon('send')}Répondre</a>
          ${m.is_read ? '' : `<button class="btn-ghost !h-9" data-read="${m.id}">${icon('check')}Marquer comme lu</button>`}
          <button class="btn-ghost !h-9 hover:!text-red-400" data-mdel="${m.id}">${icon('trash')}Supprimer</button>
        </div>
      </article>`).join('')}</div>` : `<p class="text-white/40 text-center py-16">Aucun message pour l'instant.</p>`;
    const panel = document.getElementById('panel');
    panel.querySelectorAll('[data-read]').forEach((b) => (b.onclick = async () => {
      const { error } = await sb.from('portfolio_messages').update({ is_read: true }).eq('id', b.dataset.read);
      if (error) return toast(error.message, 'error');
      messages.find((m) => m.id === b.dataset.read).is_read = true; render();
    }));
    panel.querySelectorAll('[data-mdel]').forEach((b) => (b.onclick = async () => {
      if (!confirm('Supprimer définitivement ce message ?')) return;
      const { error } = await sb.from('portfolio_messages').delete().eq('id', b.dataset.mdel);
      if (error) return toast(error.message, 'error');
      messages = messages.filter((m) => m.id !== b.dataset.mdel); render();
    }));
  }

  /* ---------- réglages ---------- */
  async function saveSettings(patch) {
    const { data, error } = await sb.from('portfolio_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
    if (error) { toast(error.message, 'error'); return false; }
    settings = data; return true;
  }
  function renderSettings() {
    const fileRow = (key, label, accept, current) => `
      <div class="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10">
        <p class="text-white font-medium mb-1">${label}</p>
        <p class="text-xs text-white/40 break-all mb-3">${current ? `<a class="text-emerald-400" href="${esc(current)}" target="_blank" rel="noopener">${esc(current.split('/').pop())}</a>` : 'Aucun fichier'}</p>
        <div class="flex flex-wrap gap-2">
          <label class="btn-ghost !h-9 cursor-pointer">${icon('upload')}Importer<input type="file" accept="${accept}" data-file="${key}" class="sr-only"></label>
          ${current ? `<button class="btn-ghost !h-9 hover:!text-red-400" data-clear="${key}">${icon('trash')}Retirer</button>` : ''}
        </div>
      </div>`;
    document.getElementById('panel').innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 md:col-span-2 flex items-center justify-between gap-4">
          <div><p class="text-white font-medium">Disponibilité</p><p class="text-sm text-white/50">${settings.available ? 'Disponible pour de nouveaux projets' : 'Indisponible pour de nouveaux projets'}</p></div>
          <button id="avail" role="switch" aria-checked="${!!settings.available}" class="relative w-14 h-8 rounded-full transition-colors ${settings.available ? 'bg-emerald-500' : 'bg-white/15'}"><span class="absolute top-1 ${settings.available ? 'left-7' : 'left-1'} w-6 h-6 rounded-full bg-white transition-all"></span></button>
        </div>
        ${fileRow('photo_url', 'Photo de profil', 'image/*', settings.photo_url)}
        ${fileRow('cv_pdf_url', 'CV (PDF)', 'application/pdf', settings.cv_pdf_url)}
      </div>`;
    const panel = document.getElementById('panel');
    document.getElementById('avail').onclick = async () => { if (await saveSettings({ available: !settings.available })) { toast('Disponibilité mise à jour.'); renderSettings(); } };
    panel.querySelectorAll('[data-file]').forEach((inp) => (inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      toast('Envoi en cours…');
      try {
        const url = await upload(file, 'profil');
        const patch = { [inp.dataset.file]: url };
        if (inp.dataset.file === 'photo_url') patch.photo_thumb_url = await uploadBlob(await makeThumb(URL.createObjectURL(file)), `profil/photo-${Date.now()}.webp`);
        if (await saveSettings(patch)) { toast('Fichier enregistré.'); renderSettings(); }
      }
      catch (err) { toast(err.message || String(err), 'error'); }
    }));
    panel.querySelectorAll('[data-clear]').forEach((b) => (b.onclick = async () => { if (await saveSettings({ [b.dataset.clear]: '', ...(b.dataset.clear === 'photo_url' ? { photo_thumb_url: '' } : {}) })) renderSettings(); }));
  }

  /* ---------- migration des médias Base44 vers Supabase ---------- */
  function renderMedia() {
    const items = [
      ...projects.filter((p) => isLegacy(p.media_url)).map((p) => ({ kind: 'project', id: p.id, label: p.title, url: p.media_url })),
      ...['photo_url', 'cv_pdf_url'].filter((k) => isLegacy(settings[k])).map((k) => ({ kind: 'setting', id: k, label: { photo_url: 'Photo de profil', cv_pdf_url: 'CV (PDF)' }[k], url: settings[k] })),
    ];
    document.getElementById('panel').innerHTML = `
      <div class="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 mb-4">
        <h3 class="text-white text-lg font-semibold mb-1">Rapatrier les médias de Base44</h3>
        <p class="text-white/50 text-sm mb-4">Copie les vidéos et images encore hébergées sur Base44 dans le stockage Supabase du portfolio, puis met à jour les liens. Le site ne dépendra plus de Base44. Gardez cette page ouverte pendant la copie.</p>
        ${items.length ? `<button class="btn-primary" id="migrate">${icon('refresh')}Copier ${items.length} média${items.length > 1 ? 's' : ''}</button>` : `<p class="text-emerald-400 text-sm flex items-center gap-2">${icon('check')}Tous les médias sont hébergés sur Supabase.</p>`}
      </div>
      <div class="space-y-2" id="mlist">${items.map((it, i) => `
        <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <span class="flex-1 min-w-0 truncate text-white text-sm">${esc(it.label)}</span>
          <span class="text-xs text-white/40 shrink-0" id="ms-${i}">en attente</span>
        </div>`).join('')}</div>`;
    const btn = document.getElementById('migrate'); if (!btn) return;
    btn.onclick = async () => {
      btn.disabled = true; let ok = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i], st = document.getElementById('ms-' + i);
        try {
          st.textContent = 'téléchargement…'; st.className = 'text-xs text-amber-400 shrink-0';
          const res = await fetch(it.url); if (!res.ok) throw new Error('HTTP ' + res.status);
          const blob = await res.blob();
          const name = decodeURIComponent(it.url.split('?')[0].split('/').pop()).replace(/[^a-zA-Z0-9._-]+/g, '-');
          const path = `base44/${name}`;
          st.textContent = `envoi (${(blob.size / 1048576).toFixed(1)} Mo)…`;
          const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || undefined, cacheControl: '31536000', upsert: true });
          if (error) throw error;
          const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          const upd = it.kind === 'project'
            ? await sb.from('portfolio_projects').update({ media_url: url, updated_at: new Date().toISOString() }).eq('id', it.id)
            : await sb.from('portfolio_settings').update({ [it.id]: url }).eq('id', 1);
          if (upd.error) throw upd.error;
          st.textContent = 'copié ✓'; st.className = 'text-xs text-emerald-400 shrink-0'; ok++;
        } catch (err) {
          console.error(it, err); st.textContent = 'échec : ' + (err.message || err); st.className = 'text-xs text-red-400 shrink-0 max-w-[50%] truncate';
        }
      }
      await loadAll();
      toast(`${ok}/${items.length} média(s) copié(s).`, ok === items.length ? 'ok' : 'error');
      setTimeout(render, 1500);
    };
  }

  /* aperçus d'image des vidéos : affichage instantané sur le site */
  function renderPosters() {
    const todo = projects.filter((p) => kindOf(p) === 'video' && !p.poster_url);
    const box = document.createElement('div');
    box.className = 'mt-8';
    box.innerHTML = `
      <div class="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 mb-4">
        <h3 class="text-white text-lg font-semibold mb-1">Aperçus des vidéos</h3>
        <p class="text-white/50 text-sm mb-4">Crée une image légère de chaque vidéo : elle s'affiche immédiatement sur le site pendant que la vidéo se charge. Fait automatiquement pour les nouvelles vidéos importées.</p>
        ${todo.length ? `<button class="btn-primary" id="posters">${icon('refresh')}Créer ${todo.length} aperçu${todo.length > 1 ? 's' : ''}</button>` : `<p class="text-emerald-400 text-sm flex items-center gap-2">${icon('check')}Toutes les vidéos ont un aperçu.</p>`}
      </div>
      <div class="space-y-2">${todo.map((p, i) => `<div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"><span class="flex-1 min-w-0 truncate text-white text-sm">${esc(p.title)}</span><span class="text-xs text-white/40 shrink-0" id="ps-${i}">en attente</span></div>`).join('')}</div>`;
    document.getElementById('panel').appendChild(box);
    const btn = document.getElementById('posters'); if (!btn) return;
    btn.onclick = async () => {
      btn.disabled = true; let ok = 0;
      for (let i = 0; i < todo.length; i++) {
        const p = todo[i], st = document.getElementById('ps-' + i);
        try {
          st.textContent = 'création…'; st.className = 'text-xs text-amber-400 shrink-0';
          const url = await uploadBlob(await makePoster(p.media_url), `posters/${p.id}.webp`);
          const { error } = await sb.from('portfolio_projects').update({ poster_url: url }).eq('id', p.id);
          if (error) throw error;
          st.textContent = 'fait ✓'; st.className = 'text-xs text-emerald-400 shrink-0'; ok++;
        } catch (err) { console.error(p, err); st.textContent = 'échec : ' + (err.message || err); st.className = 'text-xs text-red-400 shrink-0 max-w-[50%] truncate'; }
      }
      await loadAll(); toast(`${ok}/${todo.length} aperçu(s) créé(s).`, ok === todo.length ? 'ok' : 'error'); setTimeout(render, 1200);
    };
  }

  /* ---------- démarrage ---------- */
  async function start(session) {
    user = session?.user || null;
    if (!user) return renderLogin();
    const { data: admin } = await sb.rpc('portfolio_is_admin');
    if (!admin) return renderDenied();
    await loadAll(); render();
  }
  let started = false;
  sb.auth.onAuthStateChange((evt, session) => {
    if (evt === 'TOKEN_REFRESHED' || evt === 'USER_UPDATED') return;
    if (evt === 'INITIAL_SESSION') { started = true; return setTimeout(() => start(session), 0); }
    if (started) setTimeout(() => start(session), 0);
  });
})();
