/* Reads and status updates for the admin area.

   Separate from lib/store.ts, which only ever writes: the public site
   must never gain the ability to read these tables, and keeping the
   read path in its own module makes an accidental import obvious.

   Every call here uses the service role key, so it bypasses row level
   security — which is why each one must sit behind currentAdmin().
   Server-only. */

import { supabaseConfig } from "./env";
import { signedUrl } from "./documents";

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
export async function listDocumentBundles(): Promise<DocumentBundle[]> {
  const rows = await select<RawDocument>(
    "documents?select=id,kind,mime_type,size_bytes,uploaded_at,storage_path,application_id," +
      "applications(reference,name,phone,college,departure_code,status)" +
      "&order=uploaded_at.desc"
  );

  const byApplication = new Map<string, DocumentBundle>();

  for (const r of rows) {
    const app = r.applications;
    if (!app) continue;

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
