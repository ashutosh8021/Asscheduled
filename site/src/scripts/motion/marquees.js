/* motion/marquees.js — carried across verbatim from
   source-site/assets/js/site.js lines 265-285.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, clamp, reduce } from '../core/env.js';
import { onFrame, vel } from '../core/frame.js';

/* ===================== marquees: they only travel when you do ===================== */
export var mqs = $$('[data-marquee]').map(function (m) {
  var base = m.classList.contains('t1') ? -4 : m.classList.contains('t2') ? 3 : null;
  return { el: m, tr: $('.mq-track,.tick-track', m), x: 0, idle: parseFloat(m.getAttribute('data-marquee')) || 30, dir: m.getAttribute('data-dir') === 'r' ? 1 : -1, base: base, sk: 0 };
});
onFrame(function (y, t, dt) {
  if (reduce) return;
  var v = Math.min(5, Math.abs(vel)), sgn = vel < -0.02 ? -1 : 1;
  for (var i = 0; i < mqs.length; i++) {
    var m = mqs[i]; if (!m.tr) continue;
    var half = m.tr.scrollWidth / 2; if (!half) continue;
    m.x += m.dir * sgn * (m.idle + v * 560) * dt / 1000;
    if (m.x <= -half) m.x += half; if (m.x > 0) m.x -= half;
    m.tr.style.transform = 'translate3d(' + m.x.toFixed(1) + 'px,0,0)';
    if (m.base !== null) {
      m.sk += (clamp(vel * 2.6, -5, 5) - m.sk) * 0.08;
      m.el.style.transform = 'rotate(' + (m.base + m.sk * (m.base < 0 ? 1 : -1) + Math.sin(t / 1300 + i * 2) * 0.7).toFixed(2) + 'deg)';
    }
  }
});
