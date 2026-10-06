/* features/departures.js — carried across verbatim from
   source-site/assets/js/site.js lines 347-359.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, fine, vw } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== departures: photo follows the cursor ===================== */
$$('[data-deps]').forEach(function (list) {
  if (!fine || vw < 900) return;
  var fl = document.createElement('div'); fl.className = 'dep-float'; fl.innerHTML = '<img alt=""><span class="dstamp"></span>'; document.body.appendChild(fl);
  var im = $('img', fl), ds = $('.dstamp', fl), on = false, fx = 0, fy = 0, tx = 0, ty = 0;
  $$('.dep', list).forEach(function (d) {
    d.addEventListener('mouseenter', function () { var s = d.getAttribute('data-img'); if (!s) return; im.src = s; ds.textContent = d.getAttribute('data-stamp') || ''; fl.classList.add('show'); on = true; });
    d.addEventListener('mouseleave', function () { fl.classList.remove('show'); on = false; });
    d.addEventListener('mousemove', function (e) { tx = Math.min(e.clientX + 70, vw - 270); ty = Math.max(70, e.clientY - 330); });
  });
  onFrame(function () { if (!on) return; fx += (tx - fx) * 0.14; fy += (ty - fy) * 0.14; fl.style.left = fx + 'px'; fl.style.top = fy + 'px'; fl.style.rotate = ((tx - fx) * 0.03 - 3).toFixed(2) + 'deg'; });
});
