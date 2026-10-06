/* features/map.js — carried across verbatim from
   source-site/assets/js/site.js lines 450-471.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$ } from '../core/env.js';

/* ===================== map ===================== */
$$('[data-map]').forEach(function (m) {
  var svg = $('svg', m), hubs = { hal: $('.map-hub.hal', svg), mi: $('.map-hub.mi', svg) }, rh = $('.r-hal', svg), rm = $('.r-mi', svg);
  var outH = $('[data-dist="hal"]', m), outM = $('[data-dist="mi"]', m), outC = $('[data-dist="city"]', m);
  function km(a, b) { var R = 6371, t = Math.PI / 180, dl = (b[1] - a[1]) * t, dn = (b[0] - a[0]) * t; var h = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dn / 2) * Math.sin(dn / 2); return Math.round(2 * R * Math.asin(Math.sqrt(h)) / 10) * 10; }
  function ll(el) { return [parseFloat(el.getAttribute('data-lon')), parseFloat(el.getAttribute('data-lat'))]; }
  function xy(el) { return [parseFloat(el.getAttribute('data-x')), parseFloat(el.getAttribute('data-y'))]; }
  function arc(a, b) { var mx2 = (a[0] + b[0]) / 2, my2 = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return 'M' + a[0] + ' ' + a[1] + ' Q' + (mx2 - dy * 0.25).toFixed(1) + ' ' + (my2 + dx * 0.25).toFixed(1) + ' ' + b[0] + ' ' + b[1]; }
  function pick(name) {
    var c = $('.map-city[data-name="' + name + '"]', svg); if (!c) return;
    $$('.map-city', svg).forEach(function (x) { x.classList.toggle('on', x === c); });
    $$('[data-city]', m).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-city') === name)); });
    var p = xy(c); rh.setAttribute('d', arc(p, xy(hubs.hal))); rm.setAttribute('d', arc(p, xy(hubs.mi))); rh.classList.add('draw'); rm.classList.add('draw');
    if (outH) outH.textContent = km(ll(c), ll(hubs.hal)).toLocaleString('en-IN') + ' km';
    if (outM) outM.textContent = km(ll(c), ll(hubs.mi)).toLocaleString('en-IN') + ' km';
    if (outC) outC.textContent = name;
  }
  $$('[data-city]', m).forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-city')); }); });
  $$('.map-city', svg).forEach(function (c) { c.addEventListener('click', function () { pick(c.getAttribute('data-name')); }); });
  pick(m.getAttribute('data-start') || 'Delhi');
});
