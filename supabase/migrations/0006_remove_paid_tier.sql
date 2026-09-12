-- ============================================================================
-- Make the product free for everyone.
--
-- The two-tier model is gone: no Stripe, no purchases, no attempt limit, no
-- paid-only content. Every signed-in account now gets what the paid tier used
-- to get — unlimited attempts, scores, explanations and the study guides.
--
-- What that means for the schema:
--
--   * purchases              dropped outright, along with the triggers and
--                            helpers that kept user_profiles.tier in step.
--   * user_profiles.tier     dropped — there is only one tier now.
--   * quiz_attempts          .tier_at_attempt dropped for the same reason.
--   * is_paid()/can_attempt()/has_purchased()/free_attempt_limit()
--                            dropped; the policies that called them are
--                            rewritten to allow any authenticated account.
--   * submit_attempt()       always returns the full graded result.
--
-- user_profiles survives because attempts_used is still worth showing on the
-- dashboard, and admins/is_admin() survive because the admin view is unrelated
-- to payment.
--
-- Verified before writing this: purchases, user_profiles, quiz_attempts and
-- auth.users were all empty, so nothing is lost. Re-running this on a database
-- that HAS payment history would discard it — that is the intent, but it is
-- not reversible.
--
-- Idempotent; safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Open up the content that used to be paid-only
-- ---------------------------------------------------------------------------

drop policy if exists "question keys: paid accounts only" on public.question_keys;
create policy "question keys: readable when signed in"
  on public.question_keys for select
  to authenticated
  using (true);

drop policy if exists "topic content: paid accounts only" on public.topic_content;
create policy "topic content: readable when signed in"
  on public.topic_content for select
  to authenticated
  using (true);

-- Everyone may now read their own attempts back.
drop policy if exists "attempts: paid owner can read own" on public.quiz_attempts;
create policy "attempts: owner can read own"
  on public.quiz_attempts for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Drop the purchase machinery
-- ---------------------------------------------------------------------------

drop trigger if exists purchases_sync_profile_tier on public.purchases;
drop trigger if exists purchases_lowercase_email   on public.purchases;

drop table if exists public.purchases cascade;

drop function if exists public.sync_profile_tier_from_purchase() cascade;
drop function if exists public.lowercase_purchase_email()        cascade;
drop function if exists public.has_purchased()                   cascade;
drop function if exists public.free_attempt_limit()              cascade;

-- ---------------------------------------------------------------------------
-- Retire the tier columns
-- ---------------------------------------------------------------------------
--
-- Dropped after the policies above stop referencing is_paid(), which reads
-- user_profiles.tier.

drop function if exists public.is_paid()     cascade;
drop function if exists public.can_attempt() cascade;

alter table public.user_profiles drop column if exists tier;
alter table public.quiz_attempts drop column if exists tier_at_attempt;

-- ---------------------------------------------------------------------------
-- Rewrite the profile helpers without tier or purchases
-- ---------------------------------------------------------------------------

create or replace function public.ensure_profile()
returns public.user_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile public.user_profiles;
begin
  if auth.uid() is null then
    raise exception 'ensure_profile() requires an authenticated session';
  end if;

  insert into public.user_profiles (id, email)
  values (auth.uid(), public.current_email())
  on conflict (id) do nothing;

  select * into profile from public.user_profiles where id = auth.uid();
  return profile;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Nothing to key on without an email; ensure_profile() fills the row in on
  -- first sign-in. Never let this abort the signup transaction.
  if new.email is null then
    return new;
  end if;

  insert into public.user_profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do nothing;

  return new;
end;
$$;

-- attempt_number is still stamped; the tier it was sat under no longer exists.
create or replace function public.stamp_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
begin
  insert into public.user_profiles (id, email)
  values (new.user_id, lower(new.email))
  on conflict (id) do nothing;

  select up.attempts_used into used
    from public.user_profiles up
   where up.id = new.user_id;

  new.attempt_number := coalesce(used, 0) + 1;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grading: no attempt limit, and everyone gets their result
-- ---------------------------------------------------------------------------

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
  v_uid       uuid := auth.uid();
  v_email     text := public.current_email();
  v_answers   jsonb := coalesce(p_answers, '{}'::jsonb);
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

  -- Grade against every question in the bank, not just the ones answered, so a
  -- client that submits a partial map cannot shrink its own denominator.
  select count(*)::integer,
         count(*) filter (where v_answers ->> q.id = k.answer)::integer
    into v_total, v_correct
    from public.questions q
    join public.question_keys k on k.question_id = q.id;

  if coalesce(v_total, 0) = 0 then
    raise exception 'submit_attempt(): the question bank is empty — run the seed script'
      using errcode = 'P0001';
  end if;

  v_score := round((v_correct::numeric / v_total) * 100)::integer;

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
    v_uid, v_email, v_answers, v_score, v_correct, v_total,
    v_score >= public.pass_threshold(),
    v_breakdown, nullif(greatest(coalesce(p_duration_seconds, 0), 0), 0),
    coalesce(p_auto_submitted, false), p_started_at, now()
  )
  returning * into v_attempt;

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
    'auto_submitted',   v_attempt.auto_submitted
  );
end;
$$;

comment on function public.submit_attempt(jsonb, timestamptz, integer, boolean) is
  'Grades and records an exam attempt server-side, and returns the full result. Grading stays in the database so a client cannot report its own score.';

revoke all on function public.submit_attempt(jsonb, timestamptz, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.submit_attempt(jsonb, timestamptz, integer, boolean) to authenticated;

revoke all on function public.ensure_profile() from public, anon;
grant execute on function public.ensure_profile() to authenticated;
