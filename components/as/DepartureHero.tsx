"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Slot from "./Slot";
import Stamp from "./Stamp";
import type { Slot as SlotData } from "@/lib/departures";

/* Full-screen hero for a departure page.

   The frames cross-fade and hold a slow push-in while they are on
   screen, so the masthead moves on its own instead of sitting as one
   static picture.

   Three things this deliberately does:

   1. Frames mount lazily. Only the first frame is in the DOM on load —
      the next is mounted one step ahead of being shown. All five
      stacked at once would put ~500KB of hero imagery in front of LCP.
   2. It can be paused. Auto-advancing content needs a stop control
      (WCAG 2.2.2), and it also pauses itself when the tab is hidden.
   3. Reduced motion means no auto-advance and no push-in at all — the
      first frame just sits there and the segments still work by hand. */

const INTERVAL_MS = 5000;

interface Props {
  frames: SlotData[];
  /** Rendered over the image — the title block and metadata. */
  children: React.ReactNode;
  /** Placeholder caption for frames with no photography yet. */
  hint?: string;
  /** Struck across the lower right when a departure is closed. */
  stamp?: { label: string; top: string; bottom: string };
}

export default function DepartureHero({ frames, children, hint, stamp }: Props) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [motion, setMotion] = useState(true);
  /* Which frames exist in the DOM. Grows as the sequence advances. */
  const [mounted, setMounted] = useState<number[]>([0]);
  const timer = useRef<number | null>(null);

  const count = frames.length;

  const show = useCallback(
    (next: number) => {
      const n = ((next % count) + count) % count;
      setIdx(n);
      /* Mount the one after it so the next fade has bytes ready. */
      setMounted((m) => {
        const want = [n, (n + 1) % count].filter((i) => !m.includes(i));
        return want.length ? [...m, ...want] : m;
      });
    },
    [count]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotion(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* Mount the second frame after hydration rather than in the server
     HTML: it keeps the first frame alone in the markup so the browser
     gives it the whole connection, and it is still loaded long before
     the first cross-fade needs it. */
  useEffect(() => {
    if (count < 2) return;
    setMounted((m) => (m.includes(1) ? m : [...m, 1]));
  }, [count]);

  /* Auto-advance. Skipped entirely under reduced motion. */
  useEffect(() => {
    if (!playing || !motion || count < 2) return;

    timer.current = window.setTimeout(() => show(idx + 1), INTERVAL_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [idx, playing, motion, count, show]);

  /* A carousel ticking away in a background tab is wasted work. */
  useEffect(() => {
    function onVis() {
      if (document.hidden) setPlaying(false);
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(idx + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(idx - 1);
    }
  }

  return (
    <section
      className="s-dhero"
      aria-roledescription="carousel"
      aria-label="Departure photography"
      onKeyDown={onKeyDown}
    >
      <div className="s-dhero-stack">
        {frames.map((f, i) =>
          mounted.includes(i) ? (
            <div
              key={f.label}
              className="s-dhero-frame"
              data-on={i === idx}
              data-motion={motion}
              aria-hidden={i !== idx}
            >
              <Slot slot={f} priority={i === 0} sizes="100vw" hint={hint} />
            </div>
          ) : null
        )}
      </div>

      <div className="s-dhero-scrim" />

      <div className="s-dhero-inner s-wrap">{children}</div>

      {stamp ? (
        <Stamp
          className="s-stamp-round-over s-stamp-hero"
          label={stamp.label}
          top={stamp.top}
          bottom={stamp.bottom}
        />
      ) : null}

      {count > 1 ? (
        <div className="s-dhero-ui s-wrap">
          <div className="s-dhero-segs" role="tablist" aria-label="Choose a frame">
            {frames.map((f, i) => (
              <button
                key={f.label}
                type="button"
                role="tab"
                className="s-dhero-seg"
                data-on={i === idx}
                aria-selected={i === idx}
                aria-label={`Frame ${i + 1} of ${count}`}
                onClick={() => {
                  setPlaying(false);
                  show(i);
                }}
              >
                <span
                  /* Remounting on every change restarts the fill. */
                  key={`${i}-${idx}-${playing}`}
                  className="s-dhero-seg-fill"
                  data-run={i === idx && playing && motion}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="s-dhero-play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause photography" : "Play photography"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
