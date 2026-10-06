/* core/toast.js — carried across verbatim from
   source-site/assets/js/site.js lines 58-73.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$ } from './env.js';

/* ===================== toast + copy ===================== */
export var toastEl;
export function toast(msg) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
}
export function selectText(el) { if (!el) return; try { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} }
export function copy(text, el) {
  try { navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, function () { selectText(el); toast('Selected, press copy to finish'); }); }
  catch (e) { selectText(el); toast('Selected, press copy to finish'); }
}
$$('[data-copy]').forEach(function (b) {
  b.addEventListener('click', function () { var t = document.getElementById(b.getAttribute('data-copy')); copy(t ? (t.innerText || t.textContent).trim() : '', t); });
});
