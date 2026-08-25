import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { abs } from "@/lib/site";
import {
  deleteDocument,
  issueUploadToken,
  listDocuments,
  signedUrl,
} from "@/lib/documents";

/* Admin side of identity documents: issue an upload link, view what
   has been uploaded, and purge it.

   The admin check is first and non-negotiable — this route writes with
   the service role key, which bypasses row level security entirely,
   and it hands out URLs to people's government ID.

   Every action is logged with the admin's email. Someone looking at a
   traveller's Aadhaar should leave a trace of having done so. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return bad("Not signed in.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("Bad request.", 400);
  }

  const src = body as Record<string, unknown>;
  const id = typeof src.id === "string" ? src.id : "";
  const action = typeof src.action === "string" ? src.action : "";
  if (!id) return bad("Missing id.", 400);

  if (action === "issue") {
    const token = await issueUploadToken(id);
    if (!token) return bad("Could not issue a link.", 502);

    /* Logged without the token: the link is the credential, and a
       credential in a log file is a credential that has leaked. */
    console.info(`[admin] ${admin.email} issued an upload link for ${id}`);
    return NextResponse.json({ ok: true, url: abs(`/documents/${token}`) });
  }

  if (action === "list") {
    const docs = await listDocuments(id);
    /* Signed at view time, expiring in minutes. */
    const withUrls = await Promise.all(
      docs.map(async (d) => ({
        id: d.id,
        kind: d.kind,
        mime: d.mime_type,
        bytes: d.size_bytes,
        uploadedAt: d.uploaded_at,
        url: await signedUrl(d.storage_path),
      }))
    );
    if (withUrls.length) {
      console.info(`[admin] ${admin.email} viewed documents for ${id}`);
    }
    return NextResponse.json({ ok: true, documents: withUrls });
  }

  if (action === "purge") {
    const docs = await listDocuments(id);
    let removed = 0;
    for (const d of docs) {
      if (await deleteDocument(d.id, d.storage_path)) removed += 1;
    }
    console.info(`[admin] ${admin.email} purged ${removed} document(s) for ${id}`);
    return NextResponse.json({ ok: true, removed });
  }

  return bad("Unknown action.", 400);
}
