/* features/menu.js — carried across verbatim from
   source-site/assets/js/site.js lines 157-169.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $ } from '../core/env.js';
import { lenis } from '../core/scroll.js';

/* ===================== menu ===================== */
export var burger = $('.burger'), menu = $('#menu');
export function setMenu(open) {
  if (!menu) return;
  menu.hidden = !open; document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (lenis) { open ? lenis.stop() : lenis.start(); }
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) requestAnimationFrame(function () { var f = $('.menu-links a', menu); if (f) f.focus({ preventScroll: true }); });
}
if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
