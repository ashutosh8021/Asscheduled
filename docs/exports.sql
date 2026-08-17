-- AS SCHEDULED — ready-made exports
--
-- Paste any of these into the Supabase SQL Editor and hit Run, then use
-- "Download CSV" on the results grid. The output is meant to be opened
-- in Sheets and worked through, so columns are named in plain English,
-- codes are expanded, and times are in IST rather than UTC.

-- ---------------------------------------------------------------------
-- 1. APPLICATIONS — the one you will use most
-- ---------------------------------------------------------------------
select
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

-- ---------------------------------------------------------------------
-- 2. APPLICATIONS for one departure only
--    Swap the code for 'THO-26' as needed.
-- ---------------------------------------------------------------------
-- select
--   to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY') as "Applied",
--   reference as "Reference", name as "Name", '+91 ' || phone as "Phone",
--   college as "College", age as "Age", status as "Status"
-- from applications
-- where departure_code = 'REN-26'
-- order by created_at desc;

-- ---------------------------------------------------------------------
-- 3. Only the ones you have not dealt with yet
-- ---------------------------------------------------------------------
-- select
--   to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon, HH12:MI AM') as "Applied",
--   reference as "Reference", name as "Name", '+91 ' || phone as "Phone",
--   college as "College", coalesce(why, '—') as "Why they applied"
-- from applications
-- where status = 'new'
-- order by created_at asc;   -- oldest first: answer those first

-- ---------------------------------------------------------------------
-- 4. CONTACT MESSAGES
-- ---------------------------------------------------------------------
-- select
--   to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') as "Received",
--   name as "Name", email as "Email", '+91 ' || phone as "Phone",
--   message as "Message", status as "Status"
-- from messages
-- order by created_at desc;

-- ---------------------------------------------------------------------
-- 5. COLLABORATION ENQUIRIES
-- ---------------------------------------------------------------------
-- select
--   to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY') as "Received",
--   organisation as "Organisation", name as "Contact", email as "Email",
--   coalesce('+91 ' || phone, '—') as "Phone", kind as "Type",
--   coalesce(location, '—') as "Location", coalesce(dates, '—') as "Dates",
--   array_to_string(collab_on, ', ') as "Interested in",
--   details as "Details", status as "Status"
-- from collaborations
-- order by created_at desc;

-- ---------------------------------------------------------------------
-- 6. A count per departure — useful for seeing demand at a glance
-- ---------------------------------------------------------------------
-- select
--   departure_code as "Departure",
--   count(*)                                        as "Total",
--   count(*) filter (where status = 'new')          as "Unreviewed",
--   count(*) filter (where status = 'accepted')     as "Accepted"
-- from applications
-- group by departure_code
-- order by "Total" desc;
