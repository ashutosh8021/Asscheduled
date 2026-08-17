"use client";

import { useEffect, useRef } from "react";

const NUMS: [number, string][] = [
  [1, "Trip run"],
  [70, "Humans moved"],
  [11, "Days, longest run"],
  [0, "People lost"],
];

/* Count-up on enter — plain IntersectionObserver + rAF, no library. */
export default function Numbers() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("b[data-n]"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => (el.textContent = el.dataset.n ?? ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const target = Number(el.dataset.n);
          const t0 = performance.now();
          const dur = 900;
          const tick = (t: number) => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="nums" ref={ref}>
      {NUMS.map(([n, label]) => (
        <div className="num rv" key={label}>
          <b data-n={n}>{n}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
