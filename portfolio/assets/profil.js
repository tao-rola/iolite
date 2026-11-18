/* Portfolio Tao ROLA : page Mon profil */
(function () {
  const { icon, esc, CONTACT, withSettings, topBar, footer } = window.TR;
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);
  document.getElementById('pied').innerHTML = footer();
  document.querySelectorAll('[data-ic]').forEach((s) => (s.outerHTML = icon(s.dataset.ic, 'w-6 h-6 text-emerald-500')));

  /* coordonnées : même style que l'email de la section contact */
  const ARR = '<svg width="0.7em" height="0.7em" style="width:.7em;height:.7em" class="shrink-0 self-center transition-transform duration-500 group-hover:translate-x-[0.08em] group-hover:-translate-y-[0.06em] group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.3" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M5 19 18 6M8 5h11v11"/></svg>';
  const box = (ic, label, value, href) => `
    <div class="min-w-0">
      <p class="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-400/80 mb-3">${icon(ic, 'w-4 h-4')}${label}</p>
      <${href ? `a href="${href}"` : 'div'} class="c-coord group relative inline-flex items-center gap-3 pb-2 text-white display !font-medium !tracking-[-0.02em] text-[7.4vw] sm:text-3xl lg:text-[2.1rem] max-w-full">
        <span class="c-coord-t whitespace-nowrap">${value}</span>${href ? ARR : ''}
        <span class="absolute left-0 right-0 bottom-0 h-[2px] ${href ? 'bg-emerald-500 origin-left transition-transform duration-500 group-hover:scale-x-0 group-hover:origin-right' : 'bg-white/15'}"></span>
      </${href ? 'a' : 'div'}>
    </div>`;
  const coords = document.getElementById('coords');
  coords.innerHTML =
    box('mail', 'Email', CONTACT.email, 'mailto:' + CONTACT.email) +
    box('phone', 'Téléphone', CONTACT.phone, 'tel:' + CONTACT.tel) +
    box('mapPin', 'Localisation', 'Normandie, France');
  coords.querySelectorAll('.c-coord').forEach((l) => window.TR.scrambleText(l, l.querySelector('.c-coord-t')));

  /* parcours */
  const SECTIONS = [
    ['graduationCap', 'Formation', [
      ['Septembre 2026', 'Formation Commerciale', 'Axecibles, Rouen', 'Formation au métier de commercial et aux techniques de vente en one shot.'],
      ['2023 - 2026', 'Bachelor Universitaire et Technologique', 'IUT, Rouen', "Filière Métiers du Multimédia et de l'Internet - Spécialité Création Numérique. Diplôme obtenu."],
      ['2020 - 2023', 'Lycée Blaise Pascal', 'Rouen', "Filière Sciences et Technologies de l'Industrie et du Développement Durable - Bac obtenu avec mention Assez Bien."],
    ]],
    ['briefcase', 'Expérience Professionnelle', [
      ['Octobre 2026 - Présent', 'Serveur Barman', 'Café de Rouen Quais de Seine, Rouen', 'Service en salle et au bar, accueil de la clientèle.'],
      ['Septembre 2026 - Octobre 2026', 'Commercial', 'Axecibles, Rouen', "Prospection de TPE et d'artisans par téléphone et sur le terrain. Vente en one shot de solutions web (sites internet, référencement), avec négociation et signature des contrats dès le premier rendez-vous."],
      ['Septembre 2025 - Septembre 2026', 'Chargé de Communication et Marketing (Alternance)', "Restaurant Le Bouillon d'Or, Rouen", 'Communication digitale et marketing événementiel. Gestion des réseaux sociaux du groupe et de ses restaurants.'],
      ['Septembre 2025 - Septembre 2026', 'Responsable de salle', 'Le Bouillon Italia, Rouen', "Gestion d'un rang et participation à l'ouverture, à la mise en place et à la fermeture de la salle. Accueil des clients, gestion des réservations, du placement et des réclamations, dans le respect des standards de qualité. Formation et intégration des nouveaux membres de l'équipe."],
      ['Avril 2025 - Juin 2025', 'Stagiaire Chargé de Communication et Développeur Web', 'Attineos Cybersécurité, Rouen', "Création de supports de communication digitale. Développement d'interfaces web pour un client attitré, entièrement à ma charge pendant toute la durée du stage."],
      ['Août 2024 - Avril 2025', 'Chef de Rang', "Restaurant Le Bouillon d'Or, Rouen", "Gestion d'un rang en totale autonomie dans un restaurant à fort volume de couverts. Service soigné, conseil à la carte et fidélisation de la clientèle, en coordination avec la cuisine."],
      ['Octobre 2023 - Juin 2025', 'Employé Polyvalent', 'Food-Truck Clara Pizza, Rouen', 'Tenue de la caisse et assistance en cuisine. Entretien et nettoyage du food-truck.'],
      ['Septembre 2023 - Présent', 'Entrepreneur Individuel', 'Auto-entreprise Gallium, Rouen', "Prestations en photographie et en vidéo (shootings, interviews, reportages). Création graphique : identités visuelles, supports de communication et motion design. Conception et développement de sites internet et d'applications web."],
      ['Juillet 2022', 'Employé Polyvalent', "Crêperie du Cap, Île d'Arz", "Service en salle et entretien des locaux. Barman à l'occasion."],
    ]],
    ['users', 'Engagement Associatif', [
      ['Septembre 2022 - Décembre 2023', 'Pôle Communication', "Association Vulg'Art, Rouen", "Référent principal du pôle communication. Community manager et graphiste de l'association."],
      ['Décembre 2018 - Décembre 2024', 'Pôle Événementiel', 'Association Amnesty International, Rennes', "Coordination d'événements, dont le Salon d'art et d'artisanat d'Amnesty Rennes."],
    ]],
  ];
  document.getElementById('timeline').innerHTML = SECTIONS.map(([ic, title, items]) => `
    <section class="mb-12 md:mb-16">
      <div class="flex items-center gap-3 mb-6 md:mb-8">${icon(ic, 'w-6 h-6 text-emerald-500')}<h3 class="text-2xl font-bold text-white">${title}</h3></div>
      <div class="space-y-6">
        ${items.map(([date, role, place, desc]) => `
          <div class="relative pl-6 sm:pl-8 border-l-2 border-white/10 pb-6 last:pb-0">
            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
            <div class="flex items-center gap-2 mb-2">${icon('calendar', 'w-4 h-4 text-white/40')}<span class="text-sm text-emerald-500">${date}</span></div>
            <h4 class="text-lg sm:text-xl font-semibold text-white mb-1">${role}</h4>
            <p class="text-white/60 ${desc && desc.length ? 'mb-2' : ''}">${place}</p>
            ${Array.isArray(desc)
              ? `<ul class="space-y-1.5">${desc.map((d) => `<li class="relative pl-4 text-white/50 text-sm before:content-[''] before:absolute before:left-0 before:top-[.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500/60">${d}</li>`).join('')}</ul>`
              : desc ? `<p class="text-white/50 text-sm">${desc}</p>` : ''}
          </div>`).join('')}
      </div>
    </section>`).join('');

  const SKILLS = ['PHP', 'HTML', 'CSS', 'SQL', 'JavaScript', 'TypeScript', 'Python', 'React', 'Tailwind CSS', 'Node.js', 'Supabase', 'Git / GitHub',
    'Applications Android & iOS', 'Responsive design', 'Photoshop', 'Illustrator', 'After Effects', 'Canva', 'Identité visuelle', 'Premiere Pro', 'Lightroom',
    'Montage vidéo', 'Productions Audio/Vidéo', 'Suite Microsoft Office', 'Google Workspace', 'Anglais (B2)', 'Espagnol (B1)', 'Guitare', 'Piano', 'Ukulélé'];
  document.getElementById('skills').innerHTML = SKILLS.map((s, i) => `<span class="group inline-flex items-center gap-x-3 sm:gap-x-5"><span class="display !font-medium !tracking-[-0.02em] text-2xl sm:text-4xl lg:text-5xl text-white/85 transition-colors duration-300 hover:text-emerald-400">${s}</span>${i < SKILLS.length - 1 ? '<span class="text-emerald-500 text-lg sm:text-2xl lg:text-3xl leading-none" aria-hidden="true">✦</span>' : ''}</span>`).join('');

  /* réglages dynamiques : photo, disponibilité, CV (PDF) */
  withSettings((s) => {
    const photo = document.getElementById('photo');
    const src = s.photo_thumb_url || s.photo_url;
    if (src && photo.getAttribute('src') !== src) photo.src = src;
    document.getElementById('dispo').innerHTML = s.available
      ? '<span class="relative flex w-2.5 h-2.5 shrink-0"><span class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></span><span class="absolute -inset-0.5 rounded-full bg-emerald-400/25 animate-[halo_2s_ease-in-out_infinite]"></span><span class="relative w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,.8)]"></span></span><span class="text-sm text-white/70">Disponible pour de nouveaux projets</span>'
      : '<span class="relative flex w-2.5 h-2.5 shrink-0"><span class="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60"></span><span class="absolute -inset-0.5 rounded-full bg-red-400/25 animate-[halo_2s_ease-in-out_infinite]"></span><span class="relative w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_6px_1px_rgba(248,113,113,.8)]"></span></span><span class="text-sm text-white/70">Indisponible pour de nouveaux projets</span>';
    document.getElementById('cv-links').innerHTML = s.cv_pdf_url
      ? `<a href="${esc(s.cv_pdf_url)}" target="_blank" rel="noopener" download="CV_Tao_ROLA.pdf" class="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm transition-colors duration-300 py-1">${icon('download')}Télécharger mon CV</a>` : '';
  });

})();
