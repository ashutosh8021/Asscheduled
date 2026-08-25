import { NextResponse } from "next/server";
import { deliver, isIndianMobile, readStrings } from "@/lib/inbox";
import { newReference } from "@/lib/reference";
import { DEPARTURES } from "@/lib/departures";
import { findApplicationId, saveApplication, storeConfigured } from "@/lib/store";
import { issueUploadToken } from "@/lib/documents";

/* "I am coming." — the application overlay from comps (12) and (14).

   This is not the Form 7A flow: no ₹500 order, no Razorpay, no
   selection file. It lodges an expression of interest and mails it. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Kept here rather than imported from the client component so this
   route has no dependency on a "use client" module. */
const MIN_AGE = 18;
const MAX_AGE = 60;

const KEYS = [
  "name",
  "phone",
  "gender",
  "age",
  "state",
  "occupation",
  "college",
  "event",
  "instagram",
  "why",
] as const;

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
  if (!a) return fail("Application payload is malformed.", 400);

  const bad: string[] = [];
  if (a.name.length < 2) bad.push("name");
  if (!isIndianMobile(a.phone)) bad.push("phone");
  if (!a.gender) bad.push("gender");

  /* 18+ only. The client validates the same bounds for feedback, but
     this is the check that holds — the overlay can be bypassed. Below
     18 we would be processing a minor's data without the verifiable
     parental consent the DPDP Act requires. */
  const age = Number(a.age);
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) bad.push("age");

  if (!a.state) bad.push("state");
  if (!a.occupation) bad.push("occupation");
  if (a.college.length < 2) bad.push("college");

  /* The event must be one we actually run — an unknown id means a
     stale or tampered client. */
  const departure = DEPARTURES.find((d) => d.id === a.event);
  if (!departure) bad.push("event");

  if (bad.length) return fail("Some answers did not pass validation.", 422, bad);

  /* Closed departures are refused here, not just hidden in the form.
     The select can be edited in devtools and a stale tab may still hold
     the old list, so this is the check that actually holds. A distinct
     message, because "did not pass validation" would be baffling when
     every field was filled in correctly. */
  if (departure!.soldOut) {
    return fail(`${departure!.fest} is full. Applications are closed.`, 409, ["event"]);
  }

  const reference = newReference();

  /* Store first, then notify. The row is the record of the application;
     the email is a convenience. If the write fails we still try to mail
     it, so a database outage does not lose someone's application. */
  const stored = await saveApplication({
    reference,
    departureCode: departure!.id,
    name: a.name,
    phone: a.phone.replace(/\s/g, ""),
    gender: a.gender,
    age,
    state: a.state,
    occupation: a.occupation,
    college: a.college,
    instagram: a.instagram.replace(/^@/, ""),
    why: a.why,
  });

  const delivered = await deliver(
    `APPLICATION — ${departure?.fest} — ${a.name}`,
    {
      reference,
      departure: departure ? `${departure.fest} (${departure.id}) — ${departure.campus}` : a.event,
      name: a.name,
      phone: `+91 ${a.phone}`,
      gender: a.gender,
      age: a.age,
      state: a.state,
      occupation: a.occupation,
      college: a.college,
      instagram: a.instagram ? `@${a.instagram}` : null,
      why: a.why || null,
    },
    null
  );

  /* `received` is the only thing the overlay should trust. The
     application is safe if it landed in either place — a Resend outage
     must not tell someone they failed when the row is written, and vice
     versa. When neither worked, the overlay shows the email address
     instead of a false confirmation. */
  const received = stored || delivered;

  if (!received) {
    console.error(
      `[apply] nothing persisted for ${reference} ` +
        `(supabase configured: ${storeConfigured()}, mail delivered: ${delivered})`
    );
  }

  /* Departures that ask for ID up front hand back an upload token, and
     the overlay turns it into a third step. It can only be issued when
     the row actually exists — there is nothing to attach a document to
     otherwise — which is why this happens after the save rather than
     as part of the form.

     A departure that wants documents but could not store the row gets
     no token: an upload with nowhere to land is worse than asking for
     it by email. */
  let upload: string | null = null;
  if (departure?.documentsAtApply && stored) {
    const row = await findApplicationId(reference);
    if (row) upload = await issueUploadToken(row);
    if (!upload) console.error(`[apply] could not issue an upload token for ${reference}`);
  }

  return NextResponse.json({ ok: true, reference, received, stored, delivered, upload });
}
