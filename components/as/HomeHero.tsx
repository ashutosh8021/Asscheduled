"use client";

import Link from "next/link";
import CycleWord from "./CycleWord";
import { useModal } from "./ModalProvider";
import { HOME } from "@/lib/copy";
import { DEPARTURES, departureStart } from "@/lib/departures";

/* The homepage hero: one layout, sized for whatever it lands on.

   The comp's idea is that the type is the image — oversized Anton with
   one word cycling, a red APPLY block, and the departures as a bare
   list rather than as cards. They become cards further down the page;
   saying it twice says nothing new.

   On a phone the APPLY block goes. The header already carries I'M
   COMING at thumb height, and a second identical call to action
   costs a third of a small screen to repeat something already on it.

   Nothing here needs a licence: it is type and rules, no photography
   and no film. */

export default function HomeHero() {
  const { openApply } = useModal();

  return (
    <>
      {/* ---------- DESKTOP — the light comp ---------- */}
      <section className="s-hh s-hh-light">
        <div className="s-wrap">
          <p className="s-eyebrow s-eyebrow-grey">
            {HOME.heroEyebrow} — {HOME.heroEyebrowNote}
          </p>

          <div className="s-hh-row">
            <h1 className="s-hh-title">
              {HOME.heroLine1}
              <br />
              <CycleWord words={HOME.heroWords} />
              <br />
              <span className="s-hh-tail">{HOME.heroLine3}</span>
            </h1>

            <button type="button" className="s-hh-apply" onClick={() => openApply(undefined, "hero")}>
              <span className="s-hh-apply-word">{HOME.heroCta}</span>
              <span className="s-arrow s-hh-apply-arrow">→</span>
            </button>
          </div>
        </div>

        {/* The departures as a plain list. The comp deliberately does
            not make cards of them here — the cards come later down the
            page, and repeating them twice would say nothing new. */}
        <div className="s-hh-listwrap">
          {/* The single mark the comp feedback asks for, sitting in the
              gap between the fest names and their dates. Same glyph as
              the ticker's separator, so it reads as part of the system
              rather than as an ornament dropped in. Decorative only —
              hidden from assistive tech. */}
          <span className="s-hh-star" aria-hidden="true">
            ✱
          </span>

        <ul className="s-hh-list">
          {DEPARTURES.filter((d) => !d.soldOut).map((d) => (
            <li key={d.id}>
              <Link href={`/somewhere/${d.slug}`} className="s-wrap s-hh-listrow">
                <span className="s-hh-fest">{d.fest}</span>
                <span className="s-hh-campus">{d.campus}</span>
                <span className="s-hh-when">
                  {departureStart(d)
                    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" })
                    .toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </section>

    </>
  );
}
