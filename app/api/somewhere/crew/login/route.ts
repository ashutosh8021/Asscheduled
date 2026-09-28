import { NextResponse } from "next/server";
import { CREW_COOKIE, CREW_SESSION_MAX_AGE, signInCrew } from "@/lib/crew";
import { LIMITS, rateLimit, tooMany } from "@/lib/rateLimit";

/* Crew sign-in: a phone number and the passcode we issued.
 *
 * Nothing here touches Supabase Auth, ADMIN_EMAILS or PARTNER_EMAILS.
 * The cookie it sets is `as_crew`, which /admin and /partner do not
 * read — see the note at the top of lib/crew.ts.
 *
 * One error for every kind of failure. Saying "no such number" would
 * turn this into a way to find out who is Crew, and saying "wrong
 * passcode" would confirm the number for whoever was guessing. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WRONG = "That number and passcode do not match an active Crew account.";

export async function POST(request: Request) {
  const wait = rateLimit(request, LIMITS.crewLogin);
  if (wait !== null) return tooMany(wait);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body was not JSON." }, { status: 400 });
  }

  const src = raw as Record<string, unknown>;
  const phone = typeof src.phone === "string" ? src.phone : "";
  const passcode = typeof src.passcode === "string" ? src.passcode : "";

  const token = await signInCrew(phone, passcode);
  if (!token) {
    return NextResponse.json({ ok: false, error: WRONG }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  /* httpOnly: nothing in the browser needs to read this, and a session
     token a script can read is a session token an injected script can
     take. */
  response.cookies.set(CREW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CREW_SESSION_MAX_AGE,
  });

  return response;
}
