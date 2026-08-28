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
  /**
   * `event` preselects the departure in the application form.
   * `source` names the surface the CTA sat on, so the funnel can show
   * which part of the site actually produces applications.
   * `plan` preselects a package, for CTAs that sit on one — pressing
   * PROCEED on a specific card should not make you choose it twice.
   */
  openApply: (event?: string, source?: string, plan?: string) => void;
  openCollab: () => void;
  close: () => void;
  preselect: string | null;
  /** Where the open came from. Analytics only. */
  source: string | null;
  /** The plan the CTA sat on, if any. A plan id, never a price. */
  preselectPlan: string | null;
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
  const [source, setSource] = useState<string | null>(null);
  const [preselectPlan, setPreselectPlan] = useState<string | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const openApply = useCallback((event?: string, from?: string, plan?: string) => {
    setPreselect(event ?? null);
    setSource(from ?? null);
    setPreselectPlan(plan ?? null);
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
    () => ({ open, openApply, openCollab, close, preselect, source, preselectPlan }),
    [open, openApply, openCollab, close, preselect, source, preselectPlan]
  );

  return (
    <ModalCtx.Provider value={value}>
      {children}
      {open === "apply" ? <ApplyModal /> : null}
      {open === "collab" ? <CollabModal /> : null}
    </ModalCtx.Provider>
  );
}
