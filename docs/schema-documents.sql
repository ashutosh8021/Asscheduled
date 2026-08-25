-- AS SCHEDULED — identity documents
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql.
-- Safe to re-run.
--
-- Documents are requested only from applicants who have been ACCEPTED.
-- Nobody who is rejected ever uploads anything, so the store only ever
-- holds documents for people actually travelling. That is the single
-- most effective control here: you cannot leak what you never held.

-- ---------------------------------------------------------------
-- 1. The upload link
-- ---------------------------------------------------------------
-- Only a hash of the token is stored, never the token itself — same
-- reasoning as a password. Anyone reading this table cannot use what
-- they find to open somebody's upload page.
alter table applications
  add column if not exists documents_token_hash text,
  add column if not exists documents_expires_at timestamptz;

create index if not exists applications_doctoken_idx
  on applications (documents_token_hash)
  where documents_token_hash is not null;

-- ---------------------------------------------------------------
-- 2. The documents themselves
-- ---------------------------------------------------------------
create table if not exists documents (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,

  -- 'photo_id'   — any government photo ID. Masked Aadhaar is requested,
  --                but passport, driving licence and voter ID are all
  --                accepted; nobody is required to send Aadhaar.
  -- 'college_id' — proof they are a student.
  kind           text not null check (kind in ('photo_id', 'college_id')),

  -- Path inside the private storage bucket. Not a URL: the object is
  -- never public, and the admin reads it through a short-lived signed
  -- URL generated at view time.
  storage_path   text not null,
  mime_type      text not null,
  size_bytes     int  not null check (size_bytes > 0),

  uploaded_at    timestamptz not null default now()
);

-- One document of each kind per application. Re-uploading replaces
-- rather than accumulating copies of somebody's ID.
create unique index if not exists documents_app_kind_key
  on documents (application_id, kind);

create index if not exists documents_uploaded_idx on documents (uploaded_at desc);

-- Same posture as every other table: RLS on, no policies, grants
-- revoked. Only the server routes touch this, using the service role.
alter table documents enable row level security;
revoke all on documents from anon, authenticated;

-- ---------------------------------------------------------------
-- 3. Retention
-- ---------------------------------------------------------------
-- Rows for documents past their keep-by date. The storage objects
-- themselves are removed by the admin purge action, which reads this
-- and then deletes both the object and the row — Postgres cannot reach
-- into the storage bucket on its own.
--
-- Departure end dates live in lib/departures.ts (CLAUDE.md: trip data
-- lives in one place), so this cannot join to them. It uses upload age
-- instead, which is a coarser but honest proxy.
create or replace view documents_expired as
  select d.id,
         d.application_id,
         d.kind,
         d.storage_path,
         d.uploaded_at,
         a.reference,
         a.departure_code
    from documents d
    join applications a on a.id = d.application_id
   where d.uploaded_at < now() - interval '120 days';
