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
  /** Share taken at booking. 0.3 on every plan. */
  deposit: number;
  coupon: "hal" | "mi";
}

export interface SiteCoupon {
  code: string;
  off: number;
  /** Lowered by hand as paid bookings come in. At 0 the coupon is gone
   *  and full prices apply — same rule as the site's own copy. */
  left: number;
}

export const SITE_COUPONS: Record<string, SiteCoupon> = {
  hal: { code: "SAYYES", off: 500, left: 50 },
  mi: { code: "SAYYES", off: 1000, left: 50 },
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
    inr: 8999,
    deposit: 0.3,
    coupon: "hal",
  },
  hal7: {
    departure: "HAL-26",
    label: "Hallucia × Pachmarhi · 7 days",
    trip: "Hallucia'26",
    where: "AIIMS Nagpur + Pachmarhi",
    when: "25 Nov onwards",
    inr: 12999,
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
};

export interface SiteQuote {
  base: number;
  off: number;
  /** What the package costs after the coupon. */
  pay: number;
  /** Taken now. 30%, rounded to the nearest ₹10. */
  deposit: number;
  couponCode: string | null;
}

/**
 * What a plan costs, by the same arithmetic the page used.
 *
 * Deliberately identical to priceOf() in
 * site/src/scripts/features/coupons.js, including the rounding: the
 * deposit is 30% of the price AFTER the coupon, rounded to the nearest
 * ten rupees. A different rounding here would quote the applicant one
 * figure and record another.
 */
export function quoteFor(plan: SitePlan): SiteQuote {
  const coupon = SITE_COUPONS[plan.coupon];
  const live = coupon && coupon.left > 0 ? coupon : null;
  const off = live ? live.off : 0;
  const pay = plan.inr - off;

  return {
    base: plan.inr,
    off,
    pay,
    deposit: Math.round((pay * plan.deposit) / 10) * 10,
    couponCode: live ? live.code : null,
  };
}

/** A plan id from the form, or null. Unknown ids resolve to nothing
 *  rather than to somebody else's price. */
export function findSitePlan(id: string | null | undefined): SitePlan | null {
  if (!id) return null;
  return Object.prototype.hasOwnProperty.call(SITE_PLANS, id) ? SITE_PLANS[id] : null;
}
