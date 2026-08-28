import { NextResponse } from "next/server";
import {
  signIn,
  cookieOptions,
  SESSION_COOKIE,
  REFRESH_COOKIE,
  adminConfigured,
  destinationFor,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Sign in to the admin area.
   Never distinguishes "no such account" from "wrong password", so this
   endpoint cannot be used to work out which emails exist. */

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin is not configured on this deployment." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  const src = body as Record<string, unknown>;
  const email = typeof src.email === "string" ? src.email.trim().toLowerCase() : "";
  const password = typeof src.password === "string" ? src.password : "";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
  }

  const tokens = await signIn(email, password);
  if (!tokens) {
    return NextResponse.json({ ok: false, error: "Those details did not work." }, { status: 401 });
  }

  /* Where to send them. A partner has no access to /admin, so
     without this they would sign in successfully and be bounced
     straight back to the login screen — a loop that looks exactly
     like a rejected password. */
  const res = NextResponse.json({ ok: true, redirect: destinationFor(email) });
  res.cookies.set(SESSION_COOKIE, tokens.accessToken, cookieOptions(tokens.expiresIn));
  /* The refresh token outlives the access token so a long review
     session does not get bounced back to the login screen. */
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(60 * 60 * 24 * 14));
  return res;
}
