"use client";

import { useState } from "react";
import { CREW_PANEL } from "@/lib/copy";

/* Sign out. A full navigation afterwards, because the page that comes
 * next is decided on the server by a cookie this request clears. */

export default function CrewSignOut() {
  const [busy, setBusy] = useState(false);

  async function out() {
    setBusy(true);
    try {
      await fetch("/api/somewhere/crew/logout", { method: "POST" });
    } catch {
      /* Fall through: the redirect below lands on the login page either
         way, and the session expires on its own. */
    }
    window.location.replace("/crew/login");
  }

  return (
    <button type="button" className="s-crew-out" onClick={() => void out()} disabled={busy}>
      {CREW_PANEL.signOut}
    </button>
  );
}
