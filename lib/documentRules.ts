/* What counts as an acceptable document.
 *
 * Separate from lib/documents.ts because the upload form is a client
 * component and lib/documents.ts reaches for node:crypto — importing
 * it into the browser bundle fails the build. These are the only parts
 * both sides need, and they contain no secrets and no I/O.
 *
 * The browser uses them to set up the file picker and give immediate
 * feedback. The server uses them as the boundary that actually holds:
 * a limit enforced only in a file input stops nobody. */

export type DocumentKind = "photo_id" | "college_id";

export const DOCUMENT_KINDS: DocumentKind[] = ["photo_id", "college_id"];

export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export const MAX_BYTES = 8 * 1024 * 1024;
