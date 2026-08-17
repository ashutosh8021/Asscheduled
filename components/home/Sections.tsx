import Link from "next/link";
import { SOON } from "@/lib/trips";

/* Static home sections, ported verbatim from the reference. */

export function Ticker() {
  const items = (
    <>
      <span>
        <b>PUL-01</b> AIIMS DELHI — APPS OPEN
      </span>
      <span>
        <b>REN-02</b> IIT DELHI — APPS OPEN
      </span>
      <span>
        <b>ANT-03</b> IIT KANPUR — APPS OPEN
      </span>
      <span>
        <b>OAS-04</b> BITS PILANI — APPS OPEN
      </span>
      <span>TRAVEL + FEST + STAY + ALL MEALS — INCLUDED</span>
      <span>19 SEATS PER DEPARTURE</span>
      <span>₹500 APPLICATION — NON-REFUNDABLE</span>
      <span>NO BOOKINGS. ONLY SELECTIONS.</span>
    </>
  );
  return (
    <div className="tick" aria-hidden="true">
      <div className="tick-in">
        {items}
        {items}
      </div>
    </div>
  );
}

export function Manifesto() {
  return (
    <section className="sec mani">
      <p className="sec-no rv">FILE 01 — STATEMENT</p>
      <h2 className="disp rv" style={{ marginTop: 22 }}>
        We take you to the fest.
        <br />
        We hand you the city after.
        <br />
        <em>We choose the nineteen.</em>
      </h2>
      <p className="mani-foot lbl rv">That&apos;s the entire explanation you&apos;ll get.</p>
    </section>
  );
}

export function FilesPending() {
  return (
    <section className="sec">
      <div className="sec-head">
        <h2 className="disp sec-h rv">
          Files <span className="ser">Pending</span>
        </h2>
        <p className="sec-no rv">9 DEPARTURES — SEALED UNTIL DATES CONFIRM</p>
      </div>
      <div className="soon-grid rv">
        {SOON.map((s) => (
          <div className="soon-tile" key={s[0]}>
            <h3>{s[0]}</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="lbl lbl-grey">{s[1]}</span>
              <span className="st st-grey" style={{ fontSize: 9 }}>
                FILE PENDING
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Protocol() {
  return (
    <section className="sec proto" id="protocol">
      <div className="sec-head">
        <h2 className="disp sec-h rv">The Protocol</h2>
        <p className="sec-no rv">FILE 03 — HOW SELECTION WORKS</p>
      </div>
      <div className="proto-grid rv">
        <div className="proto-step">
          <b>STEP 01</b>
          <h3>Apply</h3>
          <p>
            Nine questions, one photo, four honest minutes. A ₹500 fee, non-refundable, buys
            your file a human reading. It is not a deposit.
          </p>
        </div>
        <div className="proto-step">
          <b>STEP 02</b>
          <h3>Review</h3>
          <p>
            Every answer gets read by a human. No algorithm, no scoring sheet you can game.
            Decisions land within 72 hours of the window closing.
          </p>
        </div>
        <div className="proto-step">
          <b>STEP 03</b>
          <h3>Decision</h3>
          <p>
            Selected: the trip fee is payable in full within 48 hours — the ₹500 is separate and
            stays with us. Not selected: no refund, no reasons given, no appeals.
          </p>
        </div>
        <div className="proto-step">
          <b>STEP 04</b>
          <h3>Depart</h3>
          <p>
            One WhatsApp group. One boarding hub. One Director, one Trip Captain, nineteen
            strangers, six days. Evening plans stay sealed until departure.
          </p>
        </div>
      </div>
      <p className="proto-foot rv">
        Rejection says nothing about you. It says something about the other eighteen seats.
      </p>
    </section>
  );
}

export function Record() {
  return (
    <section className="sec" id="record">
      <div className="sec-head">
        <h2 className="disp sec-h rv">The Record</h2>
        <p className="sec-no rv">FILE 04 — PRIOR OPERATIONS</p>
      </div>
      <div className="rec-grid">
        <div className="rec-copy rv">
          <h3 className="disp">
            One trip run.
            <br />
            Seventy moved.
            <br />
            <em>Zero lost.</em>
          </h3>
          <p>
            Before the name, before this page: a seventy-person, multi-state run to Alcheringa
            at IIT Guwahati, extended eleven days deep into Meghalaya. Planned on spreadsheets,
            held together by nerve and a working phone.
          </p>
          <p>
            It worked. Everyone came back with stories they still can&apos;t explain properly.
            That route returns as a Season 01 pending file — same road, better paperwork.
          </p>
          <p className="lbl lbl-grey">
            We won&apos;t show you strangers&apos; photos and call them ours. Season 01 fills
            this page.
          </p>
        </div>
        <div className="rec-file rv">
          <span className="st st-ok">EXECUTED</span>
          <p className="lbl">Case File — Trip 000 (Prototype)</p>
          <dl className="rec-kv">
            <dt>Fest</dt>
            <dd>Alcheringa, IIT Guwahati</dd>
            <dt>Headcount</dt>
            <dd>70 travellers</dd>
            <dt>Route</dt>
            <dd>Multi-state → Guwahati → Meghalaya</dd>
            <dt>Extension</dt>
            <dd>11 days</dd>
            <dt>Incidents</dt>
            <dd>None worth filing</dd>
          </dl>
          <div className="rec-slots" aria-label="Photo evidence slots — Season 1 film photos go here">
            <div className="slot">
              PHOTO EVIDENCE
              <br />
              INSERT 000_A.JPG
            </div>
            <div className="slot">
              PHOTO EVIDENCE
              <br />
              INSERT 000_B.JPG
            </div>
            <div className="slot">
              PHOTO EVIDENCE
              <br />
              INSERT 000_C.JPG
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Archive() {
  return (
    <section className="sec">
      <div className="sec-head">
        <h2 className="disp sec-h rv">
          Season 01 <span className="ser">Archive</span>
        </h2>
        <p className="sec-no rv">FILE 05 — EVIDENCE LOCKER</p>
      </div>
      <div className="arch-empty rv">
        <span className="st st-grey">EMPTY BY DESIGN</span>
        <p className="disp">Nothing here yet. Correct.</p>
        <p style={{ maxWidth: "46ch", fontSize: 14 }}>
          Film photos, voice notes, journals and whatever else survives — uploaded after each
          departure returns. No stock imagery. No borrowed campaigns. If it&apos;s on this page,
          it happened to us.
        </p>
      </div>
    </section>
  );
}

export function Supply() {
  return (
    <section className="sec" id="supply">
      <div className="sec-head">
        <h2 className="disp sec-h rv">
          Supply — <span className="ser">Drop 000</span>
        </h2>
        <p className="sec-no rv">FILE 06 — NOT FOR SALE YET</p>
      </div>
      <div className="sup-grid rv">
        <div className="sup-tile">
          <h3>Hoodie</h3>
          <div className="ph">SPEC PENDING</div>
          <span className="lbl lbl-grey">Unlocks after PUL-01 returns</span>
        </div>
        <div className="sup-tile">
          <h3>Luggage Tag</h3>
          <div className="ph">SPEC PENDING</div>
          <span className="lbl lbl-grey">Issued to travellers first</span>
        </div>
        <div className="sup-tile">
          <h3>Trip Journal</h3>
          <div className="ph">SPEC PENDING</div>
          <span className="lbl lbl-grey">One per seat, on the bus</span>
        </div>
        <div className="sup-tile">
          <h3>Cap</h3>
          <div className="ph">SPEC PENDING</div>
          <span className="lbl lbl-grey">No visible branding. Obviously.</span>
        </div>
      </div>
    </section>
  );
}

const FAQS: [string, React.ReactNode][] = [
  [
    "Why apply instead of book?",
    <p key="p">
      Nineteen seats only work if the nineteen fit together. Booking fills buses; selection
      builds trips. We read every application, pick the group, and give no reasons for
      rejections. No appeals either. It keeps things honest.
    </p>,
  ],
  [
    "What happens to my ₹500?",
    <p key="p">
      It pays for the reading. A human works through every answer, and the fee covers that work
      and keeps the pile honest. <b>It is not a deposit.</b> Not selected: it does not come back.
      Selected: it does not come off your trip fee either. Apply only if ₹500 for a fair reading
      is a price you&apos;re fine paying.
    </p>,
  ],
  [
    "What's actually included?",
    <p key="p">
      <b>Everything that matters:</b> intercity travel from your boarding hub, both ways. Fest
      tickets. Five nights verified twin-share stay. All meals, three a day. Every transfer.
      Director plus Trip Captain on ground, first-aid and SOS protocol. You bring yourself, a
      bag, and ID. Full lists sit inside each case file on the board.
    </p>,
  ],
  [
    "How do I pay if selected?",
    <p key="p">
      48-hour window after your selection email. Full payment or 50/50 split — second half due
      21 days before departure. UPI, cards, netbanking via Razorpay. Miss the window and the
      seat moves to the waitlist. We keep schedules; it&apos;s in the name.
    </p>,
  ],
  [
    "I'd be coming alone. Weird?",
    <p key="p">
      Most of the nineteen come solo. That&apos;s the design. If you already had the group, you
      wouldn&apos;t need us.
    </p>,
  ],
  [
    "Who's actually running this on ground?",
    <p key="p">
      Every departure carries the Director and one dedicated Trip Captain — nineteen travellers,
      two crew. Verified stays, a written emergency protocol, guardian contact on file for every
      seat, and a captain whose entire job is making the schedule survive contact with reality.
    </p>,
  ],
  [
    "Who can apply?",
    <p key="p">
      18–26. College students or recent graduates. Any college, any city, any course. A valid
      college ID or degree helps your file; a good answer to question four helps it more.
    </p>,
  ],
  [
    "What if I drop out after selection?",
    <p key="p">
      Trip fee refunds by slab: more than 30 days out, 80%. Between 15 and 30 days, 50%. Under
      15 days, nothing — the seat&apos;s already yours and empty. Full slabs live in the Refund
      Policy, footer, Paperwork.
    </p>,
  ],
];

export function FAQ() {
  return (
    <section className="sec faq" id="faq">
      <div className="sec-head">
        <h2 className="disp sec-h rv">
          Questions, <span className="ser">Filed</span>
        </h2>
        <p className="sec-no rv">FILE 07 — FREQUENTLY ASKED</p>
      </div>
      <div className="rv">
        {FAQS.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q} <span className="mk">+</span>
            </summary>
            {a}
          </details>
        ))}
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="sec cta" id="apply">
      <p className="sec-no rv">FILE 08 — LAST PAGE FIRST</p>
      <h2 className="disp rv" style={{ marginTop: 20 }}>
        Nineteen seats.
        <br />
        <span className="ser">One form.</span>
      </h2>
      <Link className="btn rv" href="/apply">
        Open Form 7A — Apply
      </Link>
    </section>
  );
}
