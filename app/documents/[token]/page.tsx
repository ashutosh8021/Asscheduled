import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import UploadForm from "./UploadForm";
import { listDocuments, resolveUploadToken, type DocumentKind } from "@/lib/documents";
import { getDeparture, DEPARTURES } from "@/lib/departures";

/* The document upload page for an accepted applicant.

   Never indexed and never cached: it is addressed by a secret, and a
   copy of it in a search index or a CDN would defeat the point. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your documents · AS SCHEDULED",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const target = await resolveUploadToken(token);

  if (!target) {
    return (
      <Shell>
        <section
          className="s-wrap"
          style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(60px,9vw,110px)" }}
        >
          <p className="s-eyebrow s-eyebrow-grey">DOCUMENTS</p>
          <h1 className="s-h2" style={{ marginTop: 14, fontSize: "clamp(34px,5.4vw,64px)" }}>
            THIS LINK
            <br />
            NO LONGER WORKS<span className="s-dot">.</span>
          </h1>
          <p className="s-body" style={{ marginTop: 24 }}>
            Upload links expire, and they stop working if an acceptance is withdrawn. If you think
            this one should still be live, reply to the message we sent you and we will issue
            another.
          </p>
        </section>
      </Shell>
    );
  }

  const departure =
    getDeparture(
      DEPARTURES.find((d) => d.id === target.departure_code)?.slug ?? ""
    ) ?? null;

  const already = (await listDocuments(target.id)).map((d) => d.kind) as DocumentKind[];

  return (
    <Shell>
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(60px,9vw,110px)" }}
      >
        <p className="s-eyebrow s-eyebrow-grey">
          {target.reference}
          {departure ? ` — ${departure.fest}, ${departure.campus}` : ""}
        </p>

        <h1 className="s-h2" style={{ marginTop: 14, fontSize: "clamp(34px,5.4vw,64px)" }}>
          {target.name.split(" ")[0]?.toUpperCase()},
          <br />
          YOU&apos;RE IN<span className="s-dot">.</span>
        </h1>

        <div style={{ maxWidth: 620, marginTop: 26 }}>
          <p className="s-body">
            Two documents and we can book your travel. Your ID has to match the name on the ticket,
            which is why we need it; the college ID confirms you are a student.
          </p>
          <p className="s-body" style={{ marginTop: 14 }}>
            These are stored privately, are never shown on the site, and are deleted after the trip
            ends. You can ask us to delete them sooner.
          </p>
        </div>

        <div style={{ maxWidth: 620, marginTop: 34 }}>
          <UploadForm token={token} already={already} />
        </div>
      </section>
    </Shell>
  );
}
