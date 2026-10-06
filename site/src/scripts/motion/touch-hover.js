/* motion/touch-hover.js — carried across verbatim from
   source-site/assets/js/site.js lines 807-837.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, pageScrolls, touch, vh } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== touch screens get the hover moments too ===================== */
if (touch) {
  var hots = $$('.pillar,.rule,.dep,.frame,.step3,.mf-card,.plan,.ccard,.hero-card,.tally-n,.print').filter(function (el) { return !el.closest('.fx-stack') && !el.closest('.hcard'); });
  var setHot = function (el, on) { if (el._h !== on) { el._h = on; el.classList.toggle('is-hot', on); } };
  if ('IntersectionObserver' in window) {
    /* when the page is scrolled from outside: one item per group at a time, taking turns while they're all on screen */
    var groups = [], tick = 0;
    hots.forEach(function (el) { el._r = 0; var g = groups.filter(function (x) { return x.p === el.parentNode; })[0]; if (!g) groups.push(g = { p: el.parentNode, list: [] }); g.list.push(el); });
    var refresh = function () {
      if (pageScrolls) return;
      groups.forEach(function (g) {
        var full = g.list.filter(function (el) { return el._r >= 0.95; }), pick = null;
        if (full.length) pick = full[tick % full.length];
        else g.list.forEach(function (el) { if (el._r >= 0.6 && (!pick || el._r > pick._r)) pick = el; });
        g.list.forEach(function (el) { setHot(el, el === pick); });
      });
    };
    var hio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._r = e.intersectionRatio; }); refresh(); }, { threshold: [0, 0.3, 0.6, 0.8, 0.95, 1] });
    hots.forEach(function (el) { hio.observe(el); });
    setInterval(function () { if (!pageScrolls && !document.hidden) { tick++; refresh(); } }, 1700);
  }
  onFrame(function () {
    if (!pageScrolls) return;
    var lo = vh * 0.36, hi = vh * 0.64;
    for (var i = 0; i < hots.length; i++) {
      var r = hots[i].getBoundingClientRect(), c = r.top + r.height / 2, on = c > lo && c < hi;
      setHot(hots[i], on);
    }
  });
}
