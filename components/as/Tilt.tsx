"use client";

import { useRef, type ReactNode } from "react";

/* Pointer-tracked 3D tilt.

   Writes to a transform on rAF only — no state, so a moving pointer
   never re-renders React. Disabled for coarse pointers (a tilt that
   needs hover is dead weight on touch) and for reduced motion. */

interface Props {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** How far the card lifts toward the viewer, in px. */
  lift?: number;
}

export default function Tilt({ children, className = "", max = 7, lift = 14 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !enabled()) return;

    const rect = el.getBoundingClientRect();
    /* -0.5 … 0.5 from the element's centre. */
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(${lift}px)`;
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.transform = "";
  }

  return (
    <div className="s-stage">
      <div
        ref={ref}
        className={`s-tilt ${className}`.trim()}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
      </div>
    </div>
  );
}
