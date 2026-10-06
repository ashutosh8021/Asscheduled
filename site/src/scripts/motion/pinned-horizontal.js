/* motion/pinned-horizontal.js — carried across verbatim from
   source-site/assets/js/site.js lines 394-433.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, checkScroll, clamp, pageScrolls, vh, vw } from '../core/env.js';
import { onFrame } from '../core/frame.js';
import { onSeen } from './reveal.js';

/* ===================== pinned horizontal ===================== */
$$('[data-hs]').forEach(function (sec) {
  var track = $('.hs-track', sec), bar = $('.hs-bar', sec), lab = bar && $('b', bar), cards = $$('[data-time]', track);
  var dist = 0, strip = false;
  function hot(best) { if (lab) lab.textContent = best.getAttribute('data-time'); cards.forEach(function (c) { c.classList.toggle('is-hot', c === best); }); }
  function toStrip() {
    if (strip) return; strip = true; sec.classList.add('no-pin'); sec.style.height = ''; track.style.transform = '';
    var seen = false, pause = 0;
    onSeen(sec, function () { seen = true; });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { pause = Date.now() + 6000; }, { passive: true }); });
    track.addEventListener('scroll', function () {
      var mid = track.scrollLeft + track.clientWidth / 2, best = cards[0], bd = 1e9;
      cards.forEach(function (c) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = c; } });
      hot(best); if (bar) bar.style.setProperty('--hp', (track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth)).toFixed(4));
    }, { passive: true });
    setInterval(function () {
      if (!seen || document.hidden || Date.now() < pause) return;
      var c = cards[0], step = c ? c.offsetWidth + 24 : 300;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: step, behavior: 'smooth' });
    }, 2400);
    if (cards[0]) hot(cards[0]);
  }
  function size() { checkScroll(); if (!pageScrolls) { toStrip(); return; } dist = Math.max(0, track.scrollWidth - vw); sec.style.height = (dist + vh) + 'px'; }
  size(); window.addEventListener('resize', size); window.addEventListener('load', size);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  onFrame(function () {
    if (strip) return;
    var r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    var p = clamp(-r.top / Math.max(1, dist), 0, 1);
    track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.setProperty('--hp', p.toFixed(4));
    if (lab && cards.length) {
      var best = cards[0], bd = 1e9;
      for (var i = 0; i < cards.length; i++) { var cr = cards[i].getBoundingClientRect(), d = Math.abs(cr.left + cr.width / 2 - vw / 2); if (d < bd) { bd = d; best = cards[i]; } }
      if (lab.textContent !== best.getAttribute('data-time')) hot(best);
    }
  });
});
