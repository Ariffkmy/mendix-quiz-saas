# Mendix Advanced — Exam Simulator

A free practice-exam app for the **Mendix Advanced Developer certification**. Users register with
an email and password, sit a timed 100-question exam, and get a scored report with a pass/fail
verdict, a per-module breakdown and an explanation for every question.

**Stack:** Vite · React 19 · Tailwind CSS v4 · Supabase (Auth + Postgres) · Vercel

Everything is free. There is no payment, no subscription and no tier — an account is the only
thing gating access, and that exists so attempts can be stored and tracked over time.

---

## Routes

| Route        | What it does                                                                        |
|--------------|-------------------------------------------------------------------------------------|
| `/`          | Landing page                                                                        |
| `/register`  | Email + password sign-up                                                            |
| `/login`     | Sign in (password or magic link)                                                    |
| `/dashboard` | Attempts, averages, pass rate, score trend, per-module performance *(signed in)*     |
| `/quiz`      | The timed exam *(signed in)*                                                        |
| `/results`   | Score, pass/fail, topic breakdown, missed-question review, attempt history *(signed in)* |
| `/study`     | All 8 knowledge-base modules, rendered *(signed in)*                                |
| `/admin`     | Accounts, activation, pass rates, recent attempts *(admin)*                          |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

Create a project, then apply the migrations:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

This creates `topics`, `questions`, `question_keys`, `topic_content`, `user_profiles`,
`quiz_attempts` and `admins`, plus all RLS policies and the grading function.

Copy `.env.example` to `.env` and fill in the four Supabase values from
**Project Settings → API**.

### 3. Seed the question bank

The bank lives in Postgres, not in the bundle. Push it from the markdown:

```bash
npm run seed
```

This reads `src/data/questions.md` and `src/data/knowledgebase/*.md` and upserts them using the
service-role key. It is a mirror — anything removed from the markdown is deleted from the
database.

### 4. Run

```bash
npm run dev         # http://localhost:5173
npm run build       # production build to dist/
npm run preview     # serve the built bundle
```

There are no serverless functions, so `npm run dev` runs the whole app.

### 5. Make yourself an admin

`public.admins` has no self-service path in. Migration `0003` seeds one address; add others with
a migration or the service role.

---

## Deploying

Push to a Git repo and import it on Vercel — `vercel.json` already sets the build and the SPA
rewrite. Add these four in **Project → Settings → Environment Variables**:

| Variable                    | Type   |
|-----------------------------|--------|
| `VITE_SUPABASE_URL`         | Config |
| `VITE_SUPABASE_ANON_KEY`    | Config |
| `SUPABASE_URL`              | Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret |

The `VITE_` pair is compiled into the browser bundle and is public by design; the anon key grants
only the `anon` role and RLS does the rest. The service-role key bypasses RLS entirely and must
never carry a `VITE_` prefix.

Add your deployment origin to **Supabase → Authentication → URL Configuration → Redirect URLs**,
or confirmation emails will bounce users to localhost.

Note that `npm run seed` is a local script — Vercel does not run it. Editing `questions.md`
requires re-running the seed; a redeploy alone changes nothing.

---

## How the exam is protected

Two things are enforced in the database rather than the UI.

**The answer key never reaches an unauthenticated client.** `questions` holds the stem and the
four options; `question_keys` holds the answer, explanation and tip in a separate table. Both
require a session. The bank used to be a `?raw` import of `questions.md`, which shipped every
correct answer to the browser in plain text — moving it to Postgres is what fixed that, and it
also cut ~290 KB from the bundle.

**Scores are computed server-side.** `public.submit_attempt(answers, …)` grades the paper against
`question_keys`, computes the topic breakdown and writes the row. `INSERT` on `quiz_attempts` is
revoked from `authenticated`, so the RPC is the only way in and a tampered client cannot report a
score it did not earn. Grading against the full bank also means a partial answer map cannot shrink
its own denominator.

`public.pass_threshold()` is the value that decides pass/fail. `PASS_THRESHOLD` in
`src/data/questions.js` is display copy — change both together.

`<ProtectedRoute>` is a UX convenience; bypassing it just yields empty queries.

---

## Project structure

```
scripts/
  seed-question-bank.mjs      Pushes the markdown bank into Supabase
src/
  components/                 Layout, ProtectedRoute, QuestionCard, TopicBar, Timer, …
  config.js                   Product copy, feature list, marketing-copy fallbacks
  context/AuthContext.jsx     Session + profile state
  data/questions.js           Exam constants (pass mark, duration, option letters)
  data/questions.md           Authoring source for the question bank
  data/knowledgebase/         8 module .md files (authoring source)
  hooks/useExamOverview.js    Module list + question count for marketing copy
  lib/questionBank.js         Reads questions/keys/content, submits attempts
  lib/                        supabase, scoring, markdown, storage, parseQuestions
  pages/                      Landing, Register, Login, Dashboard, Quiz, Results,
                              Study, Admin, NotFound
supabase/migrations/          Schema, RLS, grading function
```

## Adding questions

Edit `src/data/questions.md`, then run `npm run seed`. Each entry needs a unique `id`, lives under
a `## <topic>` heading matching one of the eight modules, and has four `- A.`–`- D.` options, an
`**Answer:**` letter, a `**Source:**` explanation and an optional `**Tip:**`.

The exam, scoring, topic breakdown and landing-page counts all derive from what is in the
database, so no code changes are needed.

---

## Notes

- Knowledge-base markdown is stored in `topic_content` and rendered by a small HTML-escaping
  Markdown renderer (`src/lib/markdown.js`) — no third-party parser.
- `topics` is readable anonymously so the landing page can quote the module list and question
  count before anyone signs in. Neither is a secret.
