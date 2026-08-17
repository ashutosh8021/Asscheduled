import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/my-trip" },
  title: "MY TRIP · AS SCHEDULED",
  description: "Your application, decision and departure details.",
};

/* Build spec §3. No approved content exists yet — the page states that
   plainly rather than shipping invented editorial. */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">MY TRIP</h1>
            <div className="rail-meta">
              <p className="sec-no">FILE — YOUR FILE</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">SIGN-IN PENDING</span>
            <p className="disp">Accounts open with Season 01 payments.</p>
            <p className="rail-empty-note">Once applications go live you will track your file here: lodged, under review, decision, payment and boarding details. Until then, decisions arrive by email.</p>
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
