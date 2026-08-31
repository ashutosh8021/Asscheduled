import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEPARTURES } from "@/lib/departures";
import {
  findPartner,
  listedOffers,
  PARTNER_COOKIE,
  partnerFor,
  resolvePartner,
} from "@/lib/partners";

/* What a coupon is worth, for display only.
 *
 * Two jobs. It tells the form what discount is already in force, which
 * it cannot work out for itself because a referral lives in an
 * httpOnly cookie — that is the point of the cookie. And it answers
 * "is this code any good?" when somebody types one in, so the form can
 * say yes or no before they submit rather than after.
 *
 * Nothing here is trusted later. The apply route reads the cookie
 * again, resolves the typed code again, and recomputes the price from
 * the config. This endpoint can only ever affect what a number on the
 * screen says, never what gets recorded — which is why it is safe for
 * it to answer questions about codes at all.
 *
 * It reveals nothing an applicant does not already have: they either
 * arrived on the link that set the cookie, or they typed the code in
 * themselves. It will not enumerate codes — you have to bring one. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const event = params.get("event") ?? "";
  /* Capped before it is looked at. A code is a short string; anything
     longer is not a typo, and there is no reason to fold or search
     megabytes of it. */
  const typed = (params.get("code") ?? "").trim().slice(0, 40);

  /* An unknown departure gets the same answer as no discount, not an
     error: this is a display nicety, and a stale tab asking about a
     departure we have retired should quietly show full price. */
  const departure = DEPARTURES.find((d) => d.id === event);
  if (!departure) {
    return NextResponse.json({
      discountInr: 0,
      partnerName: null,
      coupon: null,
      codeOk: null,
      codeError: null,
      codeBeaten: false,
      offers: [],
    });
  }

  const jar = await cookies();
  const partner = partnerFor(departure.id, jar.get(PARTNER_COOKIE)?.value, typed);

  /* The typed code on its own, before the best-of comparison. A code
     can be perfectly valid and still not be the one applied, because
     something they already had is worth more — and that is a different
     thing to tell somebody than "wrong code". */
  const typedPartner = typed ? resolvePartner(typed, departure.id) : null;

  return NextResponse.json({
    discountInr: partner?.discountInr ?? 0,
    partnerName: partner?.name ?? null,
    /* The coupon in force, so the form can show it already applied. */
    coupon: partner?.coupon ?? null,
    /* Whether the code they typed is a real, current code for this
       trip. Null when they typed nothing, which is not the same as
       typing something wrong. */
    codeOk: typed ? typedPartner !== null : null,
    codeError: typed && !typedPartner ? codeError(typed, departure.id) : null,
    /* Valid, but they already had better. Worth saying plainly so a
       good code does not look broken. */
    codeBeaten: typedPartner !== null && partner?.code !== typedPartner.code,
    /* The coupons this departure is willing to show, so the form can
       offer them as a tap instead of something to be told about. Only
       codes marked `listed` — see lib/partners.ts, which explains at
       length why that default is off. */
    offers: listedOffers(departure.id),
  });
}

/**
 * Why a typed code did not take, in words an applicant can act on.
 *
 * The distinction between "no such code" and "not for this trip" is
 * worth drawing: one is a typo to fix, the other is a code they were
 * given for something else.
 */
function codeError(typed: string, departureCode: string): string {
  const known = findPartner(typed);
  if (!known) return "We don't recognise that code. Check the spelling.";
  if (!known.departures.includes(departureCode)) return "That code isn't valid for this trip.";
  return "That code has expired.";
}
