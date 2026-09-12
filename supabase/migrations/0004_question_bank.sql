-- ============================================================================
-- Move the question bank out of the JS bundle and into Postgres.
--
-- The bank used to be compiled into the client by a `?raw` import of
-- questions.md, which meant every correct answer and explanation shipped to the
-- browser in plain text. The free tier's "blind attempt" was therefore only
-- cosmetic: the answer key sat in the bundle for anyone who opened devtools.
--
-- Four tables, split by who is allowed to read them:
--
--   topics         slug/name/count only          -> public (anon included)
--   questions      the stem and the four options -> any signed-in account
--   question_keys  answer + explanation + tip    -> paid accounts only
--   topic_content  knowledge-base markdown       -> paid accounts only
--
-- Splitting keys and content into their own tables is what makes this work:
-- row-level security is per row, not per column, so the paid gate has to live on
-- a table boundary rather than on a column of `questions`.
--
-- `topics` is deliberately anon-readable — the landing page quotes the module
-- list and the question count before anyone signs in, and neither is a secret.
--
-- Content is seeded separately by scripts/seed-question-bank.mjs, which reads
-- the same .md files that used to be bundled. They stay in the repo as the
-- authoring source; they are simply no longer shipped to the browser.
--
-- Idempotent; safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- topics
-- ---------------------------------------------------------------------------

create table if not exists public.topics (
  slug           text primary key,
  name           text not null unique,
  position       integer not null default 0,
  question_count integer not null default 0 check (question_count >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.topics is
  'Exam modules. Public on purpose: the landing page quotes these names and counts to anonymous visitors.';
comment on column public.topics.question_count is
  'Maintained by the questions trigger below — never written by a client.';

create index if not exists topics_position_idx on public.topics (position, name);

-- ---------------------------------------------------------------------------
-- questions — the stem and options, with no hint of the answer
-- ---------------------------------------------------------------------------

-- A CHECK constraint may not contain a subquery, so the per-element validation
-- lives in an IMMUTABLE function that the constraint can call instead.
create or replace function public.valid_question_options(options jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(options) = 'array'
     and jsonb_array_length(options) = 4
     and not exists (
           select 1
           from jsonb_array_elements(options) o
           where jsonb_typeof(o) <> 'string'
              or length(trim(o #>> '{}')) = 0
         );
$$;

create table if not exists public.questions (
  id         text primary key,
  topic_slug text not null references public.topics (slug) on delete cascade,
  position   integer not null default 0,
  question   text not null,
  options    jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Exactly four options, all non-empty strings. The client indexes them by
  -- A/B/C/D, so a short array would silently break grading.
  constraint questions_four_options check (public.valid_question_options(options))
);

comment on table public.questions is
  'Exam questions without their answers. Readable by any signed-in account; the answer lives in question_keys.';

create index if not exists questions_topic_idx    on public.questions (topic_slug, position);
create index if not exists questions_position_idx on public.questions (position, id);

-- ---------------------------------------------------------------------------
-- question_keys — the part that must not leak
-- ---------------------------------------------------------------------------

create table if not exists public.question_keys (
  question_id text primary key references public.questions (id) on delete cascade,
  answer      text not null check (answer in ('A', 'B', 'C', 'D')),
  explanation text not null default '',
  tip         text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.question_keys is
  'Correct answers, explanations and study tips. Paid accounts only — this is the table the free tier must never read.';
comment on column public.question_keys.tip is
  'Optional short revision pointer, shown alongside the explanation in the results review.';

-- ---------------------------------------------------------------------------
-- topic_content — the knowledge base
-- ---------------------------------------------------------------------------

create table if not exists public.topic_content (
  topic_slug text primary key references public.topics (slug) on delete cascade,
  file       text not null default '',
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.topic_content is
  'Knowledge-base markdown per module. Paid accounts only — the study guides are a paid feature.';

-- ---------------------------------------------------------------------------
-- Keep topics.question_count honest
-- ---------------------------------------------------------------------------

create or replace function public.sync_topic_question_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  touched text[];
begin
  touched := array_remove(
    array[
      case when tg_op in ('INSERT', 'UPDATE') then new.topic_slug end,
      case when tg_op in ('DELETE', 'UPDATE') then old.topic_slug end
    ],
    null
  );

  update public.topics t
     set question_count = (
           select count(*) from public.questions q where q.topic_slug = t.slug
         ),
         updated_at = now()
   where t.slug = any(touched);

  return null;
end;
$$;

drop trigger if exists questions_sync_topic_count on public.questions;
create trigger questions_sync_topic_count
  after insert or update of topic_slug or delete on public.questions
  for each row execute function public.sync_topic_question_count();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.topics        enable row level security;
alter table public.questions     enable row level security;
alter table public.question_keys enable row level security;
alter table public.topic_content enable row level security;

-- No table below has an insert/update/delete policy. The bank is maintained by
-- the seed script using the service role, which bypasses RLS entirely.

-- topics: readable by everyone, signed in or not.
drop policy if exists "topics: readable by anyone" on public.topics;
create policy "topics: readable by anyone"
  on public.topics for select
  to anon, authenticated
  using (true);

-- questions: any signed-in account sits the same exam, free or paid.
drop policy if exists "questions: readable when signed in" on public.questions;
create policy "questions: readable when signed in"
  on public.questions for select
  to authenticated
  using (true);

-- question_keys: the paid gate. A free account can sit the exam but cannot read
-- back what the answers were, which is what makes the blind attempt real.
drop policy if exists "question keys: paid accounts only" on public.question_keys;
create policy "question keys: paid accounts only"
  on public.question_keys for select
  to authenticated
  using (public.is_paid());

drop policy if exists "topic content: paid accounts only" on public.topic_content;
create policy "topic content: paid accounts only"
  on public.topic_content for select
  to authenticated
  using (public.is_paid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on public.topics        to anon, authenticated;
grant select on public.questions     to authenticated;
grant select on public.question_keys to authenticated;
grant select on public.topic_content to authenticated;

revoke all on function public.sync_topic_question_count() from public, anon, authenticated;
revoke all on function public.valid_question_options(jsonb) from public, anon, authenticated;
