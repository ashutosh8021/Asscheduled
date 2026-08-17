/* FAQ content — single source for both the rendered page and the FAQPage
   JSON-LD, so the two can never disagree (Google treats a mismatch as a
   structured-data violation).

   Every answer here is grounded in existing approved copy: the legal panes in
   components/legal/LegalContent.tsx, the Form 7A timeline, and lib/trips.ts.
   Answers are plain text because schema.org acceptedAnswer must be text. */

import type { FaqItem } from "./schema";

export const FAQS: FaqItem[] = [
  {
    q: "Why apply instead of book?",
    a: "Nineteen seats only work if the nineteen fit together. Booking fills buses; selection builds trips. We read every application, pick the group, and give no reasons for rejections. No appeals either. It keeps things honest.",
  },
  {
    q: "When do I hear back?",
    a: "Within 72 hours of the application window closing for your departure. The decision arrives by email: selected or not selected. There is no third outcome and no waiting list you are left guessing about. You do not need to follow up, and following up does not move you up.",
  },
  {
    q: "What happens to my ₹500?",
    a: "It pays for the reading. A human works through every answer, and the fee covers that work. It is not a deposit. If you are not selected it does not come back. If you are selected it does not come off your trip fee either. Apply only if ₹500 for a fair reading is a price you are fine paying.",
  },
  {
    q: "What is actually included?",
    a: "Intercity travel from your boarding hub, both ways. Fest tickets. Five nights verified twin-share stay. All meals, three a day. Every transfer. Director plus Trip Captain on the ground, first-aid and SOS protocol. You bring yourself, a bag, and ID. Full lists sit inside each departure file.",
  },
  {
    q: "How do I pay if selected?",
    a: "A 48-hour window opens after your selection email. Full payment or a 50/50 split, with the second half due 21 days before departure. UPI, cards and netbanking through Razorpay. Miss the window and the seat moves to the waitlist.",
  },
  {
    q: "Who can apply?",
    a: "18 to 26 years old, college students or recent graduates. Any college, any city, any course. A valid college ID or degree helps your file; a good answer to question four helps it more.",
  },
  {
    q: "I would be coming alone. Is that strange?",
    a: "Most of the nineteen come solo. That is the design. If you already had the group, you would not need us.",
  },
  {
    q: "Who is running this on the ground?",
    a: "Every departure carries the Director and one dedicated Trip Captain — nineteen travellers, two crew. Verified stays, a written emergency protocol, a guardian contact on file for every seat, and a captain whose entire job is making the schedule survive contact with reality.",
  },
  {
    q: "Where do departures leave from?",
    a: "Boarding hubs are confirmed with your selection email, not before. Intercity travel from that hub is included both ways in the trip fee.",
  },
  {
    q: "What if I drop out after selection?",
    a: "Trip fee refunds run by slab: more than 30 days before departure, 80 per cent. Between 15 and 30 days, 50 per cent. Under 15 days, nothing, because the seat is already yours and would travel empty. The ₹500 application fee is never part of any refund.",
  },
  {
    q: "What if the fest is cancelled or moves?",
    a: "The departure moves with it. You choose: travel on the new dates, transfer to any open departure, or take a full refund of the trip fee. The ₹500 application fee is not included in that refund.",
  },
  {
    q: "What does “evenings sealed until departure” mean?",
    a: "Some evenings in the published schedule are deliberately left unannounced until the trip begins. It is a design decision, not an omission. Everything sealed is planned in the same detail as everything published.",
  },
];
