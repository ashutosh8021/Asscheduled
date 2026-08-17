"use client";

import type { ReactNode } from "react";
import ModalProvider from "./ModalProvider";
import Header from "./Header";
import Footer from "./Footer";

/* Wraps every "SOMEWHERE" route: modal context, header, footer.

   `overHero` keeps the header transparent over the homepage video
   until the hero has scrolled past. */

export default function Shell({
  children,
  overHero = false,
}: {
  children: ReactNode;
  overHero?: boolean;
}) {
  return (
    <ModalProvider>
      <div className="s-root">
        <a href="#main" className="s-skip">
          Skip to content
        </a>
        <Header overHero={overHero} />
        <main id="main">{children}</main>
        <Footer />
      </div>
    </ModalProvider>
  );
}
