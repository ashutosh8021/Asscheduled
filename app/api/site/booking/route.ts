import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { deliver, isEmail, isIndianMobile, readStrings } from "@/lib/inbox";
import { newReference } from "@/lib/reference";
import { saveApplication, findApplicationId } from "@/lib/store";
import { issueUploadToken } from "@/lib/documents";
import { mirrorApplication } from "@/lib/adminData";
import { findSitePlan, quoteFor } from "@/lib/sitePlans";
import { referrerFor, PARTNER_COOKIE } from "@/lib/partners";
import { CREW_REF_COOKIE, resolveCrewCode } from "@/lib/crew";
import { LIMITS, rateLimit, tooMany } from "@/lib/rateLimit";

/* "Lock it" — the booking form on the public site.
 *
 * This is where a booking becomes a row. It fires the moment somebody
 * reaches the pay step, BEFORE any money moves, because the alternative
 * is finding out about them only if they remember to press Send on
 * WhatsApp. Somebody who fills the form in and then wanders off is still
 * somebody to call back.
 *
 * The money is worked out HERE, from the plan id, and never read from
 * the request. The browser sends which plan was picked; what it costs is
 * ours to decide. Same rule as every other apply route.
 *
 * It answers with a token. That token is the only thing that lets the
 * payment screenshot be attached to this booking afterwards — see
 * /api/documents/upload. No session, because the person booking does not
 * have an account. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The database allows 18 to 60 and says why: below 18 we would be
   processing a minor's data without the verifiable parental consent the
   DPDP Act requires. The form on the site accepts up to 99, so this is
   the boundary that actually holds, and it has to fail with words a
   person can act on rather than a constraint violation. */
const MIN_AGE = 18;
const MAX_AGE = 60;

const KEYS = [
  "plan",
  "name",
  "age",
  "gender",
  "phone",
  "email",
  "college",
  "city",
  "state",
  "instagram",
  "why",
] as const;

function fail(error: string, status: number, fields: string[] = []) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

export async function POST(request: Request) {
  const wait = rateLimit(request, LIMITS.apply);
  if (wait !== null) return tooMany(wait);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("Body was not JSON.", 400);
  }

  const a = readStrings(raw, KEYS);
  if (!a) return fail("Payload is malformed.", 400);

  /* Which package. Scoped to the list we publish, so an id from
     anywhere else resolves to nothing rather than to a price. */
  const plan = findSitePlan(a.plan);
  if (!plan) return fail("Pick which trip you want.", 422, ["plan"]);

  const bad: string[] = [];
  if (a.name.trim().length < 2) bad.push("name");
  if (!isIndianMobile(a.phone)) bad.push("phone");
  if (!isEmail(a.email)) bad.push("email");
  if (a.college.trim().length < 2) bad.push("college");
  if (a.city.trim().length < 2) bad.push("city");
  if (a.state.trim().length < 2) bad.push("state");

  const age = Number(a.age);
  const ageOk = Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
  if (!ageOk) bad.push("age");

  if (bad.length) {
    /* Age gets its own sentence. "Some answers did not pass validation"
       tells a 17-year-old nothing, and this is the one rule we will not
       bend for them. */
    const error = bad.includes("age")
      ? `Everyone travelling has to be between ${MIN_AGE} and ${MAX_AGE}.`
      : "Check the highlighted answers.";
    return fail(error, 422, bad);
  }

  const quote = quoteFor(plan);
  const phone = a.phone.replace(/\s/g, "");
  const reference = newReference();

  /* Who sent them. Read the same way the other apply route reads it, so
     a Crew member's link still earns them the credit now that the public
     site posts here — before this route existed, nothing reached us and
     referred_by was never written at all. */
  const jar = await cookies();
  const referrer = referrerFor(plan.departure, jar.get(PARTNER_COOKIE)?.value, null);
  const crewCode = referrer ? null : await resolveCrewCode(jar.get(CREW_REF_COOKIE)?.value);

  const stored = await saveApplication({
    reference,
    departureCode: plan.departure,
    name: a.name.trim(),
    phone,
    /* The form's gender radio is optional and the column is NOT NULL.
       Said plainly rather than guessed. */
    gender: a.gender || "not stated",
    age,
    state: a.state.trim(),
    /* The new booking form does not ask. The column survives from the
       original Form 7A; schema-hallucia.sql dropped its NOT NULL. */
    occupation: "",
    college: a.college.trim(),
    instagram: a.instagram.replace(/^@/, ""),
    why: a.why,
    plan: a.plan,
    partnerCode: null,
    discountInr: quote.off || null,
    /* What is owed now: 30% of the price after the coupon. Our number,
       not theirs. */
    amountDue: quote.deposit,
    /* The site takes a screenshot, not a typed reference. */
    utr: null,
    referredBy: referrer?.code ?? crewCode,
    email: a.email.trim(),
    city: a.city.trim(),
    /* They have locked the trip but not paid. 'complete' would claim a
       transfer nobody has checked. */
    stage: "details",
  });

  const delivered = await deliver(
    `BOOKING — ${plan.trip} — ${a.name.trim()}`,
    {
      reference,
      trip: `${plan.label} — ${plan.where} · ${plan.when}`,
      name: a.name.trim(),
      phone: `+91 ${phone}`,
      email: a.email.trim(),
      age: a.age,
      gender: a.gender || null,
      college: a.college.trim(),
      city: `${a.city.trim()}, ${a.state.trim()}`,
      instagram: a.instagram ? `@${a.instagram.replace(/^@/, "")}` : null,
      why: a.why || null,
      package: quote.couponCode
        ? `₹${quote.pay} after ${quote.couponCode} (−₹${quote.off}, was ₹${quote.base})`
        : `₹${quote.base}`,
      bookingAmount: `₹${quote.deposit}`,
      referredBy: referrer ? referrer.coupon : crewCode,
      /* Said plainly: this arrives before the money, so nobody reads it
         as a confirmed booking. */
      status: "LOCKED — payment not yet confirmed",
    },
    a.email.trim()
  );

  if (!stored && !delivered) {
    console.error(`[site/booking] nothing persisted for ${reference}`);
    return fail("That did not go through. Try again, or message us on WhatsApp.", 502);
  }

  /* The token that lets the payment screenshot be attached to this
     booking. Null when the row did not store — there would be nothing
     to attach it to. */
  let token: string | null = null;
  if (stored) {
    const id = await findApplicationId(reference);
    if (id) {
      token = await issueUploadToken(id);
      after(() => mirrorApplication({ id }));
    }
  }

  return NextResponse.json({ ok: true, received: true, reference, token });
}
