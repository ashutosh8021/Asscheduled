import { Suspense } from "react";
import type { Metadata } from "next";
import ApplyClient from "./ApplyClient";

export const metadata: Metadata = {
  alternates: { canonical: "/apply" },
  title: "Form 7A — Application for Selection · AS SCHEDULED",
  description:
    "Nine questions, one photo, four honest minutes. ₹500 application fee, non-refundable. Nineteen seats per departure.",
};

export default function ApplyPage() {
  return (
    /* The form is the entire page, so it needs the main landmark — without
       it /apply had no landmark at all for screen-reader navigation. */
    <main>
      <Suspense>
        <ApplyClient />
      </Suspense>
    </main>
  );
}
