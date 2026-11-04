// Lit le planning du salarié (adresse d'abonnement calendrier iCal) pour iolite.
// Le navigateur ne peut pas lire directement un autre site : cette fonction fait le relais.
// Elle n'accepte que les logiciels de planning listés ci-dessous, ne renvoie qu'un calendrier, et ne garde rien.
const ALLOWED = [
  /(^|\.)(combo|combohr)\.(fr|com|io|app)$/i,   // Combo
  /(^|\.)skello\.(io|com|fr)$/i,                // Skello
  /(^|\.)planday\.(com|dk|net)$/i,              // Planday
  /(^|\.)snapshift\.(co|com|fr)$/i,             // Snapshift
  /(^|\.)agendrix\.(com|ca)$/i,                 // Agendrix
  /(^|\.)deputy\.com$/i,                        // Deputy
  /(^|\.)wheniwork\.com$/i,                     // When I Work
];
const allowed = (u) => u.protocol === 'https:' && ALLOWED.some((re) => re.test(u.hostname));

export default async (req) => {
  const raw = new URL(req.url).searchParams.get('url') || '';
  let target;
  try { target = new URL(raw.replace(/^webcal:/i, 'https:')); } catch { return new Response('Adresse invalide', { status: 400 }); }
  if (!allowed(target)) return new Response('Logiciel de planning non reconnu', { status: 403 });
  try {
    const r = await fetch(target, { headers: { accept: 'text/calendar, */*' }, redirect: 'follow' });
    if (r.url && !allowed(new URL(r.url))) return new Response('Redirection refusée', { status: 403 });
    const body = await r.text();
    if (!r.ok || !/BEGIN:VCALENDAR/.test(body) || body.length > 5e6) return new Response('Planning introuvable', { status: 502 });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' } });
  } catch {
    return new Response('Le logiciel de planning ne répond pas', { status: 504 });
  }
};
