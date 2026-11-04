// Petit serveur local pour iolite : node serveur.js  ->  http://localhost:8080
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = Number(process.env.PORT) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  // même relais que la fonction Netlify, pour tester Combo en local
  if (req.url.startsWith('/.netlify/functions/combo')) {
    const raw = new URL(req.url, 'http://x').searchParams.get('url') || '';
    let t; try { t = new URL(raw.replace(/^webcal:/i, 'https:')); } catch { res.writeHead(400); return res.end('Adresse invalide'); }
    if (t.protocol !== 'https:' || !/(^|\.)combo(hr)?\.[a-z.]+$/i.test(t.hostname)) { res.writeHead(403); return res.end('Seules les adresses Combo sont acceptées'); }
    fetch(t).then(r => r.text().then(b => { res.writeHead(r.ok ? 200 : 502, { 'content-type': 'text/calendar; charset=utf-8' }); res.end(b); }))
      .catch(() => { res.writeHead(504); res.end('Combo ne répond pas'); });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Introuvable'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).on('error', e => {
  if (e.code === 'EADDRINUSE') console.log(`Le port ${PORT} est déjà utilisé : iolite tourne peut-être déjà sur http://localhost:${PORT}`);
  else console.log('Erreur : ' + e.message);
  process.exit(1);
}).listen(PORT, '127.0.0.1', () => console.log(`iolite tourne sur http://localhost:${PORT}  (Ctrl+C pour arrêter)`));
