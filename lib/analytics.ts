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
     application_lodged  — the real conversion; fires on /apply/thank-you
     payment_initiated   — Razorpay Checkout actually opened
     apply_start         — Form 7A opened from any CTA
     contact_click       — an email link was used
     whatsapp_click      — a WhatsApp link was used */
export const EVENTS = {
  applyStart: "apply_start",
  paymentInitiated: "payment_initiated",
  applicationLodged: "application_lodged",
  contactClick: "contact_click",
  whatsappClick: "whatsapp_click",
} as const;
