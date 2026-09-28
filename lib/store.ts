/* Persistence for the live "SOMEWHERE" forms.

   Kept separate from lib/supabase.ts, which serves the legacy Form 7A
   flow and speaks a different table shape entirely. Table definitions
   live in docs/schema-somewhere.sql.

   Same approach as lib/supabase.ts: PostgREST over plain fetch rather
   than @supabase/supabase-js. Three inserts is not worth a dependency,
   and it keeps this path compiling before any account exists.

   Every function returns false rather than throwing when Supabase is
   not configured, so the forms keep working (mail-only) until the keys
   are set. Server-only — this module reads the service role key. */

import { supabaseConfig } from "./env";

function headers(serviceRoleKey: string) {
  return {
    "content-type": "application/json",
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    /* We never need the row back; not returning it keeps applicants'
       personal data out of the response and the logs. */
    prefer: "return=minimal",
  };
}

/**
 * Insert one row.
 *
 * Returns false when Supabase is unconfigured OR the write failed. The
 * caller must surface that: a form that stored nothing and mailed
 * nothing has not succeeded, whatever the UI says.
 */
async function insert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(cfg.serviceRoleKey),
      body: JSON.stringify(row),
      cache: "no-store",
    });

    if (!res.ok) {
      /* Body, not just status: PostgREST puts the actual constraint or
         column name in there, which is the whole diagnosis. */
      console.error(`[store] ${table} insert failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[store] ${table} insert threw`, err);
    return false;
  }
}

/** True when a database is configured at all — used to decide whether a
 *  failed write is a real failure or just the not-yet-wired state. */
export function storeConfigured(): boolean {
  return supabaseConfig() !== null;
}

export interface ApplicationRecord {
  reference: string;
  departureCode: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  state: string;
  occupation: string;
  college: string;
  instagram: string;
  why: string;
  /** Which package they chose, for departures sold as more than one.
   *  A plan id, resolved against the departure — never a price. */
  plan: string | null;
  /* Partner pricing. All three are the server's own calculation — the
     browser never sends an amount, so there is nothing here it could
     have chosen. Null when nobody arrived on a partner link. */
  partnerCode: string | null;
  discountInr: number | null;
  amountDue: number | null;
  /** The UPI reference the applicant typed. Checked by hand. */
  utr: string | null;
  /** The code of whoever referred them, whether or not that code won
   *  on price. See referrerFor in lib/partners.ts. */
  referredBy: string | null;

  /* The "build your experience" answers. All optional, because only
     Hallucia asks them and they arrive with docs/schema-hallucia.sql. */
  email: string | null;
  city: string | null;
  /**
   * 'details' when step one has been saved on its own and step two is
   * still to come; 'complete' once they finish. Null for the plain
   * form, which has no half-finished state.
   */
  stage: string | null;
}

export async function saveApplication(a: ApplicationRecord): Promise<boolean> {
  /* The columns that have always existed. An application consists of
     these; everything below is extra detail about it. */
  const core = {
    reference: a.reference,
    departure_code: a.departureCode,
    name: a.name,
    phone: a.phone,
    gender: a.gender,
    age: a.age,
    state: a.state,
    occupation: a.occupation,
    college: a.college,
    /* Empty optional fields are stored as NULL rather than "" so
       "not provided" and "provided as blank" stay distinguishable. */
    instagram: a.instagram || null,
    why: a.why || null,
  };

  /* Plan and payment. Only sent when there is something to say, and
     kept separate because these columns arrive with a migration —
     docs/schema-partner.sql — that may not have been run yet. */
  const extra = {
    ...(a.plan ? { plan: a.plan } : {}),
    ...(a.partnerCode ? { partner_code: a.partnerCode } : {}),
    ...(a.discountInr ? { discount_inr: a.discountInr } : {}),
    ...(a.amountDue !== null ? { amount_due: a.amountDue } : {}),
    ...(a.utr ? { utr: a.utr } : {}),
  };

  /* Who referred them. Its own group because it arrives with a later
     migration, docs/schema-mi.sql. */
  const referral = a.referredBy ? { referred_by: a.referredBy } : {};

  /* The Hallucia answers, from docs/schema-hallucia.sql — the newest
     migration, so the first thing dropped if the insert is refused. */
  const experience = {
    ...(a.email ? { email: a.email } : {}),
    ...(a.city ? { city: a.city } : {}),
    ...(a.stage ? { stage: a.stage } : {}),
  };

  /* PostgREST rejects the entire insert when it is handed a column
     that does not exist — so before a migration is run, every
     application naming one of its columns fails outright. It is not a
     hypothetical: PULSE applications were lost to exactly this.

     So the row is tried largest first, and each retry drops only the
     columns from the NEWEST migration. The order matters. Dropping
     everything at the first failure would mean an unrun schema-mi.sql
     quietly cost every referred applicant their plan, amount and UTR
     too — a referral column taking the payment record down with it.

     A row missing some detail can be repaired from the email. A row
     that was never written cannot be repaired from anything. Loud,
     because each fallback is a state somebody has to come and fix. */
  /* Newest migration first. Each rung drops one group and keeps
     everything older, and a group that is empty is not a rung at all —
     so there is never an identical row tried twice. */
  const groups: { fields: Record<string, unknown>; migration: string }[] = [
    { fields: experience, migration: "docs/schema-hallucia.sql" },
    { fields: referral, migration: "docs/schema-mi.sql" },
    { fields: extra, migration: "docs/schema-partner.sql" },
  ];

  const row: Record<string, unknown> = { ...core, ...extra, ...referral, ...experience };
  if (await insert("applications", row)) return true;

  for (const group of groups) {
    const names = Object.keys(group.fields);
    if (names.length === 0) continue;

    for (const name of names) delete row[name];

    console.error(
      `[store] applications insert failed for ${a.reference} — retrying without ` +
        `${names.join(", ")}. If a column is missing, run ${group.migration}: until ` +
        `then ${names.join(", ")} ${names.length === 1 ? "is" : "are"} NOT being recorded.`
    );
    if (await insert("applications", row)) return true;
  }

  return false;
}

export interface ExperienceRecord {
  plan: string;
  travelMode: string;
  travelCity: string | null;
  travelType: string | null;
  /** The deposit, worked out on the server. Null where travel has to
   *  be quoted by a person and nothing is taken yet. */
  amountDue: number | null;
  utr: string | null;
}

/**
 * Finish an application that was saved at step one.
 *
 * A PATCH rather than an insert: the row already exists, because the
 * details were stored the moment they were given. That is the point of
 * the two steps — somebody who chooses a package and then vanishes is
 * still a person we can call.
 *
 * Returns false on any failure, including a missing column, and the
 * caller must surface that: a step that stored nothing has not
 * completed, whatever the screen says.
 */
export async function completeApplication(
  id: string,
  e: ExperienceRecord
): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      body: JSON.stringify({
        plan: e.plan,
        travel_mode: e.travelMode,
        travel_city: e.travelCity,
        travel_type: e.travelType,
        amount_due: e.amountDue,
        utr: e.utr,
        stage: "complete",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[store] completing ${id} failed (${res.status}): ${await res.text()} — ` +
          `if a column is missing, run docs/schema-hallucia.sql.`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[store] completing application threw", err);
    return false;
  }
}

export interface CollabRecord {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  kind: string;
  dates: string;
  location: string;
  collabOn: string[];
  details: string;
}

export function saveCollaboration(c: CollabRecord): Promise<boolean> {
  return insert("collaborations", {
    name: c.name,
    organisation: c.organisation,
    email: c.email,
    phone: c.phone || null,
    kind: c.kind,
    dates: c.dates || null,
    location: c.location || null,
    collab_on: c.collabOn,
    details: c.details,
  });
}

export interface MessageRecord {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** The departure the enquiry came from, when it came from one. */
  departureCode: string | null;
}

export async function saveMessage(m: MessageRecord): Promise<boolean> {
  const core = {
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
  };

  if (!m.departureCode) return insert("messages", core);

  if (await insert("messages", { ...core, departure_code: m.departureCode })) return true;

  /* Same trap as applications, closed the same way. `departure_code`
     arrives with docs/schema-enquiries.sql, and PostgREST rejects the
     whole insert when handed a column that does not exist — so before
     that SQL is run, every enquiry sent from a departure page would be
     lost while general ones kept working. Store it untagged rather
     than not at all; the email still names the departure. */
  console.error(
    "[store] messages insert failed with departure_code — retrying without it. " +
      "Run docs/schema-enquiries.sql: until then enquiries are stored untagged " +
      "and will not appear on the partner page."
  );
  return insert("messages", core);
}

export interface AmbassadorRecord {
  name: string;
  phone: string;
  email: string;
  age: number;
  college: string;
  year: string;
  city: string;
  state: string;
  instagram: string;
  reach: string;
  why: string;
}

/**
 * A Crew signup.
 *
 * Three outcomes rather than a boolean, because the middle one is not
 * a failure: somebody signing up twice — the same number, a second
 * tab, a friend filling it in for them — should be told they are
 * already on the list, not that something broke and they should try
 * again. The phone number is unique in docs/schema-mi.sql, and a 409
 * from PostgREST is that constraint answering.
 */
export async function saveAmbassador(
  r: AmbassadorRecord
): Promise<"stored" | "duplicate" | "failed"> {
  const cfg = supabaseConfig();
  if (!cfg) return "failed";

  try {
    const res = await fetch(`${cfg.url}/rest/v1/ambassadors`, {
      method: "POST",
      headers: headers(cfg.serviceRoleKey),
      body: JSON.stringify({
        name: r.name,
        phone: r.phone,
        email: r.email,
        age: r.age,
        college: r.college,
        year: r.year,
        city: r.city,
        state: r.state,
        instagram: r.instagram || null,
        reach: r.reach,
        why: r.why || null,
      }),
      cache: "no-store",
    });

    if (res.ok) return "stored";
    if (res.status === 409) return "duplicate";

    console.error(`[store] ambassadors insert failed (${res.status}): ${await res.text()}`);
    return "failed";
  } catch (err) {
    console.error("[store] ambassadors insert threw", err);
    return "failed";
  }
}

export interface SubscriberRecord {
  email: string;
  preference: string;
  source: string;
}

/**
 * Add someone to the mailing list.
 *
 * Upserts on the email: re-submitting the same address updates the
 * existing row instead of erroring on the unique index, and flips
 * anyone who had unsubscribed back to subscribed. So a second submit
 * is a success, not a duplicate-key failure the visitor would see.
 */
/**
 * The id of an application, by its reference.
 *
 * saveApplication returns a boolean because the insert asks for
 * `return=minimal` — deliberately, so applicants' personal data stays
 * out of the response and the logs. This reads back just the id, which
 * is what a document upload has to be attached to.
 */
export async function findApplicationId(reference: string): Promise<string | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/applications?reference=eq.${encodeURIComponent(reference)}&select=id`,
      {
        headers: {
          apikey: cfg.serviceRoleKey,
          authorization: `Bearer ${cfg.serviceRoleKey}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { id: string }[];
    return rows[0]?.id ?? null;
  } catch (err) {
    console.error("[store] application lookup threw", err);
    return null;
  }
}

export async function saveSubscriber(r: SubscriberRecord): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/subscribers?on_conflict=email`, {
      method: "POST",
      headers: {
        ...headers(cfg.serviceRoleKey),
        /* merge-duplicates turns this into an upsert. */
        prefer: "return=minimal,resolution=merge-duplicates",
      },
      body: JSON.stringify({
        email: r.email,
        preference: r.preference || null,
        source: r.source,
        status: "subscribed",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[store] subscribers insert failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[store] subscribers insert threw", err);
    return false;
  }
}
