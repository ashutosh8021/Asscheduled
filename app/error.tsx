"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* Route-level error boundary. Keeps a thrown render inside the brand instead
   of dropping the visitor onto Next's default stack-trace screen. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(phase 4): forward to Sentry once SENTRY_DSN is wired.
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">FILE DAMAGED</h1>
            <div className="rail-meta">
              <p className="sec-no">ERROR — PAGE FAILED TO ASSEMBLE</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st">PROCESSING FAULT</span>
            <p className="disp">Something on our side did not load.</p>
            <p className="rail-empty-note">
              Not your doing. The page can be re-issued — if it fails a second time, the departures
              board is the shortest way back to everything that matters.
            </p>
            {error.digest && (
              <p className="err-ref lbl lbl-grey">FAULT REF: {error.digest}</p>
            )}
            <div className="err-acts">
              <button className="btn btn-peach" type="button" onClick={reset}>
                Re-issue the page
              </button>
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
