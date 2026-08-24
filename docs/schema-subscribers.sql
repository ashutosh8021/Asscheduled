-- AS SCHEDULED — mailing list
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql.
-- Safe to re-run.

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  -- The footer's "select ur preference" radio. Stored as submitted.
  -- TODO(mannat): what does this actually mean? As labelled it reads as
  -- a preference about people rather than about content.
  preference    text,
  -- Proof of consent: when the box was ticked, and where from.
  consented_at  timestamptz not null default now(),
  source        text not null default 'footer',
  status        text not null default 'subscribed'
                  check (status in ('subscribed', 'unsubscribed')),
  created_at    timestamptz not null default now()
);

-- One row per address. Re-submitting the same email updates the existing
-- row rather than creating a duplicate, and re-subscribes anyone who had
-- opted out.
--
-- This must be a plain column unique, not an index on lower(email): the
-- upsert in lib/store.ts asks PostgREST for on_conflict=email, and
-- Postgres will not match that to an expression index. The route already
-- lowercases the address before it gets here (app/api/somewhere/subscribe),
-- so the column itself is always normalised.
create unique index if not exists subscribers_email_key
  on subscribers (email);

create index if not exists subscribers_created_idx on subscribers (created_at desc);

-- Same posture as every other table: RLS on, no policies, grants revoked.
-- Only the server routes touch this, using the service role key.
alter table subscribers enable row level security;
revoke all on subscribers from anon, authenticated;
