"use client";

import type { ReactNode } from "react";
import ModalProvider from "./ModalProvider";
import Header from "./Header";
import Ticker from "./Ticker";
import Footer from "./Footer";

/* Wraps every "SOMEWHERE" route: modal context, header, footer.

   `overHero` keeps the header transparent over the homepage video
   until the hero has scrolled past. */

export default function Shell({
  children,
  overHero = false,
  ticker,
}: {
  children: ReactNode;
  overHero?: boolean;
  /**
   * The running band across the very top. It belongs here rather than
   * inside a page because the header is fixed: anything a page renders
   * first ends up underneath it. With the ticker here, the header can
   * be pushed down by exactly its height.
   */
  ticker?: readonly string[];
}) {
  return (
    <ModalProvider>
      <div className="s-root" data-ticker={ticker ? "true" : undefined}>
        <a href="#main" className="s-skip">
          Skip to content
        </a>
        {ticker ? <Ticker lines={ticker} /> : null}
        <Header overHero={overHero} />
        <main id="main">{children}</main>
        <Footer />
      </div>
    </ModalProvider>
  );
}
