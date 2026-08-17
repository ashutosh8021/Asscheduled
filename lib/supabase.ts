/* Supabase access over PostgREST.

   Deliberately fetch-based rather than @supabase/supabase-js: the only calls
   Phase 2 needs are one insert and one update, and keeping it dependency-free
   means the backend path compiles and ships before any account exists.
   Swapping to the SDK later is a drop-in for these two functions.

   Table shape is docs/SPEC.md §7 verbatim. Server-only. */

import { supabaseConfig } from "./env";
import type { FormAnswers } from "@/components/form7a/types";

export interface ApplicationRow {
  id: string;
  trip_code: string;
  fee_status: string;
  decision: string;
}

/** Just enough of a row to send the lodged email. */
export interface PaidRow {
  id: string;
  email: string;
  name: string;
  trip_code: string;
}

/** The seven Section B answers, stored as jsonb. */
function answersJson(a: FormAnswers) {
  return {
    saturday: a.saturday,
    three_words: a.three_words,
    why: a.why,
    bad_at: a.bad_at,
    plus_one: a.plus_one,
    drains_you: a.drains_you,
    remember: a.remember,
  };
}

function headers(serviceRoleKey: string) {
  return {
    "content-type": "application/json",
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
  };
}

/**
 * Insert an application with fee_status='pending'. The webhook flips it to
 * 'paid' once Razorpay confirms — an unpaid row is a real state, not a bug.
 * Returns null when Supabase is not configured (Phase 1 fallback).
 */
export async function insertApplication(
  a: FormAnswers,
  razorpayOrderId: string | null
): Promise<ApplicationRow | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const res = await fetch(`${cfg.url}/rest/v1/applications`, {
    method: "POST",
    headers: { ...headers(cfg.serviceRoleKey), prefer: "return=representation" },
    body: JSON.stringify({
      trip_code: a.trip,
      name: a.name.trim(),
      age: Number(a.age),
      city: a.city.trim(),
      college: a.college.trim(),
      phone: a.phone.replace(/\D/g, ""),
      email: a.email.trim().toLowerCase(),
      instagram: a.instagram.trim().replace(/^@/, ""),
      answers: answersJson(a),
      /* TODO(phase 2): upload the photo to Supabase Storage and store its URL.
         The data URI is intentionally not posted to this route — a 5MB base64
         body would break the request long before it reached Postgres. */
      photo_url: null,
      fee_status: "pending",
      decision: "under_review",
      razorpay_order_id: razorpayOrderId,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`);
  }

  const rows = (await res.json()) as ApplicationRow[];
  return rows[0] ?? null;
}

/**
 * Flip an application to paid. Called only from the verified webhook.
 * There is no 'refunded' state by design — the ₹500 never comes back.
 *
 * The fee_status=pending filter makes this idempotent: Razorpay retries the
 * same event, the second call matches nothing and returns null, and the
 * confirmation email is therefore sent exactly once.
 */
export async function markApplicationPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<PaidRow | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const res = await fetch(
    `${cfg.url}/rest/v1/applications` +
      `?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}` +
      `&fee_status=eq.pending` +
      `&select=id,email,name,trip_code`,
    {
      method: "PATCH",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=representation" },
      body: JSON.stringify({
        fee_status: "paid",
        razorpay_payment_id: razorpayPaymentId,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase update failed (${res.status}): ${await res.text()}`);
  }

  const rows = (await res.json()) as PaidRow[];
  return rows[0] ?? null;
}

/**
 * Point an existing application at a fresh Razorpay order. Used when the first
 * Checkout attempt was abandoned and payment is re-initiated.
 */
export async function setApplicationOrder(
  id: string,
  razorpayOrderId: string
): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  const res = await fetch(
    `${cfg.url}/rest/v1/applications?id=eq.${encodeURIComponent(id)}&fee_status=eq.pending`,
    {
      method: "PATCH",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      body: JSON.stringify({ razorpay_order_id: razorpayOrderId }),
      cache: "no-store",
    }
  );
  return res.ok;
}
