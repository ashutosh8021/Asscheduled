"use client";

import UploadFields from "@/components/as/UploadFields";
import type { DocumentKind } from "@/lib/documentRules";

/* The standalone upload page's form. The behaviour lives in
   UploadFields, which the application overlay uses too — this is only
   here to keep the page's import local and its spacing roomy. */

export default function UploadForm({
  token,
  already,
}: {
  token: string;
  already: DocumentKind[];
}) {
  return <UploadFields token={token} already={already} />;
}
