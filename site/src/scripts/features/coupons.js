/* features/coupons.js — carried across verbatim from
   source-site/assets/js/site.js lines 528-577.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { AS } from '../config.js';
import { $, $$, inr } from '../core/env.js';

/* ===================== coupons ===================== */
export function couponFor(p) { var c = p && AS.coupons && AS.coupons[p.coupon]; return c && c.left > 0 ? c : null; }
export function priceOf(p) { var c = couponFor(p), off = c ? c.off : 0, pay = p.price - off; return { base: p.price, off: off, pay: pay, coupon: c, dep: Math.round(pay * p.deposit / 10) * 10 }; }
export var couponHooks = [];
export function couponsChanged() { couponHooks.forEach(function (f) { f(); }); }
if (AS.couponEndpoint && window.fetch) {
  fetch(AS.couponEndpoint).then(function (r) { return r.json(); }).then(function (d) {
    Object.keys(AS.coupons || {}).forEach(function (k) { if (d && d[k] != null && !isNaN(+d[k])) AS.coupons[k].left = Math.max(0, +d[k] | 0); });
    couponsChanged();
  }).catch(function () {});
}
/* plan cards on the booking page show the coupon price */
$$('.plans-mini .plan[data-id]').forEach(function (card) {
  var p = AS.plans[card.getAttribute('data-id')], box = $('.plan-price', card); if (!p || !box) return;
  function draw() {
    var q = priceOf(p);
    box.innerHTML = q.coupon
      ? '<b class="tabular">' + inr(q.pay) + '</b><s class="tabular">' + inr(q.base) + '</s><span class="plan-off">−' + inr(q.off) + '</span>'
      : '<b class="tabular">' + inr(q.base) + '</b><small>per person</small>';
  }
  draw(); couponHooks.push(draw);
});
/* the coupon ticket under the plans */
export var cpBox = $('[data-coupon]');
if (cpBox) {
  var cpOff = $('[data-cp-off]', cpBox), cpNote = $('[data-cp-note]', cpBox), cpR = $('[data-cp-r]', cpBox), cpDig = $('[data-cp-digits]', cpBox), lastLeft = null;
  var drawCoupon = function () {
    var pid = ($('input[name="plan"]:checked') || {}).value, p = AS.plans[pid], c = couponFor(p);
    var live = Object.keys(AS.coupons || {}).filter(function (k) { return AS.coupons[k].left > 0; });
    if (!p) {
      cpBox.hidden = !live.length; cpR.hidden = true; cpBox.classList.remove('is-on');
      cpOff.textContent = live.map(function (k) { return inr(AS.coupons[k].off) + ' off ' + AS.coupons[k].name; }).join(', ');
      cpNote.textContent = 'Pick a trip, it comes off your price on its own, no code to type';
      return;
    }
    if (!c) { cpBox.hidden = true; return; }
    cpBox.hidden = false; cpBox.classList.add('is-on'); cpR.hidden = false;
    cpOff.innerHTML = inr(c.off) + ' <i>off</i>';
    cpNote.textContent = 'Taken off ' + p.short + ' already, you pay ' + inr(priceOf(p).pay) + ' instead of ' + inr(p.price);
    if (lastLeft !== c.left) {
      lastLeft = c.left; cpDig.innerHTML = '';
      String(c.left).split('').forEach(function (d, i) { var b = document.createElement('b'); b.textContent = d; b.style.setProperty('--k', i); cpDig.appendChild(b); });
      cpDig.setAttribute('aria-label', c.left + ' bookings');
      cpDig.classList.remove('roll'); void cpDig.offsetWidth; cpDig.classList.add('roll');
    }
  };
  drawCoupon(); couponHooks.push(drawCoupon);
  $$('input[name="plan"]').forEach(function (r) { r.addEventListener('change', drawCoupon); });
}
