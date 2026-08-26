# AS SCHEDULED — Product & Brand Spec (Season 02)
Place at `docs/SPEC.md`. CLAUDE.md points here. Reference build: `reference/as-scheduled-v4.html`.

## 1. What this is
Curated 6-day departures around India's biggest college fests. The fest gets people there; the city keeps them. 19 seats per departure. Nobody books — everybody applies (Form 7A, ₹500 non-refundable). A human reads every application; decisions within 72h of window close; rejections get no refund, no reasons, no appeals. The ₹500 pays for the reading — it is not a deposit and never adjusts against the trip fee. Crew per departure: Director + one Trip Captain. Audience: 18–26, students/recent grads — Nued Project / Boiler Room / Corteiz culture, not luxury travellers.

## 2. Identity
- Marks: peach `AS` monogram tile (navy text on peach, hard offset shadow) + peach bird glyph.
  Bird SVG path (canonical): `M4 18 C14 6 30 4 44 10 C36 11 30 14 27 19 C36 16 46 18 52 25 C43 22 35 24 30 30 C27 23 18 20 4 18 Z`
- Palette: cotton `#FAF6EE` (bg) · cotton-2 `#F1EADC` · navy `#12234F` (ink/borders) · navy-2 `#0C1838` (dark surfaces) · powder `#C6D8EF` / powder-2 `#E2ECF8` (fills, washes) · peach `#FFAD84` / peach-2 `#FF9463` (mark, primary CTA, accents) · red `#D9351F` (rubber stamps ONLY) · grey `#8A8FA1` (pencil) · ok `#1D6B3C`.
- Type: Anton — display, uppercase, line-height .92. Instrument Serif italic — editorial accents inside headlines and Form 7A questions. Space Grotesk — body. IBM Plex Mono — labels (11px, tracking .14em, uppercase), codes, countdowns, everything bureaucratic.
- Texture: SVG film grain overlay at ~.06 opacity, animated steps() under no-preference.
- Motion: easing `cubic-bezier(.22,1,.36,1)`; buttons translate(-3px,-3px) + hard shadow; case files expand via max-height; rows invert navy-on-hover (the signature).

## 3. Voice
Deadpan departure paperwork. Confidence through restraint.
- Yes: "Nineteen seats. One form." · "Evenings sealed until departure." · "Rejection says nothing about you. It says something about the other eighteen seats." · "Do not refresh. We don't repeat ourselves."
- Banned: exclamation marks, emojis, "unforgettable/amazing/adventure awaits/hidden gems", any sentence begging to be liked.
- Section labels pattern: `FILE 0X — NAME`. Statuses as stamps: EXECUTED / LODGED / CLEARED / FILE PENDING / EMPTY BY DESIGN.

## 4. Pages & routes (App Router)
- `/` — full narrative page, section order exactly as reference: Loader → Nav → Hero → Ticker → Manifesto → Departure Board (4 case files) → Files Pending (9) → Protocol → Record (Trip 000) → Numbers → Archive (empty) → Supply (Drop 000) → FAQ → CTA → Footer.
- `/departures/[code]` — one case file per trip (PUL-01, REN-02, ANT-03, OAS-04): full manifest, chips, includes/excludes, apply CTA. Shares components with the board expansion.
- `/apply` — Form 7A full-screen (can also mount as overlay from any CTA). `?trip=CODE` preselects.
- `/paperwork` — Refund Policy / Terms of Travel / Privacy (content in reference legal sheet).
- `/admin` — Phase 3. Auth-gated (Better Auth): application queue, approve/reject (reject triggers decision email only — no refund), seat counts, CSV export.
- API: `POST /api/applications` · `POST /api/razorpay/order` · `POST /api/razorpay/webhook` (Phase 2).

## 5. Trip data
Port `TRIPS[]` and `SOON[]` verbatim from `reference/as-scheduled-v4.html` into `lib/trips.ts` (typed). Summary for sanity — never let these drift:
- PUL-01 Pulse, AIIMS Delhi — ₹14,999 — apps close 2026-08-20 — SEP 2026 window
- REN-02 Rendezvous, IIT Delhi — ₹15,999 — close 2026-09-20 — OCT 2026
- ANT-03 Antaragni, IIT Kanpur (+Lucknow leg) — ₹16,999 (UNCONFIRMED) — close 2026-10-01
- OAS-04 Oasis, BITS Pilani (+Shekhawati+Jaipur) — ₹24,999 — close 2026-10-01
- Pending (9): Thomso, Mood Indigo, Alcheringa, Saarang, Sunburn, Waves, Spring Fest, Riviera, Unmaad. 4 open + 9 pending = 13 files, always.
- Every trip includes: intercity travel both ways (hubs post-selection), fest tickets, 5 nights twin-share, all meals 3/day, all transfers, crew, first-aid/SOS, trip journal. Exclusions stay witty ("Sleep — optional, statistically unlikely", "Anything the Trip Captain vetoes").

## 6. Form 7A (the product's front door)
Full-screen, 14 screens, top progress bar (peach), Enter advances / Shift+Enter newline, Esc = confirm-close, per-screen validation, sticky nav bar.
0 intro+trip select · 1 identity (name, age 18–26, city) · 2 contact (phone 10-digit, email, IG, college) · 3–9 the seven questions (Saturday / three words exactly / why this departure / genuinely bad at / plus-one & why / who drains you / what should 18 remember) · 10 photo (preview polaroid; optional client-side, mandatory server-side) · 11 dossier review (every answer, edit → jumps back) · 12 fee ledger (₹500 non-refundable, no refund on rejection, no adjustment on selection, "cost of applying either way ₹500") · 13 LODGED + REF + 4-step timeline.
Analytics events: `app_open`, `app_screen`, `app_lodged`.

## 7. Data model (Supabase)
```sql
create table trips (
  code text primary key, fest text, campus text, city text,
  price_inr int, seats int default 19, filled int default 0,
  window_label text, close_at timestamptz, status text default 'BOARDING'
);
create table applications (
  id uuid primary key default gen_random_uuid(),
  trip_code text references trips(code),
  name text, age int check (age between 18 and 26),
  city text, college text, phone text, email text, instagram text,
  answers jsonb, photo_url text,
  fee_status text default 'pending',        -- pending|paid (₹500 is non-refundable; no refunded/adjusted states)
  decision text default 'under_review',      -- under_review|selected|waitlisted|rejected
  razorpay_order_id text, razorpay_payment_id text,
  created_at timestamptz default now()
);
```
RLS: anon = insert-only on applications, select on trips. Admin via service role.
Flow: create Razorpay order → checkout → webhook verifies signature → insert application (fee_status=paid) → Resend "lodged" email. Reject in admin → Resend "not selected" → fee_status stays `paid` (the ₹500 is non-refundable; no Razorpay refund call).

## 8. Animation direction (GSAP + ScrollTrigger)
Scroll-scrubbed, not autoplay theatre: hero ghost columns + bird parallax (scrub) · headline lines rise on loader end (CSS class `enter`, staggered delays) · board rows batch-stagger in · numbers count up on enter (plain JS) · CTA display type scale-scrub .92→1 · image panels: inner img yPercent parallax + slow scale · section labels clip reveal. Everything behind reduced-motion guard; IO fallback if CDN/GSAP absent. No pinned horror shows on mobile.
Loader (7s, skip at 1.5s): typewriter manifest console · ~300 particles assemble the peach AS mark then burst · bird chases pointer (autonomous glide until first move) · dawn gradient rises · CLEARED stamp at 6s. Reduced-motion: skipped entirely.

## 9. Env vars (`.env.local`, never committed)
`NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` · `RAZORPAY_KEY_ID` · `RAZORPAY_KEY_SECRET` · `RAZORPAY_WEBHOOK_SECRET` · `RESEND_API_KEY` · `NEXT_PUBLIC_POSTHOG_KEY` · `SENTRY_DSN`
Added since: `NEXT_PUBLIC_SITE_URL` (canonical origin for metadata/sitemap/OG — `lib/site.ts`) and `RESEND_FROM` (verified sending address; Resend rejects every send without one). Template with notes: `.env.example`.
**Every group is optional.** Absent keys degrade rather than throw: no Supabase → applications validate and are accepted but not stored; no Razorpay → nothing is charged and Form 7A ends at LODGED exactly as in Phase 1; no Resend → no email. `lib/env.ts` is the only reader.

## 10. Phases (ship order — deposits before dashboards)
- **P1 — Marketing site (static):** full `/` port, `/departures/[code]`, `/paperwork`, Form 7A UI ending at a stub submit. Acceptance: pnpm build clean, Lighthouse ≥90, Safari + 360px Android verified, reduced-motion verified, zero "Book Now" strings.
- **P2 — Money & data:** Supabase schema, Razorpay order+webhook, application insert, Resend lodged/decision emails, live seat counts.
- **P3 — Admin:** Better Auth, queue, approve/reject with decision emails (no auto-refund), CSV export.
- **P4 — Polish:** PostHog, Sentry, OG images, sitemap, Sanity only if copy editing becomes a bottleneck.

## 11. Checklists
Safari: no `animation-timeline` · `-webkit-backdrop-filter` · `color-mix` with rgba fallback · `100vh` before `100svh` · `summary::-webkit-details-marker` AND `summary::marker` hidden · inputs ≥16px font (iOS zoom).
A11y: focus-visible rings · Esc closes overlays · full keyboard path through Form 7A · contrast AA on cotton/navy/peach pairs · aria-expanded on board rows · skip link.
Images: Wikimedia Commons only for landmarks (CC BY-SA — every file credited in `docs/CREDITS.md`), duotone treatment (navy base, luminosity blend, peach soft-light wash), `onerror` → labeled placeholder. Real trip photos: only Mannat's own, into Record/Archive slots.

## 12. Copy bank
Hero: "THE FEST GETS YOU THERE. *the city keeps you.*" · Manifesto: "We take you to the fest. / We hand you the city after. / *We choose the nineteen.*" + "That's the entire explanation you'll get." · Footer: "Departure is the easy part." · Legal line: "© 2026 ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · India".
