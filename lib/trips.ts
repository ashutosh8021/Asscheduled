/* Trip data — single source of truth. Ported verbatim from
   reference/as-scheduled-v4.html. Never hardcode prices, seats,
   or dates anywhere else. */

export interface DayPlan {
  n: string;
  t: string;
  blocks: [string, string][];
  stay: string;
}

/* A package tier for the Package Selector (build spec §22). No tiers are
   defined yet — pricing per tier is an open item, and inventing them is
   forbidden. The type exists so the selector can be built against it. */
export interface TripPackage {
  id: string;
  name: string;
  price: number;
  recommended?: boolean;
  /* Only what materially differs from the base inclusions. */
  differences: string[];
}

/* Image slot. `src` stays null until real, approved photography exists;
   components render a labelled placeholder instead. Never fill with stock. */
export interface ImageSlot {
  src: string | null;
  alt: string;
  /* Shown inside the placeholder so it's obvious what belongs here. */
  label: string;
  credit?: string;
}

export interface Trip {
  id: string;
  /* URL segment for /trips/[slug]. */
  slug: string;
  fest: string;
  campus: string;
  city: string;
  win: string;
  days: number;
  seats: number;
  filled: number;
  price: number;
  close: string;
  status: "BOARDING" | "CLOSED";
  stayBase: string;
  itin: DayPlan[];
  inc: string[];
  exc: string[];
  /* Merchandising rails — build spec §6, §7, §8. Driven by real data only:
     `almostFull` is computed from seats, never hand-set to fake urgency. */
  mostWanted?: boolean;
  /* One-line editorial hook for cards and hero. */
  hook: string;
  hero: ImageSlot;
  card: ImageSlot;
  packages: TripPackage[];
}

/* Build spec §8: genuine availability only. A departure is "almost full"
   when 4 or fewer of its seats remain. */
export const ALMOST_FULL_THRESHOLD = 4;

export function seatsLeft(t: Trip): number {
  return t.seats - t.filled;
}

export function isAlmostFull(t: Trip): boolean {
  return t.status === "BOARDING" && seatsLeft(t) > 0 && seatsLeft(t) <= ALMOST_FULL_THRESHOLD;
}

export function upcomingTrips(): Trip[] {
  return TRIPS.filter((t) => t.status === "BOARDING").sort(
    (a, b) => new Date(a.close).getTime() - new Date(b.close).getTime()
  );
}

export function mostWantedTrips(): Trip[] {
  return TRIPS.filter((t) => t.mostWanted);
}

export function almostFullTrips(): Trip[] {
  return TRIPS.filter(isAlmostFull);
}

export const TRIPS: Trip[] = [
  {
    id: "PUL-01", slug: "pulse-aiims-delhi",
    fest: "PULSE", campus: "AIIMS DELHI", city: "NEW DELHI",
    hook: "Delhi's medical campus throws the party. The old city handles everything after it.",
    hero: { src: null, alt: "Pulse, AIIMS Delhi", label: "HERO — PUL-01 / 000_HERO.JPG" },
    card: { src: null, alt: "Pulse, AIIMS Delhi", label: "CARD — PUL-01" },
    // TODO(mannat): confirm package tiers and their prices — none invented.
    packages: [],
    win: "SEP 2026 — TRACKS FEST ANNOUNCEMENT", days: 6, seats: 19, filled: 0,
    price: 14999, close: "2026-08-20T23:59:00+05:30", status: "BOARDING",
    stayBase: "South Delhi, verified 3★ twin-share — exact property named in your selection file",
    itin: [
      { n: "01", t: "ARRIVAL — ROLL CALL", blocks: [
        ["BY 15:00", "Boarding hubs converge on Delhi. AC travel, seats assigned, strangers pretending to nap."],
        ["17:00", "Check-in, South Delhi base. Keys, kit, trip journal issued."],
        ["19:30", "Briefing dinner. Nineteen names, two crew, one schedule. Phones exchanged, excuses surrendered."],
        ["22:00", "Rooftop, first night. Nothing planned. That's the plan."]],
        stay: "NIGHT 01 — base hotel, South Delhi" },
      { n: "02", t: "PULSE — DAY ONE", blocks: [
        ["09:00", "Breakfast at base. Non-negotiable; the day is long."],
        ["11:00", "AIIMS campus entry — informals, stalls, comps circuit. Move as a pack or don't; Captain tracks both."],
        ["17:00", "Regroup, refuel. Dinner near campus, table for twenty-one."],
        ["20:00", "Pronite one. Front-third of the crowd or nothing."]],
        stay: "NIGHT 02 — base hotel, South Delhi" },
      { n: "03", t: "PULSE — FINALS NIGHT", blocks: [
        ["10:30", "Slow breakfast. Recovery is scheduled too."],
        ["12:30", "Pulse finals — comps, fashion walk, the good chaos."],
        ["19:30", "Headline night. Whoever it is, you're close enough to argue setlists after."],
        ["00:30", "Late run: parathas somewhere that never closes. Sealed location."]],
        stay: "NIGHT 03 — base hotel, South Delhi" },
      { n: "04", t: "OLD DELHI LEDGER", blocks: [
        ["08:30", "Metro to Chandni Chowk before the city fully wakes."],
        ["09:30", "Food ledger, executed in order: nihari, bedmi, daulat ki chaat, jalebi. Vegetarian line runs parallel, equally serious."],
        ["13:00", "Jama Masjid steps. Sit. Look. No commentary provided."],
        ["16:30", "Sunder Nursery till golden hour. Film cameras out."],
        ["20:00", "Dinner, Nizamuddin side. Evening plan: sealed."]],
        stay: "NIGHT 04 — base hotel, South Delhi" },
      { n: "05", t: "SOUTH SIDE — LODHI TO CP", blocks: [
        ["10:00", "Lodhi Garden and Lodhi Art District walls. Shoot everything."],
        ["13:00", "Khan Market lunch — one splurge, budget protected elsewhere."],
        ["16:00", "Hauz Khas fort, lake, ruins at sundown."],
        ["20:30", "Connaught Place after dark. Inner circle on foot, midnight ice cream mandatory."]],
        stay: "NIGHT 05 — base hotel, South Delhi" },
      { n: "06", t: "DEPARTURE, AS SCHEDULED", blocks: [
        ["07:30", "Majnu ka Tilla breakfast run — laphing, butter tea, last film frames."],
        ["11:00", "Pack-out, journal page due, group photo nobody smiles properly in."],
        ["13:00", "Return travel to boarding hubs. Six days, on record."]],
        stay: "— return leg, AC travel to hubs" }
    ],
    inc: ["Intercity travel, both ways — boarding hubs announced post-selection", "Pulse fest access all days", "5 nights verified 3★ stay, twin-share", "All meals — breakfast, lunch, dinner, daily", "Every local transfer and metro card", "Director + dedicated Trip Captain on ground", "First-aid, SOS protocol, guardian contact on file", "Trip journal, issued day one"],
    exc: ["Sleep — optional, statistically unlikely", "Personal shopping and merch damage", "Travel insurance (offered at payment — take it)", "Laundry, room service ambitions", "Your excuses on day six", "Anything the Trip Captain vetoes"]
  },
  {
    id: "REN-02", slug: "rendezvous-iit-delhi",
    fest: "RENDEZVOUS", campus: "IIT DELHI", city: "NEW DELHI",
    hook: "Five nights off Hauz Khas, and a fest that takes the whole campus hostage.",
    hero: { src: null, alt: "Rendezvous, IIT Delhi", label: "HERO — REN-02 / 000_HERO.JPG" },
    card: { src: null, alt: "Rendezvous, IIT Delhi", label: "CARD — REN-02" },
    packages: [],
    // TODO(mannat): confirm which departures are MOST WANTED — editorial call, not data.
    mostWanted: true,
    win: "OCT 2026 — TRACKS FEST ANNOUNCEMENT", days: 6, seats: 19, filled: 0,
    price: 15999, close: "2026-09-20T23:59:00+05:30", status: "BOARDING",
    stayBase: "Hauz Khas side, verified 3★ twin-share — walking-ish distance to IIT gate",
    itin: [
      { n: "01", t: "ARRIVAL — ROLL CALL", blocks: [
        ["BY 15:00", "Boarding hubs converge on Delhi. AC travel, both ways covered."],
        ["17:00", "Check-in near Hauz Khas. Kit and journal issued."],
        ["19:30", "Briefing dinner. The schedule gets read aloud once. Only once."],
        ["21:30", "Deer Park night walk. Delhi at its quietest, briefly."]],
        stay: "NIGHT 01 — base hotel, Hauz Khas side" },
      { n: "02", t: "RENDEZVOUS — DAY ONE", blocks: [
        ["09:00", "Breakfast, then IIT Delhi gates. Campus circuit, comps, informals."],
        ["14:00", "Lunch inside — mess-adjacent, character-building."],
        ["17:00", "Golden hour on campus lawns. The good light is scheduled."],
        ["20:00", "Pronite one. Position: close."]],
        stay: "NIGHT 02 — base hotel, Hauz Khas side" },
      { n: "03", t: "RENDEZVOUS — HEADLINE NIGHT", blocks: [
        ["10:30", "Late breakfast. Earned."],
        ["12:30", "Finals circuit — battle rounds, fashion, whatever survives the schedule."],
        ["19:30", "Headline act. Full send."],
        ["00:30", "Post-show food run. Location sealed, quality guaranteed."]],
        stay: "NIGHT 03 — base hotel, Hauz Khas side" },
      { n: "04", t: "MEHRAULI FILE", blocks: [
        ["09:30", "Mehrauli Archaeological Park — ruins older than every problem you have."],
        ["12:30", "Champa Gali lanes: coffee, film rolls, unreasonable café orders."],
        ["16:30", "Qutub complex at slant light."],
        ["20:00", "Dinner, then a sealed evening plan. Wear something decent."]],
        stay: "NIGHT 04 — base hotel, Hauz Khas side" },
      { n: "05", t: "NORTH SIDE — CAMPUS TO MIDNIGHT", blocks: [
        ["10:30", "North Campus + Kamla Nagar — the other college universe, studied from a safe distance."],
        ["14:00", "Majnu ka Tilla lunch: laphing, shapta, butter tea."],
        ["17:30", "Civil Lines drift, old bungalow streets."],
        ["21:00", "Connaught Place inner circle after dark. Midnight ice cream, standard issue."]],
        stay: "NIGHT 05 — base hotel, Hauz Khas side" },
      { n: "06", t: "DEPARTURE, AS SCHEDULED", blocks: [
        ["07:00", "Sunder Nursery sunrise — last frames, quiet ones."],
        ["10:30", "Pack-out, journal page due, the group photo."],
        ["13:00", "Return travel to boarding hubs. File closes."]],
        stay: "— return leg, AC travel to hubs" }
    ],
    inc: ["Intercity travel, both ways — boarding hubs announced post-selection", "Rendezvous fest access all days", "5 nights verified 3★ stay, twin-share", "All meals — three a day, daily", "Every local transfer and metro card", "Director + dedicated Trip Captain on ground", "First-aid, SOS protocol, guardian contact on file", "Trip journal, issued day one"],
    exc: ["Sleep — see day three", "Personal shopping and merch damage", "Travel insurance (offered at payment — take it)", "Laundry and other fantasies", "Your excuses on day six", "Anything the Trip Captain vetoes"]
  },
  {
    id: "ANT-03", slug: "antaragni-iit-kanpur",
    fest: "ANTARAGNI", campus: "IIT KANPUR", city: "KANPUR + LUCKNOW",
    hook: "Kanpur for the fire. Lucknow for everything that comes after it.",
    hero: { src: null, alt: "Antaragni, IIT Kanpur", label: "HERO — ANT-03 / 000_HERO.JPG" },
    card: { src: null, alt: "Antaragni, IIT Kanpur", label: "CARD — ANT-03" },
    packages: [],
    win: "OCT–NOV 2026 — TRACKS FEST ANNOUNCEMENT", days: 6, seats: 19, filled: 0,
    // TODO(mannat): confirm Antaragni price — ₹16,999 assumed, unconfirmed per CLAUDE.md
    price: 16999, close: "2026-10-01T23:59:00+05:30", status: "BOARDING",
    stayBase: "Kanpur nights 1–3 near IIT; Lucknow nights 4–5, Hazratganj side — both verified, twin-share",
    itin: [
      { n: "01", t: "ARRIVAL — KANPUR BASE", blocks: [
        ["BY 15:00", "Boarding hubs converge on Kanpur. AC travel, both ways covered."],
        ["17:00", "Check-in near IIT Kanpur. Kit, journal, ground rules."],
        ["19:30", "Briefing dinner. Antaragni map studied like an exam nobody will pass."]],
        stay: "NIGHT 01 — base hotel, Kanpur" },
      { n: "02", t: "ANTARAGNI — DAY ONE", blocks: [
        ["09:00", "Breakfast, campus entry. One of India's oldest cultural fests — comps, quizzes, dram circuit."],
        ["14:00", "Lunch inside campus. Regroup at the flagpole, obviously."],
        ["20:00", "Pronite one. Kanpur shows up loud."]],
        stay: "NIGHT 02 — base hotel, Kanpur" },
      { n: "03", t: "ANTARAGNI — FINALS NIGHT", blocks: [
        ["10:30", "Recovery breakfast."],
        ["12:30", "Finals day — battle of bands, fashion walk, closing comps."],
        ["19:30", "Headline night. Last one in Kanpur, act accordingly."]],
        stay: "NIGHT 03 — base hotel, Kanpur" },
      { n: "04", t: "THE LUCKNOW LEG", blocks: [
        ["09:00", "Check-out, AC transfer to Lucknow — 90-ish minutes, expressway."],
        ["11:30", "Bara Imambara + the bhulbhulaiya labyrinth. Getting lost: scheduled."],
        ["14:00", "Chowk lunch — galouti at the old houses; vegetarian line equally historic."],
        ["17:30", "Rumi Darwaza to Gomti riverfront at dusk."],
        ["20:30", "Hazratganj evening. Sealed plan follows."]],
        stay: "NIGHT 04 — hotel, Hazratganj side, Lucknow" },
      { n: "05", t: "LUCKNOW — SLOW FILE", blocks: [
        ["10:00", "Residency ruins, quiet morning, film light."],
        ["13:00", "Tunday and company — the lunch this leg exists for."],
        ["16:00", "Chikankari lanes; buy one thing, argue about three."],
        ["19:00", "Ganjing till late. Kulfi as punctuation."]],
        stay: "NIGHT 05 — hotel, Hazratganj side, Lucknow" },
      { n: "06", t: "DEPARTURE, AS SCHEDULED", blocks: [
        ["08:30", "Last breakfast, pack-out, journal page due."],
        ["11:00", "Group photo at Rumi Darwaza — the cliché is mandatory."],
        ["13:00", "Return travel to boarding hubs. File closes."]],
        stay: "— return leg, AC travel to hubs" }
    ],
    inc: ["Intercity travel, both ways — boarding hubs announced post-selection", "Antaragni fest access all days", "5 nights verified stay, twin-share — Kanpur + Lucknow", "All meals — three a day, including the famous ones", "Kanpur–Lucknow transfer and every local move", "Director + dedicated Trip Captain on ground", "First-aid, SOS protocol, guardian contact on file", "Trip journal, issued day one"],
    exc: ["Sleep — Kanpur pronites disagree with it", "Chikankari budget overruns", "Travel insurance (offered at payment — take it)", "Laundry, ironing dreams", "Your excuses on day six", "Anything the Trip Captain vetoes"]
  },
  {
    id: "OAS-04", slug: "oasis-bits-pilani",
    fest: "OASIS", campus: "BITS PILANI", city: "PILANI + JAIPUR",
    hook: "A desert campus, a painted town, and the pink city on the way home.",
    hero: { src: null, alt: "Oasis, BITS Pilani", label: "HERO — OAS-04 / 000_HERO.JPG" },
    card: { src: null, alt: "Oasis, BITS Pilani", label: "CARD — OAS-04" },
    packages: [],
    mostWanted: true,
    win: "OCT–NOV 2026 — TRACKS FEST ANNOUNCEMENT", days: 6, seats: 19, filled: 0,
    price: 24999, close: "2026-10-01T23:59:00+05:30", status: "BOARDING",
    stayBase: "Pilani nights 1–3 fest-adjacent verified stay; night 4 heritage haveli, Shekhawati; night 5 Jaipur, walled-city side",
    itin: [
      { n: "01", t: "ASSEMBLY — THE DESERT RUN", blocks: [
        ["BY 09:00", "Assembly at Delhi hub (travel to Delhi from other hubs covered). Private AC coach rolls."],
        ["13:00", "Highway lunch stop, Rajasthan begins looking like Rajasthan."],
        ["16:00", "Pilani check-in, fest-adjacent stay. Kit and journal issued."],
        ["19:30", "Briefing dinner under actual stars. City people confused, briefly."]],
        stay: "NIGHT 01 — fest-adjacent verified stay, Pilani" },
      { n: "02", t: "OASIS — DAY ONE", blocks: [
        ["09:00", "Breakfast, BITS campus entry. Oasis: the cult one."],
        ["12:00", "Comps circuit — quizzing royalty, dram, the works."],
        ["20:00", "Pronite one. Desert cold, crowd hot; jacket issued in kit."]],
        stay: "NIGHT 02 — fest-adjacent verified stay, Pilani" },
      { n: "03", t: "OASIS — HEADLINE NIGHT", blocks: [
        ["10:30", "Slow morning. Campus wander, clock tower shots."],
        ["13:00", "Finals afternoon — battle rounds, fashion, closing madness."],
        ["19:30", "Headline night at Oasis. The reason the price tag exists."],
        ["01:00", "Maggi point pilgrimage. Non-optional."]],
        stay: "NIGHT 03 — fest-adjacent verified stay, Pilani" },
      { n: "04", t: "SHEKHAWATI — PAINTED TOWNS", blocks: [
        ["09:00", "Coach to Mandawa — open-air gallery of fresco havelis."],
        ["11:00", "Haveli walk: hundred-year-old walls, absurdly good light."],
        ["14:00", "Rooftop lunch over the old town."],
        ["16:00", "Nawalgarh stop, more frescoes, fewer tourists."],
        ["19:00", "Check-in: heritage haveli stay. Dinner in the courtyard, sealed evening after."]],
        stay: "NIGHT 04 — heritage haveli, Shekhawati" },
      { n: "05", t: "JAIPUR — THE PINK FILE", blocks: [
        ["08:30", "Coach to Jaipur."],
        ["11:00", "Amber Fort — ramparts, mirror hall, one thousand photos."],
        ["14:00", "Walled-city lunch, then Hawa Mahal from the café across."],
        ["17:00", "Nahargarh at sunset — the whole pink city underneath."],
        ["20:30", "Bapu Bazaar drift, lassi, last-night energy. Sealed plan follows."]],
        stay: "NIGHT 05 — hotel, walled-city side, Jaipur" },
      { n: "06", t: "DEPARTURE, AS SCHEDULED", blocks: [
        ["08:00", "Patrika Gate frames, breakfast, pack-out. Journal page due."],
        ["11:00", "Coach to Delhi hub; onward travel to boarding hubs covered."],
        ["18:00", "File closes. Six days, three worlds, on record."]],
        stay: "— return leg, AC coach + onward travel" }
    ],
    inc: ["Travel throughout, both ways — Delhi assembly + private AC coach across Rajasthan", "Oasis fest access all days", "5 nights stay — Pilani + heritage haveli + Jaipur, twin-share", "All meals — three a day, courtyard dinners included", "All fort and monument entries listed", "Director + dedicated Trip Captain on ground", "First-aid, SOS protocol, guardian contact on file", "Trip journal + desert-night jacket in kit"],
    exc: ["Sleep — Oasis pronites plus desert stars, choose", "Bazaar damage in Jaipur", "Travel insurance (offered at payment — take it)", "Camel opinions", "Your excuses on day six", "Anything the Trip Captain vetoes"]
  }
];

export const SOON: [string, string][] = [
  ["THOMSO", "IIT ROORKEE"], ["MOOD INDIGO", "IIT BOMBAY"], ["ALCHERINGA", "IIT GUWAHATI"],
  ["SAARANG", "IIT MADRAS"], ["SUNBURN", "GOA"], ["WAVES", "BITS GOA"],
  ["SPRING FEST", "IIT KHARAGPUR"], ["RIVIERA", "VIT VELLORE"], ["UNMAAD", "IIM BANGALORE"]
];

export function getTrip(code: string): Trip | undefined {
  const key = code.toLowerCase();
  return TRIPS.find((t) => t.id.toLowerCase() === key || t.slug === key);
}
