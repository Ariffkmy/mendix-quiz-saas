# Mendix Advanced — Exam Simulator

A paid practice-exam SaaS for the **Mendix Advanced Developer certification**. Users pay once via
Stripe, sign in with a magic link, sit a timed 16-question exam, and get a scored report with a
topic-by-topic breakdown and an explanation for every question.

**Stack:** Vite · React 19 · Tailwind CSS v4 · Supabase (Auth + Postgres) · Stripe Checkout ·
React Router 7 · Vercel serverless functions.

---

## Features

### Two tiers

|                          | Free                   | Full access (one-time payment) |
| ------------------------ | ---------------------- | ------------------------------ |
| Sign-up                  | Email + password       | Stripe Checkout                |
| Exam attempts            | **1**                  | Unlimited                      |
| Sees score / pass-fail   | **No**                 | Yes                            |
| Topic breakdown & review | No                     | Yes                            |
| Analytics dashboard      | No                     | Yes                            |
| Study guides             | No                     | Yes                            |

A free account sits the *whole* exam — same questions, same clock — and gets a
confirmation instead of a result. Upgrading later unlocks the attempt already on
record.

### Routes

| Route        | What it does                                                                        |
| ------------ | ----------------------------------------------------------------------------------- |
| `/`          | Landing page — hero with both CTAs, tier comparison, 8 modules, pricing, FAQ         |
| `/register`  | Free sign-up: email + password, lands on the dashboard                              |
| `/login`     | Magic-link sign-in (with an optional password path for registered accounts)          |
| `/checkout`  | Email capture → Stripe Checkout (hosted redirect)                                   |
| `/success`   | Verifies the payment, then emails a magic sign-in link                              |
| `/dashboard` | The hub. Free: attempts remaining + upgrade. Paid: attempts, averages, pass rate, score trend, per-module performance, recent attempts *(any account)* |
| `/quiz`      | Timed exam — one question at a time, jump grid, flagging, autosave *(any account, subject to the attempt limit)* |
| `/results`   | Score, pass/fail, topic breakdown, missed-question review, attempt history *(paid — free accounts are redirected to `/dashboard`)* |
| `/study`     | All 8 knowledge-base modules, rendered *(paid)*                                     |
| `/admin`     | Purchases, revenue, pass rates, recent attempts *(admin)*                           |

- **16 questions across 8 modules**, each with a citation-backed explanation.
- **30-minute timer** on an absolute deadline — refreshing the page doesn't buy extra time.
- **Autosave** to `localStorage` on every answer; a closed tab loses nothing.
- **Keyboard shortcuts** — `←`/`→` to navigate, `1`–`4` or `A`–`D` to answer.
- **70% pass threshold**; unanswered questions count as incorrect.

---

## Setup

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Supabase

Create a project at [supabase.com](https://supabase.com), then:

1. Run **`supabase/migrations/0001_init.sql`** in the SQL Editor (or `supabase db push`).
   This creates `user_profiles`, `purchases`, `quiz_attempts` and `admins`, plus all RLS
   policies. Every statement is idempotent, so re-run it over an existing database to pick
   up the tier and attempt-tracking additions — it backfills profiles for accounts that
   already exist and reconciles `attempts_used` with attempts already on record.
   Under **Authentication → Providers**, leave **Email** enabled; if "Confirm email" is on,
   `/register` tells the user to check their inbox instead of dropping them on the dashboard.
2. Copy **Settings → API** values into `.env`:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (browser)
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server — never expose this one)
3. Under **Authentication → URL Configuration**, add your site URL and
   `http://localhost:5173/**` to the redirect allow-list, so magic links work.
4. Make yourself an admin:

   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```

### 3. Stripe

1. Create a **one-time Price** in the Stripe Dashboard and put its ID in `STRIPE_PRICE_ID`.
   (Without it the app falls back to an inline price built from `PRICE_AMOUNT` / `PRICE_CURRENCY`.)
2. Set `STRIPE_SECRET_KEY`. Prefer a
   [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) (`rk_…`) scoped to
   *Checkout Sessions: write* and *PaymentIntents: read* over a full `sk_…` key.
3. Get a webhook signing secret into `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

   In production, add an endpoint at `https://your-domain/api/stripe-webhook` subscribed to
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired` and `charge.refunded`.

### 4. Run

The `/api` functions need the Vercel runtime, so use `vercel dev` for the full payment flow:

```bash
npm i -g vercel
vercel dev          # app + /api on http://localhost:3000
```

`npm run dev` alone (port 5173) runs everything except payments, and proxies `/api` to port 3000
if `vercel dev` is also running.

```bash
npm run build       # production build to dist/
npm run preview     # serve the built bundle
```

---

## Deploying

Push to a Git repo and import it on Vercel — `vercel.json` already sets the build and the SPA
rewrite (which excludes `/api`). Add every variable from `.env.example` in
**Project → Settings → Environment Variables**, set `APP_URL` to your production origin, then point
your live Stripe webhook at `https://your-domain/api/stripe-webhook`.

Any host works as long as it can run the three Node functions in `/api`.

---

## How access control works

`public.user_profiles` holds one row per account with a `tier` (`free` | `paid`) and an
`attempts_used` counter. Neither column has a client write policy — `tier` is set by triggers
on `auth.users` and `purchases`, and `attempts_used` is incremented by an `AFTER INSERT`
trigger on `quiz_attempts`. The client calls `public.ensure_profile()` on sign-in, which
creates the row if missing and promotes it if a payment landed while the user was away.

Payment happens *before* the account exists, so entitlement is keyed on **email**:

1. `/api/create-checkout-session` writes a `pending` purchase row and opens Stripe Checkout.
2. Stripe redirects back to `/success`, which calls `/api/verify-session`. That endpoint re-reads
   the session **from Stripe** and marks it paid — the browser is never trusted.
3. `/api/stripe-webhook` does the same thing on a signature-verified event. It is the
   authoritative path; both are idempotent, so whichever arrives first wins.
4. On signup, a trigger on `auth.users` backfills `purchases.user_id` for the matching email.

The gate is enforced **in the database, not the UI**:

- Clients have **no insert/update policy** on `purchases` or `user_profiles` — only the service
  role and triggers write them, so a user cannot grant themselves the paid tier.
- `quiz_attempts` **inserts** require `public.can_attempt()`: unlimited when paid, otherwise
  fewer than `public.free_attempt_limit()` attempts used. Clearing `localStorage` buys nothing.
- `quiz_attempts` **selects** require `public.is_paid()`. That is what makes the free attempt
  blind — the score never leaves the database, and `Quiz.jsx` does not cache one locally for a
  free account either.
- `<ProtectedRoute>` is a UX convenience; bypassing it just yields empty queries.
- A partial unique index enforces at most one `paid` purchase per email.

One ordering detail worth knowing if you touch the triggers: Postgres evaluates an insert
policy's `WITH CHECK` **after** `BEFORE ROW` triggers, so `attempts_used` is bumped in an
`AFTER INSERT` trigger. Incrementing it in the `BEFORE` trigger would make `can_attempt()`
see the bump and reject the very first free attempt.

---

## Project structure

```
api/                          Serverless functions (server-only secrets)
  _lib/stripe.js              Stripe client, origin + line-item helpers
  _lib/supabaseAdmin.js       Service-role client, idempotent fulfillment
  create-checkout-session.js  POST → Stripe Checkout URL
  verify-session.js           POST → confirm + fulfill on redirect
  stripe-webhook.js           POST → signature-verified fulfillment
src/
  components/                 Layout, ProtectedRoute, QuestionCard, TopicBar, Timer, …
  config.js                   Pricing copy, free-attempt limit, per-tier feature lists
  context/AuthContext.jsx     Session + tier state (tier, attemptsRemaining, isPaid)
  data/questions.js           The 16-question bank
  data/knowledgebase/         8 module .md files + loader
  lib/                        supabase, api, scoring, markdown, storage
  pages/                      Landing, Register, Login, Checkout, Success, Dashboard,
                              Quiz, Results, Study, Admin
supabase/migrations/          Schema + RLS
```

## Adding questions

Append to the array in `src/data/questions.js` — the exam, scoring, topic breakdown and landing-page
counts all derive from it. Each entry needs a unique `id`, a `topic` matching one of the eight
modules, four `options` in A–D order, an `answer` letter, and an explanatory `src`.

---

## Notes

- The knowledge-base `.md` files are bundled at build time and rendered by a small
  HTML-escaping Markdown renderer (`src/lib/markdown.js`) — no runtime fetch, no third-party parser.
- Prices shown on the landing page (`VITE_PRICE_LABEL`) are display copy only; the amount actually
  charged is whatever the Stripe Price says.
- This is independent study material, not affiliated with or endorsed by Mendix.
