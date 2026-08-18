import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import Slot from "@/components/as/Slot";
import { GALLERY } from "@/lib/copy";
import { GALLERY_TALL, PAST_TRIPS } from "@/lib/gallery";
import PastVideos from "@/components/as/PastVideos";
import ScatterField, { type Place } from "@/components/as/ScatterField";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "SOMEWHERE RECENTLY — Gallery · AS SCHEDULED",
  description:
    "Just things we saw, people we met and a few moments that made the camera come out. A look inside the trips, the nights and the people who actually went.",
  alternates: { canonical: abs("/gallery") },
};

/* Real photography from trips that ran — see lib/gallery.ts. The
   scattered field uses the portrait frames, since the tiles are tall.
   Everything else now lives inside its trip section below. */
const SCATTER = GALLERY_TALL.slice(0, 8);

/* Scatter geometry. Hand-placed, not random, so the server and client
   render identically.

   Anchored to the left and right edges rather than positioned across
   the full width: that keeps a clear corridor down the middle for the
   headline at any window size. `z` is the depth each frame sits at,
   which is what the pointer tilt parallaxes against. */
const PLACES: Place[] = [
  { side: "left", x: "1%", y: "4%", rot: -5, z: 40, delay: 0.05 },
  { side: "left", x: "13%", y: "27%", rot: 3, z: -70, delay: 0.35 },
  { side: "left", x: "0%", y: "50%", rot: 2, z: 20, delay: 0.6 },
  { side: "left", x: "11%", y: "72%", rot: -3, z: -110, delay: 0.8 },

  { side: "right", x: "2%", y: "2%", rot: 4, z: -60, delay: 0.2 },
  { side: "right", x: "13%", y: "25%", rot: -4, z: 30, delay: 0.45 },
  { side: "right", x: "0%", y: "49%", rot: 5, z: -90, delay: 0.7 },
  { side: "right", x: "12%", y: "71%", rot: -2, z: 10, delay: 0.9 },
];

export default function GalleryPage() {
  return (
    <Shell>
      {/* ---------- SCATTER HERO ---------- */}
      <section className="s-wrap-wide" style={{ paddingTop: "clamp(110px,14vh,150px)" }}>
        <div className="s-scatter">
          <ScatterField frames={SCATTER} places={PLACES} />

          <div className="s-scatter-mid">
            <Reveal>
              <h1 className="s-h2-serif" style={{ fontSize: "clamp(44px,8vw,110px)" }}>
                {GALLERY.heroTitle}
                <span className="s-dot">.</span>
              </h1>

              <p
                className="s-serif"
                style={{
                  color: "var(--s-rust)",
                  fontSize: "clamp(20px,2.6vw,34px)",
                  marginTop: 6,
                }}
              >
                <span className="s-underline s-underline-sm">{GALLERY.heroSub}</span>
              </p>

              <div className="s-ital" style={{ marginTop: 26, fontSize: "clamp(15px,1.7vw,20px)" }}>
                {GALLERY.heroBody.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <a href="#archive" className="s-btn">
                  {GALLERY.heroLink} <span className="s-arrow">→</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- SOMEWHERE RECENTLY ---------- */}
      <section className="s-sec s-wrap" id="archive">
        <Reveal>
          <h2 className="s-h2-serif">
            {GALLERY.title[0]}
            <br />
            {GALLERY.title[1]}
            <span className="s-dot">.</span>
          </h2>

          <div className="s-ital" style={{ marginTop: 20, fontSize: "clamp(15px,1.6vw,19px)" }}>
            {GALLERY.sub.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>

          <span className="s-tick" style={{ display: "block", marginTop: 20 }} />
        </Reveal>

      </section>

      {/* ---------- THE TRIPS ----------
          The whole archive, grouped by the trip it came from. There is
          no separate flat grid: it showed the same photographs a second
          time. Dates and traveller counts render only where confirmed. */}
      {PAST_TRIPS.map((t, i) => (
        <section
          key={t.id}
          className={i % 2 === 1 ? "s-sec-tight s-sec-paper2" : "s-sec-tight"}
        >
          <div className="s-wrap">
            <Reveal>
              <div className="s-trip-head">
                <span className="s-trip-num">{String(i + 1).padStart(2, "0")}</span>
                <div className="s-trip-id">
                  <h2 className="s-trip-title">{t.fest}</h2>
                  <p className="s-eyebrow">
                    {t.campus} · {t.city}
                  </p>
                </div>
                <div className="s-trip-meta">
                  {t.when ? <span className="s-chip">{t.when}</span> : null}
                  {t.travellers ? <span className="s-chip">{t.travellers} TRAVELLED</span> : null}
                  <span className="s-chip">
                    {t.photos.length + 1 + (t.clips?.length ?? 0)} FRAMES
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="s-trip-cover">
                <Slot slot={t.cover} sizes="(max-width: 900px) 100vw, 78vw" />
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="s-trip-grid">
                {t.photos.map((p) => (
                  <div key={p.label} className="s-trip-tile" data-wide={p.wide ?? false}>
                    <Slot
                      slot={p}
                      sizes={
                        p.wide
                          ? "(max-width: 720px) 100vw, 40vw"
                          : "(max-width: 720px) 50vw, 20vw"
                      }
                    />
                  </div>
                ))}
              </div>
            </Reveal>

            {t.clips ? (
              <Reveal delay={2}>
                <p className="s-trip-divider">FOOTAGE</p>
                <PastVideos clips={t.clips} />
              </Reveal>
            ) : null}
          </div>
        </section>
      ))}

      {/* ---------- KEEP SCROLLING ---------- */}
      <section className="s-wrap" style={{ paddingBottom: "clamp(64px,9vw,120px)" }}>
        <hr className="s-rule" style={{ marginBottom: "clamp(34px,5vw,56px)" }} />

        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 34,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 className="s-h2-serif" style={{ fontSize: "clamp(30px,4.4vw,58px)" }}>
                {GALLERY.keepTitle}
              </h2>
              <div className="s-ital" style={{ marginTop: 12, fontSize: "clamp(15px,1.6vw,19px)" }}>
                {GALLERY.keepBody.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            </div>

            <Link href="/somewhere" className="s-link" style={{ fontSize: 15 }}>
              {GALLERY.keepCta} <span className="s-arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </Shell>
  );
}
