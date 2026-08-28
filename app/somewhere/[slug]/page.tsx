import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import Slot from "@/components/as/Slot";
import Accordion from "@/components/as/Accordion";
import ApplyButton from "@/components/as/ApplyButton";
import DepartureHero from "@/components/as/DepartureHero";
import LastYear from "@/components/as/LastYear";
import PlanCards from "@/components/as/PlanCards";
import { hasPlans } from "@/lib/packages";
import { DETAIL, SOMEWHERE } from "@/lib/copy";
import { DEPARTURES, batchLabel, getDeparture, priceRange } from "@/lib/departures";
import { abs } from "@/lib/site";

/* Experience detail — comps (7) and (8). One template, both departures;
   everything on the page comes from lib/departures.ts. */

export function generateStaticParams() {
  return DEPARTURES.map((d) => ({ slug: d.slug }));
}

/* The price on this page depends on the referral cookie, so it cannot
   be prerendered — generateStaticParams alone would bake one visitor's
   price into HTML served to everybody. The params above still describe
   the valid slugs; this says render them per request.
   Three pages, already fast on the server, in exchange for the price
   being right on first paint. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = getDeparture(slug);
  if (!d) return { title: "Not found · AS SCHEDULED" };

  const title = `${d.titleTop} x ${d.titleBottom} — ${d.days} days · AS SCHEDULED`;
  return {
    title,
    description: d.intro[1],
    alternates: { canonical: abs(`/somewhere/${d.slug}`) },
    openGraph: { title, description: d.intro[0], url: abs(`/somewhere/${d.slug}`) },
  };
}

export default async function DeparturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDeparture(slug);
  if (!d) notFound();

  return (
    /* overHero: the header floats transparent over the full-screen
       photography until it has scrolled past. */
    <Shell overHero>
      <article>
        {/* ---------- FULL-SCREEN HERO ----------
            The campus frame first, then every other frame we hold for
            this departure, cross-fading one after another. */}
        <DepartureHero
          frames={d.wide}
          clip={d.clip}
          hint={d.campus}
          stamp={
            d.soldOut
              ? {
                  label: SOMEWHERE.soldOutLabel,
                  top: SOMEWHERE.soldOutArcTop,
                  bottom: SOMEWHERE.soldOutArcBottom,
                }
              : undefined
          }
        >
          <p className="s-eyebrow" style={{ color: "var(--s-butter)" }}>
            {d.fest} — {d.campus}
          </p>

          <h1 className="s-h2" style={{ marginTop: 16, fontSize: "clamp(36px,6.2vw,86px)" }}>
            {d.titleTop}
            <br />
            <span
              style={{
                fontFamily: "var(--s-ital)",
                fontStyle: "italic",
                textTransform: "lowercase",
              }}
            >
              x{" "}
            </span>
            {d.titleBottom}
            <span className="s-dot">.</span>
          </h1>

          <div className="s-dp-meta" style={{ marginTop: 24 }}>
            <span className="s-chip s-chip-over">
              {d.days} DAYS · {d.nights} NIGHTS
            </span>
            <span className="s-chip s-chip-over">{batchLabel(d.batches)}</span>
            <span className="s-chip s-chip-over">{d.range}</span>
          </div>
        </DepartureHero>

        {/* ---------- INTRO + BOOKING PANEL ---------- */}
        <section className="s-wrap s-sec-tight">
          <div className="s-split s-split-top">
            <Reveal>
              <h2 className="s-h3" style={{ color: "var(--s-rust)" }}>
                {DETAIL.introTitle}
              </h2>

              {d.intro.map((p, i) => (
                <p key={p} className="s-body" style={{ marginTop: i === 0 ? 20 : 16 }}>
                  {p}
                </p>
              ))}

              <span className="s-tick" style={{ display: "block", marginTop: 26 }} />

              {/* Stamped rather than listed. This column runs out well
                  before the booking panel does, and these are the two
                  things somebody should not have to open a price table
                  to find out. Red is the brand's stamp ink and nothing
                  else, so a rubber stamp is the honest device here. */}
              {d.perks?.length ? (
                <ul className="s-perks">
                  {d.perks.map((perk, i) => (
                    <li key={perk} className="s-perk" data-alt={i % 2 === 1}>
                      {perk}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>

            <Reveal delay={1}>
              <div className="s-panel">
                <p className="s-panel-h">🗓 {DETAIL.datesLabel}</p>

                <div style={{ marginTop: 14 }}>
                  {d.batches.map((b) => (
                    <p key={b.label} style={{ fontSize: 14, padding: "6px 0" }}>
                      {b.label}
                    </p>
                  ))}
                </div>

                <hr className="s-rule" style={{ margin: "18px 0" }} />

                <p className="s-eyebrow s-eyebrow-grey">{DETAIL.fromLabel}</p>

                {/* List price. The coupon is applied at the payment
                    step, so nothing is struck through here — the stamp
                    beside this panel is what says ₹1,000 comes off. */}
                <p className="s-price-now">
                  {priceRange({ price: d.price, priceMax: d.priceMax })}
                  <span className="s-price-per">{SOMEWHERE.pricePer}</span>
                </p>

                {/* A span, not a disabled button: there is nothing to
                    press, so it should not look pressable or take focus. */}
                {d.soldOut ? (
                  <span className="s-btn-closed" style={{ width: "100%", justifyContent: "center" }}>
                    {SOMEWHERE.soldOutCta}
                  </span>
                ) : (
                  <ApplyButton label={DETAIL.applyCta} event={d.id} full source="departure-panel" />
                )}

                {/* A real remaining count when one is confirmed; the
                    comp's line when it is not. Never a fake number. */}
                <p className="s-hint" style={{ marginTop: 14 }}>
                  {d.soldOut ? (
                    SOMEWHERE.soldOutNote
                  ) : (
                    <>
                      ⚡{" "}
                      {d.spotsLeft !== null
                        ? `${d.spotsLeft} SPOTS LEFT`
                        : DETAIL.spotsFallback}
                    </>
                  )}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- PLANS ----------
            Only for departures sold as more than one package. It sits
            directly under the price panel because that panel shows a
            range, and this is what resolves the range into the one
            number that applies to whoever is reading. */}
        {hasPlans(d.id) ? (
          <section className="s-wrap s-sec-tight">
            <Reveal>
              <PlanCards departureId={d.id} soldOut={d.soldOut === true} />
            </Reveal>
          </section>
        ) : null}

        {/* ---------- INCLUDED / EXCLUDED ---------- */}
        <section className="s-wrap s-sec-tight">
          <div className="s-split s-split-even">
            <Reveal>
              <div className="s-panel" style={{ height: "100%" }}>
                <p className="s-panel-h">{DETAIL.includedLabel}</p>
                <p className="s-panel-sub">{DETAIL.includedSub}</p>
                <ul className="s-list s-list-yes">
                  {d.included.map((i) => (
                    <li key={i}>
                      <span aria-hidden="true">✓</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="s-panel" style={{ height: "100%" }}>
                <p className="s-panel-h">{DETAIL.excludedLabel}</p>
                <p className="s-panel-sub">{DETAIL.excludedSub}</p>
                <ul className="s-list">
                  {d.excluded.map((i) => (
                    <li key={i}>
                      <span aria-hidden="true">✕</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- ITINERARY + BROCHURE ---------- */}
        <section className="s-wrap s-sec-tight">
          <div className="s-split s-split-even">
            <Reveal>
              <div className="s-panel" style={{ height: "100%" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <p className="s-panel-h">{DETAIL.itineraryLabel}</p>
                  <p className="s-hint">{DETAIL.itinerarySub}</p>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Accordion
                    idPrefix={`itin-${d.slug}`}
                    items={d.itinerary.map((day) => ({
                      n: day.n,
                      meta: day.date,
                      title: day.title,
                      body: day.detail ?? (
                        /* The comps show day titles only. Rather than
                           invent a schedule, say so. */
                        <span className="s-hint">
                          Detail for this day is not published yet.
                        </span>
                      ),
                    }))}
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div
                className="s-panel"
                style={{
                  background: "var(--s-ink)",
                  borderColor: "var(--s-ink)",
                  color: "var(--s-paper)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h2 className="s-h3" style={{ fontSize: "clamp(19px,2.1vw,28px)" }}>
                  {DETAIL.brochureTitle[0]}
                  <br />
                  {DETAIL.brochureTitle[1]}{" "}
                  <span style={{ color: "var(--s-rust-soft)" }}>{DETAIL.brochureTitleMark}</span>
                </h2>

                <div style={{ marginTop: 26 }}>
                  {d.brochure ? (
                    <a href={d.brochure} className="s-btn" download>
                      ⬇ {DETAIL.brochureCta}
                    </a>
                  ) : (
                    /* No PDF exists yet. A dead download button is worse
                       than an honest line — TODO(mannat): supply it. */
                    <p className="s-hint" style={{ color: "rgba(247,241,232,.6)" }}>
                      {DETAIL.brochureCta} — not published yet.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 30,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {/* The frames the mosaic above did not use. */}
                  {d.mosaic.slice(-2).map((m) => (
                    <div key={`b-${m.label}`} style={{ position: "relative", aspectRatio: "4/5" }}>
                      <Slot slot={m} dark sizes="20vw" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- LAST YEAR ----------
            Only for departures that have footage from a previous
            edition. It sits after the schedule on purpose: by then
            somebody knows what the week is, and this answers what it
            actually feels like. */}
        {d.lastYear ? (
          <section className="s-wrap s-sec-tight">
            <Reveal>
              <LastYear
                eyebrow={d.lastYear.eyebrow}
                title={d.lastYear.title}
                note={d.lastYear.note}
                reels={d.lastYear.reels}
              />
            </Reveal>
          </section>
        ) : null}

        {/* ---------- CLOSING ---------- */}
        <section
          className="s-wrap"
          style={{ paddingTop: "clamp(40px,6vw,80px)", paddingBottom: "clamp(64px,9vw,120px)" }}
        >
          <hr className="s-rule" style={{ marginBottom: "clamp(34px,5vw,56px)" }} />

          <Reveal>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 30,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p className="s-h2" style={{ color: "var(--s-rust)", fontSize: "clamp(26px,3.4vw,44px)" }}>
                  {DETAIL.closingAlt[0]}
                </p>
                <p className="s-h2" style={{ color: "var(--s-rust)", fontSize: "clamp(26px,3.4vw,44px)" }}>
                  {DETAIL.closingAlt[1]}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
                <span className="s-stamp">
                  {DETAIL.stamp[0]}
                  <br />
                  {DETAIL.stamp[1]}
                </span>
                {d.soldOut ? (
                  <span className="s-btn-closed">{SOMEWHERE.soldOutCta}</span>
                ) : (
                  <ApplyButton label={DETAIL.applyCta} event={d.id} source="departure-close" />
                )}
              </div>
            </div>
          </Reveal>
        </section>
      </article>
    </Shell>
  );
}
