/* motion/count-up.js — carried across verbatim from
   source-site/assets/js/site.js lines 897-910.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, reduce } from '../core/env.js';

/* ===================== count up (about tally) ===================== */
$$('[data-count]').forEach(function (el) {
  var end = parseInt(el.getAttribute('data-count'), 10) || 0, fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };
  if (reduce || !('IntersectionObserver' in window)) { el.textContent = fmt(end); return; }
  el.textContent = '0';
  var o = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return; o.disconnect();
    var st = performance.now(), dur = 1700;
    (function tick(now) { var k = Math.min(1, (now - st) / dur); el.textContent = fmt(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(st);
  }, { threshold: 0.35 });
  o.observe(el);
});

$$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
