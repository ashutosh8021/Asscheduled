/* motion/progress.js — carried across verbatim from
   source-site/assets/js/site.js lines 743-747.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { clamp, pageScrolls, vh } from '../core/env.js';
import { onFrame } from '../core/frame.js';

/* ===================== scroll progress ===================== */
export var prog = document.createElement('div'); prog.className = 'prog'; prog.setAttribute('aria-hidden', 'true'); prog.innerHTML = '<i></i>'; document.body.appendChild(prog);
export var progI = prog.firstChild;
onFrame(function (y) { prog.style.display = pageScrolls ? '' : 'none'; var max = document.documentElement.scrollHeight - vh; progI.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')'; });
