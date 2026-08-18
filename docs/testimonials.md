# Testimonials

## Status: none confirmed

`lib/copy.ts` currently holds four quotes attributed to AARAV, RIYA, KARAN
and MEHA. They came from the design comps, not from real travellers, and
they are **flagged as unverified**. Until someone confirms they are real,
they should be treated as placeholder text, not social proof.

The components render whatever is in `TESTIMONIALS`. Empty the array and
the sections disappear cleanly — no layout breaks, nothing to redesign.

## Why these can't just be written

The site sells trips at ₹12,499–₹16,499. A quote presented as a real
customer's experience, when no such customer exists, is a false
endorsement — it's the specific thing that makes someone click Apply.

In India that's covered by the Consumer Protection Act 2019 and the BIS
standard on online reviews (IS 19000:2022), which require reviews to be
genuine and traceable to a real reviewer. The CCPA has acted on fake
reviews. ASCI's code says the same for endorsements.

There's a practical risk too. This audience is small and connected —
students at the same fests, in the same group chats. A glowing quote from
"Aarav, Delhi" that nobody can find is the kind of thing that gets
screenshotted.

`CLAUDE.md` already bans it outright: *"no invented testimonials or
reviews."*

## Getting real ones — you're closer than you think

Alcheringa ran with 70 people. Mood Indigo ran with a full group. That's
a pool of real travellers who can be asked directly.

Four real quotes is one message. Something like:

> Hey — we're building the AS Scheduled site and we'd love to put your
> words on it. Two lines on what the trip was actually like: what you
> expected, what surprised you, whether you'd go again. Say it however you
> talk — we're not looking for a review, just the honest version.
>
> Happy to use just your first name and city, or keep you anonymous. And
> tell us if you'd rather not be quoted at all, no problem either way.

Ask ten people, use the best four. Real ones read better than anything
written to order — they contain specifics nobody invents, like the exact
thing that went wrong and turned out fine.

## Adding them

Edit `TESTIMONIALS` in `lib/copy.ts`:

```ts
{
  quote: "…",
  name: "First name",     // or null to show "Student"
  from: "City → Fest",
}
```

They appear on `/about` (the first three) and `/faqs` (all of them).

## Consent

Get explicit permission to publish before adding a quote, and again if you
attach a name, a city or a photo. Same applies to the group photos in the
gallery — see the note at the top of `lib/gallery.ts`.

## If you want copy there sooner

Non-testimonial proof is honest and available today:

- **70 travellers** on Alcheringa — a real, verifiable number.
- **Real photography** of real groups, already on the site.
- **Two fests already run**, now shown under "Where we've been".

That says more than four anonymous quotes, and none of it can be
challenged.
