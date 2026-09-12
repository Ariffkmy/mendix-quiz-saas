-- ============================================================================
-- Two changes, both from reconciling the work on origin/main.
--
-- 1. Question shapes. The bank is no longer four options and one answer: it also
--    holds true/false questions (two options) and the classic certification
--    "roman" format — numbered statements, with options naming combinations of
--    them ("I and III only"). So questions gain `statements` and `type`, and the
--    four-option constraint relaxes to two-to-four.
--
-- 2. Study material is a different cut from exam topics. topic_content assumed
--    one guide per module, one module per topic. In reality a course module
--    feeds several exam topics and a topic draws on several modules — "Master
--    Modeling Microflows" alone feeds five. Modelling that as a column on
--    topics was wrong, so topic_content gives way to study_modules, which
--    records the topics each module covers rather than belonging to one.
--
-- Idempotent; safe to re-run. Run `npm run seed` afterwards — study_modules
-- starts empty and the questions' statements/type come from the markdown.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Question shapes
-- ---------------------------------------------------------------------------

create or replace function public.valid_question_options(options jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(options) = 'array'
     -- Two for true/false, up to four for everything else.
     and jsonb_array_length(options) between 2 and 4
     and not exists (
           select 1
           from jsonb_array_elements(options) o
           where jsonb_typeof(o) <> 'string'
              or length(trim(o #>> '{}')) = 0
         );
$$;

alter table public.questions
  add column if not exists statements jsonb not null default '[]'::jsonb;
alter table public.questions
  add column if not exists type text not null default 'single'
    check (type in ('single', 'true-false', 'roman'));

comment on column public.questions.statements is
  'Numbered statements for roman-format questions, in I..V order. Empty for every other shape.';
comment on column public.questions.type is
  'Inferred from the markdown layout by parseQuestions.js, not authored by hand.';

-- A roman question is exactly one with statements, and nothing else may have
-- them — the renderer switches on `type`, so the two must not drift apart.
alter table public.questions drop constraint if exists questions_statements_match_type;
alter table public.questions add constraint questions_statements_match_type check (
  (type = 'roman') = (jsonb_array_length(statements) > 0)
);

revoke all on function public.valid_question_options(jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Study modules
-- ---------------------------------------------------------------------------

create table if not exists public.study_modules (
  slug       text primary key,
  level      text not null default 'advanced'
               check (level in ('intermediate', 'advanced')),
  title      text not null,
  file       text not null default '',
  content    text not null default '',
  -- Exam topics this module covers. Documentation of the mapping for the study
  -- view; nothing in the exam depends on it, which is why it is a jsonb array
  -- of names rather than a join table with foreign keys.
  topics     jsonb not null default '[]'::jsonb,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.study_modules is
  'Knowledge-base guides. A module can feed several exam topics and a topic can draw on several modules, so these are not owned by topics.';

create index if not exists study_modules_level_idx on public.study_modules (level, position, title);

alter table public.study_modules enable row level security;

drop policy if exists "study modules: readable when signed in" on public.study_modules;
create policy "study modules: readable when signed in"
  on public.study_modules for select
  to authenticated
  using (true);

grant select on public.study_modules to authenticated;

-- Superseded by study_modules.
drop table if exists public.topic_content cascade;
