/* motion/reveal.js — carried across verbatim from
   source-site/assets/js/site.js lines 198-253.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$, clamp, reduce, vh } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== reveal ===================== */
export function splitWords(el, cls) {
  var i = 0;
  (function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var w = document.createElement('span'); w.className = 'w';
          var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
          w.appendChild(s); frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('rot') && !n.classList.contains('nosplit')) walk(n);
    });
  })(el);
  el.classList.add(cls);
}
$$('[data-split]').forEach(function (el) { splitWords(el, 'sp'); });
/* lists come in one item after another */
$$('.fx li,.dep,.pillar,.rule,.step3,.plan,.acc-item,.mf-card,.ccard,.frame,.tally-n,.forl li,.fact,.cities button,.foot-cols > div,.mf-row,.incs span,.chips button,.dist div')
  .forEach(function (el) {
    if (el.closest('.hero')) return;
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.setAttribute('data-reveal', ''); el.style.setProperty('--rd', (Math.min(i, 9) * 0.075).toFixed(3) + 's');
  });
$$('.stamp').forEach(function (el, i) { if (!el.style.getPropertyValue('--rd')) el.style.setProperty('--rd', (0.25 + (i % 3) * 0.12).toFixed(2) + 's'); });
export var rv = $$('[data-reveal],[data-split],.mask,.slug,.stamp');
if ('IntersectionObserver' in window && !reduce) {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('in'); el.classList.remove('pre'); io.unobserve(el);
      setTimeout(function () { el.classList.remove('in'); }, 2600 + (parseFloat(el.style.getPropertyValue('--rd')) || 0) * 1000);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
  rv.forEach(function (el) { el.classList.add('pre'); io.observe(el); });
}
/* run something once, the first time it's on screen */
export function onSeen(el, fn) {
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(el); } }, { threshold: 0.2 });
  o.observe(el);
}
/* word scrub: lights up as it passes through the screen */
export var scrubs = $$('[data-scrub]').map(function (el) { splitWords(el, 'scrub'); return { el: el, w: $$('.w', el) }; });
onFrame(function () {
  for (var i = 0; i < scrubs.length; i++) {
    var s = scrubs[i], r = s.el.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) continue;
    var p = reduce ? 1 : clamp((vh * 0.88 - r.top) / (r.height + vh * 0.32), 0, 1), n = Math.round(p * s.w.length);
    for (var k = 0; k < s.w.length; k++) { var on = k < n; if (s.w[k]._on !== on) { s.w[k]._on = on; s.w[k].classList.toggle('lit', on); } }
  }
});
