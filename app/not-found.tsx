import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "NO SUCH FILE · AS SCHEDULED",
  description: "That reference does not exist in the Season 01 record.",
  robots: { index: false, follow: false },
};

/* 404. Same empty-state grammar as the unfiled pages — a missing route is
   just another record that does not exist yet. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">NO SUCH FILE</h1>
            <div className="rail-meta">
              <p className="sec-no">ERROR 404 — REFERENCE NOT ON RECORD</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">NOT ON RECORD</span>
            <p className="disp">Nothing is filed under that address.</p>
            <p className="rail-empty-note">
              Either the reference was mistyped or the file was never opened. Season 01 runs to
              four departures and a short list of pending ones — all of them are on the board.
            </p>
            <div className="err-acts">
              <Link className="btn btn-peach" href="/trips">
                See the departures
              </Link>
              <Link className="btn" href="/">
                Back to the board
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
