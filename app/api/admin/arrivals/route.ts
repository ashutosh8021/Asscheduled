import { NextResponse } from "next/server";
import { currentViewer } from "@/lib/admin";
import { arrivalCounts } from "@/lib/adminData";

/* How many applications and enquiries there are right now.
 *
 * Polled by the panels so an open tab notices something arriving. It
 * exists because the notification emails currently go to an inbox
 * nobody can read — until that is fixed, the panel is the only place a
 * new application shows up, and nobody should have to keep pressing
 * reload to find out.
 *
 * Two numbers and nothing else. No names, no phone numbers, no
 * references: this says THAT something arrived, never what. Anyone who
 * should see the detail opens the panel, which checks the session
 * again and scopes the rows properly.
 *
 * Scoped by the viewer, never by the request. A partner is counted
 * against their own departures — the count must not reveal that
 * something exists which they would not be allowed to open. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await currentViewer();
  if (!viewer) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  /* Admin sees everything, so it counts everything — including
     enquiries about no departure, which a partner never sees. */
  const counts = await arrivalCounts(viewer.role === "admin" ? null : viewer.departures);

  return NextResponse.json({ ok: true, ...counts });
}
