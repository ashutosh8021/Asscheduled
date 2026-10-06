/* motion/cursor.js — carried across verbatim from
   source-site/assets/js/site.js lines 296-346.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $, $$, doc, fine, reduce } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== cursor ===================== */
if (fine && !reduce) {
  var ring = document.createElement('div'); ring.className = 'cur'; ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<div class="cur-ring"><svg viewBox="0 0 100 100"><defs><path id="cpath" d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"/></defs><text><textPath href="#cpath">AS SCHEDULED ✱ AS SCHEDULED ✱ </textPath></text></svg><span class="t"></span></div>';
  var dot = document.createElement('div'); dot.className = 'cur'; dot.setAttribute('aria-hidden', 'true'); dot.innerHTML = '<div class="cur-dot"></div>';
  var trail = document.createElement('div'); trail.className = 'cur-trail'; trail.setAttribute('aria-hidden', 'true'); trail.innerHTML = '<i></i><i></i><i></i><i></i>';
  var vf = document.createElement('div'); vf.className = 'cur-vf'; vf.setAttribute('aria-hidden', 'true'); vf.innerHTML = '<b></b><b></b><b></b><b></b><em></em><span>View</span>';
  document.body.appendChild(trail); document.body.appendChild(vf); document.body.appendChild(ring); document.body.appendChild(dot);
  doc.classList.add('has-cursor');
  var cx = -200, cy = -200, rx = -200, ry = -200, vx = -200, vy = -200, lab = $('.t', ring), vfl = $('span', vf);
  var tps = [{ x: -200, y: -200 }, { x: -200, y: -200 }, { x: -200, y: -200 }, { x: -200, y: -200 }], tis = $$('i', trail), moveT;
  window.addEventListener('mousemove', function (e) {
    cx = e.clientX; cy = e.clientY; dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    doc.classList.add('moving'); clearTimeout(moveT); moveT = setTimeout(function () { doc.classList.remove('moving'); }, 160);
  }, { passive: true });
  onFrame(function () {
    rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2; ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    vx += (cx - vx) * 0.28; vy += (cy - vy) * 0.28; vf.style.left = vx + 'px'; vf.style.top = vy + 'px';
    var px2 = cx, py2 = cy;
    for (var i = 0; i < tps.length; i++) { tps[i].x += (px2 - tps[i].x) * (0.32 - i * 0.06); tps[i].y += (py2 - tps[i].y) * (0.32 - i * 0.06); px2 = tps[i].x; py2 = tps[i].y;
      tis[i].style.transform = 'translate3d(' + tps[i].x + 'px,' + tps[i].y + 'px,0) scale(' + (1 - i * 0.18) + ')'; }
  });
  function arrowFor(el) {
    if (el.getAttribute('target') === '_blank') return '↗';
    if (el.hasAttribute('data-back')) return '←';
    return '';
  }
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('[data-cursor],[data-vf],a,button,label,summary,select,input,textarea,.trs');
    ring.classList.remove('is-label', 'is-link', 'is-text', 'is-hidden'); vf.classList.remove('on'); dot.classList.remove('is-hidden');
    if (!t) return;
    if (t.matches('input:not([type=checkbox]):not([type=radio]),textarea')) { ring.classList.add('is-text'); dot.classList.add('is-hidden'); return; }
    if (t.hasAttribute('data-vf')) { vfl.textContent = t.getAttribute('data-vf') || 'View'; vf.classList.add('on'); ring.classList.add('is-hidden'); return; }
    var l = t.getAttribute('data-cursor') || (t.classList.contains('trs') ? 'Drag' : '');
    if (l) { lab.textContent = l + (arrowFor(t) ? ' ' + arrowFor(t) : ''); ring.classList.add('is-label'); }
    else { var a = arrowFor(t); if (a) { lab.textContent = a; ring.classList.add('is-label'); } else ring.classList.add('is-link'); }
  });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
  document.addEventListener('mouseleave', function () { cx = cy = -200; });
  /* magnetic buttons */
  $$('[data-magnetic], .btn, .pill, .btn-cta, .dep .go, .qnav button, .news-field button').forEach(function (b) {
    var strength = b.classList.contains('go') ? 0.4 : 0.26;
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = 'translate(' + (dx * strength).toFixed(1) + 'px,' + (dy * strength).toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transition = 'transform .6s cubic-bezier(.34,1.5,.64,1)'; b.style.transform = ''; setTimeout(function () { b.style.transition = ''; }, 600); });
  });
}
