/* Plans, and what each one costs from each state.
 *
 * A departure can be sold as more than one package — the same festival,
 * different amounts of trip around it. PULSE has two: the fest itself,
 * and the fest with two days of Delhi on the end.
 *
 * The fare is per state because the train is: getting somebody to Delhi
 * from Gurugram and from Kohima are not the same cost, and quoting one
 * price for both means either overcharging the near ones or eating the
 * difference on the far ones.
 *
 * ---------------------------------------------------------------
 * This file is the only place a fare is written down.
 *
 * The browser reads it to SHOW a price. The apply route reads it to
 * RECORD one, from the state and plan the applicant chose, never from
 * an amount the browser sends. Same table, same function, so what is
 * quoted and what is owed cannot drift apart. See lib/partners.ts for
 * the same argument about discounts.
 * ---------------------------------------------------------------
 */

/* A type-only reference to the form's state list. Nothing is imported
   at runtime — this exists so that a fare written against "Himachal"
   or "Orissa" fails `pnpm typecheck` instead of silently never
   matching anybody's selection. */
type StateName = (typeof import("./copy").STATES)[number];

/** A fare table. Partial: not every state is priced yet. */
export type Fares = Partial<Record<StateName, number>>;

export interface Plan {
  /** Stored on the application and posted by the form. Never a price. */
  id: string;
  /** "PLAN 01" — the label on the card. */
  n: string;
  /** "THE FESTIVAL" */
  name: string;
  /** One line under the name, in the editorial voice. */
  blurb: string;
  /** What the fare covers, as the card lists it. */
  includes: string[];
  fares: Fares;
}

/* ------------------------------------------------------------------
   PULSE'26 — AIIMS New Delhi
   Fares supplied by Mannat, 2026-08-28, plus ₹1,000.

   The ₹1,000 funds the PULSE2026 coupon in lib/partners.ts.

   ⚠️ TODO(mannat): that coupon is now automatic for everybody applying
   to PULSE, not just people arriving on a referral link. So every
   single applicant pays the supplied figure and NOBODY pays the list
   price below — which makes the struck-through number on the card a
   price that does not exist.

   Two honest ways out, and either is a small change:
     • drop the ₹1,000 here and retire the coupon — same money, one
       less step, nothing to explain;
     • keep the coupon for the partnership optics, but stop rendering
       the "was" figure, so no false saving is claimed.

   The two plans differ by a flat ₹3,800 in every single state, which
   is what says the train is the same in both: a one-way/round-trip
   difference would grow with distance, and this does not. Plan 02 is
   the Delhi tour added to Plan 01, nothing else.

   TODO(mannat): eleven states and union territories have no fare —
   Kerala, Tamil Nadu, Tripura, Delhi, Jammu and Kashmir, Ladakh,
   Puducherry, Chandigarh, Andaman and Nicobar Islands, Lakshadweep,
   and Dadra and Nagar Haveli and Daman and Diu. Somebody from one of
   those can still apply; they are told we will confirm their fare
   rather than shown a number we have not set. Send them and they
   go live with no code change.
   ------------------------------------------------------------------ */

const PULSE_FESTIVAL: Fares = {
  Haryana: 10679,
  Punjab: 10679,
  "Himachal Pradesh": 10779,
  Uttarakhand: 10979,
  "Uttar Pradesh": 10979,
  Rajasthan: 11179,
  "Madhya Pradesh": 11579,
  Chhattisgarh: 11979,
  Jharkhand: 12079,
  Maharashtra: 12179,
  Bihar: 12279,
  "West Bengal": 12279,
  Sikkim: 12379,
  Gujarat: 12579,
  Telangana: 12579,
  "Andhra Pradesh": 12579,
  Odisha: 12679,
  Goa: 12979,
  Nagaland: 13079,
  Manipur: 13079,
  "Arunachal Pradesh": 13179,
  Mizoram: 13279,
  Karnataka: 13379,
  Assam: 13679,
  Meghalaya: 13679,
};

const PULSE_FESTIVAL_PLUS_DELHI: Fares = {
  Haryana: 14479,
  Punjab: 14479,
  "Himachal Pradesh": 14579,
  Uttarakhand: 14779,
  "Uttar Pradesh": 14779,
  Rajasthan: 14979,
  "Madhya Pradesh": 15379,
  Chhattisgarh: 15779,
  Jharkhand: 15879,
  Maharashtra: 15979,
  Bihar: 16079,
  "West Bengal": 16079,
  Sikkim: 16179,
  Gujarat: 16379,
  Telangana: 16379,
  "Andhra Pradesh": 16379,
  Odisha: 16479,
  Goa: 16779,
  Nagaland: 16879,
  Manipur: 16879,
  "Arunachal Pradesh": 16979,
  Mizoram: 17079,
  Karnataka: 17179,
  Assam: 17479,
  Meghalaya: 17479,
};

const PULSE_PLANS: Plan[] = [
  {
    id: "pulse-festival",
    n: "PLAN 01",
    name: "THE FESTIVAL",
    blurb: "Five days inside PULSE, and nothing else competing for them.",
    includes: [
      "Entry passes to PULSE",
      "Train 3AC — round trip, from your city",
      "Hotel, sharing basis",
      "Meals through the trip",
    ],
    fares: PULSE_FESTIVAL,
  },
  {
    id: "pulse-festival-delhi",
    n: "PLAN 02",
    name: "THE FESTIVAL + DELHI",
    blurb: "The same five days, with two more spent on the city itself.",
    includes: [
      "Entry passes to PULSE",
      "Train 3AC — round trip, from your city",
      "Hotel, sharing basis",
      "Meals through the trip",
      "2 days of Delhi, guided",
    ],
    fares: PULSE_FESTIVAL_PLUS_DELHI,
  },
];

/** Plans by departure id. A departure absent from here is sold at the
 *  single price on its own record. */
export const PLANS: Record<string, Plan[]> = {
  "PUL-26": PULSE_PLANS,
};

/** The plans a departure is sold as. Empty for a single-price one. */
export function plansFor(departureId: string): Plan[] {
  return PLANS[departureId] ?? [];
}

/** True when a departure is sold as plans rather than one price. */
export function hasPlans(departureId: string): boolean {
  return plansFor(departureId).length > 0;
}

/**
 * A plan by id, within a departure.
 *
 * Scoped to the departure deliberately: a plan id posted for a
 * departure that does not sell it must not resolve, or somebody could
 * apply to Thomso at a PULSE fare.
 */
export function findPlan(departureId: string, planId: string | null | undefined): Plan | null {
  if (!planId) return null;
  return plansFor(departureId).find((p) => p.id === planId) ?? null;
}

/**
 * What this plan costs from this state.
 *
 * Null when the state has no fare set — which is a real answer, not an
 * error. Eleven states and union territories are unpriced today, and
 * somebody from one of them should be told we will confirm their fare
 * rather than shown a guess.
 */
export function fareFor(plan: Plan | null, state: string): number | null {
  if (!plan || !state) return null;
  return plan.fares[state as StateName] ?? null;
}

/** Cheapest and dearest fare in a plan, for a range on a card. */
export function planSpan(plan: Plan): { min: number; max: number } {
  const fares = Object.values(plan.fares);
  return { min: Math.min(...fares), max: Math.max(...fares) };
}

/**
 * The whole departure's span, across every plan it is sold as.
 *
 * This is what the price on a card and a detail page comes from, so
 * that changing a fare changes what the site advertises. Null for a
 * departure with no plans — its own `price` stands.
 */
export function departureSpan(departureId: string): { min: number; max: number } | null {
  const plans = plansFor(departureId);
  if (plans.length === 0) return null;

  const spans = plans.map(planSpan);
  return {
    min: Math.min(...spans.map((s) => s.min)),
    max: Math.max(...spans.map((s) => s.max)),
  };
}

/**
 * What is owed at application time, in rupees.
 *
 * The one function both the form and the apply route call, so the
 * figure someone is shown is the figure that gets recorded.
 *
 * Null means "do not ask for money", and it happens for three good
 * reasons: the departure takes no payment, no plan has been chosen
 * yet, or the applicant's state has no fare. Quoting nothing is the
 * correct behaviour in all three — an amount we have not worked out is
 * not an amount somebody can be asked to transfer.
 */
export function amountDueInr(opts: {
  departureId: string;
  planId: string | null | undefined;
  state: string;
  /** A flat booking amount, for departures sold without plans. */
  bookingInr?: number;
  /** Already resolved by lib/partners.ts. Comes off the top. */
  discountInr?: number;
}): number | null {
  const { departureId, planId, state, bookingInr, discountInr = 0 } = opts;

  /* A departure with a bookingInr takes that and only that up front —
     a token against a trip that is settled later. Without one, the
     whole fare is due at application.
​
     PULSE has no bookingInr today, so somebody from Haryana on Plan 01
     is asked for the full ₹9,679. If that should be a smaller deposit,
     setting bookingInr on the departure is the entire change: this
     stops reading the fare table, the form shows the token, and the
     route records it.

     Checked before plans on purpose. A token is a fixed sum whatever
     package was chosen, so it has to win over the per-state fare
     rather than the other way round. */
  const gross =
    typeof bookingInr === "number" && bookingInr > 0
      ? bookingInr
      : hasPlans(departureId)
        ? fareFor(findPlan(departureId, planId), state)
        : null;

  if (gross === null) return null;

  /* Clamped: a discount larger than the fare is a configuration
     mistake, not a reason to owe somebody money. */
  return Math.max(0, gross - discountInr);
}
