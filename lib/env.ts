/* Server-only environment access.

   Every integration is OPTIONAL. Absent keys are not an error — they mean the
   feature degrades to the Phase 1 behaviour (a client-side reference, nothing
   persisted, no money moved). This is what lets the whole Phase 2 path exist
   in the repo before Razorpay/Supabase/Resend accounts are live.

   Do NOT import this module from a client component: it reads secrets.
   Variable names are fixed by docs/SPEC.md §9. */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface ResendConfig {
  apiKey: string;
  from: string;
}

/** Postgres writes go through the service role — anon is insert-only by RLS. */
export function supabaseConfig(): SupabaseConfig | null {
  const url = read("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = read("SUPABASE_SERVICE_ROLE_KEY");
  return url && serviceRoleKey ? { url: url.replace(/\/$/, ""), serviceRoleKey } : null;
}

export function razorpayConfig(): RazorpayConfig | null {
  const keyId = read("RAZORPAY_KEY_ID");
  const keySecret = read("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret, webhookSecret: read("RAZORPAY_WEBHOOK_SECRET") };
}

/* Read independently of razorpayConfig(): verifying a webhook needs only the
   webhook secret, and coupling it to the API key pair would silently reject
   every valid callback whenever the key id or secret happened to be absent. */
export function razorpayWebhookSecret(): string | undefined {
  return read("RAZORPAY_WEBHOOK_SECRET");
}

/* RESEND_FROM is not in SPEC §9 because the sending domain was never decided.
   Without a verified domain Resend rejects every send, so treat it as required.
   TODO(mannat): verify a domain in Resend, then set RESEND_FROM. */
export function resendConfig(): ResendConfig | null {
  const apiKey = read("RESEND_API_KEY");
  const from = read("RESEND_FROM");
  return apiKey && from ? { apiKey, from } : null;
}

/** The ₹500 application fee, in paise. Never refunded, never adjusted. */
export const APPLICATION_FEE_PAISE = 50_000;
