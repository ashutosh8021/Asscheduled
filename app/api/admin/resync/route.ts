import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { allSheetRows } from "@/lib/adminData";
import { mirrorApplications, sheetConfigured } from "@/lib/sheet";

/* Rewrite every mirrored application into the sheet.
 *
 * The live mirror is fire-and-forget: it must never hold an applicant
 * or an admin waiting on Google, which means an update can be missed —
 * an outage, a redeployed script, a revoked URL. This is the repair.
 * It is also how a brand new sheet gets filled with everything that
 * arrived before it existed.
 *
 * Safe to run as often as you like. Every row is keyed on its
 * reference, so this updates what is there and appends what is not; it
 * never duplicates and never clears a column the sheet's owner added.
 *
 * Awaited, unlike the live mirror — somebody pressed a button and is
 * watching for the answer, and "done" has to mean done. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  /* First and non-negotiable: this reads every applicant's personal
     data and pushes it to a spreadsheet shared outside the company. */
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  if (!sheetConfigured()) {
    return NextResponse.json(
      { ok: false, error: "No sheet is connected. Set SHEET_WEBHOOK_URL and SHEET_WEBHOOK_SECRET." },
      { status: 409 }
    );
  }

  const rows = await allSheetRows();
  const res = await mirrorApplications(rows);

  console.info(
    `[admin] ${admin.email} resynced ${rows.length} row(s) to the sheet — ` +
      `ok=${res.ok} ${res.detail}`
  );

  /* Hand back what actually went wrong. The first version of this said
     "check the script is still deployed" whatever happened, which sent
     somebody to inspect a perfectly healthy Apps Script while the real
     problem was in an environment variable. A wrong diagnosis costs
     more than no diagnosis. */
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true, rows: rows.length });
}
