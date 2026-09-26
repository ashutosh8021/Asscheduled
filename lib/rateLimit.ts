/* Rate limiting for the public form endpoints.
 *
 * Best-effort, and it is worth being exact about what that means.
 *
 * The counts live in this server instance's memory. On Vercel a burst
 * of traffic is spread over several instances, each with its own
 * counts, and an instance that goes cold forgets everything. So this
 * stops the thing that actually happens to small sites — one script
 * hammering a form from one address — and does NOT stop somebody who
 * deliberately spreads requests across many addresses or waits out a
 * cold start. Doing that properly needs shared storage (Redis or a
 * database table), which is a dependency decision, not a quiet default.
 *
 * The limits are deliberately generous. Many real students share one
 * address: a college on one Wi-Fi, a hostel, and Indian mobile carriers
 * put huge numbers of phones behind the same public IP. A Crew member
 * running a sign-up session in a common room must never be told they
 * are spamming. A limit that blocks a campaign's best moment is worse
 * than no limit at all.
 *
 * Server-only. */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Sweep threshold. Beyond this many tracked keys, expired ones are
 *  dropped before a new one is added, so memory cannot grow without
 *  bound under a flood of distinct addresses. */
const SWEEP_AT = 5_000;

function clientAddress(request: Request): string {
  /* Vercel sets x-forwarded-for; the first entry is the client. The
     rest are proxies, and trusting them would let anybody pick their
     own bucket by sending the header themselves. */
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export interface Limit {
  /** Distinguishes endpoints, so a busy contact form does not use up
   *  somebody's allowance for applying. */
  bucket: string;
  max: number;
  windowMs: number;
}

/**
 * Count this request against its address.
 *
 * Returns null when it may proceed, or the number of seconds to wait
 * when it may not — which the route sends back as Retry-After.
 */
export function rateLimit(request: Request, limit: Limit, now: number = Date.now()): number | null {
  if (windows.size > SWEEP_AT) {
    for (const [key, w] of windows) if (w.resetAt <= now) windows.delete(key);
  }

  const key = `${limit.bucket}:${clientAddress(request)}`;
  const w = windows.get(key);

  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + limit.windowMs });
    return null;
  }

  w.count += 1;
  if (w.count <= limit.max) return null;

  return Math.max(1, Math.ceil((w.resetAt - now) / 1000));
}

const TEN_MINUTES = 10 * 60 * 1000;

/* Per address, per ten minutes. See the note at the top on why these
   are high: they are sized for a hostel on one connection, not for one
   person. */
export const LIMITS = {
  apply: { bucket: "apply", max: 30, windowMs: TEN_MINUTES },
  crew: { bucket: "crew", max: 20, windowMs: TEN_MINUTES },
  contact: { bucket: "contact", max: 15, windowMs: TEN_MINUTES },
  collab: { bucket: "collab", max: 15, windowMs: TEN_MINUTES },
  subscribe: { bucket: "subscribe", max: 30, windowMs: TEN_MINUTES },
  /* Coupon checks. The highest, because a form asks on every open —
     but still a ceiling, since codes like MANSA11 are short enough to
     guess and this is the endpoint somebody would guess against. */
  pricing: { bucket: "pricing", max: 120, windowMs: TEN_MINUTES },
} as const satisfies Record<string, Limit>;

/** The response a limited request gets. Plain words, and Retry-After so
 *  a well-behaved client knows when to come back. */
export function tooMany(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Too many attempts from this connection. Wait a few minutes and try again.",
      fields: [],
    }),
    {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": String(retryAfter) },
    }
  );
}
