import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { activateCrew, setCrewStatus, CREW_STATUSES, type CrewStatus } from "@/lib/crew";

/* Manage Crew from the admin panel: activate somebody, or pause,
 * decline and reinstate them.
 *
 * currentAdmin, not currentViewer. A festival partner can read the
 * roster for their own departure; issuing a credential that earns money
 * is not theirs to do.
 *
 * ACTIVATE returns the code and the passcode in the response, and that
 * is the only time either exists in readable form — only their hashes
 * are stored. Which means this response must not be logged: the
 * console line below deliberately names the code and not the passcode. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  const src = body as Record<string, unknown>;
  const id = typeof src.id === "string" ? src.id : "";
  const action = typeof src.action === "string" ? src.action : "";

  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

  if (action === "activate") {
    const issued = await activateCrew(id);
    if (!issued) {
      return NextResponse.json({ ok: false, error: "Could not activate." }, { status: 502 });
    }

    console.info(`[admin] ${admin.email} activated crew ${id} as ${issued.code}`);

    return NextResponse.json({ ok: true, code: issued.code, passcode: issued.passcode });
  }

  if (CREW_STATUSES.includes(action as CrewStatus)) {
    const ok = await setCrewStatus(id, action as CrewStatus);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Could not update." }, { status: 502 });
    }

    console.info(`[admin] ${admin.email} set crew ${id} → ${action}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
