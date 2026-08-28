/* Mirrors each application into a Google Sheet, live.
 *
 * Deliberately a Google Apps Script Web App rather than the Sheets
 * API: no npm dependency (CLAUDE.md wants a conversation before one is
 * added), no service-account key to store, no OAuth dance. A script
 * bound to the sheet exposes a URL, and we POST JSON to it.
 *
 * The endpoint has to be deployed "anyone can access" for us to reach
 * it without credentials, so the payload carries a shared secret and
 * the script drops anything without it. That stops strangers appending
 * rows; it was never able to read the sheet either way.
 *
 * Nothing here can fail an application. A Google outage, a wrong URL,
 * a revoked deployment — all of it is logged and swallowed. The row is
 * already safe in Postgres by the time this runs, and an applicant
 * must never be told they failed because a spreadsheet did.
 *
 * See docs/admin.md for the script itself and the deployment steps.
 */

export interface SheetRow {
  reference: string;
  departure: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  state: string;
  occupation: string;
  college: string;
  instagram: string;
  why: string;
  partner: string;
  discountInr: number;
  amountDue: number;
  utr: string;
}

function sheetConfig(): { url: string; secret: string } | null {
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_WEBHOOK_SECRET;
  if (!url || !secret) return null;
  return { url, secret };
}

/** True when a sheet is wired up at all. */
export function sheetConfigured(): boolean {
  return sheetConfig() !== null;
}

/**
 * Append one application to the sheet.
 *
 * Returns whether it landed, for logging only — callers must not treat
 * false as a failed application.
 */
export async function appendToSheet(row: SheetRow): Promise<boolean> {
  const cfg = sheetConfig();
  if (!cfg) return false;

  try {
    /* Apps Script redirects to a googleusercontent URL before running,
       so redirects must be followed. It also answers 200 with a text
       body rather than JSON, which is why nothing here parses one. */
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: cfg.secret, ...row }),
      redirect: "follow",
      cache: "no-store",
      /* A spreadsheet must not hold an applicant waiting. */
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[sheet] append failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sheet] append threw", err);
    return false;
  }
}
