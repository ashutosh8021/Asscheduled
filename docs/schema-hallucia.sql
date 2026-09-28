-- AS SCHEDULED — the Hallucia "build your experience" flow
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql
-- and docs/schema-partner.sql. Safe to re-run.
--
-- Two things happen here: the application gains the fields that flow
-- collects, and `occupation` stops being mandatory.

-- ------------------------------------------------------- new answers
-- email/city: asked by the Hallucia step one and by nothing else yet.
-- travel_*: how they are getting there. Only `self` is priced on the
--   site; train and flight are quoted by a person, which is why there
--   is no travel fare column and no total beyond the deposit.
-- stage: 'details' once step one is saved, 'complete' once they finish.
--   This is the whole point of saving early — a row stuck at 'details'
--   is somebody who gave us their number and then walked away, and
--   they are worth calling. Without it they would be indistinguishable
--   from a finished application.
alter table applications
  add column if not exists email       text,
  add column if not exists city        text,
  add column if not exists travel_mode text,
  add column if not exists travel_city text,
  add column if not exists travel_type text,
  add column if not exists stage       text;

-- Find the people who dropped out after step one.
create index if not exists applications_stage_idx
  on applications (stage)
  where stage is not null;

-- ------------------------------------------------- occupation is optional
-- The Hallucia form does not ask it. NOT NULL would reject every one
-- of those applications outright, which is how a form silently stops
-- storing anything at all.
alter table applications
  alter column occupation drop not null;
