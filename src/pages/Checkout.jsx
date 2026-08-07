import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, QUESTIONS, TOPICS } from '../data/questions';
import { createCheckoutSession } from '../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const { email: signedInEmail, hasPurchased } = useAuth();
  const [email, setEmail] = useState(signedInEmail ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address — this is where your access is sent.');
      return;
    }

    setSubmitting(true);
    try {
      const { url } = await createCheckoutSession(trimmed);
      if (!url) throw new Error('Stripe did not return a checkout URL.');
      // Hand off to Stripe-hosted Checkout. Card details never touch this app.
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try again.');
      setSubmitting(false);
    }
  };

  if (hasPurchased) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">You already have access</h1>
        <p className="mt-3 text-ink-500">
          This account has already purchased the exam simulator — no need to pay again.
        </p>
        <Link to="/quiz" className="btn-primary mt-7">
          Go to the exam
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        {/* Order summary */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-sm font-bold tracking-wide text-ink-500 uppercase">Order summary</h2>

          <div className="mt-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="font-semibold text-ink-900">{PRODUCT.name}</p>
              <p className="mt-1 text-sm text-ink-500">Lifetime access · one-time payment</p>
            </div>
            <span className="text-xl font-bold whitespace-nowrap text-ink-900">
              {PRODUCT.priceLabel}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
            {[
              `${QUESTIONS.length} exam-style questions across ${TOPICS.length} modules`,
              `${EXAM_MINUTES}-minute timed exam simulation`,
              'Detailed explanation for every answer',
              'Topic-by-topic score breakdown',
              'Full knowledge base study guides',
              'Unlimited retakes, forever',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
            <span className="font-semibold text-ink-900">Total due today</span>
            <span className="text-2xl font-extrabold text-ink-900">{PRODUCT.priceLabel}</span>
          </div>
        </div>

        {/* Email + pay */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Get your access</h1>
          <p className="mt-3 text-ink-500">
            Enter the email you want your access tied to. After payment we email you a secure sign-in
            link — no password to remember.
          </p>

          <form onSubmit={handleSubmit} className="card mt-7 p-6 sm:p-8" noValidate>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'email-error' : undefined}
              disabled={submitting}
            />

            {error && (
              <p id="email-error" role="alert" className="mt-2.5 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary mt-6 w-full py-3 text-base" disabled={submitting}>
              {submitting ? 'Redirecting to Stripe…' : `Pay ${PRODUCT.priceLabel} securely`}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-ink-500">
              You'll be taken to Stripe's secure checkout. We never see or store your card details.
            </p>
          </form>

          <p className="mt-6 text-sm text-ink-500">
            Already paid?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in with your email
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
