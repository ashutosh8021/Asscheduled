import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import Slot from "@/components/as/Slot";
import Accordion from "@/components/as/Accordion";
import { FAQ_PAGE, FAQS, TESTIMONIALS } from "@/lib/copy";
import { abs } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Before you get scheduled — FAQs · AS SCHEDULED",
  description:
    "The stuff you probably want to know before joining us. What happens on a trip, what's included, who can come, and whether you can come alone.",
  alternates: { canonical: abs("/faqs") },
};

/* Rich result for the question list. Only real Q&A pairs go in. */
function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function FaqsPage() {
  return (
    <Shell>
      <JsonLd data={faqSchema()} />

      {/* ---------- MASTHEAD ---------- */}
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(115px,15vh,165px)", paddingBottom: "clamp(40px,6vw,72px)" }}
      >
        <div className="s-split s-split-top">
          <Reveal>
            <p className="s-eyebrow" style={{ color: "var(--s-ink)" }}>
              {FAQ_PAGE.eyebrow}
            </p>

            <h1 className="s-h2" style={{ marginTop: 22, fontSize: "clamp(34px,5.6vw,76px)" }}>
              {FAQ_PAGE.title[0]}
              <br />
              <span className="s-underline">{FAQ_PAGE.title[1]}</span>
            </h1>

            <div style={{ marginTop: 34, fontSize: 15 }}>
              {FAQ_PAGE.sub.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* the taped note */}
              <div
                style={{
                  background: "var(--s-paper-2)",
                  padding: "26px 30px",
                  transform: "rotate(-1.5deg)",
                  flex: "1 1 200px",
                }}
              >
                <div className="s-mono" style={{ fontSize: 14, lineHeight: 2.1 }}>
                  {FAQ_PAGE.note.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </div>

              <div style={{ position: "relative", flex: "1 1 180px", aspectRatio: "3 / 4" }}>
                <Slot
                  slot={{ src: null, alt: "Crowd at a pro-night", label: "FAQ — CROWD" }}
                  sizes="(max-width:900px) 50vw, 22vw"
                  hint="3:4 · SEASON 1 FILM"
                />
              </div>
            </div>

            <p className="s-stamp" style={{ marginTop: 22, borderColor: "var(--s-rust)", color: "var(--s-rust)" }}>
              {FAQ_PAGE.stampRing}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- THE QUESTIONS ---------- */}
      <section className="s-sec-tight s-sec-paper2">
        <div className="s-wrap">
          <div className="s-split s-split-top" style={{ gridTemplateColumns: "minmax(0,.7fr) minmax(0,2fr)" }}>
            <Reveal>
              <h2 className="s-h2" style={{ fontSize: "clamp(24px,3vw,40px)" }}>
                {FAQ_PAGE.listTitle.map((l) => (
                  <span key={l} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
              </h2>
              <span className="s-tick" style={{ display: "block", marginTop: 18 }} />
            </Reveal>

            <Reveal delay={1}>
              <Accordion
                idPrefix="faq"
                initial={2}
                items={FAQS.map((f, i) => ({
                  n: String(i + 1).padStart(2, "0"),
                  title: f.q,
                  body: f.a,
                }))}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- ASK US ---------- */}
      <section className="s-sec-tight s-wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(24px,4vw,60px)",
            flexWrap: "wrap",
          }}
        >
          <Reveal>
            <div>
              <p className="s-eyebrow">{FAQ_PAGE.askEyebrow}</p>
              <h2 className="s-h2" style={{ marginTop: 12, fontSize: "clamp(26px,3.4vw,46px)" }}>
                {FAQ_PAGE.askTitle[0]}
                <br />
                <span className="s-underline">{FAQ_PAGE.askTitle[1]}</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ maxWidth: 200 }}>
              {FAQ_PAGE.askBody.map((l) => (
                <p key={l} style={{ fontSize: 14, color: "var(--s-grey)" }}>
                  {l}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2}>
            <Link href="/contact" className="s-btn s-btn-ink">
              {FAQ_PAGE.askCta} <span className="s-arrow">↗</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- THEY WENT ---------- */}
      <section className="s-sec-tight s-wrap" style={{ paddingBottom: "clamp(64px,9vw,110px)" }}>
        <hr className="s-rule" style={{ marginBottom: "clamp(34px,5vw,56px)" }} />

        <div className="s-split s-split-top">
          <Reveal>
            <p className="s-eyebrow">{FAQ_PAGE.storiesEyebrow}</p>
            <h2 className="s-h2" style={{ marginTop: 14, fontSize: "clamp(22px,2.8vw,36px)" }}>
              {FAQ_PAGE.storiesTitle[0]}
              <br />
              {FAQ_PAGE.storiesTitle[1]}
            </h2>

            <div style={{ marginTop: 24 }}>
              {FAQ_PAGE.storiesBody.map((p) => (
                <p key={p} className="s-body" style={{ marginBottom: 14, fontSize: 14 }}>
                  {p}
                </p>
              ))}
            </div>

            <p style={{ marginTop: 22 }}>
              <Link href="/gallery" className="s-link">
                {FAQ_PAGE.storiesCta} <span className="s-arrow">→</span>
              </Link>
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ position: "relative", aspectRatio: "16 / 10" }}>
              <Slot
                slot={{ src: null, alt: "Group at a fest, all together", label: "FAQ — THEY WENT" }}
                sizes="(max-width:900px) 100vw, 48vw"
                hint="16:10 · SEASON 1 FILM"
              />
            </div>
          </Reveal>
        </div>

        {TESTIMONIALS.length > 0 ? (
          <Reveal delay={2}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
                gap: "clamp(18px,2.6vw,34px)",
                marginTop: "clamp(34px,5vw,54px)",
              }}
            >
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.quote}
                  style={{ margin: 0, borderTop: "1px solid var(--s-line)", paddingTop: 18 }}
                >
                  <span
                    className="s-serif"
                    style={{ fontSize: 30, color: "var(--s-rust)", lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <blockquote style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.68 }}>
                    {t.quote}
                  </blockquote>
                  <figcaption style={{ marginTop: 14 }}>
                    <p className="s-card-note" style={{ color: "var(--s-ink)" }}>
                      {t.name ?? "Student"}
                    </p>
                    <p className="s-card-note" style={{ textTransform: "none" }}>
                      {t.from}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        ) : null}
      </section>
    </Shell>
  );
}
