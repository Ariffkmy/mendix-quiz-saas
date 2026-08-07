# Mendix Advanced — Exam Simulator

A paid practice-exam SaaS for the **Mendix Advanced Developer certification**. Users pay once via
Stripe, sign in with a magic link, sit a timed 16-question exam, and get a scored report with a
topic-by-topic breakdown and an explanation for every question.

**Stack:** Vite · React 19 · Tailwind CSS v4 · Supabase (Auth + Postgres) · Stripe Checkout ·
React Router 7 · Vercel serverless functions.

---

## Features

| Route       | What it does                                                                     |
| ----------- | -------------------------------------------------------------------------------- |
| `/`         | Landing page — hero, features, 8 modules, pricing card, testimonials, FAQ         |
| `/checkout` | Email capture → Stripe Checkout (hosted redirect)                                 |
| `/success`  | Verifies the payment, then emails a magic sign-in link                            |
| `/login`    | Passwordless magic-link sign-in                                                   |
| `/quiz`     | Timed exam — one question at a time, jump grid, flagging, autosave *(paid)*       |
| `/results`  | Score, pass/fail, topic breakdown, missed-question review, attempt history *(paid)* |
| `/study`    | All 8 knowledge-base modules, rendered *(paid)*                                   |
| `/admin`    | Purchases, revenue, pass rates, recent attempts *(admin)*                         |

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
   This creates `purchases`, `quiz_attempts` and `admins`, plus all RLS policies.
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

Payment happens *before* the account exists, so entitlement is keyed on **email**:

1. `/api/create-checkout-session` writes a `pending` purchase row and opens Stripe Checkout.
2. Stripe redirects back to `/success`, which calls `/api/verify-session`. That endpoint re-reads
   the session **from Stripe** and marks it paid — the browser is never trusted.
3. `/api/stripe-webhook` does the same thing on a signature-verified event. It is the
   authoritative path; both are idempotent, so whichever arrives first wins.
4. On signup, a trigger on `auth.users` backfills `purchases.user_id` for the matching email.

The gate is enforced **in the database, not the UI**:

- Clients have **no insert/update policy** on `purchases` — only the service role writes it, so a
  user cannot grant themselves access.
- `quiz_attempts` inserts require `public.has_purchased()` to pass.
- `<ProtectedRoute>` is a UX convenience; bypassing it just yields empty queries.
- A partial unique index enforces at most one `paid` purchase per email.

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
  components/                 Layout, ProtectedRoute, QuestionCard, Timer, …
  context/AuthContext.jsx     Session + entitlement state
  data/questions.js           The 16-question bank
  data/knowledgebase/         8 module .md files + loader
  lib/                        supabase, api, scoring, markdown, storage
  pages/                      Landing, Checkout, Success, Login, Quiz, Results, Study, Admin
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
