import { NextResponse, after } from "next/server";
import {
  ACCEPTED_MIME,
  ALL_DOCUMENT_KINDS,
  SEND_BYTES,
  resolveUploadToken,
  storeDocument,
  type DocumentKind,
} from "@/lib/documents";
import { mirrorApplication } from "@/lib/adminData";

/* Document upload for an accepted applicant.

   Everything here is checked again server-side. The upload page limits
   the file picker and the size, but a disabled control in a browser
   stops nobody who opens devtools — this route is the boundary that
   actually holds.

   The token is the only authorisation. There is no session: the person
   uploading has a link, not an account. That is why the token is long,
   random, single-purpose, expiring, and revocable by re-issuing. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

/* Sniff the real type from the first bytes rather than trusting the
   Content-Type the browser attached, which the sender controls. */
function sniff(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("That upload did not arrive in one piece. Try again.", 400);
  }

  const token = String(form.get("token") ?? "");
  if (!token) return fail("This link is not valid.", 400);

  const target = await resolveUploadToken(token);
  if (!target) {
    /* One message for unknown, expired and withdrawn alike: telling a
       stranger which of the three it is tells them something. */
    return fail("This link has expired or is no longer valid. Ask us for a new one.", 403);
  }

  /* All three kinds, including the payment screenshot. This used to
     check DOCUMENT_KINDS, which is only the two identity documents, so
     every payment proof was refused as "Unknown document type" while
     the form went on believing it had sent one. */
  const kind = String(form.get("kind") ?? "") as DocumentKind;
  if (!ALL_DOCUMENT_KINDS.includes(kind)) return fail("Unknown document type.", 400);

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file was attached.", 400);

  if (file.size <= 0) return fail("That file is empty.", 400);
  /* The send limit, not the choose limit. Large photos are shrunk in
     the browser before they get here; anything still over this could
     not have crossed Vercel's 4.5MB body cap anyway. */
  if (file.size > SEND_BYTES) {
    return fail(`That file is over ${Math.round(SEND_BYTES / 1024 / 1024)}MB. Send a smaller one.`, 413);
  }

  const bytes = await file.arrayBuffer();
  const sniffed = sniff(new Uint8Array(bytes.slice(0, 16)));

  if (!sniffed || !ACCEPTED_MIME.includes(sniffed as (typeof ACCEPTED_MIME)[number])) {
    return fail("Send a JPG, PNG, WebP or PDF.", 415);
  }

  const stored = await storeDocument({
    applicationId: target.id,
    reference: target.reference,
    kind,
    bytes,
    /* The sniffed type, not the declared one. */
    mime: sniffed,
  });

  if (!stored) {
    return fail("We could not save that. Try again, or write to us.", 502);
  }

  /* The sheet's documents column says what has come in, so it has to
     be told when something does. Names only, never a link — a signed
     URL sitting in a shared spreadsheet would hand a partner
     somebody's Aadhaar. */
  after(() => mirrorApplication({ id: target.id }));

  return NextResponse.json({ ok: true, kind });
}
