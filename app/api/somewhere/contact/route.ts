import { NextResponse } from "next/server";
import { deliver, isEmail, isIndianMobile, readStrings } from "@/lib/inbox";
import { saveMessage } from "@/lib/store";

/* "TELL US WHAT'S UNSCHEDULED." — the contact form on comps (2)/(3). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = ["name", "email", "phone", "message"] as const;

function fail(error: string, status: number, fields: string[] = []) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("Body was not JSON.", 400);
  }

  const a = readStrings(raw, KEYS);
  if (!a) return fail("Payload is malformed.", 400);

  const bad: string[] = [];
  if (a.name.length < 2) bad.push("name");
  if (!isEmail(a.email)) bad.push("email");
  /* The comp marks the number required. */
  if (!isIndianMobile(a.phone)) bad.push("phone");
  if (a.message.length < 5) bad.push("message");

  if (bad.length) return fail("Some answers did not pass validation.", 422, bad);

  const stored = await saveMessage({
    name: a.name,
    email: a.email,
    phone: a.phone.replace(/\s/g, ""),
    message: a.message,
  });

  const delivered = await deliver(
    `UNSCHEDULED — ${a.name}`,
    {
      name: a.name,
      email: a.email,
      phone: `+91 ${a.phone}`,
      message: a.message,
    },
    a.email
  );

  /* Stored or mailed is enough — see the note in the apply route. */
  return NextResponse.json({ ok: true, received: stored || delivered, stored, delivered });
}
