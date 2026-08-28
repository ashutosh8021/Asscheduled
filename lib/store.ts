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
  /* Partner pricing. All three are the server's own calculation — the
     browser never sends an amount, so there is nothing here it could
     have chosen. Null when nobody arrived on a partner link. */
  partnerCode: string | null;
  discountInr: number | null;
  amountDue: number | null;
  /** The UPI reference the applicant typed. Checked by hand. */
  utr: string | null;
}

export function saveApplication(a: ApplicationRecord): Promise<boolean> {
  return insert("applications", {
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

    /* Only sent when there is something to say.
​
       These columns arrive with docs/schema-partner.sql, and PostgREST
       rejects the whole insert if it is handed a column that does not
       exist — including one set to null. Naming them unconditionally
       would mean that deploying this code before running that SQL
       broke every application, partner or not. Spread in only when
       populated, so the ordinary path is byte-for-byte what it was. */
    ...(a.partnerCode ? { partner_code: a.partnerCode } : {}),
    ...(a.discountInr ? { discount_inr: a.discountInr } : {}),
    ...(a.amountDue !== null ? { amount_due: a.amountDue } : {}),
    ...(a.utr ? { utr: a.utr } : {}),
  });
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
}

export function saveMessage(m: MessageRecord): Promise<boolean> {
  return insert("messages", {
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
  });
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
