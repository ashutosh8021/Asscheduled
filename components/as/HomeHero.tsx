"use client";

import Link from "next/link";
import Countdown from "./Countdown";
import CycleWord from "./CycleWord";
import TrainWindow from "./TrainWindow";
import { useModal } from "./ModalProvider";
import { HOME } from "@/lib/copy";
import { DEPARTURES, departureStart, nextDeparture } from "@/lib/departures";

/* The homepage hero, in two forms.

   Desktop follows the light comp: a running ticker, oversized Anton
   with one word cycling, a red APPLY block, and the departures as a
   bare list rather than as cards. Phones follow the dark comp: serif
   headline, the train window, and a countdown to the next departure.

   Both are in the DOM and CSS picks. That is only acceptable because
   neither is expensive — the desktop side is type and the mobile side
   is a few kilobytes of SVG, so there is no second video and no second
   set of images being fetched for a viewport nobody is using. Choosing
   after mount with matchMedia would have meant a flash of the wrong
   one on every load, which is a worse trade at this size.

   The departure the countdown points at is computed, never written
   down: the earliest one that has not sold out. When the season ends
   there is no next departure and the countdown simply does not
   render — a clock counting to a date in the past is worse than none. */

export default function HomeHero() {
  const { openApply } = useModal();
  const next = nextDeparture();

  return (
    <>
      {/* ---------- DESKTOP — the light comp ---------- */}
      <section className="s-hh s-hh-light">
        <div className="s-wrap">
          <p className="s-eyebrow s-eyebrow-grey">
            {HOME.heroEyebrow} — {DEPARTURES.filter((d) => !d.soldOut).length} DEPARTURES
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
              <span className="s-hh-apply-note">
                {HOME.heroFormNote} <span className="s-arrow">→</span>
              </span>
            </button>
          </div>
        </div>

        {/* The departures as a plain list. The comp deliberately does
            not make cards of them here — the cards come later down the
            page, and repeating them twice would say nothing new. */}
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
      </section>

      {/* ---------- PHONE — the dark comp ---------- */}
      <section className="s-hh s-hh-dark">
        <div className="s-wrap">
          <p className="s-eyebrow s-hh-dark-eyebrow">{HOME.heroEyebrow}</p>

          <h1 className="s-hh-dark-title">
            {HOME.heroDarkLine1}
            <br />
            {HOME.heroDarkLine2}
            <br />
            <em>{HOME.heroDarkItalic}</em>
          </h1>

          <div className="s-hh-dark-art">
            <TrainWindow
              coach={HOME.trainCoach}
              when={
                next
                  ? departureStart(next)
                      .toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" })
                      .toUpperCase()
                  : undefined
              }
            />
          </div>

          {next ? (
            <Countdown
              to={departureStart(next).toISOString()}
              label={HOME.countdownLabel}
              units={HOME.countdownUnits}
            />
          ) : null}

          <button
            type="button"
            className="s-btn s-hh-dark-apply"
            onClick={() => openApply(next?.id, "hero")}
          >
            {HOME.heroCta}
          </button>
        </div>
      </section>
    </>
  );
}
