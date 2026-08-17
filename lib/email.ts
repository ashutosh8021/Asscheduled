/* Transactional mail via the Resend REST API.

   Bureaucratic voice — this is paperwork, not marketing. Every send is a
   no-op returning false when RESEND_API_KEY / RESEND_FROM are absent, so a
   missing mail account never fails an application. Server-only. */

import { resendConfig } from "./env";
import { getTrip } from "./trips";

const ENDPOINT = "https://api.resend.com/emails";

async function send(to: string, subject: string, text: string): Promise<boolean> {
  const cfg = resendConfig();
  if (!cfg) return false;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      from: cfg.from,
      to: [to],
      subject,
      text,
      /* Plain text only, on purpose: the brand is paperwork, and a text part
         alone lands in the inbox rather than the promotions tab. */
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Resend send failed (${res.status}): ${await res.text()}`);
    return false;
  }
  return true;
}

/** Sent once the ₹500 clears and the file is lodged. */
export async function sendLodgedEmail(opts: {
  to: string;
  name: string;
  tripCode: string;
  reference: string;
}): Promise<boolean> {
  const trip = getTrip(opts.tripCode);
  const where = trip ? `${trip.fest}, ${trip.campus}` : opts.tripCode;

  const text = [
    `FORM 7A — APPLICATION FOR SELECTION`,
    `STATUS: LODGED`,
    `REFERENCE: ${opts.reference}`,
    `DEPARTURE: ${opts.tripCode} — ${where}`,
    ``,
    `${opts.name},`,
    ``,
    `Your application is filed and the ₹500 registration has cleared.`,
    `The fee is non-refundable. It is not a deposit and it does not come off`,
    `the trip fee if you are selected.`,
    ``,
    `WHAT HAPPENS NEXT`,
    `1. A human reads all nine answers. No algorithm.`,
    `2. A decision reaches this address within 72 hours of the application`,
    `   window closing. Selected or not selected. There is no third outcome.`,
    `3. If selected, a 48-hour payment window opens for the trip fee, payable`,
    `   in full. Then: one WhatsApp group, one boarding hub, six days.`,
    ``,
    `Nothing is required from you until then. Do not reply to this address`,
    `to ask for an update — the date above is the date.`,
    ``,
    `AS SCHEDULED®`,
    `ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · India`,
  ].join("\n");

  return send(opts.to, `LODGED — ${opts.reference} · Form 7A`, text);
}
