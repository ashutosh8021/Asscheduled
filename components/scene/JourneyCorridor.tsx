"use client";

/* THE ROUTE — the travel centrepiece.

   Every open departure is placed at its own depth along a Z corridor. The
   section pins and scrolling flies the camera forward through them, so the
   season reads as one continuous route rather than a list. Waypoint ticks
   between stops give the movement something to measure against.

   Real 3D: one perspective camera, one preserve-3d world, objects at fixed
   Z positions. Nothing is faked with scale.

   Mobile and reduced-motion both fall back to a plain vertical stack — the
   spec forbids motion that gets between a visitor and the content, and a
   pinned corridor on a phone is exactly that. */

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Trip } from "@/lib/trips";
import { inr } from "@/lib/format";
import SplitFlap from "@/components/ui/SplitFlap";

const GAP = 1100; // Z distance between stops
const TICKS = 26;

export default function JourneyCorridor({ trips }: { trips: Trip[] }) {
  const root = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(max-width: 900px)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const travel = GAP * trips.length + 600;

        gsap.to(world.current, {
          z: travel,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${travel}`,
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        /* Each stop brightens as the camera reaches it. The first one is
           already at the camera plane when the section pins, so it starts
           lit — giving it a fade would mean a zero-length scroll range. */
        trips.forEach((_, i) => {
          if (i === 0) return;
          const at = i * GAP;
          gsap.fromTo(
            `.jc-stop-${i}`,
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: () => `top+=${at - 700} top`,
                end: () => `top+=${at} top`,
                scrub: true,
              },
            }
          );
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [trips]);

  return (
    <section className="jc" ref={root} id="route">
      <div className="jc-head">
        <h2 className="disp jc-title">THE ROUTE</h2>
        <p className="sec-no">SEASON 01 — {trips.length} DEPARTURES, ONE CORRIDOR</p>
      </div>

      <div className="jc-stage">
        <div className="jc-world" ref={world}>
          {/* corridor waypoints */}
          <div className="jc-rails" aria-hidden="true">
            {Array.from({ length: TICKS }).map((_, i) => (
              <span
                key={i}
                className="jc-tick"
                style={{ transform: `translate(-50%,-50%) translateZ(${-i * 320}px)` }}
              />
            ))}
          </div>

          {trips.map((t, i) => (
            <article
              key={t.id}
              className={`jc-stop jc-stop-${i}`}
              style={{ transform: `translate(-50%,-50%) translateZ(${-i * GAP}px)` }}
            >
              <div className="jc-card">
                <div className="jc-card-top">
                  <span className="lbl lbl-grey">
                    STOP {String(i + 1).padStart(2, "0")} / {String(trips.length).padStart(2, "0")}
                  </span>
                  <span className="st st-blue">{t.id}</span>
                </div>
                <h3 className="disp jc-fest">
                  <SplitFlap text={t.fest} />
                </h3>
                <p className="lbl jc-where">
                  {t.campus} — {t.city}
                </p>
                <p className="jc-hook">{t.hook}</p>
                <div className="jc-card-foot">
                  <span className="disp jc-price">{inr(t.price)}</span>
                  <Link className="btn btn-peach jc-btn" href={`/trips/${t.slug}`}>
                    Open case file
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="jc-foot lbl">SCROLL TO FLY THE ROUTE — EVENINGS SEALED UNTIL DEPARTURE</p>
    </section>
  );
}
