#!/usr/bin/env python3
"""Portfolio Tao ROLA : construction.
1) génère la feuille de style Tailwind (minifiée)
2) ajoute ?v=<empreinte> aux CSS/JS dans les pages pour un cache navigateur long et sûr
Usage (à la racine du dépôt) : python3 portfolio-src/build.py"""
import hashlib, pathlib, re, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
site = root / 'portfolio'
tw = ['npx', '--yes', 'tailwindcss@3'] if len(sys.argv) < 2 else [sys.argv[1]]
subprocess.run(tw + ['-c', 'portfolio-src/tailwind.config.js', '-i', 'portfolio-src/input.css', '-o', 'portfolio/assets/app.css', '--minify'], cwd=root, check=True)
def stamp(m):
    path = site / m.group(2)
    v = hashlib.sha1(path.read_bytes() + b'r4').hexdigest()[:8]  # « r2 » : change toutes les empreintes si le cache de Cloudflare a gardé une ancienne version
    return f'{m.group(1)}{m.group(2)}?v={v}"'
for page in site.glob('*.html'):
    html = page.read_text(encoding='utf-8')
    html = re.sub(r'((?:src|href)=")(assets/[\w.-]+\.(?:css|js))(?:\?v=\w+)?"', stamp, html)
    page.write_text(html, encoding='utf-8')
print('ok')


# ---------- démo de l'app Iolite (aperçu en direct dans le portfolio) ----------
# Copie de l'app web en « mode sans compte » (aucune connexion à Supabase), avec un mois de données fictives.
# Régénérée à chaque build : elle reste identique à la vraie app.
def build_iolite_demo():
    app = root / 'index.html'
    if not app.exists():
        return
    html = app.read_text(encoding='utf-8')
    seed = r'''<script>
window.IOLITE_CONFIG = {}; /* démo : mode sans compte, rien n'est envoyé */
(function () {
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var key = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var days = {}, today = new Date(); today.setHours(12, 0, 0, 0);
  var week = [
    null,
    { mode: 'coupure', midi: { start: '10:00', end: '14:30', pause: 0, repas: true }, soir: { start: '18:00', end: '23:00', pause: 0 } },
    { mode: 'coupure', midi: { start: '10:30', end: '15:00', pause: 0, repas: true }, soir: { start: '18:30', end: '23:30', pause: 0 } },
    { mode: 'continue', cont: { start: '11:00', end: '19:30', pause: 30, repas: true } },
    { mode: 'coupure', midi: { start: '10:00', end: '14:30', pause: 0, repas: true }, soir: { start: '18:00', end: '00:30', pause: 0 } },
    { mode: 'coupure', midi: { start: '10:00', end: '15:30', pause: 0, repas: true }, soir: { start: '18:30', end: '00:00', pause: 0 } },
    { mode: 'repos' }
  ];
  for (var i = 42; i >= 0; i--) {
    var d = new Date(today); d.setDate(d.getDate() - i);
    var w = week[(d.getDay() + 6) % 7];
    if (i === 17 || i === 18) w = { mode: 'conge' };
    if (w) days[key(d)] = JSON.parse(JSON.stringify(w));
  }
  try {
    localStorage.setItem('pt-days', JSON.stringify(days));
    localStorage.setItem('pt-profile', JSON.stringify({ first_name: 'Tao', last_name: 'ROLA', phone: '', onboarded: true }));
    ['pt-settings', 'pt-plan', 'pt-combo', 'pt-seen', 'pt-notified', 'pt-chat', 'pt-owner', 'pt-tab'].forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}
})();
</script>'''
    html = html.replace('<script src="config.js"></script>', seed, 1)
    html = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/@supabase/[^"]+"></script>\s*', '', html, count=1)
    html = re.sub(r'<link rel="manifest"[^>]*>\s*', '', html, count=1)
    html = html.replace('if(!("serviceWorker" in navigator)||location.protocol==="file:")return;', 'return; /* démo : pas de service worker */', 1)
    html = html.replace('<head>', '<head>\n<base href="/">\n<meta name="robots" content="noindex, nofollow">', 1)
    out = site / 'demo' / 'iolite' / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print('démo Iolite :', out.relative_to(root))

build_iolite_demo()
