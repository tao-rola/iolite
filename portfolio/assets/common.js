/* Portfolio Tao ROLA : éléments communs (données, navigation, pied de page, curseur, fenêtre projet). */
(function () {
  const SB_URL = 'https://wdhihttfwizcegxxhkrn.supabase.co';
  const SB_KEY = 'sb_publishable_R9Wnnwoo5YGoyrn52K1Prw_ju-OJkeA';
  /* client Supabase complet uniquement sur la page admin ; les pages publiques utilisent l'API REST (plus léger) */
  const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { storageKey: 'tao-portfolio-auth', persistSession: true, autoRefreshToken: true },
  }) : null;
  const rest = (path, opts = {}) => fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { apikey: SB_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) } });

  const CONTACT = {
    email: 'tao.rola.pro@gmail.com',
    phone: '07 68 47 97 25', tel: '0768479725',
    instagram: 'https://www.instagram.com/gallium.visuals/', instagramName: '@gallium.visuals',
    linkedin: 'https://www.linkedin.com/in/tao-rola/',
  };

  const CATEGORIES = {
    audiovisuel: { label: 'Audiovisuel', sub: 'Photos & Vidéos', href: 'audiovisuel', icon: 'camera', cta: 'Voir la galerie' },
    graphisme: { label: 'Graphisme', sub: 'Créations & Projets graphiques', href: 'graphisme', icon: 'layers', cta: 'Voir les créations' },
    developpement: { label: 'Développement', short: 'Dév.', sub: 'Applications & Sites internet', href: 'developpement', icon: 'code', cta: 'Voir les projets' },
  };

  /* ---------- icônes (lucide) ---------- */
  const P = {
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    graduationCap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  };
  const icon = (name, cls = 'w-4 h-4') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls} shrink-0" aria-hidden="true">${P[name] || ''}</svg>`;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- données (mises en cache sur l'appareil pour un affichage immédiat) ---------- */
  const CACHE_KEY = 'tr-portfolio-v1';
  const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; } };
  const writeCache = (patch) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), ...patch })); } catch {} };
  let projectsReq = null, settingsReq = null;
  const fetchProjects = () => projectsReq || (projectsReq = rest('portfolio_projects?select=*&published=eq.true&order=sort_order.desc,created_at.desc')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { writeCache({ projects: d }); return d; })
    .catch((e) => { console.error(e); return readCache().projects || []; }));
  const fetchSettings = () => settingsReq || (settingsReq = rest('portfolio_settings?select=*&id=eq.1')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => { const s = d[0] || {}; writeCache({ settings: s }); return s; })
    .catch((e) => { console.error(e); return readCache().settings || {}; }));

  /* onData est appelé tout de suite avec le cache (s'il existe), puis avec les données fraîches si elles ont changé */
  function withProjects(category, onData) {
    const pick = (all) => (category ? all.filter((p) => p.category === category) : all);
    const cached = readCache().projects;
    if (cached) onData(pick(cached), true);
    fetchProjects().then((fresh) => { if (!cached || JSON.stringify(cached) !== JSON.stringify(fresh)) onData(pick(fresh), false); });
  }
  function withSettings(onData) {
    const cached = readCache().settings;
    if (cached) onData(cached);
    fetchSettings().then((fresh) => { if (!cached || JSON.stringify(cached) !== JSON.stringify(fresh)) onData(fresh); });
  }
  const getProjects = (category) => fetchProjects().then((all) => (category ? all.filter((p) => p.category === category) : all));
  const getSettings = fetchSettings;

  const ytId = (url) => {
    const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : null;
  };
  const kindOf = (p) => {
    if (!p.media_url) return 'none';
    if (p.media_type === 'youtube' || ytId(p.media_url)) return 'youtube';
    if (p.media_type === 'image' || /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(p.media_url)) return 'image';
    return 'video';
  };
  const posterOf = (p) => p.poster_url || (kindOf(p) === 'youtube' ? `https://i.ytimg.com/vi/${ytId(p.media_url)}/hqdefault.jpg` : '');
  /* YouTube en boucle, muet, sans aucune interaction possible */
  const ytLoopSrc = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`;
  const projectLink = (p) => p.link || (kindOf(p) === 'youtube' ? p.media_url : '');
  const hostOf = (url) => { try { return new URL(url).host; } catch { return ''; } };

  /* ---------- navigation ---------- */
  /* barre de navigation : Accueil · Projets (Audiovisuel, Graphisme, Développement) · Contact */
  function homeNav(active = 'accueil') {
    const base = 'relative px-3.5 md:px-5 py-2 text-xs md:text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-300';
    const pill = (on) => `<span class="nav-pill absolute inset-0 bg-emerald-500 rounded-full transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-0'}"></span>`;
    const label = (on, txt) => `<span class="nav-label relative z-10 inline-flex items-center gap-1 ${on ? 'text-white' : 'text-white/70 hover:text-white'}">${txt}</span>`;
    const sub = Object.values(CATEGORIES).map((c) => `
      <a href="${c.href}" role="menuitem" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">${icon(c.icon, 'w-4 h-4 text-emerald-500')}${c.label}</a>`).join('');
    return `
      <div class="fixed top-0 inset-x-0 z-50 flex justify-center pt-safe md:pt-6 px-2 pointer-events-none">
        <nav aria-label="Navigation principale" class="pointer-events-auto max-w-full animate-fade-in">
          <div class="flex items-center gap-0.5 md:gap-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-1.5 md:px-2 py-1.5 md:py-2">
            <button type="button" data-goto="accueil" data-nav="accueil" class="nav-btn ${base}">${pill(active === 'accueil')}${label(active === 'accueil', 'Accueil')}</button>
            <div class="relative" id="menu-projets">
              <button type="button" data-nav="categories" aria-haspopup="true" aria-expanded="false" class="nav-btn ${base}">${pill(active === 'categories')}${label(active === 'categories', `Projets<svg class="chev w-3.5 h-3.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`)}</button>
              <div role="menu" class="menu-panel absolute left-1/2 top-full pt-3 -translate-x-1/2 opacity-0 pointer-events-none translate-y-1 transition-all duration-200">
                <div class="min-w-[200px] p-1.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-2xl">${sub}</div>
              </div>
            </div>
            <a href="contact" data-nav="contact" class="nav-btn ${base}">${pill(active === 'contact')}${label(active === 'contact', 'Contact')}</a>
          </div>
        </nav>
      </div>`;
  }
  /* menu déroulant « Projets » : survol à la souris, appui sur mobile, fermeture au clic ailleurs ou Échap */
  function initNavMenu() {
    const box = document.getElementById('menu-projets'); if (!box) return;
    const btn = box.querySelector('button'), panel = box.querySelector('.menu-panel'), chev = box.querySelector('.chev');
    const set = (open) => {
      panel.classList.toggle('opacity-0', !open); panel.classList.toggle('pointer-events-none', !open); panel.classList.toggle('translate-y-1', !open);
      btn.setAttribute('aria-expanded', open); chev.style.transform = open ? 'rotate(180deg)' : '';
    };
    const hover = matchMedia('(hover: hover)').matches;
    if (hover) { box.addEventListener('mouseenter', () => set(true)); box.addEventListener('mouseleave', () => set(false)); }
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('click', (e) => { if (!box.contains(e.target)) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* pages internes : simple bouton « Retour » arrondi en haut à gauche (le titre est passé en paramètre pour compatibilité) */
  function topBar() {
    return `
      <a href="./" class="fixed z-40 left-4 sm:left-6 md:left-8 inline-flex items-center gap-2 pl-3 pr-4 sm:pl-4 sm:pr-5 py-2 sm:py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white hover:border-white/30 text-sm font-medium transition-all duration-300 animate-fade-in"
         style="top:max(1rem, env(safe-area-inset-top))" aria-label="Retour à l'accueil">${icon('arrowLeft', 'w-4 h-4')}<span>Retour</span></a>`;
  }

  function footer() {
    const link = (href, label, ext) => `<li><a href="${href}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-white/60 hover:text-white text-sm transition-colors duration-300">${label}</a></li>`;
    const contact = (href, ic, label, ext) => `<li><a href="${href}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''} class="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors duration-300 break-all">${icon(ic)}${label}</a></li>`;
    return `
      <footer class="relative bg-black border-t border-white/10 py-12 md:py-16 px-6 md:px-12">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12 mb-10 md:mb-12">
            <div class="sm:col-span-2 md:col-span-1">
              <h3 class="text-2xl font-semibold text-white mb-4">Tao ROLA</h3>
              <p class="text-white/60 text-sm leading-relaxed max-w-sm">Professionnel de l'événementiel et passionné d'image, je vous accompagne pour faire de chaque instant un moment d'exception.</p>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-white mb-4">Liens Rapides</h4>
              <ul class="space-y-2">
                ${link('./', 'Accueil')}${link('audiovisuel', 'Audiovisuel')}${link('graphisme', 'Graphisme')}${link('developpement', 'Développement')}
                ${link('profil', 'Mon profil (CV)')}${link('contact', 'Contact')}${link('admin', 'Administration')}
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-white mb-4">Contact</h4>
              <ul class="space-y-3">
                ${contact('mailto:' + CONTACT.email, 'mail', CONTACT.email)}
                ${contact('tel:' + CONTACT.tel, 'phone', CONTACT.phone)}
                ${contact(CONTACT.instagram, 'instagram', CONTACT.instagramName, true)}
                ${contact(CONTACT.linkedin, 'linkedin', 'Tao ROLA', true)}
              </ul>
            </div>
          </div>
          <div class="pt-8 border-t border-white/10 text-center pb-safe">
            <p class="text-white/40 text-sm">© ${new Date().getFullYear()} Tao ROLA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- curseur (souris uniquement) ---------- */
  function initCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const dot = document.createElement('div');
    dot.className = 'fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-[width,height,opacity] duration-200 opacity-0';
    document.body.appendChild(dot);
    let x = -100, y = -100, cx = x, cy = y, big = false;
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY; dot.style.opacity = '1';
      const b = !!e.target.closest('a,button,[role="button"],input,textarea,select,label');
      if (b !== big) { big = b; dot.style.width = dot.style.height = big ? '40px' : '16px'; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => (dot.style.opacity = '0'));
    (function loop() {
      cx += (x - cx) * 0.35; cy += (y - cy) * 0.35;
      const s = big ? 20 : 8;
      dot.style.transform = `translate(${cx - s}px, ${cy - s}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- notifications ---------- */
  function toast(msg, type = 'ok') {
    let box = document.getElementById('toasts');
    if (!box) {
      box = document.createElement('div'); box.id = 'toasts';
      box.className = 'fixed z-[100] inset-x-0 bottom-0 p-4 flex flex-col items-center sm:items-end gap-2 pointer-events-none pb-safe';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.className = `pointer-events-auto animate-sheet max-w-sm w-full sm:w-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-100' : 'bg-black/80 border-emerald-500/30 text-white'}`;
    t.textContent = msg; box.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
  }

  /* ---------- fenêtre (modal) ---------- */
  let lastFocus = null;
  function openModal(inner, { wide = true } = {}) {
    closeModal();
    lastFocus = document.activeElement;
    const m = document.createElement('div');
    m.id = 'modal';
    m.className = 'fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `
      <div class="modal-panel relative w-full ${wide ? 'sm:max-w-4xl' : 'sm:max-w-lg'} max-h-[92dvh] overflow-y-auto overscroll-contain bg-[#111] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-sheet">
        <button type="button" data-close class="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white/80 hover:text-white" aria-label="Fermer">${icon('x', 'w-5 h-5')}</button>
        ${inner}
      </div>`;
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModal(); });
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    m.querySelector('[data-close]').focus({ preventScroll: true });
  }
  function closeModal() {
    const m = document.getElementById('modal');
    if (!m) return;
    m.querySelectorAll('video').forEach((v) => v.pause());
    m.remove(); document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function projectModal(p) {
    const k = kindOf(p);
    let media = '';
    if (k === 'youtube') media = `<div class="relative aspect-video bg-black overflow-hidden"><iframe class="absolute inset-0 w-full h-full pointer-events-none scale-[1.2]" src="${ytLoopSrc(ytId(p.media_url))}" title="${esc(p.title)}" allow="autoplay; encrypted-media" tabindex="-1""></iframe><img src="${posterOf(p)}" alt="" class="yt-cover absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none"></div>`;
    else if (k === 'video') media = `<div class="bg-black flex justify-center"><video src="${esc(p.media_url)}" ${p.poster_url ? `poster="${esc(p.poster_url)}"` : ''} class="w-full max-h-[60dvh] object-contain" controls autoplay muted loop playsinline></video></div>`;
    else if (k === 'image') media = `<div class="bg-black flex justify-center"><img src="${esc(p.media_url)}" alt="${esc(p.title)}" class="w-full max-h-[60dvh] object-contain"></div>`;
    else if (p.category === 'developpement') media = devPlaceholder(p, 'aspect-video');
    const href = projectLink(p);
    const link = href
      ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/5 transition-all">${icon('externalLink')}${p.category === 'developpement' ? 'Voir le site' : k === 'youtube' ? 'Voir le projet sur YouTube' : 'Voir le projet'}</a>` : '';
    openModal(`
      ${media}
      <div class="p-5 sm:p-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3 pr-10">${esc(p.title)}</h2>
        ${(p.tags || []).length ? `<div class="flex flex-wrap gap-1.5 mb-5">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${p.description ? `<p class="text-white/70 leading-relaxed whitespace-pre-line text-[15px]">${esc(p.description)}</p>` : ''}
        ${link ? `<div class="mt-6">${link}</div>` : ''}
      </div>`);
    const cover = document.querySelector('#modal .yt-cover');
    if (cover) setTimeout(() => (cover.style.opacity = '0'), 4500);
  }

  function devPlaceholder(p, extra = '') {
    const host = hostOf(p.link) || 'projet';
    const initials = esc(String(p.title || '?').trim().slice(0, 1).toUpperCase());
    return `
      <div class="relative ${extra} w-full overflow-hidden bg-[#0d0d0d]">
        <div class="absolute inset-0 bg-grid opacity-60"></div>
        <div class="glow" style="width:60%;height:80%;top:10%;left:20%;background:radial-gradient(circle,#10b981 0%,transparent 70%);opacity:.35"></div>
        <div class="absolute inset-4 sm:inset-6 rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm flex flex-col overflow-hidden">
          <div class="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
            <span class="w-2.5 h-2.5 rounded-full bg-white/20"></span><span class="w-2.5 h-2.5 rounded-full bg-white/20"></span><span class="w-2.5 h-2.5 rounded-full bg-white/20"></span>
            <span class="ml-2 flex-1 truncate text-[11px] text-white/40 bg-white/5 rounded px-2 py-0.5">${esc(host)}</span>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center gap-3 p-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">${initials}</div>
            <p class="text-white font-semibold text-lg text-center">${esc(p.title)}</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- lecture des vidéos visibles uniquement ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) { if (v.preload === 'none') v.preload = 'metadata'; v.play().catch(() => {}); }
      else v.pause();
    });
  }, { rootMargin: '100px' }) : null;
  const watchVideo = (v) => { v.muted = true; if (io) io.observe(v); else v.play().catch(() => {}); };

  window.TR = { initNavMenu, sb, rest, CONTACT, CATEGORIES, icon, esc, getProjects, getSettings, withProjects, withSettings, ytId, kindOf, hostOf, posterOf, ytLoopSrc, projectLink, homeNav, topBar, footer, initCursor, toast, openModal, closeModal, projectModal, devPlaceholder, watchVideo };
  document.addEventListener('DOMContentLoaded', initCursor);
})();
