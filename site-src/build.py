#!/usr/bin/env python3
"""Assemble les pages de iolite.team : gabarit commun (en-tête, méga-menu, pied de page) + contenu de chaque page.
Usage : python3 site-src/build.py  → écrit site/*.html"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', 'site')
WEB_APP = 'https://iolite-app.pages.dev'
STATUS_BG = '#4a4c95'

SITE = 'https://iolite.team'
UPDATED = '2026-11-10'
# nom de page : (adresse, titre, description, fil d'Ariane)
PAGES = {
    'index':          ('/', "iolite · L'app pour compter ses heures et estimer son salaire net",
                       "iolite compte vos heures de travail, estime votre salaire net (heures sup, repas, fériés, congés) et suit votre planning Combo ou Skello. Sur iPhone et sur le web.", None),
    'fonctionnalites':('/fonctionnalites', 'Fonctionnalités : pointage, salaire net, planning et statistiques · iolite',
                       "Pointage en un geste, calcul du salaire net avec heures supplémentaires, planning iCal synchronisé, statistiques et assistant : tout ce que fait iolite.", 'Fonctionnalités'),
    'iphone':         ('/iphone', "Application iPhone de pointage des heures · iolite",
                       "Activité en direct, Dynamic Island, widgets, Face ID et notifications : l'app iPhone iolite pour suivre vos heures et votre salaire.", "L'app iPhone"),
    'pour-qui':       ('/pour-qui', 'Suivi des heures en restauration, hôtellerie, commerce et santé · iolite',
                       "Journées coupées, repas fournis, temps de repos, plusieurs employeurs : iolite s'adapte aux horaires variables de la restauration, l'hôtellerie, le commerce, la santé et aux étudiants.", 'Pour qui'),
    'aide':           ('/aide', 'Aide et questions fréquentes · iolite',
                       "Réponses aux questions sur iolite : disponibilité, calcul du salaire, heures supplémentaires, planning Combo, données personnelles et contact.", 'Aide'),
    'confidentialite':('/confidentialite', 'Politique de confidentialité · iolite',
                       "Quelles données iolite enregistre, où elles sont hébergées (Union européenne) et comment les exporter ou les supprimer.", 'Confidentialité'),
}

def phone(img, cls='', alt=''):
    """iPhone en 3D avec une vraie capture de l'app"""
    return (f'<div class="phone {cls}"><div class="ph-body"><span class="ph-btn b1"></span><span class="ph-btn b2"></span><span class="ph-btn b3"></span>'
            f'<div class="ph-screen"><div class="ph-sb" style="background:{STATUS_BG}"><b>9:41</b><i class="ph-isl"></i><span class="ph-ic"><i></i><i></i><i></i></span></div>'
            f'<img src="/site/img/{img}.webp" alt="{alt}" loading="lazy" decoding="async" width="390" height="797"><i class="ph-home"></i></div>'
            f'<span class="ph-glare"></span></div></div>')

ICONS = {
 'utensils':'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.7 0-3 2.2-3 5.5S15.3 12 17 12v9',
 'concierge':'M3 18h18M5 18a7 7 0 0 1 14 0M12 11V8M10 8h4',
 'bag':'M5 8h14l-1 13H6L5 8zM9 8V6a3 3 0 0 1 6 0v2',
 'pulse':'M3 12h4l2.5-6 5 12 2.5-6h4',
 'cap':'M2 9l10-5 10 5-10 5L2 9zM6 11v5c3 2.2 9 2.2 12 0v-5M22 9v6',
 'layers':'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
 'pin':'M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
 'ban':'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.7 5.7l12.6 12.6',
 'lock':'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
 'trash':'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
 'wifioff':'M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 11 5M5 12.6a10 10 0 0 1 4-2.1M19 12.6a10 10 0 0 0-2.6-1.6M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18',
 'sync':'M20 11a8 8 0 0 0-14.6-4.4M4 3v4h4M4 13a8 8 0 0 0 14.6 4.4M20 21v-4h-4',
 'alarm':'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M5 3 2 6M19 3l3 3',
 'calx':'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4',
 'sun':'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
 'export':'M12 15V3M8 7l4-4 4 4M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5',
 'faceid':'M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M9 9v1M15 9v1M12 9v4h-1M9.5 16a4 4 0 0 0 5 0',
 'bell':'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
 'phone':'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
 'clock':'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
 'euro':'M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10.5h9M4 13.5h9',
 'calendar':'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
 'spark':'M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z',
 'chart':'M5 19V11M9.7 19V7M14.3 19v-9M19 19V5',
 'moon':'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
 'mail':'M3 5h18v14H3zM3 6l9 7 9-7',
}

def icon(name):
    return f'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="{ICONS[name]}"/></svg>'

def shot(img, alt=''):
    return f'<div class="shot"><img src="/site/img/{img}.webp" alt="{alt}" loading="lazy" decoding="async" width="390" height="797"></div>'

def expand(html):
    html = re.sub(r'\{\{icon (\w+)\}\}', lambda m: icon(m.group(1)), html)
    html = re.sub(r'\{\{shot ([\w-]+)(?: \'([^\']*)\')?\}\}', lambda m: shot(m.group(1), m.group(2) or ''), html)
    html = re.sub(r'\{\{phone ([\w-]+)(?: "([^"]*)")?(?: \'([^\']*)\')?\}\}', lambda m: phone(m.group(1), m.group(2) or '', m.group(3) or ''), html)
    return html.replace('{{webapp}}', WEB_APP)

import json, html as H

ORG = {"@type": "Organization", "@id": SITE + "/#org", "name": "iolite", "url": SITE + "/",
       "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png", "width": 512, "height": 512},
       "email": "contact@iolite.team", "contactPoint": {"@type": "ContactPoint", "email": "contact@iolite.team", "contactType": "customer support", "availableLanguage": "fr"}}
WEBSITE = {"@type": "WebSite", "@id": SITE + "/#website", "name": "iolite", "url": SITE + "/", "inLanguage": "fr-FR", "publisher": {"@id": SITE + "/#org"}}
APP = {"@type": "SoftwareApplication", "@id": SITE + "/#app", "name": "iolite", "url": SITE + "/",
       "applicationCategory": "BusinessApplication", "applicationSubCategory": "Suivi du temps de travail",
       "operatingSystem": "iOS 17 ou ultérieur, navigateur web", "inLanguage": "fr-FR", "image": SITE + "/icon-512.png",
       "screenshot": [SITE + "/site/img/shift.webp", SITE + "/site/img/stats.webp", SITE + "/site/img/month.webp"],
       "description": "Application iPhone et web pour compter ses heures de travail, estimer son salaire net (heures supplémentaires majorées, repas fournis, jours fériés, congés payés) et suivre son planning (Combo, Skello, tout lien iCal).",
       "featureList": ["Pointage des heures en un geste", "Journées continues ou coupées", "Estimation du salaire brut et net", "Heures supplémentaires majorées (Code du travail ou convention HCR)", "Repas fournis, jours fériés et congés payés", "Planning synchronisé par lien iCal (Combo, Skello, Google Agenda, ADE)", "Alertes sur les temps de repos et au-delà de 10 h par jour", "Résumé hebdomadaire", "Activité en direct et Dynamic Island", "Widgets", "Face ID", "Plusieurs emplois", "Export des données"],
       "publisher": {"@id": SITE + "/#org"}}

def strip(t):
    t = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', t, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'\s+', ' ', H.unescape(t)).strip()

def faq_items(body):
    out = []
    for q, a in re.findall(r'<summary>(.*?)<i></i></summary>\s*<p>(.*?)</p>', body, flags=re.S):
        out.append({"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}})
    return out

def jsonld(name, url, title, desc, crumb, body):
    graph = [ORG, WEBSITE,
             {"@type": "WebPage", "@id": url + "#page", "url": url, "name": title, "description": desc, "inLanguage": "fr-FR",
              "isPartOf": {"@id": SITE + "/#website"}, "about": {"@id": SITE + "/#app"}, "dateModified": UPDATED,
              "primaryImageOfPage": {"@type": "ImageObject", "url": SITE + "/site/img/og.png"}}]
    if name in ('index', 'fonctionnalites', 'iphone'): graph.append(APP)
    if crumb:
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": crumb, "item": url}]})
    faqs = faq_items(body)
    if faqs: graph.append({"@type": "FAQPage", "@id": url + "#faq", "mainEntity": faqs})
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + '</script>'

def crumbs_html(crumb):
    if not crumb: return ''
    return ('<nav class="crumbs wrap" aria-label="Fil d\'Ariane"><a href="./">Accueil</a>'
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            f'<span aria-current="page">{crumb}</span></nav>\n')

def write_extras(texts):
    urls = ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{UPDATED}</lastmod><changefreq>{"weekly" if u == "/" else "monthly"}</changefreq><priority>{"1.0" if u == "/" else "0.8"}</priority></url>\n' for (u, *_r) in PAGES.values())
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n')
    bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'Bingbot', 'CCBot', 'Meta-ExternalAgent', 'MistralAI-User', 'DuckAssistBot', 'YouBot']
    robots = '# iolite.team : toutes les pages publiques peuvent être explorées, y compris par les assistants IA.\nUser-agent: *\nAllow: /\nDisallow: /api/\n\n' + ''.join(f'User-agent: {b}\nAllow: /\n\n' for b in bots) + f'Sitemap: {SITE}/sitemap.xml\n'
    open(os.path.join(OUT, 'robots.txt'), 'w').write(robots)
    llms = f"""# iolite

> iolite est une application iPhone et web, en français, qui compte les heures de travail, estime le salaire net et suit le planning des salariés aux horaires variables (restauration, hôtellerie, commerce, santé, étudiants). Site officiel : {SITE}

## L'essentiel
- Pointage des heures en un geste, journées continues ou coupées en deux services, pauses, repos, congés, absences.
- Estimation du salaire brut et net : heures supplémentaires majorées (Code du travail : +25 % jusqu'à 43 h puis +50 % ; ou convention hôtels-cafés-restaurants), repas fournis, jours fériés, congés payés, taux horaire ou salaire mensuel.
- Planning synchronisé par lien iCal (Combo, Skello, Google Agenda, ADE…) ou fichier .ics ; notification si le planning du lendemain change ; écart entre prévu et réalisé.
- Statistiques par semaine, mois et année ; calendrier coloré ; compteur de congés payés.
- Assistant intégré : résumé chaque dimanche, alertes au-delà de 10 h par jour, sur l'amplitude et sur le repos minimum de 11 h, questions en français.
- iPhone : activité en direct sur l'écran verrouillé et dans la Dynamic Island, widgets, Face ID, rappels, notifications.
- Plusieurs emplois, chacun avec son contrat et son planning ; export et suppression des données.
- Données hébergées dans l'Union européenne (Irlande), sans publicité ni pistage ; l'employeur n'a pas accès aux données.
- Disponibilité : version web disponible ({WEB_APP}) ; application iPhone bientôt sur l'App Store. Android : via la version web.
- Le salaire affiché est une estimation pour vérifier sa fiche de paie ; seul le bulletin officiel fait foi.
- Contact : contact@iolite.team

## Pages
""" + ''.join(f"- [{t.split(' · ')[0]}]({SITE}{u}) : {d}\n" for (u, t, d, c) in PAGES.values()) + f"\n## Version complète\n- [Texte intégral du site]({SITE}/llms-full.txt)\n"
    open(os.path.join(OUT, 'llms.txt'), 'w').write(llms)
    full = "# iolite : texte intégral du site\n\n" + '\n\n'.join(f"## {PAGES[n][1]}\nAdresse : {SITE}{PAGES[n][0]}\n\n{t}" for n, t in texts.items())
    open(os.path.join(OUT, 'llms-full.txt'), 'w').write(full + '\n')

def main():
    layout = open(os.path.join(ROOT, 'layout.html'), encoding='utf-8').read()
    texts = {}
    for name, (path, title, desc, crumb) in PAGES.items():
        body = open(os.path.join(ROOT, 'pages', name + '.html'), encoding='utf-8').read()
        url = SITE + path
        pre = '<link rel="preload" as="image" href="/site/img/shift.webp" fetchpriority="high">' if name in ('index', 'iphone') else ''
        page = (layout.replace('{{title}}', H.escape(title)).replace('{{desc}}', H.escape(desc)).replace('{{page}}', name)
                .replace('{{url}}', url).replace('{{preload}}', pre).replace('{{crumbs}}', crumbs_html(crumb))
                .replace('{{jsonld}}', jsonld(name, url, title, desc, crumb, body)).replace('{{body}}', body))
        texts[name] = strip(expand(body))
        page = re.sub(r'data-nav="%s"' % re.escape(name), 'data-nav="%s" aria-current="page"' % name, page)
        open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(expand(page))
        print('écrit', name + '.html')
    write_extras(texts)
    print('écrit sitemap.xml, robots.txt, llms.txt, llms-full.txt')

if __name__ == '__main__':
    main()
