/* The archive — real photography from trips that actually happened.
   Nothing here is stock, and nothing is staged for the website.

   Files live in /public/img/gallery, processed from the originals in
   /asset/Gallery with EXIF stripped (the originals carry GPS and device
   data that has no business being published).

   ⚠ These photographs show identifiable people. Publishing them needs
   the consent of everyone recognisable in them.
   TODO(mannat): confirm consent for the group shots before launch. Any
   frame that has not been cleared should be deleted from this array —
   the components render whatever is here and nothing more. */

import type { Slot } from "./departures";

/** Landscape frames — better in wide tiles and the homepage rail. */
export const GALLERY_WIDE: Slot[] = [
  {
    src: "/img/gallery/mainstage-group.jpg",
    alt: "The group in front of the main stage at night, lights fanning out behind them",
    label: "MAIN STAGE",
  },
  {
    src: "/img/gallery/pronite-group.jpg",
    alt: "Everyone dressed up on the last night of the fest",
    label: "PRONITE",
  },
  {
    src: "/img/gallery/gurudwara-group.jpg",
    alt: "The whole group on the marble courtyard of a gurudwara, heads covered",
    label: "GURUDWARA",
  },
  {
    src: "/img/gallery/fest-ground-group.jpg",
    alt: "The group on the fest ground with the crowd stretching out behind",
    label: "FEST GROUND",
  },
  {
    src: "/img/gallery/gurudwara-night.jpg",
    alt: "A gurudwara complex lit up after dark",
    label: "AFTER DARK",
  },
];

/* Named frames.

   Referenced by name rather than array index: About and FAQs pull
   specific photographs out of here, and an index silently points at a
   different picture the moment the running order changes. */
export const F = {
  climb: { src: "/img/gallery/misty-steps.jpg", alt: "The group climbing stone steps into a misty forest", label: "THE CLIMB" },
  walk: { src: "/img/gallery/hill-walk.jpg", alt: "Four of them walking a sunlit hill road, one with an arm up", label: "THE WALK" },
  evening: { src: "/img/gallery/living-room.jpg", alt: "The group sprawled around a living room at night, one on a guitar, one singing", label: "THE EVENING" },
  viewpoint: { src: "/img/gallery/viewpoint-group.jpg", alt: "The group at a hill viewpoint at golden hour, cameras out", label: "THE VIEWPOINT" },
  arriving: { src: "/img/gallery/luggage-night.jpg", alt: "Wheeling suitcases along a road at night, arriving", label: "ARRIVING" },
  arriving2: { src: "/img/gallery/arrival-night.jpg", alt: "The group wheeling suitcases along a road after dark", label: "ARRIVING II" },
  humour: { src: "/img/gallery/moodi-rahul.jpg", alt: "Stand-up at the fest, performer alone on a wide stage", label: "HUMOUR FEST" },
  cafe: { src: "/img/gallery/cafe-dusk.jpg", alt: "A small café with red shutters, lit up at dusk", label: "THE CAFÉ" },
  campus: { src: "/img/gallery/campus-road.jpg", alt: "An empty tree-lined campus road in the early morning", label: "CAMPUS" },
  train: { src: "/img/gallery/uno-train.jpg", alt: "A hand of UNO cards on a train berth, mid-game", label: "THE TRAIN" },
  proniteStage: { src: "/img/gallery/pronite-singer.jpg", alt: "A singer on the pronite stage under blue light", label: "PRONITE STAGE" },
  comedy: { src: "/img/gallery/moodi-duo.jpg", alt: "A comedy set in progress, the act's names filling the screen behind", label: "COMEDY" },
  standup: { src: "/img/gallery/moodi-solanki.jpg", alt: "A comedian mid-set, the backdrop lit purple", label: "STAND-UP" },
  show: { src: "/img/gallery/comedy-stage.jpg", alt: "Performers dancing on stage during a live show", label: "THE SHOW" },
  valley: { src: "/img/gallery/valley-rocks.jpg", alt: "A hazy valley seen from a rocky ridge", label: "THE VALLEY" },
  edge: { src: "/img/gallery/valley-shack.jpg", alt: "A green-roofed shack perched on a hillside above a deep valley", label: "THE EDGE" },
  iitg: { src: "/img/gallery/iitg-building.jpg", alt: "The main building at IIT Guwahati, a cyclist passing in front", label: "IIT GUWAHATI" },
  gate: { src: "/img/gallery/iitg-gate.jpg", alt: "The stone entrance gate of IIT Guwahati under heavy trees", label: "THE GATE" },
  stay: { src: "/img/gallery/towers-night.jpg", alt: "Apartment towers lit up against a black sky", label: "THE STAY" },
  hall: { src: "/img/gallery/moodi-duo-wide.jpg", alt: "The comedy stage from the back of the hall", label: "THE HALL" },
  iitb: { src: "/img/gallery/iitb-sign.jpg", alt: "The Indian Institute of Technology Bombay entrance sign", label: "IIT BOMBAY" },
} satisfies Record<string, Slot>;

/** Portrait frames. The first EIGHT feed the gallery hero, so the order
 *  matters: people first, one frame per subject, and never two shots of
 *  the same moment — the two night-arrival frames read as one photo at a
 *  glance, so only one is up there. */
export const GALLERY_TALL: Slot[] = [
  F.climb, F.walk, F.evening, F.viewpoint, F.arriving, F.humour, F.cafe, F.campus,
  /* archive only, below the fold */
  F.arriving2, F.train, F.proniteStage, F.comedy, F.standup, F.show,
  F.valley, F.edge, F.iitg, F.gate, F.stay, F.hall, F.iitb,
];

/* ------------------------------------------------------------------
   PAST TRIPS

   Trips that actually ran. Attribution comes from the folder each photo
   arrived in (/asset/IITBMOODindigo, /asset/IITG), not from guesswork.

   `when` and `travellers` are null wherever they have not been
   confirmed — CLAUDE.md records Alcheringa as 70 pax and gives no date,
   and nothing is recorded for Mood Indigo. The UI omits whatever is
   null rather than inventing it.
   TODO(mannat): dates and traveller counts for both.
   ------------------------------------------------------------------ */

/** A photo in a trip strip. Landscape frames span two columns so they
 *  are not crushed into a portrait tile. */
export interface PastPhoto extends Slot {
  wide?: boolean;
}

export interface PastClip {
  src: string;
  poster: string;
  label: string;
  alt: string;
}

export interface PastTrip {
  id: string;
  fest: string;
  campus: string;
  city: string;
  /** Display string, e.g. "DEC 2025". Null until confirmed. */
  when: string | null;
  /** How many people travelled. Null until confirmed. */
  travellers: number | null;
  cover: Slot;
  photos: PastPhoto[];
  clips?: PastClip[];
}

export const PAST_TRIPS: PastTrip[] = [
  {
    id: "MOODI-000",
    fest: "MOOD INDIGO",
    campus: "IIT BOMBAY",
    city: "MUMBAI",
    when: null,
    travellers: null,
    cover: {
      src: "/img/gallery/mainstage-group.jpg",
      alt: "The group in front of the Mood Indigo main stage at night",
      label: "MOOD INDIGO — COVER",
    },
    photos: [
      {
        src: "/img/gallery/iitb-sign.jpg",
        alt: "The Indian Institute of Technology Bombay entrance sign",
        label: "IIT BOMBAY",
        /* Landscape 16:9 — a portrait tile would crop it to nothing. */
        wide: true,
      },
      {
        src: "/img/gallery/moodi-solanki.jpg",
        alt: "A comedian mid-set at Mood Indigo's humour fest",
        label: "HUMOUR FEST",
      },
      {
        src: "/img/gallery/moodi-rahul.jpg",
        alt: "Stand-up at Mood Indigo, performer alone on a wide stage",
        label: "STAND-UP",
      },
      {
        src: "/img/gallery/moodi-duo.jpg",
        alt: "A double act on stage at Mood Indigo",
        label: "THE DOUBLE ACT",
      },
      {
        src: "/img/gallery/comedy-stage.jpg",
        alt: "Performers dancing on stage during a live show at Mood Indigo",
        label: "THE SHOW",
      },
      {
        src: "/img/gallery/moodi-duo-wide.jpg",
        alt: "The Mood Indigo comedy stage seen from the back of the hall",
        label: "THE HALL",
      },
      /* Attribution inferred from content, not from the folder: same
         outdoor stage, same night, same crowd as the confirmed frames.
         TODO(mannat): confirm these three are Mood Indigo. */
      {
        src: "/img/gallery/pronite-group.jpg",
        alt: "Everyone dressed up on the last night of the fest",
        label: "PRONITE",
        wide: true,
      },
      {
        src: "/img/gallery/fest-ground-group.jpg",
        alt: "The group on the fest ground, the crowd stretching out behind",
        label: "FEST GROUND",
        wide: true,
      },
    ],
    clips: [
      {
        src: "/video/moodi/jets.mp4",
        poster: "/video/moodi/jets.jpg",
        label: "MAIN STAGE",
        alt: "CO2 jets firing over the crowd at the Mood Indigo main stage",
      },
      {
        src: "/video/moodi/pronite.mp4",
        poster: "/video/moodi/pronite.jpg",
        label: "PRONITE",
        alt: "A performer on the pronite stage at IIT Bombay",
      },
      {
        src: "/video/moodi/stage.mp4",
        poster: "/video/moodi/stage.jpg",
        label: "THE SET",
        alt: "A wide view of the lit stage during a set",
      },
    ],
  },
  {
    id: "ALCH-000",
    fest: "ALCHERINGA",
    campus: "IIT GUWAHATI",
    city: "GUWAHATI",
    when: null,
    /* CLAUDE.md: "Trip 000 (Alcheringa, 70 pax) is the only past
       record." The one number we actually have. */
    travellers: 70,
    cover: {
      src: "/img/gallery/iitg-building.jpg",
      alt: "The main building at IIT Guwahati, a cyclist passing in front",
      label: "ALCHERINGA — COVER",
    },
    photos: [
      {
        src: "/img/gallery/iitg-gate.jpg",
        alt: "The stone entrance gate of IIT Guwahati under heavy trees",
        label: "THE GATE",
      },
      {
        src: "/img/gallery/luggage-night.jpg",
        alt: "Wheeling suitcases along a road at night, arriving in Guwahati",
        label: "ARRIVAL",
      },
      {
        src: "/img/gallery/campus-road.jpg",
        alt: "An empty tree-lined campus road in the early morning",
        label: "CAMPUS",
      },
      {
        src: "/img/gallery/cafe-dusk.jpg",
        alt: "A small café with red shutters, lit up at dusk",
        label: "THE CAFÉ",
      },
      /* Inferred, not from the folder: the hill frames read as the
         Meghalaya side trip out of Guwahati, and the train game as the
         journey there. TODO(mannat): confirm. */
      {
        src: "/img/gallery/uno-train.jpg",
        alt: "A hand of UNO cards on a train berth, mid-game",
        label: "THE TRAIN",
      },
      {
        src: "/img/gallery/valley-rocks.jpg",
        alt: "A hazy valley seen from a rocky ridge",
        label: "THE VALLEY",
      },
      {
        src: "/img/gallery/valley-shack.jpg",
        alt: "A green-roofed shack perched on a hillside above a deep valley",
        label: "THE EDGE",
      },
      {
        src: "/img/gallery/misty-steps.jpg",
        alt: "The group climbing stone steps into a misty forest",
        label: "THE CLIMB",
      },
      {
        src: "/img/gallery/hill-walk.jpg",
        alt: "Four of them walking a sunlit hill road, one with an arm up",
        label: "THE WALK",
      },
      {
        src: "/img/gallery/arrival-night.jpg",
        alt: "The group wheeling suitcases along a road after dark",
        label: "ARRIVING",
      },
      {
        src: "/img/gallery/living-room.jpg",
        alt: "The group sprawled around a living room at night, one on a guitar, one singing",
        label: "THE EVENING",
      },
    ],
  },
];

/** Everything, newest-feeling first — used by the archive grid. */
export const GALLERY_ALL: Slot[] = [
  GALLERY_WIDE[0],
  GALLERY_TALL[0],
  GALLERY_TALL[1],
  GALLERY_WIDE[1],
  GALLERY_TALL[2],
  GALLERY_TALL[7],
  GALLERY_WIDE[2],
  GALLERY_TALL[3],
  GALLERY_TALL[9],
  GALLERY_WIDE[3],
  GALLERY_TALL[8],
  GALLERY_TALL[10],
  GALLERY_TALL[11],
  GALLERY_WIDE[4],
  GALLERY_TALL[4],
  GALLERY_TALL[12],
  GALLERY_TALL[5],
  GALLERY_TALL[13],
  GALLERY_TALL[6],
  GALLERY_TALL[14],
];
