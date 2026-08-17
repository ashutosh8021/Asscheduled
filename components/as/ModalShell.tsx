"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useModal } from "./ModalProvider";

/* Scrim + panel + focus trap, shared by both overlays.

   Focus moves into the panel on open and returns to whatever opened it
   on close. Tab is cycled inside the panel so the page behind is never
   reachable while the overlay is up. */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface Props {
  labelledBy: string;
  children: ReactNode;
}

export default function ModalShell({ labelledBy, children }: Props) {
  const { close } = useModal();
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;

    /* Two frames: one for mount, one so the opening transition has a
       start value to animate from. */
    const raf = requestAnimationFrame(() => {
      scrim.current?.setAttribute("data-open", "true");
      const first = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      restoreTo.current?.focus?.();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const nodes = panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes || nodes.length === 0) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      ref={scrim}
      className="s-modal-scrim"
      onMouseDown={(e) => {
        /* mousedown, not click: a drag that starts inside the panel and
           ends on the scrim should not close it. */
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panel}
        className="s-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button type="button" className="s-modal-x" onClick={close} aria-label="Close">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
