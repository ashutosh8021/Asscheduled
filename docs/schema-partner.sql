-- AS SCHEDULED — partner referrals and UPI payment
--
-- Run this in the Supabase SQL editor, after docs/schema-somewhere.sql
-- and docs/schema-documents.sql. Safe to re-run.

-- ---------------------------------------------------------------
-- 1. What the application carries
-- ---------------------------------------------------------------
-- partner_code, discount_inr and amount_due are all written by the
-- server from its own calculation. The browser never sends an amount:
-- a price the client can name is a price the client can change.
--
-- They are recorded rather than recomputed later because a partner
-- deal can end. What somebody was charged on the day has to stay
-- readable after the code expires and the config changes.
-- `plan` is which package they chose, for departures sold as more than
-- one — a plan id from lib/packages.ts, never a price. The fare it
-- resolves to is recorded separately in amount_due, because a fare
-- table can be edited and what somebody owed on the day cannot.
alter table applications
  add column if not exists plan          text,
  add column if not exists partner_code  text,
  add column if not exists discount_inr  int  check (discount_inr  >= 0),
  add column if not exists amount_due    int  check (amount_due    >= 0),
  -- The UPI reference the applicant types after transferring. Checked
  -- by hand against the bank; there is no automatic reconciliation.
  add column if not exists utr           text,
  add column if not exists paid_at       timestamptz;

-- Only for reporting on a partner's referrals — partial, because the
-- overwhelming majority of rows will have no partner at all.
create index if not exists applications_partner_idx
  on applications (partner_code)
  where partner_code is not null;

-- ---------------------------------------------------------------
-- 2. Payment screenshots
-- ---------------------------------------------------------------
-- A third kind alongside the two identity documents. It lives in the
-- same private bucket under the same rules: never public, read through
-- a signed URL that dies in minutes, deleted with the rest.
alter table documents drop constraint if exists documents_kind_check;
alter table documents add constraint documents_kind_check
  check (kind in ('photo_id', 'college_id', 'payment_proof'));

-- ---------------------------------------------------------------
-- 3. Reporting
-- ---------------------------------------------------------------
-- Counts only. If a partner ever needs numbers without names, this is
-- what to share rather than the applications table.
create or replace view partner_totals as
  select partner_code,
         departure_code,
         count(*)                                        as applications,
         count(*) filter (where utr is not null)          as with_payment,
         coalesce(sum(discount_inr), 0)                   as discount_given,
         coalesce(sum(amount_due), 0)                     as amount_due_total
    from applications
   where partner_code is not null
   group by partner_code, departure_code;
