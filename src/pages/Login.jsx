import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign in.
 *
 * The magic link is the default path and works for every account, including the
 * ones created at /register. Those accounts also have a password, so there is a
 * toggle for people who would rather type it than wait for an email.
 */
export default function Login() {
  const { user, signInWithEmail, signInWithPassword, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ?? '/dashboard';

  const [mode, setMode] = useState('link'); // link | password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (mode === 'password' && !password) {
      setError('Enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'password') {
        await signInWithPassword(trimmed, password);
        navigate(from, { replace: true });
      } else {
        await signInWithEmail(trimmed, from);
        setSent(true);
      }
    } catch (err) {
      setError(err.message || 'Could not sign you in.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
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
        <button type="button" onClick={() => setSent(false)} className="btn-secondary mt-7">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Sign in</h1>
      <p className="mt-3 text-ink-500">
        {mode === 'link'
          ? "We'll email you a secure link — no password needed."
          : 'Use the password you chose when you registered.'}
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

        {mode === 'password' && (
          <>
            <label htmlFor="login-password" className="label mt-5">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting || !isSupabaseConfigured}
            />
          </>
        )}

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
          {submitting
            ? mode === 'password'
              ? 'Signing in…'
              : 'Sending link…'
            : mode === 'password'
              ? 'Sign in'
              : 'Email me a sign-in link'}
        </button>

        <button
          type="button"
          onClick={() => switchMode(mode === 'link' ? 'password' : 'link')}
          className="mt-4 w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700"
          disabled={submitting}
        >
          {mode === 'link' ? 'Use my password instead' : 'Email me a link instead'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Start practising free
        </Link>
        .
      </p>
    </div>
  );
}
