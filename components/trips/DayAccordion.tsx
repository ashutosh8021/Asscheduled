"use client";

/* THE SCHEDULE accordion — build spec §19 and §29 ("accordion animation for
   THE SCHEDULE", "must work exceptionally well on mobile").

   Native <details> cannot animate its own open/close, so height is driven
   here from the measured content. The panel keeps `hidden` off and uses
   height + opacity only, so it stays keyboard- and screen-reader-navigable
   while closed content stays out of the tab order via inert-like overflow.

   Default state is compact per §19; opening reveals full detail. */

import { useRef, useState, useEffect, type ReactNode } from "react";

export default function DayAccordion({
  no,
  title,
  defaultOpen,
  children,
}: {
  no: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [h, setH] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setH(open ? undefined : 0);
      return;
    }

    if (open) {
      setH(el.scrollHeight);
      // Release to auto once the transition lands so nested content can grow.
      const t = setTimeout(() => setH(undefined), 420);
      return () => clearTimeout(t);
    }
    // Lock to the current height first so the collapse has somewhere to go.
    setH(el.scrollHeight);
    const r = requestAnimationFrame(() => setH(0));
    return () => cancelAnimationFrame(r);
  }, [open]);

  return (
    <div className={`day acc${open ? " open" : ""}`}>
      <button
        type="button"
        className="acc-sum"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="day-no">D{no}</span>
        <span className="day-t">{title}</span>
        <span className="day-mk" aria-hidden="true">
          +
        </span>
      </button>
      <div
        className="acc-panel"
        ref={panelRef}
        style={{ height: h === undefined ? "auto" : h }}
        aria-hidden={!open}
      >
        <div className="day-in">{children}</div>
      </div>
    </div>
  );
}
