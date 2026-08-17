import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/experiences" },
  title: "EXPERIENCES · AS SCHEDULED",
  description: "Experiences that run without a full departure.",
};

/* Build spec §10. No approved content exists yet — the page states that
   plainly rather than shipping invented editorial. */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">EXPERIENCES</h1>
            <div className="rail-meta">
              <p className="sec-no">FILE — STANDALONE EXPERIENCES</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">NOT YET FILED</span>
            <p className="disp">Nothing standalone yet.</p>
            <p className="rail-empty-note">Season 01 is six-day departures only. Single-day experiences — city walks, listening sessions, fest day-passes — get filed here when they are real.</p>
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
