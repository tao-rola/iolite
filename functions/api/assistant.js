// Cloudflare Pages : l'assistant de la page Alertes (adresse : /api/assistant).
// 1. vérifie que la personne est connectée à son compte iolite (jeton Supabase)
// 2. limite le nombre de messages par jour et par personne
// 3. interroge le modèle d'IA de Cloudflare (Workers AI) avec un résumé des données de la personne
// 4. enregistre la question et la réponse dans Supabase (table « messages »)
// Le modèle n'a accès à rien d'autre que ce résumé : il ne peut ni lire ni modifier la base.
const SUPA_URL = 'https://wdhihttfwizcegxxhkrn.supabase.co';
const SUPA_KEY = 'sb_publishable_R9Wnnwoo5YGoyrn52K1Prw_ju-OJkeA'; // clé publique (la même que dans config.js)
const MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';
const DAILY = 20, MAX_IN = 1200, MAX_CTX = 14000;

const SYSTEM = `Tu es l'assistant de iolite, une application française de suivi des heures de travail (pointage, heures supplémentaires, salaire estimé, congés payés, alertes de repos).
Tu parles à un salarié en France. Tu le vouvoies, en français simple, chaleureux et précis.

Règles :
- Pour toute question sur SES heures, son salaire, ses congés ou ses alertes, appuie-toi UNIQUEMENT sur le bloc « DONNÉES » ci-dessous. Si l'information n'y est pas, dis-le simplement et indique où la saisir dans iolite (Shift pour pointer, Réglages pour le contrat, le salaire, la convention).
- Les montants de salaire de iolite sont des estimations : rappelle-le quand tu en donnes un.
- Pour le droit du travail français, donne les règles générales du Code du travail et précise quand la convention collective ou un accord d'entreprise peut prévoir autre chose. Cite l'article quand tu en es sûr. Si tu n'es pas sûr d'un chiffre ou d'une règle, dis-le franchement plutôt que d'inventer.
- Pour un litige, un licenciement ou une situation grave, conseille de contacter l'inspection du travail, un syndicat, un avocat ou un conseiller (service-public.fr, code.travail.gouv.fr).
- Tu ne peux pas modifier les données de l'utilisateur : explique-lui comment faire dans l'app.
- L'application a exactement 4 onglets, n'en invente pas d'autres :
  « Shift » : pointer une journée (Travaillée, Repos ou Congé payé, avec horaires du matin et de l'après-midi), voir le planning prévu.
  « Statistiques » : heures, heures sup et salaire estimé par semaine, mois et année ; congés payés.
  « Alertes » : cette conversation et les alertes (repos trop court, journée trop longue, résumé de la semaine).
  « Réglages » : Profil, Contrat, Heures et salaire, Convention, Jours fériés, Repas fournis, Emplois, Rappels, Résumé de la semaine, Planning, Données, Compte.
- Réponses courtes : 2 à 6 phrases, ou une petite liste à puces si c'est plus clair. Utilise **gras** pour les chiffres importants. Pas de titres.
- Reste sur le travail, les horaires, le salaire, les droits du salarié et l'utilisation de iolite. Pour un autre sujet, réponds poliment que tu es là pour ça.`;

function json(o, status) { return new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
function supa(path, token, init) {
  init = init || {};
  init.headers = Object.assign({ apikey: SUPA_KEY, authorization: 'Bearer ' + token }, init.headers || {});
  return fetch(SUPA_URL + path, init);
}

export async function onRequestPost({ request, env }) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Connectez-vous pour utiliser l\'assistant.' }, 401);
    const ur = await supa('/auth/v1/user', token);
    if (!ur.ok) return json({ error: 'Votre session a expiré : reconnectez-vous.' }, 401);
    const user = await ur.json();
    if (!user || !user.id) return json({ error: 'Votre session a expiré : reconnectez-vous.' }, 401);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'Message illisible.' }, 400); }
    const text = String(body && body.message || '').trim().slice(0, MAX_IN);
    if (!text) return json({ error: 'Message vide.' }, 400);
    const context = String(body && body.context || '').slice(0, MAX_CTX);

    // limite quotidienne (comptée sur les messages déjà enregistrés aujourd'hui, heure de Paris approximée en UTC)
    const since = new Date(); since.setUTCHours(0, 0, 0, 0);
    const cr = await supa('/rest/v1/messages?select=id&role=eq.user&created_at=gte.' + encodeURIComponent(since.toISOString()), token, { headers: { prefer: 'count=exact', range: '0-0' } });
    if (!cr.ok) return json({ error: 'L\'assistant n\'est pas encore activé sur le serveur.' }, 503);
    const total = Number(((cr.headers.get('content-range') || '').split('/')[1]) || 0);
    if (total >= DAILY) return json({ error: 'Vous avez atteint la limite de ' + DAILY + ' questions pour aujourd\'hui. Revenez demain !', left: 0 }, 429);

    // les derniers échanges, pour que l'assistant suive la conversation
    const hr = await supa('/rest/v1/messages?select=role,content&order=created_at.desc&limit=8', token);
    const hist = hr.ok ? (await hr.json()).reverse() : [];

    if (!env.AI) return json({ error: 'L\'assistant n\'est pas encore activé sur le serveur.' }, 503);
    const messages = [{ role: 'system', content: SYSTEM + '\n\nDONNÉES (à jour au moment de la question) :\n' + (context || 'aucune donnée transmise') }]
      .concat(hist.map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })))
      .concat([{ role: 'user', content: text }]);
    const out = await env.AI.run(MODEL, { messages, max_tokens: 700, temperature: 0.3 });
    let reply = String((out && (out.response || (out.result && out.result.response))) || '').trim();
    if (!reply) reply = 'Désolé, je n\'ai pas réussi à répondre. Pouvez-vous reformuler votre question ?';

    await supa('/rest/v1/messages', token, {
      method: 'POST', headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify([{ user_id: user.id, role: 'user', content: text }, { user_id: user.id, role: 'assistant', content: reply.slice(0, 8000) }])
    });
    return json({ reply, left: Math.max(0, DAILY - total - 1) });
  } catch (e) {
    const m = String(e && e.message || '');
    if (/neuron|quota|limit|capacity|4006|3036/i.test(m)) return json({ error: 'L\'assistant est très sollicité aujourd\'hui. Réessayez demain.' }, 503);
    return json({ error: 'L\'assistant ne répond pas pour le moment. Réessayez dans un instant.' }, 502);
  }
}
