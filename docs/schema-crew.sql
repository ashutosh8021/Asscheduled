-- AS SCHEDULED — Crew accounts: the passcode and the session.
--
-- Run this in the Supabase SQL editor, after docs/schema-mi.sql.
-- Safe to re-run.
--
-- Phase B of the campaign plan, first half: a Crew member can sign in
-- and read their own code and their own numbers.
--
-- WHY THIS IS NOT SUPABASE AUTH
--
-- Admins and festival partners are Supabase Auth users, admitted to
-- /admin and /partner by the ADMIN_EMAILS and PARTNER_EMAILS
-- allowlists. Crew must never reach either, and the safest way to
-- guarantee that is for Crew to have no auth.users row at all: there
-- is then nothing they could present to currentAdmin() or
-- currentViewer(), which read a Supabase session and nothing else.
--
-- So Crew identity is an ambassadors row, the credential is a passcode
-- we issue, and the session is a random token in the table below. The
-- two systems share no table, no cookie and no code path — see
-- lib/crew.ts, which deliberately does not import lib/admin.ts.

create extension if not exists "pgcrypto";

-- ----------------------------------------------------- ambassadors: login
alter table ambassadors
  -- SHA-256 of the passcode, never the passcode. Same reasoning as an
  -- upload token in lib/documents.ts: whoever reads this table cannot
  -- use what they find to sign in as somebody.
  --
  -- Null means no account yet. A signup is a request to join, so
  -- nothing here is set until you select somebody and activate them.
  add column if not exists passcode_hash text,
  add column if not exists activated_at   timestamptz,
  add column if not exists last_login_at  timestamptz;

-- ----------------------------------------------------- crew_sessions
-- One row per signed-in device. Only the hash of the cookie's token is
-- stored, so this table is not a set of usable credentials either.
--
-- A table rather than a single token column on ambassadors: signing in
-- on a phone must not sign somebody out of their laptop, and signing
-- out must delete one session rather than blanking the account's only
-- token.
create table if not exists crew_sessions (
  token_hash    text primary key,
  ambassador_id uuid not null references ambassadors (id) on delete cascade,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null
);

create index if not exists crew_sessions_ambassador_idx on crew_sessions (ambassador_id);
-- Expired rows are harmless — resolveCrewSession checks expires_at — but
-- they accumulate. Sweep with:
--   delete from crew_sessions where expires_at < now();
create index if not exists crew_sessions_expires_idx on crew_sessions (expires_at);

alter table crew_sessions enable row level security;
revoke all on crew_sessions from anon, authenticated;

-- ambassadors was already revoked from anon and authenticated in
-- schema-mi.sql. Restated because it now holds a credential: even if a
-- Crew member somehow obtained a Supabase Auth account, the
-- authenticated role can read nothing here.
revoke all on ambassadors from anon, authenticated;

-- ----------------------------------------------------- referral codes
-- code already exists on ambassadors, unique, null until issued. The
-- index below makes the apply route's "is this a real Crew code?" check
-- a lookup rather than a scan, case-insensitively, because a code
-- typed into a form arrives in whatever case somebody used.
create unique index if not exists ambassadors_code_lower_idx
  on ambassadors (lower(code))
  where code is not null;
