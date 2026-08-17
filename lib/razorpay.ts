/* Razorpay Orders API + signature verification.

   Fetch-based for the same reason as lib/supabase.ts: two endpoints and two
   HMACs do not justify a dependency, and this compiles with no account.
   Requires the Node runtime (node:crypto) — every route importing it must not
   declare `runtime = "edge"`. Server-only. */

import { createHmac, timingSafeEqual } from "node:crypto";
import { razorpayConfig, razorpayWebhookSecret, APPLICATION_FEE_PAISE } from "./env";

const ORDERS_ENDPOINT = "https://api.razorpay.com/v1/orders";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

/** True when both key id and secret are present. */
export function razorpayLive(): boolean {
  return razorpayConfig() !== null;
}

/** Public key id — safe to hand to the browser for Checkout. */
export function razorpayKeyId(): string | null {
  return razorpayConfig()?.keyId ?? null;
}

/**
 * Create a ₹500 order. Returns null when Razorpay is not configured, which is
 * the signal to fall back to the unpaid Phase 1 flow rather than to error.
 */
export async function createOrder(receipt: string, notes: Record<string, string>): Promise<RazorpayOrder | null> {
  const cfg = razorpayConfig();
  if (!cfg) return null;

  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64");
  const res = await fetch(ORDERS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
    body: JSON.stringify({
      amount: APPLICATION_FEE_PAISE,
      currency: "INR",
      /* Razorpay caps receipt at 40 chars. */
      receipt: receipt.slice(0, 40),
      notes,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Razorpay order failed (${res.status}): ${await res.text()}`);
  }

  return (await res.json()) as RazorpayOrder;
}

/** Constant-time compare that tolerates length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Verify a webhook body against X-Razorpay-Signature.
 * Must be given the RAW request text — re-serialising parsed JSON changes the
 * bytes and the HMAC will never match.
 */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = razorpayWebhookSecret();
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(digest, signature);
}

/**
 * Verify the handler payload Checkout returns in the browser
 * (razorpay_order_id|razorpay_payment_id signed with the key secret).
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const cfg = razorpayConfig();
  if (!cfg) return false;
  const digest = createHmac("sha256", cfg.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(digest, signature);
}
