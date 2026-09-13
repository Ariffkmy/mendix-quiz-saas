import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ProgressBar from '../components/ProgressBar.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import Spinner from '../components/Spinner.jsx';
import TopicBar from '../components/TopicBar.jsx';
import { PASS_THRESHOLD } from '../data/questions';
import { burstConfetti } from '../lib/confetti';
import { LETTERS } from '../lib/parseQuestions';
import { gradeAttempt } from '../lib/scoring';
import {
  fetchAnswerKeys,
  fetchLevels,
  fetchQuestions,
  withAnswerKeys,
} from '../lib/questionBank';
import { isSupabaseConfigured } from '../lib/supabase';

/** Fisher–Yates. A fresh order every run keeps repeat practice from going stale. */
function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Quick quiz — the practice counterpart to the timed exam.
 *
 * The exam withholds the answer until the end on purpose. That is the wrong
 * shape for practice: here every question gives its verdict and explanation the
 * moment it is answered, and there is no paper length or clock — the candidate
 * works through a shuffled bank and stops whenever they like. Whatever they
 * answered up to that point is what the summary reports.
 *
 * Nothing here is submitted or recorded: it is deliberately kept out of
 * quiz_attempts so practice runs never distort exam analytics.
 */
export default function QuickQuiz() {
  const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState(null);
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // `started` = mid-session, `finished` = showing the summary.
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = queue[index];
  const answeredCurrent = question ? Boolean(answers[question.id]) : false;

  // Only the questions actually answered count towards the summary — the whole
  // bank is not the denominator here the way it is in an exam.
  const answeredQuestions = useMemo(
    () => bank.filter((q) => answers[q.id]),
    [bank, answers]
  );

  const liveCorrect = useMemo(
    () => answeredQuestions.filter((q) => answers[q.id] === q.answer).length,
    [answeredQuestions, answers]
  );
  const liveIncorrect = answeredQuestions.length - liveCorrect;

  // Current run of correct answers, counting back from the question on screen.
  const streak = useMemo(() => {
    let run = 0;
    for (let i = index; i >= 0; i -= 1) {
      const q = queue[i];
      if (q && answers[q.id] === q.answer) run += 1;
      else break;
    }
    return run;
  }, [queue, answers, index]);

  const summary = useMemo(
    () => (finished ? gradeAttempt(answers, answeredQuestions) : null),
    [finished, answers, answeredQuestions]
  );

  // Which levels actually have content, defaulting to the hardest available —
  // same policy as the exam so the two feel like one product.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    fetchLevels()
      .then((rows) => {
        if (!active) return;
        setLevels(rows);
        setLevel((prev) => prev ?? rows[rows.length - 1]?.level ?? null);
        if (!rows.length) setError('The question bank is empty. Run the seed script.');
      })
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, []);

  // Load the chosen level's bank, keys merged in so feedback is instant and
  // client-side (no round-trip per question).
  useEffect(() => {
    if (!isSupabaseConfigured || !level) return undefined;

    let active = true;
    setLoading(true);

    Promise.all([fetchQuestions(level), fetchAnswerKeys()])
      .then(([questions, keys]) => {
        if (!active) return;
        setBank(withAnswerKeys(questions, keys));
        if (!questions.length) setError('No questions for this level yet.');
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [level]);

  const start = useCallback(() => {
    setQueue(shuffle(bank));
    setIndex(0);
    setAnswers({});
    setFinished(false);
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bank]);

  const selectAnswer = (letter) => {
    if (!question || answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: letter }));
    // A little celebration the instant a right answer lands.
    if (letter === question.answer) burstConfetti();
  };

  const finish = useCallback(() => {
    setStarted(false);
    setFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const nextQuestion = useCallback(() => {
    if (index + 1 >= queue.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index, queue.length, finish]);

  // Keyboard: 1–4 / A–D to answer, Enter or → for the next question.
  useEffect(() => {
    if (!started || finished || !question) return undefined;

    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (answeredCurrent && (e.key === 'Enter' || e.key === 'ArrowRight')) {
        nextQuestion();
        return;
      }
      if (answeredCurrent) return;

      const byNumber = ['1', '2', '3', '4'].indexOf(e.key);
      const byLetter = LETTERS.indexOf(e.key.toUpperCase());
      const i = byNumber >= 0 ? byNumber : byLetter;
      if (i >= 0 && i < (question.options?.length ?? 0)) selectAnswer(LETTERS[i]);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, question, answeredCurrent, nextQuestion]);

  /* ------------------------------ Loading ------------------------------ */

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading the question bank…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">Quick quiz could not be loaded</h1>
        <p className="mt-3 text-ink-500">{error}</p>
        <Link to="/dashboard" className="btn-primary mt-7">
          Back to dashboard
        </Link>
      </div>
    );
  }

  /* ----------------------------- Summary ------------------------------ */

  if (finished && summary) {
    const accuracy = summary.total === 0 ? 0 : summary.score;

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Quick quiz results</h1>
        <p className="mt-2 text-ink-500">
          {summary.total === 0
            ? 'You stopped before answering anything.'
            : `You answered ${summary.total} question${summary.total === 1 ? '' : 's'} — here's how it went.`}
        </p>

        {summary.total > 0 && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Answered', summary.total, null],
                ['Correct', liveCorrect, 'text-emerald-600'],
                ['Incorrect', liveIncorrect, 'text-rose-600'],
                [
                  'Accuracy',
                  `${accuracy}%`,
                  accuracy >= PASS_THRESHOLD
                    ? 'text-emerald-600'
                    : accuracy >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600',
                ],
              ].map(([label, value, tone]) => (
                <div key={label} className="card p-5">
                  <p className="text-sm text-ink-500">{label}</p>
                  <p className={`mt-1 text-3xl font-bold tracking-tight ${tone ?? 'text-ink-900'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <section className="card mt-6 p-6 sm:p-7">
              <h2 className="text-lg font-bold text-ink-900">By module</h2>
              <p className="mt-1 text-sm text-ink-500">Weakest module first, from this session.</p>
              <div className="mt-3 divide-y divide-slate-100">
                {summary.topicBreakdown.map((entry) => (
                  <TopicBar
                    key={entry.topic}
                    topic={entry.topic}
                    correct={entry.correct}
                    total={entry.total}
                    percentage={entry.percentage}
                  />
                ))}
              </div>
            </section>

            <section className="card mt-6 p-6 sm:p-7">
              <h2 className="text-lg font-bold text-ink-900">Questions you missed</h2>
              {summary.missed.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">
                  Nothing missed — a clean sweep. Try another round and see if you can repeat it.
                </p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {summary.missed.map((r) => (
                    <li key={r.question.id} className="rounded-xl border border-slate-200 p-4">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                        {r.question.topic}
                      </span>
                      <p className="mt-2.5 font-medium text-ink-900">{r.question.question}</p>
                      <p className="mt-2 text-sm text-rose-600">
                        Your answer: {r.givenText ?? '— skipped —'}
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        Correct answer: {r.correctText}
                      </p>
                      {r.question.src && (
                        <p className="mt-2 border-t border-slate-100 pt-2 text-sm leading-relaxed text-ink-700">
                          {r.question.src}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={start} className="btn-primary px-6 py-3 text-base">
            Play again
          </button>
          <Link to="/dashboard" className="btn-secondary px-6 py-3 text-base">
            Back to dashboard
          </Link>
          <Link to="/study" className="btn-ghost px-6 py-3 text-base">
            Open study guides
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ Setup ------------------------------- */

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Quick quiz</h1>
        <p className="mt-3 text-ink-500">
          Practice at your own pace. Answer a question and you'll see straight away whether you got
          it right, plus the explanation — then move on. There's no time limit and no set length:
          stop whenever you like and you'll get a summary of what you answered.
        </p>

        <div className="card mt-8 p-6">
          <h2 className="font-semibold text-ink-900">How it works</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
            {[
              'One question at a time, in a fresh random order each session.',
              'Feedback is instant — correct answer and explanation appear the moment you answer.',
              'No timer and no fixed number of questions. Keep going as long as you like.',
              'Hit "Finish" any time to see your results for the questions you answered.',
              'Keyboard shortcuts: 1–4 or A–D to answer, Enter or → for the next question.',
              'Practice runs are not recorded, so your exam analytics stay clean.',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {levels.length > 0 && (
          <div className="card mt-6 p-6">
            <h2 className="font-semibold text-ink-900">Certification level</h2>
            <p className="mt-1 text-sm text-ink-500">
              {bank.length} question{bank.length === 1 ? '' : 's'} in the bank
              {levels.length > 1 ? ' — pick a blueprint to practise.' : '.'}
            </p>

            {levels.length > 1 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {levels.map((lvl) => {
                  const active = level === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setLevel(lvl.level)}
                      aria-pressed={active}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        active
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          active ? 'text-brand-800' : 'text-ink-900'
                        }`}
                      >
                        {lvl.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-500">
                        {lvl.questionCount} questions · {lvl.topicCount} modules
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium text-ink-700">
                {levels[0].label} · {levels[0].questionCount} questions
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={start}
          disabled={bank.length === 0}
          className="btn-primary mt-8 w-full py-3 text-base disabled:opacity-50"
        >
          Start quick quiz
        </button>
      </div>
    );
  }

  /* ------------------------------ Playing ----------------------------- */

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Status bar */}
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="min-w-[12rem] flex-1">
          <ProgressBar
            value={answeredQuestions.length}
            max={queue.length}
            label="Quick quiz progress"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-emerald-600">{liveCorrect} correct</span>
          <span className="text-ink-400">·</span>
          <span className="font-semibold text-rose-600">{liveIncorrect} wrong</span>
          {streak >= 3 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              🔥 {streak} in a row
            </span>
          )}
        </div>
        <button type="button" onClick={finish} className="btn-primary">
          Finish
        </button>
      </div>

      <QuestionCard
        question={question}
        index={index}
        total={queue.length}
        selected={answers[question.id] ?? null}
        onSelect={selectAnswer}
        review={answeredCurrent}
        progressLabel={`${answeredQuestions.length} answered`}
      />

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {answeredCurrent ? (
          <button type="button" onClick={nextQuestion} className="btn-primary ml-auto">
            {index + 1 >= queue.length ? 'See results →' : 'Next question →'}
          </button>
        ) : (
          <p className="ml-auto text-sm text-ink-500">
            Pick an answer to reveal the explanation.
          </p>
        )}
      </div>
    </div>
  );
}
