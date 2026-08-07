import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, signInWithEmail, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ?? '/quiz';

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Magic-link callbacks land here with a session already established.
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(trimmed, from);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the sign-in link.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
          ✉️
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Check your inbox</h1>
        <p className="mt-3 text-ink-500">
          We sent a sign-in link to <strong className="text-ink-900">{email}</strong>. It expires in
          an hour.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="btn-secondary mt-7"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Sign in</h1>
      <p className="mt-3 text-ink-500">
        Use the email you paid with. We'll send a secure link — there's no password.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Supabase isn't configured. Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-7 p-6 sm:p-8" noValidate>
        <label htmlFor="login-email" className="label">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'login-error' : undefined}
          disabled={submitting || !isSupabaseConfigured}
        />

        {error && (
          <p id="login-error" role="alert" className="mt-2.5 text-sm text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary mt-6 w-full py-3 text-base"
          disabled={submitting || !isSupabaseConfigured}
        >
          {submitting ? 'Sending link…' : 'Email me a sign-in link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Haven't bought access yet?{' '}
        <Link to="/checkout" className="font-medium text-brand-600 hover:text-brand-700">
          Get the exam simulator
        </Link>
        .
      </p>
    </div>
  );
}
