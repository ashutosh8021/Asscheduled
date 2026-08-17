"use client";

/* Campaign video slot — build spec §5 ("immersive photography/video").

   No Season 01 footage exists yet, so with `src: null` this renders the same
   labelled placeholder as a still frame. Dropping a real file into
   `lib/trips.ts` (or passing one here) turns it into an autoplaying muted
   loop with no layout change.

   Autoplay only starts once the element is on screen, and never under
   prefers-reduced-motion — §29 says motion must not get in the way of
   content, so the poster frame stands in. */

import { useEffect, useRef, useState } from "react";

export interface VideoSlot {
  src: string | null;
  poster?: string | null;
  label: string;
  alt: string;
}

export default function VideoFrame({
  slot,
  ratio = "16 / 9",
  className,
}: {
  slot: VideoSlot;
  ratio?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;

    const el = ref.current;
    if (!el) return;

    // Only spend bandwidth/decode on a video that is actually visible.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) void el.play().catch(() => {});
          else el.pause();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slot.src]);

  return (
    <div
      className={`frame vframe${className ? " " + className : ""}`}
      style={{ aspectRatio: ratio }}
    >
      {slot.src ? (
        <video
          ref={ref}
          className="frame-img vframe-v"
          muted
          loop
          playsInline
          preload="metadata"
          poster={slot.poster ?? undefined}
          controls={reduced}
          aria-label={slot.alt}
        >
          <source src={slot.src} />
        </video>
      ) : (
        <span className="frame-ph" aria-hidden="true">
          <span className="frame-ph-l">{slot.label}</span>
          <span className="frame-ph-n">AWAITING SEASON 01 FOOTAGE</span>
        </span>
      )}
    </div>
  );
}
