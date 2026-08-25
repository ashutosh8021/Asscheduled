"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, NAV_CTA, NAV_UTIL } from "@/lib/copy";
import { useModal } from "./ModalProvider";

/* The header floats transparent over the homepage video and turns to
   paper once the hero is behind it. Every other route starts solid. */

export default function Header({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const { openApply } = useModal();
  const [solid, setSolid] = useState(!overHero);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!overHero) {
      setSolid(true);
      return;
    }

    /* Passive scroll listener with a rAF gate — cheap enough to leave
       on for the whole page rather than wiring up a scroll library. */
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setSolid(window.scrollY > window.innerHeight * 0.7);
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  /* A route change with the sheet open would otherwise leave it up. */
  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("s-locked", menu);
    return () => document.body.classList.remove("s-locked");
  }, [menu]);

  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <>
      <header className={`s-hdr ${solid ? "s-hdr-solid" : "s-hdr-over"}`}>
        <nav aria-label="Primary" className="s-hdr-left">
          <ul className="s-hdr-nav">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={current(n.href)}>
                  {n.t}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Two stacked marks rather than one swapped `src`: the header
            crossfades between transparent and paper, and switching the
            source mid-transition flashes. Both are decorative — the
            accessible name sits on the link. */}
        <Link href="/" className="s-hdr-logo" aria-label="AS SCHEDULED — home">
          <Image
            src="/img/logo-light.png"
            alt=""
            width={816}
            height={94}
            priority
            data-on={!solid}
          />
          <Image
            src="/img/logo-ink.png"
            alt=""
            width={816}
            height={94}
            priority
            data-on={solid}
          />
        </Link>

        <div className="s-hdr-right">
          <ul className="s-hdr-nav">
            {NAV_UTIL.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={current(n.href)}>
                  {n.t}
                </Link>
              </li>
            ))}
          </ul>

          <button type="button" className="s-btn s-hdr-cta" onClick={() => openApply(undefined, "header")}>
            {NAV_CTA} <span className="s-arrow">→</span>
          </button>

          <button
            type="button"
            className="s-burger"
            aria-expanded={menu}
            aria-controls="s-mobile-nav"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="s-mobile-nav" className="s-mnav" data-open={menu} inert={!menu}>
        {[...NAV, ...NAV_UTIL].map((n) => (
          <Link key={n.href} href={n.href}>
            {n.t}
          </Link>
        ))}
        <div className="s-mnav-foot">
          <button
            type="button"
            className="s-btn"
            onClick={() => {
              setMenu(false);
              openApply(undefined, "header-menu");
            }}
          >
            {NAV_CTA} <span className="s-arrow">→</span>
          </button>
        </div>
      </div>
    </>
  );
}
