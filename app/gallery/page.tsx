import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import Slot from "@/components/as/Slot";
import { GALLERY } from "@/lib/copy";
import { abs } from "@/lib/site";
import type { Slot as SlotData } from "@/lib/departures";

export const metadata: Metadata = {
  title: "SOMEWHERE RECENTLY — Gallery · AS SCHEDULED",
  description:
    "Just things we saw, people we met and a few moments that made the camera come out. A look inside the trips, the nights and the people who actually went.",
  alternates: { canonical: abs("/gallery") },
};

/* The archive is empty. CLAUDE.md is explicit: no stock travel imagery,
   and Trip 000 (Alcheringa) is the only past record — its photos have
   not been supplied. So every tile is a labelled placeholder and the
   page says so, rather than pretending to a history we do not have.

   TODO(mannat): Trip 000 photos + all Season 1 photography. */
const SCATTER: SlotData[] = Array.from({ length: 10 }, (_, i) => ({
  src: null,
  alt: `Archive frame ${i + 1}`,
  label: `ARCHIVE ${String(i + 1).padStart(2, "0")}`,
}));

const ARCHIVE: SlotData[] = Array.from({ length: 11 }, (_, i) => ({
  src: null,
  alt: `Archive frame ${i + 1}`,
  label: `FRAME ${String(i + 1).padStart(2, "0")}`,
}));

/* Fixed scatter geometry — deliberately hand-placed rather than random,
   so the layout is identical on the server and the client. */
const PLACES = [
  { top: "16%", left: "3%", rot: -5 },
  { top: "2%", left: "22%", rot: 3 },
  { top: "4%", left: "58%", rot: -3 },
  { top: "16%", left: "76%", rot: 4 },
  { top: "42%", left: "1%", rot: 2 },
  { top: "44%", left: "70%", rot: -4 },
  { top: "66%", left: "8%", rot: 5 },
  { top: "74%", left: "30%", rot: -2 },
  { top: "72%", left: "56%", rot: 3 },
  { top: "66%", left: "78%", rot: -5 },
];

export default function GalleryPage() {
  return (
    <Shell>
      {/* ---------- SCATTER HERO ---------- */}
      <section className="s-wrap-wide" style={{ paddingTop: "clamp(110px,14vh,150px)" }}>
        <div className="s-scatter">
          {SCATTER.map((s, i) => {
            const p = PLACES[i];
            return (
              <div
                key={s.label}
                className="s-scatter-item"
                style={{ top: p.top, left: p.left, transform: `rotate(${p.rot}deg)` }}
              >
                <Slot slot={s} sizes="210px" />
              </div>
            );
          })}

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
                  {GALLERY.heroCta} <span className="s-arrow">→</span>
                </a>
              </div>

              <p style={{ marginTop: 18 }}>
                <a href="#archive" className="s-link">
                  {GALLERY.heroLink} <span className="s-arrow">→</span>
                </a>
              </p>
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

        <Reveal delay={1}>
          <div style={{ marginTop: "clamp(40px,6vw,72px)" }}>
            <h3 className="s-h3">
              {GALLERY.archiveTitle}
              <span className="s-dot">.</span>
            </h3>
            <p className="s-ital" style={{ fontSize: 17, color: "var(--s-grey)", marginTop: 4 }}>
              {GALLERY.archiveSub}
            </p>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="s-gal-grid" style={{ marginTop: 26 }}>
            {ARCHIVE.map((a) => (
              <Slot key={a.label} slot={a} className="s-gal-tile" sizes="(max-width:720px) 50vw, 25vw" />
            ))}
          </div>
        </Reveal>
      </section>

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
