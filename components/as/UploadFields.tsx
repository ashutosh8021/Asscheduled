"use client";

import { useState } from "react";
import { ACCEPTED_MIME, DOCUMENT_KINDS, MAX_BYTES, type DocumentKind } from "@/lib/documentRules";

/* Two uploads against one token.

   Shared by the application overlay — for departures that ask for ID
   up front — and by the standalone /documents/[token] page used after
   acceptance. One implementation so the two cannot drift: the rules
   about what is acceptable should not depend on which door you came
   through.

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

export default function UploadFields({
  token,
  already = [],
  compact = false,
}: {
  token: string;
  /** Kinds already uploaded, so a reload does not look like nothing happened. */
  already?: DocumentKind[];
  /** Tighter spacing for the application overlay, which has less room. */
  compact?: boolean;
}) {
  const [state, setState] = useState<Record<DocumentKind, State>>({
    photo_id: already.includes("photo_id") ? "done" : "idle",
    college_id: already.includes("college_id") ? "done" : "idle",
  });
  const [errors, setErrors] = useState<Partial<Record<DocumentKind, string>>>({});

  async function send(kind: DocumentKind, file: File) {
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({
        ...e,
        [kind]: `That file is ${(file.size / 1_000_000).toFixed(1)}MB. Compress it under 2MB and try again.`,
      }));
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
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 16 : 28 }}>
      {/* Said before the file picker, not after it fails. Phone photos
          run well over this, so people need to know to shrink one
          while they are still choosing it. */}
      <p className="s-hint">
        JPG, PNG or PDF, under {MAX_BYTES / 1_000_000}MB each. Most phone photos are larger than
        that — compress or resize before you upload.
      </p>

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
        <p className="s-body" style={{ marginTop: 4, fontSize: compact ? 14 : undefined }}>
          Both received. Nothing else to do — we will be in touch.
        </p>
      ) : null}
    </div>
  );
}
