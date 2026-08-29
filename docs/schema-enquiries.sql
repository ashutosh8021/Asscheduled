-- AS SCHEDULED — enquiries attached to a departure
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql.
-- Safe to re-run.

-- The custom-booking block on a departure page links to /contact with
-- ?about=<departure id>, so "can we skip the meals" arrives attached to
-- the trip it is about rather than as an unattributed message.
--
-- Nullable, because most enquiries come from the contact page itself and
-- are about nothing in particular. Written by the server from its own
-- lookup against lib/departures.ts — an unknown value is dropped rather
-- than stored, so this can never name a departure that does not exist.
alter table messages
  add column if not exists departure_code text;

-- Partial: the overwhelming majority of rows will have no departure, and
-- the only query that uses this asks for the ones that do.
create index if not exists messages_departure_idx
  on messages (departure_code)
  where departure_code is not null;
