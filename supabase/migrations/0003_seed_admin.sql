-- ============================================================================
-- Seed the admin allow-list.
--
-- public.admins has no client insert policy and no self-service path in, so the
-- first admin has to arrive through a migration or the service role. Emails are
-- compared against current_email(), which lowercases — store them lowercase.
--
-- Idempotent; safe to re-run.
-- ============================================================================

insert into public.admins (email)
values ('ariffhakimichik@gmail.com')
on conflict (email) do nothing;
