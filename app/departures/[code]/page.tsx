import { redirect, notFound } from "next/navigation";
import { TRIPS, getTrip } from "@/lib/trips";

export function generateStaticParams() {
  return TRIPS.map((t) => ({ code: t.id }));
}

/* Legacy route. The experience detail page moved to /trips/[slug] with the
   build spec §14 architecture; keep old links alive rather than 404 them. */
export default async function LegacyDeparture({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const trip = getTrip(code);
  if (!trip) notFound();
  redirect(`/trips/${trip.slug}`);
}
