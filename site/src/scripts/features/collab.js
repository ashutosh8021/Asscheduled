/* features/collab.js — carried across verbatim from
   source-site/assets/js/site.js lines 618-628.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

import { AS } from '../config.js';
import { $ } from '../core/env.js';
import { scrollToEl } from '../core/scroll.js';
import { validate } from './validation.js';

/* ===================== collab ===================== */
export var cf = $('#collab-form');
if (cf) cf.addEventListener('submit', function (e) {
  e.preventDefault(); if (!validate(cf)) return;
  var v = function (id) { return ($('#' + id) || {}).value || ''; };
  var text = 'Hi AS SCHEDULED, collab idea ✱\nName: ' + v('c-name') + '\nOrganisation: ' + v('c-org') + '\nPhone: ' + v('c-phone') + '\nEmail: ' + v('c-email') + '\nThe idea: ' + v('c-idea');
  var out = $('#collab-out'); out.hidden = false;
  $('#collab-wa').setAttribute('href', 'https://wa.me/' + AS.whatsapp + '?text=' + encodeURIComponent(text));
  $('#collab-text').textContent = text; scrollToEl(out);
});
