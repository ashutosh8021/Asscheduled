import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { PrivacyPane } from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Privacy Policy · AS SCHEDULED",
  description:
    "What we collect when you apply, what we use it for, how long we keep it, and how to ask for a copy or deletion. Identity documents are requested only after you are accepted.",
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
