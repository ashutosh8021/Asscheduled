"use client";

/* Global header — build spec §3.
   Announcement bar, brand left, editorial nav centre, utilities right. */

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Monogram } from "@/components/ui/Bird";

const NAV = [
  { href: "/trips", label: "TRIPS" },
  { href: "/experiences", label: "EXPERIENCES" },
  { href: "/stories", label: "STORIES" },
  { href: "/events", label: "EVENTS" },
  { href: "/club", label: "CLUB" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("locked", open);
    return () => document.body.classList.remove("locked");
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="annc">
        <p>
          SEASON 01 APPLICATIONS OPEN · 19 SEATS PER DEPARTURE · ₹500 REGISTRATION, NON-REFUNDABLE
        </p>
      </div>

      <header className="hdr">
        <Link className="hdr-mark" href="/" aria-label="AS Scheduled — home">
          <Monogram />
          <span className="hdr-word">
            AS SCHEDULED<span className="hdr-r">®</span>
          </span>
        </Link>

        <nav className="hdr-nav" aria-label="Primary">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={pathname.startsWith(n.href) ? "page" : undefined}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hdr-util">
          <Link href="/trips" className="hdr-u" aria-label="Search departures">
            SEARCH
          </Link>
          <Link href="/my-trip" className="hdr-u">
            MY TRIP
          </Link>
          <Link href="/apply" className="btn btn-peach hdr-cta">
            APPLY
          </Link>
          <button
            className="burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mnav${open ? " open" : ""}`}>
        <p className="lbl">Index</p>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <Link href="/my-trip" onClick={() => setOpen(false)}>
          MY TRIP
        </Link>
        <Link href="/apply" onClick={() => setOpen(false)} style={{ color: "#FFAD84" }}>
          APPLY →
        </Link>
      </div>
    </>
  );
}
