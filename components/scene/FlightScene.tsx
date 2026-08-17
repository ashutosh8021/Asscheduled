"use client";

/* 3D flight hero.

   A real perspective world: the sky bands, horizon, altitude rings and bird
   all sit at different translateZ depths inside one preserve-3d stage, and
   scrolling dollies the camera forward through them. Perspective does the
   scaling, so near objects rush past and far ones drift — the parallax is a
   consequence of depth rather than a fake of it.

   Everything is transform/opacity only. GSAP is imported dynamically so it
   never lands in the initial bundle, and the whole thing is skipped under
   prefers-reduced-motion (the static composition still reads correctly). */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bird, BIRD_PATH } from "@/components/ui/Bird";
import SplitFlap from "@/components/ui/SplitFlap";

/* Altitude rings, receding into the distance. */
const RINGS = [-300, -700, -1200, -1800, -2500];

export default function FlightScene() {
  const root = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
        const scrub = {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        };

        /* Camera dolly: push the whole world toward the viewer. */
        gsap.to(world.current, { z: 900, ease: "none", scrollTrigger: scrub });

        /* Bird flies its own path across and through the scene. */
        gsap.to(".fs-bird", {
          xPercent: 190,
          yPercent: -70,
          z: 420,
          rotateZ: -12,
          ease: "none",
          scrollTrigger: scrub,
        });

        /* Type recedes as the camera advances, so it feels overtaken. */
        gsap.to(".fs-type", {
          z: -420,
          opacity: 0,
          ease: "none",
          scrollTrigger: { ...scrub, end: "70% top" },
        });

        gsap.to(".fs-ring", {
          rotateZ: (i: number) => (i % 2 ? 26 : -26),
          ease: "none",
          scrollTrigger: scrub,
        });
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="fs" ref={root} aria-label="AS Scheduled — Season 01">
      <div className="fs-stage">
        <div className="fs-world" ref={world}>
          {/* depth field */}
          <div className="fs-sky" aria-hidden="true" />
          {RINGS.map((z, i) => (
            <span
              key={z}
              className="fs-ring"
              aria-hidden="true"
              style={{ transform: `translate(-50%,-50%) translateZ(${z}px)` }}
            >
              <i style={{ animationDelay: `${i * 0.4}s` }} />
            </span>
          ))}
          <div className="fs-horizon" aria-hidden="true" />

          {/* ghost wordmark, far back */}
          <span className="fs-ghost" aria-hidden="true">
            AS SCHEDULED
          </span>

          <Bird className="fs-bird" fill="none" stroke="#FFAD84" strokeWidth={0.7} />

          {/* rotating seal, mid depth */}
          <div className="fs-seal" aria-hidden="true">
            <svg viewBox="0 0 130 130">
              <defs>
                <path id="fsc" d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
              </defs>
              <text>
                <textPath href="#fsc">APPLICATION ONLY • 19 SEATS • NO APPEALS • </textPath>
              </text>
              <path className="bird-c" transform="translate(38,48) scale(.95)" d={BIRD_PATH} />
            </svg>
          </div>
        </div>
      </div>

      {/* flight strip — fixed to the frame, not the world */}
      <div className="fs-meta lbl">
        <span>SEASON 01 / IND</span>
        <span className="fs-meta-mid">
          <SplitFlap text="DEPARTURES OPEN" />
        </span>
        <span>STATUS: BOARDING</span>
      </div>

      <div className="fs-type">
        <h1 className="disp fs-h">
          THE FEST GETS YOU THERE.
          <br />
          <span className="fs-h2">the city keeps you.</span>
        </h1>
        <p className="fs-sub">
          Six-day curated departures around India&apos;s biggest college fests. Travel, fest
          access, stays and every meal — handled. Nineteen seats per departure.{" "}
          <em>You apply, we choose.</em>
        </p>
        <div className="fs-cta">
          <Link className="btn btn-peach" href="/apply">
            Apply now — ₹500 registration
          </Link>
          <Link className="btn" href="/trips">
            View all departures
          </Link>
        </div>
      </div>

      <span className="fs-scroll lbl" aria-hidden="true">
        SCROLL — BEGIN DESCENT
      </span>
    </section>
  );
}
