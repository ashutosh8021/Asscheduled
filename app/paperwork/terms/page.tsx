import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { TermsPane } from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Terms of Travel · AS SCHEDULED",
  description:
    "Eligibility and ID checks, conduct on the ground, how published schedules may change, and where liability sits. Summary of the terms issued with selection.",
  alternates: { canonical: "/paperwork/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 62 }}>
        <section className="sec">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Paperwork", path: "/paperwork" },
              { name: "Terms of Travel", path: "/paperwork/terms" },
            ]}
          />
          <div className="sec-head">
            <h1 className="disp sec-h">Terms of Travel</h1>
            <p className="sec-no">FILE — CONDITIONS OF CARRIAGE</p>
          </div>
          <div className="lpane on">
            <TermsPane level="h2" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
