import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import DepartureCard from "@/components/as/DepartureCard";
import { effectivePrice } from "@/lib/partners";
import { SOMEWHERE } from "@/lib/copy";
import { DEPARTURES } from "@/lib/departures";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "SOMEWHERE ELSE — Departures · AS SCHEDULED",
  description:
    "College fests. New cities. New faces. A few days outside the usual programming. Pulse at AIIMS Delhi, Thomso at IIT Roorkee — dates, batches and what is included.",
  alternates: { canonical: abs("/somewhere") },
};

export default async function SomewherePage() {
  /* List price while browsing. The coupon is applied at the payment
     step instead, so nothing here is discounted and the cards show
     what the trip costs. */
  const priceFor = (d: { id: string; price: number; priceMax?: number }) =>
    effectivePrice(d.price, d.priceMax, null);

  return (
    <Shell>
      {/* ---------- MASTHEAD ---------- */}
      <section className="s-wrap" style={{ paddingTop: "clamp(120px,17vh,190px)", paddingBottom: "clamp(40px,6vw,72px)" }}>
        <div className="s-split s-split-top">
          <Reveal>
            <h1 className="s-h2-serif">
              {SOMEWHERE.title[0]}
              <br />
              {SOMEWHERE.title[1]}
              <span className="s-dot">.</span>
            </h1>

            <div style={{ marginTop: 28 }}>
              {SOMEWHERE.sub.map((l) => (
                <p key={l} style={{ fontSize: 15 }}>
                  {l}
                </p>
              ))}
            </div>

            <span className="s-tick" style={{ display: "block", margin: "22px 0" }} />

            <div>
              {SOMEWHERE.sub2.map((l) => (
                <p key={l} style={{ fontSize: 15 }}>
                  {l}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div style={{ paddingTop: "clamp(0px,4vw,60px)" }}>
              <p
                className="s-h2"
                /* marginTop dropped — it spaced this from the three
                   NO… lines that used to sit above it. */
                style={{ color: "var(--s-rust)", fontSize: "clamp(32px,4.2vw,58px)" }}
              >
                <span className="s-underline">{SOMEWHERE.notsMark}</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="s-wrap">
        <hr className="s-rule" />
      </div>

      {/* ---------- THE DEPARTURES ---------- */}
      <section className="s-sec s-wrap">
        <div className="s-split s-split-top" style={{ gridTemplateColumns: "minmax(0,.75fr) minmax(0,2fr)" }}>
          <Reveal>
            <h2 className="s-h2" style={{ fontSize: "clamp(24px,3vw,40px)" }}>
              {SOMEWHERE.placesTitle[0]}
              <br />
              {SOMEWHERE.placesTitle[1]}
              <br />
              <span style={{ color: "var(--s-rust)" }}>
                <span className="s-underline">{SOMEWHERE.placesTitleMark}</span>
              </span>
            </h2>

            <p className="s-eyebrow s-eyebrow-ink" style={{ marginTop: 30, color: "var(--s-butter)" }}>
              <span style={{ color: "var(--s-ink)" }}>{SOMEWHERE.nextLabel}</span>
            </p>
            <div style={{ marginTop: 10 }}>
              {SOMEWHERE.next.map((l) => (
                <p key={l} style={{ fontSize: 14 }}>
                  {l}
                </p>
              ))}
            </div>
          </Reveal>

          <div>
            <div className="s-cards">
              {DEPARTURES.map((d, i) => (
                <Reveal key={d.id} delay={i === 0 ? 1 : 2}>
                  <DepartureCard d={d} priority={i === 0} pricing={priceFor(d)} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={3}>
              <div
                style={{
                  marginTop: 22,
                  border: "1px solid var(--s-line)",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                <p className="s-h3" style={{ color: "var(--s-rust)", fontSize: "clamp(17px,1.8vw,24px)" }}>
                  {SOMEWHERE.moreTitle}
                </p>
                <span style={{ width: 1, alignSelf: "stretch", background: "var(--s-line)" }} />
                <div>
                  {SOMEWHERE.moreSub.map((l) => (
                    <p key={l} className="s-lbl" style={{ color: "var(--s-grey)" }}>
                      {l}
                    </p>
                  ))}
                </div>
                <span className="s-arrow" style={{ marginLeft: "auto", color: "var(--s-rust)", fontSize: 24 }}>
                  ↷
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- THE LITTLE THINGS ---------- */}
      <section className="s-sec-tight s-sec-paper2">
        <div className="s-wrap">
          <div className="s-split s-split-top" style={{ gridTemplateColumns: "minmax(0,.75fr) minmax(0,2fr)" }}>
            <Reveal>
              <h2 className="s-h2" style={{ fontSize: "clamp(34px,4.8vw,68px)" }}>
                {SOMEWHERE.smallTitle.map((l) => (
                  <span key={l} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
              </h2>
              <span className="s-tick" style={{ display: "block", marginTop: 20 }} />
            </Reveal>

            <div className="s-cards">
              {DEPARTURES.map((d, i) => (
                <Reveal key={d.id} delay={i === 0 ? 1 : 2}>
                  <DepartureCard d={d} variant="detail" pricing={priceFor(d)} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ANYWAY ---------- */}
      <section className="s-sec-tight s-wrap" style={{ paddingBottom: "clamp(64px,9vw,120px)" }}>
        <hr className="s-rule" style={{ marginBottom: "clamp(34px,5vw,60px)" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
            gap: "clamp(26px,5vw,64px)",
            alignItems: "center",
          }}
        >
          <Reveal>
            <p className="s-h2-serif" style={{ fontSize: "clamp(38px,7vw,88px)" }}>
              {SOMEWHERE.closingWord}
              <span className="s-dot">.</span>
            </p>
          </Reveal>

          <Reveal delay={1}>
            <h2 className="s-h3">
              {SOMEWHERE.closingTitle[0]}
              <br />
              {SOMEWHERE.closingTitle[1]}
            </h2>
            <p className="s-h3" style={{ color: "var(--s-rust)", marginTop: 8 }}>
              {SOMEWHERE.closingMark}
            </p>
            <div style={{ marginTop: 16 }}>
              {SOMEWHERE.closingBody.map((l) => (
                <p key={l} style={{ fontSize: 14, color: "var(--s-grey)" }}>
                  {l}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
