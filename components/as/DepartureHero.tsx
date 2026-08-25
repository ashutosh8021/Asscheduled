"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Slot from "./Slot";
import Stamp from "./Stamp";
import type { Clip, Slot as SlotData } from "@/lib/departures";

/* Full-screen hero for a departure page.

   A departure with film opens on it; everything else cross-fades
   through the stills, holding a slow push-in while each is on screen,
   so the masthead moves on its own instead of sitting as one static
   picture.

   Four things this deliberately does:

   1. Frames mount lazily. Only the first is in the DOM on load — the
      next is mounted one step ahead of being shown. All five stacked
      at once would put ~500KB of hero imagery in front of LCP.
   2. It can be paused. Auto-advancing content needs a stop control
      (WCAG 2.2.2), and it also pauses itself when the tab is hidden.
   3. Reduced motion means no auto-advance, no push-in and no
      autoplaying film — the first frame just sits there (the clip as
      its poster) and the segments still work by hand.
   4. The clip holds for its own length rather than the still interval.
      Cutting away from a performance three seconds in reads as a bug. */

const INTERVAL_MS = 3400;

/* Chosen after mount rather than with <source media>, whose support for
   video is inconsistent — and a wrong guess there downloads the wrong
   file before it can be corrected. The poster covers the gap. */
const NARROW = "(max-width: 820px)";

interface Props {
  frames: SlotData[];
  /** Rendered over the image — the title block and metadata. */
  children: React.ReactNode;
  /** Placeholder caption for frames with no photography yet. */
  hint?: string;
  /** Struck across the lower right when a departure is closed. */
  stamp?: { label: string; top: string; bottom: string };
  /** Plays first, ahead of the stills. */
  clip?: Clip;
}

export default function DepartureHero({ frames, children, hint, stamp, clip }: Props) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [motion, setMotion] = useState(true);
  const [narrow, setNarrow] = useState(false);
  /* Which frames exist in the DOM. Grows as the sequence advances. */
  const [mounted, setMounted] = useState<number[]>([0]);
  const timer = useRef<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  /* With a clip, slot 0 is the film and the stills start at 1. */
  const offset = clip ? 1 : 0;
  const count = frames.length + offset;

  /* The clip earns its full runtime; the stills get the usual beat. */
  const holdFor = useCallback(
    (i: number) => (clip && i === 0 ? clip.seconds * 1000 : INTERVAL_MS),
    [clip]
  );

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

  useEffect(() => {
    if (!clip) return;
    const mq = window.matchMedia(NARROW);
    const pick = () => setNarrow(mq.matches);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [clip]);

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

    timer.current = window.setTimeout(() => show(idx + 1), holdFor(idx));
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [idx, playing, motion, count, show, holdFor]);

  /* Restart the film each time the sequence comes back round to it,
     and hold it still whenever it is off screen or paused.

     `narrow` belongs in the deps even though it is not read here: the
     first render always picks the wide cut, and the swap to the
     portrait one changes `src`, which reloads the element and leaves
     it paused. Without this the film never starts on a phone. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;

    if (idx === 0 && playing && motion) {
      v.currentTime = 0;
      /* A blocked autoplay is not an error worth surfacing — the
         poster is already showing the same frame. */
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [idx, playing, motion, narrow]);

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
        {clip ? (
          <div className="s-dhero-frame" data-on={idx === 0} aria-hidden={idx !== 0}>
            <video
              ref={video}
              className="s-dhero-video"
              /* Both cuts exist; only the matched one is ever fetched. */
              src={narrow ? clip.portrait : clip.src}
              poster={narrow ? clip.posterPortrait : clip.poster}
              aria-label={clip.alt}
              /* muted + playsInline are both required for inline
                 autoplay on iOS, and the poster carries the frame
                 until the video decodes so the hero is never blank. */
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
            />
          </div>
        ) : null}

        {frames.map((f, i) =>
          mounted.includes(i + offset) ? (
            <div
              key={f.label}
              className="s-dhero-frame"
              data-on={i + offset === idx}
              data-motion={motion}
              aria-hidden={i + offset !== idx}
            >
              <Slot
                slot={f}
                priority={i === 0 && !clip}
                sizes="100vw"
                quality={90}
                hint={hint}
              />
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
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
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
                  /* The clip's segment has to run for the clip's
                     length, not the CSS default. */
                  style={{ animationDuration: `${holdFor(i)}ms` }}
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
