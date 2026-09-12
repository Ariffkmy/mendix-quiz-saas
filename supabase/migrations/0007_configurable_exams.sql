-- ============================================================================
-- Let candidates configure the exam: how many questions, and whether it is
-- timed.
--
-- Until now every attempt was the whole bank on a fixed clock, so the paper was
-- implicit — submit_attempt() could grade against `questions` in full. A short
-- practice run breaks that assumption twice over:
--
--   * Grading must span the questions that were actually asked. Scoring 10
--     answers against 100 questions would report ~10%.
--   * The results review must know which questions were on the paper, including
--     the ones left unanswered — the answers map alone cannot say whether a
--     question was skipped or never shown.
--
-- Hence quiz_attempts.question_ids: the paper, stored with the attempt. Legacy
-- rows keep null, which every reader treats as "the whole bank".
--
-- Idempotent; safe to re-run.
-- ============================================================================

alter table public.quiz_attempts
  add column if not exists question_ids jsonb;
alter table public.quiz_attempts
  add column if not exists time_limit_minutes integer
    check (time_limit_minutes is null or time_limit_minutes > 0);

comment on column public.quiz_attempts.question_ids is
  'The questions this attempt was sat on, in presentation order. Null on attempts recorded before exams were configurable, meaning the whole bank.';
comment on column public.quiz_attempts.time_limit_minutes is
  'The clock the candidate chose, or null for an untimed run.';

-- ---------------------------------------------------------------------------
-- submit_attempt, scoped to the paper that was sat
-- ---------------------------------------------------------------------------

drop function if exists public.submit_attempt(jsonb, timestamptz, integer, boolean);

create or replace function public.submit_attempt(
  p_answers            jsonb,
  p_question_ids       jsonb       default null,
  p_started_at         timestamptz default null,
  p_duration_seconds   integer     default null,
  p_auto_submitted     boolean     default false,
  p_time_limit_minutes integer     default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_email     text := public.current_email();
  v_answers   jsonb := coalesce(p_answers, '{}'::jsonb);
  v_ids       text[];
  v_total     integer;
  v_correct   integer;
  v_score     integer;
  v_breakdown jsonb;
  v_attempt   public.quiz_attempts;
begin
  if v_uid is null then
    raise exception 'submit_attempt() requires an authenticated session'
      using errcode = '28000';
  end if;

  if jsonb_typeof(v_answers) <> 'object' then
    raise exception 'submit_attempt(): answers must be a JSON object'
      using errcode = '22023';
  end if;

  -- The paper. An explicit list is intersected with the bank so a client cannot
  -- inflate its denominator with ids that do not exist, or shrink it by
  -- repeating one. Null or empty means the whole bank.
  if p_question_ids is null or jsonb_array_length(coalesce(p_question_ids, '[]'::jsonb)) = 0 then
    select array_agg(q.id order by q.position, q.id) into v_ids from public.questions q;
  else
    select array_agg(distinct q.id) into v_ids
      from public.questions q
     where q.id in (select jsonb_array_elements_text(p_question_ids));
  end if;

  v_total := coalesce(array_length(v_ids, 1), 0);

  if v_total = 0 then
    raise exception 'submit_attempt(): no questions matched — is the bank seeded?'
      using errcode = 'P0001';
  end if;

  select count(*) filter (where v_answers ->> k.question_id = k.answer)::integer
    into v_correct
    from public.question_keys k
   where k.question_id = any(v_ids);

  v_score := round((coalesce(v_correct, 0)::numeric / v_total) * 100)::integer;

  select coalesce(jsonb_agg(row_to_json(b)::jsonb order by b.percentage, b.topic), '[]'::jsonb)
    into v_breakdown
    from (
      select t.name as topic,
             count(*) filter (where v_answers ->> q.id = k.answer)::integer as correct,
             count(*)::integer as total,
             round(
               (count(*) filter (where v_answers ->> q.id = k.answer)::numeric / count(*)) * 100
             )::integer as percentage
        from public.questions q
        join public.question_keys k on k.question_id = q.id
        join public.topics t        on t.slug = q.topic_slug
       where q.id = any(v_ids)
       group by t.name
    ) b;

  insert into public.quiz_attempts (
    user_id, email, answers, score, correct_count, total_count, passed,
    topic_breakdown, duration_seconds, auto_submitted, started_at, submitted_at,
    question_ids, time_limit_minutes
  )
  values (
    v_uid, v_email, v_answers, v_score, coalesce(v_correct, 0), v_total,
    v_score >= public.pass_threshold(),
    v_breakdown, nullif(greatest(coalesce(p_duration_seconds, 0), 0), 0),
    coalesce(p_auto_submitted, false), p_started_at, now(),
    to_jsonb(v_ids),
    case when coalesce(p_time_limit_minutes, 0) > 0 then p_time_limit_minutes end
  )
  returning * into v_attempt;

  return jsonb_build_object(
    'attempt_id',         v_attempt.id,
    'attempt_number',     v_attempt.attempt_number,
    'submitted_at',       v_attempt.submitted_at,
    'started_at',         v_attempt.started_at,
    'score',              v_attempt.score,
    'correct_count',      v_attempt.correct_count,
    'total_count',        v_attempt.total_count,
    'passed',             v_attempt.passed,
    'topic_breakdown',    v_attempt.topic_breakdown,
    'duration_seconds',   v_attempt.duration_seconds,
    'auto_submitted',     v_attempt.auto_submitted,
    'question_ids',       v_attempt.question_ids,
    'time_limit_minutes', v_attempt.time_limit_minutes
  );
end;
$$;

comment on function public.submit_attempt(jsonb, jsonb, timestamptz, integer, boolean, integer) is
  'Grades and records an exam attempt server-side against the questions actually asked. Returns the full result.';

revoke all on function
  public.submit_attempt(jsonb, jsonb, timestamptz, integer, boolean, integer)
  from public, anon, authenticated;
grant execute on function
  public.submit_attempt(jsonb, jsonb, timestamptz, integer, boolean, integer)
  to authenticated;
