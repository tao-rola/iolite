/* iolite : fonctionnement hors ligne et rappel du soir */
const CACHE = 'iolite-v83';
const ASSETS = ['./', './index.html', './config.js', './manifest.webmanifest', './favicon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './logo-iolite-mark.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (r.mode === 'navigate' && !/^\/(index\.html)?$/.test(new URL(r.url).pathname)) return; /* autres pages (confidentialité…) : réseau seulement */
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  const url = new URL(r.url);
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
    return;
  }
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
  }
});

/* état copié par la page : réglage du rappel et jours déjà pointés */
function db() { return new Promise((res, rej) => { const q = indexedDB.open('pointeuse', 1); q.onupgradeneeded = () => q.result.createObjectStore('kv'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
function key(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

/* vérifie et marque « notifié aujourd'hui » dans une seule transaction */
async function claim() {
  const d = await db(), now = new Date(), k = key(now);
  return new Promise(res => {
    const tx = d.transaction('kv', 'readwrite'), os = tx.objectStore('kv'), g = os.get('state'); let go = false; name = '';
    g.onsuccess = () => {
      const st = g.result; if (!st || !st.reminder) return;
      const times = (st.reminder.times || (st.reminder.time ? [st.reminder.time] : [])).slice().sort();
      const n = now.getHours() * 60 + now.getMinutes(); let slot = null;
      times.forEach(t => { const p = String(t).split(':'); if ((+p[0]) * 60 + (+p[1]) <= n) slot = t; });
      if (!slot || (st.entered || []).includes(k)) return;
      const id = k + '@' + slot; if (st.notified === id) return;
      st.notified = id; os.put(st, 'state'); go = true; name = st.name || '';
    };
    tx.oncomplete = () => res(go); tx.onerror = () => res(false);
  });
}
let name = '';
async function check() {
  if (!(await claim())) return;
  await self.registration.showNotification('iolite', { body: name ? name + ", vous n'avez rien pointé aujourd'hui." : "Vous n'avez rien pointé aujourd'hui.", icon: 'icon-192.png', badge: 'icon-192.png', tag: 'rappel' });
}
self.addEventListener('periodicsync', e => { if (e.tag === 'rappel') e.waitUntil(check()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return clients.openWindow('./');
  }));
});
