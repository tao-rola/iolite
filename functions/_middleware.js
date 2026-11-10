// iolite.team affiche le site de présentation (dossier site/) ; l'app web reste sur iolite-app.pages.dev.
// www.iolite.team renvoie vers iolite.team. Les pages du site ne sont indexées qu'à leur adresse iolite.team.
const SITE = 'iolite.team';
const PAGES = {
  '/': '/site/', '/fonctionnalites': '/site/fonctionnalites', '/iphone': '/site/iphone', '/pour-qui': '/site/pour-qui',
  '/aide': '/site/aide', '/confidentialite': '/site/confidentialite',
};
const FILES = {
  '/robots.txt': ['/site/robots.txt', 'text/plain; charset=utf-8'],
  '/sitemap.xml': ['/site/sitemap.xml', 'application/xml; charset=utf-8'],
  '/llms.txt': ['/site/llms.txt', 'text/markdown; charset=utf-8'],
  '/llms-full.txt': ['/site/llms-full.txt', 'text/markdown; charset=utf-8'],
};
// anciennes adresses ou doublons → adresse propre
const ALIASES = { '/index.html': '/', '/confidentialite.html': '/confidentialite', '/site': '/', '/site/': '/', '/site/index': '/', '/site/index.html': '/' };

async function serve(env, url, path, type) {
  const r = await env.ASSETS.fetch(new URL(path, url));
  const res = new Response(r.body, r);
  if (type) res.headers.set('Content-Type', type);
  res.headers.set('Cache-Control', type ? 'public, max-age=3600' : 'no-cache');
  return res;
}

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.' + SITE) { url.hostname = SITE; return Response.redirect(url.toString(), 301); }

  if (url.hostname === SITE) {
    let p = url.pathname;
    if (ALIASES[p]) { url.pathname = ALIASES[p]; return Response.redirect(url.toString(), 301); }
    const m = p.match(/^\/site\/(fonctionnalites|iphone|pour-qui|aide|confidentialite)(\.html)?$/);
    if (m) { url.pathname = '/' + m[1]; return Response.redirect(url.toString(), 301); }
    if (p.length > 1 && p.endsWith('/') && PAGES[p.slice(0, -1)]) { url.pathname = p.slice(0, -1); return Response.redirect(url.toString(), 301); }
    if (FILES[p]) return serve(env, url, FILES[p][0], FILES[p][1]);
    if (PAGES[p]) return serve(env, url, PAGES[p]);
    return next();
  }

  // autres adresses (iolite-app.pages.dev…) : l'aperçu du site reste visible mais n'est pas indexé
  const res = await next();
  if (url.pathname.startsWith('/site')) {
    const r = new Response(res.body, res);
    r.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return r;
  }
  return res;
}
