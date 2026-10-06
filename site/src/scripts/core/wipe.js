/* core/wipe.js — carried across verbatim from
   source-site/assets/js/site.js lines 74-93.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { doc, reduce } from './env.js';
/* The one place a block reaches FORWARD, for a function the original
   declared further down and relied on hoisting for. Importing it means
   scroll.js is evaluated before this file, the reverse of the original's
   order. That is safe and worth stating why: all scroll.js does on
   evaluation is declare functions, start fetching Lenis and bind click
   handlers to each a[href^="#"]. Those are element handlers; the one
   below is on document. Element handlers run first during bubbling
   whatever order they were bound in, so the two still fire in the
   original sequence. */
import { scrollToEl } from './scroll.js';

/* ===================== page wipe ===================== */
window.addEventListener('pageshow', function (e) { if (e.persisted) doc.classList.remove('leaving'); });
export function go(href) {
  if (reduce) { location.href = href; return; }
  try { sessionStorage.setItem('as-wipe', '1'); } catch (e) {}
  doc.classList.add('leaving'); setTimeout(function () { location.href = href; }, 420);
}
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  var h = a.getAttribute('href');
  if (!h || a.target === '_blank' || /^(#|mailto:|tel:|https?:|\/\/)/i.test(h) || !/\.html(#[\w.~-]*)?$/i.test(h)) return;
  var cur = location.pathname.split('/').pop() || 'index.html';
  if (h.split('#')[0] === cur && h.indexOf('#') > -1) {
    var st = document.getElementById(h.split('#')[1]); if (st) { e.preventDefault(); scrollToEl(st); }
    return;
  }
  e.preventDefault(); go(h);
});
