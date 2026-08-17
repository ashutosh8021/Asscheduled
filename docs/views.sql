-- AS SCHEDULED — export views
--
-- Run this ONCE in the Supabase SQL Editor. After that, three extra
-- entries appear in Table Editor:
--
--   applications_export
--   messages_export
--   collaborations_export
--
-- Open one, click Download CSV, and you get a clean spreadsheet — no SQL
-- needed. They are live: whatever is in the tables right now is what you
-- get, so there is nothing to refresh or re-run.
--
-- Safe to re-run; `create or replace` just updates the definition.
--
-- Note on security_invoker: a Postgres view normally runs with its
-- OWNER's privileges, which would let it read straight past the row
-- level security on the underlying tables. `security_invoker = on`
-- makes it run as whoever is querying instead, so these views are
-- exactly as locked down as the tables behind them. The explicit
-- revokes at the bottom are a second layer on top of that.

-- ---------------------------------------------------------- applications
create or replace view applications_export
with (security_invoker = on) as
select
  created_at                                                                 as sort_key,
  to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') as "Applied",
  reference                                                                  as "Reference",
  case departure_code
    when 'REN-26' then 'Rendezvous''26 — IIT Delhi'
    when 'THO-26' then 'Thomso''26 — IIT Roorkee'
    else departure_code
  end                                                                        as "Departure",
  name                                                                       as "Name",
  '+91 ' || phone                                                            as "Phone",
  age                                                                        as "Age",
  gender                                                                     as "Gender",
  college                                                                    as "College",
  state                                                                      as "State",
  occupation                                                                 as "Occupation",
  coalesce('@' || instagram, '—')                                            as "Instagram",
  coalesce(why, '—')                                                         as "Why they applied",
  status                                                                     as "Status"
from applications
order by created_at desc;

-- ------------------------------------------------------------- messages
create or replace view messages_export
with (security_invoker = on) as
select
  created_at                                                                 as sort_key,
  to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') as "Received",
  name                                                                       as "Name",
  email                                                                      as "Email",
  '+91 ' || phone                                                            as "Phone",
  message                                                                    as "Message",
  status                                                                     as "Status"
from messages
order by created_at desc;

-- ------------------------------------------------------- collaborations
create or replace view collaborations_export
with (security_invoker = on) as
select
  created_at                                                          as sort_key,
  to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY')      as "Received",
  organisation                                                        as "Organisation",
  name                                                                as "Contact",
  email                                                               as "Email",
  coalesce('+91 ' || phone, '—')                                      as "Phone",
  kind                                                                as "Type",
  coalesce(location, '—')                                             as "Location",
  coalesce(dates, '—')                                                as "Dates",
  array_to_string(collab_on, ', ')                                    as "Interested in",
  details                                                             as "Details",
  status                                                              as "Status"
from collaborations
order by created_at desc;

-- ------------------------------------------------------------------ RLS
-- Same posture as the tables: nothing public can read these.
revoke all on applications_export   from anon, authenticated;
revoke all on messages_export       from anon, authenticated;
revoke all on collaborations_export from anon, authenticated;
