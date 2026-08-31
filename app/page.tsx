import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import HomeHero from "@/components/as/HomeHero";
import HomeSections from "@/components/as/home/HomeSections";
import { DEPARTURES } from "@/lib/departures";
import { effectivePrice, type EffectivePrice } from "@/lib/partners";
import { HOME } from "@/lib/copy";
import { abs } from "@/lib/site";

export const metadata: Metadata = {
  title: "AS SCHEDULED — The next story is somewhere else",
  description:
    "College fests. New cities. New faces. A few days outside the usual programming. Pulse at AIIMS Delhi and Thomso at IIT Roorkee, all inclusive.",
  alternates: { canonical: abs("/") },
  openGraph: {
    title: "AS SCHEDULED — The next story is somewhere else",
    description: "We bring people, culture, and stories you will tell later.",
    url: abs("/"),
  },
};

export default async function HomePage() {
  /* List price, deliberately undiscounted.
​
     The coupon is applied at the payment step, not while browsing —
     so every price on the way in is the list price, and the ₹1,000
     comes off once, in front of the QR, where it can be seen
     happening. Passing null here is what switches the strikethrough
     and the badge off everywhere downstream. */
  const pricing: Record<string, EffectivePrice> = {};
  for (const d of DEPARTURES) {
    pricing[d.id] = effectivePrice(d.price, d.priceMax, null);
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
