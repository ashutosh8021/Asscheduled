"use client";

import { useEffect, useRef, useState } from "react";
import { ACCEPTED_MIME, MAX_BYTES } from "@/lib/documentRules";

/* One file control: click, tap or drag.

   Purely presentational — it reports the file and never sends it. Two
   callers with different timing use it:

   - the application form, which holds the file until the application
     has been created, because there is nothing to attach it to before
     that;
   - the standalone /documents page, which has a token already and
     uploads the moment a file is chosen.

   It is a real <input type="file"> inside a <label>, visually hidden
   rather than display:none, so the keyboard path, the focus ring and
   the screen-reader announcement all survive. A styled div with an
   onClick would look identical and be unusable without a mouse. */

export type ZoneState = "idle" | "sending" | "done" | "error";

export function readableSize(bytes: number): string {
  return bytes < 1_000_000
    ? `${Math.round(bytes / 1000)} KB`
    : `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default function DropZone({
  id,
  title,
  hint,
  state,
  file,
  error,
  onPick,
  /** Copy for the second line when a file is already held. */
  doneHint = "Tap to replace",
}: {
  id: string;
  title: string;
  hint: string;
  state: ZoneState;
  file: File | null;
  error?: string;
  onPick: (file: File) => void;
  doneHint?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  /* A thumbnail of the actual file, because picking the wrong photo is
     the commonest mistake and a filename does not catch it. Object
     URLs are a leak if they are never released. */
  const held = useRef<string | null>(null);
  useEffect(() => {
    if (held.current) {
      URL.revokeObjectURL(held.current);
      held.current = null;
    }
    if (file && file.type.startsWith("image/")) {
      const u = URL.createObjectURL(file);
      held.current = u;
      setPreview(u);
    } else {
      setPreview(null);
    }
    return () => {
      if (held.current) URL.revokeObjectURL(held.current);
      held.current = null;
    };
  }, [file]);

  return (
    <div className="s-up">
      <label className="s-up-label" htmlFor={id}>
        {title}
      </label>
      <p className="s-up-hint">{hint}</p>

      <label
        className="s-drop"
        data-state={state}
        data-dragging={dragging}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
      >
        <input
          id={id}
          type="file"
          className="s-drop-input"
          accept={ACCEPTED_MIME.join(",")}
          disabled={state === "sending"}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            /* Cleared so choosing the same file again re-fires. */
            e.target.value = "";
          }}
        />

        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="s-drop-thumb" src={preview} alt="" />
        ) : (
          <span className="s-drop-icon" aria-hidden="true">
            {state === "done" ? "✓" : "＋"}
          </span>
        )}

        <span className="s-drop-text">
          <b>
            {/* "Try another file" only makes sense once one has been
               tried. A field that is merely required-and-empty still
               says "Choose a file"; the message underneath says why
               it is outlined in red. */}
            {state === "sending"
              ? "Sending…"
              : file
                ? file.name
                : state === "done"
                  ? "Received"
                  : "Choose a file"}
          </b>
          <i>
            {state === "sending" ? (
              "Do not close this"
            ) : file ? (
              `${readableSize(file.size)} · ${doneHint}`
            ) : state === "done" ? (
              doneHint
            ) : (
              /* Both rendered, one shown by pointer type. Chosen in CSS
                 rather than by sniffing in JS so the server and client
                 markup stay identical and nothing flashes on hydration. */
              <>
                <span className="s-drop-drag">or drag one here</span>
                <span className="s-drop-tap">Tap to browse</span>
              </>
            )}
          </i>
        </span>
      </label>

      {error ? (
        <p className="s-err s-up-err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared client-side guard. The route checks all of this again — this
 *  is for immediate feedback, not for security. */
export function rejectReason(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return `That file is ${readableSize(file.size)}. Compress it under ${MAX_BYTES / 1_000_000}MB and try again.`;
  }
  if (file.size <= 0) return "That file is empty.";
  return null;
}
