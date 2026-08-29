import { NextResponse } from "next/server";
import { deliver, isEmail, isIndianMobile, readStrings } from "@/lib/inbox";
import { saveMessage } from "@/lib/store";
import { DEPARTURES } from "@/lib/departures";
import { partnerFor } from "@/lib/partners";

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

  /* Read separately from the required keys, and only accepted if it
     names a departure we actually run — an unknown value is dropped
     rather than stored, so this can never become a way to file a
     message against something that does not exist. */
  const rawAbout = (raw as Record<string, unknown>).about;
  const about = typeof rawAbout === "string" ? rawAbout.trim() : "";
  const departure = DEPARTURES.find((d) => d.id === about) ?? null;

  const stored = await saveMessage({
    name: a.name,
    email: a.email,
    phone: a.phone.replace(/\s/g, ""),
    message: a.message,
    departureCode: departure?.id ?? null,
  });

  /* Copied to the festival when the enquiry is about a departure we
     run with one — a group booking or a skipped delegate pass is
     their business as much as ours. Only for partnered departures;
     a general enquiry goes to us alone. */
  const partner = departure ? partnerFor(departure.id) : null;

  const delivered = await deliver(
    departure ? `UNSCHEDULED — ${departure.fest} — ${a.name}` : `UNSCHEDULED — ${a.name}`,
    {
      name: a.name,
      email: a.email,
      phone: `+91 ${a.phone}`,
      about: departure ? `${departure.fest} — ${departure.campus}` : null,
      message: a.message,
    },
    a.email,
    partner?.notify ? [partner.notify] : undefined
  );

  /* Stored or mailed is enough — see the note in the apply route. */
  return NextResponse.json({ ok: true, received: stored || delivered, stored, delivered });
}
