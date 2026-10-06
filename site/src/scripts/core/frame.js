/* core/frame.js — carried across verbatim from
   source-site/assets/js/site.js lines 138-156.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, doc } from './env.js';
import { lenis } from './scroll.js';

/* ===================== the frame loop ===================== */
export var hdr = $('.hdr'), solidPage = document.body.classList.contains('solid-head');
export var firstDark = $('.hero, .phero');
export var lastY = window.scrollY, vel = 0, lastT = performance.now(), fns = [];
export function onFrame(f) { fns.push(f); }
export function loop(t) {
  if (lenis) lenis.raf(t);
  var y = window.scrollY, dt = Math.min(64, Math.max(1, t - lastT));
  vel = vel * 0.85 + ((y - lastY) / dt) * 0.15;
  if (hdr && !document.body.classList.contains('menu-open')) {
    var lim = firstDark ? firstDark.offsetHeight - (parseInt(getComputedStyle(doc).getPropertyValue('--hdr')) || 64) - 40 : 40;
    hdr.classList.toggle('is-solid', solidPage || y > lim);
  }
  for (var i = 0; i < fns.length; i++) fns[i](y, t, dt);
  lastY = y; lastT = t;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
