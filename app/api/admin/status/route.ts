import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/admin";
import { setApplicationStatus, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/adminData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Move an application between new / reviewing / accepted / declined.

   The admin check is first and non-negotiable: this route writes with
   the service role key, which bypasses row level security entirely. */

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
  const status = typeof src.status === "string" ? src.status : "";

  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    return NextResponse.json({ ok: false, error: "Unknown status." }, { status: 400 });
  }

  const ok = await setApplicationStatus(id, status as ApplicationStatus);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Could not update." }, { status: 502 });
  }

  console.info(`[admin] ${admin.email} set ${id} → ${status}`);
  return NextResponse.json({ ok: true });
}
