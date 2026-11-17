/* Portfolio Tao ROLA : section Contact de l'accueil (formulaire enregistré dans Supabase + e-mail via FormSubmit) */
(function () {
  const { rest, icon, CONTACT, toast } = window.TR;
  if (!document.getElementById('form')) return;
  const pill = (href, ic, label, ext) => `<a href="${href}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''} class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/[.04] text-white/80 hover:text-white hover:border-white/30 text-sm transition-all duration-300">${icon(ic, 'w-4 h-4 text-emerald-500')}${label}</a>`;
  document.getElementById('quick').innerHTML =
    pill('mailto:' + CONTACT.email, 'mail', CONTACT.email) + pill('tel:' + CONTACT.tel, 'phone', CONTACT.phone) +
    pill(CONTACT.instagram, 'instagram', CONTACT.instagramName, true) + pill(CONTACT.linkedin, 'linkedin', 'LinkedIn', true);

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
    const msg = { name: fd.name.trim(), email: fd.email.trim(), subject: fd.subject.trim(), message: fd.message.trim() };
    /* 1) sauvegarde dans la base (visible dans l'admin)  2) e-mail envoyé à Tao via FormSubmit */
    const [db, mail] = await Promise.all([
      rest('portfolio_messages', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(msg) }).then((r) => r.ok).catch(() => false),
      fetch('https://formsubmit.co/ajax/' + CONTACT.email, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Portfolio : ${msg.subject}`, _replyto: msg.email, _template: 'table', _captcha: 'false', Nom: msg.name, Email: msg.email, Sujet: msg.subject, Message: msg.message }),
      }).then((r) => r.ok).catch(() => false),
    ]);
    send.disabled = false; send.innerHTML = label;
    if (!db && !mail) { toast("Le message n'a pas pu être envoyé. Réessayez ou écrivez à " + CONTACT.email, 'error'); return; }
    form.reset();
    toast('Message envoyé ! Je vous réponds rapidement.');
  });
})();
