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
 * Signing in is enough for everything except /admin — the product is free, so
 * there is no entitlement left to check.
 *
 * This is a UX gate, not the security boundary. The real enforcement is the
 * row-level security in Supabase, which returns a user only their own rows
 * however they reach a route.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, entitlementReady, isAdmin, isSupabaseConfigured } = useAuth();
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

  return children;
}
