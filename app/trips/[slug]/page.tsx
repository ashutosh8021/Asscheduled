import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TRIPS, getTrip, seatsLeft, isAlmostFull } from "@/lib/trips";
import { inr } from "@/lib/format";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Reveals from "@/components/ui/Reveal";
import Frame from "@/components/ui/Frame";
import Countdown from "@/components/ui/Countdown";
import SplitFlap from "@/components/ui/SplitFlap";
import CaseFileBody from "@/components/home/CaseFileBody";
import PackageSelector from "@/components/trips/PackageSelector";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { tripSchema } from "@/lib/schema";

export function generateStaticParams() {
  return TRIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTrip(slug);
  if (!trip) return { title: "File not found · AS SCHEDULED" };
  const description = `${trip.hook} ${trip.days} days, ${inr(trip.price)}, everything included. ${trip.seats} seats, application only.`;

  return {
    title: `${trip.fest}, ${trip.campus} — ${trip.id} · AS SCHEDULED`,
    description,
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: {
      title: `${trip.fest} — ${trip.campus}`,
      description,
      url: `/trips/${trip.slug}`,
      type: "website",
      /* Without this the per-route opengraph-image.tsx is used; naming it
         explicitly keeps the absolute URL correct once NEXT_PUBLIC_SITE_URL
         is set. Declaring openGraph without images previously suppressed the
         root share card entirely, so these pages shared with no image. */
      images: [{ url: `/trips/${trip.slug}/opengraph-image`, width: 1200, height: 630, alt: `${trip.fest} — ${trip.campus}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${trip.fest} — ${trip.campus}`,
      description,
    },
  };
}

/* Experience detail — content order fixed by build spec §14. Do not reorder. */
export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTrip(slug);
  if (!trip) notFound();

  const left = seatsLeft(trip);

  return (
    <>
      <Header />
      <JsonLd data={tripSchema(trip)} />
      <main>
        {/* §15 EXPERIENCE HERO */}
        <section className="xhero">
          <div className="xhero-art">
            <Frame slot={trip.hero} ratio="16 / 11" priority sizes="100vw" />
          </div>
          <div className="xhero-copy">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "Trips", path: "/trips" },
                { name: `${trip.fest} — ${trip.id}`, path: `/trips/${trip.slug}` },
              ]}
            />
            <h1 className="disp xhero-h">
              <SplitFlap text={trip.fest} />
            </h1>
            <p className="xhero-where lbl">
              {trip.campus} — {trip.city}
            </p>
            <p className="xhero-hook">{trip.hook}</p>

            {/* §16 TRIP SUMMARY */}
            <dl className="xsum">
              <div>
                <dt>Duration</dt>
                <dd>{trip.days} days</dd>
              </div>
              <div>
                <dt>Window</dt>
                <dd>{trip.win.split(" — ")[0]}</dd>
              </div>
              <div>
                <dt>Group size</dt>
                <dd>{trip.seats} travellers</dd>
              </div>
              <div>
                <dt>Crew</dt>
                <dd>Director + Trip Captain</dd>
              </div>
              <div>
                <dt>Departure point</dt>
                {/* Open item — hubs are announced post-selection. */}
                <dd>Boarding hubs confirmed on selection</dd>
              </div>
              <div>
                <dt>Eligibility</dt>
                <dd>18–26, students and recent grads</dd>
              </div>
            </dl>

            <div className="xprice">
              <div>
                <span className="disp xprice-n">{inr(trip.price)}</span>
                <span className="lbl lbl-grey">PER SEAT · EVERYTHING INCLUDED</span>
              </div>
              <div className="xprice-avail">
                {isAlmostFull(trip) ? (
                  <span className="st">{left} SEATS LEFT</span>
                ) : (
                  <span className="st st-blue">
                    {left} / {trip.seats} SEATS OPEN
                  </span>
                )}
                <Countdown closeAt={trip.close} />
              </div>
            </div>

            <div className="xcta">
              <Link className="btn btn-peach" href={`/apply?trip=${trip.id}`}>
                Apply — {trip.id}
              </Link>
              <a className="btn" href="#schedule">
                Read the full manifest
              </a>
            </div>
            <p className="lbl lbl-grey xcta-note">
              ₹500 REGISTRATION, NON-REFUNDABLE · TRIP FEE PAYABLE IN FULL ON SELECTION
            </p>
          </div>
        </section>

        {/* §17 TRIP STORY */}
        <section className="sec xstory">
          <p className="sec-no rv">FILE — TRIP STORY</p>
          <h2 className="disp rv xstory-h">{trip.hook}</h2>
          <div className="xstory-grid">
            <div className="rv">
              <p>
                Six days built around {trip.fest} at {trip.campus}. The fest is the reason the
                dates exist. {trip.city.split(" + ")[0]} is the reason you stay.
              </p>
              <p>
                You travel with eighteen people you have not met, selected from the same form you
                filled. Two crew hold the schedule together. Everything between the pronites — the
                food runs, the ruins, the late walks — is planned in the same detail as the fest
                itself.
              </p>
              <p className="lbl lbl-grey">
                Evenings marked sealed stay sealed until departure. That is the mechanic, not an
                oversight.
              </p>
            </div>
            <div className="rv">
              <Frame
                slot={{
                  src: null,
                  alt: `${trip.fest} trip story`,
                  label: `TRIP STORY — ${trip.id}`,
                }}
                ratio="4 / 5"
                sizes="(max-width: 900px) 100vw, 40vw"
              />
            </div>
          </div>
        </section>

        {/* §18-§21 WHAT YOU'RE GETTING · THE SCHEDULE · INCLUDED / NOT · STAY · TRANSPORT */}
        <section id="schedule" className="xbody">
          <CaseFileBody trip={trip} />
        </section>

        {/* §22 PACKAGE SELECTOR */}
        <PackageSelector trip={trip} />

        {/* §24 REVIEWS — real testimonials only; none exist yet */}
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h2 className="disp rail-title rv">REVIEWS</h2>
            <div className="rail-meta">
              <p className="sec-no rv">FILE — SOCIAL PROOF</p>
            </div>
          </div>
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">NO RECORD YET</span>
            <p className="disp">This departure has not run.</p>
            <p className="rail-empty-note">
              Reviews appear here after travellers return, in their words. We do not write them
              ourselves and we do not borrow anyone else&apos;s.
            </p>
          </div>
        </section>

        {/* §25 WHO THIS IS FOR */}
        <section className="sec xwho">
          <p className="sec-no rv">FILE — WHO THIS IS FOR</p>
          <h2 className="disp rv xwho-h">
            Solo is the default.
            <br />
            <span className="ser">Not the exception.</span>
          </h2>
          <div className="xwho-grid rv">
            <p>
              Most of the nineteen come alone. If you already had the group, you would not need
              us. The form exists so the nineteen fit together — that is the entire point of
              selecting rather than selling.
            </p>
            <p>
              18–26, students or recent graduates, any college, any city, any course. Bring a
              tolerance for early mornings after late nights and an interest in people who are not
              already your friends.
            </p>
          </div>
        </section>

        {/* §27 FINAL CTA */}
        <section className="sec cta">
          <p className="sec-no rv">LAST PAGE FIRST</p>
          <h2 className="disp rv" style={{ marginTop: 20 }}>
            {trip.seats} seats.
            <br />
            <span className="ser">One form.</span>
          </h2>
          <p className="cta-note rv">
            ₹500 registration, non-refundable · <Countdown closeAt={trip.close} />
          </p>
          <Link className="btn rv" href={`/apply?trip=${trip.id}`}>
            Apply — {trip.id}
          </Link>
        </section>
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
