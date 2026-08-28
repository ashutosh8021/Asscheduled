import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEPARTURES } from "@/lib/departures";
import { PARTNER_COOKIE, partnerFor } from "@/lib/partners";

/* What a referral is worth, for display only.
 *
 * The application form has to show the amount somebody should actually
 * transfer, and a partner discount comes off that. The form cannot work
 * it out on its own: the referral lives in an httpOnly cookie, which is
 * the point — a discount the browser can name is a discount the browser
 * can change.
 *
 * So the form asks, and this answers from the cookie, server-side, with
 * the same resolvePartner the apply route uses. Nothing here is trusted
 * later: the apply route reads the cookie again and recomputes the
 * price from scratch. This endpoint can only ever affect what a number
 * on the screen says, never what gets recorded.
 *
 * It reveals nothing an applicant does not already have — they arrived
 * on the link that set the cookie. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const event = new URL(request.url).searchParams.get("event") ?? "";

  /* An unknown departure gets the same answer as no discount, not an
     error: this is a display nicety, and a stale tab asking about a
     departure we have retired should quietly show full price. */
  const departure = DEPARTURES.find((d) => d.id === event);
  if (!departure) {
    return NextResponse.json({ discountInr: 0, partnerName: null, coupon: null });
  }

  const jar = await cookies();
  const partner = partnerFor(departure.id, jar.get(PARTNER_COOKIE)?.value);

  return NextResponse.json({
    discountInr: partner?.discountInr ?? 0,
    partnerName: partner?.name ?? null,
    /* The coupon as the applicant should see it. Sent so the form can
       show it already applied — there is no field to type it into, and
       nothing here is trusted when the price is actually decided. */
    coupon: partner?.coupon ?? null,
  });
}
