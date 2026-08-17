import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { PrivacyPane } from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Privacy Policy · AS SCHEDULED",
  description:
    "What Form 7A collects, what it is used for, how long it is kept, and how to ask for a copy or deletion. Payment details never touch our servers.",
  alternates: { canonical: "/paperwork/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 62 }}>
        <section className="sec">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Paperwork", path: "/paperwork" },
              { name: "Privacy Policy", path: "/paperwork/privacy" },
            ]}
          />
          <div className="sec-head">
            <h1 className="disp sec-h">Privacy Policy</h1>
            <p className="sec-no">FILE — DATA PROTECTION</p>
          </div>
          <div className="lpane on">
            <PrivacyPane level="h2" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
