import { NextResponse, type NextRequest } from "next/server";
import { findPartner, PARTNER_COOKIE, PARTNER_COOKIE_DAYS } from "@/lib/partners";

/* Turns a partner referral link into a cookie.
 *
 * A festival links to us as /somewhere/…?p=pulse. This runs before the
 * page does, so the cookie exists on the very first render and the
 * price is right immediately — no flash of the full price, and no
 * dependence on which page the partner chose to link at.
 *
 * Only known codes are stored. An unknown `?p=` is ignored rather than
 * written through, so the cookie can never hold anything the partner
 * list does not already define.
 *
 * The cookie is httpOnly: nothing in the browser needs to read it, and
 * the price is decided server-side regardless. It is attribution, not
 * form state — the rule in CLAUDE.md about keeping application answers
 * out of browser storage is about Form 7A's answers, not about knowing
 * which link somebody arrived on.
 */

export function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("p");
  if (!code) return NextResponse.next();

  const partner = findPartner(code);
  if (!partner) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(PARTNER_COOKIE, partner.code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PARTNER_COOKIE_DAYS * 24 * 60 * 60,
  });
  return response;
}

export const config = {
  /* Pages only. Running this on every image and script would cost
     something on each one to do nothing — a referral only ever arrives
     on a document request. */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|img|video|.*\\.(?:png|jpg|jpeg|webp|avif|svg|mp4|ico|txt|xml|webmanifest)$).*)",
  ],
};
