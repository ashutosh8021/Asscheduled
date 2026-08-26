-- AS SCHEDULED — schema for the live "SOMEWHERE" forms
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- ⚠ This SUPERSEDES docs/schema.sql. That file describes the Form 7A
--   flow (₹500 fee, Razorpay order/payment ids, seven essay answers,
--   ages 18–26) which the comps replaced. Do NOT run both: they both
--   declare a table called `applications` with different columns, and
--   `create table if not exists` means the second one silently does
--   nothing, leaving inserts failing on missing columns.
--
-- Three tables, one per form the site actually has:
--   applications   — the "I am coming." overlay
--   collaborations — the "Let's collaborate." overlay
--   messages       — the contact page
--
-- No table is ever read by the site. Everything here is write-only from
-- the server routes; reading is an admin job (Phase 3).

create extension if not exists "pgcrypto";

-- -------------------------------------------------------- applications
-- Mirrors app/api/somewhere/apply/route.ts exactly. Every constraint
-- here is also enforced in that route — the database is the backstop,
-- not the only guard, so a constraint violation means a real bug rather
-- than ordinary bad input.
create table if not exists applications (
  id            uuid primary key default gen_random_uuid(),
  -- The AS-S2-XXXXXXXXXX code the applicant is shown and quotes back.
  -- Season 01 rows still read AS-S1-; references are never rewritten.
  reference     text not null unique,
  -- REN-26 / THO-26. Deliberately not a foreign key: departures live in
  -- lib/departures.ts (CLAUDE.md: trip data lives in one place), so a
  -- trips table here would be a second source of truth that can drift.
  departure_code text not null,

  name          text not null,
  phone         text not null,
  gender        text not null,
  -- 18 is a hard floor. Below it we would be processing a minor's data
  -- without the verifiable parental consent the DPDP Act requires.
  age           int  not null check (age >= 18 and age <= 60),
  state         text not null,
  occupation    text not null,
  college       text not null,

  instagram     text,
  why           text,

  status        text not null default 'new'
                  check (status in ('new', 'reviewing', 'accepted', 'declined')),
  created_at    timestamptz not null default now()
);

create index if not exists applications_created_idx   on applications (created_at desc);
create index if not exists applications_departure_idx on applications (departure_code);
create index if not exists applications_status_idx    on applications (status);

-- ------------------------------------------------------ collaborations
create table if not exists collaborations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  organisation text not null,
  email        text not null,
  phone        text,
  kind         text not null,          -- "type" is reserved-ish; kept plain
  dates        text,                   -- free text: the form is not a date picker
  location     text,
  collab_on    text[] not null default '{}',
  details      text not null,
  status       text not null default 'new'
                 check (status in ('new', 'replied', 'closed')),
  created_at   timestamptz not null default now()
);

create index if not exists collaborations_created_idx on collaborations (created_at desc);

-- ------------------------------------------------------------ messages
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null,
  message    text not null,
  status     text not null default 'new'
               check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_idx on messages (created_at desc);

-- ----------------------------------------------------------------- RLS
-- Enabled with NO policies, on purpose.
--
-- RLS with zero policies denies everything to anon and authenticated.
-- The service_role key bypasses RLS entirely, and only the server
-- routes hold it. So: the browser can neither read nor write these
-- tables, and nothing on the public site needs to.
--
-- If you later build an admin UI, add a policy scoped to an
-- authenticated admin role — do not loosen anon.
alter table applications   enable row level security;
alter table collaborations enable row level security;
alter table messages       enable row level security;

-- Belt and braces: revoke the grants PostgREST relies on, so even a
-- misconfigured policy cannot expose these to the public key.
revoke all on applications   from anon, authenticated;
revoke all on collaborations from anon, authenticated;
revoke all on messages       from anon, authenticated;
