import { NextResponse } from "next/server";
import { deliver, isEmail, isIndianMobile, readStrings } from "@/lib/inbox";
import { saveAmbassador } from "@/lib/store";
import { STATES } from "@/lib/copy";
import { LIMITS, rateLimit, tooMany } from "@/lib/rateLimit";

/* "APPLY TO CREW." — a request to become an ambassador.
 *
 * A signup, not membership. Nothing is issued here: no code, no link,
 * no promise. Somebody is selected on a call and given a code later,
 * which is Phase B of the Mood Indigo plan. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_AGE = 18;
const MAX_AGE = 60;

const KEYS = [
  "name",
  "phone",
  "email",
  "age",
  "college",
  "year",
  "city",
  "state",
  "instagram",
  "reach",
  "why",
] as const;

function fail(error: string, status: number, fields: string[] = []) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

export async function POST(request: Request) {
  const wait = rateLimit(request, LIMITS.crew);
  if (wait !== null) return tooMany(wait);

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
  if (!isIndianMobile(a.phone)) bad.push("phone");
  if (!isEmail(a.email)) bad.push("email");

  /* 18+, enforced here because the form can be bypassed. Crew are
     paid, and a payout arrangement with a minor is not one to enter. */
  const age = Number(a.age);
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) bad.push("age");

  if (a.college.length < 2) bad.push("college");
  if (!a.year) bad.push("year");
  if (a.city.length < 2) bad.push("city");
  /* Must be one of ours. A free-text state would make "which states
     are we recruiting in" unanswerable by the time it matters. */
  if (!(STATES as readonly string[]).includes(a.state)) bad.push("state");
  /* The one field selection actually rests on, so it has to say
     something. Ten characters rules out "yes" and "many". */
  if (a.reach.length < 10) bad.push("reach");

  if (bad.length) return fail("Some answers did not pass validation.", 422, bad);

  const phone = a.phone.replace(/\s/g, "");
  const instagram = a.instagram.replace(/^@/, "");

  const saved = await saveAmbassador({
    name: a.name,
    phone,
    email: a.email,
    age,
    college: a.college,
    year: a.year,
    city: a.city,
    state: a.state,
    instagram,
    reach: a.reach,
    why: a.why,
  });

  /* Already on the list: answered as such, and not mailed again. A
     second notification for the same person is noise in an inbox
     that already has to be triaged by hand. */
  if (saved === "duplicate") {
    return NextResponse.json({ ok: true, received: true, duplicate: true });
  }

  const delivered = await deliver(
    `CREW — ${a.name} — ${a.college}`,
    {
      name: a.name,
      phone: `+91 ${phone}`,
      email: a.email,
      age: a.age,
      college: a.college,
      year: a.year,
      city: a.city,
      state: a.state,
      instagram: instagram ? `@${instagram}` : null,
      reach: a.reach,
      why: a.why || null,
    },
    a.email
  );

  const stored = saved === "stored";

  if (!stored && !delivered) {
    console.error(`[crew] nothing persisted for ${phone} (stored: ${saved}, mailed: ${delivered})`);
  }

  /* Stored or mailed is enough — the same rule as every other form. */
  return NextResponse.json({
    ok: true,
    received: stored || delivered,
    stored,
    delivered,
    duplicate: false,
  });
}
