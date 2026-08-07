import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { FREE_ATTEMPT_LIMIT } from '../config';
import { clearAttemptData } from '../lib/attemptStorage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Session + tier state for the whole app.
 *
 * There are two tiers. A **free** account may sit the exam once and never sees a
 * score. A **paid** account (one Stripe payment) gets unlimited attempts and the
 * full analytics dashboard.
 *
 * Both facts are read from the database, not decided here: `user_profiles.tier`
 * is written only by triggers, `attempts_used` is incremented by a trigger on
 * quiz_attempts, and row-level security refuses to return attempt rows to a free
 * account at all. Everything below is presentation on top of those guarantees.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entitlementLoading, setEntitlementLoading] = useState(false);
  // True once tier has been resolved at least once for the current identity.
  // Route guards wait on this rather than on `entitlementLoading`, so a
  // mid-session refresh does not blank the page the user is standing on.
  const [entitlementReady, setEntitlementReady] = useState(false);

  const user = session?.user ?? null;
  const email = user?.email ?? null;

  // Bootstrap the session and follow sign-in / sign-out / token-refresh events.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshEntitlement = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setPurchase(null);
      setProfile(null);
      setIsAdmin(false);
      setEntitlementReady(true);
      return;
    }

    setEntitlementLoading(true);
    try {
      // ensure_profile() creates the row on first sign-in and promotes it if a
      // payment landed while the user was away, then hands it back.
      const [purchaseRes, adminRes, profileRes] = await Promise.all([
        supabase
          .from('purchases')
          .select('id, email, status, amount_total, currency, created_at, paid_at')
          .eq('status', 'paid')
          .order('paid_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('admins').select('email').limit(1).maybeSingle(),
        supabase.rpc('ensure_profile'),
      ]);

      setPurchase(purchaseRes.error ? null : (purchaseRes.data ?? null));
      setIsAdmin(!adminRes.error && Boolean(adminRes.data));
      setProfile(profileRes.error ? null : (profileRes.data ?? null));
    } finally {
      setEntitlementLoading(false);
      setEntitlementReady(true);
    }
  }, [user]);

  // A new identity means the previous answer is stale, not merely refreshing.
  useEffect(() => {
    setEntitlementReady(false);
  }, [user?.id]);

  // Re-check tier whenever the signed-in identity changes.
  useEffect(() => {
    refreshEntitlement();
  }, [refreshEntitlement]);

  /** Create a free account with an email and password. */
  const signUpWithPassword = useCallback(async (targetEmail, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured — add your keys to .env to enable sign-up.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: targetEmail.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) throw new Error(error.message);

    // With email confirmation switched on, Supabase returns a user but no
    // session — the caller has to tell them to check their inbox instead of
    // pushing them at the dashboard.
    return { needsConfirmation: !data.session, user: data.user ?? null };
  }, []);

  /** Sign in with the password chosen at registration. */
  const signInWithPassword = useCallback(async (targetEmail, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured — add your keys to .env to enable sign-in.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail.trim().toLowerCase(),
      password,
    });

    if (error) throw new Error(error.message);
  }, []);

  /** Send a passwordless magic link. */
  const signInWithEmail = useCallback(async (targetEmail, redirectPath = '/dashboard') => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured — add your keys to .env to enable sign-in.');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}${redirectPath}`,
        shouldCreateUser: true,
      },
    });

    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    // Never leave one account's cached score behind for the next person on this
    // browser to find.
    clearAttemptData();
    setPurchase(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(() => {
    const hasPurchased = Boolean(purchase);
    // Admins are treated as paid so they can exercise the product they support.
    const isPaid = hasPurchased || profile?.tier === 'paid' || isAdmin;
    const attemptsUsed = profile?.attempts_used ?? 0;
    const attemptsRemaining = isPaid ? Infinity : Math.max(0, FREE_ATTEMPT_LIMIT - attemptsUsed);

    return {
      session,
      user,
      email,
      loading,
      entitlementLoading,
      entitlementReady,
      purchase,
      profile,
      hasPurchased,
      tier: isPaid ? 'paid' : 'free',
      isPaid,
      isFree: !isPaid,
      attemptsUsed,
      attemptsRemaining,
      canStartExam: isPaid || attemptsRemaining > 0,
      isAdmin,
      isSupabaseConfigured,
      signUpWithPassword,
      signInWithPassword,
      signInWithEmail,
      signOut,
      refreshEntitlement,
    };
  }, [
    session,
    user,
    email,
    loading,
    entitlementLoading,
    entitlementReady,
    purchase,
    profile,
    isAdmin,
    signUpWithPassword,
    signInWithPassword,
    signInWithEmail,
    signOut,
    refreshEntitlement,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
