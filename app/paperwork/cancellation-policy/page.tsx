import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { RefundPane } from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy · AS SCHEDULED",
  description:
    "The ₹500 application fee is non-refundable. Trip fee refunds: 80% over 30 days out, 50% at 15–30 days, none under 15. Full refund if we cancel.",
  alternates: { canonical: "/paperwork/cancellation-policy" },
};

export default function CancellationPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 62 }}>
        <section className="sec">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Paperwork", path: "/paperwork" },
              { name: "Cancellation & Refunds", path: "/paperwork/cancellation-policy" },
            ]}
          />
          <div className="sec-head">
            <h1 className="disp sec-h">
              Cancellation &amp; <span className="ser">Refunds</span>
            </h1>
            <p className="sec-no">FILE — MONEY BACK, AND WHEN NOT</p>
          </div>
          <div className="lpane on">
            <RefundPane level="h2" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
