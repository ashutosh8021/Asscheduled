/* The referral cookie and what a Crew code looks like.
 *
 * Its own module, with no imports at all, because middleware.ts needs
 * these and runs on the edge: importing lib/crew.ts there would drag in
 * node:crypto and next/headers, neither of which exists in that
 * runtime. Same reason lib/documentRules.ts is separate from
 * lib/documents.ts.
 *
 * Re-exported from lib/crew.ts, so server code has one place to look. */

/**
 * Who sent somebody here, kept apart from who prices them.
 *
 * NOT the partner cookie. A festival's code decides a discount; a Crew
 * code decides credit, and today it carries no discount at all — an
 * amount off for bringing a friend is Mannat's to set, not ours to
 * invent. Writing a Crew code into `as_partner` would also overwrite a
 * real discount somebody had already earned by arriving on a festival's
 * link, which is a price rise caused by clicking a second link.
 *
 * So: two cookies, the same split the database already makes between
 * `partner_code` and `referred_by`.
 */
export const CREW_REF_COOKIE = "as_ref";

/** Same 30 days as a partner referral. Long enough to think it over,
 *  short enough not to outlive the season. */
export const CREW_REF_DAYS = 30;

/**
 * Does this look like an issued code at all?
 *
 * A shape check, not a verdict. There is no database at the edge, so the
 * middleware stores what passes this and the apply route is what decides
 * whether the code is real — see resolveCrewCode. Anything else would
 * mean a lookup on every page view.
 */
export function looksLikeCrewCode(raw: string): boolean {
  return /^[A-Za-z0-9]{4,24}$/.test(raw.trim());
}
