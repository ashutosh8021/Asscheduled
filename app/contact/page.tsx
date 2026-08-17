import type { Metadata } from "next";
import { Suspense } from "react";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import ContactForm from "@/components/as/ContactForm";
import CollabOpener from "@/components/as/CollabOpener";
import { CONTACT, CONTACT_EMAIL } from "@/lib/copy";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tell us what's unscheduled · AS SCHEDULED",
  description:
    "Got something on your mind? An idea, a collab, a trip you should be taking. We're listening.",
  alternates: { canonical: abs("/contact") },
};

export default function ContactPage() {
  return (
    <Shell>
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(50px,7vw,90px)" }}
      >
        <div className="s-split s-split-top">
          <Reveal>
            <h1 className="s-h2" style={{ fontSize: "clamp(38px,6.4vw,88px)" }}>
              {CONTACT.titleTop[0]}
              <br />
              {CONTACT.titleTop[1]}
              <br />
              <span
                style={{
                  display: "inline-block",
                  background: "var(--s-ink-2)",
                  color: "var(--s-bone)",
                  padding: "0.06em 0.16em",
                  fontStyle: "italic",
                  transform: "rotate(-1.2deg)",
                  marginTop: "0.1em",
                }}
              >
                {CONTACT.titleMark}
              </span>
            </h1>

            <div style={{ marginTop: 40, fontSize: 15, lineHeight: 1.85 }}>
              {CONTACT.body.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <p style={{ color: "var(--s-rust)" }}>{CONTACT.bodyMark}</p>
            </div>

            <div style={{ marginTop: 44 }}>
              <span
                className="s-eyebrow"
                style={{
                  display: "inline-block",
                  background: "var(--s-ink-2)",
                  color: "var(--s-bone)",
                  padding: "6px 12px",
                }}
              >
                {CONTACT.emailLabel}
              </span>
              <p style={{ marginTop: 14 }}>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  style={{
                    fontSize: "clamp(15px,1.7vw,20px)",
                    borderBottom: "1px solid var(--s-rust)",
                    paddingBottom: 3,
                  }}
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>

            <div style={{ marginTop: 34 }}>
              <p className="s-ital" style={{ fontSize: 15, color: "var(--s-grey)" }}>
                {CONTACT.note[0]} {CONTACT.note[1]}
              </p>
              {/* Suspense: CollabOpener reads useSearchParams, which
                  would otherwise opt this page out of static rendering. */}
              <Suspense fallback={null}>
                <CollabOpener />
              </Suspense>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* ---------- FOOT STRIP ---------- */}
      <section style={{ background: "var(--s-ink-2)", color: "var(--s-paper)" }}>
        <div
          className="s-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: "clamp(20px,3vw,40px)",
            paddingTop: 34,
            paddingBottom: 34,
          }}
        >
          {CONTACT.strip.map((s, i) => (
            <div
              key={s.join(" ")}
              style={{
                borderLeft: i === 0 ? "none" : "1px solid rgba(247,241,232,.16)",
                paddingLeft: i === 0 ? 0 : "clamp(16px,2vw,30px)",
              }}
            >
              <p className="s-lbl" style={{ fontSize: 12 }}>
                {s[0]}
              </p>
              <p className="s-lbl" style={{ fontSize: 12, color: "var(--s-rust-soft)" }}>
                {s[1]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
