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

  /* ADDED to the Co-work original, which only ever built the WhatsApp
     message. A festival that fills this in and then does not press the
     button was simply lost; it now also reaches the COLLABS tab in the
     admin. The hand-off above is untouched and is still the path we
     tell them to use, which is why a failure here is logged rather than
     shown — their message is already on screen either way.

     `type` is not a field on this form, so it is sent as what the
     section is: a collab enquiry. The route requires it, and inventing
     a category the person never chose would be worse than naming the
     form they filled in. dates and location are not asked for either. */
  if (AS.collabEndpoint) {
    try {
      fetch(AS.collabEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: v('c-name'), org: v('c-org'), email: v('c-email'), phone: v('c-phone'),
          type: 'Collab enquiry', dates: '', location: '', on: [], more: v('c-idea')
        })
      }).then(function (r) {
        if (!r.ok) console.error('[collab] not recorded (' + r.status + ') — the WhatsApp message still carries it');
      }, function () {
        console.error('[collab] not recorded — the WhatsApp message still carries it');
      });
    } catch (x) {}
  }
});
