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
