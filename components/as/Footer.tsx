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

  return (
    <footer className="s-ftr">
      <div className="s-wrap">
        <div className="s-ftr-grid">
          {/* subscribe */}
          <div>
            <div className="s-ftr-social">
              {FOOTER.socials.map((s) => (
                <span key={s.t} className="s-lbl" style={{ opacity: 0.6 }}>
                  {s.t}
                </span>
              ))}
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
              onSubmit={(e) => {
                e.preventDefault();
                /* TODO(mannat): wire to the mailing list once a provider is
                   chosen. Until then this must not claim to have subscribed
                   anyone, so it only acknowledges the address. */
                if (email.trim() && agreed) setSubbed(true);
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
              <button type="submit" aria-label="Subscribe">
                →
              </button>
            </form>

            {subbed ? (
              <p className="s-hint" style={{ marginTop: 10, color: "var(--s-rust-soft)" }}>
                NOTED — the list is not open yet. We will mail you first.
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
