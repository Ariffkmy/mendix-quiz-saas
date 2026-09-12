-- ============================================================================
-- Grade submissions in the database instead of in the browser.
--
-- Until now the client graded its own exam and POSTed the result: score,
-- correct_count, passed and topic_breakdown were all client-supplied. RLS
-- checked *who* was inserting and *how many* attempts they had left, but never
-- whether the numbers were true — so any signed-in account could write itself a
-- 100%, and the analytics on the dashboard and admin page were only as honest
-- as the client that produced them.
--
-- submit_attempt() now does the grading, using question_keys, which the caller
-- may not be able to read at all. The client sends answers and nothing else.
--
-- The return value is tier-aware: a paid caller gets the full record back, a
-- free caller gets an acknowledgement with no score in it. That matters because
-- a SECURITY DEFINER function returns its result past RLS — handing back the
-- whole row would have leaked to free accounts the very score the select policy
-- on quiz_attempts exists to withhold.
--
-- Idempotent; safe to re-run.
-- ============================================================================

-- The pass mark, in one place, next to the function that applies it.
create or replace function public.pass_threshold()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 70;
$$;

-- ---------------------------------------------------------------------------
-- submit_attempt
-- ---------------------------------------------------------------------------
--
-- p_answers is { "<question id>": "A"|"B"|"C"|"D" }. Unknown ids are ignored and
-- missing ones count as incorrect, which is how the real exam scores a paper.
--
create or replace function public.submit_attempt(
  p_answers          jsonb,
  p_started_at       timestamptz default null,
  p_duration_seconds integer     default null,
  p_auto_submitted   boolean     default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid           uuid := auth.uid();
  v_email         text := public.current_email();
  v_answers       jsonb := coalesce(p_answers, '{}'::jsonb);
  v_total         integer;
  v_correct       integer;
  v_score         integer;
  v_passed        boolean;
  v_breakdown     jsonb;
  v_attempt       public.quiz_attempts;
  v_paid          boolean;
begin
  if v_uid is null then
    raise exception 'submit_attempt() requires an authenticated session'
      using errcode = '28000';
  end if;

  if jsonb_typeof(v_answers) <> 'object' then
    raise exception 'submit_attempt(): answers must be a JSON object'
      using errcode = '22023';
  end if;

  -- The same gate the old insert policy applied, enforced before any work.
  if not public.can_attempt() then
    raise exception 'No attempts remaining on this account'
      using errcode = 'P0001';
  end if;

  -- Grade against every question in the bank, not just the ones answered, so a
  -- client that submits a partial map cannot shrink its own denominator.
  select count(*)::integer,
         count(*) filter (
           where v_answers ->> q.id = k.answer
         )::integer
    into v_total, v_correct
    from public.questions q
    join public.question_keys k on k.question_id = q.id;

  if coalesce(v_total, 0) = 0 then
    raise exception 'submit_attempt(): the question bank is empty — run the seed script'
      using errcode = 'P0001';
  end if;

  v_score  := round((v_correct::numeric / v_total) * 100)::integer;
  v_passed := v_score >= public.pass_threshold();

  -- Per-topic tallies, weakest module first — the shape the results page and
  -- the dashboard already expect.
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
       group by t.name
    ) b;

  insert into public.quiz_attempts (
    user_id, email, answers, score, correct_count, total_count, passed,
    topic_breakdown, duration_seconds, auto_submitted, started_at, submitted_at
  )
  values (
    v_uid, v_email, v_answers, v_score, v_correct, v_total, v_passed,
    v_breakdown, nullif(greatest(coalesce(p_duration_seconds, 0), 0), 0),
    coalesce(p_auto_submitted, false), p_started_at, now()
  )
  returning * into v_attempt;

  -- is_paid() is evaluated *after* the insert so that a purchase made mid-exam
  -- still reveals the result the candidate just earned.
  v_paid := public.is_paid();

  if not v_paid then
    -- Free tier: the attempt is on record, but nothing about how it went.
    return jsonb_build_object(
      'attempt_id',     v_attempt.id,
      'attempt_number', v_attempt.attempt_number,
      'submitted_at',   v_attempt.submitted_at,
      'total_count',    v_attempt.total_count,
      'paid',           false
    );
  end if;

  return jsonb_build_object(
    'attempt_id',       v_attempt.id,
    'attempt_number',   v_attempt.attempt_number,
    'submitted_at',     v_attempt.submitted_at,
    'started_at',       v_attempt.started_at,
    'score',            v_attempt.score,
    'correct_count',    v_attempt.correct_count,
    'total_count',      v_attempt.total_count,
    'passed',           v_attempt.passed,
    'topic_breakdown',  v_attempt.topic_breakdown,
    'duration_seconds', v_attempt.duration_seconds,
    'auto_submitted',   v_attempt.auto_submitted,
    'paid',             true
  );
end;
$$;

comment on function public.submit_attempt(jsonb, timestamptz, integer, boolean) is
  'Grades and records an exam attempt server-side. Returns the full result to paid callers and a bare acknowledgement to free ones.';

-- ---------------------------------------------------------------------------
-- Close the direct write path
-- ---------------------------------------------------------------------------
--
-- With grading server-side, a client insert into quiz_attempts can only be an
-- attempt to forge one. Drop the policy and the grant so the RPC is the only way
-- in; count_quiz_attempt() and stamp_quiz_attempt() still fire underneath it.

drop policy if exists "attempts: user with an attempt left can insert own" on public.quiz_attempts;
revoke insert on public.quiz_attempts from authenticated;

revoke all on function public.pass_threshold() from public, anon, authenticated;
revoke all on function public.submit_attempt(jsonb, timestamptz, integer, boolean)
  from public, anon, authenticated;

grant execute on function public.pass_threshold() to authenticated;
grant execute on function public.submit_attempt(jsonb, timestamptz, integer, boolean) to authenticated;
