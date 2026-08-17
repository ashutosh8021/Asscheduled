/* Canonical origin — single source for metadata, sitemap, robots and OG images.

   The domain is asscheduled.com (Namecheap, confirmed 2026-08-17). It is
   still read from the environment rather than hardcoded, so preview and
   staging deploys resolve against their own origin instead of claiming to
   be production:
     1. NEXT_PUBLIC_SITE_URL   — https://asscheduled.com in production
     2. VERCEL_PROJECT_PRODUCTION_URL — injected on Vercel production
     3. localhost dev fallback

   Set NEXT_PUBLIC_SITE_URL in the host's environment at deploy time too —
   .env.local is local-only and never ships. */

function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveOrigin();

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export const SITE_NAME = "AS SCHEDULED";
/* The LLPIN is deliberately not in the footer line. It is still
   disclosed where it carries legal weight — the privacy policy's
   controller statement (components/legal/LegalContent.tsx) and the
   organisation schema (lib/schema.ts). */
export const LEGAL_LINE = "© 2026 ROITCOVE VENTURES LLP · India";
