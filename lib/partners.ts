/* Coupons, and the three ways one reaches an applicant.
 *
 * A festival links to us with `?p=<code>` and the middleware remembers
 * it; an arrangement can cover a whole departure automatically; or
 * somebody types a code into the form, which is how an influencer's
 * own code reaches the people they send.
 *
 * All three are the same thing here, and the safety property is not
 * "there is no field to type into" — it is that the browser sends a
 * CODE and never an AMOUNT. `partnerFor` is called by the page (to
 * show a price) AND by the apply route (to record one), and the route
 * resolves the code again from scratch. A discount the browser could
 * price is a discount it could invent: post `discountInr: 99999` and
 * nothing happens, because nothing reads it.
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
  /** The coupon as the applicant sees it: "PULSE2026".
   *
   *  This is what somebody types into the coupon field, and it is the
   *  only thing they may type: the browser sends a code, never an
   *  amount, and the server looks the amount up here. A code the
   *  browser could price itself would be a discount it could invent.
   *
   *  Treat a code as public the moment it is given to anybody. There
   *  is no per-person check — whoever knows it can use it, which is
   *  what a coupon is. Retire one by moving `validUntil` into the
   *  past rather than by hoping it stays secret. */
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

  /**
   * Safe to print on the page as a one-tap offer.
   *
   * Only for codes that everybody is entitled to anyway. A listed code
   * is a code you are giving to every visitor, so listing a private
   * one — an influencer's, say — hands their discount to people who
   * never went near them and turns it into a price cut we did not
   * decide to make.
   *
   * The default is therefore off. A code is private unless somebody
   * says otherwise here.
   */
  listed?: boolean;
}

/* ------------------------------------------------------------------
   PULSE'26 — AIIMS New Delhi.

   Everyone applying to PULSE gets PULSE2026: ₹1,000 off, applied
   automatically, with nothing to type and no link to arrive on.
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
    /* Everybody applying to PULSE gets this, so there is nothing to
       protect: showing it is only telling people what they already
       have. It is listed so the form can offer it as a tap, which is
       what an offer looks like everywhere else people shop. */
    listed: true,
  },

  /* ----------------------------------------------------------------
     MANSA11 — an influencer's own code, typed in by the people they
     send. Not automatic and not on a link: somebody has to know it.

     ₹1,100, which is more than PULSE2026's ₹1,000. That is the point
     of it, and it is why partnerFor takes the best code rather than
     the first — entering this has to be worth doing, and forgetting
     it must never cost somebody the ₹1,000 they were entitled to
     anyway.

     No `notify`: PULSE is told who is coming because PULSE runs the
     festival and needs the list. An influencer is not owed anybody's
     phone number, so this shares nothing.
     ---------------------------------------------------------------- */
  {
    code: "mansa11",
    coupon: "MANSA11",
    /* TODO(mannat): shown to the applicant as "— <name>", so it should
       say whose code it is. Left generic rather than guessing at a
       real person's name. */
    name: "Referral coupon",
    departures: ["PUL-26"],
    discountInr: 1100,
    /* Same last day as PULSE2026 — there is nothing to apply for after
       it, so a code that outlived it could only confuse. */
    validUntil: "2026-09-16",
    /* Not listed, and this is the whole point of the code. It is worth
       more than the automatic one, so printing it on the page would
       give ₹1,100 to everybody and leave the influencer sending people
       to a discount they could have had anyway. It has to be told to
       somebody to be worth anything. */
    listed: false,
  },
];

/**
 * The partner in force for a departure, for a given visitor.
 *
 * Three ways one applies, and this is the single place that decides:
 *
 *   • automatic — the arrangement covers the whole departure, so
 *     everybody gets it and no code is involved;
 *   • referral — somebody carrying a partner's code in the cookie the
 *     middleware set from `?p=`;
 *   • typed — somebody who entered a coupon in the form.
 *
 * The best of them wins, never the first. Two consequences, both
 * wanted: entering a code can only ever help, so nobody is punished
 * for typing one; and nobody loses the discount they already had by
 * typing a worse one. They do not stack — one coupon, like everywhere
 * else — and clamping to the best is what makes "does this stack?"
 * a question nobody has to ask.
 *
 * Everything calls this: the page that shows a price, the endpoint the
 * form asks, and the route that records what is owed. One function, so
 * the price quoted and the price charged cannot come apart.
 */
export function partnerFor(
  departureCode: string,
  code?: string | null,
  typed?: string | null,
  now: Date = new Date()
): Partner | null {
  /* Automatic needs nothing from the visitor, so it cannot be missed
     by somebody who cleared their cookies or arrived on a plain link. */
  const automatic =
    PARTNERS.find((p) => p.auto && p.departures.includes(departureCode) && !expired(p, now)) ??
    null;

  const candidates = [
    automatic,
    resolvePartner(code, departureCode, now),
    resolvePartner(typed, departureCode, now),
  ].filter((p): p is Partner => p !== null);

  if (candidates.length === 0) return null;

  return candidates.reduce((best, p) => (p.discountInr > best.discountInr ? p : best));
}

/** One offer as the form prints it. A code and what it is worth —
 *  never enough to price anything, which is still the server's job. */
export interface Offer {
  coupon: string;
  name: string;
  discountInr: number;
}

/**
 * The coupons a departure may show on the page, for tapping.
 *
 * Only `listed` ones, and only while they are in date. Everything
 * else — an influencer's code, a partner's referral link — is private
 * by default and never appears here, which is what stops the form from
 * quietly handing out the best discount on the board.
 *
 * Display only. Tapping one just fills the field: the code still goes
 * to the server to be priced, exactly as if it had been typed.
 */
export function listedOffers(departureCode: string, now: Date = new Date()): Offer[] {
  return PARTNERS.filter(
    (p) => p.listed && p.departures.includes(departureCode) && !expired(p, now)
  ).map((p) => ({ coupon: p.coupon, name: p.name, discountInr: p.discountInr }));
}

/**
 * Who else to send an application to, for a departure.
 *
 * Deliberately NOT "whoever priced it". A festival is told who is
 * coming because it runs the festival and has to admit them — that is
 * a fact about the departure, not about which coupon happened to win.
 *
 * Getting this wrong is easy and quiet: when coupons became typeable,
 * reading `notify` off the winning partner alone meant anyone using an
 * influencer code vanished from the festival's list, because that
 * coupon has no `notify` of its own. Nothing would have failed. The
 * festival would simply have been short a few names on the door.
 *
 * So: the automatic arrangement always notifies, plus the referral in
 * force if it carries one of its own. Deduplicated, because a partner
 * that is both should still only be mailed once.
 */
export function notifyFor(
  departureCode: string,
  inForce: Partner | null,
  now: Date = new Date()
): string[] {
  const out = new Set<string>();

  for (const p of PARTNERS) {
    if (p.auto && p.notify && p.departures.includes(departureCode) && !expired(p, now)) {
      out.add(p.notify);
    }
  }

  if (inForce?.notify && inForce.departures.includes(departureCode) && !expired(inForce, now)) {
    out.add(inForce.notify);
  }

  return [...out];
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
