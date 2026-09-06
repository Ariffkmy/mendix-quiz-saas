-- ============================================================================
-- Mendix Advanced — Exam Simulator
-- DATABASE STRUCTURE REFERENCE (read-only handoff document)
--
-- This file is documentation, not a migration. The executable schema is
-- supabase/migrations/0001_init.sql — apply that, never this.
--
-- Stack: Supabase (Postgres 15 + GoTrue auth + PostgREST), React/Vite client,
-- Vercel serverless functions under /api for Stripe.
-- ============================================================================


-- ============================================================================
-- 1. PRODUCT MODEL — what the schema is shaped around
-- ============================================================================
--
-- A one-time-purchase exam simulator with two tiers:
--
--   free  — may sit exactly ONE exam. The attempt is recorded, but the score is
--           never returned to them. This is enforced by RLS, not by the UI:
--           the SELECT policy on quiz_attempts requires is_paid(), so a free
--           account's own score is unreadable even with a raw API token.
--   paid  — unlimited attempts, full score / pass-fail / topic breakdown /
--           missed-question review / historical analytics.
--
-- Payment is a single Stripe Checkout payment (no subscriptions). It is keyed
-- by EMAIL, not user id, because a person may pay before an account exists.
-- handle_new_user() reconciles the two at signup.
--
-- Auth is Supabase email/password. auth.users is owned by Supabase; this schema
-- only references it and hangs a trigger off it.


-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- auth.users (Supabase-managed — shown for reference only, DO NOT create)
--   id    uuid primary key
--   email text
--   ... plus GoTrue's own columns
-- ---------------------------------------------------------------------------


-- public.admins ------------------------------------------------------------
-- Allow-list of admin emails. No self-service path in — rows are inserted
-- manually via the SQL editor or the service role.
create table public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);


-- public.purchases ---------------------------------------------------------
-- One row per Stripe Checkout attempt. Written ONLY by the service role
-- (api/stripe-webhook.js, api/create-checkout-session.js). There is
-- deliberately no client INSERT/UPDATE policy, so a user cannot grant
-- themselves access by writing a status='paid' row.
create table public.purchases (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null,          -- lowercased by trigger
  status                text not null default 'pending'
                          check (status in ('pending','paid','refunded','failed')),
  amount_total          integer,                -- MINOR units (cents), from Stripe
  currency              text,                   -- ISO 4217, lowercase, from Stripe
  stripe_session_id     text unique,            -- cs_...
  stripe_payment_intent text,                   -- pi_...
  user_id               uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  paid_at               timestamptz
);

create index purchases_email_idx   on public.purchases (email);
create index purchases_user_id_idx on public.purchases (user_id);
create index purchases_status_idx  on public.purchases (status);

-- The product is bought once: at most one paid row per email.
create unique index purchases_one_paid_per_email
  on public.purchases (email) where status = 'paid';


-- public.user_profiles -----------------------------------------------------
-- One row per account, 1:1 with auth.users. Both mutable columns are
-- TRIGGER-OWNED — no client UPDATE policy exists, so neither the tier nor the
-- attempt counter can be edited from the browser.
create table public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  tier          text not null default 'free' check (tier in ('free','paid')),
  attempts_used integer not null default 0 check (attempts_used >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index user_profiles_email_idx on public.user_profiles (email);
create index user_profiles_tier_idx  on public.user_profiles (tier);

-- tier          mirrors purchases, maintained by sync_profile_tier_from_purchase().
-- attempts_used total exams submitted; incremented by count_quiz_attempt().


-- public.quiz_attempts -----------------------------------------------------
-- One row per SUBMITTED exam. Inserted by the client; read back only by paid
-- accounts and admins. Nothing is stored mid-exam — in-progress state lives in
-- the browser's localStorage (see §5).
create table public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  email            text not null,
  answers          jsonb not null default '{}'::jsonb,   -- shape in §3
  score            integer not null check (score between 0 and 100),  -- percent
  correct_count    integer not null check (correct_count >= 0),
  total_count      integer not null check (total_count > 0),
  passed           boolean not null,                     -- score >= 70
  topic_breakdown  jsonb not null default '[]'::jsonb,   -- shape in §3
  duration_seconds integer,
  auto_submitted   boolean not null default false,       -- true = timer expired
  started_at       timestamptz,
  submitted_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),

  -- Both assigned server-side by stamp_quiz_attempt(); a client cannot
  -- backdate or renumber its own history.
  attempt_number   integer,                              -- 1-based, per user
  tier_at_attempt  text                                  -- 'free' | 'paid'
);

create index quiz_attempts_user_id_idx      on public.quiz_attempts (user_id);
create index quiz_attempts_email_idx        on public.quiz_attempts (email);
create index quiz_attempts_submitted_at_idx on public.quiz_attempts (submitted_at desc);


-- ============================================================================
-- 3. JSONB PAYLOAD SHAPES  (not expressible in DDL — important for consumers)
-- ============================================================================
--
-- quiz_attempts.answers
--   An object keyed by question id, valued by the chosen option letter, or null
--   if the candidate left it blank. EVERY question the sitting asked is seeded
--   as a key when the exam starts — that is what makes the key set the record
--   of which questions were served:
--
--     { "adv-dm-01": "B", "xpath-04": null, "logging-02": "A" }
--
--   Consequence: to re-grade an attempt, filter the question bank to these keys.
--   Never grade against the whole bank — a 25-question sitting would score every
--   un-asked question wrong.
--
-- quiz_attempts.topic_breakdown
--   An array, sorted weakest-first by percentage then topic name:
--
--     [ { "topic": "XPath", "correct": 3, "total": 7,  "percentage": 43 },
--       { "topic": "Logging", "correct": 5, "total": 6, "percentage": 83 } ]


-- ============================================================================
-- 4. FUNCTIONS
-- ============================================================================
--
-- All are SECURITY DEFINER with `set search_path = ''` (except the immutable
-- constant), so RLS checks that call them do not recurse through the policies
-- of the tables they read.
--
-- Entitlement predicates (used inside RLS policies):
--   current_email()      -> text     lower(auth.jwt()->>'email'); '' when absent.
--   is_admin()           -> boolean  caller's email is in public.admins.
--   has_purchased()      -> boolean  a purchases row with status='paid' matches
--                                    the caller by user_id OR email.
--   is_paid()            -> boolean  has_purchased() OR is_admin() OR the
--                                    caller's profile tier = 'paid'.
--                                    THE paid gate. Admins always pass.
--   free_attempt_limit() -> integer  immutable, returns 1. The free-tier cap
--                                    lives here so it has exactly one home.
--   can_attempt()        -> boolean  is_paid() OR attempts_used < limit.
--                                    THE gate behind the INSERT policy.
--
-- Client-callable RPC:
--   ensure_profile()     -> user_profiles
--     Creates the caller's profile if missing, promotes it to 'paid' if a
--     purchase has since landed, returns the row. The client calls this on
--     sign-in INSTEAD of inserting the row itself — which is why there is no
--     client INSERT policy on user_profiles and no way to self-assign 'paid'.
--     Raises if auth.uid() is null.
--
-- Trigger functions:
--   lowercase_purchase_email()        BEFORE INS/UPD OF email ON purchases
--   handle_new_user()                 AFTER INSERT ON auth.users
--       Claims any purchase rows sharing the new email (sets user_id), then
--       seeds user_profiles at the tier that purchase implies. Never aborts
--       the signup transaction.
--   sync_profile_tier_from_purchase() AFTER INS/UPD OF status ON purchases
--       'paid' promotes the owner. 'refunded'/'failed' demotes — but only when
--       no other paid purchase still covers the account.
--   stamp_quiz_attempt()              BEFORE INSERT ON quiz_attempts
--       Sets attempt_number and tier_at_attempt.
--       MUST NOT touch attempts_used: Postgres evaluates an INSERT policy's
--       WITH CHECK *after* BEFORE ROW triggers, so bumping the counter here
--       would make can_attempt() reject the very attempt that caused the bump.
--   count_quiz_attempt()              AFTER INSERT ON quiz_attempts
--       Increments user_profiles.attempts_used. Server-side, so clearing
--       localStorage buys nobody an extra attempt.


-- ============================================================================
-- 5. ROW-LEVEL SECURITY  (enabled on all four tables)
-- ============================================================================
--
-- TABLE           ROLE           SELECT                          INSERT
-- --------------  -------------  ------------------------------  -----------------------------
-- purchases       authenticated  user_id = auth.uid()            (none — service role only)
--                                  OR email = current_email()
--                                OR is_admin()
-- user_profiles   authenticated  id = auth.uid()                 (none — via ensure_profile())
--                                OR is_admin()
-- quiz_attempts   authenticated  user_id = auth.uid()            user_id = auth.uid()
--                                  AND is_paid()                   AND can_attempt()
--                                OR is_admin()
-- admins          authenticated  email = current_email()         (none)
--                                (own row only — cannot enumerate)
--
-- There are NO update or delete policies anywhere. Attempts are immutable and
-- history is append-only from the client's side.
--
-- Grants: authenticated gets SELECT on all four tables, plus INSERT on
-- quiz_attempts, plus EXECUTE on every function listed in §4.
--
-- THE KEY INVARIANT: a free account can write an attempt but can never read one
-- back. The score is computed client-side, shown only if paid, and stored
-- server-side where RLS keeps it out of reach until they upgrade.


-- ============================================================================
-- 6. WHAT IS *NOT* IN THE DATABASE
-- ============================================================================
--
-- The question bank is NOT a table. It lives in src/data/questions.md, is
-- parsed at BUILD time by src/lib/parseQuestions.js, and ships inside the JS
-- bundle. quiz_attempts.answers references question ids that exist only there.
--
--   Bank size:      100 questions
--   Topics (7):     Advanced domain modeling, Memory and data model
--                   optimization, Security and performance, XPath, Logging,
--                   User experience, Error handling
--
-- The full question/answer structure is spelled out in §6A below.
--
-- Exam rules (constants in src/data/questions.js and src/lib/examBuilder.js):
--   PASS_THRESHOLD  70 (percent) — mirrored into quiz_attempts.passed
--   EXAM_MINUTES    30 for the full 100-question bank
--   Sittings are configurable (min 5, default 25); a short sitting draws
--   proportionally across topics by largest-remainder, and time scales at a
--   constant seconds-per-question.
--
-- Also client-side only, in localStorage (src/lib/attemptStorage.js):
--   'mx-exam:in-progress'    live answers/deadline/flags — crash recovery
--   'mx-exam:last-result'    the rendered result; written for PAID accounts only
--   'mx-exam:attempt-counts' a display mirror of attempts_used, never authoritative
--
-- Nothing about an in-progress exam reaches the server. Only the final
-- submission is persisted.


-- ============================================================================
-- 6A. QUESTION / ANSWER STRUCTURE  (file-based, NOT a table)
-- ============================================================================
--
-- Source of truth: src/data/questions.md
-- Parser:          src/lib/parseQuestions.js  (runs at build time)
-- Grader:          src/lib/scoring.js
--
-- ---- Parsed object shape --------------------------------------------------
--
--   {
--     id:         string,    -- unique across the bank, e.g. "adm-5"
--     topic:      string,    -- the enclosing "## <topic>" heading
--     question:   string,    -- the stem; may wrap across source lines
--     statements: string[],  -- roman type only, else []
--     options:    string[],  -- 2 to 4 entries, in display order
--     letters:    string[],  -- LETTERS.slice(0, options.length)
--     type:       'single' | 'true-false' | 'roman',
--     answer:     string,    -- the CORRECT letter, e.g. "B"
--     src:        string     -- explanation shown on review; cites the module
--   }
--
-- `answer` holds a LETTER, not the option text or an index. It is validated at
-- build time to be one of `letters`. To resolve it to text:
--     options[letters.indexOf(answer)]
-- Never assume a fixed A-D: true-false questions carry only two options, so
-- indexing past the end is a real failure mode.
--
-- ---- The three types ------------------------------------------------------
--
-- The type is INFERRED from layout — there is no type marker in the markdown:
--   statements present            -> 'roman'
--   exactly 2 options, True/False -> 'true-false'
--   otherwise                     -> 'single'
--
-- single — four options, one correct:
--
--     ### adm-1
--     What is the default value of DeleteAfterDownload on System.FileDocument?
--     - A. False
--     - B. True
--     - C. Empty
--     - D. It depends on the file size
--     **Answer:** A
--     **Source:** Module 3 — System Entities. DeleteAfterDownload defaults to...
--
-- true-false — the stem is an ASSERTION to judge, not a question:
--
--     ### adm-3
--     Making Goalkeeper a specialization of Player results in a single
--     database table holding all the attributes of both entities.
--     - A. True
--     - B. False
--     **Answer:** B
--
-- roman — numbered statements, then options naming combinations. The classic
-- certification format. The stem MUST precede the statements; text after the
-- first statement is silently dropped:
--
--     ### adm-5
--     Which combination lists only the valid reasons for creating a
--     module-specific specialization of System.Image?
--     - I. Purpose — you can add your own attributes and associations
--     - II. Performance — binary contents span fewer database tables
--     - III. Security — entity access can be scoped to your specialization
--     - IV. Maintainability — file-handling logic stays contained
--     - A. I, II and III only
--     - B. I, III and IV only
--     - C. II, III and IV only
--     - D. I, II, III and IV
--     **Answer:** B
--
-- ---- Build-time validation (the parser THROWS, failing the build, on) ------
--     fewer than 2 options; a missing **Answer:**; an answer not among the
--     options; a duplicate id; out-of-order option letters or statement
--     numerals; a question appearing before any "## <topic>" heading; a
--     statement placed after the options; a roman question whose options never
--     reference its statements (almost always a mistyped letter).
--
-- ---- Grading (scoring.js) -------------------------------------------------
--     A question is correct when answers[id] === question.answer. Unanswered
--     (null) counts as INCORRECT, matching the real exam. score is
--     round(correct / total * 100); passed is score >= 70.
--
-- ---- If you ever move this into Postgres ----------------------------------
-- The following is NOT part of the current schema — it is the shape the bank
-- would take as tables, provided so another agent can propose a migration
-- without re-deriving it. Do not assume these exist.
--
--   create table public.questions (
--     id         text primary key,             -- "adm-5", matches answers keys
--     topic      text not null,
--     question   text not null,
--     statements text[] not null default '{}', -- roman only
--     options    text[] not null,              -- check (cardinality >= 2)
--     type       text not null
--                  check (type in ('single','true-false','roman')),
--     answer     text not null,                -- the correct LETTER
--     src        text not null,                -- explanation
--     position   integer                       -- preserves bank order
--   );
--
-- `letters` is derived, not stored: it is always the first cardinality(options)
-- of A-D. Note the join to quiz_attempts.answers would be on the JSONB key, so
-- it is a lateral jsonb_each_text against questions.id (see §7), and it can
-- never be a real foreign key while attempts predate the table.
--
-- Migrating carries a real cost: the markdown is diff-friendly, reviewable in a
-- PR, and validated at build time so a bad question cannot ship. A table trades
-- all of that for runtime editability. Only worth it if questions need to change
-- without a deploy.


-- ============================================================================
-- 7. TYPICAL QUERIES
-- ============================================================================

-- Dashboard: a paid user's attempt history, newest first.
select id, score, passed, correct_count, total_count, topic_breakdown,
       duration_seconds, attempt_number, submitted_at
from public.quiz_attempts
where user_id = auth.uid()
order by submitted_at desc;

-- Weakest topics across a user's whole history.
select b->>'topic'                                   as topic,
       sum((b->>'correct')::int)                     as correct,
       sum((b->>'total')::int)                       as total,
       round(100.0 * sum((b->>'correct')::int)
                   / nullif(sum((b->>'total')::int), 0)) as percentage
from public.quiz_attempts a,
     lateral jsonb_array_elements(a.topic_breakdown) b
where a.user_id = auth.uid()
group by 1
order by percentage asc;

-- Questions this user has missed most often (ids resolve against questions.md).
select key as question_id, count(*) as times_seen
from public.quiz_attempts a,
     lateral jsonb_each_text(a.answers)
where a.user_id = auth.uid()
group by 1
order by times_seen desc;

-- Admin: revenue and conversion.
select count(*) filter (where status = 'paid')                  as paid_count,
       sum(amount_total) filter (where status = 'paid') / 100.0  as gross_major_units,
       count(*)                                                  as checkout_attempts
from public.purchases;
