import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConversionEvent from "@/components/analytics/ConversionEvent";

/* Not indexable: it is a per-applicant confirmation, and an indexed
   thank-you page also inflates conversion counts with organic landings. */
export const metadata: Metadata = {
  title: "Application lodged — Form 7A · AS SCHEDULED",
  description: "Your application has been filed. A human reads every answer.",
  robots: { index: false, follow: false },
};

const TIMELINE: { when: string; what: string }[] = [
  { when: "NOW", what: "File lodged, fee held. Confirmation hits your email." },
  { when: "REVIEW", what: "A human reads all nine answers. No algorithm." },
  {
    when: "WITHIN 72H OF WINDOW CLOSE",
    what: "Decision by email. Selected or not. No third option.",
  },
  {
    when: "IF SELECTED",
    what: "A 48-hour payment window opens. Then: one WhatsApp group, one boarding hub, six days.",
  },
];

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  /* Only ever display a reference matching the format we issue — this value
     comes from the URL and is therefore attacker-controlled. */
  const reference = ref && /^AS-S1-[A-Z0-9]{1,16}$/.test(ref) ? ref : null;

  return (
    <>
      <Header />
      <ConversionEvent event="application_lodged" />
      <main style={{ paddingTop: 62 }}>
        <section className="sec">
          <div className="ty">
            <span className="st">LODGED</span>
            <h1 className="disp ty-h">
              Application filed.
              <br />
              <span className="ser">Now we read. You wait.</span>
            </h1>

            {reference ? (
              <p className="ty-ref">REF: {reference}</p>
            ) : (
              <p className="ty-ref ty-ref-none">
                REFERENCE SENT TO YOUR EMAIL
              </p>
            )}

            <p className="ty-note">
              Keep the reference. Quote it if you ever need to reach us about this file.
            </p>

            <ol className="ty-tl">
              {TIMELINE.map((t, i) => (
                <li key={t.when}>
                  <span className={`dot${i === 0 ? " on" : ""}`} aria-hidden="true" />
                  <span>
                    <b>{t.when}</b>
                    {t.what}
                  </span>
                </li>
              ))}
            </ol>

            <div className="ty-acts">
              <Link className="btn btn-peach" href="/trips">
                See the other departures
              </Link>
              <Link className="btn" href="/faq">
                Read the questions
              </Link>
            </div>

            <p className="lbl lbl-grey ty-foot">
              ₹500 REGISTRATION, NON-REFUNDABLE · NOT A DEPOSIT · NOT ADJUSTED AGAINST THE TRIP FEE
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
