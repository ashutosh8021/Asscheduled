/* features/booking.js — carried across verbatim from
   source-site/assets/js/site.js lines 629-742.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { AS } from '../config.js';
import { $, $$, inr, reduce, store } from '../core/env.js';
import { scrollToEl } from '../core/scroll.js';
import { toast } from '../core/toast.js';
import { priceOf } from './coupons.js';
import { validate } from './validation.js';

/* ===================== booking flow + live boarding pass ===================== */
export var af = $('#apply-form');
if (af) {
  var steps = $$('[data-step]', af), dots = $$('.steps li'), cur = 0;
  var fields = ['a-name', 'a-age', 'a-phone', 'a-email', 'a-college', 'a-city', 'a-state', 'a-insta', 'a-why'];
  var draft = store.get('as_apply') || {};
  fields.forEach(function (id) { var el = $('#' + id); if (el && draft[id]) el.value = draft[id]; });
  if (draft.gender) { var g0 = $('input[name="gender"][value="' + draft.gender + '"]', af); if (g0) g0.checked = true; }
  var st0 = store.get('as_state'); if (st0 && $('#a-state') && !$('#a-state').value) $('#a-state').value = st0;
  var bp = $('[data-bp]'), code = bp && $('.bp-code', bp);
  var pass = {}; $$('[data-pass]').forEach(function (el) { var k = el.getAttribute('data-pass'); (pass[k] = pass[k] || []).push(el); });
  function setPass(k, v) {
    (pass[k] || []).forEach(function (el) {
      var txt = v || el.getAttribute('data-ph') || '—';
      if (el.textContent !== txt) { el.textContent = txt; if (v && !reduce) { el.classList.remove('ink'); void el.offsetWidth; el.classList.add('ink'); } }
      el.classList.toggle('ph-empty', !v);
    });
  }
  var CODES = { delhi: 'DEL', newdelhi: 'DEL', noida: 'DEL', gurgaon: 'DEL', gurugram: 'DEL', mumbai: 'BOM', bombay: 'BOM', navimumbai: 'BOM', thane: 'BOM', bengaluru: 'BLR', bangalore: 'BLR',
    kolkata: 'CCU', calcutta: 'CCU', chennai: 'MAA', madras: 'MAA', hyderabad: 'HYD', secunderabad: 'HYD', pune: 'PNQ', bhubaneswar: 'BBI', cuttack: 'BBI', nagpur: 'NAG', jaipur: 'JAI',
    lucknow: 'LKO', ahmedabad: 'AMD', gandhinagar: 'AMD', guwahati: 'GAU', patna: 'PAT', chandigarh: 'IXC', mohali: 'IXC', kochi: 'COK', cochin: 'COK', indore: 'IDR', raipur: 'RPR',
    bhopal: 'BHO', goa: 'GOI', panaji: 'GOI', surat: 'STV', vadodara: 'BDQ', thiruvananthapuram: 'TRV', trivandrum: 'TRV', coimbatore: 'CJB', visakhapatnam: 'VTZ', vizag: 'VTZ',
    ranchi: 'IXR', dehradun: 'DED', varanasi: 'VNS', srinagar: 'SXR', amritsar: 'ATQ', jammu: 'IXJ', nashik: 'ISK', aurangabad: 'IXU', mangaluru: 'IXE', mangalore: 'IXE',
    madurai: 'IXM', kanpur: 'KNU', agra: 'AGR', jodhpur: 'JDH', udaipur: 'UDR', siliguri: 'IXB', rourkela: 'RRK', jabalpur: 'JLR', gwalior: 'GWL', prayagraj: 'IXD', allahabad: 'IXD' };
  function cityCode(s) { var k = String(s || '').toLowerCase().replace(/[^a-z]/g, ''); return k ? (CODES[k] || k.slice(0, 3).toUpperCase()) : ''; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var lastSeed = 'AS';
  function drawCode(seed) {
    if (!code || !code.getContext) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 3), cw = code.clientWidth || 100, ch = code.clientHeight || 36;
    code.width = Math.round(cw * dpr); code.height = Math.round(ch * dpr);
    var c = code.getContext('2d'), W = code.width, H = code.height, h = hash(seed) || 1;
    var rnd = function () { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return (h % 10000) / 10000; };
    /* a code-128 looking run: guard, data, guard; widths in modules, bars and gaps alternate */
    var runs = [2, 1, 1, 2, 3, 2], M = 0, i;
    while (M < 78) { var w = 1 + (rnd() * 4 | 0); runs.push(w); M += w; }
    runs = runs.concat([2, 3, 3, 1, 1, 1, 2]);
    var total = 0; runs.forEach(function (r) { total += r; });
    c.clearRect(0, 0, W, H); c.fillStyle = '#11162A';
    var x = 0;
    for (i = 0; i < runs.length; i++) {
      var x0 = Math.round(x / total * W), x1 = Math.round((x + runs[i]) / total * W);
      if (i % 2 === 0) c.fillRect(x0, 0, Math.max(1, x1 - x0), H);
      x += runs[i];
    }
  }
  function livePass() {
    var v = function (id) { return (($('#' + id) || {}).value || '').trim(); };
    var pid = ($('input[name="plan"]:checked', af) || {}).value, p = AS.plans[pid];
    var nm = v('a-name').toUpperCase().replace(/\s+/g, ' '), parts = nm ? nm.split(' ') : [];
    var full = parts.length > 1 ? parts[parts.length - 1] + '/' + parts.slice(0, -1).join(' ') : nm;
    var city = v('a-city');
    setPass('name', full.slice(0, 26)); setPass('first', parts[0] ? parts[0].slice(0, 12) : '');
    setPass('from', city.slice(0, 16)); setPass('fromCode', cityCode(city));
    setPass('to', p ? p.to : ''); setPass('toCode', p ? p.code : ''); setPass('fest', p ? p.trip.replace(/’\d+$/, '') : '');
    setPass('date', p ? p.dcode : ''); setPass('price', p ? inr(priceOf(p).pay) : '');
    var seed = nm + '|' + (pid || '') + '|' + city;
    setPass('seq', nm ? ('00' + (hash(seed) % 997 + 1)).slice(-3) : '');
    lastSeed = seed; drawCode(seed);
  }
  if (bp) {
    window.addEventListener('resize', function () { drawCode(lastSeed); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawCode(lastSeed); });
  }
  var hashPlan = (location.hash || '').replace('#', '');
  var startPlan = AS.plans[hashPlan] ? hashPlan : (draft.plan && AS.plans[draft.plan] ? draft.plan : '');
  if (startPlan) { var pr = $('input[name="plan"][value="' + startPlan + '"]', af); if (pr) { pr.checked = true; pr.dispatchEvent(new Event('change')); } }
  function save() {
    var d = {}; fields.forEach(function (id) { var el = $('#' + id); if (el) d[id] = el.value; });
    var g = $('input[name="gender"]:checked', af); if (g) d.gender = g.value;
    var p = $('input[name="plan"]:checked', af); if (p) d.plan = p.value;
    store.set('as_apply', d); livePass();
  }
  af.addEventListener('input', save); af.addEventListener('change', save);
  function show(i, quiet) {
    cur = i; steps.forEach(function (s, k) { s.hidden = k !== i; });
    dots.forEach(function (d, k) { d.classList.toggle('done', k < i); d.classList.toggle('now', k === i); });
    if (i === 2) build();
    if (!quiet) scrollToEl($('.steps') || af);
  }
  $$('[data-next]', af).forEach(function (b) { b.addEventListener('click', function () { if (validate(steps[cur])) show(cur + 1); }); });
  $$('[data-back]', af).forEach(function (b) { b.addEventListener('click', function () { show(Math.max(0, cur - 1)); }); });
  function build() {
    var v = function (id) { return (($('#' + id) || {}).value || '').trim(); };
    var pid = ($('input[name="plan"]:checked', af) || {}).value, p = AS.plans[pid]; if (!p) return;
    var q = priceOf(p), dep = q.dep;
    $('#s-plan').textContent = p.plan; $('#s-where').textContent = p.where + ' · ' + p.when;
    $('#s-price').innerHTML = q.coupon ? '<s>' + inr(q.base) + '</s>' : inr(q.base);
    $('#s-cp-row').hidden = !q.coupon; $('#s-pay-row').hidden = !q.coupon;
    if (q.coupon) { $('#s-cp-code').textContent = q.coupon.code; $('#s-cp').textContent = '−' + inr(q.off); $('#s-pay').textContent = inr(q.pay); }
    $('#s-dep').textContent = inr(dep) + ' (' + Math.round(p.deposit * 100) + '%)';
    $('#s-bal').textContent = inr(q.pay - dep); $('#s-travel').textContent = p.travel; $('#pay-amount').textContent = inr(dep);
    var up = $('#upi-pay');
    if (up && AS.upi) up.setAttribute('href', 'upi://pay?pa=' + AS.upi.id + '&pn=' + encodeURIComponent(AS.upi.name) + '&am=' + dep.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(('AS SCHEDULED ' + (p.code || '') + ' ' + v('a-name')).trim().slice(0, 48)));
    var g = ($('input[name="gender"]:checked', af) || {}).value || '';
    var text = 'Hi AS SCHEDULED, I’m coming ✱\n\nTrip: ' + p.plan + '\nWhere: ' + p.where + ', ' + p.when + (q.coupon ? '\nCoupon: ' + q.coupon.code + ', ' + inr(q.off) + ' off (auto-applied)\nPackage after coupon: ' + inr(q.pay) + ' (was ' + inr(q.base) + ')' : '\nPackage: ' + inr(q.base)) +
      '\nBooking amount paid: ' + inr(dep) + ' of ' + inr(q.pay) + '\n\n' +
      'Name: ' + v('a-name') + '\nAge: ' + v('a-age') + (g ? '\nGender: ' + g : '') + '\nPhone: ' + v('a-phone') + '\nEmail: ' + v('a-email') +
      '\nCollege: ' + v('a-college') + '\nCity: ' + v('a-city') + ', ' + v('a-state') +
      (v('a-insta') ? '\nInstagram: ' + v('a-insta') : '') + (v('a-why') ? '\nWhy I’m coming: ' + v('a-why') : '') + '\n\nPayment screenshot attached';
    $('#wa-send').setAttribute('href', 'https://wa.me/' + AS.whatsapp + '?text=' + encodeURIComponent(text));
    $('#apply-text').textContent = text;
    if (AS.applyEndpoint && !af._sent) {
      af._sent = true;
      try { fetch(AS.applyEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: pid, price: q.pay, listPrice: q.base, coupon: q.coupon ? q.coupon.code : '', couponOff: q.off, deposit: dep, name: v('a-name'), age: v('a-age'), gender: g, phone: v('a-phone'), email: v('a-email'), college: v('a-college'), city: v('a-city'), state: v('a-state'), instagram: v('a-insta'), why: v('a-why'), at: new Date().toISOString() }) }); } catch (x) {}
    }
  }
  var paid = $('#a-paid');
  if (paid) paid.addEventListener('change', function () { $('#wa-send').classList.toggle('is-ready', paid.checked); });
  var ws = $('#wa-send');
  if (ws) ws.addEventListener('click', function (e) { if (paid && !paid.checked) { e.preventDefault(); toast('Pay the booking amount first, then tick the box'); paid.focus(); } });
  livePass(); show(0, true);
}
