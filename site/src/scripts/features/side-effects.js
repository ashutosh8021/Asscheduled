/* features/side-effects.js — carried across verbatim from
   source-site/assets/js/site.js lines 360-393.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, pageScrolls, vh, vw } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== side effects: list drives the photo stack ===================== */
$$('[data-fx]').forEach(function (sec) {
  var items = $$('.fx li', sec), prints = $$('.fx-stack .print', sec), cnt = $('[data-fx-n]', sec), lbl = $('[data-fx-l]', sec), cur = -1;
  function set(i) {
    if (i === cur) return; cur = i;
    items.forEach(function (li, k) { li.classList.toggle('on', k === i); });
    prints.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    if (cnt) cnt.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    if (lbl) lbl.textContent = items[i].getAttribute('data-rate') || '';
  }
  set(0);
  if ('IntersectionObserver' in window) {
    var ratios = items.map(function () { return 0; });
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { ratios[items.indexOf(e.target)] = e.intersectionRatio; });
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    items.forEach(function (li) { fio.observe(li); });
    /* scrolled from outside: step through the symptoms while the list is on screen */
    setInterval(function () {
      if (pageScrolls || document.hidden) return;
      var vis = []; ratios.forEach(function (r, k) { if (r >= 0.6) vis.push(k); });
      if (!vis.length) return;
      var pos = vis.indexOf(cur); set(vis[(pos + 1) % vis.length]);
    }, 1900);
  }
  onFrame(function () {
    if (!pageScrolls) return;
    var r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    var best = 0, bd = 1e9, mid = vh * (vw < 900 ? 0.62 : 0.5);
    for (var k = 0; k < items.length; k++) { var b = items[k].getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = k; } }
    set(best);
  });
});
