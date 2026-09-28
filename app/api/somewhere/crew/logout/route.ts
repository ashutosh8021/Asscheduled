import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CREW_COOKIE, signOutCrew } from "@/lib/crew";

/* Sign out of Crew.
 *
 * Deletes the one session row and clears the one cookie. The other
 * devices somebody is signed in on stay signed in — that is why
 * sessions are their own table rather than a token on the account. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(CREW_COOKIE)?.value;
  if (token) await signOutCrew(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CREW_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
