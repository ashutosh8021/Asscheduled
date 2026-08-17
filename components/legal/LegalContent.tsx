/* Legal copy — ported from the reference legal sheet.
   Shared by the footer modal, /paperwork and the three dedicated legal
   routes, so all four surfaces state identical terms. */

import { CONTACT_EMAIL } from "@/lib/contact";

export type LegalPane = "refund" | "terms" | "privacy";

/* Heading level for the subsections inside a pane. Defaults to h3, which is
   correct on /paperwork (h1 page > h2 policy > h3 subsection). The dedicated
   policy routes pass "h2", where the policy name is already the h1. */
export type PaneLevel = "h2" | "h3";


export const LEGAL_TABS: { id: LegalPane; label: string }[] = [
  { id: "refund", label: "Refund Policy" },
  { id: "terms", label: "Terms of Travel" },
  { id: "privacy", label: "Privacy" },
];

export function RefundPane({ level: H = "h3" }: { level?: PaneLevel } = {}) {
  return (
    <>
      <H>Application fee — ₹500</H>
      <p>
        Non-refundable. The fee covers the cost of reviewing your application and is charged for
        that review, not for a seat. It is not a deposit: it is not returned if you are not
        selected, and it does not adjust against the trip fee if you are. Do not apply unless
        that is acceptable to you.
      </p>
      <H>Trip fee — after selection</H>
      <ul>
        <li>Cancellation more than 30 days before departure: 80% refund.</li>
        <li>15 to 30 days before departure: 50% refund.</li>
        <li>Under 15 days: no refund — your seat is held and cannot be resold in time.</li>
        <li>
          Departure cancelled by us for any reason: 100% of the trip fee refunded within 7
          working days. The ₹500 application fee is not included.
        </li>
      </ul>
      <H>Fest force majeure</H>
      <p>
        If a fest cancels or shifts dates, the departure shifts with it. You choose: move with
        the new dates, transfer to any open departure, or take a full refund of the trip fee.
      </p>
      <p className="lnote">
        Refund timelines depend on your bank once Razorpay releases funds. Summary only — the
        signed terms at payment govern.
      </p>
    </>
  );
}

export function TermsPane({ level: H = "h3" }: { level?: PaneLevel } = {}) {
  return (
    <>
      <H>Eligibility &amp; ID</H>
      <p>
        18–26 years. Government ID plus college ID or degree checked at boarding. Details that
        don&apos;t match your application void the seat, no refund.
      </p>
      <H>Conduct</H>
      <p>
        The Trip Captain&apos;s call is final on the ground. Behaviour that endangers the group —
        yours or anyone&apos;s safety — ends your trip on the spot, at your own cost home.
        Illegal substances end it faster.
      </p>
      <H>Schedule</H>
      <p>
        Published itineraries are the plan; weather, fests and India get votes too. Equivalent
        substitutions may occur. Evening plans stay sealed until departure by design.
      </p>
      <H>Liability</H>
      <p>
        We run verified stays, licensed transport, a written emergency protocol and carry a
        first-aid kit plus a charged phone. Personal belongings remain your responsibility.
        Travel insurance is offered at payment; take it.
      </p>
      <p className="lnote">Summary only — the signed terms issued with your selection email govern.</p>
    </>
  );
}

export function PrivacyPane({ level: H = "h3" }: { level?: PaneLevel } = {}) {
  return (
    <>
      <H>What we collect</H>
      <p>
        What you type into Form 7A: particulars, contact details, nine answers, one photo.
        Payment runs entirely inside Razorpay — card and UPI details never touch our servers.
      </p>
      <H>What we do with it</H>
      <p>
        Selection. Emergency contact during the trip. Nothing else. No sale, no sharing, no ad
        targeting, no newsletter you didn&apos;t ask for.
      </p>
      <H>Retention</H>
      <p>
        {/* Was "deleted within 90 days of refund" — there is no refund on
            rejection, so that clause described an event that never happens. */}
        Applications that are not selected: deleted within 90 days of the decision. Selected
        travellers: kept for the season for operations and legal compliance, then archived.
      </p>
      <H>Your rights</H>
      <p>
        {CONTACT_EMAIL ? (
          <>
            Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> for a copy or
            deletion of your data.
          </>
        ) : (
          <>Use the contact page to request a copy or deletion of your data.</>
        )}{" "}
        We answer within 7 working days.
      </p>
      <p className="lnote">Controller: ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · India.</p>
    </>
  );
}

export function LegalPaneContent({ pane, level }: { pane: LegalPane; level?: PaneLevel }) {
  if (pane === "refund") return <RefundPane level={level} />;
  if (pane === "terms") return <TermsPane level={level} />;
  return <PrivacyPane level={level} />;
}
