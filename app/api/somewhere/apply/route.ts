import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { deliver, isIndianMobile, readStrings } from "@/lib/inbox";
import { effectivePrice, notifyFor, partnerFor, PARTNER_COOKIE } from "@/lib/partners";
import { mirrorApplication } from "@/lib/adminData";
import { newReference } from "@/lib/reference";
import { DEPARTURES } from "@/lib/departures";
import { findApplicationId, saveApplication, storeConfigured } from "@/lib/store";
import { issueUploadToken } from "@/lib/documents";
import { amountDueInr, findPlan, plansFor } from "@/lib/packages";

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

  /* Pricing is decided here and nowhere else.

     Two inputs, and both are only ever a CODE: the cookie the
     middleware set, and the coupon typed into the form. Neither
     carries a price. The discount is looked up from the config here,
     from scratch, so a client that posts its own partner_code,
     discount or amount is simply ignored — everything below is
     derived, and there is nothing for a forged body to influence.

     The typed coupon is read straight off the body on purpose. It has
     to be: it is the applicant telling us which code they were given,
     which is exactly what a coupon field is. What makes that safe is
     that partnerFor decides what the code is worth, and takes the best
     of what applies rather than what was asked for.

     An expired code, a code for another departure, an unknown one, or
     no code at all all mean the price without it. None is an error:
     somebody who mistypes a coupon should get an application, not a
     refusal — the form already told them it did not take. */
  const rawCoupon = (raw as Record<string, unknown>).coupon;
  const coupon = typeof rawCoupon === "string" ? rawCoupon.trim().slice(0, 40) : "";

  const jar = await cookies();
  const partner = partnerFor(departure!.id, jar.get(PARTNER_COOKIE)?.value, coupon);
  const pricing = effectivePrice(departure!.price, departure!.priceMax, partner);

  /* Who else hears about this. From the departure's own arrangement,
     plus the referral in force if it carries one — see notifyFor. */
  const notifyList = notifyFor(departure!.id, partner);

  /* Which package, for departures sold as more than one.
​
     Scoped to the departure: a plan id is only accepted if this
     departure actually sells it, so a PULSE plan posted against Thomso
     resolves to nothing rather than to a PULSE fare. Anything unknown
     is dropped silently — it cannot become a price. */
  const rawPlan = (raw as Record<string, unknown>).plan;
  const plan = findPlan(
    departure!.id,
    typeof rawPlan === "string" ? rawPlan.trim() : null
  );

  /* A departure sold as plans needs one chosen. Without it there is no
     fare, so nothing to quote and nothing to check a transfer against.
     Refused here as well as in the form, because the form can be
     bypassed. */
  if (plansFor(departure!.id).length > 0 && !plan) {
    return fail("Pick which plan you want.", 422, ["plan"]);
  }

  /* What they owe now, worked out here from the plan and the state
     they submitted — never from an amount in the request. The same
     function runs in the form, so what somebody was shown and what
     gets recorded come from one table.

     Null is a legitimate outcome, not a failure: the departure takes
     no payment, or their state has no fare set yet. An application
     still stands; we come back with the amount. */
  const amountDue = amountDueInr({
    departureId: departure!.id,
    planId: plan?.id ?? null,
    state: a.state,
    bookingInr: departure!.bookingInr,
    discountInr: pricing.discountInr,
  });

  /* Read on its own rather than through readStrings, which requires
     every key it is given. Listing `utr` there would have made it
     mandatory for every application — including from a cached older
     client that has never heard of it. Optional, and sanitised here. */
  const rawUtr = (raw as Record<string, unknown>).utr;
  const utr =
    typeof rawUtr === "string" ? rawUtr.trim().toUpperCase().slice(0, 40) : "";

  /* Where money is owed, the reference for it is required — a transfer
     that cannot be matched to an application has to be chased by hand,
     which is worse than not taking it. The shape check mirrors the
     form's; neither is proof the transfer happened, which is why every
     one is still checked against the bank.

     Only when an amount is actually due. Departures that take no
     payment, and applicants whose state has no fare, are not asked. */
  if (amountDue !== null && !/^[A-Z0-9]{8,24}$/.test(utr)) {
    return fail("Enter the UTR from your UPI app — 8 to 24 letters or digits.", 422, ["utr"]);
  }

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
    plan: plan?.id ?? null,
    partnerCode: partner?.code ?? null,
    discountInr: pricing.discountInr || null,
    amountDue,
    utr: utr || null,
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
      plan: plan ? `${plan.n} — ${plan.name}` : null,
      partner: partner ? `${partner.coupon} · ${partner.name} — ₹${pricing.discountInr} off` : null,
      amountDue: amountDue === null ? null : `₹${amountDue}`,
      utr: utr || null,
    },
    null,
    /* Copied to the partner festival. Worked out from the DEPARTURE,
       not from whichever coupon priced this application — PULSE admits
       everybody going to PULSE, so PULSE is told about everybody going
       to PULSE, whatever code they used. Reading it off the winning
       partner instead would drop anyone on an influencer code from the
       festival's list without anything appearing to fail.
       Departures with no partner go to us alone. */
    notifyList.length ? notifyList : undefined
  );

  /* The sheet is a mirror, never the record. It runs after the row is
     safe, its result is logged and then dropped, and nothing below
     reads it — a spreadsheet being unreachable must not tell somebody
     their application failed.

     Built from the stored row rather than from the answers above, so
     the sheet cannot show an application the database does not have.
     Skipped entirely when nothing stored, for the same reason. Only
     mirrored departures get this far; see lib/sheet.ts.

     `after` rather than a bare `void`: this runs on Vercel, which may
     freeze the invocation as soon as the response is sent and kill an
     unawaited fetch with it. That is exactly what happened — the row
     saved, the email sent, and the sheet stayed empty in production
     while working perfectly on a local server that never freezes.
     `after` keeps the invocation alive until this settles, without
     the applicant waiting on Google to get their confirmation. */
  if (stored) after(() => mirrorApplication({ reference }));

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
