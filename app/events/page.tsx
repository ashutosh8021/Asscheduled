import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/events" },
  title: "EVENTS · AS SCHEDULED",
  description: "Meet-ups, screenings and pre-departure briefings.",
};

/* Build spec §12. No approved content exists yet — the page states that
   plainly rather than shipping invented editorial. */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">EVENTS</h1>
            <div className="rail-meta">
              <p className="sec-no">FILE 06 — THE CALENDAR</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">NOTHING SCHEDULED</span>
            <p className="disp">City meet-ups start after PUL-01 returns.</p>
            <p className="rail-empty-note">Listening sessions, screenings and pre-departure briefings in the boarding hub cities. Dates get posted here when they are confirmed and not before.</p>
            <Link className="btn" href="/trips">
              See the departures
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
