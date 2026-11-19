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
