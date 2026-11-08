// Cloudflare Pages : relais du planning iCal pour iolite (adresse : /api/combo?url=…).
// Même fonctionnement et mêmes garde-fous que la version Netlify :
// adresses internes refusées (vérifiées par une résolution DNS), redirections vérifiées, délai et taille limités,
// et seul un calendrier (BEGIN:VCALENDAR) est renvoyé.
const MAX = 5e6, TIMEOUT = 10000, HOPS = 3;
function isIPv4(h) { return /^\d{1,3}(\.\d{1,3}){3}$/.test(h); }
function isIPv6(h) { return h.includes(':'); }
function privateIp(ip) {
  if (isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return privateIp(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('ff');
}
// résolution DNS (A et AAAA) via le service DNS de Cloudflare
async function resolve(host) {
  const out = [];
  for (const type of ['A', 'AAAA']) {
    const r = await fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(host) + '&type=' + type, { headers: { accept: 'application/dns-json' } });
    if (!r.ok) continue;
    const j = await r.json();
    (j.Answer || []).forEach((a) => { if ((a.type === 1 || a.type === 28) && a.data) out.push(a.data); });
  }
  return out;
}
async function check(u) {
  if (!/^https?:$/.test(u.protocol)) throw 400;
  if (u.username || u.password) throw 400;
  if (u.port && !['80', '443'].includes(u.port)) throw 403;
  const h = u.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|.*\.(local|internal|localhost))$/i.test(h)) throw 403;
  const ips = isIPv4(h) || isIPv6(h) ? [h] : await resolve(h);
  if (!ips.length || ips.some(privateIp)) throw 403;
}
async function fetchIcs(raw) {
  let u = new URL(String(raw || '').trim().replace(/^webcal:/i, 'https:'));
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    for (let i = 0; i <= HOPS; i++) {
      await check(u);
      const r = await fetch(u.toString(), { redirect: 'manual', signal: ctl.signal, headers: { accept: 'text/calendar, */*', 'user-agent': 'iolite-planning' } });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { u = new URL(r.headers.get('location'), u); continue; }
      if (!r.ok) throw 502;
      const len = Number(r.headers.get('content-length') || 0); if (len > MAX) throw 413;
      const body = await r.text();
      if (body.length > MAX) throw 413;
      if (!/BEGIN:VCALENDAR/.test(body)) throw 415;
      return body;
    }
    throw 508;
  } finally { clearTimeout(t); }
}
const MSG = { 400: 'Adresse invalide', 403: 'Adresse refusée', 413: 'Calendrier trop volumineux', 415: "Cette adresse ne renvoie pas un calendrier", 502: 'Planning introuvable', 508: 'Trop de redirections' };
export async function onRequestGet({ request }) {
  try {
    const body = await fetchIcs(new URL(request.url).searchParams.get('url'));
    return new Response(body, { status: 200, headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' } });
  } catch (e) {
    const code = typeof e === 'number' ? e : (e && e.name === 'AbortError' ? 504 : e instanceof TypeError && /URL/.test(e.message) ? 400 : 504);
    return new Response(MSG[code] || 'Le planning ne répond pas', { status: code });
  }
}
