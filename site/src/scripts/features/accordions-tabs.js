/* features/accordions-tabs.js — carried across verbatim from
   source-site/assets/js/site.js lines 472-497.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$ } from '../core/env.js';

/* ===================== accordions, tabs, chips ===================== */
$$('.acc-btn').forEach(function (b) {
  b.addEventListener('click', function () { var item = b.closest('.acc-item'), open = !item.classList.contains('open'); item.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); });
});
$$('[data-tabs]').forEach(function (tabs) {
  var btns = $$('button[role="tab"]', tabs);
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      var show = b.getAttribute('data-show');
      $$('[data-only]').forEach(function (el) { var o = el.getAttribute('data-only'); el.hidden = !(o === 'all' || o === show); });
    });
  });
});
export var chips = $('[data-faq-chips]');
if (chips) {
  var cb = $$('button', chips);
  cb.forEach(function (b) {
    b.addEventListener('click', function () {
      cb.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var c = b.getAttribute('data-cat');
      $$('[data-cat-item]').forEach(function (it) { it.hidden = c !== 'all' && it.getAttribute('data-cat-item') !== c; });
    });
  });
}
