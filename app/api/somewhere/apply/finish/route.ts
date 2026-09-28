import { NextResponse } from "next/server";
import { deliver } from "@/lib/inbox";
import { resolveUploadToken } from "@/lib/documents";
import { completeApplication } from "@/lib/store";
import { ALL_DEPARTURES } from "@/lib/departures";
import { depositFor, findPlan } from "@/lib/packages";
import { LIMITS, rateLimit, tooMany } from "@/lib/rateLimit";

/* Step two of "build your experience": the package, how they travel,
 * and either a deposit or a promise to call.
 *
 * The row already exists — step one wrote it — so this is an update
 * addressed by the token that step one handed back. The token is the
 * same one that authorises the payment screenshot, and it is the only
 * thing that says which application this is: an id in the body would
 * let anybody rewrite somebody else's answers.
 *
 * The deposit is worked out HERE, from the plan, and never read from
 * the request. The browser sends a plan id and a travel choice; what
 * that costs is ours to decide. Same rule as the apply route. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRAVEL_MODES = ["train", "flight", "self"] as const;
const TRAVEL_TYPES = ["round", "oneway"] as const;

type TravelMode = (typeof TRAVEL_MODES)[number];

function fail(error: string, status: number, fields: string[] = []) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

function str(src: Record<string, unknown>, key: string, cap = 120): string {
  const v = src[key];
  return typeof v === "string" ? v.trim().slice(0, cap) : "";
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
  if (typeof raw !== "object" || raw === null) return fail("Payload is malformed.", 400);
  const src = raw as Record<string, unknown>;

  /* Who this is. Not negotiable and not in the body beyond the token. */
  const target = await resolveUploadToken(str(src, "token", 200));
  if (!target) return fail("That link is no longer valid. Start again.", 401);

  const departure = ALL_DEPARTURES.find((d) => d.id === target.departure_code);
  if (!departure?.experienceFlow) {
    return fail("That application does not use this form.", 409);
  }

  /* The package. Scoped to the departure, so a plan id from elsewhere
     resolves to nothing rather than to somebody else's price. */
  const plan = findPlan(departure.id, str(src, "plan", 60));
  if (!plan) return fail("Pick which experience you want.", 422, ["plan"]);

  const mode = str(src, "travelMode", 20) as TravelMode;
  if (!TRAVEL_MODES.includes(mode)) {
    return fail("Pick how you want to travel.", 422, ["travelMode"]);
  }

  /* A train or a flight needs a city and a direction; arranging your
     own needs neither, and storing either would be inventing detail. */
  let travelCity: string | null = null;
  let travelType: string | null = null;

  if (mode !== "self") {
    travelCity = str(src, "travelCity", 120);
    if (travelCity.length < 2) {
      return fail("Which city are you travelling from?", 422, ["travelCity"]);
    }

    const type = str(src, "travelType", 20);
    if (!(TRAVEL_TYPES as readonly string[]).includes(type)) {
      return fail("Round trip or one way?", 422, ["travelType"]);
    }
    travelType = type;
  }

  /* What is owed now.
​
     Only where they arrange their own travel. A train or a flight has
     to be priced by a person — it depends on the city, the class and
     the day — so nothing is taken until that conversation has
     happened. Null here is the whole branch: no amount, no UTR asked
     for, and a different ending on screen. */
  const amountDue = mode === "self" ? depositFor(plan) : null;

  const utr = str(src, "utr", 40).toUpperCase();
  if (amountDue !== null && !/^[A-Z0-9]{8,24}$/.test(utr)) {
    return fail("Enter the UTR from your UPI app — 8 to 24 letters or digits.", 422, ["utr"]);
  }

  const stored = await completeApplication(target.id, {
    plan: plan.id,
    travelMode: mode,
    travelCity,
    travelType,
    amountDue,
    utr: utr || null,
  });

  const delivered = await deliver(
    `REGISTRATION — ${departure.fest} — ${target.name}`,
    {
      reference: target.reference,
      departure: `${departure.fest} (${departure.id}) — ${departure.campus}`,
      name: target.name,
      experience: `${plan.n} — ${plan.duration}`,
      travel:
        mode === "self"
          ? "Arranging their own"
          : `${mode === "train" ? "Train" : "Flight"} from ${travelCity} · ${
              travelType === "round" ? "Round trip" : "One way"
            }`,
      /* Said plainly, because it changes what somebody has to do next:
         a quote to prepare, or a transfer to check against the bank. */
      amountDue: amountDue === null ? "NOT TAKEN — travel to be quoted" : `₹${amountDue}`,
      utr: utr || null,
    },
    null
  );

  if (!stored) {
    console.error(
      `[finish] could not complete ${target.reference} ` +
        `(mailed: ${delivered}) — the row is still at stage 'details'.`
    );
  }

  /* Stored or mailed is enough, as everywhere else: the details were
     already saved at step one, so nothing is lost either way. */
  return NextResponse.json({
    ok: true,
    received: stored || delivered,
    stored,
    delivered,
    reference: target.reference,
    /* The browser needs to know which ending to show; it is told
       rather than deciding, so the screen matches what was recorded. */
    quoted: amountDue === null,
    amountDue,
  });
}
