import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Session + entitlement state for the whole app.
 *
 * Entitlement ("has this person paid?") is read from the `purchases` table.
 * Row-level security restricts that table to the signed-in user's own rows, so
 * the client cannot fake a paid row by tampering with the query — the gate is
 * enforced in the database, not here.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [entitlementLoading, setEntitlementLoading] = useState(false);

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
      setIsAdmin(false);
      return;
    }

    setEntitlementLoading(true);
    try {
      const [purchaseRes, adminRes] = await Promise.all([
        supabase
          .from('purchases')
          .select('id, email, status, amount_total, currency, created_at, paid_at')
          .eq('status', 'paid')
          .order('paid_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('admins').select('email').limit(1).maybeSingle(),
      ]);

      setPurchase(purchaseRes.error ? null : (purchaseRes.data ?? null));
      setIsAdmin(!adminRes.error && Boolean(adminRes.data));
    } finally {
      setEntitlementLoading(false);
    }
  }, [user]);

  // Re-check entitlement whenever the signed-in identity changes.
  useEffect(() => {
    refreshEntitlement();
  }, [refreshEntitlement]);

  /** Send a passwordless magic link. */
  const signInWithEmail = useCallback(async (targetEmail, redirectPath = '/quiz') => {
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
    setPurchase(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      email,
      loading,
      entitlementLoading,
      purchase,
      hasPurchased: Boolean(purchase),
      isAdmin,
      isSupabaseConfigured,
      signInWithEmail,
      signOut,
      refreshEntitlement,
    }),
    [
      session,
      user,
      email,
      loading,
      entitlementLoading,
      purchase,
      isAdmin,
      signInWithEmail,
      signOut,
      refreshEntitlement,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
