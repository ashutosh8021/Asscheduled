/* Reads and status updates for the admin area.

   Separate from lib/store.ts, which only ever writes: the public site
   must never gain the ability to read these tables, and keeping the
   read path in its own module makes an accidental import obvious.

   Every call here uses the service role key, so it bypasses row level
   security — which is why each one must sit behind currentAdmin().
   Server-only. */

import { supabaseConfig } from "./env";
import { signedUrl } from "./documents";
import { findPlan } from "./packages";
import {
  MIRRORED_DEPARTURES,
  departureLabel,
  isMirrored,
  mirrorOne,
  sheetConfigured,
  type SheetRow,
} from "./sheet";

export const APPLICATION_STATUSES = ["new", "reviewing", "accepted", "declined"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationRow {
  id: string;
  created_at: string;
  reference: string;
  departure_code: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  state: string;
  occupation: string;
  college: string;
  instagram: string | null;
  why: string | null;
  status: ApplicationStatus;

  /* Plan and payment. All optional on the type rather than nullable,
     because docs/schema-partner.sql adds these columns and rows
     written before it ran simply do not have them. Reading an older
     row must not crash the admin. */
  plan?: string | null;
  partner_code?: string | null;
  discount_inr?: number | null;
  amount_due?: number | null;
  utr?: string | null;
  paid_at?: string | null;
}

export interface MessageRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
}

export interface CollaborationRow {
  id: string;
  created_at: string;
  name: string;
  organisation: string;
  email: string;
  phone: string | null;
  kind: string;
  dates: string | null;
  location: string | null;
  collab_on: string[];
  details: string;
  status: string;
}

function headers(key: string) {
  return { "content-type": "application/json", apikey: key, authorization: `Bearer ${key}` };
}

async function select<T>(path: string): Promise<T[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      headers: headers(cfg.serviceRoleKey),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[adminData] ${path} failed (${res.status}): ${await res.text()}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`[adminData] ${path} threw`, err);
    return [];
  }
}

/* ------------------------------------------------------------
   SHEET MIRROR
   ------------------------------------------------------------
   The sheet shows PULSE applications as they are now, not as they
   were when they arrived — so every row it gets is built from the
   database record rather than from whatever the caller happened to
   be holding. That way the sheet can never claim something Postgres
   does not say. */

/** One application by its reference. */
export async function getApplicationByReference(
  reference: string
): Promise<ApplicationRow | null> {
  const rows = await select<ApplicationRow>(
    `applications?reference=eq.${encodeURIComponent(reference)}&select=*&limit=1`
  );
  return rows[0] ?? null;
}

/** One application by its id. */
export async function getApplicationById(id: string): Promise<ApplicationRow | null> {
  const rows = await select<ApplicationRow>(
    `applications?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
  return rows[0] ?? null;
}

/** Which documents an application has sent, for the sheet's last
 *  column. Names only — never a link: a signed URL in a shared
 *  spreadsheet would hand a partner somebody's Aadhaar. */
export async function documentKindsFor(applicationId: string): Promise<string[]> {
  const rows = await select<{ kind: string }>(
    `documents?application_id=eq.${encodeURIComponent(applicationId)}&select=kind`
  );
  return [...new Set(rows.map((r) => r.kind))].sort();
}

/** Turn a stored application into a sheet line. */
export function sheetRowFrom(r: ApplicationRow, documentKinds: string[] = []): SheetRow {
  const plan = findPlan(r.departure_code, r.plan);

  return {
    receivedAt: r.created_at,
    reference: r.reference,
    status: r.status,
    departure: departureLabel(r.departure_code),
    plan: plan ? `${plan.n} — ${plan.name}` : "",
    name: r.name,
    phone: r.phone,
    gender: r.gender,
    age: r.age,
    state: r.state,
    occupation: r.occupation,
    college: r.college,
    instagram: r.instagram ?? "",
    why: r.why ?? "",
    partner: r.partner_code ?? "",
    /* Blank rather than 0, so "no discount" and "discount of zero" do
       not look like the same thing in a spreadsheet. */
    discountInr: r.discount_inr ?? "",
    amountDue: typeof r.amount_due === "number" ? r.amount_due : "",
    utr: r.utr ?? "",
    documents: documentKinds.join(", "),
  };
}

/**
 * Mirror one application into the sheet, by id or reference.
 *
 * Everything that changes an application calls this: the apply route,
 * the status route, the document upload. Non-PULSE rows drop out here
 * without a database read.
 */
export async function mirrorApplication(
  key: { id: string } | { reference: string }
): Promise<void> {
  if (!sheetConfigured()) return;

  const row =
    "id" in key ? await getApplicationById(key.id) : await getApplicationByReference(key.reference);
  if (!row) return;

  /* Gated on the departure, not on how somebody arrived.
​
     PULSE admits everybody on that departure to their campus and their
     event, so they are told about everybody on it — whether they came
     through PULSE or found us on their own. Anything else would leave
     the festival with a partial list of who is turning up.

     Nothing else is mirrored. `sharedWith` on the departure is the one
     switch, and it is the same field the privacy policy describes. */
  if (!isMirrored(row.departure_code)) return;

  await mirrorOne(sheetRowFrom(row, await documentKindsFor(row.id)));
}

/**
 * Every mirrored application, for a full resync.
 *
 * Oldest first, so a sheet built from scratch reads in the order
 * things actually happened, and so an existing sheet's rows keep the
 * positions they already have.
 */
export async function allSheetRows(): Promise<SheetRow[]> {
  /* Same gate as the live mirror, and it has to stay that way: a
     resync must never push people the live path withheld, nor miss
     people it sent. */
  const departures = MIRRORED_DEPARTURES.map((d) => encodeURIComponent(d)).join(",");
  const apps = await select<ApplicationRow>(
    `applications?departure_code=in.(${departures})&select=*&order=created_at.asc`
  );
  if (apps.length === 0) return [];

  /* One query for every document rather than one per applicant: a
     resync of two hundred rows should not be two hundred round trips. */
  const docs = await select<{ application_id: string; kind: string }>(
    "documents?select=application_id,kind"
  );
  const byApp = new Map<string, string[]>();
  for (const d of docs) {
    const list = byApp.get(d.application_id) ?? [];
    if (!list.includes(d.kind)) list.push(d.kind);
    byApp.set(d.application_id, list);
  }

  return apps.map((a) => sheetRowFrom(a, (byApp.get(a.id) ?? []).sort()));
}

export interface ApplicationFilter {
  departure?: string;
  status?: string;
}

export function listApplications(f: ApplicationFilter = {}): Promise<ApplicationRow[]> {
  const params = new URLSearchParams({ select: "*", order: "created_at.desc" });
  /* PostgREST filter syntax: column=eq.value */
  if (f.departure) params.set("departure_code", `eq.${f.departure}`);
  if (f.status) params.set("status", `eq.${f.status}`);
  return select<ApplicationRow>(`applications?${params}`);
}

export function listMessages(): Promise<MessageRow[]> {
  return select<MessageRow>("messages?select=*&order=created_at.desc");
}

export function listCollaborations(): Promise<CollaborationRow[]> {
  return select<CollaborationRow>("collaborations?select=*&order=created_at.desc");
}

/* ------------------------------------------------------------
   DOCUMENTS
   ------------------------------------------------------------ */

export interface DocumentBundleFile {
  id: string;
  kind: string;
  mime: string;
  bytes: number;
  uploadedAt: string;
  /** Signed at request time. Short-lived by design — see lib/documents. */
  url: string | null;
}

export interface DocumentBundle {
  applicationId: string;
  reference: string;
  name: string;
  phone: string;
  college: string;
  departureCode: string;
  status: string;
  files: DocumentBundleFile[];
}

interface RawDocument {
  id: string;
  kind: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  storage_path: string;
  application_id: string;
  applications: {
    reference: string;
    name: string;
    phone: string;
    college: string;
    departure_code: string;
    status: string;
  } | null;
}

/**
 * Every uploaded document, grouped by the person who sent it.
 *
 * Read through PostgREST's embedded select rather than two round trips
 * — the foreign key from documents to applications is what makes that
 * possible, and it keeps the two in step with no join written here.
 *
 * URLs are signed as the page renders. They expire in minutes, so this
 * is only ever correct for a freshly loaded page — which is why the
 * admin route is force-dynamic.
 */
export async function listDocumentBundles(departure?: string): Promise<DocumentBundle[]> {
  const rows = await select<RawDocument>(
    "documents?select=id,kind,mime_type,size_bytes,uploaded_at,storage_path,application_id," +
      "applications(reference,name,phone,college,departure_code,status)" +
      "&order=uploaded_at.desc"
  );

  const byApplication = new Map<string, DocumentBundle>();

  for (const r of rows) {
    const app = r.applications;
    if (!app) continue;

    /* Scoped before anything is signed, not after. A partner viewing
       their own departure must never cause a signed URL to be minted
       for somebody else's document — filtering the finished list would
       still have created the URL first. */
    if (departure && app.departure_code !== departure) continue;

    let bundle = byApplication.get(r.application_id);
    if (!bundle) {
      bundle = {
        applicationId: r.application_id,
        reference: app.reference,
        name: app.name,
        phone: app.phone,
        college: app.college,
        departureCode: app.departure_code,
        status: app.status,
        files: [],
      };
      byApplication.set(r.application_id, bundle);
    }

    bundle.files.push({
      id: r.id,
      kind: r.kind,
      mime: r.mime_type,
      bytes: r.size_bytes,
      uploadedAt: r.uploaded_at,
      url: await signedUrl(r.storage_path),
    });
  }

  return [...byApplication.values()];
}

/** How many people have sent something. For the tab badge. */
export async function documentBundleCount(): Promise<number> {
  const rows = await select<{ application_id: string }>("documents?select=application_id");
  return new Set(rows.map((r) => r.application_id)).size;
}

/** Counts per status, for the filter chips. */
export async function applicationCounts(): Promise<Record<string, number>> {
  const rows = await select<{ status: string }>("applications?select=status");
  const out: Record<string, number> = { all: rows.length };
  for (const r of rows) out[r.status] = (out[r.status] ?? 0) + 1;
  return out;
}

/**
 * Move an application to a new status.
 *
 * The status is checked against the allowed list here as well as by a
 * database constraint — a bad value should fail before it becomes a
 * confusing Postgres error in the response.
 */
export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;
  if (!APPLICATION_STATUSES.includes(status)) return false;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
        body: JSON.stringify({ status }),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error(`[adminData] status update failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[adminData] status update threw", err);
    return false;
  }
}
