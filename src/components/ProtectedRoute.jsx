import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

function Gate({ title, body, actions }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
      <p className="mt-3 text-ink-500">{body}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}

/**
 * Route guard.
 *
 * Signing in is enough for /dashboard and /quiz — a free account is a real
 * account. `requirePaid` covers the routes that reveal a score (/results,
 * /study); free users are sent to their dashboard rather than shown a wall,
 * since that is where the upgrade lives.
 *
 * This is a UX gate, not the security boundary. The real enforcement is the
 * row-level security in Supabase, which will not return an attempt row to a free
 * account even if it reaches /results directly.
 */
export default function ProtectedRoute({
  children,
  requirePaid = false,
  requireAdmin = false,
  redirectTo = null,
}) {
  const { user, loading, entitlementReady, isPaid, isAdmin, isSupabaseConfigured } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <Gate
        title="Backend not configured"
        body="Add your Supabase URL and anon key to .env, then restart the dev server to unlock the exam."
        actions={
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        }
      />
    );
  }

  // Only the first resolution blocks. Later refreshes (after a submission, after
  // a payment) update in place rather than unmounting the page underneath.
  if (loading || !entitlementReady) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner label="Checking your access…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Gate
        title="Admins only"
        body="This dashboard is limited to accounts listed in the admins table."
        actions={
          <Link to="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  if (requirePaid && !isPaid) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace state={{ upgradeRequired: location.pathname }} />;
    }

    return (
      <Gate
        title="That's a full-access feature"
        body="Your free attempt does not include scores, explanations or the study guides. Unlock everything with a single payment."
        actions={
          <>
            <Link to="/checkout" className="btn-primary">
              Get full access
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Back to dashboard
            </Link>
          </>
        }
      />
    );
  }

  return children;
}
