/* Identity documents for accepted applicants.

   The shape of this, and why:

   Documents are requested only after an application is ACCEPTED. Nobody
   who is rejected ever uploads anything, so the store only ever holds
   documents for people actually travelling. That is the strongest
   control available — you cannot leak what you never held.

   The upload link carries a random token. Only its SHA-256 is stored,
   never the token itself, for the same reason a password is not stored:
   anyone who reads the applications table cannot use what they find to
   open somebody's upload page.

   Storage is a private bucket. Objects are never public; the admin
   views them through a signed URL that expires in minutes, so a URL
   that leaks out of a screenshot or a log is useless by the time
   anyone tries it.

   Server-only — this module reads the service role key. */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseConfig } from "./env";
import type { DocumentKind } from "./documentRules";

/** Private bucket. Must NOT be public — see docs/admin.md. */
export const BUCKET = "documents";

/** How long an upload link stays usable. */
const LINK_DAYS = 14;

/** Signed-URL lifetime for admin viewing, in seconds. */
const SIGNED_URL_TTL = 300;

/* The acceptance rules live in lib/documentRules.ts so the upload form
   can import them without dragging node:crypto into the browser
   bundle. Re-exported here so server code has one place to look. */
export {
  ACCEPTED_MIME,
  ALL_DOCUMENT_KINDS,
  DOCUMENT_KINDS,
  MAX_BYTES,
  SEND_BYTES,
} from "./documentRules";
export type { DocumentKind } from "./documentRules";

export interface DocumentRow {
  id: string;
  application_id: string;
  kind: DocumentKind;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

/** The applicant an upload link belongs to. Deliberately narrow: the
 *  upload page needs a name to greet and nothing else. */
export interface TokenTarget {
  id: string;
  reference: string;
  name: string;
  departure_code: string;
  status: string;
}

function headers(key: string) {
  return {
    "content-type": "application/json",
    apikey: key,
    authorization: `Bearer ${key}`,
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issue an upload link for an application.
 *
 * Returns the raw token exactly once — it is never readable again,
 * because only its hash is stored. Re-issuing replaces the previous
 * link, which is also how you revoke one.
 */
export async function issueUploadToken(applicationId: string): Promise<string | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + LINK_DAYS * 86400_000).toISOString();

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/applications?id=eq.${encodeURIComponent(applicationId)}`,
      {
        method: "PATCH",
        headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
        body: JSON.stringify({
          documents_token_hash: hashToken(token),
          documents_expires_at: expires,
        }),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error(`[documents] token issue failed (${res.status}): ${await res.text()}`);
      return null;
    }
    return token;
  } catch (err) {
    console.error("[documents] token issue threw", err);
    return null;
  }
}

/**
 * Resolve an upload token to its application.
 *
 * Null for anything not currently valid: unknown token, expired link,
 * or a declined application. Declining closes the upload page with it.
 */
export async function resolveUploadToken(token: string): Promise<TokenTarget | null> {
  const cfg = supabaseConfig();
  if (!cfg || !token) return null;

  const hash = hashToken(token);

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/applications` +
        `?documents_token_hash=eq.${encodeURIComponent(hash)}` +
        `&select=id,reference,name,departure_code,status,documents_expires_at`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!res.ok) return null;

    const rows = (await res.json()) as (TokenTarget & { documents_expires_at: string })[];
    const row = rows[0];
    if (!row) return null;

    /* The lookup above is already by hash, so this is belt and braces
       against a future refactor comparing raw values. */
    const a = Buffer.from(hash);
    const b = Buffer.from(hashToken(token));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    /* Valid while the application is live. Two flows share this: some
       departures collect documents at application time (status "new"),
       others after selection ("accepted"). Declining kills the link in
       both cases — which is also how you revoke one. */
    if (row.status === "declined") return null;
    if (!row.documents_expires_at || new Date(row.documents_expires_at) < new Date()) return null;

    return {
      id: row.id,
      reference: row.reference,
      name: row.name,
      departure_code: row.departure_code,
      status: row.status,
    };
  } catch (err) {
    console.error("[documents] token resolve threw", err);
    return null;
  }
}

/**
 * Put a file in the private bucket and record it.
 *
 * The object key includes the application id, so a leaked path cannot
 * be walked sideways into someone else's document.
 */
export async function storeDocument(opts: {
  applicationId: string;
  reference: string;
  kind: DocumentKind;
  bytes: ArrayBuffer;
  mime: string;
}): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  const ext =
    opts.mime === "image/png" ? "png" : opts.mime === "image/webp" ? "webp" : "jpg";
  const path = `${opts.applicationId}/${opts.kind}.${ext}`;

  try {
    const up = await fetch(
      `${cfg.url}/storage/v1/object/${BUCKET}/${encodeURI(path)}`,
      {
        method: "POST",
        headers: {
          apikey: cfg.serviceRoleKey,
          authorization: `Bearer ${cfg.serviceRoleKey}`,
          "content-type": opts.mime,
          /* Re-uploading replaces rather than accumulating copies of
             somebody's ID. */
          "x-upsert": "true",
        },
        body: opts.bytes,
        cache: "no-store",
      }
    );
    if (!up.ok) {
      console.error(`[documents] upload failed (${up.status}): ${await up.text()}`);
      return false;
    }

    const row = await fetch(`${cfg.url}/rest/v1/documents?on_conflict=application_id,kind`, {
      method: "POST",
      headers: {
        ...headers(cfg.serviceRoleKey),
        prefer: "return=minimal,resolution=merge-duplicates",
      },
      body: JSON.stringify({
        application_id: opts.applicationId,
        kind: opts.kind,
        storage_path: path,
        mime_type: opts.mime,
        size_bytes: opts.bytes.byteLength,
        uploaded_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });
    if (!row.ok) {
      console.error(`[documents] row insert failed (${row.status}): ${await row.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[documents] store threw", err);
    return false;
  }
}

/** What has already been uploaded against an application. */
export async function listDocuments(applicationId: string): Promise<DocumentRow[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/documents?application_id=eq.${encodeURIComponent(applicationId)}&select=*`,
      { headers: headers(cfg.serviceRoleKey), cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()) as DocumentRow[];
  } catch {
    return [];
  }
}

/**
 * A short-lived URL for the admin to view one document.
 *
 * Minutes, not hours: a signed URL that ends up in a screenshot, a
 * browser history or a log should be dead long before anyone finds it.
 */
export async function signedUrl(storagePath: string): Promise<string | null> {
  const cfg = supabaseConfig();
  if (!cfg) return null;

  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/sign/${BUCKET}/${encodeURI(storagePath)}`, {
      method: "POST",
      headers: headers(cfg.serviceRoleKey),
      body: JSON.stringify({ expiresIn: SIGNED_URL_TTL }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[documents] sign failed (${res.status}): ${await res.text()}`);
      return null;
    }
    const json = (await res.json()) as { signedURL?: string };
    return json.signedURL ? `${cfg.url}/storage/v1${json.signedURL}` : null;
  } catch (err) {
    console.error("[documents] sign threw", err);
    return null;
  }
}

/**
 * Remove one document — the object first, then the row.
 *
 * That order is deliberate. If the object cannot be deleted we keep the
 * row, because the row is the only thing that knows the file exists:
 * dropping it first would strand somebody's ID in the bucket with
 * nothing left pointing at it, and the retention promise in the privacy
 * policy would be quietly false.
 *
 * The storage DELETE carries no content-type. Supabase rejects a
 * bodyless DELETE that declares application/json — "Body cannot be
 * empty when content-type is set to application/json" — and the earlier
 * version of this function sent the shared JSON headers, swallowed the
 * 400 and reported success.
 */
export async function deleteDocument(id: string, storagePath: string): Promise<boolean> {
  const cfg = supabaseConfig();
  if (!cfg) return false;

  try {
    const obj = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${encodeURI(storagePath)}`, {
      method: "DELETE",
      headers: {
        apikey: cfg.serviceRoleKey,
        authorization: `Bearer ${cfg.serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!obj.ok) {
      console.error(`[documents] object delete failed (${obj.status}): ${await obj.text()}`);
      /* Keep the row. It is the only handle left on the file. */
      return false;
    }

    const res = await fetch(`${cfg.url}/rest/v1/documents?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { ...headers(cfg.serviceRoleKey), prefer: "return=minimal" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[documents] row delete failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[documents] delete threw", err);
    return false;
  }
}
