import { NextResponse } from "next/server";
import { isEmail, readStrings } from "@/lib/inbox";
import { saveSubscriber } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Footer mailing list.

   Deliberately quiet about failure: a subscribe box is a low-stakes
   action, and an error there is more confusing than useful. The row
   either lands or it does not, and the log says which. */

const KEYS = ["email", "preference", "website"] as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const a = readStrings(body, KEYS);
  /* null when a key is missing entirely — a malformed post, not a
     person. The form always sends all three. */
  if (!a) return NextResponse.json({ ok: false }, { status: 400 });

  /* Honeypot. A real person never sees this field, so anything in it is
     a bot. Answer 200 so the bot cannot tell it was rejected. */
  if (a.website) {
    console.info("[subscribe] honeypot triggered");
    return NextResponse.json({ ok: true, stored: false });
  }

  const email = a.email.trim().toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "That email does not look right." },
      { status: 400 }
    );
  }

  const stored = await saveSubscriber({
    email,
    preference: a.preference,
    source: "footer",
  });

  if (!stored) console.error(`[subscribe] not stored: ${email}`);

  /* 200 either way — the address was well-formed. Whether Supabase is
     reachable is not the visitor's problem to solve. */
  return NextResponse.json({ ok: true, stored });
}
