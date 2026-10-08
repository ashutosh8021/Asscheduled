/* config.js — carried across verbatim from
   source-site/assets/js/site.js lines 5-33.

   The maths, constants, thresholds and timings are the original's.
   Everything the block declared at the IIFE's top level is exported,
   because that is exactly what another block could reach for; what this
   one reaches for is imported above. The work runs on import, and
   src/scripts/site.js imports every module in the original's order. */

/* ===================== CONFIG ===================== */
export var AS = window.AS = Object.assign({
  whatsapp: '917853022360',                       // WhatsApp number that receives bookings, digits only
  upi: { id: 'singhmannat936@okicici', name: 'Mannat singh chimni' }, // where booking amounts are paid (same as the QR in assets/brand/payment-qr.png)
  phones: ['+91 78530 22360', '+91 89692 14005'],
  email: 'info@asscheduled.com',
  instagram: 'https://www.instagram.com/go.asscheduled/',
  /* Where a booking goes the moment somebody presses Lock it, before any
     money moves. This app's own route: it records the booking so it shows
     in the admin panel straight away, and hands back a token that the
     payment screenshot is then uploaded against.
     See app/api/site/booking/route.ts. */
  applyEndpoint: '/api/site/booking',
  /* Where that screenshot goes, carrying the token. */
  uploadEndpoint: '/api/documents/upload',
  /* The footer newsletter. Writes to the subscribers table and shows in
     the admin. */
  newsletterEndpoint: '/api/somewhere/subscribe',
  /* The collab form on the contact page. Writes to the collaborations
     table, which is the admin's COLLABS tab. The WhatsApp hand-off below
     it is unchanged — this is in addition, not instead, so a festival
     that fills the form and never presses the button is still reachable. */
  collabEndpoint: '/api/somewhere/collab',
  /* COUPONS, applied automatically on the booking page.
     left = how many bookings the coupon is still valid for. Lower it by one each time you confirm a paid booking
     that used it (the WhatsApp message says when it did). At 0 the coupon disappears and full prices show. */
  coupons: {
    hal: { code: 'SAYYES', off: 500, left: 50, name: 'Hallucia' },
    mi:  { code: 'SAYYES', off: 1000, left: 50, name: 'Mood Indigo' }
  },
  couponEndpoint: '',     // optional: URL that returns {"hal": 49, "mi": 47}, the live count, once the site is on your own domain
  plans: {
    hal5: { trip: 'Hallucia’26', short: 'Hallucia', plan: 'Hallucia · 5 days, 4 nights', where: 'AIIMS Nagpur', to: 'Nagpur', code: 'NAG', dcode: '25 NOV 26', board: '05:40', when: '25 Nov → 29 Nov', price: 8999, deposit: 0.3, coupon: 'hal',
            travel: 'Travel from your city is included, your exact fare depends on your state and we confirm it before you pay' },
    hal7: { trip: 'Hallucia’26', short: 'Hallucia × Pachmarhi', plan: 'Hallucia × Pachmarhi · 7 days', where: 'AIIMS Nagpur + Pachmarhi', to: 'Nagpur', code: 'NAG', dcode: '25 NOV 26', board: '05:40', when: '25 Nov onwards', price: 12999, deposit: 0.3, coupon: 'hal',
            travel: 'Travel from your city is included, your exact fare depends on your state and we confirm it before you pay' },
    mi4:  { trip: 'Mood Indigo’26', short: 'Mood Indigo', plan: 'Mood Indigo · 4 days, 3 nights', where: 'IIT Bombay, Mumbai', to: 'Mumbai', code: 'BOM', dcode: 'DEC 26', board: 'TBC', when: 'December', price: 8499, deposit: 0.3, coupon: 'mi',
            travel: 'Plus your train or flight to Mumbai, balance due within 30 days before the fest' },
    mi6:  { trip: 'Mood Indigo’26', short: 'Mumbai + Mood Indigo', plan: 'Mumbai + Mood Indigo · 6 days, 5 nights', where: 'IIT Bombay, Mumbai', to: 'Mumbai', code: 'BOM', dcode: 'DEC 26', board: 'TBC', when: 'December', price: 11499, deposit: 0.3, coupon: 'mi',
            travel: 'Plus your train or flight to Mumbai, balance due within 30 days before the fest' }
  }
}, window.AS || {});
