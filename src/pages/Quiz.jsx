import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import QuestionNav from '../components/QuestionNav.jsx';
import Timer from '../components/Timer.jsx';
import { FREE_ATTEMPT_LIMIT, PAID_ONLY_FEATURES, PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, LETTERS, PASS_THRESHOLD, QUESTIONS, TOPICS } from '../data/questions';
import {
  clearInProgress,
  loadInProgress,
  recordAttempt,
  saveInProgress,
  saveLastResult,
} from '../lib/attemptStorage';
import { gradeAttempt } from '../lib/scoring';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const EXAM_MS = EXAM_MINUTES * 60 * 1000;

export default function Quiz() {
  const navigate = useNavigate();
  const { user, email, isPaid, attemptsRemaining, canStartExam, refreshEntitlement } = useAuth();

  // `null` attempt = the pre-exam briefing screen.
  const [attempt, setAttempt] = useState(() => loadInProgress());
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Free tier lands here after submitting instead of on /results.
  const [blindSubmitted, setBlindSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const answers = attempt?.answers ?? {};
  const flagged = useMemo(() => new Set(attempt?.flagged ?? []), [attempt]);
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  const question = QUESTIONS[current];

  // Mirror every change to localStorage so a refresh mid-exam loses nothing.
  useEffect(() => {
    if (attempt) saveInProgress(attempt);
  }, [attempt]);

  const startExam = () => {
    const now = Date.now();
    setAttempt({ answers: {}, flagged: [], startedAt: now, deadline: now + EXAM_MS });
    setCurrent(0);
    submittedRef.current = false;
  };

  const selectAnswer = (letter) => {
    setAttempt((prev) => ({ ...prev, answers: { ...prev.answers, [question.id]: letter } }));
  };

  const toggleFlag = () => {
    setAttempt((prev) => {
      const next = new Set(prev.flagged);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return { ...prev, flagged: [...next] };
    });
  };

  const goTo = useCallback((index) => {
    setCurrent(Math.min(QUESTIONS.length - 1, Math.max(0, index)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const submit = useCallback(
    async (reason = 'manual') => {
      if (submittedRef.current || !attempt) return;
      submittedRef.current = true;

      setSubmitting(true);
      setSubmitError('');

      const submittedAt = Date.now();
      const graded = gradeAttempt(attempt.answers);
      const durationSeconds = Math.round((submittedAt - attempt.startedAt) / 1000);

      const record = {
        answers: attempt.answers,
        score: graded.score,
        correctCount: graded.correctCount,
        totalCount: graded.total,
        passed: graded.passed,
        topicBreakdown: graded.topicBreakdown,
        durationSeconds,
        startedAt: new Date(attempt.startedAt).toISOString(),
        submittedAt: new Date(submittedAt).toISOString(),
        autoSubmitted: reason === 'timeout',
      };

      // A free attempt is blind: nothing about the score is cached locally, so
      // there is no copy for /results to fall back on either.
      if (isPaid) saveLastResult(record);

      // Persist server-side too. A failed write must not cost the candidate
      // their result, so it only surfaces as a warning on the results page.
      let writeFailed = false;
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          email,
          answers: record.answers,
          score: record.score,
          correct_count: record.correctCount,
          total_count: record.totalCount,
          passed: record.passed,
          topic_breakdown: record.topicBreakdown,
          duration_seconds: record.durationSeconds,
          started_at: record.startedAt,
          submitted_at: record.submittedAt,
          auto_submitted: record.autoSubmitted,
        });

        if (error) {
          writeFailed = true;
          setSubmitError(error.message);
        }
      }

      if (!writeFailed) recordAttempt(user?.id);
      clearInProgress();

      // Pick up the server's new attempts_used so the dashboard and the guard
      // above agree about what is left.
      await refreshEntitlement();

      setSubmitting(false);

      if (isPaid) {
        navigate('/results', { replace: true, state: { justSubmitted: true } });
      } else {
        setBlindSubmitted(true);
        setConfirming(false);
        window.scrollTo({ top: 0 });
      }
    },
    [attempt, user, email, isPaid, navigate, refreshEntitlement]
  );

  const handleExpire = useCallback(() => {
    submit('timeout');
  }, [submit]);

  // Keyboard shortcuts: arrows to navigate, 1–4 or A–D to answer.
  useEffect(() => {
    if (!attempt || confirming || blindSubmitted) return;

    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') goTo(current + 1);
      else if (e.key === 'ArrowLeft') goTo(current - 1);
      else {
        const byNumber = ['1', '2', '3', '4'].indexOf(e.key);
        const byLetter = LETTERS.indexOf(e.key.toUpperCase());
        const index = byNumber >= 0 ? byNumber : byLetter;
        if (index >= 0) selectAnswer(LETTERS[index]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, confirming, blindSubmitted, current, goTo]);

  // Warn before an accidental tab close mid-exam.
  useEffect(() => {
    if (!attempt || blindSubmitted || submittedRef.current) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [attempt, blindSubmitted]);

  /* -------------------- Free tier: exam submitted, no score ---------------- */

  if (blindSubmitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
          ✅
        </span>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-900">Exam submitted</h1>
        <p className="mt-3 leading-relaxed text-ink-500">
          Your answers are recorded against your account. That was your free attempt, so the score
          and the review stay sealed — full access opens them, along with unlimited retakes.
        </p>

        {submitError && (
          <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            We couldn't save your attempt to the server: {submitError}
          </p>
        )}

        <div className="card mt-8 p-6 text-left sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold text-ink-900">Unlock your result</h2>
            <span className="text-xl font-extrabold tracking-tight whitespace-nowrap text-ink-900">
              {PRODUCT.priceLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">{PRODUCT.currencyNote}</p>

          <ul className="mt-5 space-y-2.5 text-sm">
            {PAID_ONLY_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-ink-700">
                <span className="mt-0.5 flex-none font-bold text-emerald-500">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <Link to="/checkout" className="btn-primary mt-6 w-full py-3">
            Get full access
          </Link>
        </div>

        <Link to="/dashboard" className="btn-secondary mt-6">
          Back to dashboard
        </Link>
      </div>
    );
  }

  /* ------------------- Free tier: attempt already spent -------------------- */

  if (!attempt && !canStartExam) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl">
          🔒
        </span>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-900">
          You've used your free attempt
        </h1>
        <p className="mt-3 leading-relaxed text-ink-500">
          The free tier includes {FREE_ATTEMPT_LIMIT} sitting
          {FREE_ATTEMPT_LIMIT === 1 ? '' : 's'}, and yours is on record. Upgrade once for unlimited
          retakes — plus the score and the full review of the attempt you already sat.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/checkout" className="btn-primary px-6 py-3 text-base">
            Get full access · {PRODUCT.priceLabel}
          </Link>
          <Link to="/dashboard" className="btn-secondary px-6 py-3 text-base">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------- Briefing screen ---------------------------- */

  if (!attempt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          Mendix Advanced — practice exam
        </h1>
        <p className="mt-3 text-ink-500">
          Read the rules, then start when you're ready. The clock starts the moment you begin.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Questions', QUESTIONS.length],
            ['Time limit', `${EXAM_MINUTES} min`],
            ['Pass mark', `${PASS_THRESHOLD}%`],
          ].map(([label, value]) => (
            <div key={label} className="card p-5 text-center">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>

        {!isPaid && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-900">
              This is your free attempt — {attemptsRemaining} of {FREE_ATTEMPT_LIMIT} remaining
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
              Submitting uses it up, and the free tier does not show your score, your pass/fail
              verdict or the answer explanations. If you want the result,{' '}
              <Link to="/checkout" className="font-semibold underline underline-offset-2">
                get full access
              </Link>{' '}
              — you can do it after you sit the exam and your attempt will still be there.
            </p>
          </div>
        )}

        <div className="card mt-6 p-6">
          <h2 className="font-semibold text-ink-900">How it works</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
            {[
              'One question at a time. Move freely with Next and Previous, or jump using the grid.',
              'Flag anything you want to revisit — flagged questions are marked in the grid.',
              'Your progress saves automatically, so a refresh or a closed tab will not lose answers.',
              `The exam auto-submits when the ${EXAM_MINUTES} minutes are up. Unanswered questions count as incorrect.`,
              'Keyboard shortcuts: ← → to navigate, 1–4 or A–D to answer.',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {rule}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm font-medium text-ink-700">Modules covered</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button type="button" onClick={startExam} className="btn-primary mt-8 w-full py-3 text-base">
          Start the exam
        </button>
      </div>
    );
  }

  /* ------------------------------ Exam screen ------------------------------ */

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Status bar */}
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="min-w-[12rem] flex-1">
          <ProgressBar value={answeredCount} max={QUESTIONS.length} label="Exam progress" />
        </div>
        <Timer deadline={attempt.deadline} onExpire={handleExpire} />
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn-primary"
          disabled={submitting}
        >
          Submit exam
        </button>
      </div>

      <QuestionCard
        question={question}
        index={current}
        total={QUESTIONS.length}
        selected={answers[question.id] ?? null}
        onSelect={selectAnswer}
      />

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          className="btn-secondary"
          disabled={current === 0}
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={toggleFlag}
          className={`btn ${
            flagged.has(question.id)
              ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'btn-secondary'
          }`}
          aria-pressed={flagged.has(question.id)}
        >
          {flagged.has(question.id) ? '★ Flagged' : '☆ Flag for review'}
        </button>

        {current === QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="btn-primary ml-auto"
            disabled={submitting}
          >
            Review & submit
          </button>
        ) : (
          <button type="button" onClick={() => goTo(current + 1)} className="btn-primary ml-auto">
            Next →
          </button>
        )}
      </div>

      {/* Navigator */}
      <div className="card mt-8 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-900">Question navigator</h2>
          <div className="flex flex-wrap gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-brand-200 bg-brand-100" /> Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-200 bg-white" /> Unanswered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-400" /> Flagged
            </span>
          </div>
        </div>

        <QuestionNav
          questions={QUESTIONS}
          answers={answers}
          current={current}
          onJump={goTo}
          flagged={flagged}
        />
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-rose-600">
          {submitError}
        </p>
      )}

      {/* Submit confirmation */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="card w-full max-w-md p-6 sm:p-8">
            <h2 id="confirm-title" className="text-xl font-bold text-ink-900">
              Submit your exam?
            </h2>

            <p className="mt-3 text-ink-500">
              You've answered{' '}
              <strong className="text-ink-900">
                {answeredCount} of {QUESTIONS.length}
              </strong>{' '}
              questions.
              {answeredCount < QUESTIONS.length && (
                <> Unanswered questions are marked incorrect.</>
              )}
            </p>

            {flagged.size > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                You still have {flagged.size} question{flagged.size === 1 ? '' : 's'} flagged for
                review.
              </p>
            )}

            {!isPaid && (
              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-ink-700">
                This uses your free attempt. You'll get a confirmation, not a score.
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={() => submit('manual')}
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
