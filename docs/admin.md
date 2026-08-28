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
   Set the bucket's size limit to 2MB and restrict MIME types to
   `image/jpeg, image/png, image/webp, application/pdf`. The upload route
   enforces both as well, so the bucket is a backstop rather than the
   control. (The 50MB on the Storage settings page is the free plan's
   account-wide ceiling, is not adjustable, and is unrelated.)

   Uploads are capped at 2MB and nothing is resized for anyone — people
   compress their own files. The form says so above the file picker, and
   an oversized file is rejected with its actual size in the message.
   Expect this to come up: a phone photo is usually 3-5MB.
   Optionally set the bucket's own size limit to 2MB and restrict MIME
   types to `image/jpeg, image/png, image/webp, application/pdf` — both are
   already enforced by the upload route, so this is a backstop rather than
   the control. (The 50MB figure on the Storage settings page is the free
   plan's account-wide ceiling and is not adjustable; it is unrelated.)

   The app caps uploads at 1.9MB, deliberately under the bucket, so the
   rejection comes from the route with a readable message rather than from
   storage with an error code. Photos over that are resized in the browser
   before they are sent — a 4000x3000 phone frame comes out around 1800px
   and well under a megabyte and a half — so in practice only an oversized
   PDF ever hits the limit.

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

## Partner referral links

A festival links to us with `?p=<code>` — for PULSE, that is
`https://asscheduled.com/somewhere/pulse-aiims-delhi?p=pulse`. Middleware
turns the code into a cookie, and every price on the site drops by the
partner's discount for as long as it is valid.

**The discount is decided by the server, never by the browser.** The page
reads the cookie to show a price; `app/api/somewhere/apply/route.ts` reads
the same cookie and works the price out again before storing anything. A
request that posts its own partner code, discount or amount is ignored —
those values are derived, so there is nothing for a client to influence.

Codes are configured in `lib/partners.ts`: which departures they cover, the
flat rupee discount, and the date they stop working. An expired code, a code
for the wrong departure, or an unknown one all mean full price rather than an
error — somebody on a stale link should get a working page.

Setup: run `docs/schema-partner.sql`, then fill in the `PARTNERS` entry. Until
that entry exists nothing changes anywhere on the site.

**The link is public.** Anyone who sees it can share it, so treat the expiry
date as the real control.

## The live Google Sheet

Applications are mirrored into a sheet as they arrive. Nothing about this can
fail an application — if the sheet is unreachable the row is already safe in
Postgres and the failure is only logged.

### One-time setup

1. Create a Google Sheet you own.
2. **Extensions → Apps Script**, and paste:

```javascript
function doPost(e) {
  const b = JSON.parse(e.postData.contents);
  if (b.secret !== 'PUT_THE_SECRET_HERE') {
    return ContentService.createTextOutput('no');
  }
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), b.reference, b.departure, b.name, b.phone, b.gender, b.age,
    b.state, b.occupation, b.college, b.instagram, b.why,
    b.partner, b.discountInr, b.amountDue, b.utr,
  ]);
  return ContentService.createTextOutput('ok');
}
```

3. **Deploy → New deployment → Web app.** Execute as **Me**, access
   **Anyone**. Copy the URL it gives you.
4. Put the URL in `SHEET_WEBHOOK_URL` and the same secret in
   `SHEET_WEBHOOK_SECRET`, in Vercel.
5. **Share → PULSE's Google account, Viewer.**

"Anyone" is what lets us POST without credentials; it cannot read the sheet.
The secret in the body is what stops strangers appending rows.

### What it means to share it

The sheet holds applicants' names, phone numbers, colleges and payment
references. Sharing it with PULSE is **disclosure to a third party**, not just
storage, and the privacy policy has to say so. It is also a second copy:
deleting a row in Supabase does not delete it from the sheet, so a deletion
request means clearing both.

## Booking payments

A departure with `bookingInr` set asks for a UPI transfer at application time:
the amount owed, where to send it, the UTR, and a screenshot. The screenshot is
a third document kind alongside the two IDs, in the same private bucket under
the same rules.

Nothing verifies a UTR. It is recorded as typed and **checked against the bank
by hand** — the form says as much rather than implying a confirmation that has
not happened.
