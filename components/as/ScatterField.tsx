"use client";

import { useEffect, useRef, useState } from "react";
import Slot from "./Slot";
import type { Slot as SlotData } from "@/lib/departures";

/* The scattered photo field.

   Frames ring the centre rather than stacking down the edges, leaving a
   hole for the headline. Positions live in app/gallery/page.tsx: the
   rule is that anything in the middle vertical band must stay wide of
   the centre, while frames above and below it are free horizontally,
   because they clear the text vertically anyway.

   Depth comes from a single rotation on the stage. Each frame has its
   own translateZ, so near ones sweep further than far ones as the
   pointer moves — parallax for free, no per-frame maths.

   Pointer tracking is skipped on touch and under reduced motion: there
   is no pointer on a phone, and the tilt is decoration that must never
   gate access to anything. */

export interface Place {
  /** % from the left of the field. */
  x: string;
  /** % from the top of the field. */
  y: string;
  /** Depth in px. Negative sits further back. */
  z: number;
  delay: number;
  /** Optional per-frame width override, for a little variety. */
  w?: string;
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
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el2.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 4}deg)`;
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
                left: p.x,
                width: p.w,
                "--z": `${p.z}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          >
            <div className="s-scatter-card">
              <Slot slot={f} sizes="240px" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
