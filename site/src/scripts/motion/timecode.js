/* motion/timecode.js — carried across verbatim from
   source-site/assets/js/site.js lines 286-295.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$ } from '../core/env.js';

/* ===================== camcorder timecode ===================== */
export var tcs = $$('[data-tc]'), t0 = performance.now() - Math.random() * 5e5;
export function tcode() {
  var s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 25);
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var txt = p2(Math.floor(s / 3600)) + ':' + p2(Math.floor(s / 60) % 60) + ':' + p2(Math.floor(s) % 60) + ':' + p2(f);
  tcs.forEach(function (el) { el.textContent = txt; });
}
if (tcs.length) { tcode(); setInterval(tcode, 80); }
