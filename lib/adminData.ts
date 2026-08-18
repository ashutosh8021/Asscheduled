/* Reads and status updates for the admin area.

   Separate from lib/store.ts, which only ever writes: the public site
   must never gain the ability to read these tables, and keeping the
   read path in its own module makes an accidental import obvious.

   Every call here uses the service role key, so it bypasses row level
   security — which is why each one must sit behind currentAdmin().
   Server-only. */

import { supabaseConfig } from "./env";

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
