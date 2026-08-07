import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { verifyCheckoutSession } from '../lib/api';

/**
 * Landing spot after Stripe Checkout.
 *
 * Stripe's webhook is what actually grants access, but the browser usually gets
 * back here first — so this page asks the server to reconcile the session, then
 * emails a magic link so the buyer can sign in and start immediately.
 */
export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const navigate = useNavigate();

  const { user, hasPurchased, signInWithEmail, refreshEntitlement } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying | ready | linkSent | error
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No checkout session was provided. If you were charged, contact support.');
      return;
    }

    // React 18+ StrictMode double-invokes effects in dev; verify only once.
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const result = await verifyCheckoutSession(sessionId);
        if (!result.paid) {
          setStatus('error');
          setError(
            'This payment has not completed yet. If you were charged, wait a moment and refresh — access is granted automatically.'
          );
          return;
        }
        setEmail(result.email ?? '');
        setStatus('ready');
        await refreshEntitlement();
      } catch (err) {
        setStatus('error');
        setError(err.message || 'We could not confirm your payment.');
      }
    })();
  }, [sessionId, refreshEntitlement]);

  // Already signed in as the buyer? Skip the magic-link step entirely.
  useEffect(() => {
    if (status === 'ready' && user && hasPurchased) {
      navigate('/quiz', { replace: true });
    }
  }, [status, user, hasPurchased, navigate]);

  const sendLink = async () => {
    setSendingLink(true);
    setError('');
    try {
      await signInWithEmail(email, '/quiz');
      setStatus('linkSent');
    } catch (err) {
      setError(err.message || 'Could not send the sign-in link.');
    } finally {
      setSendingLink(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Confirming your payment…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
          ⚠️
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">We couldn't confirm that yet</h1>
        <p className="mt-3 text-ink-500">{error}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Try again
          </button>
          <Link to="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'linkSent') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
          ✉️
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Check your inbox</h1>
        <p className="mt-3 text-ink-500">
          We sent a secure sign-in link to <strong className="text-ink-900">{email}</strong>. Click it
          and you'll land straight on the exam.
        </p>
        <p className="mt-6 text-sm text-ink-500">
          Nothing after a minute? Check spam, or{' '}
          <button
            type="button"
            onClick={sendLink}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            send it again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
        ✅
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink-900">Payment confirmed</h1>
      <p className="mt-3 text-ink-500">
        Your access is tied to <strong className="text-ink-900">{email}</strong>. Send yourself a
        sign-in link to start the exam — no password needed.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={sendLink}
        className="btn-primary mt-7 px-7 py-3 text-base"
        disabled={sendingLink}
      >
        {sendingLink ? 'Sending…' : 'Email me my sign-in link'}
      </button>

      <p className="mt-6 text-sm text-ink-500">
        Keep this email address — it's how you get back in later.
      </p>
    </div>
  );
}
