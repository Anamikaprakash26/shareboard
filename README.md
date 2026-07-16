# ShareBoard

**Shareable links with privacy-aware view & unique-visitor analytics.**

A small, self-contained demo built to showcase a piece of product engineering:
tracking how often a public link is opened, and by how many distinct people,
**without a login, without slowing the page down, and without storing anyone's
raw IP address.**

> This is a **clean-room build** — an independent reimplementation of a feature I
> shipped during a real placement, rebuilt from scratch with a generic domain and
> entirely synthetic seed data. It contains no company code or data.

---

## What it does

- **Public share pages** at `/s/<slug>` render a shared document.
- Each open is counted: a **total view count** and, separately, the number of
  **unique visitors**.
- Some links are **password-gated** — no view is counted until they're unlocked.
- Visitors can **leave a short response** on a link.
- An **admin dashboard** at `/admin` shows per-link analytics, a per-visitor
  breakdown, and an **AI summary** of the responses.

## The engineering worth looking at

| Concern | How it's handled | Where |
| --- | --- | --- |
| **Anonymous identity** | A first-party visitor cookie (`httpOnly`, `Secure` in prod, `SameSite=Lax`, 1-yr TTL) minted **once** in middleware. Reflected onto the request in the same pass so the *first* view isn't lost. | `middleware.ts`, `lib/visitor-cookie.ts` |
| **No added latency** | The view writes are deferred with Next.js **`after()`**, so they run after the response is streamed — the visitor never waits on analytics. | `app/s/[slug]/page.tsx` |
| **Privacy** | The raw IP is **never stored**. It's read from proxy headers and immediately reduced to a salted SHA-256 hash. | `lib/ip.ts` |
| **Unique vs. total** | Total views live on `SharedLink.viewCount`; uniqueness is a `@@unique([sharedLinkId, visitorId])` constraint on `LinkView`, upserted per visitor. | `prisma/schema.prisma` |
| **Password gate** | scrypt hashing with a constant-time compare (no external dep); an unlock cookie gates content **and** view-counting. | `lib/password.ts`, `app/api/s/[slug]/unlock/route.ts` |
| **AI summary (prompt-injection hardened)** | Deterministic response count **plus** an LLM narrative that sanitizes and JSON-quotes untrusted respondent text, tells the model to treat quoted content as untrusted, budgets the digest, sets a timeout, and **falls back to the count if the AI call fails or no key is set**. | `lib/ai-summary.ts`, `app/api/admin/s/[slug]/summary/route.ts` |

## Stack

Next.js 15 (App Router, Server Components, Route Handlers, middleware, `after()`)
· TypeScript · Prisma ORM · **Postgres** (Neon) · the **Anthropic SDK** (Claude)
for the AI summary · deployed on **Vercel**.

## Run it locally

You need a Postgres database — the quickest is a free one from
[Neon](https://neon.tech).

```bash
npm install
cp .env.example .env    # paste your Postgres URL into DATABASE_URL
npm run setup           # applies migrations + seeds demo data
npm run dev             # http://localhost:3000
```

## Deploy (Vercel + Neon)

1. Create a free Postgres database at [neon.tech](https://neon.tech) and copy its
   connection string (use the **Direct**/unpooled one).
2. Import this repo at [vercel.com/new](https://vercel.com/new).
3. In **Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Neon connection string
   - `IP_HASH_SALT` — any long random string
   - `ANTHROPIC_API_KEY` — *optional*; enables live AI summaries (without it, the
     summary panel shows the deterministic response count)
4. Deploy. The `vercel-build` script runs `prisma migrate deploy`, so the schema
   is created on the first deploy.
5. Seed the demo data once, locally pointed at Neon: `npm run seed`.

Then:

1. Open a share link (e.g. `/s/welcome`) a few times, in normal **and** incognito
   windows — incognito is a new "visitor."
2. Watch `/admin` — total views climb every open, unique visitors climb only for a
   new browser.
3. Try `/s/secret-memo` (seeded password: **`letmein`**) — the view is only
   counted after you unlock it.

## Project layout

```
middleware.ts                     mint the anonymous visitor cookie
lib/visitor-cookie.ts             cookie name / TTL / options (single source)
lib/ip.ts                         proxy-header IP + salted hashing
lib/password.ts                   scrypt hash + constant-time verify
lib/db.ts                         Prisma client singleton
prisma/schema.prisma              SharedLink + LinkView
prisma/seed.ts                    synthetic demo data
app/s/[slug]/page.tsx             public page + deferred view tracking
app/api/s/[slug]/unlock/route.ts  password unlock
app/admin/…                       analytics dashboard + detail
```

## Résumé line this maps to

> Built privacy-aware view & unique-visitor analytics for publicly shared links
> using **Next.js (App Router) + Prisma/Postgres**, owning the schema, migrations,
> an anonymous `httpOnly` visitor cookie, and a deferred write path via Next.js
> `after()` — giving per-link view/visitor counts with **zero added latency** on
> the public page.
