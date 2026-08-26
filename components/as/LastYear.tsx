"use client";

import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/departures";

/* Footage from the previous edition of the fest.

   Three things this is careful about:

   1. Nothing loads until it is nearly on screen. Several autoplaying
      videos halfway down a page would compete with the hero for
      bandwidth on a phone and cost the LCP nothing back.
   2. It pauses when it scrolls away. A muted video playing to an empty
      viewport is battery spent for no one.
   3. Reduced motion gets the poster frames and a play control, never
      an autoplaying loop.

   The section says which year it is. That is the whole basis on which
   showing it is honest — it is what the place was actually like, not
   something dressed up as one of ours. */

export default function LastYear({
  eyebrow,
  title,
  note,
  reels,
}: {
  eyebrow: string;
  title: string;
  note: string;
  reels: Reel[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState(true);
  /* Stays false until the strip is close enough to matter. */
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotion(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) setLive(true);

        /* Play only while visible. Cheap, and it keeps a phone from
           decoding two videos nobody is looking at. */
        for (const v of el.querySelectorAll("video")) {
          if (entry.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  return (
    /* Split rather than stacked: two vertical clips left on their own
       fill about half a desktop row, and the rest reads as a mistake.
       Text takes the other half, and it stacks on a phone like every
       other split on this page. */
    <div ref={root} className="s-split s-split-top s-ly">
      <div>
        <p className="s-eyebrow s-eyebrow-grey">{eyebrow}</p>
        <h2 className="s-h2 s-ly-title">{title}</h2>
        <p className="s-body s-ly-note">{note}</p>
      </div>

      <div className="s-ly-reels">
        {reels.map((r) => (
          <figure key={r.src} className="s-ly-reel">
            <video
              /* Poster first, bytes only once it is worth it. */
              src={live && motion ? r.src : undefined}
              poster={r.poster}
              aria-label={r.alt}
              muted
              loop
              playsInline
              preload="none"
              controls={!motion}
              disablePictureInPicture
            />
            {r.credit ? <figcaption>{r.credit}</figcaption> : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
