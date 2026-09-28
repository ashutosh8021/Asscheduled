import { NextResponse, type NextRequest } from "next/server";
import { findPartner, PARTNER_COOKIE, PARTNER_COOKIE_DAYS } from "@/lib/partners";
import { CREW_REF_COOKIE, CREW_REF_DAYS, looksLikeCrewCode } from "@/lib/crewCode";

/* Turns a partner referral link into a cookie.
 *
 * A festival links to us as /somewhere/…?p=pulse. This runs before the
 * page does, so the cookie exists on the very first render and the
 * price is right immediately — no flash of the full price, and no
 * dependence on which page the partner chose to link at.
 *
 * Only known codes are stored in the PARTNER cookie. An unknown `?p=`
 * never reaches it, so the thing that decides a price can only ever
 * hold something the partner list already defines.
 *
 * A Crew link is the other case, and it goes in a cookie of its own.
 * Crew codes are issued from the database — that is what lets somebody
 * be taken on without a deploy — so they cannot be recognised here,
 * where there is no database. Anything of the right shape is kept as
 * attribution and the apply route is what checks it is real.
 *
 * The two are never mixed. A Crew code carries no discount today, so
 * writing one into the partner cookie would silently take away a
 * discount somebody had already earned on a festival's link — a price
 * rise caused by clicking a second link. Same split as the database's
 * `partner_code` and `referred_by`.
 *
 * Both cookies are httpOnly: nothing in the browser needs to read
 * them, and the price is decided server-side regardless. They are
 * attribution, not form state — the rule in CLAUDE.md about keeping
 * application answers out of browser storage is about Form 7A's
 * answers, not about knowing which link somebody arrived on.
 */

export function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("p");
  if (!code) return NextResponse.next();

  const options = (days: number) => ({
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });

  const partner = findPartner(code);
  if (partner) {
    const response = NextResponse.next();
    response.cookies.set(PARTNER_COOKIE, partner.code, options(PARTNER_COOKIE_DAYS));
    return response;
  }

  /* Not a festival. Possibly a Crew member's code, which only the
     database can confirm — so it is remembered, not trusted. */
  if (looksLikeCrewCode(code)) {
    const response = NextResponse.next();
    response.cookies.set(CREW_REF_COOKIE, code.trim(), options(CREW_REF_DAYS));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  /* Pages only. Running this on every image and script would cost
     something on each one to do nothing — a referral only ever arrives
     on a document request. */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|img|video|.*\\.(?:png|jpg|jpeg|webp|avif|svg|mp4|ico|txt|xml|webmanifest)$).*)",
  ],
};
