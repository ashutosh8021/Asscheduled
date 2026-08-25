"use client";

import { useState } from "react";
import { ACCEPTED_MIME, DOCUMENT_KINDS, MAX_BYTES, type DocumentKind } from "@/lib/documentRules";

/* Two uploads, one link.

   Each file goes up on its own so a failure on the second does not
   lose the first, and so somebody on a slow connection sees the first
   one land instead of watching a single bar for a minute.

   Everything checked here is checked again by the route. This is for
   feedback, not for security — a disabled input stops nobody. */

const LABELS: Record<DocumentKind, { title: string; hint: string }> = {
  photo_id: {
    title: "Government photo ID",
    hint: "Masked Aadhaar is ideal. Passport, driving licence or voter ID are all fine — you do not have to send Aadhaar.",
  },
  college_id: {
    title: "College ID",
    hint: "Front of the card, with your name and the college readable.",
  },
};

type State = "idle" | "sending" | "done" | "error";

export default function UploadForm({
  token,
  already,
}: {
  token: string;
  /** Kinds already uploaded, so a reload does not look like nothing happened. */
  already: DocumentKind[];
}) {
  const [state, setState] = useState<Record<DocumentKind, State>>({
    photo_id: already.includes("photo_id") ? "done" : "idle",
    college_id: already.includes("college_id") ? "done" : "idle",
  });
  const [errors, setErrors] = useState<Partial<Record<DocumentKind, string>>>({});

  async function send(kind: DocumentKind, file: File) {
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, [kind]: `Over ${Math.round(MAX_BYTES / 1048576)}MB. Send a smaller one.` }));
      setState((s) => ({ ...s, [kind]: "error" }));
      return;
    }

    setErrors((e) => ({ ...e, [kind]: undefined }));
    setState((s) => ({ ...s, [kind]: "sending" }));

    const body = new FormData();
    body.set("token", token);
    body.set("kind", kind);
    body.set("file", file);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setState((s) => ({ ...s, [kind]: "done" }));
      } else {
        setErrors((e) => ({ ...e, [kind]: json.error ?? "That did not go through." }));
        setState((s) => ({ ...s, [kind]: "error" }));
      }
    } catch {
      setErrors((e) => ({ ...e, [kind]: "No connection. Try again." }));
      setState((s) => ({ ...s, [kind]: "error" }));
    }
  }

  const allDone = DOCUMENT_KINDS.every((k) => state[k] === "done");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {DOCUMENT_KINDS.map((kind) => {
        const s = state[kind];
        return (
          <div key={kind} className="s-panel">
            <p className="s-panel-h">{LABELS[kind].title}</p>
            <p className="s-panel-sub">{LABELS[kind].hint}</p>

            <div style={{ marginTop: 16 }}>
              {s === "done" ? (
                <p className="s-hint" style={{ color: "var(--s-ink)" }}>
                  ✓ Received. Upload again to replace it.
                </p>
              ) : null}

              <input
                type="file"
                className="s-input"
                accept={ACCEPTED_MIME.join(",")}
                disabled={s === "sending"}
                aria-label={LABELS[kind].title}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void send(kind, f);
                  /* Clear it so choosing the same file again re-fires. */
                  e.target.value = "";
                }}
              />

              {s === "sending" ? (
                <p className="s-hint" style={{ marginTop: 10 }}>
                  Sending…
                </p>
              ) : null}
              {errors[kind] ? (
                <p className="s-err" style={{ marginTop: 10 }} role="alert">
                  {errors[kind]}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}

      {allDone ? (
        <p className="s-body" style={{ marginTop: 4 }}>
          Both received. Nothing else to do — we will be in touch about your booking.
        </p>
      ) : null}
    </div>
  );
}
