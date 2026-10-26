---
name: admin-panel
description: How the AS Scheduled admin panel (/admin, /partner) is built — auth, data layer, API routes, table components, styling — and a checklist for building another panel the same way. Use before adding or changing anything under app/admin, app/partner, app/api/admin or lib/admin*.ts.
---

# Admin panel

The admin is part of the Next.js app (`app/`), not the Astro site (`site/`).
Read `docs/admin.md` for the operational side (accounts, documents, sheet, crew).

## Where things are

| Path | What |
|---|---|
| `app/admin/page.tsx` | The whole admin: one server page. Tabs are `?tab=` query params (applications, messages, documents, collabs, crew); filters are `?status=` and `?departure=`. |
| `app/admin/login/page.tsx` + `LoginForm.tsx` | Sign-in. Shared by admins and partners; the server decides where each goes (`destinationFor`). |
| `app/admin/*Table.tsx`, `DocumentsTab.tsx` | One client component per tab. |
| `app/admin/admin.css` | Every admin style. Imported by each panel page (`import "./admin.css"` / `"../admin/admin.css"`). |
| `app/partner/page.tsx` + `PartnerRoster.tsx` | A second panel: read-only and scoped to departures. **The model for any new panel.** |
| `app/partner/spring-fest/page.tsx` | The same roster, scoped to SF-27 for the Spring Fest team, using `tabs` and `full` props. The worked example of a one-departure panel. |
| `app/api/admin/<action>/route.ts` | One POST route per action: `status`, `delete`, `documents`, `crew`, `resync`, `login`, `logout`; `arrivals` is a GET. |
| `lib/admin.ts` | Auth: `currentAdmin()`, `currentViewer()`, `signIn`, cookies. |
| `lib/adminData.ts` | All admin reads and writes (PostgREST over `fetch`, service role key). Row types live here. |
| `lib/departures.ts` | `ALL_DEPARTURES`, `sharedWith`, `documentsAtApply`, `inr()`. |
| `lib/packages.ts` / `lib/sitePlans.ts` | Plans: the old app's (`findPlan`), and the public site's (`sitePlanFor`, `SITE_PLANS`). Site-only departures (no `ALL_DEPARTURES` entry) are named in `SITE_DEPARTURES`. |
| `docs/schema-*.sql` | The schema, as migrations run by hand in the Supabase SQL editor. |

There is **no sidebar and no `app/admin/layout.tsx`**. Navigation is the top bar
(`.a-bar`) plus rows of tab links (`.a-tabs`/`.a-tab`).

## Auth and permissions

- Supabase Auth over REST, no SDK. Login posts to `/api/admin/login`, which sets
  the httpOnly cookies `as_admin` (access token) and `as_admin_r` (refresh token).
- **Every page and every API route starts with the check. There is no middleware
  doing it.** Pages: `const admin = await currentAdmin(); if (!admin) redirect("/admin/login");`.
  Routes: return `401 {ok:false,error:"Not signed in."}`.
- `currentAdmin()` verifies the token with Supabase on each call, then checks
  `ADMIN_EMAILS`. `currentViewer()` also admits `PARTNER_EMAILS`, returning a
  `role` and a `departures` scope. `currentSpringFestViewer()` admits admins plus
  `SPRINGFEST_EMAILS`, scoped to SF-27. A team that must see one departure only
  gets **its own allowlist and viewer function** like this one, never a spot on
  `PARTNER_EMAILS`. Every allowlist fails closed, and `destinationFor()` routes
  each list to its panel after login.
- Scope always comes from the viewer, **never from a request parameter**.
- Mutations are admin-only (`currentAdmin`), even when the read is viewer-scoped.
- Crew (`lib/crew.ts`, `/crew`) is a separate auth system and never imports `lib/admin.ts`.

## Shared pieces to reuse (import, don't copy)

- `Detail` + `fullWhen` (`app/admin/Detail.tsx`): the expanded row; pass a `Field[]`.
- `SignOut` (email + button) and `Arrivals` (the 30-second "something came in"
  poll) go in the top bar of every panel.
- `DocumentsPanel` (per-row upload link, view, purge) and `DocumentsTab` (all
  documents, grouped by person).
- `ApplicationsTable`, `MessagesTable`: complete tables, including search, status
  moves and two-press delete.
- CSS classes: `a-root a-wrap a-bar a-bar-title a-tabs a-tab[data-on] a-tab-count
  a-scroll a-table a-nowrap a-dim a-strong a-why a-pill[data-s] a-actions a-btn
  a-btn-primary a-btn-danger a-row-toggle a-empty a-search a-dt-*`.

## One section end to end (applications)

1. **Table**: `applications` (`docs/schema-somewhere.sql`, with columns added by
   `schema-partner.sql`, `schema-hallucia.sql`, `schema-mi.sql` and
   `schema-documents.sql`). RLS is on and anon can only insert; the admin reads with
   the service role.
2. **Create**: rows come from the public forms (`app/api/site/booking/route.ts`,
   `app/api/somewhere/apply/route.ts`) via `saveApplication` in `lib/store.ts`.
   **The admin has no create or edit forms.** It reviews, changes status and deletes.
3. **Read**: `listApplications({status, departure})` in `lib/adminData.ts`
   builds a PostgREST query (`departure_code=eq.X`) through the private `select<T>()`
   helper, which returns `[]` on any error and logs it.
4. **Page**: `app/admin/page.tsx` is an `async` server component with
   `dynamic = "force-dynamic"` and `robots: noindex`. It fetches only what the
   active tab needs, in one `Promise.all`, and passes the rows to the client table.
5. **Update**: `ApplicationsTable` POSTs `{id, status}` to `/api/admin/status`,
   which checks the admin, validates against `APPLICATION_STATUSES`, calls
   `setApplicationStatus`, logs `[admin] <email> set <id> → <status>`, and runs
   `after(() => mirrorApplication({id}))`. Then the client calls `router.refresh()`.
   **Never use optimistic local state.**
6. **Delete**: `/api/admin/delete` removes storage objects, then document rows,
   then the application row, in that order. In the UI, delete takes two presses
   (`armed` state), never a `confirm()`.

## Conventions

- Files: `PascalCase.tsx` for components, colocated in the panel folder;
  `"use client"` only on interactive components. Routes are `route.ts` with
  `runtime = "nodejs"` and `dynamic = "force-dynamic"`.
- API responses are always `{ ok: boolean, error?: string, ... }`. Status codes:
  400 for bad input, 401 when not signed in, 404 when missing, 502 when Supabase failed.
- Every sensitive action is logged with the admin's email. Never log tokens or passcodes.
- UI labels are uppercase and deadpan (`ACCEPT`, `NOTHING HERE YET.`). Times are
  shown in IST with `en-IN`, and money with `inr()`.
- Optional DB columns are `?:` on row types, so a migration that hasn't run never crashes the page.
- Comments explain why, in full sentences, like the code around them. No `any`.
- Dark admin palette in `admin.css`. The brand tokens and red-stamp rule apply to
  the public site, not here.

## Checklist: a new panel built the same way

1. Decide who sees it: admins only (`currentAdmin`), or admins plus an outside
   team (a new allowlist env var and a viewer function modelled on
   `currentSpringFestViewer`, a `destinationFor` branch, and the allowed redirect
   in `LoginForm.tsx`). Write it down in `docs/admin.md` and `.env.example`. If
   outsiders see applicant data, the privacy policy (`site/src/components/privacy/`)
   must say so in the same change.
2. Add the page at `app/admin/<name>/page.tsx` (or `app/<name>/page.tsx` for an
   outside party). Include the auth check, `force-dynamic`, `noindex` and `import admin.css`.
3. Reads: add a scoped function to `lib/adminData.ts` (or reuse `listApplications({departure})`,
   `listDocumentBundles(departure)`, `listMessagesFor([...])`, `arrivalCounts([...])`).
4. Top bar: `.a-bar` with title, tab links, `<Arrivals>`, `<SignOut>`.
5. Tabs: `?tab=` links, fetching only the active tab's rows.
6. Tables: reuse `ApplicationsTable`/`DocumentsTab`/`MessagesTable`. If a new
   table is needed, follow `MessagesTable` (`Fragment` + toggle + `Detail`).
7. Actions: reuse the existing `/api/admin/*` routes. A new action means a new
   `app/api/admin/<action>/route.ts` with check, parse, validate, write, log, then `router.refresh()`.
8. Schema changes: a new `docs/schema-<name>.sql` using `add column if not exists`,
   plus an optional `?:` field on the row type.
9. Run `pnpm typecheck && pnpm lint && pnpm build`. Sign in at `/admin/login` with
   an address in `ADMIN_EMAILS` (`.env.local`).
