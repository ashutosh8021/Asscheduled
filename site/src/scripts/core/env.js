/* core/env.js — carried across verbatim from
   source-site/assets/js/site.js lines 34-57.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

export var doc = document.documentElement;
doc.classList.remove('no-js'); doc.classList.add('js');
/* same motion on every device: phones with Reduce Motion or battery saver get the full site too */
export var reduce = false;
export var touch = window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
/* some in-app viewers scroll the page from outside; then scroll position never changes in here */
export var pageScrolls = true;
export function checkScroll() {
  var tall = window.innerHeight > Math.max(screen.height || 0, 900) * 1.25; /* a frame taller than any screen is being scrolled from outside */
  pageScrolls = !tall && document.documentElement.scrollHeight > window.innerHeight + 40;
}
checkScroll(); window.addEventListener('load', checkScroll); window.addEventListener('resize', checkScroll); setInterval(checkScroll, 1500);
export var fine = window.matchMedia('(pointer: fine)').matches;
export var $ = function (s, r) { return (r || document).querySelector(s); };
export var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
export var inr = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
export var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
export var store = {
  get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
export var vw = window.innerWidth, vh = window.innerHeight;
window.addEventListener('resize', function () { vw = window.innerWidth; vh = window.innerHeight; });
