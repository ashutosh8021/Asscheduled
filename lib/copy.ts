/* ============================================================
   COPY BANK — transcribed from the approved comps in /asset.

   Rule for this file: if a line appears in a comp, it appears here
   verbatim. Where a comp showed a heading but no body (most FAQ
   answers), the body is written in the surface's voice and marked
   NEEDS REVIEW — per CLAUDE.md, 1–2 sentences, flagged, never
   silently invented.
   ============================================================ */

/* The address shown on the contact page and in the footer. Moved off the
   Gmail on 2026-08-18, once asscheduled.com was verified in Resend and
   Google Workspace was receiving — publishing an address that bounces
   loses real enquiries, so this only changed after mail was confirmed
   working in both directions. */
export const CONTACT_EMAIL = "info@asscheduled.com";

/* ---------- HOME ---------- */

export const HOME = {
  heroTitle: "The next story is",
  heroTitleItalic: "somewhere else",
  heroSub: "We bring people, culture, and stories you will tell later.",
  heroCta: "APPLY",

  aboutEyebrow: "AS SCHEDULED",
  /* Comp headline. Profanity is the client's own brand voice —
     TODO(mannat): confirm this ships as written. */
  aboutTitle: "FUCK ORDINARY WEEKENDS",
  /* The comp reads "cultures, cities, culture, and unexpected people" —
     "culture" is duplicated. Corrected here; flag raised for sign-off. */
  aboutBody: "AS SCHEDULED creates experiences where cultures, cities, and unexpected people collide.",
  aboutKicker: "Where the",
  aboutKickerMark: "good shit happens",
  aboutCta: "MORE ABOUT US",

  nowEyebrow: "NOW SCHEDULED",
  nowTitle: "The next few things we are getting into.",
  nowCta: "VIEW UPCOMING ALL",

  galleryTitle: "SOMEONE",
  gallerySub: "a few from our previous trips",

  finalTitle: "STILL HERE ?",
  finalSub: "You might come with us ?",
  finalCta: "APPLY",
} as const;

/* ---------- ABOUT ---------- */

export const ABOUT = {
  eyebrow: "ABOUT US",
  title: "BUILT FOR PEOPLE WHO DON'T DO ORDINARY SHIT.",
  body: [
    "AS SCHEDULED is the go-to platform for students, creators and dreamers who'd rather be at a college fest than in a boring group chat.",
    "We bring the right people together for the wildest college festivals and raw experiences across India.",
    "No touristy tours. No random groups. Just real energy, real people and stories you'll actually remember.",
  ],
  noteA: ["DIFFERENT PEOPLE.", "DIFFERENT STORIES.", "SAME VIBE."],
  ticket: { brand: "AS SCHEDULED.", lines: ["REAL PEOPLE", "REAL PLACES", "REAL STORIES"], est: "estd. 2024" },

  existEyebrow: "WE EXIST TO",
  existTitle: "MAKE SURE YOU DON'T MISS THE DAYS YOU'LL TALK ABOUT",
  existTitleMark: "FOREVER.",
  existList: [
    "For the ones who choose experiences over excuses.",
    "For the ones who'd rather collect moments than things.",
    "For the ones who believe people > places.",
    "For the ones who say yes.",
  ],

  howEyebrow: "HOW IT WORKS",
  how: [
    { n: "01", t: "FIND YOUR PLAN", lines: ["Pick the fest.", "We drop the plan.", "You lock your vibe."] },
    { n: "02", t: "GET SCHEDULED", lines: ["Apply. Get approved.", "Lock your spot.", "We handle the rest."] },
    { n: "03", t: "SHOW UP & LIVE IT", lines: ["Reach the fest.", "Meet your people.", "Make it a story."] },
  ],

  vibeEyebrow: "OUR VIBE",
  vibe: [
    { t: "REAL > FAKE", lines: ["No filters.", "No pretence.", "All real."] },
    { t: "ENERGY MATCH", lines: ["We bring the right", "kinds of people", "together."] },
    { t: "CULTURE FIRST", lines: ["Fests. Cities.", "Local vibe.", "Always."] },
    { t: "SAFETY LOCKED", lines: ["Your safety.", "Our priority.", "Always."] },
    { t: "MEMORIES > PHOTOS", lines: ["We care about the", "story, not the gram."] },
  ],

  ctaEyebrow: "READY FOR WHAT'S NEXT?",
  ctaTitle: ["SPOTS ARE LIMITED.", "STORIES ARE INFINITE."],
  ctaButton: "JOIN THE COMMUNITY",
} as const;

/* The manifesto block — comp (3). Sits below the About page. */
export const MANIFESTO = {
  goalNum: "01. THE GOAL",
  goalTitle: ['MAKE "I WISH', 'I COULD GO"'],
  goalTitleMark: ['A FUCKING', '"I WENT."'],
  goalBody: [
    "We exist for the moment between wanting to be there and actually showing up.",
    "The fest. The city. The people. The story you would've missed because you didn't have a crew, didn't know where to start, or simply waited too long.",
  ],
  goalKicker: ["We make going easier. Going together better.", "And missing out harder."],

  thingNum: "02. THE THING",
  thingTitle: ["YOU BRING", "THE YES."],
  thingTitleMark: ["WE'LL HANDLE", "THE REST."],
  thingBody: [
    "AS SCHEDULED connects students, creators and ambitious young people with college fests worth leaving campus for.",
  ],
  thingSteps: ["You find the plan.", "You apply.", "You get scheduled."],
  thingAfter: "Then the logistics stop being your problem.",
  thingKicker: ["Different campuses.", "One destination.", 'Zero awkward "so who’s coming?"', "group chats."],

  rulesNum: "03. THE SHIT WE DON'T COMPROMISE ON",
  rulesTitle: "THE RULES WE'RE NOT FUCKING WITH.",
  rules: [
    { t: "GO > WAIT", body: "If you keep waiting for everyone to be free, you'll miss everything." },
    { t: "PEOPLE > PLANS", body: "The itinerary gets you there. The people make you remember it." },
    { t: "NO NPC ENERGY", body: 'No forced networking. No fake "community." No pretending everyone is best friends.' },
    { t: "REAL LIFE > CONTENT", body: "If the best moment doesn't make it onto Instagram, good. It was probably better that way." },
    { t: "TAKE CARE OF YOUR PEOPLE", body: "Wild doesn't mean careless. We take the boring details seriously so the experience doesn't have to feel boring." },
  ],

  receiptsNum: "04. THE RECEIPTS",
  receiptsTitle: ["THEY WENT.", "HERE'S WHAT"],
  receiptsTitleMark: "THEY SAID.",
} as const;

/* ---------- SOMEWHERE (departure listing) ---------- */

export const SOMEWHERE = {
  title: ["SOMEWHERE", "ELSE"],
  sub: ["College fests. New cities. New faces.", "A few days outside the usual programming."],
  sub2: ["Just good people, a good reason to go,", "and somewhere else to be."],

  nots: ["NO BORING PLANS.", "NO DEAD GROUP CHATS.", 'NO "MAYBE NEXT TIME."'],
  notsMark: "JUST GO.",

  placesTitle: ["PLACES WE'RE", "ABOUT TO"],
  placesTitleMark: "FUCK SHIT UP.",
  nextLabel: "NEXT:",
  next: ["Rendezvous. Thomso.", "And whatever", "happens after."],

  moreTitle: "MORE SOMEWHERE, SOON.",
  moreSub: ["KEEP A LITTLE ROOM", "IN THE CALENDAR."],

  smallTitle: ["THE", "LITTLE", "THINGS"],

  detailsTitle: ["THE", "LITTLE", "DETAILS."],
  details: [
    { t: "DATES", lines: ["Exact dates,", "two batches."] },
    /* Departs from the comp, which read "Anyone in +1 or +2" — Class 11
       and 12, who are mostly 16–17. 18+ is the confirmed rule (Mannat,
       2026-08-17), and it is enforced server-side in
       app/api/somewhere/apply/route.ts, so the page has to say the same
       thing the form will actually accept. */
    { t: "WHO CAN COME", lines: ["Anyone 18 or over.", "All streams. All welcome."] },
    { t: "WHAT TO BRING", lines: ["Basics, fits, charger,", "and a good attitude."] },
    { t: "WHAT HAPPENS AFTER", lines: ["You come back.", "With stories.", "And probably a group chat", "that never dies."] },
  ],

  priceLabel: "PRICE (ALL INCLUSIVE)",
  priceIncludes: ["Travel", "Stay", "Food", "Event Access", "Crew"],

  closingWord: "ANYWAY.",
  closingTitle: ["DON'T MAKE IT", "A BIG THING."],
  closingMark: "JUST COME.",
  closingBody: ["Bring whatever fits in the bag.", "We'll figure out the rest."],

  cardCta: "GO THERE",
  planCta: "SEE THE PLAN",
} as const;

/* ---------- DEPARTURE DETAIL ---------- */

export const DETAIL = {
  introTitle: "THE WEEK YOU'LL TALK ABOUT.",
  datesLabel: "TRIP DATES",
  fromLabel: "STARTING FROM",
  applyCta: "REQUEST YOUR INVITE",
  /* Shown when a genuine remaining count is not confirmed. */
  spotsFallback: "Spots are limited. Vibes are unlimited.",
  includedLabel: "INCLUDED",
  includedSub: "The important shit is handled.",
  excludedLabel: "EXCLUDED",
  excludedSub: "You handle the rest.",
  itineraryLabel: "ITINERARY",
  itinerarySub: "The dates are fixed. The rest gets room.",
  brochureTitle: ["COME FOR THE WEEK.", "STAY FOR THE"],
  brochureTitleMark: "STORIES.",
  brochureCta: "DOWNLOAD BROCHURE",
  closing: "JUST COME.",
  closingSub: "We'll handle the rest.",
  closingAlt: ["JUST COME,", "WE WILL HANDLE THE REST."],
  stamp: ["SOMEWHERE", "WORTH IT."],
} as const;

/* ---------- GALLERY ---------- */

export const GALLERY = {
  heroTitle: "SOMEWHERE",
  heroSub: "Wish you were here.",
  heroBody: ["A look inside the trips,", "the nights and the people who actually went."],
  /* One call to action, not two — "TAKE A LOOK" and "OPEN THE ARCHIVE"
     both scrolled to the same place. */
  heroLink: "OPEN THE ARCHIVE",

  title: ["SOMEWHERE", "RECENTLY"],
  sub: ["Just things we saw, people we met and", "a few moments that made the camera come out."],
  archiveTitle: "THE ARCHIVE",
  archiveSub: "A little evidence.",
  keepTitle: "KEEP SCROLLING.",
  keepBody: ["There is probably something here", "you weren't supposed to see yet."],
  keepCta: "EXPLORE ASCHEDULE",
} as const;

/* ---------- CONTACT ---------- */

export const CONTACT = {
  titleTop: ["TELL US", "WHAT'S"],
  titleMark: "UNSCHEDULED.",
  body: ["Got something on your mind?", "An idea, a collab, a trip", "you should be taking, or..."],
  bodyMark: "We're listening.",
  note: ["WE READ", "EVERYTHING."],
  emailLabel: "EMAIL US",
  phoneLabel: "CALL US",
  /* Contact page only — deliberately not in the footer, where they
     would appear on every page and attract far more cold calls. */
  phones: ["7400829921", "8969214005"],

  formTitle: "TELL US WHAT'S UNSCHEDULED",
  fields: {
    name: { label: "YOUR NAME", ph: "what do we call you?" },
    email: { label: "YOUR EMAIL", ph: "where can we find you?" },
    phone: { label: "PREFER US CALLING?", ph: "your number (so we can talk it out)" },
    message: { label: "WHAT'S ON YOUR MIND?", ph: "trip / collab / chaos / something else..." },
  },
  submit: "SEND IT",
  privacy: "we keep it personal. always.",

  strip: [
    ["WE PLAN.", "YOU LIVE."],
    ["REAL ITINERARY.", "REAL STORIES."],
    ["NOT ORDINARY.", "NEVER."],
    ["UNSCHEDULED HITS", "DIFFERENT."],
  ],
} as const;

/* ---------- FAQ ---------- */

export const FAQ_PAGE = {
  eyebrow: "YOU ASKED. WE ANSWERED.",
  title: ["BEFORE YOU", "GET SCHEDULED."],
  sub: ["The stuff you probably", "want to know before", "joining us."],
  note: ["new people", "new cities", "new stories", "unreal memories"],
  stampRing: "DIFFERENT CAMPUSES · SAME STORIES ·",
  listTitle: ["THE", "THINGS", "YOU'RE", "PROBABLY", "WONDERING."],

  askEyebrow: "STILL CONFUSED?",
  askTitle: ["ASK US.", "WE DON'T BITE."],
  askBody: ["Some things are", "easier to ask", "than search for."],
  askCta: "TALK TO US",

  storiesEyebrow: "THEY WENT.",
  storiesTitle: ["DIFFERENT CAMPUSES.", "SAME STORY."],
  storiesBody: [
    "We bring students together who probably wouldn't have met otherwise. Different colleges, different backgrounds, sometimes completely different cities.",
    "Then they end up travelling to the same fest, sharing the same bus, exploring the same city and making the kind of memories that don't fit neatly into an itinerary.",
  ],
  storiesCta: "READ MORE STORIES",
} as const;

export interface Faq {
  q: string;
  a: string;
  /** true when the answer was written by us, not taken from a comp. */
  draft?: boolean;
}

export const FAQS: Faq[] = [
  {
    q: "So... what actually happens on an AS SCHEDULED trip?",
    /* NEEDS REVIEW — the comp shows this question with no answer.
       Written from the itineraries in lib/departures.ts. */
    a: "You travel with us to a city, spend a couple of days in it, then spend the rest of the week inside one of the country's biggest college fests. Travel, stay, food and entry are handled; the parts worth remembering are not scheduled at all.",
    draft: true,
  },
  {
    q: "What makes this different from a normal group tour?",
    /* NEEDS REVIEW — comp shows no answer. */
    a: "A tour moves you between sights. We put you in one place with people from other campuses and a fest going on around you. Nobody hands you a flag to follow.",
    draft: true,
  },
  {
    q: "Can I come if I don't know anyone?",
    /* Verbatim from comp (4). */
    a: "Absolutely. Most of our travelers come solo. Different colleges, different stories. You arrive knowing nobody, you leave with people you'll remember.",
  },
  {
    q: "What's actually included in the price?",
    /* NEEDS REVIEW — comp shows no answer. Numbers come from
       lib/departures.ts, never hardcoded here. */
    a: "Return train travel from your city, accommodation on a sharing basis, most of your meals, entry passes to the fest, transfers and the sightseeing days. The full list sits on each departure's page, along with what we deliberately leave out.",
    draft: true,
  },
  {
    q: "Who can actually come?",
    /* NEEDS REVIEW — the comp shows this question with no answer.
       The 18+ rule itself is confirmed (Mannat, 2026-08-17) and matches
       both SOMEWHERE.details and the server-side check. */
    a: "You need to be 18 or over. Beyond that: all streams, all colleges, all welcome. You apply, we read it, and we come back to you.",
    draft: true,
  },
];

/* ---------- TESTIMONIALS ----------
   ⚠ These appear in comps (3) and (4) attributed to named people.
   CLAUDE.md forbids invented testimonials. They are isolated here so
   they can be deleted in one edit if they are not real.
   TODO(mannat): confirm every quote below is a real, consented quote
   from a real traveller. If not, delete this array — the components
   render nothing when it is empty. */

export interface Testimonial {
  quote: string;
  name: string | null;
  from: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I almost didn't come because none of my friends were coming. Ended up meeting people from three different colleges and somehow the trip became the best part of the fest.",
    name: "AARAV",
    from: "Delhi → IIT Fest",
  },
  {
    quote:
      "The best part was not having to figure everything out. I just applied, got in, and everything from the travel to the stay was sorted.",
    name: "RIYA",
    from: "Mumbai → College Fest",
  },
  {
    quote:
      "I came knowing literally nobody. Three days later I had a group I would've never met at my own college.",
    name: "KARAN",
    from: "Bhubaneswar → College Fest",
  },
  {
    quote:
      "It didn't feel like a tour. It felt like everyone randomly decided to go somewhere and everything worked.",
    name: "MEHA",
    from: "Pune → College Fest",
  },
];

/* ---------- APPLICATION MODAL ---------- */

export const APPLY = {
  title: "I am coming",
  sub: "Just need a few things.",
  steps: ["A FEW THINGS", "ONE LAST THING"],
  next: "I'M IN",
  back: "BACK",
  submit: "SUBMIT",
  fields: {
    name: { label: "FULL NAME", ph: "Enter your full name" },
    phone: { label: "CONTACT NUMBER", ph: "Enter your number" },
    gender: { label: "GENDER", ph: "Select" },
    age: { label: "AGE", ph: "Enter your age", hint: "You must be 18 or over." },
    state: { label: "STATE", ph: "Select your state" },
    occupation: { label: "OCCUPATION", ph: "Select your occupation" },
    college: { label: "COLLEGE", ph: "Where do you study?" },
    event: { label: "WHICH EVENT YOU WANT TO COME?", ph: "Select the event you're most excited about" },
    instagram: { label: "INSTAGRAM HANDLE", ph: "Enter your Instagram handle", hint: "Helps us know you better." },
    why: {
      label: "WHAT MADE YOU WANT TO COME?",
      ph: "Tell us what caught your attention.",
      hint: "We read every single one.",
      max: 200,
    },
  },
  genders: ["Male", "Female", "Other", "Prefer not to say"],
  occupations: ["Student", "Influencer", "Student or Influencer", "Working", "Other"],
} as const;

/* Comp (12) lists "Student or Influencer" as the occupation placeholder.
   TODO(mannat): confirm the real occupation options. */

export const COLLAB = {
  title: "Let's collaborate.",
  sub: ["Tell us about your event, fest or brand.", "We'll take it from there."],
  fields: {
    name: { label: "Your name", ph: "Enter your full name" },
    org: { label: "Organization / Event / Fest name", ph: "Enter name" },
    email: { label: "Email", ph: "Enter your email" },
    phone: { label: "Contact number", ph: "Enter your contact number" },
    type: { label: "Type", ph: "Select type" },
    dates: { label: "Event / Fest dates", ph: "DD MMM YYYY – DD MMM YYYY" },
    location: { label: "Location", ph: "City / Venue" },
    on: { label: "What are you looking to collaborate on?", ph: "Select all that apply" },
    more: {
      label: "Tell us more",
      ph: "Share a few details about your event, audience, goals and how you see us working together.",
    },
  },
  /* TODO(mannat): confirm these option lists — the comp shows the
     selects closed, so the values are not visible. */
  types: ["College fest", "Brand", "Venue", "Creator", "Other"],
  collabOn: ["Travel partner", "Media / content", "On-ground activation", "Ticketing", "Something else"],
  reply: ["We usually reply within 48 hours.", "Keep an eye on your inbox."],
  back: "BACK",
  submit: "SUBMIT",
} as const;

/* ---------- INDIAN STATES (application form) ---------- */

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

/* ---------- FOOTER ---------- */

export const FOOTER = {
  brand: "AS SCHEDULED",
  tagline: "get next one first",
  subscribePh: "@gmail subscribe",
  prefsLabel: "select ur preference",
  prefs: ["man", "women", "both"],
  consent:
    "I agree to receive content from as scheduled via and I have read accept the privacy policy.",
  cols: [
    {
      h: "Support",
      links: [
        { t: "Cancellation", href: "/paperwork/cancellation-policy" },
        { t: "FAQ", href: "/faqs" },
        { t: "Contact us", href: "/contact" },
      ],
    },
    {
      h: "Join Us",
      links: [
        { t: "Collab", href: "/contact?collab=1" },
        { t: "Apply", href: "/somewhere" },
        { t: "About us", href: "/about" },
        { t: "IRL", href: "/gallery" },
      ],
    },
    {
      h: "Boring stuff",
      links: [
        { t: "legal notice", href: "/paperwork/terms" },
        { t: "privacy policy", href: "/paperwork/privacy" },
      ],
    },
  ],
  /* TODO(mannat): real handles. CLAUDE.md lists these as open items,
     so every social link is disabled until they are confirmed. */
  socials: [
    { t: "Instagram", href: null },
    { t: "Spotify", href: null },
    { t: "Snapchat", href: null },
    { t: "YouTube", href: null },
  ],
} as const;

/* ---------- NAV ---------- */

export const NAV = [
  { t: "SOMEWHERE", href: "/somewhere" },
  /* Label only: the route stays /gallery so shared links and the
     sitemap keep working. */
  { t: "SOMEONE", href: "/gallery" },
  { t: "ABOUT", href: "/about" },
] as const;

export const NAV_UTIL = [
  { t: "CONTACT", href: "/contact" },
  { t: "FAQs", href: "/faqs" },
] as const;

/* The header CTA. It and the hero CTA are deliberately swapped from the
   comp: the hero carries APPLY, the header carries this. */
export const NAV_CTA = "I'M COMING";
