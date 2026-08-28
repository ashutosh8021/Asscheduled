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

/**
 * Every kind the upload route will accept.
 *
 * Distinct from DOCUMENT_KINDS, which means "the identity documents we
 * ask for together" and drives the two ID fields. Validating uploads
 * against that shorter list rejected every payment screenshot with
 * "Unknown document type" — the form sent them, the route refused
 * them, and nothing anywhere said so.
 */
export const ALL_DOCUMENT_KINDS: DocumentKind[] = [...DOCUMENT_KINDS, PAYMENT_KIND];

/* Images only. PDFs were listed here but the storage bucket never
   accepted them, so a PDF passed every check we made and was then
   refused by storage — a path that failed after telling somebody they
   were fine. Removed on instruction rather than adding the MIME type:
   an ID card is a photograph, and every accepted type can be shrunk
   in the browser, which a PDF cannot. */
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * The biggest file somebody may CHOOSE.
 *
 * Generous on purpose: a phone photographs an ID card at 8-12MB, and
 * telling people to go and compress it themselves is asking them to
 * do a job the browser can do instantly. Images over the send limit
 * below are shrunk before they leave (lib/shrinkImage.ts).
 */
export const MAX_BYTES = 10_000_000;

/**
 * The biggest file that may actually be POSTED.
 *
 * Vercel refuses any request body over 4.5MB before our route runs,
 * so this is not a policy we chose — it is the ceiling we live under,
 * kept under it with room for the multipart envelope and the token.
 * Enforced on both sides: after shrinking in the browser, and again
 * in the route, which is the check that actually holds.
 *
 * Everything accepted is an image, so everything can be shrunk below
 * this before it is sent. Nothing should reach the limit in practice.
 */
export const SEND_BYTES = 4_000_000;
