// Lit le planning Combo du salarié (adresse d'abonnement calendrier) pour iolite.
// Le navigateur ne peut pas lire directement un autre site : cette fonction fait le relais.
// Elle n'accepte que les adresses Combo et ne garde rien.
export default async (req) => {
  const raw = new URL(req.url).searchParams.get('url') || '';
  let target;
  try { target = new URL(raw.replace(/^webcal:/i, 'https:')); } catch { return new Response('Adresse invalide', { status: 400 }); }
  if (target.protocol !== 'https:' || !/(^|\.)combo(hr)?\.[a-z.]+$/i.test(target.hostname)) {
    return new Response('Seules les adresses Combo sont acceptées', { status: 403 });
  }
  try {
    const r = await fetch(target, { headers: { accept: 'text/calendar, */*' }, redirect: 'follow' });
    const body = await r.text();
    if (!r.ok || !/BEGIN:VCALENDAR/.test(body)) return new Response('Planning introuvable', { status: 502 });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' } });
  } catch {
    return new Response('Combo ne répond pas', { status: 504 });
  }
};
