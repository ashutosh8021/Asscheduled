"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ApplyModal from "./ApplyModal";
import CollabModal from "./CollabModal";

/* One provider so every CTA on the site — header, hero, cards, footer —
   opens the same application flow instead of routing to a page.
   The comps show it as an overlay, not a route. */

type Which = null | "apply" | "collab";

interface Ctx {
  open: Which;
  /** `event` preselects the departure in the application form. */
  openApply: (event?: string) => void;
  openCollab: () => void;
  close: () => void;
  preselect: string | null;
}

const ModalCtx = createContext<Ctx | null>(null);

export function useModal(): Ctx {
  const ctx = useContext(ModalCtx);
  if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");
  return ctx;
}

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Which>(null);
  const [preselect, setPreselect] = useState<string | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const openApply = useCallback((event?: string) => {
    setPreselect(event ?? null);
    setOpen("apply");
  }, []);
  const openCollab = useCallback(() => setOpen("collab"), []);

  /* Escape closes, and the page behind never scrolls while a modal is up. */
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("s-locked");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("s-locked");
    };
  }, [open, close]);

  const value = useMemo(
    () => ({ open, openApply, openCollab, close, preselect }),
    [open, openApply, openCollab, close, preselect]
  );

  return (
    <ModalCtx.Provider value={value}>
      {children}
      {open === "apply" ? <ApplyModal /> : null}
      {open === "collab" ? <CollabModal /> : null}
    </ModalCtx.Provider>
  );
}
