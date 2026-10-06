/* features/footage.js — carried across verbatim from
   source-site/assets/js/site.js lines 838-896.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { $$ } from '../core/env.js';
import { go } from '../core/wipe.js';

/* ===================== footage: autoplays on every screen, phones included, and pauses off screen ===================== */
(function () {
  var vids = $$('video[autoplay]'); if (!vids.length) return;
  function prep(v) { v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); }
  var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var webkit = ios || /AppleWebKit/.test(navigator.userAgent) && !/Chrome|CriOS|Android|FxiOS|EdgiOS/.test(navigator.userAgent);
  function srcOf(v) {
    if (v.currentSrc) return v.currentSrc;
    var ss = v.querySelectorAll('source');
    for (var i = 0; i < ss.length; i++) { var m = ss[i].getAttribute('media'); if (!m || matchMedia(m).matches) return ss[i].getAttribute('src'); }
    return v.getAttribute('src');
  }
  // iPhones in Low Power Mode refuse every video autoplay, but still animate an mp4 placed in an <img>, so the clip keeps moving
  function asImage(v) {
    if (v._img || v._noimg || !webkit) return; var src = srcOf(v); if (!src) return;
    var im = document.createElement('img'); im.className = 'vid-img'; im.alt = ''; im.setAttribute('aria-hidden', 'true');
    im.style.objectPosition = getComputedStyle(v).objectPosition;
    im.onload = function () { v.style.visibility = 'hidden'; v.autoplay = false; try { v.pause(); } catch (e) {} };
    im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); v._img = null; v._noimg = true; v.style.visibility = ''; go(v); };
    v._img = im; im.src = src; v.parentNode.insertBefore(im, v.nextSibling);
  }
  function go(v) {
    if (!v._on || v._img) return; prep(v);
    var p = v.play();
    if (p && p.then) p.then(function () { v._denied = false; }, function (e) { v._denied = !!(e && e.name === 'NotAllowedError'); if (v._denied) asImage(v); });
  }
  // some hosts don't answer byte-range requests and iPhones then refuse the mp4, so play the file from memory instead
  function rescue(v) {
    if (v._rescued || !window.fetch || !window.URL || !URL.createObjectURL) return; v._rescued = true;
    var s = v.querySelector('source'), src = srcOf(v); if (!src) return;
    fetch(src).then(function (r) { if (!r.ok) throw new Error('fetch'); return r.blob(); }).then(function (b) {
      $$('source', v).forEach(function (x) { x.parentNode.removeChild(x); });
      v.src = URL.createObjectURL(b.type ? b : new Blob([b], { type: 'video/mp4' }));
      v.load(); go(v);
    }).catch(function () {});
  }
  vids.forEach(function (v) {
    prep(v);
    if (ios) asImage(v);
    var s = v.querySelector('source');
    $$('source', v).forEach(function (x) { x.addEventListener('error', function () { if (!v.currentSrc || v.currentSrc.indexOf(x.getAttribute('src')) > -1) rescue(v); }); });
    v.addEventListener('error', function () { rescue(v); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      v._on = es[0].isIntersecting;
      if (v._on) {
        if (v.preload === 'none') v.preload = 'auto';
        go(v); clearTimeout(v._t);
        v._t = setTimeout(function () { if (!v._on || v._img) return; if (v._denied || (v.paused && v.currentTime === 0)) asImage(v); else if (v.readyState < 1) rescue(v); }, 3500);
      } else v.pause();
    }, { threshold: 0.02, rootMargin: '120px 0px' }).observe(v);
    else { v._on = true; go(v); }
  });
  // Low Power Mode and data savers hold autoplay back until the first touch, so any touch starts whatever is on screen
  var nudge = function () { vids.forEach(function (v) { if (v._on && v.paused) go(v); }); };
  ['touchend', 'click', 'keydown'].forEach(function (e) { document.addEventListener(e, nudge, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) nudge(); });
  window.addEventListener('pageshow', nudge);
})();
