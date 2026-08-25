"use client";

import { useEffect, useRef, useState } from "react";
import { ACCEPTED_MIME, DOCUMENT_KINDS, MAX_BYTES, type DocumentKind } from "@/lib/documentRules";

/* Two uploads against one token.

   Shared by the application overlay — for departures that ask for ID
   up front — and by the standalone /documents/[token] page used after
   acceptance. One implementation so the two cannot drift: the rules
   about what is acceptable should not depend on which door you came
   through.

   The control is a real <input type="file"> wrapped in a <label>, with
   the input visually hidden rather than display:none. That keeps the
   keyboard path, the screen-reader announcement and the browser's own
   picker exactly as they would be on a bare input, while the label
   carries the styling and the drop target. A div with an onClick would
   have looked the same and been unusable without a mouse.

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

interface Picked {
  name: string;
  size: number;
  /** Object URL for an image, so the thumbnail proves what was sent. */
  preview: string | null;
}

function readableSize(bytes: number): string {
  return bytes < 1_000_000
    ? `${Math.round(bytes / 1000)} KB`
    : `${(bytes / 1_000_000).toFixed(1)} MB`;
}

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
  const [picked, setPicked] = useState<Partial<Record<DocumentKind, Picked>>>({});
  const [dragging, setDragging] = useState<DocumentKind | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocumentKind, string>>>({});

  /* Object URLs are a leak if they are never released. */
  const urls = useRef<string[]>([]);
  useEffect(() => {
    const held = urls.current;
    return () => held.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function send(kind: DocumentKind, file: File) {
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({
        ...e,
        [kind]: `That file is ${readableSize(file.size)}. Compress it under 2MB and try again.`,
      }));
      setState((s) => ({ ...s, [kind]: "error" }));
      return;
    }

    let preview: string | null = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
      urls.current.push(preview);
    }

    setPicked((p) => ({ ...p, [kind]: { name: file.name, size: file.size, preview } }));
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
    <div className={compact ? "s-ups s-ups-compact" : "s-ups"}>
      {/* Said before the picker opens, not after a file is rejected. */}
      <p className="s-hint">
        JPG, PNG or PDF · under {MAX_BYTES / 1_000_000}MB each. Most phone photos are larger than
        that, so compress or resize before you upload.
      </p>

      {DOCUMENT_KINDS.map((kind) => {
        const s = state[kind];
        const p = picked[kind];
        const id = `up-${kind}`;

        return (
          <div key={kind} className="s-up">
            <label className="s-up-label" htmlFor={id}>
              {LABELS[kind].title}
            </label>
            <p className="s-up-hint">{LABELS[kind].hint}</p>

            <label
              className="s-drop"
              data-state={s}
              data-dragging={dragging === kind}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(kind);
              }}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(null);
                const f = e.dataTransfer.files?.[0];
                if (f) void send(kind, f);
              }}
            >
              <input
                id={id}
                type="file"
                className="s-drop-input"
                accept={ACCEPTED_MIME.join(",")}
                disabled={s === "sending"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void send(kind, f);
                  /* Cleared so choosing the same file again re-fires. */
                  e.target.value = "";
                }}
              />

              {p?.preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="s-drop-thumb" src={p.preview} alt="" />
              ) : (
                <span className="s-drop-icon" aria-hidden="true">
                  {s === "done" ? "✓" : "＋"}
                </span>
              )}

              <span className="s-drop-text">
                <b>
                  {s === "sending"
                    ? "Sending…"
                    : s === "done"
                      ? p?.name ?? "Received"
                      : s === "error"
                        ? "Try another file"
                        : "Choose a file"}
                </b>
                <i>
                  {s === "sending" ? (
                    "Do not close this"
                  ) : s === "done" ? (
                    `${p ? readableSize(p.size) + " · " : ""}Tap to replace`
                  ) : (
                    /* Both rendered, one shown by pointer type. Doing it
                       in CSS rather than by sniffing in JS keeps the
                       server and client markup identical — a hydration
                       mismatch here would flash the wrong line. */
                    <>
                      <span className="s-drop-drag">or drag one here</span>
                      <span className="s-drop-tap">Tap to browse</span>
                    </>
                  )}
                </i>
              </span>
            </label>

            {errors[kind] ? (
              <p className="s-err s-up-err" role="alert">
                {errors[kind]}
              </p>
            ) : null}
          </div>
        );
      })}

      {allDone ? (
        <p className="s-up-done">Both received. Nothing else to do — we will be in touch.</p>
      ) : null}
    </div>
  );
}
