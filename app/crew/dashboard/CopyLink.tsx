"use client";

import { useState } from "react";
import { CREW_PANEL } from "@/lib/copy";

/* Copy the referral link.
 *
 * The link is also shown in full above this button, and selectable, so
 * the page still works where the clipboard API is refused — which it is
 * on an insecure origin and in some in-app browsers. */

export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Nothing to say: the link is on the page to be selected by hand. */
    }
  }

  return (
    <button type="button" className="s-btn s-btn-forest" onClick={() => void copy()}>
      {copied ? CREW_PANEL.copied : CREW_PANEL.copyCta}
    </button>
  );
}
