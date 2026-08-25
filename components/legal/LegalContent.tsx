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
      <H>Who holds your data</H>
      <p>
        ROITCOVE VENTURES LLP, LLPIN ACZ-2215, India, trading as AS SCHEDULED. We are the data
        fiduciary for everything described below.
      </p>

      <H>What we collect, and when</H>
      <p>
        <b>When you apply for a departure:</b> your name, phone number, gender, age, state,
        occupation, college, the departure you chose, and — if you fill them in — your Instagram
        handle and your answer to why you want to come. We do not ask for your email address at
        this stage and we do not ask for a photograph.
      </p>
      <p>
        <b>When you write to us:</b> your name, email, phone and message. <b>When you propose a
        collaboration:</b> your name, organisation, email, phone, and the details of what you are
        proposing. <b>When you join the mailing list:</b> your email address, the preference you
        select, and the date you consented.
      </p>

      <H>Identity documents</H>
      <p>
        Some departures require a government photo ID and a college ID. We need the first to book
        rail travel in your name — the name on the ticket has to match the ID you travel with — and
        the second to confirm you are a student, which the host campus checks on entry. Masked
        Aadhaar is ideal; passport, driving licence and voter ID are equally acceptable.
      </p>
      <p>
        Where a departure asks for them, they are part of the application. Where it does not, they
        are requested only after you are accepted. Either way they are stored in a private,
        access-controlled store, are never public, are seen only by us, and are deleted after the
        trip ends — see Retention below. You can ask us to delete them sooner.
      </p>

      <H>What we use it for</H>
      <p>
        Selecting applicants, booking your travel and accommodation, reaching you before and
        during the trip, and meeting our legal and tax obligations. Nothing else. We do not sell
        your data, we do not share it for advertising, and we do not add you to a mailing list you
        did not ask to join.
      </p>

      <H>Who else processes it</H>
      <p>
        Supabase (database and document storage), Vercel (hosting), and Resend (email delivery)
        process data on our behalf under contract. Google Analytics receives anonymous usage
        statistics as described below. Rail and hotel bookings require passing your travel details
        to the relevant operator. Some of these providers process data outside India.
      </p>

      <H>Cookies and analytics</H>
      <p>
        We use Google Analytics 4 to count visits and see which pages lead to applications. It
        sets cookies in your browser and records pages viewed, approximate location from your IP
        address, and which buttons were pressed. Your IP is anonymised before it is stored.
      </p>
      <p>
        We never send your name, phone number, answers or documents to Google. The only details
        attached to an analytics event are which departure a button referred to and which part of
        the site it sat on. Browser-level tracking protection or an ad blocker will stop this
        entirely, and the site works normally without it.
      </p>

      <H>Retention</H>
      <p>
        Applications that are not selected: deleted within 90 days of the decision. Selected
        travellers: kept for the season for operations and for as long as tax and accounting law
        requires, then archived. Identity documents: deleted after the departure ends, and sooner
        if you ask. Mailing list: until you unsubscribe. Enquiries and collaboration proposals:
        two years.
      </p>

      <H>Your rights</H>
      <p>
        You can ask for a copy of what we hold, ask us to correct it, ask us to delete it, and
        withdraw consent you have given. Withdrawing consent for identity documents after you have
        been accepted may mean we cannot book your travel, but you are entitled to do it.
      </p>
      <p>
        {CONTACT_EMAIL ? (
          <>
            Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ) : (
          <>Use the contact page.</>
        )}{" "}
        We answer within 7 working days. If we have not resolved it to your satisfaction you may
        complain to the Data Protection Board of India.
      </p>

      <H>Age</H>
      <p>
        You must be 18 or over to apply. We do not knowingly collect data from anyone younger. If
        you believe we hold a minor&apos;s data, tell us and we will delete it.
      </p>

      <p className="lnote">
        Controller: ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · India.
      </p>
    </>
  );
}

export function LegalPaneContent({ pane, level }: { pane: LegalPane; level?: PaneLevel }) {
  if (pane === "refund") return <RefundPane level={level} />;
  if (pane === "terms") return <TermsPane level={level} />;
  return <PrivacyPane level={level} />;
}
