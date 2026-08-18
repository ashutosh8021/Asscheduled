"use client";

import Link from "next/link";
import Reveal from "../Reveal";
import Slot from "../Slot";
import Tilt from "../Tilt";
import { useModal } from "../ModalProvider";
import { HOME } from "@/lib/copy";
import { GALLERY_ALL, GALLERY_WIDE } from "@/lib/gallery";
import { DEPARTURES, shortPrice } from "@/lib/departures";

/* Homepage body, in the comp's order:
   editorial brand moment → NOW SCHEDULED rail → gallery strip → final CTA. */

/* "A few from our previous trips" — so these must be exactly that.
   Real frames from trips that ran; see lib/gallery.ts. */
const STRIP = GALLERY_ALL.slice(0, 8);

export default function HomeSections() {
  const { openApply } = useModal();

  return (
    <>
      {/* ---------- EDITORIAL BRAND MOMENT ---------- */}
      <section className="s-sec s-wrap">
        <div className="s-split">
          <Reveal>
            <p className="s-eyebrow" style={{ marginBottom: 18 }}>
              {HOME.aboutEyebrow}
            </p>

            <h2 className="s-h2">{HOME.aboutTitle}</h2>

            <p className="s-body" style={{ marginTop: 24 }}>
              {HOME.aboutBody}
            </p>

            <p className="s-body" style={{ marginTop: 18 }}>
              {HOME.aboutKicker}{" "}
              <span className="s-underline s-underline-sm">{HOME.aboutKickerMark}</span>.
            </p>

            <p style={{ marginTop: 32 }}>
              <Link href="/about" className="s-link">
                {HOME.aboutCta} <span className="s-arrow">→</span>
              </Link>
            </p>
          </Reveal>

          <Reveal delay={1}>
            <Tilt max={4} lift={8}>
              <Slot
                slot={GALLERY_WIDE[0]}
                className="s-gal-tile"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* ---------- NOW SCHEDULED ---------- */}
      <section className="s-sec s-sec-ink">
        <div className="s-wrap">
          <Reveal>
            <p className="s-eyebrow" style={{ marginBottom: 12 }}>
              {HOME.nowEyebrow}
            </p>
            <h2
              className="s-serif"
              style={{
                fontSize: "clamp(24px, 3.2vw, 40px)",
                fontWeight: 500,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
              }}
            >
              {HOME.nowTitle}
            </h2>
          </Reveal>

          <div className="s-cards" style={{ marginTop: 44 }}>
            {DEPARTURES.map((d, i) => (
              <Reveal key={d.id} delay={i === 0 ? 1 : 2}>
                <Tilt max={5} lift={12}>
                  <article
                    className="s-card"
                    style={{ background: "var(--s-paper)", borderColor: "transparent" }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ position: "relative", aspectRatio: "3 / 4" }}>
                        <Slot
                          slot={d.portrait}
                          sizes="(max-width: 900px) 50vw, 24vw"
                          hint={d.campus}
                        />
                      </div>

                      <div
                        style={{
                          padding: "22px 20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          color: "var(--s-ink)",
                        }}
                      >
                        <span className="s-tick" />
                        <h3 className="s-h3" style={{ fontSize: "clamp(19px,2vw,26px)" }}>
                          {d.campus}
                        </h3>

                        <p className="s-card-note" style={{ textTransform: "none" }}>
                          {d.homeDates}
                        </p>
                        <p className="s-card-note" style={{ textTransform: "none" }}>
                          {d.homeNote}
                        </p>

                        <Link
                          href={`/somewhere/${d.slug}`}
                          className="s-link"
                          style={{ marginTop: 10, alignSelf: "flex-start" }}
                        >
                          See the plan <span className="s-arrow">→</span>
                        </Link>

                        <p style={{ marginTop: "auto", fontSize: 15, fontWeight: 500 }}>
                          {shortPrice(d.price)}
                        </p>
                      </div>
                    </div>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>

          <Reveal delay={3}>
            <p style={{ textAlign: "center", marginTop: 40 }}>
              <Link href="/somewhere" className="s-btn s-btn-butter">
                {HOME.nowCta} <span className="s-arrow">→</span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- GALLERY STRIP ---------- */}
      <section className="s-sec-tight s-sec-paper2">
        <div className="s-wrap">
          <Reveal>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                flexWrap: "wrap",
                marginBottom: 22,
              }}
            >
              <h2 className="s-h3">{HOME.galleryTitle}</h2>
              <p className="s-ital" style={{ fontSize: 18, color: "var(--s-grey)" }}>
                {HOME.gallerySub}
              </p>
              <Link href="/gallery" className="s-link" style={{ marginLeft: "auto" }}>
                OPEN <span className="s-arrow">→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="s-gal-rail">
              {STRIP.map((s) => (
                <Slot key={s.label} slot={s} className="s-gal-tile" sizes="260px" />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Slot
            slot={GALLERY_WIDE[1]}
            sizes="100vw"
            dark
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(13,24,48,.86) 0%, rgba(13,24,48,.45) 100%)",
            }}
          />
        </div>

        <div
          className="s-wrap"
          style={{
            position: "relative",
            zIndex: 2,
            paddingTop: "clamp(56px,9vw,110px)",
            paddingBottom: "clamp(56px,9vw,110px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
            color: "var(--s-bone)",
          }}
        >
          <Reveal>
            <h2 className="s-h2" style={{ color: "inherit" }}>
              {HOME.finalTitle}
            </h2>
            <p className="s-ital" style={{ fontSize: "clamp(18px,2.4vw,28px)", marginTop: 8 }}>
              {HOME.finalSub}
            </p>
          </Reveal>

          <Reveal delay={1}>
            <button type="button" className="s-btn s-btn-butter" onClick={() => openApply()}>
              {HOME.finalCta}
            </button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
