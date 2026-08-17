import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";
import { FAQS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Questions, Filed — FAQ · AS SCHEDULED",
  description:
    "How selection works, what the ₹500 covers, what is included, and when decisions arrive. The questions applicants actually ask, answered.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Questions, Filed — AS SCHEDULED",
    description: "How selection works and what the ₹500 actually covers.",
    url: "/faq",
    type: "website",
    /* Declaring openGraph without images suppresses the root share card
       entirely — this page would share with no image at all. */
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AS SCHEDULED — Season 01" }],
  },
};

export default function FaqPage() {
  return (
    <>
      <Header />
      <JsonLd data={faqSchema(FAQS)} />
      <main style={{ paddingTop: 62 }}>
        <section className="sec faq">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "FAQ", path: "/faq" },
            ]}
          />
          <div className="sec-head">
            <h1 className="disp sec-h">
              Questions, <span className="ser">Filed</span>
            </h1>
            <p className="sec-no">FILE 07 — FREQUENTLY ASKED</p>
          </div>

          {/* Response-time promise, stated once and prominently. */}
          <p className="faq-promise">
            <b>DECISIONS ARRIVE WITHIN 72 HOURS OF THE WINDOW CLOSING.</b> Selected or not
            selected. By email. No third outcome.
          </p>

          <div>
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q} <span className="mk">+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>

          <div className="faq-after">
            <p className="rail-empty-note">
              Anything not answered here is either in the{" "}
              <Link href="/paperwork">paperwork</Link> or on the{" "}
              <Link href="/trips">departure files</Link> themselves.
            </p>
            <Link className="btn btn-peach" href="/apply">
              Apply — Form 7A
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
