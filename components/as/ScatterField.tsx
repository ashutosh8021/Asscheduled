"use client";

import { useEffect, useRef, useState } from "react";
import Slot from "./Slot";
import type { Slot as SlotData } from "@/lib/departures";

/* The scattered polaroid field, in real 3D.

   The container carries the perspective and tilts toward the pointer;
   each frame sits at its own translateZ. That single rotation on the
   parent is what produces the parallax — frames nearer the viewer sweep
   further than the ones pushed back, for free, without per-frame maths.

   Frames are anchored to the left and right edges rather than placed
   across the whole width, so the headline in the middle always has a
   clear corridor no matter how wide the window gets.

   Pointer tracking is skipped entirely on touch and under reduced
   motion — there is no pointer to follow on a phone, and the tilt is
   decoration, never a way to reach content. */

export interface Place {
  /** Which edge the frame hangs off. */
  side: "left" | "right";
  /** Distance in from that edge. */
  x: string;
  y: string;
  rot: number;
  /** Depth in px. Negative sits further back. */
  z: number;
  delay: number;
}

interface Props {
  frames: SlotData[];
  places: Place[];
}

export default function ScatterField({ frames, places }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState(true);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) {
      setTilt(false);
      return;
    }

    let frame = 0;
    function onMove(e: PointerEvent) {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el2 = stage.current;
        if (!el2) return;
        const r = el2.getBoundingClientRect();
        /* -1 … 1 from the centre of the field. */
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el2.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 5}deg)`;
      });
    }

    function onLeave() {
      const el2 = stage.current;
      if (el2) el2.style.transform = "";
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="s-scatter-stage" ref={stage} data-tilt={tilt}>
      {frames.map((f, i) => {
        const p = places[i];
        if (!p) return null;
        return (
          <div
            key={f.label}
            className="s-scatter-item"
            style={
              {
                top: p.y,
                [p.side]: p.x,
                "--z": `${p.z}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          >
            <div className="s-scatter-card" style={{ "--rot": `${p.rot}deg` } as React.CSSProperties}>
              <Slot slot={f} sizes="300px" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
