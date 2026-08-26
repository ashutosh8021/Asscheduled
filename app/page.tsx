import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import HomeHero from "@/components/as/HomeHero";
import HomeSections from "@/components/as/home/HomeSections";
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

export default function HomePage() {
  return (
    /* Not overHero any more: the hero is no longer a full-bleed image
       for the header to float over, so it needs its own space. */
    <Shell ticker={HOME.ticker}>
      <HomeHero />
      <HomeSections />
    </Shell>
  );
}
