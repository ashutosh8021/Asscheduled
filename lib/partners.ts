/* Partner referral links and the discount they carry.
 *
 * A festival links to us from their own site with `?p=<code>`. Anyone
 * arriving that way gets a flat discount on the departures the partner
 * covers, applied without them doing anything and without them being
 * able to change it.
 *
 * The thing that makes that true is not in this file's data but in how
 * it is used: `resolvePartner` is called by the page (to show a price)
 * AND by the apply route (to charge one), and the browser never sends
 * an amount. A discount decided in the browser is not a discount —
 * anyone could claim it by editing the URL or the DOM.
 *
 * Config lives here rather than in the database on purpose: it is
 * version-controlled, it needs no round trip to resolve, and a partner
 * deal is a thing you agree once and then honour, not a thing that
 * changes hourly.
 */

export interface Partner {
  /** What appears in the link: /somewhere/…?p=pulse */
  code: string;
  /** Shown to the applicant, so they know why the price dropped. */
  name: string;
  /** Departure ids this covers. A code for one fest must not discount another. */
  departures: string[];
  /** Flat rupees off. Not a percentage — a range priced 8,799–12,799
   *  would otherwise discount by different amounts at each tier, which
   *  is harder to explain and harder to reconcile. */
  discountInr: number;
  /** ISO date. After this the link still opens the page; it just stops
   *  discounting. An expiry needs no counter and has no race. */
  validUntil: string;
}

/* ------------------------------------------------------------------
   TODO(mannat): these three numbers are placeholders and the feature
   is deliberately inert until they are real.

   PARTNERS is empty, so `resolvePartner` returns null for every code,
   every price shows in full, and nothing about the live site changes.
   Fill in the entry below — discount, expiry — and it switches on.

   Needed:
     • discountInr — flat ₹ off PULSE
     • validUntil  — the date the link stops discounting
   ------------------------------------------------------------------ */
export const PARTNERS: Partner[] = [
  // {
  //   code: "pulse",
  //   name: "PULSE, AIIMS New Delhi",
  //   departures: ["PUL-26"],
  //   discountInr: 0,            // TODO(mannat)
  //   validUntil: "2026-09-16",  // TODO(mannat)
  // },
];

/** Look a code up. Case and whitespace are forgiving; a link gets typed
 *  by hand more often than anyone expects. */
export function findPartner(code: string | null | undefined): Partner | null {
  if (!code) return null;
  const want = code.trim().toLowerCase();
  return PARTNERS.find((p) => p.code === want) ?? null;
}

/**
 * The partner actually in force for a given departure, right now.
 *
 * Null for: no code, an unknown code, an expired one, or a code that
 * does not cover this departure. Every one of those means full price
 * rather than an error — somebody arriving on a stale link should see
 * a working page, not a failure.
 *
 * Both the page and the apply route call this. That is deliberate:
 * one function means the price shown and the price charged cannot
 * drift apart.
 */
export function resolvePartner(
  code: string | null | undefined,
  departureCode: string,
  now: Date = new Date()
): Partner | null {
  const partner = findPartner(code);
  if (!partner) return null;
  if (!partner.departures.includes(departureCode)) return null;

  /* End of the day in IST, so a link valid "until the 16th" works all
     of the 16th rather than expiring at midnight UTC — which is 05:30
     on the 16th in India, and would surprise everyone. */
  const expires = new Date(`${partner.validUntil}T23:59:59+05:30`);
  if (Number.isNaN(expires.getTime()) || now > expires) return null;

  return partner;
}

export interface EffectivePrice {
  /** What to charge, after any discount. Never below zero. */
  price: number;
  /** Upper bound of a tiered departure, discounted by the same amount. */
  priceMax?: number;
  /** The original, for striking through. Undefined when nothing applies. */
  wasPrice?: number;
  wasPriceMax?: number;
  discountInr: number;
  partnerName?: string;
}

/**
 * Apply a partner to a departure's pricing.
 *
 * Takes the numbers rather than the whole departure so the apply route
 * can use it without importing the UI's idea of a departure, and so it
 * is trivially testable.
 */
export function effectivePrice(
  price: number,
  priceMax: number | undefined,
  partner: Partner | null
): EffectivePrice {
  if (!partner || partner.discountInr <= 0) {
    return { price, priceMax, discountInr: 0 };
  }

  /* Clamped at zero. A discount larger than the price is a
     configuration mistake, not a reason to owe somebody money. */
  const off = Math.min(partner.discountInr, price);

  return {
    price: price - off,
    priceMax: priceMax === undefined ? undefined : Math.max(0, priceMax - off),
    wasPrice: price,
    wasPriceMax: priceMax,
    discountInr: off,
    partnerName: partner.name,
  };
}

/** Cookie the middleware sets from `?p=`. Read server-side only. */
export const PARTNER_COOKIE = "as_partner";

/** How long a referral is remembered. Long enough to think it over,
 *  short enough that it does not outlive the season. */
export const PARTNER_COOKIE_DAYS = 30;
