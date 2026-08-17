"use client";

/* Editorial line reveal — build spec §29 "subtle text/CTA motion".

   Each line sits in an overflow-hidden mask and rises into place with a
   slight rotateX, which reads as a physical card turning rather than a
   plain fade. Lines are split on <br>, so the caller keeps control of
   phrasing instead of the component guessing at word wrap.

   Renders fully visible text on the server; the mask only engages once JS
   confirms motion is wanted. */

import { useEffect, useRef, type ReactNode } from "react";

export default function RevealText({
  lines,
  as: Tag = "h2",
  className,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const inner = Array.from(root.querySelectorAll<HTMLElement>(".rt-i"));
    root.classList.add("rt-armed");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          inner.forEach((el, i) => {
            el.style.transitionDelay = `${i * 90}ms`;
            el.classList.add("on");
          });
        });
      },
      { threshold: 0.25 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={`rt${className ? " " + className : ""}`}>
      {lines.map((l, i) => (
        <span className="rt-l" key={i}>
          <span className="rt-i">{l}</span>
        </span>
      ))}
    </Tag>
  );
}
