/* File references — the AS-S2-XXXXXXXXXX code an applicant is shown and quotes
   back at us. Derived from the Postgres row id where one exists, so support can
   find a file from the reference alone without an extra indexed column.

   The season number is part of the reference, so anything issued during
   Season 01 still reads AS-S1- and always will. Nothing rewrites those:
   a reference somebody has already been given has to keep working. Code
   that matches references must accept both. */
const PREFIX = "AS-S2-";

/** Deterministic reference for a persisted application. */
export function referenceFrom(id: string): string {
  return PREFIX + id.replace(/-/g, "").slice(0, 10).toUpperCase();
}

/** Fallback for the unpersisted path (Supabase not configured). */
export function newReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return PREFIX + (stamp + salt).slice(0, 10);
}
