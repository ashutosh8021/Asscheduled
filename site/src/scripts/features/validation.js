/* features/validation.js — carried across verbatim from
   source-site/assets/js/site.js lines 578-599.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$ } from '../core/env.js';
import { scrollToEl } from '../core/scroll.js';

/* ===================== validation ===================== */
export function validate(scope) {
  var good = true, firstBad = null;
  $$('[required]', scope).forEach(function (inp) {
    if (inp.closest('[hidden]')) return;
    var field = inp.closest('.field') || inp.closest('.check') || inp.parentElement, err = field && $('.err', field), msg = '';
    var val = inp.type === 'checkbox' ? inp.checked : String(inp.value || '').trim();
    if (inp.type === 'radio') val = !!$('input[name="' + inp.name + '"]:checked', scope);
    if (!val) msg = inp.getAttribute('data-msg') || 'Fill this in';
    else if (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value)) msg = 'That email looks off';
    else if (inp.type === 'tel' && String(inp.value).replace(/\D/g, '').length < 10) msg = 'Use a 10 digit number we can WhatsApp';
    else if (inp.name === 'age' && (+inp.value < 18 || +inp.value > 99)) msg = 'You need to be 18 or over to come with us';
    if (inp.type === 'radio') { var pe = document.getElementById('plan-err'); if (pe) pe.textContent = msg; }
    if (inp.type === 'checkbox') { var ce = document.getElementById(inp.id + '-err'); if (ce) ce.textContent = msg; }
    if (field) field.classList.toggle('bad', !!msg);
    if (err) err.textContent = msg;
    if (msg) { good = false; if (!firstBad) firstBad = inp; }
  });
  if (firstBad) { try { firstBad.focus({ preventScroll: true }); } catch (e) {} scrollToEl(firstBad.closest('.field') || firstBad.closest('.plans') || firstBad); }
  return good;
}
