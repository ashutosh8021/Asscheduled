/* motion/hero.js — carried across verbatim from
   source-site/assets/js/site.js lines 764-806.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, doc, reduce } from '../core/env.js';

/* ===================== hero: entrance + the word machine ===================== */
$$('.hero').forEach(function (h) {
  var fl = document.createElement('span'); fl.className = 'flash-l'; fl.setAttribute('aria-hidden', 'true'); h.appendChild(fl);
  $$('.hh', h).forEach(function (el) {
    var k = 0, txt = el.textContent; el.textContent = '';
    txt.split(/(\s+)/).forEach(function (w) {
      if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
      var ws = document.createElement('span'); ws.style.whiteSpace = 'nowrap';
      w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'lt'; s.textContent = c; s.style.setProperty('--k', k++); ws.appendChild(s); });
      el.appendChild(ws);
    });
    el.setAttribute('aria-label', txt);
  });
  if (reduce) { doc.classList.remove('intro'); return; }
  $$('.hero-copy > *', h).forEach(function (el, i) { el.style.setProperty('--hi', i); });
  $$('.hero-card', h).forEach(function (el, i) { el.style.setProperty('--k', i); el.style.setProperty('--hr', (i % 2 ? -6 : 6) + 'deg'); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('go'); }); });
  setTimeout(function () { doc.classList.remove('intro'); h.classList.remove('go'); }, 1900);
});
if (!$('.hero')) doc.classList.remove('intro');
$$('.rot2').forEach(function (rot) {
  var words = rot.getAttribute('data-words').split(','), cur = $('.rot2-w', rot), k = 0;
  function fill(el, txt, cls) {
    el.textContent = '';
    txt.split('').forEach(function (c, i) { var s = document.createElement('span'); s.className = 'ch' + (cls ? ' ' + cls : ''); s.textContent = c; s.style.setProperty('--k', i); el.appendChild(s); });
  }
  function fit() { rot.style.width = cur.offsetWidth + 'px'; }
  rot.setAttribute('aria-label', words[0]);
  fill(cur, words[0], 'pre-in'); fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  setTimeout(function () { fill(cur, words[0], 'in'); fit(); }, 320);
  setInterval(function () {
    if (document.hidden) return;
    var old = cur; old.classList.add('old');
    $$('.ch', old).forEach(function (c) { c.classList.remove('in', 'pre-in'); c.classList.add('out'); });
    k = (k + 1) % words.length;
    cur = document.createElement('span'); cur.className = 'rot2-w'; fill(cur, words[k], 'in'); rot.appendChild(cur); fit();
    rot.setAttribute('aria-label', words[k]);
    setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 1300);
  }, 2600);
});
