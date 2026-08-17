"use client";

/* Pointer-driven 3D tilt — CSS transforms via GSAP quickTo, no WebGL.
   GSAP loads dynamically after hydration (perf budget). Skipped entirely
   under reduced motion and on touch-only devices. */

import { useRef, useEffect, type ReactNode } from "react";

export default function Tilt3D({
  children,
  max = 6,
  className,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(hover: none)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { default: gsap } = await import("gsap");
        if (cancelled) return;

        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          rx(-py * max * 2);
          ry(px * max * 2);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanup = () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          gsap.set(el, { rotationX: 0, rotationY: 0 });
        };
      } catch {
        /* GSAP unavailable — the element simply doesn't tilt. */
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt${className ? " " + className : ""}`}>
      {children}
    </div>
  );
}
