"use client";

import { useEffect, useRef } from "react";

/* Video clips inside a past-trip block.

   Three things keep this from wrecking the page:

   1. `preload="none"` plus a poster image. Nothing downloads until a
      clip is actually scrolled to — otherwise five megabytes of footage
      would load on a page most visitors scroll straight past.
   2. An IntersectionObserver plays only what is on screen and pauses
      the rest, so at most one or two decode at a time.
   3. Reduced motion means nothing plays on its own; the poster sits
      there and the controls still work by hand.

   muted + playsInline are both required for inline autoplay on iOS. */

export interface Clip {
  src: string;
  poster: string;
  label: string;
  alt: string;
}

export default function PastVideos({ clips }: { clips: Clip[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;

    /* No autoplay on touch devices. `preload="none"` means nothing is
       fetched until something plays, so scroll-to-play is exactly what
       would spend a visitor's mobile data — several megabytes of clips
       for a section they may only be scrolling past. On a phone the
       poster waits for a tap instead. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const videos = Array.from(root.querySelectorAll("video"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            /* play() rejects if the browser blocks autoplay — that is a
               normal outcome, not an error worth surfacing. */
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.35 }
    );

    for (const v of videos) io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="s-past-clips" ref={wrap}>
      {clips.map((c) => (
        <figure key={c.label} className="s-past-clip">
          <video
            src={c.src}
            poster={c.poster}
            muted
            loop
            playsInline
            preload="none"
            controls
            aria-label={c.alt}
          />
          <figcaption className="s-past-clip-cap">{c.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
