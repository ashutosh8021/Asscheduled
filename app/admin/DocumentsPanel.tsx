"use client";

import { useState } from "react";

/* Identity documents for one accepted application.

   Deliberately not loaded with the row. Somebody's government ID
   should be something you asked to see, not something that appears on
   screen because you expanded a row to check their college. The list
   is fetched on request, and every fetch is logged server-side with
   the admin's email. */

interface Doc {
  id: string;
  kind: string;
  mime: string;
  bytes: number;
  uploadedAt: string;
  url: string | null;
}

const KIND_LABEL: Record<string, string> = {
  photo_id: "Government photo ID",
  college_id: "College ID",
};

export default function DocumentsPanel({ id }: { id: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: string) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        url?: string;
        documents?: Doc[];
        removed?: number;
      };
      if (!json.ok) {
        setError(json.error ?? "That did not work.");
        return;
      }
      if (action === "issue" && json.url) {
        setLink(json.url);
        setCopied(false);
      }
      if (action === "list") setDocs(json.documents ?? []);
      if (action === "purge") setDocs([]);
    } catch {
      setError("No connection.");
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      /* Clipboard is blocked in some contexts; the input below still
         holds the link and can be selected by hand. */
      setCopied(false);
    }
  }

  return (
    <div className="a-docs">
      <div className="a-actions">
        <button type="button" onClick={() => call("issue")} disabled={busy !== null}>
          {link ? "NEW LINK" : "UPLOAD LINK"}
        </button>
        <button type="button" onClick={() => call("list")} disabled={busy !== null}>
          SHOW DOCUMENTS
        </button>
        {docs && docs.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete both documents permanently? This cannot be undone.")) {
                void call("purge");
              }
            }}
            disabled={busy !== null}
          >
            DELETE
          </button>
        ) : null}
      </div>

      {link ? (
        <div className="a-docs-link">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={copy}>
            {copied ? "COPIED" : "COPY"}
          </button>
          <p>
            Send this over WhatsApp. It works for 14 days, it is the only thing needed to upload,
            so treat it like a password — and issuing a new one kills this one.
          </p>
        </div>
      ) : null}

      {docs ? (
        docs.length === 0 ? (
          <p className="a-docs-none">Nothing uploaded yet.</p>
        ) : (
          <ul className="a-docs-list">
            {docs.map((d) => (
              <li key={d.id}>
                <div className="a-docs-head">
                  <span>{KIND_LABEL[d.kind] ?? d.kind}</span>
                  <span className="a-docs-meta">
                    {Math.round(d.bytes / 1024)} KB ·{" "}
                    {new Date(d.uploadedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </span>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer">
                      FULL SIZE
                    </a>
                  ) : (
                    <span className="a-docs-meta">unavailable</span>
                  )}
                </div>

                {/* The point of looking at an ID is reading it, so show
                    it rather than linking to it. PDFs cannot be drawn
                    inline here — those keep the link only. */}
                {d.url && d.mime.startsWith("image/") ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="a-docs-shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.url} alt={`${KIND_LABEL[d.kind] ?? d.kind}, uploaded`} />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )
      ) : null}

      {docs && docs.length > 0 ? (
        <p className="a-docs-note">
          These expire 5 minutes after loading — press SHOW DOCUMENTS again if an image goes
          blank. Do not paste the links anywhere.
        </p>
      ) : null}

      {error ? <p className="a-docs-error">{error}</p> : null}
    </div>
  );
}
