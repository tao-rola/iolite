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
      ['2024 - Présent', 'Bachelor Universitaire et Technologique', 'IUT, Rouen', "Filière Métier du Multimédia et de l'Internet - Spécialité Création Numérique (3ème année en cours)"],
      ['2020 - 2023', 'Lycée Blaise Pascal', 'Rouen', "Filière Sciences et Technologies de l'Industrie et du Développement Durable - Bac obtenu avec mention Assez Bien"],
    ]],
    ['briefcase', 'Expérience Professionnelle', [
      ['Septembre 2025 - Présent', 'Chargé de Communication et Marketing (Alternance)', "Restaurant Le Bouillon d'Or, Rouen", 'Communication digitale, marketing événementiel, gestion des réseaux sociaux'],
      ['Août 2024 - Présent', 'Chef de Rang', "Restaurant Le Bouillon d'Or, Rouen", 'Service en salle, gestion de la relation client'],
      ['Octobre 2023 - Juin 2025', 'Employé Polyvalent', 'Food-Truck Clara Pizza, Rouen', "Caissier, assistant cuisinier, préposé à l'entretien ménager"],
      ['Septembre 2023 - Présent', 'Entrepreneur Individuel', 'Auto-entreprise Gallium, Rouen', "Maître d'hôtel, barman, serveur / chef de rang, hôte d'accueil, photographe"],
      ['Juillet 2022', 'Employé Polyvalent', "Crêperie du Cap, Île d'Arz", "Serveur, préposé à l'entretien ménager, barman occasionnel"],
    ]],
    ['users', 'Engagement Associatif', [
      ['Septembre 2022 - Décembre 2023', 'Pôle Communication', "Association Vulg'Art, Rouen", 'Référent principal, community manager, graphiste'],
      ['Décembre 2018 - Décembre 2024', 'Pôle Événementiel', 'Association Amnesty International, Rennes', "Coordinateur d'événements (Salon d'art et d'artisanat d'Amnesty Rennes)"],
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
            <p class="text-white/60 mb-2">${place}</p>
            <p class="text-white/50 text-sm">${desc}</p>
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
