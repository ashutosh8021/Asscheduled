/* motion/objects.js — carried across verbatim from
   source-site/assets/js/site.js lines 181-197.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, clamp, fine, reduce, vh, vw } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== objects with depth ===================== */
export var objs = $$('[data-depth]'), mx = 0, my = 0, smx = 0, smy = 0;
if (fine) window.addEventListener('mousemove', function (e) { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; }, { passive: true });
onFrame(function () {
  if (reduce) return;
  smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
  for (var i = 0; i < objs.length; i++) {
    var el = objs[i], host = el.offsetParent || el.parentElement, r = host.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    var d = (parseFloat(el.getAttribute('data-depth')) || 0.1) * (vw < 900 ? 0.6 : 1);
    var p = clamp(r.top + r.height / 2 - vh / 2, -vh * 0.7, vh * 0.7);
    var ty = Math.max(p * -d + smy * d * 160, 6 - el.offsetTop);
    el.style.translate = (smx * d * 220).toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
    el.style.rotate = (p * d * -0.02).toFixed(2) + 'deg';
  }
});
