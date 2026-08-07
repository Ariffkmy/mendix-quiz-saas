-- ============================================================================
-- Mendix Advanced — Exam Simulator
-- Schema: user profiles (free/paid tier), purchases, quiz attempts, admins,
-- and row-level security.
--
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- Every statement is idempotent, so it is safe to re-run over an existing
-- database to pick up the tier / attempt-tracking additions.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The signed-in user's email, lowercased. Purchases are keyed by email because
-- payment can happen before the account exists.
create or replace function public.current_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ---------------------------------------------------------------------------
-- admins
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allow-list of admin emails. Insert rows here manually — there is no self-service path in.';

-- SECURITY DEFINER so the check itself does not recurse through admins' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = public.current_email()
  );
$$;

-- ---------------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------------

create table if not exists public.purchases (
  id                     uuid primary key default gen_random_uuid(),
  email                  text not null,
  status                 text not null default 'pending'
                           check (status in ('pending', 'paid', 'refunded', 'failed')),
  amount_total           integer,          -- minor units, as reported by Stripe
  currency               text,
  stripe_session_id      text unique,
  stripe_payment_intent  text,
  user_id                uuid references auth.users (id) on delete set null,
  created_at             timestamptz not null default now(),
  paid_at                timestamptz
);

comment on table public.purchases is
  'One row per checkout attempt. Only the service role may write — status is set by the Stripe webhook.';

-- Emails are matched case-insensitively everywhere; store them lowercase.
create or replace function public.lowercase_purchase_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists purchases_lowercase_email on public.purchases;
create trigger purchases_lowercase_email
  before insert or update of email on public.purchases
  for each row execute function public.lowercase_purchase_email();

create index if not exists purchases_email_idx   on public.purchases (email);
create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists purchases_status_idx  on public.purchases (status);

-- At most one paid purchase per email — the product is bought once.
create unique index if not exists purchases_one_paid_per_email
  on public.purchases (email)
  where status = 'paid';

-- ---------------------------------------------------------------------------
-- user_profiles — the free / paid tier record
-- ---------------------------------------------------------------------------
--
-- One row per account. `tier` is a mirror of the purchases table maintained by
-- triggers (never written by the client), and `attempts_used` is incremented by
-- a trigger on quiz_attempts. Together they answer the two questions the app
-- asks on every page: may this person sit another exam, and may they see a
-- score?
-- ---------------------------------------------------------------------------

create table if not exists public.user_profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  tier          text not null default 'free' check (tier in ('free', 'paid')),
  attempts_used integer not null default 0 check (attempts_used >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.user_profiles is
  'Per-account tier and attempt counter. Clients read their own row; only triggers and the service role write it.';
comment on column public.user_profiles.tier is
  'free = one blind attempt, no results. paid = unlimited attempts + full analytics.';
comment on column public.user_profiles.attempts_used is
  'Total exams submitted by this account. Maintained by the quiz_attempts trigger.';

create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_tier_idx  on public.user_profiles (tier);

-- ---------------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------------

create table if not exists public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  email            text not null,
  answers          jsonb not null default '{}'::jsonb,
  score            integer not null check (score between 0 and 100),
  correct_count    integer not null check (correct_count >= 0),
  total_count      integer not null check (total_count > 0),
  passed           boolean not null,
  topic_breakdown  jsonb not null default '[]'::jsonb,
  duration_seconds integer,
  auto_submitted   boolean not null default false,
  started_at       timestamptz,
  submitted_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- The candidate's nth attempt, and the tier they held while sitting it. Both are
-- assigned by the trigger below, so a client cannot backdate its own history.
alter table public.quiz_attempts
  add column if not exists attempt_number integer;
alter table public.quiz_attempts
  add column if not exists tier_at_attempt text;

comment on table public.quiz_attempts is
  'One row per submitted exam. Any signed-in user may insert while they have an attempt left; only paid users may read their own back.';

create index if not exists quiz_attempts_user_id_idx      on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_email_idx        on public.quiz_attempts (email);
create index if not exists quiz_attempts_submitted_at_idx on public.quiz_attempts (submitted_at desc);

-- ---------------------------------------------------------------------------
-- Entitlement checks
-- ---------------------------------------------------------------------------

-- True when the signed-in user has a completed purchase.
create or replace function public.has_purchased()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.purchases p
    where p.status = 'paid'
      and (p.user_id = auth.uid() or p.email = public.current_email())
  );
$$;

-- The paid gate. A completed purchase is authoritative; the profile tier is the
-- fast path (and covers accounts granted access manually). Admins always pass so
-- they can inspect the product they support.
create or replace function public.is_paid()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_purchased()
     or public.is_admin()
     or exists (
       select 1 from public.user_profiles up
       where up.id = auth.uid() and up.tier = 'paid'
     );
$$;

-- How many free attempts a non-paying account gets. Kept as a function so the
-- number lives in exactly one place, next to the policy that enforces it.
create or replace function public.free_attempt_limit()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 1;
$$;

-- The gate behind the insert policy on quiz_attempts: paid users are unlimited,
-- free users get free_attempt_limit() submissions and no more.
create or replace function public.can_attempt()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_paid()
     or coalesce(
          (select up.attempts_used from public.user_profiles up where up.id = auth.uid()),
          0
        ) < public.free_attempt_limit();
$$;

-- ---------------------------------------------------------------------------
-- Profile maintenance
-- ---------------------------------------------------------------------------

-- Create the caller's profile if it is missing, promote it if a purchase has
-- since landed, and return it. The client calls this on sign-in instead of
-- inserting the row itself — which is why there is no client insert policy and
-- no way to self-assign the paid tier.
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

  insert into public.user_profiles (id, email, tier)
  values (
    auth.uid(),
    public.current_email(),
    case when public.has_purchased() then 'paid' else 'free' end
  )
  on conflict (id) do nothing;

  -- Payment may have completed after the profile was created (or the webhook
  -- may have landed while the user was signed out).
  update public.user_profiles
     set tier = 'paid', updated_at = now()
   where id = auth.uid()
     and tier <> 'paid'
     and public.has_purchased();

  select * into profile from public.user_profiles where id = auth.uid();
  return profile;
end;
$$;

-- New account: attach any purchase made under the same email, then seed the
-- profile at the tier that purchase implies.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  paid boolean;
begin
  -- Nothing to key on without an email; ensure_profile() will fill the row in
  -- on first sign-in. Never let this abort the signup transaction.
  if new.email is null then
    return new;
  end if;

  update public.purchases
     set user_id = new.id
   where user_id is null
     and email = lower(new.email);

  select exists (
    select 1 from public.purchases p
    where p.status = 'paid' and p.email = lower(new.email)
  ) into paid;

  insert into public.user_profiles (id, email, tier)
  values (new.id, lower(new.email), case when paid then 'paid' else 'free' end)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Replaces the earlier link-purchase-only trigger.
drop trigger if exists on_auth_user_created_link_purchase on auth.users;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A purchase reaching 'paid' promotes its owner; a refund demotes them.
create or replace function public.sync_profile_tier_from_purchase()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'paid' then
    update public.user_profiles
       set tier = 'paid', updated_at = now()
     where (id = new.user_id or email = new.email)
       and tier <> 'paid';

  elsif new.status in ('refunded', 'failed') then
    -- Only demote when no other paid purchase covers the account.
    update public.user_profiles up
       set tier = 'free', updated_at = now()
     where (up.id = new.user_id or up.email = new.email)
       and up.tier = 'paid'
       and not exists (
         select 1 from public.purchases p
         where p.status = 'paid'
           and (p.user_id = up.id or p.email = up.email)
       );
  end if;

  return new;
end;
$$;

drop trigger if exists purchases_sync_profile_tier on public.purchases;
create trigger purchases_sync_profile_tier
  after insert or update of status on public.purchases
  for each row execute function public.sync_profile_tier_from_purchase();

-- ---------------------------------------------------------------------------
-- Attempt counting
-- ---------------------------------------------------------------------------

-- Stamp the attempt number and the tier it was sat under.
--
-- This must NOT touch attempts_used: Postgres evaluates an insert policy's WITH
-- CHECK expression *after* BEFORE ROW triggers, so incrementing the counter here
-- would make can_attempt() see the bump and reject the very attempt that caused
-- it. The increment lives in the AFTER trigger below.
create or replace function public.stamp_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
  current_tier text;
begin
  insert into public.user_profiles (id, email)
  values (new.user_id, lower(new.email))
  on conflict (id) do nothing;

  select up.attempts_used, up.tier
    into used, current_tier
    from public.user_profiles up
   where up.id = new.user_id;

  new.attempt_number  := coalesce(used, 0) + 1;
  new.tier_at_attempt := coalesce(current_tier, 'free');
  return new;
end;
$$;

-- Bump the counter once the row is in. Server-side so the free-tier limit cannot
-- be reset from the browser.
create or replace function public.count_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_profiles
     set attempts_used = attempts_used + 1,
         updated_at    = now()
   where id = new.user_id;

  return null;
end;
$$;

drop trigger if exists quiz_attempts_stamp on public.quiz_attempts;
create trigger quiz_attempts_stamp
  before insert on public.quiz_attempts
  for each row execute function public.stamp_quiz_attempt();

drop trigger if exists quiz_attempts_count on public.quiz_attempts;
create trigger quiz_attempts_count
  after insert on public.quiz_attempts
  for each row execute function public.count_quiz_attempt();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.purchases     enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.admins        enable row level security;
alter table public.user_profiles enable row level security;

-- purchases: read-only for the owner, read-all for admins. Writes are the
-- service role's job (which bypasses RLS), so no client write policy exists —
-- a user cannot grant themselves access by inserting a 'paid' row.
drop policy if exists "purchases: owner can read own" on public.purchases;
create policy "purchases: owner can read own"
  on public.purchases for select
  to authenticated
  using (user_id = auth.uid() or email = public.current_email());

drop policy if exists "purchases: admins can read all" on public.purchases;
create policy "purchases: admins can read all"
  on public.purchases for select
  to authenticated
  using (public.is_admin());

-- user_profiles: the owner reads their own row and nothing else. There is no
-- client insert or update policy — tier and attempts_used are trigger-owned, so
-- neither can be edited from the browser.
drop policy if exists "profiles: owner can read own" on public.user_profiles;
create policy "profiles: owner can read own"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles: admins can read all" on public.user_profiles;
create policy "profiles: admins can read all"
  on public.user_profiles for select
  to authenticated
  using (public.is_admin());

-- quiz_attempts: anyone signed in may record an attempt while they have one
-- left, but only a paid account may read attempts back. That is what makes the
-- free tier blind — the score never leaves the database.
drop policy if exists "attempts: owner can read own" on public.quiz_attempts;
drop policy if exists "attempts: paid owner can read own" on public.quiz_attempts;
create policy "attempts: paid owner can read own"
  on public.quiz_attempts for select
  to authenticated
  using (user_id = auth.uid() and public.is_paid());

drop policy if exists "attempts: paid user can insert own" on public.quiz_attempts;
drop policy if exists "attempts: user with an attempt left can insert own" on public.quiz_attempts;
create policy "attempts: user with an attempt left can insert own"
  on public.quiz_attempts for insert
  to authenticated
  with check (user_id = auth.uid() and public.can_attempt());

drop policy if exists "attempts: admins can read all" on public.quiz_attempts;
create policy "attempts: admins can read all"
  on public.quiz_attempts for select
  to authenticated
  using (public.is_admin());

-- admins: a user may confirm their own admin row (that is how the UI shows the
-- Admin tab) but cannot enumerate the list or add themselves.
drop policy if exists "admins: can read own row" on public.admins;
create policy "admins: can read own row"
  on public.admins for select
  to authenticated
  using (email = public.current_email());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on public.purchases            to authenticated;
grant select on public.user_profiles        to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant select on public.admins               to authenticated;

grant execute on function public.current_email()      to authenticated;
grant execute on function public.is_admin()           to authenticated;
grant execute on function public.has_purchased()      to authenticated;
grant execute on function public.is_paid()            to authenticated;
grant execute on function public.can_attempt()        to authenticated;
grant execute on function public.free_attempt_limit() to authenticated;
grant execute on function public.ensure_profile()     to authenticated;

-- ---------------------------------------------------------------------------
-- Backfill — accounts that existed before user_profiles did
-- ---------------------------------------------------------------------------

insert into public.user_profiles (id, email, tier)
select u.id,
       lower(u.email),
       case
         when exists (
           select 1 from public.purchases p
           where p.status = 'paid'
             and (p.user_id = u.id or p.email = lower(u.email))
         ) then 'paid'
         else 'free'
       end
from auth.users u
where u.email is not null
on conflict (id) do nothing;

-- Reconcile the counter with attempts already on record.
update public.user_profiles up
   set attempts_used = counted.n
from (
  select user_id, count(*) as n
  from public.quiz_attempts
  group by user_id
) counted
where counted.user_id = up.id
  and up.attempts_used < counted.n;

-- ---------------------------------------------------------------------------
-- Seed your admin account
-- ---------------------------------------------------------------------------
-- insert into public.admins (email) values ('you@example.com')
--   on conflict (email) do nothing;
