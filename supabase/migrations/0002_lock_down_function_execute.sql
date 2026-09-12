-- ============================================================================
-- Tighten EXECUTE privileges on public functions.
--
-- Postgres grants EXECUTE to PUBLIC on every newly created function, so the
-- explicit `grant ... to authenticated` in 0001 never actually narrowed
-- anything: `anon` could still call every helper — and every trigger function —
-- over /rest/v1/rpc. These are all SECURITY DEFINER, so the default is worth
-- closing even though none of them leak data today.
--
-- Two groups:
--   * Entitlement helpers — revoke PUBLIC/anon, re-grant to authenticated only.
--   * Trigger functions   — revoke from everyone. Postgres invokes them as the
--                           table owner regardless of who holds EXECUTE, so no
--                           trigger loses any privilege it needs.
--
-- Idempotent; safe to re-run.
-- ============================================================================

-- --- Entitlement helpers: signed-in callers only ----------------------------

revoke all on function public.current_email()      from public, anon;
revoke all on function public.is_admin()           from public, anon;
revoke all on function public.has_purchased()      from public, anon;
revoke all on function public.is_paid()            from public, anon;
revoke all on function public.can_attempt()        from public, anon;
revoke all on function public.free_attempt_limit() from public, anon;
revoke all on function public.ensure_profile()     from public, anon;

grant execute on function public.current_email()      to authenticated;
grant execute on function public.is_admin()           to authenticated;
grant execute on function public.has_purchased()      to authenticated;
grant execute on function public.is_paid()            to authenticated;
grant execute on function public.can_attempt()        to authenticated;
grant execute on function public.free_attempt_limit() to authenticated;
grant execute on function public.ensure_profile()     to authenticated;

-- --- Trigger functions: not callable by any client --------------------------
--
-- RLS on quiz_attempts leans on the fact that attempts_used is trigger-owned.
-- count_quiz_attempt() is the function that increments it, so leaving it
-- reachable over RPC is the one that would actually matter.

revoke all on function public.lowercase_purchase_email()        from public, anon, authenticated;
revoke all on function public.handle_new_user()                 from public, anon, authenticated;
revoke all on function public.sync_profile_tier_from_purchase() from public, anon, authenticated;
revoke all on function public.stamp_quiz_attempt()              from public, anon, authenticated;
revoke all on function public.count_quiz_attempt()              from public, anon, authenticated;
