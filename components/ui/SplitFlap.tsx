"use client";

/* Split-flap departure board text. Renders the final characters server-side
   (SEO + no-JS safe), then scrambles them once when scrolled into view.

   Cells are written via refs rather than React state — a 20-character word
   swapping glyphs every ~45ms would otherwise re-render the whole board.
   Skipped entirely under prefers-reduced-motion. */

import { useEffect, useRef } from "react";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SWAP_MS = 45; // glyph change rate — slower reads as mechanical, not noisy

export default function SplitFlap({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-final]"));
    if (!cells.length) return;

    const settle = () =>
      cells.forEach((c) => {
        c.textContent = c.dataset.final ?? "";
        c.classList.remove("spin");
      });

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    let raf = 0;
    let io: IntersectionObserver | null = null;

    const run = () => {
      const plan = cells.map((cell, i) => ({
        cell,
        final: cell.dataset.final ?? "",
        start: i * 55,
        dur: 380 + (i % 5) * 70,
        lastSwap: -Infinity,
        settled: false,
      }));

      const t0 = performance.now();
      const tick = (now: number) => {
        const elapsed = now - t0;
        let running = false;

        for (const p of plan) {
          if (p.settled) continue;
          // Blanks have nothing to flip through.
          if (!p.final.trim()) {
            p.cell.textContent = p.final;
            p.settled = true;
            continue;
          }
          if (elapsed < p.start) {
            running = true;
            continue;
          }
          if (elapsed >= p.start + p.dur) {
            p.cell.textContent = p.final;
            p.cell.classList.remove("spin");
            p.settled = true;
            continue;
          }
          running = true;
          p.cell.classList.add("spin");
          if (now - p.lastSwap >= SWAP_MS) {
            p.cell.textContent = CHARSET[(Math.random() * CHARSET.length) | 0];
            p.lastSwap = now;
          }
        }

        if (running) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      run();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io?.disconnect();
            io = null;
            run();
          });
        },
        { threshold: 0.3 }
      );
      io.observe(root);
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [text]);

  return (
    <span ref={rootRef} className={`flapline${className ? " " + className : ""}`}>
      {/* Screen readers get the word intact; the flaps are decorative. */}
      <span className="sr-only">{text}</span>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className={`flap${ch.trim() ? "" : " space"}`}
          data-final={ch}
          aria-hidden="true"
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
