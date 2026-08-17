"use client";

/* 3D perspective rail. Each card rotates on Y and recedes on Z according to
   its distance from the centre of the viewport, so the row reads as a real
   carousel in depth rather than a flat strip.

   Driven by scroll position through rAF — no library, no WebGL, and the
   transform is the only property that changes, so it stays on the compositor.
   Disabled wholesale under prefers-reduced-motion. */

import { useEffect, useRef, type ReactNode } from "react";

const MAX_ROT = 15; // degrees at the edges
const MAX_Z = 120; // px of recession at the edges

export default function Rail3D({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return;

    let raf = 0;
    let queued = false;

    const apply = () => {
      queued = false;
      const box = el.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      for (const card of cards) {
        const c = card.getBoundingClientRect();
        const centre = c.left + c.width / 2;
        // -1 (far left) … 0 (centre) … 1 (far right)
        const d = Math.max(-1, Math.min(1, (centre - mid) / (box.width / 2)));
        const rot = -d * MAX_ROT;
        const z = -Math.abs(d) * MAX_Z;
        card.style.transform = `perspective(1200px) translateZ(${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
        card.style.opacity = String(1 - Math.abs(d) * 0.25);
      }
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.opacity = "";
      });
    };
  }, []);

  return (
    <div ref={ref} className={`rail-scroll rail-3d${className ? " " + className : ""}`}>
      {children}
    </div>
  );
}
