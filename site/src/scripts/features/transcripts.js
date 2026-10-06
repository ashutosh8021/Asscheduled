/* features/transcripts.js — carried across verbatim from
   source-site/assets/js/site.js lines 434-449.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, fine, reduce } from '../core/env.js';

/* ===================== transcripts carousel ===================== */
$$('[data-trs]').forEach(function (wrap) {
  var track = $('.trs', wrap); if (!track) return;
  var step = function (d) { var c = $('.tcard', track); track.scrollBy({ left: d * (c ? c.getBoundingClientRect().width + 20 : 300), behavior: reduce ? 'auto' : 'smooth' }); };
  var p = $('[data-prev]', wrap), n = $('[data-next]', wrap);
  if (p) p.addEventListener('click', function () { step(-1); });
  if (n) n.addEventListener('click', function () { step(1); });
  if (fine) {
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointerup', function () { if (down) { down = false; track.classList.remove('drag'); } });
    track.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 4) { moved = true; track.classList.add('drag'); } track.scrollLeft = sl - d; });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
});
