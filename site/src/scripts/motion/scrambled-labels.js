/* motion/scrambled-labels.js — carried across verbatim from
   source-site/assets/js/site.js lines 748-763.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, reduce } from '../core/env.js';
import { onSeen } from './reveal.js';

/* ===================== scrambled labels, like a departures screen ===================== */
export var SCR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+';
export function scramble(el, dur) {
  var fin = el.textContent, len = fin.length, st = performance.now();
  (function f(now) {
    var p = Math.min(1, (now - st) / dur), n = Math.floor(p * len), s = fin.slice(0, n);
    for (var i = n; i < len; i++) s += /\s/.test(fin[i]) ? fin[i] : SCR[Math.random() * SCR.length | 0];
    el.textContent = s; if (p < 1) requestAnimationFrame(f); else el.textContent = fin;
  })(st);
}
if (!reduce) $$('.slug > span:not(.ln), .fact small, .mf-top span').forEach(function (el) {
  if (el.children.length) return;
  el.setAttribute('aria-label', el.textContent);
  onSeen(el, function () { scramble(el, 520 + el.textContent.length * 14); });
});
