"use client";

import Link from "next/link";
import { useState } from "react";
import { FOOTER, CONTACT_EMAIL } from "@/lib/copy";
import { LEGAL_LINE } from "@/lib/site";
import { useModal } from "./ModalProvider";

/* Footer per the homepage comp: subscribe block, three link columns,
   and the country/language bar.

   Social links have no confirmed handles (CLAUDE.md open items), so
   they render as plain labels rather than links to a guess. */

export default function Footer() {
  const { openCollab } = useModal();
  const [email, setEmail] = useState("");
  const [pref, setPref] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [subbed, setSubbed] = useState(false);
  const [busy, setBusy] = useState(false);
  /* Honeypot. Hidden from people, irresistible to bots. */
  const [website, setWebsite] = useState("");

  return (
    <footer className="s-ftr">
      <div className="s-wrap">
        <div className="s-ftr-grid">
          {/* subscribe */}
          <div>
            <div className="s-ftr-social">
              {/* A link where we have a real handle, a plain label where
                  we do not — never a link to a guess. */}
              {FOOTER.socials.map((s) =>
                s.href ? (
                  <a
                    key={s.t}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="s-lbl s-ftr-social-link"
                  >
                    {s.t}
                  </a>
                ) : (
                  <span key={s.t} className="s-lbl" style={{ opacity: 0.6 }}>
                    {s.t}
                  </span>
                )
              )}
            </div>

            <p className="s-hdr-mark" style={{ fontSize: 20, marginBottom: 6 }}>
              {FOOTER.brand}
              <span className="s-dot">.</span>
            </p>
            <p style={{ fontSize: 13, color: "rgba(247,241,232,.7)", marginBottom: 14 }}>
              {FOOTER.tagline}
            </p>

            <form
              className="s-ftr-sub"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim() || !agreed || busy) return;
                setBusy(true);
                try {
                  await fetch("/api/somewhere/subscribe", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ email, preference: pref, website }),
                  });
                } catch {
                  /* Swallowed on purpose — see below. */
                } finally {
                  /* Always acknowledge. The address is captured server
                     side; a storage problem is ours to chase, not
                     something to hand back to the visitor. */
                  setSubbed(true);
                  setEmail("");
                  setBusy(false);
                }
                }}
            >
              <label htmlFor="ftr-email" className="s-sr">
                Email address
              </label>
              <input
                id="ftr-email"
                type="email"
                placeholder={FOOTER.subscribePh}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* Positioned off-screen rather than display:none — some
                  bots skip hidden fields but fill positioned ones. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
              />
              <button type="submit" aria-label="Subscribe" disabled={busy}>
                →
              </button>
            </form>

            {subbed ? (
              <p className="s-hint" style={{ marginTop: 10, color: "var(--s-rust-soft)" }}>
                {FOOTER.subscribeDone}
              </p>
            ) : null}

            <p className="s-lbl" style={{ marginTop: 16, opacity: 0.65 }}>
              {FOOTER.prefsLabel}
            </p>
            <div className="s-ftr-prefs">
              {FOOTER.prefs.map((p) => (
                <label key={p} className="s-ftr-pref">
                  <input
                    type="radio"
                    name="ftr-pref"
                  value={p}
                  checked={pref === p}
                  onChange={() => setPref(p)}
                  />
                {p}
                </label>
              ))}
            </div>

            <label className="s-ftr-consent">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>{FOOTER.consent}</span>
            </label>
          </div>

          {/* link columns */}
          {FOOTER.cols.map((col) => (
            <div key={col.h}>
              <p className="s-ftr-h">{col.h}</p>
              <ul className="s-ftr-list">
                {col.links.map((l) =>
                  l.t === "Collab" ? (
                  <li key={l.t}>
                      <button
                        type="button"
                      onClick={openCollab}
                        style={{
                          background: "none",
                          border: 0,
                          padding: 0,
                          cursor: "pointer",
                          font: "inherit",
                          fontSize: 13,
                          color: "rgba(247,241,232,.78)",
                      }}
                      >
                      {l.t}
                      </button>
                    </li>
                  ) : (
                  <li key={l.t}>
                    <Link href={l.href}>{l.t}</Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="s-ftr-bar">
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ letterSpacing: "0.08em" }}>
            {CONTACT_EMAIL}
          </a>
          <span>{LEGAL_LINE}</span>
        </div>
      </div>
    </footer>
  );
}
