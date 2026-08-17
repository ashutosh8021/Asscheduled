import type { Metadata } from "next";
import Shell from "@/components/as/Shell";
import HeroVideo from "@/components/as/HeroVideo";
import HomeSections from "@/components/as/home/HomeSections";
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
    <Shell overHero>
      <HeroVideo />
      <HomeSections />
    </Shell>
  );
}
