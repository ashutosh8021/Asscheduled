/* motion/rotating-word.js — carried across verbatim from
   source-site/assets/js/site.js lines 254-264.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, reduce } from '../core/env.js';

/* ===================== rotating word (v2 hero) ===================== */
$$('.rot').forEach(function (rot) {
  var items = $$('span', rot); if (items.length < 2) return;
  var k = 0; items[0].classList.add('on'); if (reduce) return;
  setInterval(function () {
    var cur = items[k]; k = (k + 1) % items.length; var nx = items[k];
    cur.classList.remove('on'); cur.classList.add('out'); nx.classList.remove('out'); nx.classList.add('on');
    setTimeout(function () { cur.classList.remove('out'); }, 900);
  }, 2000);
});
