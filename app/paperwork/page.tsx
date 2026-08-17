import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { RefundPane, TermsPane, PrivacyPane } from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  alternates: { canonical: "/paperwork" },
  /* Kept under 60 characters so it is not truncated in results. */
  title: "Paperwork — Refunds, Terms, Privacy · AS SCHEDULED",
  description:
    "The paperwork in one place: cancellation and refund slabs, terms of travel, and privacy. Summaries only — the signed terms issued at payment govern.",
};

export default function PaperworkPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 62 }}>
        <section className="sec">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Paperwork", path: "/paperwork" },
            ]}
          />
          <div className="sec-head">
            <h1 className="disp sec-h">Paperwork</h1>
            <p className="sec-no">FILED IN TRIPLICATE</p>
          </div>

          {/* This page is the combined view; each policy also stands at its
              own URL so it can be linked and cited on its own. */}
          <nav className="pw-index" aria-label="Policies">
            <Link href="/paperwork/cancellation-policy">Cancellation &amp; Refund Policy →</Link>
            <Link href="/paperwork/terms">Terms of Travel →</Link>
            <Link href="/paperwork/privacy">Privacy Policy →</Link>
          </nav>

          <div className="lpane on" id="refund">
            <h2 className="disp" style={{ fontSize: "clamp(22px,3vw,34px)", margin: "0 0 18px" }}>
              Refund Policy
            </h2>
            <RefundPane />
          </div>
          <div className="lpane on" id="terms" style={{ marginTop: 48 }}>
            <h2 className="disp" style={{ fontSize: "clamp(22px,3vw,34px)", margin: "0 0 18px" }}>
              Terms of Travel
            </h2>
            <TermsPane />
          </div>
          <div className="lpane on" id="privacy" style={{ marginTop: 48 }}>
            <h2 className="disp" style={{ fontSize: "clamp(22px,3vw,34px)", margin: "0 0 18px" }}>
              Privacy
            </h2>
            <PrivacyPane />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
