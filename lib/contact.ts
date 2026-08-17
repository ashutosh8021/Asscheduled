/* Contact channels.

   The Instagram handle, WhatsApp number and contact address are all OPEN
   ITEMS in CLAUDE.md — none has been confirmed. They previously shipped as
   invented values (@as.scheduled, wa.me/919999999999,
   applications@asscheduled.in), which is worse than absent: a wrong wa.me
   number sends applicants to a stranger, and an unmonitored address in a
   privacy policy is a compliance problem.

   So they are environment-driven. Unset means the UI says so plainly.

   BEFORE LAUNCH these must be set in .env.local:
     NEXT_PUBLIC_INSTAGRAM_URL
     NEXT_PUBLIC_WHATSAPP_URL
     NEXT_PUBLIC_CONTACT_EMAIL   <- legally required for the privacy policy */

function clean(v: string | undefined): string | null {
  return v && v.trim() ? v.trim() : null;
}

export const INSTAGRAM_URL = clean(process.env.NEXT_PUBLIC_INSTAGRAM_URL);
export const WHATSAPP_URL = clean(process.env.NEXT_PUBLIC_WHATSAPP_URL);
export const CONTACT_EMAIL = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

/** Handle for display, derived from the URL so the two cannot disagree. */
export const INSTAGRAM_HANDLE = INSTAGRAM_URL
  ? "@" + INSTAGRAM_URL.replace(/\/+$/, "").split("/").pop()
  : null;

export const HAS_ANY_CONTACT = Boolean(INSTAGRAM_URL || WHATSAPP_URL || CONTACT_EMAIL);
