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

export type DocumentKind = "photo_id" | "college_id" | "payment_proof";

/** The two identity documents, asked for together. */
export const DOCUMENT_KINDS: DocumentKind[] = ["photo_id", "college_id"];

/** Proof of a UPI transfer. Separate from the list above because it is
 *  asked for alongside the UTR in the payment block, not with the IDs,
 *  and only where a departure takes a booking amount. */
export const PAYMENT_KIND: DocumentKind = "payment_proof";

export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

/* Matches the bucket's own 2MB cap. Files are not resized for anyone —
   people compress their own before uploading, and the form says so up
   front rather than letting them pick a 4MB photo and then fail. */
export const MAX_BYTES = 2_000_000;
