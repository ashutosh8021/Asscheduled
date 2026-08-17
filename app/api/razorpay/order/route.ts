import { NextResponse } from "next/server";
import { createOrder, razorpayKeyId, razorpayLive } from "@/lib/razorpay";
import { setApplicationOrder } from "@/lib/supabase";
import { newReference } from "@/lib/reference";
import { APPLICATION_FEE_PAISE } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Re-issue a ₹500 order for an application that is already filed but unpaid —
 * the applicant closed Checkout, or the card failed. Only rows still at
 * fee_status='pending' get repointed, so a paid file can never be re-charged.
 *
 * Body: { applicationId: string }
 */
export async function POST(request: Request) {
  if (!razorpayLive()) {
    return NextResponse.json(
      { ok: false, error: "Payments are not live yet." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body was not JSON." }, { status: 400 });
  }

  const applicationId =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).applicationId
      : undefined;

  if (typeof applicationId !== "string" || !applicationId) {
    return NextResponse.json(
      { ok: false, error: "applicationId is required." },
      { status: 400 }
    );
  }

  try {
    const order = await createOrder(newReference(), { retry_for: applicationId });
    const keyId = razorpayKeyId();
    if (!order || !keyId) {
      return NextResponse.json(
        { ok: false, error: "Payments are not live yet." },
        { status: 503 }
      );
    }

    await setApplicationOrder(applicationId, order.id);

    return NextResponse.json({
      ok: true,
      order: { id: order.id, keyId },
      amountPaise: APPLICATION_FEE_PAISE,
    });
  } catch (err) {
    console.error("[razorpay/order] retry failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not re-open payment." },
      { status: 502 }
    );
  }
}
