import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { deleteDocument, listDocuments } from "@/lib/documents";
import { deleteApplication, getApplicationById, sheetRowFrom } from "@/lib/adminData";
import { isMirrored, mirrorApplications, sheetConfigured } from "@/lib/sheet";

/* Delete an application and everything attached to it.
 *
 * Irreversible, which is why it is its own route rather than another
 * action on the status one: nothing here should be reachable by
 * accident, and every step is logged with the admin's email.
 *
 * Order matters. Storage objects go first, because a deleted row is a
 * lost pointer — the file would stay in the bucket with nothing left
 * to find it by. Then the document rows, then the application. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  const src = body as Record<string, unknown>;
  const id = typeof src.id === "string" ? src.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

  const row = await getApplicationById(id);
  if (!row) {
    return NextResponse.json({ ok: false, error: "No such application." }, { status: 404 });
  }

  /* The sheet cannot be deleted from — the Apps Script only ever
     upserts. So the row is marked deleted before it goes, otherwise a
     partner keeps reading a live-looking entry for somebody who is no
     longer in the database. */
  if (sheetConfigured() && isMirrored(row.departure_code)) {
    const res = await mirrorApplications([{ ...sheetRowFrom(row), status: "deleted" }]);
    if (!res.ok) {
      console.error(`[admin] could not mark ${row.reference} deleted in the sheet: ${res.detail}`);
    }
  }

  /* Objects before rows. */
  const docs = await listDocuments(id);
  let files = 0;
  for (const d of docs) {
    if (await deleteDocument(d.id, d.storage_path)) files += 1;
  }
  if (files !== docs.length) {
    console.error(
      `[admin] ${admin.email} deleting ${row.reference}: removed ${files} of ${docs.length} ` +
        "document(s) — the rest may be orphaned in storage."
    );
  }

  const gone = await deleteApplication(id);
  if (!gone) {
    return NextResponse.json(
      { ok: false, error: "Documents were removed but the application row would not delete." },
      { status: 502 }
    );
  }

  console.info(
    `[admin] ${admin.email} DELETED ${row.reference} (${row.name}, ${row.departure_code}) ` +
      `and ${files} document(s)`
  );

  return NextResponse.json({ ok: true, reference: row.reference, files });
}
