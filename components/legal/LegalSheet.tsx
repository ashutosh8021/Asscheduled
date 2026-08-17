"use client";

import { useEffect } from "react";
import { LEGAL_TABS, LegalPaneContent, type LegalPane } from "./LegalContent";

export default function LegalSheet({
  pane,
  setPane,
  onClose,
}: {
  pane: LegalPane;
  setPane: (p: LegalPane) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.classList.add("locked");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("locked");
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="legal open" role="dialog" aria-modal="true" aria-label="Paperwork">
      <div className="legal-bg" onClick={onClose} />
      <div className="legal-sheet">
        <div className="legal-head">
          <h2 className="disp">Paperwork</h2>
          <button className="app-close" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="legal-tabs">
          {LEGAL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={pane === t.id ? "on" : ""}
              onClick={() => setPane(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="legal-body">
          <div className="lpane on">
            <LegalPaneContent pane={pane} />
          </div>
        </div>
      </div>
    </div>
  );
}
