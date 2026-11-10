// iolite.team affiche le site de présentation (dossier site/) ; l'app web reste sur iolite-app.pages.dev.
// www.iolite.team renvoie vers iolite.team.
const PAGES = { '/': '/site/', '/index.html': '/site/', '/fonctionnalites': '/site/fonctionnalites', '/iphone': '/site/iphone',
  '/pour-qui': '/site/pour-qui', '/aide': '/site/aide', '/confidentialite': '/site/confidentialite', '/confidentialite.html': '/site/confidentialite' };
export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.iolite.team') { url.hostname = 'iolite.team'; return Response.redirect(url.toString(), 301); }
  if (url.hostname === 'iolite.team') {
    const to = PAGES[url.pathname.replace(/\/$/, '') || '/'];
    if (to) {
      const page = await env.ASSETS.fetch(new URL(to, url));
      const res = new Response(page.body, page);
      res.headers.set('Cache-Control', 'no-cache');
      return res;
    }
  }
  return next();
}
