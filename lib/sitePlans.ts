/* The public site's plans and coupons, server-side.
 *
 * A deliberate second copy of site/src/scripts/config.js. The browser's
 * copy draws the prices on screen; this one decides what gets recorded.
 * The booking form sends a plan id and nothing else about money — a
 * price in a request body is a number the sender chose, and the one
 * thing a booking must never take from the client is what it cost.
 *
 * Keep the two in step. If they drift, THIS is the one that is true,
 * and the mismatch shows up as a figure in the admin that does not match
 * what the applicant saw — so change both together, in one commit.
 *
 * Mirrors site/src/scripts/config.js (AS.plans, AS.coupons) and the
 * maths in site/src/scripts/features/coupons.js (priceOf). */

export interface SitePlan {
  /** Which fest, as a departure code the admin already understands. */
  departure: string;
  /** What the applicant saw on the card. */
  label: string;
  trip: string;
  where: string;
  when: string;
  inr: number;
  /** Share taken at booking. 0.3 on the Season 02 fests; 1 on Spring
   *  Fest, which the brochure sells as paid in full at booking. */
  deposit: number;
  /** null where no coupon runs on that trip — Spring Fest's ₹4,999 and
   *  ₹7,999 are already the early-bird prices, so nothing comes off. */
  coupon: "hal" | "mi" | null;
}

export interface SiteCoupon {
  code: string;
  off: number;
  /** Lowered by hand as paid bookings come in. At 0 the coupon is gone
   *  and full prices apply — same rule as the site's own copy. */
  left: number;
}

export const SITE_COUPONS: Record<string, SiteCoupon> = {
  hal: { code: "SAYYES", off: 1000, left: 15 },
  mi: { code: "SAYYES", off: 1000, left: 15 },
};

/* HAL-26 is a real departure in lib/departures.ts. MI-26 is not: Mood
   Indigo is sold on the new site and has no entry there yet, so the
   admin shows the raw code rather than a name, and nothing is mirrored
   to a festival's sheet. Both are fine — departure_code is free text on
   purpose (see docs/schema-somewhere.sql) — but it is why an MI booking
   has no filter tab of its own in the admin yet. */
export const SITE_PLANS: Record<string, SitePlan> = {
  hal5: {
    departure: "HAL-26",
    label: "Hallucia · 5 days, 4 nights",
    trip: "Hallucia'26",
    where: "AIIMS Nagpur",
    when: "25 Nov → 29 Nov",
    inr: 9999,
    deposit: 0.3,
    coupon: "hal",
  },
  hal7: {
    departure: "HAL-26",
    label: "Hallucia × Pachmarhi · 7 days",
    trip: "Hallucia'26",
    where: "AIIMS Nagpur + Pachmarhi",
    when: "25 Nov onwards",
    inr: 14999,
    deposit: 0.3,
    coupon: "hal",
  },
  mi4: {
    departure: "MI-26",
    label: "Mood Indigo · 4 days, 3 nights",
    trip: "Mood Indigo'26",
    where: "IIT Bombay, Mumbai",
    when: "December",
    inr: 8499,
    deposit: 0.3,
    coupon: "mi",
  },
  mi6: {
    departure: "MI-26",
    label: "Mumbai + Mood Indigo · 6 days, 5 nights",
    trip: "Mood Indigo'26",
    where: "IIT Bombay, Mumbai",
    when: "December",
    inr: 11499,
    deposit: 0.3,
    coupon: "mi",
  },
  /* Spring Fest 2027, IIT Kharagpur. Two differences from every plan
     above, both taken from the brochures in asset/iit kgp/ and both
     deliberate:

     deposit is 1 — "Your booking is confirmed after payment and
     confirmation from us." The brochure sells the whole fare at
     booking, not 30% of it, so the apply page quotes the full amount
     and the balance row falls away.

     coupon is null — ₹4,999 and ₹7,999 ARE the early-bird prices, for
     the first 50 registrations. Stacking SAYYES on top would discount a
     discount nobody authorised. */
  sf5: {
    departure: "SF-27",
    label: "Spring Fest · 5 days, 4 nights",
    trip: "Spring Fest 2027",
    where: "IIT Kharagpur",
    when: "21 Jan → 25 Jan",
    inr: 4999,
    deposit: 1,
    coupon: null,
  },
  sf6: {
    departure: "SF-27",
    label: "Spring Fest + Ocean · 6 days, 5 nights",
    trip: "Spring Fest 2027",
    where: "IIT Kharagpur + Mandarmani",
    when: "21 Jan → 26 Jan",
    inr: 7999,
    deposit: 1,
    coupon: null,
  },
};

export interface SiteQuote {
  base: number;
  off: number;
  /** What the package costs after the coupon. */
  pay: number;
  /** Taken now: the plan's share of `pay`, rounded to the nearest ₹10. */
  deposit: number;
  couponCode: string | null;
}

/**
 * What a plan costs, by the same arithmetic the page used.
 *
 * Deliberately identical to priceOf() in
 * site/src/scripts/features/coupons.js, including the rounding: the
 * deposit is the plan's share of the price AFTER the coupon, rounded to
 * the nearest ten rupees. A different rounding here would quote the
 * applicant one figure and record another.
 */
export function quoteFor(plan: SitePlan): SiteQuote {
  const coupon = plan.coupon ? SITE_COUPONS[plan.coupon] : undefined;
  const live = coupon && coupon.left > 0 ? coupon : null;
  const off = live ? live.off : 0;
  const pay = plan.inr - off;

  return {
    base: plan.inr,
    off,
    pay,
    /* Rounding to the nearest ₹10 is for a part payment, where ₹3,000
       reads better than ₹2,999.70. A plan paid in full is not rounded:
       ₹4,999 would otherwise be quoted, charged and recorded as
       ₹5,000, and the applicant would be ₹1 short of their own fare. */
    deposit: plan.deposit >= 1 ? pay : Math.round((pay * plan.deposit) / 10) * 10,
    couponCode: live ? live.code : null,
  };
}

/** A plan id from the form, or null. Unknown ids resolve to nothing
 *  rather than to somebody else's price. */
export function findSitePlan(id: string | null | undefined): SitePlan | null {
  if (!id) return null;
  return Object.prototype.hasOwnProperty.call(SITE_PLANS, id) ? SITE_PLANS[id] : null;
}
