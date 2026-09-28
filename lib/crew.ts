/* Crew accounts — the ambassador side of the house.
 *
 * DELIBERATELY SEPARATE FROM lib/admin.ts, and this module must never
 * import it.
 *
 * Admins and festival partners are Supabase Auth users, let into
 * /admin and /partner by the ADMIN_EMAILS and PARTNER_EMAILS
 * allowlists. A Crew member has no Supabase Auth account at all: their
 * identity is a row in `ambassadors`, their credential is a passcode we
 * issue on activation, and their session is a random token in
 * `crew_sessions`.
 *
 * That is the whole security argument, and it is structural rather than
 * a check somebody has to remember to write. currentAdmin() and
 * currentViewer() read the `as_admin` cookie and verify it against
 * Supabase Auth; a Crew token is not a JWT and there is no auth.users
 * row behind it, so it cannot resolve to anything there. In the other
 * direction, currentCrew() reads `as_crew` and never consults either
 * allowlist, so an admin's cookie is not a Crew session either. Two
 * cookies, two tables, no shared code path.
 *
 * Only hashes are stored — of the passcode and of the session token —
 * for the same reason as an upload token in lib/documents.ts: whoever
 * reads these tables cannot use what they find to sign in as somebody.
 *
 * Server-only: this module reads the service role key. */

import { cookies } from "next/headers";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { supabaseConfig } from "./env";

export const CREW_COOKIE = "as_crew";

/* The referral cookie lives in lib/crewCode.ts so middleware.ts can
   import it without pulling node:crypto into the edge runtime. */
export { CREW_REF_COOKIE, CREW_REF_DAYS, looksLikeCrewCode } from "./crewCode";

/** How long a Crew member stays signed in. A season, so nobody is
 *  logged out mid-campaign, and short enough that an abandoned phone
 *  does not hold a live session for ever. */
const SESSION_DAYS = 60;

export const CREW_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

/* No O, 0, I, 1 or L. Every one of these is read aloud on a call or
   typed off a WhatsApp message, and a passcode somebody cannot
   transcribe is a support call. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A signed-in Crew member. Narrow on purpose: their own row, and
 *  nothing about anybody else. */
export interface CrewMember {
  id: string;
  name: string;
  college: string;
  city: string;
  state: string;
  /** Null until a code has been issued — activation issues one, so a
   *  signed-in member normally has it. */
  code: string | null;
  status: string;
  tier: string;
}

/** What activation hands back, exactly once. */
export interface Activation {
  code: string;
  passcode: string;
}

/** How a Crew member's referrals are doing. */
export interface CrewTally {
  registrations: number;
  selected: number;
  /** Payments we have checked against the bank. Reads paid_at, which
   *  nothing sets yet — marking a payment verified is the next piece,
   *  and until it exists this is honestly zero rather than guessed
   *  from a UTR somebody typed. */
  confirmed: number;
}

function headers(key: string) {
  return {
    "content-type": "application/json",
    apikey: key,
    authorization: `Bearer ${key}`,
  };
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function pick(n: number): string {
  let out = "";
  for (let i = 0; i < n; i += 1) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Eight characters, ~40 bits. Guessing is bounded by the rate limit on
 *  the login route, not by the length alone. */
function newPasscode(): string {
  return pick(8);
}

/**
 * A referral code somebody will say out loud.
 *
 * Their first name, so it is theirs and they remember it, plus three
 * random characters, because two Priyas in two colleges must not
 * collide. Letters only from the name — a code goes in a URL and gets
 * typed into a form.
 */
function newCode(name: string): string {
  const stem =
    name
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 6) || "CREW";
  return `${stem}${pick(3)}`;
}

/** Only what can safely go in a PostgREST filter. An unfiltered value
 *  reaching an `ilike` is how a percent sign becomes "match anybody". */
function safeCode(raw: string): string {
  return raw
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 24);
}

/** Ten digits, which is what the signup stored. */
function safePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}

/* ------------------------------------------------------------------
   ACTIVATION — the admin side
   ------------------------------------------------------------------ */

/**
 * Select somebody: issue their code and their passcode, and turn the
 * account on.
 *
 * Returns both exactly once. Neither is readable afterwards, so the
 * admin has to send them there and then — which is the point: you get
 * one thing to paste into WhatsApp, and the database never holds a
 * usable credential.
 *
 * An existing code is kept. Re-activating somebody resets the passcode
 * (so it is also how you replace a lost one) but must never change a
 * code that is already printed on links people are sharing.
 */
export async function activateCrew(id: string): Promise<Activation | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const read = await fetch(
      `${cfg.url}/rest/v1/ambassadors?id=eq.${encodeURIComponent(id)}&select=name,code`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!read.ok) return null;
    const rows = (await read.json()) as { name: string; code: string | null }[];
    const row = rows[0];
    if (!row) return null;

    const passcode = newPasscode();

    /* A few attempts, because the code carries three random characters
       and the unique index is the only thing that decides whether they
       were free. Losing that race is a retry, not an error. */
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = row.code ?? newCode(row.name);

      const res = await fetch(`${cfg.url}/rest/v1/ambassadors?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
        body: JSON.stringify({
          code,
          passcode_hash: hash(passcode),
          activated_at: new Date().toISOString(),
          status: "active",
        }),
        cache: "no-store",
      });

      if (res.ok) return { code, passcode };

      /* Somebody else holds that code. Only worth retrying when we
         generated it — an existing code that collides is a real fault. */
      if (res.status === 409 && !row.code) continue;

      console.error(`[crew] activation failed (${res.status}): ${await res.text()}`);
      return null;
    }

    console.error(`[crew] could not find a free code for ${id} in five attempts`);
    return null;
  } catch (err) {
    console.error("[crew] activation threw", err);
    return null;
  }
}

/** The statuses the ambassadors table will accept. Matches the check
 *  constraint in docs/schema-mi.sql — a value that is not here is
 *  rejected by Postgres, so this list has to stay in step with it. */
export const CREW_STATUSES = ["new", "active", "declined", "paused"] as const;
export type CrewStatus = (typeof CREW_STATUSES)[number];

/**
 * Pause, decline or reinstate somebody.
 *
 * Their row, their code and their referral history stay exactly as they
 * are. Anything other than "active" simply stops them signing in —
 * currentCrew() checks the status on every request, so the existing
 * sessions of somebody paused stop working immediately rather than
 * lasting until their cookie expires.
 *
 * Activating properly, with a code and a passcode, is activateCrew —
 * this only moves the status.
 */
export async function setCrewStatus(id: string, status: CrewStatus): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  if (!CREW_STATUSES.includes(status)) return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/ambassadors?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[crew] status update failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[crew] status update threw", err);
    return false;
  }
}

/* ------------------------------------------------------------------
   SIGNING IN
   ------------------------------------------------------------------ */

/**
 * Exchange a phone number and a passcode for a session token.
 *
 * Null for every kind of failure — unknown number, wrong passcode, not
 * activated yet, paused, declined — and deliberately without saying
 * which, so this cannot be used to work out who is on the list.
 */
export async function signInCrew(phone: string, passcode: string): Promise<string | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const digits = safePhone(phone);
  const given = passcode.trim().toUpperCase();
  if (digits.length !== 10 || given.length < 6) return null;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/ambassadors` +
        `?phone=eq.${encodeURIComponent(digits)}` +
        `&select=id,passcode_hash,status`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!res.ok) return null;

    const rows = (await res.json()) as {
      id: string;
      passcode_hash: string | null;
      status: string;
    }[];
    const row = rows[0];
    if (!row?.passcode_hash) return null;

    /* Only an active account signs in. Paused and declined keep their
       row and their code — the history matters — but not the door. */
    if (row.status !== "active") return null;

    const a = Buffer.from(row.passcode_hash);
    const b = Buffer.from(hash(given));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const token = pick(40);
    const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();

    const made = await fetch(`${cfg.url}/rest/v1/crew_sessions`, {
      method: "POST",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      body: JSON.stringify({
        token_hash: hash(token),
        ambassador_id: row.id,
        expires_at: expires,
      }),
      cache: "no-store",
    });
    if (!made.ok) {
      console.error(`[crew] session insert failed (${made.status}): ${await made.text()}`);
      return null;
    }

    /* Best effort: knowing somebody has signed in is useful, and
       failing to record it is not a reason to refuse them entry. */
    void fetch(`${cfg.url}/rest/v1/ambassadors?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      body: JSON.stringify({ last_login_at: new Date().toISOString() }),
      cache: "no-store",
    }).catch(() => {});

    return token;
  } catch (err) {
    console.error("[crew] sign-in threw", err);
    return null;
  }
}

/**
 * The Crew member this request belongs to, or null.
 *
 * Read at the top of every Crew page and Crew API route. Two lookups
 * rather than one embedded select: it does not depend on how PostgREST
 * happens to name the relationship, and it runs once per page.
 */
export async function currentCrew(): Promise<CrewMember | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const jar = await cookies();
  const token = jar.get(CREW_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/crew_sessions` +
        `?token_hash=eq.${encodeURIComponent(hash(token))}` +
        `&select=ambassador_id,expires_at`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!res.ok) return null;

    const sessions = (await res.json()) as { ambassador_id: string; expires_at: string }[];
    const session = sessions[0];
    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) return null;

    const who = await fetch(
      `${cfg.url}/rest/v1/ambassadors` +
        `?id=eq.${encodeURIComponent(session.ambassador_id)}` +
        `&select=id,name,college,city,state,code,status,tier`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!who.ok) return null;

    const rows = (await who.json()) as CrewMember[];
    const member = rows[0];
    if (!member) return null;

    /* Paused or declined after signing in: the session stops working
       the moment the status changes, without having to hunt down the
       rows it left behind. */
    if (member.status !== "active") return null;

    return member;
  } catch (err) {
    console.error("[crew] session resolve threw", err);
    return null;
  }
}

/** Delete one session. Signing out on a phone leaves a laptop alone. */
export async function signOutCrew(token: string): Promise<void> {
  const cfg = supabaseConfig();
  if (!cfg || !token) return;

  try {
    await fetch(
      `${cfg.url}/rest/v1/crew_sessions?token_hash=eq.${encodeURIComponent(hash(token))}`,
      {
        method: "DELETE",
        headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
        cache: "no-store",
      }
    );
  } catch {
    /* The cookie is cleared regardless, so the browser is signed out
       either way, and the row expires on its own. */
  }
}

/* ------------------------------------------------------------------
   ATTRIBUTION AND NUMBERS
   ------------------------------------------------------------------ */

/**
 * Is this a real Crew code, and what is its canonical spelling?
 *
 * Called by the apply route so `referred_by` only ever holds a code
 * that exists. Codes are issued from the database, not from
 * lib/partners.ts, which is what lets you take somebody on without a
 * deploy.
 *
 * Any status, not only active: somebody paused after handing out links
 * still brought that application in, and where it came from is a fact.
 * Whether they are paid for it is a separate decision.
 */
export async function resolveCrewCode(raw: string | null | undefined): Promise<string | null> {
  const cfg = supabaseConfig();
  const code = safeCode(raw ?? "");
  if (!cfg || code.length < 4) return null;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/ambassadors?code=ilike.${encodeURIComponent(code)}&select=code&limit=1`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!res.ok) return null;

    const rows = (await res.json()) as { code: string }[];
    return rows[0]?.code ?? null;
  } catch {
    return null;
  }
}

/**
 * What one Crew member has brought in.
 *
 * Counts rather than rows: a Crew member has no business seeing who
 * applied, only how many. The applicants are somebody else's personal
 * data, and a leaderboard is not a reason to hand it over.
 */
export async function crewTally(code: string | null): Promise<CrewTally> {
  const empty: CrewTally = { registrations: 0, selected: 0, confirmed: 0 };

  const cfg = supabaseConfig();
  const safe = safeCode(code ?? "");
  if (!cfg || !safe) return empty;

  const count = async (filter: string): Promise<number> => {
    try {
      const res = await fetch(
        `${cfg.url}/rest/v1/applications` +
          `?referred_by=ilike.${encodeURIComponent(safe)}&select=id${filter}`,
        {
          method: "HEAD",
          headers: { ...headers(cfg.serviceRoleKey), prefer: "count=exact" },
          cache: "no-store",
        }
      );
      if (!res.ok) return 0;
      const range = res.headers.get("content-range");
      const total = range?.split("/")[1];
      return total && total !== "*" ? Number(total) : 0;
    } catch {
      return 0;
    }
  };

  const [registrations, selected, confirmed] = await Promise.all([
    count(""),
    count("&status=eq.accepted"),
    count("&paid_at=not.is.null"),
  ]);

  return { registrations, selected, confirmed };
}
