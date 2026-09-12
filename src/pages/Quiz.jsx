import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import QuestionNav from '../components/QuestionNav.jsx';
import Timer from '../components/Timer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, LETTERS, PASS_THRESHOLD } from '../data/questions';
import {
  clearInProgress,
  loadInProgress,
  recordAttempt,
  saveInProgress,
  saveLastResult,
} from '../lib/attemptStorage';
import { fetchQuestions, submitAttempt } from '../lib/questionBank';
import { isSupabaseConfigured } from '../lib/supabase';
import Spinner from '../components/Spinner.jsx';

const EXAM_MS = EXAM_MINUTES * 60 * 1000;

export default function Quiz() {
  const navigate = useNavigate();
  const { user, refreshEntitlement } = useAuth();

  // The paper is fetched from Supabase — it is no longer bundled, so that the
  // answer key never reaches the browser for a free account.
  const [questions, setQuestions] = useState([]);
  const [bankError, setBankError] = useState('');
  const [bankLoading, setBankLoading] = useState(true);

  // `null` attempt = the pre-exam briefing screen.
  const [attempt, setAttempt] = useState(() => loadInProgress());
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submittedRef = useRef(false);

  const answers = attempt?.answers ?? {};
  const flagged = useMemo(() => new Set(attempt?.flagged ?? []), [attempt]);
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const question = questions[current];

  const topics = useMemo(
    () => [...new Set(questions.map((q) => q.topic))],
    [questions]
  );

  // Load the paper once per session.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setBankLoading(false);
      return;
    }

    let active = true;

    fetchQuestions()
      .then((rows) => {
        if (!active) return;
        setQuestions(rows);
        if (!rows.length) setBankError('The question bank is empty. Run the seed script.');
      })
      .catch((err) => active && setBankError(err.message))
      .finally(() => active && setBankLoading(false));

    return () => {
      active = false;
    };
  }, []);

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
    setCurrent(Math.min(questions.length - 1, Math.max(0, index)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questions.length]);

  const submit = useCallback(
    async (reason = 'manual') => {
      if (submittedRef.current || !attempt) return;
      submittedRef.current = true;

      setSubmitting(true);
      setSubmitError('');

      const submittedAt = Date.now();
      const durationSeconds = Math.round((submittedAt - attempt.startedAt) / 1000);

      // Grading happens in Postgres. The client no longer computes a score at
      // all — it cannot, since it has no answer key — so there is nothing here
      // for a tampered client to inflate.
      let result = null;
      let writeFailed = false;

      if (isSupabaseConfigured && user) {
        try {
          result = await submitAttempt(attempt.answers, {
            startedAt: new Date(attempt.startedAt).toISOString(),
            durationSeconds,
            autoSubmitted: reason === 'timeout',
          });
        } catch (err) {
          writeFailed = true;
          setSubmitError(err.message);
        }
      }

      // Cache the graded result so /results renders immediately.
      if (!writeFailed && result) {
        saveLastResult({
          answers: attempt.answers,
          score: result.score,
          correctCount: result.correct_count,
          totalCount: result.total_count,
          passed: result.passed,
          topicBreakdown: result.topic_breakdown ?? [],
          durationSeconds: result.duration_seconds,
          startedAt: result.started_at,
          submittedAt: result.submitted_at,
          autoSubmitted: result.auto_submitted,
        });
      }

      if (!writeFailed) {
        recordAttempt(user?.id);
        clearInProgress();
      } else {
        // The submission never landed, so let them try again rather than
        // stranding them on a dead screen with their answers cleared.
        submittedRef.current = false;
        setSubmitting(false);
        setConfirming(false);
        return;
      }

      // Pick up the server's new attempts_used for the dashboard counter.
      await refreshEntitlement();

      setSubmitting(false);
      navigate('/results', { replace: true, state: { justSubmitted: true } });
    },
    [attempt, user, navigate, refreshEntitlement]
  );

  const handleExpire = useCallback(() => {
    submit('timeout');
  }, [submit]);

  // Keyboard shortcuts: arrows to navigate, 1–4 or A–D to answer.
  useEffect(() => {
    if (!attempt || confirming) return;

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
  }, [attempt, confirming, current, goTo]);

  // Warn before an accidental tab close mid-exam.
  useEffect(() => {
    if (!attempt || submittedRef.current) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [attempt]);

  /* ----------------------- Loading / empty bank ---------------------------- */

  // Only gate the screens that actually need the paper. A finished free attempt
  // still renders its confirmation even if a later refetch came back empty.
  if (bankLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading the exam…" />
      </div>
    );
  }

  if (bankError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">The exam could not be loaded</h1>
        <p className="mt-3 text-ink-500">{bankError}</p>
        <Link to="/dashboard" className="btn-primary mt-7">
          Back to dashboard
        </Link>
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
            ['Questions', questions.length],
            ['Time limit', `${EXAM_MINUTES} min`],
            ['Pass mark', `${PASS_THRESHOLD}%`],
          ].map(([label, value]) => (
            <div key={label} className="card p-5 text-center">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>

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
              {topics.map((topic) => (
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
          <ProgressBar value={answeredCount} max={questions.length} label="Exam progress" />
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
        total={questions.length}
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

        {current === questions.length - 1 ? (
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
          questions={questions}
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
                {answeredCount} of {questions.length}
              </strong>{' '}
              questions.
              {answeredCount < questions.length && (
                <> Unanswered questions are marked incorrect.</>
              )}
            </p>

            {flagged.size > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                You still have {flagged.size} question{flagged.size === 1 ? '' : 's'} flagged for
                review.
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
