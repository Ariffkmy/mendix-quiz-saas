import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { FEATURES } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES } from '../data/questions';
import { useExamOverview } from '../hooks/useExamOverview';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/**
 * Free-tier sign-up: email + password, no card.
 *
 * The account lands on the free tier by default — the database seeds
 * `user_profiles.tier = 'free'` from the auth trigger, so there is nothing to set
 * here beyond creating the user.
 */
export default function Register() {
  const { questionCount, topics } = useExamOverview();
  const { user, signUpWithPassword, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Already signed in (or the sign-up returned a session) — straight to the hub.
  useEffect(() => {
    if (user && !confirmationSent) navigate('/dashboard', { replace: true });
  }, [user, confirmationSent, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Choose a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const { needsConfirmation } = await signUpWithPassword(trimmed, password);
      if (needsConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
          ✉️
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Confirm your email</h1>
        <p className="mt-3 text-ink-500">
          We sent a confirmation link to <strong className="text-ink-900">{email}</strong>. Click it
          and your free attempt is ready.
        </p>
        <Link to="/login" className="btn-secondary mt-7">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* Form */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase">
            Free account
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            Start practising free
          </h1>
          <p className="mt-3 text-ink-500">
            Unlimited {EXAM_MINUTES}-minute exams, {questionCount} questions, free forever.
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Supabase isn't configured. Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code>{' '}
              file.
            </div>
          )}

          <form onSubmit={handleSubmit} className="card mt-7 p-6 sm:p-8" noValidate>
            <label htmlFor="register-email" className="label">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || !isSupabaseConfigured}
            />

            <label htmlFor="register-password" className="label mt-5">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              className="input"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'register-error' : 'register-password-hint'}
              disabled={submitting || !isSupabaseConfigured}
            />
            <p id="register-password-hint" className="mt-2 text-xs text-ink-500">
              {MIN_PASSWORD} characters minimum.
            </p>

            {error && (
              <p id="register-error" role="alert" className="mt-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary mt-6 w-full py-3 text-base"
              disabled={submitting || !isSupabaseConfigured}
            >
              {submitting ? 'Creating your account…' : 'Create my free account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
            .
          </p>
        </div>

        {/* What free gets you, and what it doesn't */}
        <div className="card p-6 sm:p-8">
          <h2 className="font-semibold text-ink-900">What the free account includes</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-700">
            {FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">One thing to know</p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
              The free attempt is blind: you sit the exam and submit it, but the score, the pass/fail
              verdict and the answer explanations are part of full access. Upgrade any time — your
              attempts are kept.
            </p>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink-500">
            All {topics.length} modules of the Advanced blueprint are included. Nothing is
            held back from the question bank.
          </p>
        </div>
      </div>
    </div>
  );
}
