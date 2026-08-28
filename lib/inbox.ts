/* Delivery for the "SOMEWHERE" forms — application, collaboration, contact.

   No Supabase table exists for these shapes yet (the Phase 2 schema in
   docs/SPEC.md §7 is Form 7A's), so submissions are mailed rather than
   stored. That is deliberate: mailing something real beats writing to a
   table that has not been agreed.

   Every send reports whether it actually left. A form that could not be
   delivered must never render a success state — the UI falls back to
   showing the address so the visitor can send it themselves.

   Set these in .env.local to turn delivery on:
     RESEND_API_KEY
     RESEND_FROM
     SOMEWHERE_INBOX   <- where submissions land

   TODO(mannat): confirm SOMEWHERE_INBOX. Falls back to the address
   printed on the contact comp. Server-only. */

import { resendConfig } from "./env";

const ENDPOINT = "https://api.resend.com/emails";

/** Used only if SOMEWHERE_INBOX is unset. */
const FALLBACK_INBOX = "info@asscheduled.com";

/** Recipients. Comma-separated, so submissions can go to the brand
 *  inbox and a person at once — an address nobody checks is the same
 *  as no notification at all. */
function inbox(): string[] {
  const v = process.env.SOMEWHERE_INBOX;
  const list = (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : [FALLBACK_INBOX];
}

/** Render a flat record as a plain-text body. Arrays join with ", ". */
function body(fields: Record<string, string | string[] | null>): string {
  return Object.entries(fields)
    .map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : (v ?? "—");
      return `${k.toUpperCase().padEnd(22)} ${value || "—"}`;
    })
    .join("\n");
}

/**
 * Mail one submission.
 *
 * Returns false when Resend is not configured or the send failed — the
 * caller must surface that to the visitor rather than swallowing it.
 */
export async function deliver(
  subject: string,
  fields: Record<string, string | string[] | null>,
  replyTo?: string | null,
  /**
   * Extra recipients beyond our own inbox.
   *
   * Used for partner festivals, who need to know who is coming to
   * their event. This is a disclosure to a third party, so callers
   * must pass it only for applicants who arrived on that partner's
   * own referral link — never for everyone on a departure.
   *
   * Deliberately `to` rather than `bcc`: the applicant is told in the
   * form and in the privacy policy that the festival is copied, so
   * hiding it in the headers would be at odds with what we said. Our
   * own inbox sees exactly who received it too.
   */
  alsoTo?: (string | undefined)[]
): Promise<boolean> {
  const cfg = resendConfig();
  if (!cfg) return false;

  /* De-duplicated: a partner address that is also in SOMEWHERE_INBOX
     would otherwise be sent the same mail twice. */
  const to = [...new Set([...inbox(), ...(alsoTo ?? []).filter(Boolean)])] as string[];

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        from: cfg.from,
        to,
        subject,
        text: body(fields),
        ...(replyTo ? { reply_to: [replyTo] } : {}),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[inbox] send failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[inbox] send threw", err);
    return false;
  }
}

/* ---------- shared validation ----------
   The client validates for feedback; the server validates because the
   client's version can be skipped entirely. */

export function isIndianMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/** Narrow an unknown body to a string map without `any`. */
export function readStrings<K extends string>(
  raw: unknown,
  keys: readonly K[]
): Record<K, string> | null {
  if (typeof raw !== "object" || raw === null) return null;
  const src = raw as Record<string, unknown>;
  const out = {} as Record<K, string>;

  for (const key of keys) {
    const v = src[key];
    /* Missing optional fields arrive as "", never undefined. */
    if (typeof v !== "string") return null;
    out[key] = v.trim().slice(0, 2000);
  }
  return out;
}
