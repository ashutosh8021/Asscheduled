import { NextResponse } from "next/server";
import { deliver, isEmail, isIndianMobile, readStrings } from "@/lib/inbox";
import { saveCollaboration } from "@/lib/store";

/* "Let's collaborate." — comp (13). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = ["name", "org", "email", "phone", "type", "dates", "location", "more"] as const;

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

  /* `on` is the only non-string field — a multi-select. */
  const src = raw as Record<string, unknown>;
  const on = Array.isArray(src.on) ? src.on.filter((v): v is string => typeof v === "string") : [];

  const bad: string[] = [];
  if (a.name.length < 2) bad.push("name");
  if (a.org.length < 2) bad.push("org");
  if (!isEmail(a.email)) bad.push("email");
  if (a.phone && !isIndianMobile(a.phone)) bad.push("phone");
  if (!a.type) bad.push("type");
  if (a.more.length < 10) bad.push("more");

  if (bad.length) return fail("Some answers did not pass validation.", 422, bad);

  const stored = await saveCollaboration({
    name: a.name,
    organisation: a.org,
    email: a.email,
    phone: a.phone.replace(/\s/g, ""),
    kind: a.type,
    dates: a.dates,
    location: a.location,
    collabOn: on,
    details: a.more,
  });

  const delivered = await deliver(
    `COLLAB — ${a.org} — ${a.type}`,
    {
      name: a.name,
      organisation: a.org,
      email: a.email,
      phone: a.phone ? `+91 ${a.phone}` : null,
      type: a.type,
      dates: a.dates || null,
      location: a.location || null,
      "collaborate on": on,
      details: a.more,
    },
    a.email
  );

  /* Stored or mailed is enough — see the note in the apply route. */
  return NextResponse.json({ ok: true, received: stored || delivered, stored, delivered });
}
