"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Scroll reveal. IntersectionObserver rather than a scroll library —
   it costs nothing, and the reduced-motion path is the CSS default
   (see .s-rv in app/as.css), so content is never gated behind motion. */

interface Props {
  children: ReactNode;
  /** Stagger step, 1–4. Maps to the .s-rv-N delay classes. */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
}

export default function Reveal({ children, delay = 0, className = "", amount = 0.15 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion: .s-rv is already visible in CSS, so skip the
       observer entirely rather than animating and then cancelling. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("s-on");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("s-on");
          io.unobserve(entry.target);
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  const delayClass = delay ? ` s-rv-${delay}` : "";

  return (
    <div ref={ref} className={`s-rv${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
