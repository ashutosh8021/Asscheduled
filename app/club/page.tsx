import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/club" },
  title: "CLUB · AS SCHEDULED",
  description: "Belonging, access, and the list you join by travelling.",
};

/* Build spec §13. No approved content exists yet — the page states that
   plainly rather than shipping invented editorial. */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">CLUB</h1>
            <div className="rail-meta">
              <p className="sec-no">FILE 07 — THE CLUB</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">BY SELECTION ONLY</span>
            <p className="disp">You do not buy your way in.</p>
            <p className="rail-empty-note">Everyone who travels with us stays on the list: the group chat, the next window before it opens publicly, and first claim on Drop 000. Membership is a consequence of being selected, not a product.</p>
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
