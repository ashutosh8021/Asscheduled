/* core/landing.js — carried across verbatim from
   source-site/assets/js/site.js lines 115-137.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { lenis, yOf } from './scroll.js';

/* ===================== landing: every page opens at the top, a #link lands on its section ===================== */
(function () {
  var user = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { user = true; }, { passive: true }); });
  function target() {
    var h = ''; try { h = decodeURIComponent((location.hash || '').slice(1)); } catch (e) {}
    var t = h && document.getElementById(h);
    return t && !/^(INPUT|SELECT|TEXTAREA|OPTION|LABEL)$/.test(t.tagName) ? t : null;
  }
  function land() {
    if (user) return;
    var t = target(), y = t ? yOf(t) : 0;
    if (lenis) { try { lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) {} }
    if (Math.abs(window.scrollY - y) > 1) { try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } }
  }
  window.__asLand = land;
  land(); requestAnimationFrame(land);
  if (document.readyState === 'complete') setTimeout(land, 60);
  else window.addEventListener('load', function () { land(); setTimeout(land, 250); setTimeout(land, 900); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(land);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { user = false; land(); setTimeout(land, 120); } });
})();
