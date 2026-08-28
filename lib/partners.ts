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
  /** What appears in the link: /somewhere/…?p=pulse2026
   *  Lower case — findPartner folds the incoming value, so the link
   *  can be written in caps without breaking. */
  code: string;
  /** The coupon as the applicant sees it: "PULSE2026". Shown applied
   *  and not editable — there is no field to type it into, because a
   *  code the browser can supply is a discount the browser can invent. */
  coupon: string;
  /** Shown to the applicant, so they know why the price dropped. */
  name: string;
  /**
   * Where to also send the application, beyond our own inbox.
   *
   * A partner running the festival needs to know who is coming. This
   * is a disclosure to a third party, so it applies ONLY to people who
   * arrived on the partner's own link — somebody who found us on their
   * own and applied to the same departure is not shared with anyone.
   */
  notify?: string;
  /** Departure ids this covers. A code for one fest must not discount another. */
  departures: string[];
  /** Flat rupees off. Not a percentage — a range priced 8,799–12,799
   *  would otherwise discount by different amounts at each tier, which
   *  is harder to explain and harder to reconcile. */
  discountInr: number;
  /** ISO date. After this the link still opens the page; it just stops
   *  discounting. An expiry needs no counter and has no race. */
  validUntil: string;

  /**
   * Applies to everyone on the departure, with or without a referral.
   *
   * PULSE is this: the arrangement is with the festival, and everybody
   * going to the festival is covered by it, however they found us.
   * There is nothing to arrive on and nothing to miss out on.
   *
   * A partner without this is referral-only — the cookie the
   * middleware sets from `?p=` is what turns it on, and somebody who
   * found us independently pays the list price.
   */
  auto?: boolean;
}

/* ------------------------------------------------------------------
   PULSE'26 — AIIMS New Delhi.

   Everyone applying to PULSE gets PULSE2026: ₹1,000 off, applied
   automatically, no field to type it into and no link to arrive on.
   The arrangement is with the festival, so it covers everybody going
   to the festival however they found us — which is what `auto` says.

   ⚠️ TODO(mannat): the ₹1,000 is funded by ₹1,000 added to both fare
   tables in lib/packages.ts. That made sense while the coupon was
   referral-only, because the list price was then a real price that
   real people paid. Now that it applies to everyone, nobody is ever
   charged the list price — so the struck-through figure on the card
   is a number no applicant will ever pay. Either drop the ₹1,000 from
   both tables and retire the coupon, or keep the coupon as branding
   and stop showing a "was" price. See the note in lib/packages.ts.
   ------------------------------------------------------------------ */
export const PARTNERS: Partner[] = [
  {
    code: "pulse2026",
    coupon: "PULSE2026",
    name: "PULSE, AIIMS New Delhi",
    departures: ["PUL-26"],
    discountInr: 1000,
    /* TODO(mannat): confirm. Set to the day before the trip starts,
       so the link stops discounting once there is nothing left to
       apply for. Move it earlier if applications close sooner. */
    validUntil: "2026-09-16",
    notify: "studentsunion@aiims.edu",
    auto: true,
  },
];

/**
 * The partner in force for a departure, for a given visitor.
 *
 * Two ways one applies, and this is the single place that decides:
 *
 *   • automatic — the arrangement covers the whole departure, so
 *     everybody gets it and no link is involved;
 *   • referral — only somebody carrying the partner's code, from the
 *     cookie the middleware set.
 *
 * Everything calls this: the page that shows a price, the endpoint the
 * form asks, and the route that records what is owed. One function, so
 * the price quoted and the price charged cannot come apart.
 */
export function partnerFor(
  departureCode: string,
  code?: string | null,
  now: Date = new Date()
): Partner | null {
  /* Automatic first. It needs nothing from the visitor, so it cannot
     be missed by somebody who cleared their cookies or arrived on a
     plain link. */
  const automatic = PARTNERS.find(
    (p) => p.auto && p.departures.includes(departureCode) && !expired(p, now)
  );
  if (automatic) return automatic;

  return resolvePartner(code, departureCode, now);
}

/** End of the day in IST, so a code valid "until the 16th" works all of
 *  the 16th rather than expiring at 05:30 that morning. */
function expired(partner: Partner, now: Date): boolean {
  const at = new Date(`${partner.validUntil}T23:59:59+05:30`);
  return Number.isNaN(at.getTime()) || now > at;
}

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
  if (expired(partner, now)) return null;

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
