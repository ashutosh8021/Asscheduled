-- AS SCHEDULED — the Mood Indigo campaign: Crew ambassadors and referrals
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql
-- and docs/schema-partner.sql. Safe to re-run.
--
-- Phase A of the campaign plan. Later phases (ambassador codes, pay on
-- selection) add to this file rather than starting a new one.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------- ambassadors
-- Crew signups from /crew. Written by app/api/somewhere/crew/route.ts,
-- read only by the admin.
--
-- `code` stays null until somebody is selected and issued one — a
-- signup is a request to join, not membership.
create table if not exists ambassadors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text not null,
  -- 18 is a hard floor, as for applications: Crew are paid, and a
  -- payout arrangement with a minor is not one to enter into.
  age         int  not null check (age >= 18 and age <= 60),
  college     text not null,
  year        text not null,
  city        text not null,
  state       text not null,
  instagram   text,
  -- The groups, societies and hostels they can reach. What selection
  -- is actually decided on.
  reach       text not null,
  why         text,
  status      text not null default 'new'
                check (status in ('new', 'active', 'declined', 'paused')),
  tier        text not null default 'crew'
                check (tier in ('crew', 'captain', 'lead')),
  code        text unique,
  created_at  timestamptz not null default now()
);

-- One signup per number. A second attempt is answered as "already on
-- the list" rather than stored twice — see saveAmbassador in lib/store.ts.
create unique index if not exists ambassadors_phone_idx   on ambassadors (phone);
create        index if not exists ambassadors_created_idx on ambassadors (created_at desc);

alter table ambassadors enable row level security;
revoke all on ambassadors from anon, authenticated;

-- ------------------------------------------------- applications.referred_by
-- Who referred an applicant, recorded separately from who priced them.
--
-- partner_code holds the discount that WON. When an automatic discount
-- is worth more than an ambassador's code, the ambassador's code loses
-- on price — and without this column they would lose the credit too.
-- The two answer different questions and have to be stored apart.
alter table applications
  add column if not exists referred_by text;

create index if not exists applications_referred_idx
  on applications (referred_by)
  where referred_by is not null;
