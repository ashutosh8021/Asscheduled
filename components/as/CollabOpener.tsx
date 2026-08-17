"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useModal } from "./ModalProvider";

/* The "Collab" link in the footer routes to /contact?collab=1. This
   opens the collaboration overlay when it does, and also renders the
   button that opens it directly from the contact page. */

export default function CollabOpener() {
  const { openCollab } = useModal();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("collab") === "1") openCollab();
  }, [params, openCollab]);

  return (
    <p style={{ marginTop: 18 }}>
      <button type="button" className="s-link" onClick={openCollab}>
        LET&rsquo;S COLLABORATE <span className="s-arrow">→</span>
      </button>
    </p>
  );
}
