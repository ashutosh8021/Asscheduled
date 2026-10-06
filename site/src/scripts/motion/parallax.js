/* motion/parallax.js — carried across verbatim from
   source-site/assets/js/site.js lines 170-180.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, reduce, vh } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== hero parallax (v2) ===================== */
export var px = $$('[data-parallax]');
onFrame(function () {
  if (reduce) return;
  for (var i = 0; i < px.length; i++) {
    var el = px[i], k = parseFloat(el.getAttribute('data-parallax')) || 0.1, r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    el.style.transform = 'translate3d(0,' + (-r.top * k).toFixed(1) + 'px,0) scale(1.08)';
  }
});
