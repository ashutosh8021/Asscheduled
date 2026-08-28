import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import HomeHero from "@/components/as/HomeHero";
import HomeSections from "@/components/as/home/HomeSections";
import { cookies } from "next/headers";
import { DEPARTURES } from "@/lib/departures";
import { effectivePrice, resolvePartner, PARTNER_COOKIE, type EffectivePrice } from "@/lib/partners";
import { HOME } from "@/lib/copy";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "AS SCHEDULED — The next story is somewhere else",
  description:
    "College fests. New cities. New faces. A few days outside the usual programming. Rendezvous at IIT Delhi and Thomso at IIT Roorkee, all inclusive.",
  alternates: { canonical: abs("/") },
  openGraph: {
    title: "AS SCHEDULED — The next story is somewhere else",
    description: "We bring people, culture, and stories you will tell later.",
    url: abs("/"),
  },
};

export default async function HomePage() {
  /* Resolved here so the card price matches the departure page. Showing
     a discount on one and not the other is worse than showing neither —
     a price that changes as you click through is the kind of thing that
     makes people stop trusting the number. */
  const jar = await cookies();
  const partnerCode = jar.get(PARTNER_COOKIE)?.value;
  const pricing: Record<string, EffectivePrice> = {};
  for (const d of DEPARTURES) {
    pricing[d.id] = effectivePrice(d.price, d.priceMax, resolvePartner(partnerCode, d.id));
  }

  return (
    /* Not overHero any more: the hero is no longer a full-bleed image
       for the header to float over, so it needs its own space. */
    <Shell ticker={HOME.ticker}>
      <HomeHero />
      <HomeSections pricing={pricing} />
    </Shell>
  );
}
