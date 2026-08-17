/* File references — the AS-S1-XXXXXXXXXX code an applicant is shown and quotes
   back at us. Derived from the Postgres row id where one exists, so support can
   find a file from the reference alone without an extra indexed column. */

const PREFIX = "AS-S1-";

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
