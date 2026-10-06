/* features/plan-picker.js — carried across verbatim from
   source-site/assets/js/site.js lines 498-527.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { AS } from '../config.js';
import { $, $$, inr, store } from '../core/env.js';

/* ===================== plan picker + receipt ===================== */
export function receipt(id) {
  $$('[data-receipt]').forEach(function (r) {
    var p = AS.plans[id]; if (!p) return;
    $$('[data-rc]', r).forEach(function (ln) { ln.hidden = ln.getAttribute('data-rc').split(' ').indexOf(id) < 0; });
    var t = $('[data-rt]', r); if (t) t.textContent = inr(p.price);
    var n = $('[data-rn]', r); if (n) n.textContent = p.plan;
  });
}
$$('[data-plans]').forEach(function (box) {
  var cards = $$('.plan', box), bar = $('[data-lock]');
  function pick(id) {
    cards.forEach(function (c) { var on = c.getAttribute('data-id') === id; c.classList.toggle('is-on', on); var r = $('input', c); if (r) r.checked = on; });
    var p = AS.plans[id]; if (!p) return;
    if (bar && !box.hasAttribute('data-noauto')) { $('span', bar).textContent = p.short + ' · ' + inr(p.price); $('a', bar).setAttribute('href', 'apply.html#' + id); }
    receipt(id);
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) { if (e.target.closest('a')) return; pick(c.getAttribute('data-id')); });
    var r = $('input', c); if (r) r.addEventListener('change', function () { if (r.checked) pick(c.getAttribute('data-id')); });
  });
  if (!box.hasAttribute('data-noauto')) { var chk = $('input:checked', box); var first = chk ? chk.closest('.plan') : cards[0]; if (first) pick(first.getAttribute('data-id')); }
});
$$('[data-state-note]').forEach(function (sel) {
  var out = document.getElementById(sel.getAttribute('data-state-note'));
  var st = store.get('as_state'); if (st && !sel.value) sel.value = st;
  function upd() { if (out) out.textContent = sel.value ? 'Travelling from ' + sel.value + ', we’ll confirm your exact fare on WhatsApp before you pay anything' : ''; }
  sel.addEventListener('change', function () { upd(); store.set('as_state', sel.value); }); upd();
});
