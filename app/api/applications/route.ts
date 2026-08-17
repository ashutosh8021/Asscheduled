import { NextResponse } from "next/server";
import { getTrip } from "@/lib/trips";
import { validateAll, EMPTY_ANSWERS, type FormAnswers } from "@/components/form7a/types";
import { createOrder, razorpayKeyId } from "@/lib/razorpay";
import { insertApplication } from "@/lib/supabase";
import { referenceFrom, newReference } from "@/lib/reference";
import { APPLICATION_FEE_PAISE } from "@/lib/env";

/* node:crypto via lib/razorpay — Node runtime, never edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface LodgeResponse {
  ok: true;
  reference: string;
  amountPaise: number;
  /** Row id when persisted — the handle /api/razorpay/order needs. */
  applicationId: string | null;
  /** Present only when Razorpay is configured; absent means the Phase 1 path. */
  order: { id: string; keyId: string } | null;
  /** False when the file was accepted but nothing was written down. */
  persisted: boolean;
}

/** Narrow an unknown JSON body to FormAnswers without `any`. */
function parseAnswers(raw: unknown): FormAnswers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const src = raw as Record<string, unknown>;
  const out = { ...EMPTY_ANSWERS };

  for (const key of Object.keys(EMPTY_ANSWERS) as (keyof FormAnswers)[]) {
    if (key === "photo_name" || key === "photo_data") continue;
    const v = src[key];
    if (typeof v !== "string") return null;
    out[key] = v;
  }
  /* photo_data is deliberately never accepted here — see lib/supabase.ts. */
  out.photo_name = typeof src.photo_name === "string" ? src.photo_name : null;
  out.photo_data = null;
  return out;
}

function fail(message: string, status: number, fields?: string[]) {
  return NextResponse.json({ ok: false, error: message, fields: fields ?? [] }, { status });
}

/**
 * Lodge an application.
 *
 * Live (keys present):  validate → create ₹500 order → insert row (pending)
 *                       → client opens Checkout → webhook flips it to paid.
 * Degraded (no keys):   validate → return a reference. Nothing is stored and
 *                       no money moves. This is the Phase 1 behaviour, kept
 *                       deliberately so the form works before the accounts do.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Body was not JSON.", 400);
  }

  const answers = parseAnswers(body);
  if (!answers) return fail("Application payload is malformed.", 400);

  if (!getTrip(answers.trip)) {
    return fail("That departure is not on the board.", 400, ["trip"]);
  }

  const bad = validateAll(answers);
  if (bad.size) {
    return fail("Some answers did not pass validation.", 422, [...bad]);
  }

  try {
    /* Order first: if Razorpay rejects, nothing has been written yet. */
    const provisionalRef = newReference();
    const order = await createOrder(provisionalRef, {
      trip: answers.trip,
      email: answers.email.trim().toLowerCase(),
    });

    const row = await insertApplication(answers, order?.id ?? null);
    const keyId = razorpayKeyId();

    const payload: LodgeResponse = {
      ok: true,
      reference: row ? referenceFrom(row.id) : provisionalRef,
      amountPaise: APPLICATION_FEE_PAISE,
      applicationId: row?.id ?? null,
      order: order && keyId ? { id: order.id, keyId } : null,
      persisted: row !== null,
    };
    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    console.error("[applications] lodge failed", err);
    return fail("We could not file that. Nothing was charged.", 502);
  }
}
