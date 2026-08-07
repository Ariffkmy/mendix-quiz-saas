-- ============================================================================
-- Mendix Advanced — Exam Simulator
-- Initial schema: purchases, quiz attempts, admins, and row-level security.
--
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The signed-in user's email, lowercased. Purchases are keyed by email because
-- payment happens before the account exists.
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

comment on table public.quiz_attempts is
  'One row per submitted exam. Users insert and read their own; admins read all.';

create index if not exists quiz_attempts_user_id_idx      on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_email_idx        on public.quiz_attempts (email);
create index if not exists quiz_attempts_submitted_at_idx on public.quiz_attempts (submitted_at desc);

-- ---------------------------------------------------------------------------
-- Entitlement check
-- ---------------------------------------------------------------------------

-- True when the signed-in user has a completed purchase. Used by the RLS policy
-- on quiz_attempts so a non-paying account cannot record attempts.
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

-- ---------------------------------------------------------------------------
-- Link a purchase to its account once the buyer signs up
-- ---------------------------------------------------------------------------

create or replace function public.link_purchase_to_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.purchases
     set user_id = new.id
   where user_id is null
     and email = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_link_purchase on auth.users;
create trigger on_auth_user_created_link_purchase
  after insert on auth.users
  for each row execute function public.link_purchase_to_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.purchases     enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.admins        enable row level security;

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

-- quiz_attempts: a paying user may record and read their own attempts.
drop policy if exists "attempts: owner can read own" on public.quiz_attempts;
create policy "attempts: owner can read own"
  on public.quiz_attempts for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "attempts: paid user can insert own" on public.quiz_attempts;
create policy "attempts: paid user can insert own"
  on public.quiz_attempts for insert
  to authenticated
  with check (user_id = auth.uid() and public.has_purchased());

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

grant select on public.purchases     to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant select on public.admins        to authenticated;

grant execute on function public.current_email() to authenticated;
grant execute on function public.is_admin()      to authenticated;
grant execute on function public.has_purchased() to authenticated;

-- ---------------------------------------------------------------------------
-- Seed your admin account
-- ---------------------------------------------------------------------------
-- insert into public.admins (email) values ('you@example.com')
--   on conflict (email) do nothing;
