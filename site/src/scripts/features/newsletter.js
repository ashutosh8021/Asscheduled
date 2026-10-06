/* features/newsletter.js — carried across verbatim from
   source-site/assets/js/site.js lines 600-617.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { AS } from '../config.js';
import { $, $$, store } from '../core/env.js';

/* ===================== newsletter ===================== */
$$('[data-news]').forEach(function (f) {
  var msg = $('.form-msg', f);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('input[type="email"]', f), ok = $('input[type="checkbox"]', f);
    msg.classList.remove('err');
    if (!em.value || !/^\S+@\S+\.\S+$/.test(em.value)) { msg.textContent = 'That email looks off, try again'; msg.classList.add('err'); em.focus(); return; }
    if (ok && !ok.checked) { msg.textContent = 'Tick the box so we’re allowed to email you'; msg.classList.add('err'); return; }
    var pref = ($('input[name="news-pref"]:checked', f) || {}).value || 'both';
    var payload = { email: em.value, preference: pref, consentAt: new Date().toISOString(), page: location.pathname };
    if (AS.newsletterEndpoint) { try { fetch(AS.newsletterEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (x) {} }
    store.set('as_news', payload);
    msg.innerHTML = 'You’re in, the next one hits your inbox first ✱ <a href="' + AS.instagram + '" target="_blank" rel="noopener" style="text-decoration:underline">follow @go.asscheduled</a>';
    f.reset();
  });
});
