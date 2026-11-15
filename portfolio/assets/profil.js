/* Portfolio Tao ROLA : page Mon profil */
(function () {
  const { sb, icon, esc, CONTACT, getSettings, topBar, footer, openModal, toast } = window.TR;
  document.getElementById('top').innerHTML = topBar(document.body.dataset.title);
  document.getElementById('pied').innerHTML = footer();
  document.querySelectorAll('[data-ic]').forEach((s) => (s.outerHTML = icon(s.dataset.ic, 'w-6 h-6 text-emerald-500')));

  /* coordonnées */
  const box = (ic, label, value, href) => `
    <${href ? `a href="${href}"` : 'div'} class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 ${href ? 'hover:bg-white/10' : ''} transition-all min-w-0">
      ${icon(ic, 'w-5 h-5 text-emerald-500')}
      <div class="min-w-0"><p class="text-xs text-white/40">${label}</p><p class="text-white text-sm truncate">${value}</p></div>
    </${href ? 'a' : 'div'}>`;
  document.getElementById('coords').innerHTML =
    box('mail', 'Email', CONTACT.email, 'mailto:' + CONTACT.email) +
    box('phone', 'Téléphone', CONTACT.phone, 'tel:' + CONTACT.tel) +
    `<div class="sm:col-span-2 md:col-span-1">${box('mapPin', 'Localisation', 'France')}</div>`;

  /* parcours */
  const SECTIONS = [
    ['graduationCap', 'Formation', [
      ['Septembre 2026', 'Formation Commerciale', 'Axecibles, Rouen', 'Formation au métier de commercial et aux techniques de vente en one shot.'],
      ['2023 - 2026', 'Bachelor Universitaire et Technologique', 'IUT, Rouen', "Filière Métiers du Multimédia et de l'Internet - Spécialité Création Numérique. Diplôme obtenu."],
      ['2020 - 2023', 'Lycée Blaise Pascal', 'Rouen', "Filière Sciences et Technologies de l'Industrie et du Développement Durable - Bac obtenu avec mention Assez Bien."],
    ]],
    ['briefcase', 'Expérience Professionnelle', [
      ['Octobre 2026 - Présent', 'Serveur', 'Café de Rouen Quais de Seine, Rouen', 'Service en salle et accueil de la clientèle.'],
      ['Septembre 2026 - Octobre 2026', 'Commercial', 'Axecibles, Rouen', "Prospection de TPE et d'artisans par téléphone et sur le terrain. Vente en one shot de solutions web (sites internet, référencement), avec négociation et signature des contrats dès le premier rendez-vous."],
      ['Septembre 2025 - Septembre 2026', 'Chargé de Communication et Marketing (Alternance)', "Restaurant Le Bouillon d'Or, Rouen", 'Communication digitale et marketing événementiel. Gestion des réseaux sociaux du restaurant.'],
      ['Septembre 2025 - Septembre 2026', 'Chef de Rang', 'Le Bouillon Italia, Rouen', "Gestion d'un rang et participation à l'ouverture, à la mise en place et à la fermeture de la salle. Accueil des clients, gestion des réservations, du placement et des réclamations, dans le respect des standards de qualité. Formation et intégration des nouveaux membres de l'équipe."],
      ['Avril 2025 - Juin 2025', 'Stagiaire Chargé de Communication et Développeur Web', 'Attineos Cybersécurité, Rouen', "Création de supports de communication digitale. Développement d'interfaces web."],
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

  const SKILLS = ['PHP, HTML, CSS, SQL', 'JavaScript, Python','Photoshop, Illustrator, After Effects', 'Suite Microsoft Office', 'Google Workspace', 'Productions Audio/Vidéo', 'Guitare, Piano, Ukulélé', 'Anglais (B2), Espagnol (B1)'];
  document.getElementById('skills').innerHTML = SKILLS.map((s) => `<div class="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm sm:text-base">${s}</div>`).join('');

  /* réglages dynamiques : photo, disponibilité, CV */
  getSettings().then((s) => {
    if (s.photo_url) document.getElementById('photo').src = s.photo_url;
    document.getElementById('dispo').innerHTML = s.available
      ? '<div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div><span class="text-sm text-white/70">Disponible pour de nouveaux projets</span>'
      : '<div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div><span class="text-sm text-white/70">Indisponible pour de nouveaux projets</span>';
    const links = [];
    if (s.cv_pdf_url) links.push(`<a href="${esc(s.cv_pdf_url)}" target="_blank" rel="noopener" download="CV_Tao_ROLA.pdf" class="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm transition-colors duration-300 py-1">${icon('download')}Télécharger mon CV</a>`);
    if (s.cv_video_url) links.push(`<button type="button" id="cv-video" class="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm transition-colors duration-300 py-1">${icon('video')}Consulter le CV vidéo</button>`);
    document.getElementById('cv-links').innerHTML = links.join('');
    const b = document.getElementById('cv-video');
    if (b) b.addEventListener('click', () => openModal(`
      <div class="bg-black flex justify-center"><video src="${esc(s.cv_video_url)}" class="w-full max-h-[80dvh] object-contain" controls autoplay playsinline></video></div>
      <div class="p-4 sm:p-5"><p class="text-white font-semibold">CV vidéo - Tao ROLA</p></div>`));
  });

  /* formulaire de contact */
  const form = document.getElementById('form');
  const send = document.getElementById('f-send');
  const label = `${icon('send', 'w-4 h-4')}Envoyer le message`;
  send.innerHTML = label;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form));
    if (fd.website) return; /* robot */
    for (const k of ['name', 'email', 'subject', 'message']) {
      if (!String(fd[k] || '').trim()) { toast('Merci de remplir tous les champs.', 'error'); form.elements[k].focus(); return; }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)) { toast('Adresse e-mail invalide.', 'error'); form.elements.email.focus(); return; }
    send.disabled = true; send.textContent = 'Envoi…';
    const { error } = await sb.from('portfolio_messages').insert({
      name: fd.name.trim(), email: fd.email.trim(), subject: fd.subject.trim(), message: fd.message.trim(),
    });
    send.disabled = false; send.innerHTML = label;
    if (error) { console.error(error); toast("Le message n'a pas pu être envoyé. Réessayez ou écrivez à " + CONTACT.email, 'error'); return; }
    form.reset();
    toast('Message envoyé ! Je vous réponds rapidement.');
  });
})();
