# Admin area

`/admin` — the worklist for reviewing applications. Unlisted: nothing on
the site links to it, it is absent from `sitemap.xml`, and both pages send
`noindex, nofollow`. It exists only if you type the URL.

There is **no signup**. Accounts are created by hand in Supabase.

## Adding someone

1. Supabase dashboard → **Authentication → Users → Add user**.
2. Enter their email and a password. Tick **Auto Confirm User**, otherwise
   they cannot sign in until they click a confirmation email.
3. Add that email to `ADMIN_EMAILS` in `.env.local` (and in the host's
   environment variables once deployed), comma-separated.
4. Restart the server so the new value is read.

Both steps are required. A Supabase account alone gets you nothing.

## Why the allowlist exists

Supabase projects allow public signup by default. Without the allowlist,
anyone who found the project URL could create an account and walk into the
admin area. `ADMIN_EMAILS` is the real gate, and it **fails closed** — if
it is unset or empty, nobody is admitted, including you.

Worth doing regardless: turn off public signup in Supabase under
**Authentication → Providers → Email → Allow new users to sign up**.

## Removing someone

Take their address out of `ADMIN_EMAILS` and restart. That locks them out
immediately, even with a valid session, because the allowlist is checked on
every request. Delete the Supabase user too if they should lose the account
entirely.

## How the session works

Sign-in exchanges email and password with Supabase Auth for an access token
and a refresh token, both stored in `httpOnly` cookies so no script can read
them. Every admin page and API route calls `currentAdmin()`, which verifies
the token against Supabase and re-checks the allowlist — the cookie's
contents are never trusted on their own.

Access tokens last about an hour; the refresh token keeps a working session
alive for up to two weeks.

## What you can do there

- **Applications** — filter by status (new / reviewing / accepted / declined)
  and by departure, and move an application between statuses.
- **Messages** — contact form submissions.
- **Collabs** — collaboration enquiries.

For spreadsheets, use the views in `docs/views.sql` instead: they appear in
Supabase's Table Editor with a Download CSV button.

## A caution

Every read and write here uses the Supabase **service role key**, which
bypasses row level security entirely. That is why each route begins with
`currentAdmin()`. If you add a page or route under `/admin`, it must do the
same — there is no middleware doing it for you.

## Identity documents

Travellers upload a government photo ID and a college ID so travel can be
booked in their name. There are two ways this happens, set per departure by
`documentsAtApply` in `lib/departures.ts`:

**At application** (PULSE / `PUL-26`). The overlay asks for both documents
straight after the application lands, so you can check somebody is a real
student before selecting them. The cost is that you hold documents for
applicants you go on to decline — **purge those**, they are the ones you have
no reason to keep.

**After acceptance** (everything else). Mark someone accepted, send them the
upload link. Nobody who is turned down ever uploads anything, so the store
holds documents for confirmed travellers only.

Whichever door they came through, the link dies the moment an application is
declined, and nothing is ever public.

**Nothing is public.** Objects live in a private bucket. The admin views them
through a signed URL that expires in five minutes, so a URL that ends up in a
screenshot, a browser history or a log is dead before anyone finds it.

### One-time setup

1. Run `docs/schema-documents.sql` in the SQL editor.
2. **Storage → New bucket**, name it `documents`, and leave **Public** OFF.
   This is the single most important switch on this page. A public bucket
   would put every traveller's ID on the open internet at a guessable URL.
   Set the bucket's size limit to **4 MiB** and restrict MIME types to
   `image/jpeg, image/png, image/webp`. (The 50MB on the Storage settings
   page is the free plan's account-wide ceiling, is not adjustable, and is
   unrelated.)

   **Three limits, and they are not the same number.**

   - `MAX_BYTES` (10MB) is what somebody may CHOOSE. Generous on purpose:
     a phone photographs an ID card at 8-12MB.
   - `SEND_BYTES` (4MB) is what may actually be POSTED. Not our choice —
     Vercel refuses any request body over 4.5MB before the route runs.
   - The bucket's 4 MiB is the backstop behind both.

   A large photo passes all three because `lib/shrinkImage.ts` resizes it
   in the browser first: 2000px on the long edge, JPEG, stepping the
   quality down until it is under 1.6MB. A 9MB phone frame arrives as
   about 1.5MB and is more legible than the original. Nobody is asked to
   go and compress their own file.

   **Images only.** PDFs were accepted in code but the bucket never
   allowed the MIME type, so a PDF passed every check we made and was
   then refused by storage. Dropped on instruction rather than adding it:
   an ID card is a photograph, and every accepted type can be shrunk in
   the browser, which a PDF cannot.

Nothing works until both are done, and the failure is silent — the upload
page will simply say the link is invalid.

### Day to day

Expand an **accepted** application in the admin and you get a Documents panel.

- **UPLOAD LINK** issues a single-use link and shows a copy button. Send it
  over WhatsApp. It lasts 14 days. It is the only thing needed to upload
  against that application, so treat it like a password — and issuing a new
  one immediately kills the old one, which is how you revoke.
- **SHOW DOCUMENTS** fetches what has been uploaded. Deliberately not loaded
  with the row: somebody's government ID should be something you asked to
  see, not something that appears because you expanded a row.
- **DELETE** removes both the files and the records, permanently.

Issuing a link, viewing documents and deleting them are each logged
server-side with your email address. That is on purpose.

### Retention

The privacy policy says documents are deleted after the departure ends. That
promise is currently kept by hand — use DELETE on each traveller once a trip
is over. `docs/schema-documents.sql` creates a `documents_expired` view
listing anything older than 120 days so nothing gets quietly forgotten.

TODO(mannat): automate this. A promise in a privacy policy that depends on
somebody remembering is a promise that eventually gets broken.

## Partner discounts

PULSE'26 carries **PULSE2026 — ₹1,000 off, applied automatically to everyone
who applies to it.** No link to arrive on, no code to type, nothing to miss:
the arrangement is with the festival, so it covers everybody going to the
festival however they found us. That is the `auto: true` flag in
`lib/partners.ts`.

A partner without `auto` is referral-only: the discount applies only to
somebody carrying `?p=<code>`, which middleware turns into an httpOnly
cookie. Both routes go through one function, `partnerFor()`.

**The discount is decided by the server, never by the browser.** The page
reads it to show a price; `app/api/somewhere/apply/route.ts` works it out
again before storing anything. A request that posts its own partner code,
discount or amount is ignored — those values are derived, so there is
nothing for a client to influence. The coupon is rendered as a tag, never
as an input: there is no field to type it into.

Configured in `lib/partners.ts`: which departures a code covers, the flat
rupee discount, the date it stops working, and the address applications are
copied to. An expired code, a code for the wrong departure, or an unknown
one all mean full price rather than an error.

⚠️ **The list price is currently a price nobody pays.** Both fare tables
carry ₹1,000 to fund the coupon, which made sense while it was referral-only
— people arriving on their own really did pay it. Now that it applies to
everyone, the struck-through figure on the card claims a saving that is not
real. Either drop the ₹1,000 from `lib/packages.ts` and retire the coupon,
or keep the coupon and stop rendering the "was" price.

## The partner panel

`/partner` — the festival's own read-only view of its departure. PULSE signs in
at `/admin/login` with an ordinary Supabase account and is sent there
automatically; `destinationFor()` decides that from the allowlists, because a
partner sent to `/admin` would be refused and bounced back to the login screen,
which looks exactly like a wrong password.

**Two allowlists, never merged.** `ADMIN_EMAILS` is full access.
`PARTNER_EMAILS` sees the roster and documents for departures with `sharedWith`
set — currently PULSE only — and nothing else: not Thomso, not messages, not
collaborations, and nothing they can change. Both fail closed.

Scope comes back attached to the viewer from `currentViewer()`, not from the
request. There is no departure parameter to tamper with, and document bundles
are filtered *before* any URL is signed, so a partner's page load never mints a
signed URL for somebody else's ID.

Admins can open `/partner` too, so you can see exactly what PULSE sees without
keeping a second account.

### Adding someone from the festival

1. Supabase → **Authentication → Users → Add user**, tick **Auto Confirm User**.
2. Add the address to `PARTNER_EMAILS` — locally and in Vercel.
3. Redeploy. Removing the address and redeploying revokes access immediately,
   even on a live session, because the list is checked on every request.

### Why documents are visible there

Both parties admit people to a campus, so both need to check the person at the
gate is the person who applied. Documents are shown through signed URLs that
expire in minutes rather than handed over as copies, the panel is read-only,
and every read is logged with the email that made it.

This is disclosed in the privacy policy, which was updated in the same change.
**If you ever narrow or widen what the panel shows, the policy has to move with
it** — applicants are told exactly this list.

## Plans and per-state fares

PULSE is sold as two plans, and each one is priced per state, because the
train is. Both fare tables live in `lib/packages.ts` and that is the only
place a fare is written down.

The browser reads that table to **show** a price; `app/api/somewhere/apply/route.ts`
reads it again to **record** one, from the plan and state that were submitted.
The form never posts an amount, so there is nothing there for anyone to edit.
A plan id is only accepted for a departure that actually sells it — a PULSE
plan posted against Thomso resolves to nothing rather than to a PULSE fare.

**To change a fare**, edit the table. The card, the detail page, the price
range on the homepage and the amount the form asks for all follow, because
all four are derived from it.

**Eleven states and union territories have no fare yet** — Kerala, Tamil Nadu,
Tripura, Delhi, Jammu and Kashmir, Ladakh, Puducherry, Chandigarh, Andaman and
Nicobar Islands, Lakshadweep, and Dadra and Nagar Haveli and Daman and Diu.
Somebody from one of those can still apply: they are told we will confirm
their fare, are not asked for a payment or a UTR, and the row is stored with
no amount due. **Those applications need chasing by hand** — check the admin
for a PULSE row with a plan and no amount.

**By default the whole fare is due at application time.** If that should be a
smaller deposit instead, set `bookingInr` on the departure in
`lib/departures.ts` — that is the entire change. The form then shows the
deposit, the route records it, and the fare table is only used for display.

## The live Google Sheet

The sheet mirrors what the admin panel shows, as it changes — not just what
arrived. An application is pushed when it is submitted, when you move it
between new / reviewing / accepted / declined, and when a document comes in.

**PULSE only.** `MIRRORED_DEPARTURES` in `lib/sheet.ts` is the single gate, and
every path into the sheet goes through it, so Thomso and Rendezvous applicants
are never sent. The sheet is shared with PULSE; it must not carry people they
have nothing to do with.

Nothing about this can fail an application — if the sheet is unreachable the
row is already safe in Postgres and the failure is only logged.

### One-time setup

1. Create a Google Sheet you own.
2. Leave row 1 empty. The script writes the header itself, bolds it and
   freezes it — `SHEET_HEADERS` in `lib/sheet.ts` is where the labels live.
   (Pasting a tab-separated header by hand drops the tabs and lands the whole
   thing in cell A1, which then looks exactly like every column being
   misaligned. Hence sending it.)

3. **Extensions → Apps Script**, and paste:

```javascript
function doPost(e) {
  const b = JSON.parse(e.postData.contents);
  if (b.secret !== 'PUT_THE_SECRET_HERE') {
    return ContentService.createTextOutput('no');
  }

  const sh = SpreadsheetApp.getActiveSheet();
  const cols = b.columns;
  const rows = b.rows || [];

  // Write the header ourselves, every push, so it is right the first
  // time and repairs itself if somebody edits it.
  if (b.header && b.header.length) {
    sh.getRange(1, 1, 1, b.header.length)
      .setValues([b.header])
      .setFontWeight('bold');
    if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  }

  // Index the references already in the sheet (column B), so a row
  // that is already here gets updated in place instead of duplicated.
  const last = sh.getLastRow();
  const index = {};
  if (last > 1) {
    const refs = sh.getRange(2, 2, last - 1, 1).getValues();
    for (let i = 0; i < refs.length; i++) index[String(refs[i][0])] = i + 2;
  }

  const append = [];
  rows.forEach(function (r) {
    const line = cols.map(function (c) { return r[c] === null ? '' : r[c]; });
    const at = index[r.reference];
    // Only the mirrored columns are written. Anything you add to the
    // right of them — notes, a follow-up column — is never touched.
    if (at) sh.getRange(at, 1, 1, line.length).setValues([line]);
    else append.push(line);
  });

  if (append.length) {
    sh.getRange(sh.getLastRow() + 1, 1, append.length, append[0].length)
      .setValues(append);
  }

  return ContentService.createTextOutput('ok ' + rows.length);
}
```

4. **Deploy → New deployment → Web app.** Execute as **Me**, access
   **Anyone**. Copy the URL it gives you.
5. Put the URL in `SHEET_WEBHOOK_URL` and the same secret in
   `SHEET_WEBHOOK_SECRET` — in `.env.local` to try it locally, and in Vercel
   for the live site.
6. In the admin, press **RESYNC SHEET**. That fills the new sheet with
   everything that arrived before it existed.
7. **Share → PULSE's Google account, Viewer.**

"Anyone" is what lets us POST without credentials; it cannot read the sheet.
The secret in the body is what stops strangers appending rows.

### RESYNC SHEET

The live mirror is fire-and-forget: it must never hold an applicant or an admin
waiting on Google, which means an update can be missed — an outage, a
redeployed script, a revoked URL. RESYNC is the repair.

Safe to run whenever. Rows are keyed on the reference, so it updates what is
there and appends what is not. It never duplicates, and it never clears a
column you added yourself.

**Redeploying the Apps Script changes the URL** unless you deploy to the same
version. If the sheet quietly stops updating, that is the first thing to check.

### What it means to share it

The sheet holds applicants' names, phone numbers, colleges, payment references
and now their status and which documents they have sent. Sharing it with PULSE
is **disclosure to a third party**, not just storage, and the privacy policy
has to say so.

Document *names* go in the sheet — never links. A signed URL sitting in a
shared spreadsheet would hand a partner somebody's Aadhaar.

It is also a second copy: deleting a row in Supabase does not delete it from
the sheet, so a deletion request means clearing both.

## Booking payments

A departure with `bookingInr` set asks for a UPI transfer at application time:
the amount owed, where to send it, the UTR, and a screenshot. The screenshot is
a third document kind alongside the two IDs, in the same private bucket under
the same rules.

Nothing verifies a UTR. It is recorded as typed and **checked against the bank
by hand** — the form says as much rather than implying a confirmation that has
not happened.
