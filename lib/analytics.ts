/* GA4 helpers.

   Env-guarded: without NEXT_PUBLIC_GA_ID nothing is injected and every call
   here is a no-op, so the site runs identically with no analytics account.
   Never send application answers, names, emails or phone numbers to GA —
   that is personal data and it does not belong in an analytics property. */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

export function pageview(path: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !GA_ID) return;
  window.gtag("config", GA_ID, { page_path: path });
}

/* The events that matter. Named as constants so a typo cannot silently
   create a second, empty funnel in the GA4 property.

   Mark these as key events (conversions) in GA4 → Admin → Events:
     application_lodged  — the real conversion
     apply_start         — the application overlay was opened
     apply_step_2        — step 1 passed validation; the halfway mark
     apply_failed        — the submit was attempted and did not land
     payment_initiated   — Razorpay Checkout actually opened
     contact_click       — an email link was used
     whatsapp_click      — a WhatsApp link was used

   Between apply_start, apply_step_2 and application_lodged you can see
   where people give up. Params carry the departure code and the surface
   the CTA was on — never an answer, a name, an email or a phone. */
export const EVENTS = {
  applyStart: "apply_start",
  applyStep2: "apply_step_2",
  applyFailed: "apply_failed",
  paymentInitiated: "payment_initiated",
  applicationLodged: "application_lodged",
  contactClick: "contact_click",
  whatsappClick: "whatsapp_click",
} as const;
