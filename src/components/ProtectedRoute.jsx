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
 * This is a UX gate, not the security boundary — the real enforcement is the
 * row-level security in Supabase, which will not return exam or purchase data
 * to a user who has not paid even if they reach the route directly.
 */
export default function ProtectedRoute({ children, requirePurchase = false, requireAdmin = false }) {
  const { user, loading, entitlementLoading, hasPurchased, isAdmin, isSupabaseConfigured } =
    useAuth();
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

  if (loading || entitlementLoading) {
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
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        }
      />
    );
  }

  if (requirePurchase && !hasPurchased && !isAdmin) {
    return (
      <Gate
        title="You don't have access yet"
        body="We couldn't find a completed purchase for this email address. Buy access once and the exam unlocks for good."
        actions={
          <>
            <Link to="/checkout" className="btn-primary">
              Get access
            </Link>
            <Link to="/" className="btn-secondary">
              Back to home
            </Link>
          </>
        }
      />
    );
  }

  return children;
}
