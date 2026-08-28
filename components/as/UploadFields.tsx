"use client";

import { useState } from "react";
import DropZone, { prepareUpload, type ZoneState } from "./DropZone";
import { DOCUMENT_KINDS, MAX_BYTES, type DocumentKind } from "@/lib/documentRules";

/* The standalone upload surface, used by /documents/[token] after an
   application has been accepted.

   The application form does not use this: it has no token yet, so it
   holds the files with DropZone directly and sends them once the
   application exists. Both share DropZone so the control looks and
   behaves the same either way.

   Each file goes up on its own so a failure on the second does not
   lose the first, and so somebody on a slow connection sees the first
   land instead of watching one bar for a minute. */

/* Alternatives are offered, because they are genuinely accepted. What
   is not said is "you do not have to send Aadhaar" — spelling out the
   opt-out reads as apologising for the question and invites the answer
   nobody wants. Listing what works is enough. */
export const DOCUMENT_LABELS: Record<DocumentKind, { title: string; hint: string }> = {
  photo_id: {
    title: "Government photo ID",
    hint: "Masked Aadhaar is ideal. Passport, driving licence or voter ID are all fine.",
  },
  college_id: {
    title: "College ID",
    hint: "Front of the card, with your name and the college readable.",
  },
  payment_proof: {
    title: "Payment screenshot",
    hint: "The confirmation from your UPI app, showing the amount and the reference.",
  },
};

export function SizeNote() {
  return (
    <p className="s-hint">
      JPG, PNG or PDF · up to {MAX_BYTES / 1_000_000}MB each. Photos are shrunk automatically, so
      send the picture straight off your phone.
    </p>
  );
}

export default function UploadFields({
  token,
  already = [],
}: {
  token: string;
  /** Kinds already uploaded, so a reload does not look like nothing happened. */
  already?: DocumentKind[];
}) {
  /* Partial: this surface handles the two identity documents, and a
     payment screenshot is asked for elsewhere. Anything absent reads
     as "idle". */
  const [state, setState] = useState<Partial<Record<DocumentKind, ZoneState>>>({
    photo_id: already.includes("photo_id") ? "done" : "idle",
    college_id: already.includes("college_id") ? "done" : "idle",
  });
  const [files, setFiles] = useState<Partial<Record<DocumentKind, File>>>({});
  const [errors, setErrors] = useState<Partial<Record<DocumentKind, string>>>({});

  async function send(kind: DocumentKind, chosen: File) {
    /* Shrinks a large photo before sending. Same helper the
       application form uses, so both surfaces behave identically. */
    const prepared = await prepareUpload(chosen);
    if (!prepared.ok) {
      setErrors((e) => ({ ...e, [kind]: prepared.error }));
      setState((s) => ({ ...s, [kind]: "error" }));
      return;
    }
    const file = prepared.file;

    setFiles((f) => ({ ...f, [kind]: file }));
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
    <div className="s-ups">
      <SizeNote />

      {DOCUMENT_KINDS.map((kind) => (
        <DropZone
          key={kind}
          id={`up-${kind}`}
          title={DOCUMENT_LABELS[kind].title}
          hint={DOCUMENT_LABELS[kind].hint}
          state={state[kind] ?? "idle"}
          file={files[kind] ?? null}
          error={errors[kind]}
          onPick={(f) => void send(kind, f)}
        />
      ))}

      {allDone ? (
        <p className="s-up-done">Both received. Nothing else to do — we will be in touch.</p>
      ) : null}
    </div>
  );
}
