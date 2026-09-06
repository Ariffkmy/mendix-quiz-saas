import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import QuestionNav from '../components/QuestionNav.jsx';
import Spinner from '../components/Spinner.jsx';
import { FREE_ATTEMPT_LIMIT, PAID_ONLY_FEATURES, PRODUCT, RESULTS_UNLOCKED } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DEFAULT_EXAM_LEVEL,
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  LETTERS,
} from '../data/questions';
import {
  clearInProgress,
  loadInProgress,
  loadSeenQuestions,
  recordAttempt,
  recordSeenQuestions,
  saveInProgress,
  saveLastResult,
} from '../lib/attemptStorage';
import {
  buildExam,
  clampExamSize,
  DEFAULT_EXAM_SIZE,
  MIN_EXAM_QUESTIONS,
  planTopicCounts,
} from '../lib/examBuilder';
import { gradeAttempt, questionsFromAnswers } from '../lib/scoring';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Quiz() {
  const navigate = useNavigate();
  const { user, email, loading, isPaid, attemptsRemaining, canStartExam, refreshEntitlement } =
    useAuth();

  // Anonymous visitors arrive straight from "Start practising free". Their
  // sitting is local-only: nothing is written to Supabase and no score is shown.
  const isAnonymous = !loading && !user;

  // `null` attempt = the setup screen, where the sitting is configured.
  const [attempt, setAttempt] = useState(() => loadInProgress());
  const [examLevel, setExamLevel] = useState(
    () => loadInProgress()?.examLevel ?? DEFAULT_EXAM_LEVEL
  );
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Free tier lands here after submitting instead of on /results.
  const [blindSubmitted, setBlindSubmitted] = useState(false);
  // How many questions the candidate wants. Defaults to a short sitting rather
  // than the full bank — most people are here to practise in the time they
  // have, and the full exam is one click away.
  const [examSize, setExamSize] = useState(DEFAULT_EXAM_SIZE);
  const submittedRef = useRef(false);

  const selectedBank = useMemo(
    () => EXAM_CATEGORIES[examLevel]?.questions ?? EXAM_CATEGORIES[DEFAULT_EXAM_LEVEL].questions,
    [examLevel]
  );
  const sizePresets = useMemo(
    () => [...new Set([10, 25, 50, selectedBank.length])].filter((size) => size <= selectedBank.length),
    [selectedBank]
  );

  const answers = attempt?.answers ?? {};
  const flagged = useMemo(() => new Set(attempt?.flagged ?? []), [attempt]);

  // The sitting's own question set — a subset of the bank when the candidate
  // asked for a short exam. Recovered from the seeded answer keys so a refresh
  // mid-exam restores exactly the questions that were drawn.
  const examQuestions = useMemo(() => {
    if (!attempt) return [];
    const asked = questionsFromAnswers(attempt.answers);
    return asked.length > 0 ? asked : selectedBank;
  }, [attempt, selectedBank]);

  const answeredCount = examQuestions.filter((q) => answers[q.id]).length;
  const question = examQuestions[Math.min(current, examQuestions.length - 1)];

  // The live plan for the size currently selected on the setup screen.
  const plan = useMemo(
    () => planTopicCounts(examSize, selectedBank),
    [examSize, selectedBank]
  );

  // Mirror every change to localStorage so a refresh mid-exam loses nothing.
  useEffect(() => {
    if (attempt) saveInProgress(attempt);
  }, [attempt]);

  const startExam = useCallback((size = selectedBank.length) => {
    // Draw around what this browser has already been asked, so a retake is a
    // genuinely new set rather than the last sitting reshuffled.
    const drawn = buildExam(size, { bank: selectedBank, seen: loadSeenQuestions() });
    const now = Date.now();

    // Banked as soon as the questions are on screen: an abandoned sitting still
    // counts as seen, so walking away and starting again gives fresh questions.
    recordSeenQuestions(drawn.map((q) => q.id));

    // Seed every drawn question so the answer map records what was asked, not
    // only what was answered. Grading reads the set back from these keys.
    const seeded = Object.fromEntries(drawn.map((q) => [q.id, null]));

    setAttempt({
      answers: seeded,
      flagged: [],
      startedAt: now,
      examLevel,
    });
    setCurrent(0);
    setBlindSubmitted(false);
    setSubmitError('');
    submittedRef.current = false;
  }, [examLevel, selectedBank]);

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

  const goTo = useCallback(
    (index) => {
      setCurrent(Math.min(examQuestions.length - 1, Math.max(0, index)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [examQuestions.length]
  );

  const submit = useCallback(
    async () => {
      if (submittedRef.current || !attempt) return;
      submittedRef.current = true;

      setSubmitting(true);
      setSubmitError('');

      const submittedAt = Date.now();
      // Grade against the questions this sitting actually asked — never the
      // whole bank, which would mark every undrawn question wrong.
      const graded = gradeAttempt(attempt.answers, examQuestions);
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
        autoSubmitted: false,
      };

      // A free attempt is blind: nothing about the score is cached locally, so
      // there is no copy for /results to fall back on either. In local
      // development that is switched off so the real score can be checked.
      if (isPaid || RESULTS_UNLOCKED) saveLastResult(record);

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

      if (isPaid || RESULTS_UNLOCKED) {
        navigate('/results', { replace: true, state: { justSubmitted: true } });
      } else {
        setBlindSubmitted(true);
        setConfirming(false);
        window.scrollTo({ top: 0 });
      }
    },
    [attempt, examQuestions, user, email, isPaid, navigate, refreshEntitlement]
  );

  // Keyboard shortcuts: arrows to navigate, 1–4 or A–D to answer.
  useEffect(() => {
    if (!attempt || confirming || blindSubmitted) return;

    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') goTo(current + 1);
      else if (e.key === 'ArrowLeft') goTo(current - 1);
      else {
        // Bounded by the current question's own options: a true/false question
        // has no C or D to select.
        const letters = question.letters ?? LETTERS;
        const byNumber = ['1', '2', '3', '4'].indexOf(e.key);
        const byLetter = letters.indexOf(e.key.toUpperCase());
        const index = byNumber >= 0 ? byNumber : byLetter;
        if (index >= 0 && index < letters.length) selectAnswer(letters[index]);
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
          {isAnonymous
            ? 'That was the free sitting, so the score and the review stay sealed. Full access opens them — along with unlimited retakes and a dashboard that keeps every attempt.'
            : 'Your answers are recorded against your account. That was your free attempt, so the score and the review stay sealed — full access opens them, along with unlimited retakes.'}
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

        {isAnonymous ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => startExam(clampExamSize(examSize, selectedBank))}
              className="btn-secondary"
            >
              Sit it again
            </button>
            <Link to="/" className="btn-ghost">
              Back to home
            </Link>
          </div>
        ) : (
          <Link to="/dashboard" className="btn-secondary mt-6">
            Back to dashboard
          </Link>
        )}
      </div>
    );
  }

  /* ------- Session still resolving: don't flash the briefing at a paid ------ */

  if (!attempt && loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner label="Loading your exam…" />
      </div>
    );
  }

  /* ------------------- Free tier: attempt already spent -------------------- */

  // Anonymous sittings have no account to count against, so this never applies
  // to them — the auto-start above has already handed them a fresh exam.
  if (!attempt && !isAnonymous && !canStartExam) {
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

  /* ----------------------------- Setup screen ------------------------------ */

  // One question: how big a sitting do you want? Everything else about the
  // exam is explained on the way past rather than in a wall of rules — the
  // whole point of this screen is to get out of the way.
  if (!attempt) {
    const startSize = clampExamSize(examSize, selectedBank);

    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="text-center text-3xl font-bold tracking-tight text-ink-900">
          Build your practice exam
        </h1>
        <p className="mt-3 text-center text-ink-500">
          Choose your certification level and question count. Every sitting keeps the same topic mix
          as that level's full bank.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          <fieldset>
            <legend className="text-sm font-semibold text-ink-900">Certification level</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {EXAM_LEVELS.map((level) => {
                const selected = examLevel === level;
                const meta = EXAM_CATEGORIES[level];
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setExamLevel(level);
                      setExamSize(DEFAULT_EXAM_SIZE);
                    }}
                    aria-pressed={selected}
                    className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                      selected
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40'
                    }`}
                  >
                    <span className={`block font-bold ${selected ? 'text-brand-700' : 'text-ink-900'}`}>
                      {level}
                    </span>
                    <span className="mt-1 block text-xs text-ink-500">
                      {meta.questionCount} questions · {meta.topics.length} topics
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-7 text-sm font-semibold text-ink-900">Number of questions</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Exam length">
            {sizePresets.map((preset) => {
              const selected = startSize === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setExamSize(preset)}
                  aria-pressed={selected}
                  className={`rounded-2xl border-2 px-3 py-4 text-center transition ${
                    selected
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40'
                  }`}
                >
                  <span
                    className={`block text-2xl font-extrabold tracking-tight ${
                      selected ? 'text-brand-700' : 'text-ink-900'
                    }`}
                  >
                    {preset}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-ink-500">
                    questions
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 pt-5">
            <label htmlFor="exam-size" className="text-sm text-ink-500">
              Or type a number
            </label>
            <input
              id="exam-size"
              type="number"
              min={MIN_EXAM_QUESTIONS}
              max={selectedBank.length}
              value={examSize}
              onChange={(e) => setExamSize(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={(e) => setExamSize(clampExamSize(e.target.value, selectedBank))}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm focus:border-brand-500 focus:outline-none"
            />
            <span className="text-sm text-ink-500">
              {MIN_EXAM_QUESTIONS}–{selectedBank.length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => startExam(startSize)}
          className="btn-primary mt-6 w-full py-3.5 text-base"
        >
          Start {startSize} question{startSize === 1 ? '' : 's'}
        </button>

        {/* The topic split, kept to one line so it informs without becoming a
            second screen to read. */}
        <details className="group mt-6">
          <summary className="cursor-pointer list-none text-center text-sm font-medium text-ink-500 hover:text-ink-700">
            <span className="underline underline-offset-4 group-open:hidden">
              See the topic breakdown
            </span>
            <span className="hidden underline underline-offset-4 group-open:inline">Hide</span>
          </summary>

          <ul className="mt-4 space-y-2">
            {plan.map(({ topic, total, count }) => (
              <li key={topic} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-ink-700">{topic}</span>
                <span className="flex-none tabular-nums">
                  <strong className="font-bold text-ink-900">{count}</strong>
                  <span className="text-ink-500"> / {total}</span>
                </span>
              </li>
            ))}
          </ul>

          {plan.some((t) => t.count === 0) && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              At this length some topics get no questions at all.
            </p>
          )}
        </details>

        {RESULTS_UNLOCKED && !isPaid && (
          <p className="mt-8 text-center text-sm text-amber-700">
            Dev mode: your real score is shown after submitting.
          </p>
        )}

        {!isPaid && !RESULTS_UNLOCKED && (
          <p className="mt-8 text-center text-sm leading-relaxed text-ink-500">
            {isAnonymous ? (
              <>
                The free sitting shows no score —{' '}
                <Link
                  to="/checkout"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  full access
                </Link>{' '}
                unlocks results, explanations and retakes.
              </>
            ) : (
              <>
                This uses your free attempt ({attemptsRemaining} of {FREE_ATTEMPT_LIMIT} left) and
                shows no score —{' '}
                <Link
                  to="/checkout"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  full access
                </Link>{' '}
                unlocks results, explanations and retakes.
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------ Exam screen ------------------------------ */

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Status bar */}
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="min-w-[12rem] flex-1">
          <ProgressBar value={answeredCount} max={examQuestions.length} label="Exam progress" />
        </div>
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
        total={examQuestions.length}
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

        {current === examQuestions.length - 1 ? (
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
          questions={examQuestions}
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
                {answeredCount} of {examQuestions.length}
              </strong>{' '}
              questions.
              {answeredCount < examQuestions.length && (
                <> Unanswered questions are marked incorrect.</>
              )}
            </p>

            {flagged.size > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                You still have {flagged.size} question{flagged.size === 1 ? '' : 's'} flagged for
                review.
              </p>
            )}

            {!isPaid && !RESULTS_UNLOCKED && (
              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-ink-700">
                {isAnonymous
                  ? "This is the free sitting — you'll get a confirmation, not a score."
                  : "This uses your free attempt. You'll get a confirmation, not a score."}
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
                onClick={submit}
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
