"use client";

import { useModal } from "./ModalProvider";

/* A CTA that opens the application overlay, usable from server pages.

   Every primary CTA on the site routes here rather than to a page —
   the comps show the application as an overlay, never a route. */

export default function ApplyButton({
  label,
  event,
  className = "s-btn",
  full = false,
  source = "departure",
}: {
  label: string;
  /** Departure id, preselects the event in the form. */
  event?: string;
  className?: string;
  full?: boolean;
  /** Names the surface this button sits on, for the funnel. */
  source?: string;
}) {
  const { openApply } = useModal();

  return (
    <button
      type="button"
      className={className}
      style={full ? { width: "100%" } : undefined}
      onClick={() => openApply(event, source)}
    >
      {label} <span className="s-arrow">↗</span>
    </button>
  );
}
