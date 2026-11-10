#!/usr/bin/env python3
"""Assemble les pages de iolite.team : gabarit commun (en-tête, méga-menu, pied de page) + contenu de chaque page.
Usage : python3 site-src/build.py  → écrit site/*.html"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', 'site')
WEB_APP = 'https://iolite-app.pages.dev'
STATUS_BG = '#4a4c95'

PAGES = {
    'index':          ('iolite · Vos heures et votre salaire, enfin clairs', "iolite compte vos heures, estime votre salaire net et suit votre planning. L'app des horaires variables, sur iPhone et sur le web."),
    'fonctionnalites':('Fonctionnalités · iolite', "Pointage en un geste, salaire net estimé, planning synchronisé, statistiques et assistant : tout ce que fait iolite."),
    'iphone':         ("L'app iPhone · iolite", "Activité en direct, Dynamic Island, widgets, Face ID et notifications : iolite tire le meilleur de votre iPhone."),
    'pour-qui':       ('Pour qui · iolite', "Restauration, hôtellerie, commerce, santé, étudiants : iolite s'adapte à vos horaires."),
    'aide':           ('Aide et contact · iolite', "Questions fréquentes et contact de l'équipe iolite."),
    'confidentialite':('Confidentialité · iolite', "Politique de confidentialité de l'application iolite."),
}

def phone(img, cls='', alt=''):
    """iPhone en 3D avec une vraie capture de l'app"""
    return (f'<div class="phone {cls}"><div class="ph-body"><span class="ph-btn b1"></span><span class="ph-btn b2"></span><span class="ph-btn b3"></span>'
            f'<div class="ph-screen"><div class="ph-sb" style="background:{STATUS_BG}"><b>9:41</b><i class="ph-isl"></i><span class="ph-ic"><i></i><i></i><i></i></span></div>'
            f'<img src="/site/img/{img}.webp" alt="{alt}" loading="lazy" decoding="async" width="390" height="797"><i class="ph-home"></i></div>'
            f'<span class="ph-glare"></span></div></div>')

def expand(html):
    html = re.sub(r'\{\{phone ([\w-]+)(?: "([^"]*)")?(?: \'([^\']*)\')?\}\}', lambda m: phone(m.group(1), m.group(2) or '', m.group(3) or ''), html)
    return html.replace('{{webapp}}', WEB_APP)

def main():
    layout = open(os.path.join(ROOT, 'layout.html'), encoding='utf-8').read()
    for name, (title, desc) in PAGES.items():
        body = open(os.path.join(ROOT, 'pages', name + '.html'), encoding='utf-8').read()
        page = layout.replace('{{title}}', title).replace('{{desc}}', desc).replace('{{page}}', name).replace('{{body}}', body)
        page = re.sub(r'data-nav="%s"' % re.escape(name), 'data-nav="%s" aria-current="page"' % name, page)
        open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(expand(page))
        print('écrit', name + '.html')

if __name__ == '__main__':
    main()
