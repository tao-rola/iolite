# iolite

[![Netlify Status](https://api.netlify.com/api/v1/badges/275bdc74-bf9c-41b3-83c8-0ac1c51dd866/deploy-status)](https://app.netlify.com/projects/iolite-gallium/deploys)

iolite est une web app mobile pour pointer ses heures de travail, quel que soit le métier (salariés, alternants, restauration…) : journées continues ou coupées, pauses, repas fournis, totaux par semaine, mois et année, estimation du salaire brut et net, heures sup, congés payés, alertes sur les temps de repos légaux et comparaison avec le planning (tout calendrier iCal : Combo, Skello, ADE…). Comptes sécurisés via Supabase.

En ligne : https://iolite-gallium.netlify.app

## Fichiers
- `index.html` : toute l'application (interface et logique)
- `config.js` : adresse du projet Supabase et clé publique (jamais la clé secrète)
- `sw.js`, `manifest.webmanifest`, icônes : installation sur l'écran d'accueil et rappels
- `netlify/functions/combo.mjs` : récupère le planning (abonnement iCal / .ics)
- `supabase/` : schéma de la base et guide de configuration
- `serveur.js` : serveur local pour tester sur l'ordinateur (`node serveur.js`)

Chaque envoi sur la branche `main` est mis en ligne automatiquement par Netlify.
