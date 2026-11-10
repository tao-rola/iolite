// iolite.team affiche le site de présentation ; l'app web reste sur iolite-app.pages.dev.
// www.iolite.team renvoie vers iolite.team.
export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  const host = url.hostname;
  if (host === 'www.iolite.team') {
    url.hostname = 'iolite.team';
    return Response.redirect(url.toString(), 301);
  }
  if (host === 'iolite.team' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const page = await env.ASSETS.fetch(new URL('/site/', url));
    const res = new Response(page.body, page);
    res.headers.set('Cache-Control', 'no-cache');
    return res;
  }
  return next();
}
