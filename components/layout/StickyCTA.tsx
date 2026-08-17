"use client";

/* Sticky mobile apply bar.

   Appears only below the header CTA's breakpoint, and only once the visitor
   has scrolled past the first screen — so it never covers the hero's own
   primary CTA. Hidden anywhere it would be noise: inside Form 7A itself, on
   the confirmation page, and on the V2 proposal. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EVENTS } from "@/lib/analytics";

/* The "SOMEWHERE" routes carry their own header CTA and open the
   application as an overlay, so this legacy bar would both duplicate it
   and contradict it (₹500 / 19 seats are not that flow's terms). */
const HIDDEN_ON = ["/apply", "/v2", "/", "/somewhere", "/gallery", "/about", "/contact", "/faqs"];

export default function StickyCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setShow((was) => {
          const now = window.scrollY > window.innerHeight * 0.75;
          return now === was ? was : now;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <div className={`stickycta${show ? " on" : ""}`} aria-hidden={!show}>
      <div className="stickycta-copy">
        <b>19 seats per departure</b>
        <span>₹500 registration · non-refundable</span>
      </div>
      <Link
        className="btn btn-peach"
        href="/apply"
        tabIndex={show ? undefined : -1}
        data-track={EVENTS.applyStart}
        data-track-label="sticky_mobile"
      >
        Apply
      </Link>
    </div>
  );
}
