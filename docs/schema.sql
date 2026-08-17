-- ⚠⚠ SUPERSEDED — DO NOT RUN. See docs/schema-somewhere.sql instead. ⚠⚠
--
-- This describes the Form 7A flow (₹500 registration, Razorpay order and
-- payment ids, seven essay answers, ages 18–26). The approved comps
-- replaced that flow with the "I am coming." overlay, which collects
-- different fields and takes no payment. The routes behind this schema
-- (/apply, /api/applications) still compile but are not linked from the
-- live navigation.
--
-- Running this file AND schema-somewhere.sql would be actively harmful:
-- both declare a table called `applications` with different columns, and
-- `create table if not exists` means the second silently does nothing —
-- leaving every insert failing on columns that were never created.
--
-- Kept only as a record of the Phase 2 design, in case the fee-based
-- flow is ever revived.
--
-- AS SCHEDULED — Season 01 · Supabase schema
-- Source of truth: docs/SPEC.md §7. Run in the Supabase SQL editor.
--
-- Nothing here is destructive; it is safe to re-run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- trips
-- Mirrors lib/trips.ts. The app still reads trip content from the TypeScript
-- file (CLAUDE.md: trip data lives ONLY in lib/trips.ts) — this table exists
-- so applications can carry a real foreign key and so admin can hold live
-- seat counts in Phase 3.
create table if not exists trips (
  code          text primary key,
  fest          text not null,
  campus        text not null,
  city          text not null,
  price_inr     int  not null,
  seats         int  not null default 19,
  filled        int  not null default 0,
  window_label  text,
  close_at      timestamptz,
  status        text not null default 'BOARDING'
);

-- --------------------------------------------------------- applications
-- fee_status has exactly two values. There is no 'refunded' and no
-- 'adjusted': the ₹500 is non-refundable and never credits against the trip
-- fee. Do not add one.
create table if not exists applications (
  id                  uuid primary key default gen_random_uuid(),
  trip_code           text references trips(code),
  name                text not null,
  age                 int  check (age between 18 and 26),
  city                text,
  college             text,
  phone               text,
  email               text not null,
  instagram           text,
  answers             jsonb not null default '{}'::jsonb,
  photo_url           text,
  fee_status          text not null default 'pending'
                        check (fee_status in ('pending', 'paid')),
  decision            text not null default 'under_review'
                        check (decision in ('under_review', 'selected', 'waitlisted', 'rejected')),
  razorpay_order_id   text,
  razorpay_payment_id text,
  created_at          timestamptz not null default now()
);

-- The webhook looks a file up by order id on every callback.
create unique index if not exists applications_razorpay_order_id_key
  on applications (razorpay_order_id)
  where razorpay_order_id is not null;

create index if not exists applications_trip_code_idx on applications (trip_code);
create index if not exists applications_decision_idx  on applications (decision);

-- ------------------------------------------------------------------ RLS
-- The app writes with the service role key from server routes only, so the
-- anon policies stay deliberately narrow: read the board, never read a file.
alter table trips        enable row level security;
alter table applications enable row level security;

drop policy if exists "trips are public" on trips;
create policy "trips are public"
  on trips for select
  to anon, authenticated
  using (true);

-- No anon select policy on applications, by design: an application is
-- readable only through the service role. Inserts also go through the
-- service role (app/api/applications), so anon gets no insert policy either.

-- ------------------------------------------------------------ seed trips
-- Copied field-for-field from lib/trips.ts, which stays the source of truth
-- (CLAUDE.md). If you edit one, edit the other in the same commit.
-- Antaragni's ₹16,999 is still unconfirmed — see CLAUDE.md open items.
insert into trips (code, fest, campus, city, price_inr, seats, filled, window_label, close_at) values
  ('PUL-01', 'PULSE',      'AIIMS DELHI', 'NEW DELHI',        14999, 19, 0, 'SEP 2026 — TRACKS FEST ANNOUNCEMENT',     '2026-08-20T23:59:00+05:30'),
  ('REN-02', 'RENDEZVOUS', 'IIT DELHI',   'NEW DELHI',        15999, 19, 0, 'OCT 2026 — TRACKS FEST ANNOUNCEMENT',     '2026-09-20T23:59:00+05:30'),
  ('ANT-03', 'ANTARAGNI',  'IIT KANPUR',  'KANPUR + LUCKNOW', 16999, 19, 0, 'OCT–NOV 2026 — TRACKS FEST ANNOUNCEMENT', '2026-10-01T23:59:00+05:30'),
  ('OAS-04', 'OASIS',      'BITS PILANI', 'PILANI + JAIPUR',  24999, 19, 0, 'OCT–NOV 2026 — TRACKS FEST ANNOUNCEMENT', '2026-10-01T23:59:00+05:30')
on conflict (code) do nothing;
