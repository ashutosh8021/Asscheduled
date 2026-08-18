/* Admin authentication.

   Uses Supabase Auth over its REST API — no SDK, same approach as the
   rest of lib/. Admin accounts are created by hand in the Supabase
   dashboard (Authentication → Users → Add user); there is no signup
   anywhere on this site.

   Two things guard the admin area:

   1. A valid Supabase session, proved by an access token we verify on
      every request against /auth/v1/user. We never trust the cookie's
      contents, only what Supabase says about it.

   2. An allowlist. Supabase projects allow public signup by default, so
      "has an account" is NOT the same as "is an admin". ADMIN_EMAILS is
      the real gate, and it fails CLOSED — unset means nobody gets in.

   Server-only: this module reads the service role key. */

import { cookies } from "next/headers";
import { supabaseConfig } from "./env";

export const SESSION_COOKIE = "as_admin";
export const REFRESH_COOKIE = "as_admin_r";

export interface AdminUser {
  id: string;
  email: string;
}

/** Emails permitted into /admin. Empty means nobody. */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function adminConfigured(): boolean {
  return supabaseConfig() !== null && allowlist().length > 0;
}

function authHeaders(key: string, token?: string) {
  return {
    "content-type": "application/json",
    apikey: key,
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
}

/**
 * Exchange email + password for a session.
 * Returns null on bad credentials — deliberately without saying which
 * part was wrong, so this cannot be used to enumerate accounts.
 */
export async function signIn(email: string, password: string): Promise<Tokens | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: authHeaders(cfg.serviceRoleKey),
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!json.access_token || !json.refresh_token) return null;

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in ?? 3600,
    };
  } catch (err) {
    console.error("[admin] sign-in failed", err);
    return null;
  }
}

/** Trade a refresh token for a fresh session, so an hour-old tab does
 *  not dump someone back at the login screen mid-review. */
export async function refresh(refreshToken: string): Promise<Tokens | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: authHeaders(cfg.serviceRoleKey),
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (!json.access_token || !json.refresh_token) return null;

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in ?? 3600,
    };
  } catch {
    return null;
  }
}

/** Ask Supabase who a token belongs to. Null if it is invalid or expired. */
async function whoami(token: string): Promise<AdminUser | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(`${cfg.url}/auth/v1/user`, {
      headers: authHeaders(cfg.serviceRoleKey, token),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as { id?: string; email?: string };
    if (!json.id || !json.email) return null;
    return { id: json.id, email: json.email };
  } catch {
    return null;
  }
}

/**
 * The current admin, or null.
 *
 * Read this at the top of every admin page and admin API route. It
 * verifies the token with Supabase on each call rather than trusting
 * the cookie, then checks the allowlist — an account alone is never
 * enough.
 */
export async function currentAdmin(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const user = await whoami(token);
  if (!user) return null;

  const allowed = allowlist();
  if (!allowed.includes(user.email.toLowerCase())) {
    console.warn(`[admin] rejected ${user.email} — not in ADMIN_EMAILS`);
    return null;
  }
  return user;
}

/** Cookie options. HTTP-only so no script can read the token, and
 *  Secure once we are on HTTPS in production. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
