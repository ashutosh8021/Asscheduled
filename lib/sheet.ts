/* Mirrors PULSE applications into a Google Sheet, live.
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

import { DEPARTURES, sharedDepartureIds } from "./departures";

/* ------------------------------------------------------------------
   WHAT GETS MIRRORED

   Only departures run with a partner festival — PULSE today. Everyone
   on such a departure is mirrored, however they found us: the festival
   admits all of them, so a partial list would be no use to anybody.

   A shared spreadsheet is still a disclosure to a third party, so the
   gate stays as narrow as the job allows — by departure, never the
   whole applications table. PULSE has no business seeing who applied
   to Thomso.

   Derived from `sharedWith` on the departure rather than listed here,
   so it cannot come apart from what the application form tells people.
   The same field that puts somebody's details in front of a festival
   is the field that makes the form say so before they submit. A list
   maintained separately would let those two drift, and the direction
   it would drift is the bad one.

   This is the only gate. Every path into the sheet goes through
   mirrorApplications below, so a new call site cannot widen it.
   ------------------------------------------------------------------ */
export const MIRRORED_DEPARTURES: string[] = sharedDepartureIds();

export function isMirrored(departureCode: string): boolean {
  return MIRRORED_DEPARTURES.includes(departureCode);
}

/**
 * One line of the sheet.
 *
 * Keyed on `reference`: the script looks that up and overwrites the
 * matching row, or appends when it is new. An upsert rather than an
 * append, because the sheet has to show the application as it is NOW —
 * accepted, documents in, paid — not as it was the second it arrived.
 *
 * Upsert rather than rewriting the sheet wholesale so that row
 * positions never move and columns past the mirrored range are never
 * touched. Somebody will add a notes column, and it has to stay next
 * to the right person.
 */
export interface SheetRow {
  receivedAt: string;
  reference: string;
  status: string;
  departure: string;
  plan: string;
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
  discountInr: number | "";
  amountDue: number | "";
  utr: string;
  documents: string;
}

/**
 * The header row, sent on every push so the script can write it.
 *
 * Sent rather than typed into the sheet by hand, because pasting a
 * tab-separated line into Google Sheets silently drops the tabs and
 * lands the whole thing in A1 — which looks exactly like every column
 * being misaligned, and is the first thing anybody reports. Writing it
 * from here means it is correct on the first push and self-heals if
 * somebody edits it.
 *
 * Index-matched to SHEET_COLUMNS below. Both are checked against each
 * other at module load, so they cannot drift apart unnoticed.
 */
export const SHEET_HEADERS: string[] = [
  "Received",
  "Reference",
  "Status",
  "Departure",
  "Plan",
  "Name",
  "Phone",
  "Gender",
  "Age",
  "State",
  "Occupation",
  "College",
  "Instagram",
  "Why",
  "Partner",
  "Discount",
  "Amount due",
  "UTR",
  "Documents",
];

/** Column order, and the header row. The script writes values in this
 *  order, so the two must not drift — change one, change the other. */
export const SHEET_COLUMNS: (keyof SheetRow)[] = [
  "receivedAt",
  "reference",
  "status",
  "departure",
  "plan",
  "name",
  "phone",
  "gender",
  "age",
  "state",
  "occupation",
  "college",
  "instagram",
  "why",
  "partner",
  "discountInr",
  "amountDue",
  "utr",
  "documents",
];

/* A header that has drifted from the columns would silently mislabel
   every row in a spreadsheet somebody else reads — a wrong heading is
   worse than no heading. Cheap to check, and it fails at startup
   rather than in front of a partner. */
if (SHEET_HEADERS.length !== SHEET_COLUMNS.length) {
  throw new Error(
    `[sheet] ${SHEET_HEADERS.length} headers for ${SHEET_COLUMNS.length} columns — they must match.`
  );
}

function sheetConfig(): { url: string; secret: string } | null {
  /* Trimmed, because these are pasted into a dashboard by hand and a
     trailing newline or space is invisible there. A stray character on
     the URL makes fetch throw "Invalid URL" — which reads as the sheet
     rejecting us rather than as a typo in a settings field, and sends
     you looking in entirely the wrong place. */
  const url = process.env.SHEET_WEBHOOK_URL?.trim();
  const secret = process.env.SHEET_WEBHOOK_SECRET?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

/** True when a sheet is wired up at all. */
export function sheetConfigured(): boolean {
  return sheetConfig() !== null;
}

/** The display name a sheet row uses for a departure. */
export function departureLabel(code: string): string {
  const d = DEPARTURES.find((x) => x.id === code);
  return d ? `${d.fest} — ${d.campus}` : code;
}

/**
 * Why a webhook URL cannot be used, or null if it is fine.
 *
 * The mistake this exists for is real and was made: Apps Script shows
 * its URL abbreviated with an ellipsis, and that abbreviated string
 * got pasted into the environment. It parses as a URL and fails only
 * when Google 404s it, so without this the error is a bare 404 with no
 * hint that the setting is wrong.
 */
function urlProblem(url: string): string | null {
  if (url.includes("...") || url.includes("…")) {
    return "looks truncated — it contains an ellipsis, so it is probably the shortened URL Apps Script displays rather than the one behind the Copy button";
  }
  if (/\s/.test(url)) return "contains a space or line break";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "is not a valid URL";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "is not an http(s) URL";
  }
  /* Only asserted for Google's own host, where we know the shape. */
  if (parsed.hostname.endsWith("script.google.com") && !parsed.pathname.endsWith("/exec")) {
    return "is an Apps Script URL that does not end in /exec";
  }
  return null;
}

export interface MirrorResult {
  ok: boolean;
  /** What actually happened, for the admin and the logs. Never guesses:
   *  "check the script is deployed" is unhelpful when the real problem
   *  is a space on the end of an environment variable. */
  detail: string;
}

/**
 * Push rows into the sheet, creating or updating each by reference.
 *
 * Takes an array so a resync is one request rather than one per
 * applicant — Apps Script is slow and rate-limited, and rewriting two
 * hundred rows one POST at a time would take minutes and trip quotas.
 *
 * Returns what happened, for the admin and the logs. Callers must not
 * treat a failure as a failed application.
 */
export async function mirrorApplications(rows: SheetRow[]): Promise<MirrorResult> {
  const cfg = sheetConfig();
  if (!cfg) return { ok: false, detail: "No sheet is configured." };

  /* Caught here rather than by fetch, so the message names the setting
     instead of surfacing a bare "Invalid URL".

     Checks the shape of a URL, not the shape of Google's URL. An
     earlier version required script.google.com/macros/s/…/exec, which
     did catch the real mistake but also refused every other endpoint —
     including a local one, which made this untestable, and any future
     URL Google decides to issue. */
  const bad = urlProblem(cfg.url);
  if (bad) {
    return { ok: false, detail: `SHEET_WEBHOOK_URL ${bad} (got ${JSON.stringify(cfg.url.slice(0, 70))}).` };
  }
  /* An empty push is still worth sending: it rewrites the header, so
     RESYNC repairs a sheet's headings even before anybody applies. */

  try {
    /* Apps Script redirects to a googleusercontent URL before running,
       so redirects must be followed. It also answers 200 with a text
       body rather than JSON, which is why nothing here parses one. */
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: cfg.secret,
        header: SHEET_HEADERS,
        columns: SHEET_COLUMNS,
        rows,
      }),
      redirect: "follow",
      cache: "no-store",
      /* A spreadsheet must not hold an applicant waiting. Longer than
         a single row needs, because a resync sends everything at once
         and Apps Script is not quick. */
      signal: AbortSignal.timeout(rows.length > 1 ? 25000 : 8000),
    });

    const body = (await res.text()).slice(0, 200).trim();

    if (!res.ok) {
      const detail = `The sheet answered ${res.status}: ${body}`;
      console.error(`[sheet] ${detail}`);
      return { ok: false, detail };
    }

    /* The script answers "no" — with a 200 — when the secret does not
       match. Without this it counts as success and the sheet silently
       never fills, which is the worst possible failure: everything
       reports fine and nothing arrives. */
    if (body === "no") {
      const detail =
        "The script rejected our secret. SHEET_WEBHOOK_SECRET does not match " +
        "the one in the Apps Script.";
      console.error(`[sheet] ${detail}`);
      return { ok: false, detail };
    }

    return { ok: true, detail: body || "ok" };
  } catch (err) {
    /* Names the two that actually happen, because "fetch failed" tells
       nobody anything. */
    const e = err as { name?: string; message?: string };
    const detail =
      e.name === "TimeoutError" || e.name === "AbortError"
        ? `The sheet did not answer in time (${rows.length} row(s)).`
        : `Could not reach the sheet: ${e.name ?? "Error"} ${e.message ?? ""}`.trim();
    console.error(`[sheet] ${detail}`, err);
    return { ok: false, detail };
  }
}

/**
 * Mirror one application.
 *
 * Returns a promise, and callers must keep hold of it.
 *
 * It used to be fire-and-forget — `void` the promise and let it finish
 * on its own, so nobody waited on Google. That works on a long-running
 * server and silently does nothing on a serverless one: Vercel is free
 * to freeze the invocation the moment the response is sent, and an
 * in-flight fetch dies with it. The symptom is exact and baffling —
 * every awaited thing works (the row saves, the email sends) and only
 * the sheet stays empty, in production, while local is perfect.
 *
 * So the promise comes back here, and each route hands it to `after()`
 * from next/server, which keeps the invocation alive until it settles
 * without making the applicant wait for it.
 */
export async function mirrorOne(row: SheetRow): Promise<void> {
  const res = await mirrorApplications([row]);
  if (!res.ok && sheetConfigured()) {
    console.error(`[sheet] missed ${row.reference} — ${res.detail}`);
  }
}
