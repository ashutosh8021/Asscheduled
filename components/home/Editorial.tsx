import Link from "next/link";
import VideoFrame from "@/components/ui/VideoFrame";
import RevealText from "@/components/ui/RevealText";

/* Homepage editorial blocks — build spec §4 items 8-11.
   Stories, Events and Club have no approved content yet, so each section
   states that plainly rather than shipping invented editorial. */

export function BrandMoment() {
  return (
    <section className="sec brandm">
      <div className="brandm-copy">
        <p className="sec-no rv">FILE 01 — STATEMENT</p>
        <RevealText
          className="disp"
          lines={[
            "We take you to the fest.",
            "We hand you the city after.",
            <em key="e">We choose the nineteen.</em>,
          ]}
        />
        <p className="brandm-lead rv">
          Nineteen seats, one form, and a human who reads every answer. The fest is the reason you
          come. The six days around it are the reason you remember it.
        </p>
        <Link className="btn btn-navy rv" href="/trips">
          See the departures
        </Link>
      </div>
      <div className="brandm-art rv">
        {/* Campaign film slot — swaps to an autoplaying muted loop the moment
            real Season 01 footage exists (build spec §5). */}
        <VideoFrame
          slot={{
            src: null,
            poster: null,
            alt: "AS Scheduled Season 01 campaign film",
            label: "CAMPAIGN FILM — 000_CAMPAIGN.MP4",
          }}
          ratio="3 / 4"
        />
      </div>
    </section>
  );
}

export function FeaturedStories() {
  return (
    <section className="sec" id="stories">
      <div className="rail-head" style={{ padding: 0 }}>
        <h2 className="disp rail-title rv">STORIES</h2>
        <div className="rail-meta">
          <p className="sec-no rv">FILE 05 — EVIDENCE LOCKER</p>
        </div>
      </div>
      <div className="rail-empty" style={{ margin: 0 }}>
        <span className="st st-grey">EMPTY BY DESIGN</span>
        <p className="disp">Season 01 hasn&apos;t happened yet.</p>
        <p className="rail-empty-note">
          Film photos, voice notes and journals get filed here after each departure returns. No
          stock imagery, no borrowed campaigns. If it lands on this page, it happened to us.
        </p>
      </div>
    </section>
  );
}

export function EventsMoment() {
  return (
    <section className="sec" id="events">
      <div className="rail-head" style={{ padding: 0 }}>
        <h2 className="disp rail-title rv">EVENTS</h2>
        <div className="rail-meta">
          <p className="sec-no rv">FILE 06 — THE CALENDAR</p>
        </div>
      </div>
      <div className="rail-empty" style={{ margin: 0 }}>
        <span className="st st-grey">NOTHING SCHEDULED</span>
        <p className="disp">City meet-ups start after PUL-01 returns.</p>
        <p className="rail-empty-note">
          Listening sessions, screenings and pre-departure briefings. Dates get posted here when
          they are real and not before.
        </p>
      </div>
    </section>
  );
}

export function ClubCTA() {
  return (
    <section className="sec club" id="club">
      <p className="sec-no rv">FILE 07 — THE CLUB</p>
      <h2 className="disp rv club-h">
        Nineteen at a time.
        <br />
        <span className="ser">It adds up.</span>
      </h2>
      <p className="club-copy rv">
        Everyone who travels with us stays on the list — the group chat, the next window before it
        opens publicly, and whatever Drop 000 turns into. You do not buy your way in. You get
        selected, you go, you are in.
      </p>
      <Link className="btn rv" href="/club">
        What the club is
      </Link>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="sec cta" id="apply">
      <p className="sec-no rv">FILE 08 — LAST PAGE FIRST</p>
      <h2 className="disp rv" style={{ marginTop: 20 }}>
        Nineteen seats.
        <br />
        <span className="ser">One form.</span>
      </h2>
      <p className="cta-note rv">
        ₹500 registration, non-refundable. Nine questions and one photo. A human reads all of it.
      </p>
      <Link className="btn rv" href="/apply">
        Open Form 7A — Apply
      </Link>
    </section>
  );
}
