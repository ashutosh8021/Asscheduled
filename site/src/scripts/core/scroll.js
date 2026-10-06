/* core/scroll.js — carried across verbatim from
   source-site/assets/js/site.js lines 94-114.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, doc, fine, reduce } from './env.js';

/* ===================== smooth scroll ===================== */
export var lenis = null;
export function initLenis() { if (lenis || !window.Lenis) return; try { lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true }); if (window.__asLand) window.__asLand(); } catch (e) { lenis = null; } }
/* only mice use smooth scrolling, and it loads after the page is already moving

   The original pulled lenis 1.1.13 off unpkg with an async <script>. This is the
   one deviation CLAUDE.md asks for: the same version from npm instead of the CDN.
   A dynamic import keeps both properties that mattered — it is a separate chunk,
   so it does not block first paint, and it is only ever fetched on a fine
   pointer — and it still hands Lenis to window, so initLenis above is unchanged. */
if (fine) {
  import('lenis').then(function (m) { window.Lenis = m.default || m.Lenis; initLenis(); }, function () {});
}
export function headOff() {
  var cs = getComputedStyle(doc);
  return (parseFloat(cs.getPropertyValue('--tick')) || 32) + (parseFloat(cs.getPropertyValue('--hdr')) || 64) + 14;
}
export function yOf(t) { return Math.max(0, Math.round(t.getBoundingClientRect().top + window.scrollY - headOff())); }
export function scrollToEl(t) {
  if (lenis) lenis.scrollTo(yOf(t));
  else window.scrollTo({ top: yOf(t), behavior: reduce ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = document.getElementById(id.slice(1)); if (t) { e.preventDefault(); scrollToEl(t); }
  });
});
