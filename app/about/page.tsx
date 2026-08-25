import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import Slot from "@/components/as/Slot";
import ApplyButton from "@/components/as/ApplyButton";
import { ABOUT, MANIFESTO, TESTIMONIALS } from "@/lib/copy";
import { GALLERY_WIDE, F } from "@/lib/gallery";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Built for people who don't do ordinary shit · AS SCHEDULED",
  description:
    "AS SCHEDULED is the go-to platform for students, creators and dreamers who'd rather be at a college fest than in a boring group chat. No touristy tours. No random groups.",
  alternates: { canonical: abs("/about") },
};

export default function AboutPage() {
  return (
    <Shell>
      {/* ---------- MASTHEAD ---------- */}
      <section className="s-wrap" style={{ paddingTop: "clamp(115px,15vh,165px)" }}>
        <div className="s-split s-split-top">
          <Reveal>
            <p className="s-eyebrow s-eyebrow-ink">
              <span className="s-underline s-underline-sm">{ABOUT.eyebrow}</span>
            </p>

            <h1 className="s-h2" style={{ marginTop: 26, fontSize: "clamp(32px,5vw,68px)" }}>
              <span className="s-underline">{ABOUT.title}</span>
            </h1>

            <div style={{ marginTop: 40 }}>
              {ABOUT.body.map((p) => (
                <p key={p} className="s-body" style={{ marginBottom: 16 }}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                <Slot
                  slot={GALLERY_WIDE[3]}
                  sizes="(max-width:900px) 100vw, 48vw"
                />
              </div>

              {/* the taped notes from the comp */}
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  marginTop: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  className="s-ital"
                  style={{
                    background: "var(--s-paper-2)",
                    padding: "16px 20px",
                    transform: "rotate(-2deg)",
                    fontSize: 15,
                  }}
                >
                  {ABOUT.noteA.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>

                <div
                  style={{
                    background: "var(--s-bone)",
                    border: "1px solid var(--s-line)",
                    padding: "14px 22px",
                    transform: "rotate(2deg)",
                    textAlign: "center",
                  }}
                >
                  <p className="s-eyebrow s-eyebrow-ink">{ABOUT.ticket.brand}</p>
                  <div style={{ margin: "10px 0" }}>
                    {ABOUT.ticket.lines.map((l) => (
                      <p key={l} className="s-lbl" style={{ fontSize: 12 }}>
                        {l}
                      </p>
                    ))}
                  </div>
                  <p className="s-ital" style={{ fontSize: 13, color: "var(--s-grey)" }}>
                    {ABOUT.ticket.est}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- WE EXIST TO ---------- */}
      <section className="s-sec s-sec-paper2">
        <div className="s-wrap">
          <div className="s-split s-split-top">
            <Reveal>
              <p className="s-eyebrow s-eyebrow-ink">
                <span className="s-underline s-underline-sm">{ABOUT.existEyebrow}</span>
              </p>
              <h2 className="s-h2" style={{ marginTop: 24 }}>
                {ABOUT.existTitle}{" "}
                <span className="s-underline">{ABOUT.existTitleMark}</span>
              </h2>
            </Reveal>

            <Reveal delay={1}>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {ABOUT.existList.map((l) => (
                  <li
                    key={l}
                    style={{
                      display: "flex",
                      gap: 20,
                      padding: "18px 0",
                      borderBottom: "1px solid var(--s-line)",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "var(--s-grey)" }} aria-hidden="true">
                      →
                    </span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="s-sec-tight s-wrap">
        <Reveal>
          <p className="s-eyebrow s-eyebrow-ink">
            <span className="s-underline s-underline-sm">{ABOUT.howEyebrow}</span>
          </p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: "clamp(24px,4vw,52px)",
            marginTop: 34,
          }}
        >
          {ABOUT.how.map((h, i) => (
            <Reveal key={h.n} delay={(i + 1) as 1 | 2 | 3}>
              <div
                style={{
                  borderLeft: i === 0 ? "none" : "1px solid var(--s-line)",
                  paddingLeft: i === 0 ? 0 : "clamp(18px,2.4vw,36px)",
                }}
              >
                <p
                  className="s-h2"
                  style={{ fontSize: "clamp(38px,4.6vw,60px)", lineHeight: 1 }}
                >
                  {h.n}
                  <span className="s-dot">.</span>
                </p>
                <h3 className="s-h3" style={{ fontSize: "clamp(16px,1.7vw,21px)", marginTop: 14 }}>
                  {h.t}
                </h3>
                <div style={{ marginTop: 12 }}>
                  {h.lines.map((l) => (
                    <p key={l} style={{ fontSize: 14, color: "var(--s-grey)" }}>
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- OUR VIBE ---------- */}
      <section className="s-sec-tight s-sec-paper2">
        <div className="s-wrap">
          <Reveal>
            <p className="s-eyebrow s-eyebrow-ink">
              <span className="s-underline s-underline-sm">{ABOUT.vibeEyebrow}</span>
            </p>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
              gap: "clamp(20px,3vw,40px)",
              marginTop: 30,
            }}
          >
            {ABOUT.vibe.map((v, i) => (
              <Reveal key={v.t} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div>
                  <h3 className="s-eyebrow s-eyebrow-ink" style={{ fontSize: 12 }}>
                    {v.t}
                  </h3>
                  <div style={{ marginTop: 12 }}>
                    {v.lines.map((l) => (
                      <p key={l} style={{ fontSize: 13.5, color: "var(--s-grey)" }}>
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MANIFESTO ================= */}

      {/* 01. THE GOAL */}
      <section className="s-sec" style={{ background: "var(--s-ink-2)", color: "var(--s-paper)" }}>
        <div className="s-wrap">
          <div className="s-split s-split-top">
            <Reveal>
              <p className="s-eyebrow" style={{ color: "var(--s-rust-soft)" }}>
                <span className="s-underline s-underline-sm">{MANIFESTO.goalNum}</span>
              </p>

              <h2 className="s-h2" style={{ marginTop: 24, fontSize: "clamp(30px,4.4vw,60px)" }}>
                <span style={{ color: "var(--s-butter)" }}>
                  {MANIFESTO.goalTitle[0]}
                  <br />
                  {MANIFESTO.goalTitle[1]}
                </span>
                <br />
                <span style={{ color: "var(--s-rust)" }}>
                  {MANIFESTO.goalTitleMark[0]}
                  <br />
                  {MANIFESTO.goalTitleMark[1]}
                </span>
              </h2>

              <div style={{ marginTop: 30 }}>
                {MANIFESTO.goalBody.map((p) => (
                  <p
                    key={p}
                    className="s-body"
                    style={{ marginBottom: 14, color: "rgba(247,241,232,.78)" }}
                  >
                    {p}
                  </p>
                ))}
                <div style={{ marginTop: 18 }}>
                  {MANIFESTO.goalKicker.map((l) => (
                    <p key={l} style={{ fontSize: 14, fontWeight: 500, color: "var(--s-rust-soft)" }}>
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                <Slot
                  slot={F.proniteStage}
                  dark
                  sizes="(max-width:900px) 100vw, 48vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 02. THE THING */}
      <section className="s-sec s-wrap">
        <Reveal>
          <p className="s-eyebrow s-eyebrow-ink">
            <span className="s-underline s-underline-sm">{MANIFESTO.thingNum}</span>
          </p>
        </Reveal>

        <div
          className="s-split s-split-top"
          style={{ marginTop: 26, gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}
        >
          <Reveal>
            <h2 className="s-h2">
              {MANIFESTO.thingTitle[0]}
              <br />
              {MANIFESTO.thingTitle[1]}
              <br />
              <span style={{ color: "var(--s-rust)" }}>
                {MANIFESTO.thingTitleMark[0]}
                <br />
                {MANIFESTO.thingTitleMark[1]}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ borderLeft: "1px solid var(--s-line)", paddingLeft: "clamp(20px,3vw,40px)" }}>
              {MANIFESTO.thingBody.map((p) => (
                <p key={p} className="s-body">
                  {p}
                </p>
              ))}

              <div style={{ marginTop: 22 }}>
                {MANIFESTO.thingSteps.map((l) => (
                  <p key={l} style={{ fontSize: 14 }}>
                    {l}
                  </p>
                ))}
              </div>

              <p className="s-body" style={{ marginTop: 22 }}>
                {MANIFESTO.thingAfter}
              </p>

              <div style={{ marginTop: 26 }}>
                {MANIFESTO.thingKicker.map((l) => (
                  <p key={l} style={{ fontSize: 14, fontWeight: 600 }}>
                    {l}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03. THE RULES */}
      <section className="s-sec" style={{ background: "var(--s-ink-2)", color: "var(--s-paper)" }}>
        <div className="s-wrap">
          <Reveal>
            <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
              {MANIFESTO.rulesNum}
            </p>
            <h2 className="s-h2" style={{ marginTop: 14, fontSize: "clamp(24px,3.4vw,46px)" }}>
              <span className="s-underline">{MANIFESTO.rulesTitle}</span>
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "clamp(22px,3vw,40px)",
              marginTop: 50,
            }}
          >
            {MANIFESTO.rules.map((r, i) => (
              <Reveal key={r.t} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div
                  style={{
                    borderLeft: i === 0 ? "none" : "1px solid rgba(247,241,232,.18)",
                    paddingLeft: i === 0 ? 0 : "clamp(16px,2vw,30px)",
                  }}
                >
                  <h3 className="s-eyebrow" style={{ color: "var(--s-butter)", fontSize: 12 }}>
                    {r.t}
                  </h3>
                  <p style={{ marginTop: 12, fontSize: 13.5, color: "rgba(247,241,232,.74)", lineHeight: 1.65 }}>
                    {r.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 04. THE RECEIPTS */}
      {TESTIMONIALS.length > 0 ? (
        <section className="s-sec s-wrap">
          <div className="s-split s-split-top" style={{ gridTemplateColumns: "minmax(0,.8fr) minmax(0,2fr)" }}>
            <Reveal>
              <p className="s-eyebrow s-eyebrow-ink">
                <span className="s-underline s-underline-sm">{MANIFESTO.receiptsNum}</span>
              </p>
              <h2 className="s-h2" style={{ marginTop: 22, fontSize: "clamp(26px,3.4vw,46px)" }}>
                {MANIFESTO.receiptsTitle[0]}
                <br />
                {MANIFESTO.receiptsTitle[1]}
                <br />
                <span style={{ color: "var(--s-rust)" }}>{MANIFESTO.receiptsTitleMark}</span>
              </h2>
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                gap: "clamp(22px,3vw,38px)",
              }}
            >
              {TESTIMONIALS.slice(0, 3).map((t, i) => (
                <Reveal key={t.quote} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <figure style={{ margin: 0 }}>
                    <span
                      className="s-serif"
                      style={{ fontSize: 40, color: "var(--s-rust)", lineHeight: 1 }}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <blockquote style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.7 }}>
                      {t.quote}
                    </blockquote>
                    <figcaption style={{ marginTop: 18 }}>
                      <span className="s-tick" style={{ display: "block", marginBottom: 10 }} />
                      <p className="s-card-note">{t.name ?? "Student"}</p>
                      <p className="s-card-note" style={{ textTransform: "none" }}>
                        {t.from}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- FINAL CTA ---------- */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Slot slot={GALLERY_WIDE[2]} sizes="100vw" dark />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(247,241,232,.94) 0%, rgba(247,241,232,.25) 100%)",
            }}
          />
        </div>

        <div
          className="s-wrap"
          style={{
            position: "relative",
            zIndex: 2,
            paddingTop: "clamp(50px,8vw,96px)",
            paddingBottom: "clamp(50px,8vw,96px)",
          }}
        >
          <Reveal>
            <p className="s-eyebrow">{ABOUT.ctaEyebrow}</p>
            <h2 className="s-h2" style={{ marginTop: 16, fontSize: "clamp(26px,3.6vw,48px)" }}>
              {ABOUT.ctaTitle[0]}
              <br />
              {ABOUT.ctaTitle[1]}
            </h2>
            <div style={{ marginTop: 26 }}>
              <ApplyButton label={ABOUT.ctaButton} source="about" />
            </div>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
