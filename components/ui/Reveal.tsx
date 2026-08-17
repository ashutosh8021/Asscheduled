"use client";

/* Scroll reveal — GSAP ScrollTrigger drives the reference's `.rv` →
   `.rv.on` pattern. GSAP is imported dynamically after hydration so it
   stays out of the initial bundle (perf budget). Under reduced motion it
   is never loaded at all. */

import { useEffect } from "react";

export function useScrollReveals() {
  useEffect(() => {
    const showAll = () =>
      document.querySelectorAll(".rv").forEach((el) => el.classList.add("on"));

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    let revert: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          ScrollTrigger.batch(".rv", {
            start: "top 88%",
            once: true,
            onEnter: (els) =>
              els.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 90)),
          });
        });
        revert = () => ctx.revert();
      } catch {
        showAll(); // GSAP unavailable — content must still be visible
      }
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
}

export default function Reveals() {
  useScrollReveals();
  return null;
}
