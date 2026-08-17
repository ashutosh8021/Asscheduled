import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/razorpay";
import { markApplicationPaid } from "@/lib/supabase";
import { sendLodgedEmail } from "@/lib/email";
import { referenceFrom } from "@/lib/reference";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Only these two tell us the ₹500 actually cleared. */
const PAID_EVENTS = new Set(["payment.captured", "order.paid"]);

interface RazorpayEntity {
  id?: unknown;
  order_id?: unknown;
}

/** Pull (orderId, paymentId) out of either event shape, without `any`. */
function extractIds(body: unknown): { orderId: string; paymentId: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const payload = (body as Record<string, unknown>).payload;
  if (typeof payload !== "object" || payload === null) return null;

  const p = payload as Record<string, unknown>;
  const entityOf = (k: string): RazorpayEntity => {
    const wrapper = p[k];
    if (typeof wrapper !== "object" || wrapper === null) return {};
    const entity = (wrapper as Record<string, unknown>).entity;
    return typeof entity === "object" && entity !== null ? (entity as RazorpayEntity) : {};
  };

  const payment = entityOf("payment");
  const order = entityOf("order");

  const paymentId = typeof payment.id === "string" ? payment.id : null;
  const orderId =
    typeof payment.order_id === "string"
      ? payment.order_id
      : typeof order.id === "string"
        ? order.id
        : null;

  return orderId && paymentId ? { orderId, paymentId } : null;
}

/**
 * Razorpay's callback — the only place fee_status becomes 'paid'.
 *
 * The raw request text is hashed, not a re-serialised object: JSON.stringify
 * would reorder or respace keys and the HMAC would never match.
 *
 * Anything we successfully processed (or deliberately ignore) answers 200, so
 * Razorpay stops retrying. Only a bad signature is refused.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhook(raw, signature)) {
    /* Also the response when RAZORPAY_WEBHOOK_SECRET is unset — an unverifiable
       webhook is never trusted, configured or not. */
    return NextResponse.json({ ok: false, error: "Bad signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Body was not JSON." }, { status: 400 });
  }

  const event =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).event
      : undefined;

  if (typeof event !== "string" || !PAID_EVENTS.has(event)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const ids = extractIds(body);
  if (!ids) {
    console.error("[razorpay/webhook] verified event with no usable ids", event);
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const row = await markApplicationPaid(ids.orderId, ids.paymentId);

    /* null = already paid (a retry) or Supabase not configured. Either way
       there is nothing new to confirm, so no second email goes out. */
    if (!row) return NextResponse.json({ ok: true, alreadyHandled: true });

    await sendLodgedEmail({
      to: row.email,
      name: row.name,
      tripCode: row.trip_code,
      reference: referenceFrom(row.id),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    /* 500 so Razorpay retries — the payment is real and the row must catch up. */
    console.error("[razorpay/webhook] handling failed", err);
    return NextResponse.json({ ok: false, error: "Handler failed." }, { status: 500 });
  }
}
