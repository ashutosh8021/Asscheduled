"use client";

/* Gate in front of the WebGL scene.

   The perf contract for V2 (CLAUDE.md budget, kept): the page is complete and
   readable as static HTML, and three.js is only fetched when
     - the visitor has not asked for reduced motion,
     - the device can plausibly run it,
     - WebGL actually exists,
     - and the browser is idle after first paint.
   Anything short of all four gets the CSS gradient fallback, which is already
   in the markup. Nothing here can delay content. */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => null });

/** Non-standard but widely shipped hints, typed rather than cast to any. */
interface CapabilityNavigator extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function canRun(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const nav = navigator as CapabilityNavigator;
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;

  /* Cheapest reliable WebGL probe. */
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return gl !== null;
  } catch {
    return false;
  }
}

export default function SceneMount() {
  const [ready, setReady] = useState(false);
  /* Torn down once the hero is well out of view — no GPU burn on a page the
     visitor has already scrolled past. */
  const [near, setNear] = useState(true);
  const [stars, setStars] = useState(1400);
  const scroll = useRef(0);

  useEffect(() => {
    if (!canRun()) return;

    setStars(window.innerWidth < 760 ? 900 : 2200);

    /* Wait for idle so the scene never competes with LCP.
       Safari only shipped requestIdleCallback in 16.4 — hence the fallback. */
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle: number = hasIdle
      ? window.requestIdleCallback(() => setReady(true), { timeout: 2500 })
      : window.setTimeout(() => setReady(true), 1200);

    return () => {
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const vh = window.innerHeight || 1;
        scroll.current = Math.min(1, Math.max(0, window.scrollY / vh));
        setNear((was) => {
          const now = window.scrollY < vh * 1.5;
          return now === was ? was : now;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!ready || !near) return null;

  return (
    <div className="v2-canvas" aria-hidden="true">
      <Scene scroll={scroll} starCount={stars} />
    </div>
  );
}
