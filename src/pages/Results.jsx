import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import QuestionCard from '../components/QuestionCard.jsx';
import Spinner from '../components/Spinner.jsx';
import TopicBar from '../components/TopicBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PASS_THRESHOLD, QUESTIONS } from '../data/questions';
import { loadLastResult } from '../lib/attemptStorage';
import { formatDuration, gradeAttempt } from '../lib/scoring';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function ScoreRing({ score, passed }) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  const stroke = passed ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="relative h-40 w-40 flex-none">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          className={`${stroke} transition-[stroke-dashoffset] duration-1000 ease-out`}
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-ink-900">{score}%</span>
        <span className="text-xs font-medium text-ink-500">score</span>
      </div>
    </div>
  );
}

/**
 * Full results — paid tier only.
 *
 * Free accounts are bounced to their dashboard. That is a courtesy redirect, not
 * the enforcement: the select policy on quiz_attempts will not hand a score to a
 * free account, and Quiz.jsx never caches one locally for them either.
 */
export default function Results() {
  const { user, isPaid } = useAuth();
  const [record, setRecord] = useState(() => loadLastResult());
  const [loading, setLoading] = useState(!record);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('missed'); // missed | all

  // No local copy (different device, cleared storage) — fall back to Supabase.
  useEffect(() => {
    if (!isSupabaseConfigured || !user || !isPaid) {
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(
          'id, answers, score, correct_count, total_count, passed, topic_breakdown, duration_seconds, started_at, submitted_at, auto_submitted'
        )
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (!active) return;

      if (!error && data?.length) {
        setHistory(data);
        if (!record) {
          const latest = data[0];
          setRecord({
            answers: latest.answers ?? {},
            score: latest.score,
            correctCount: latest.correct_count,
            totalCount: latest.total_count,
            passed: latest.passed,
            topicBreakdown: latest.topic_breakdown ?? [],
            durationSeconds: latest.duration_seconds,
            startedAt: latest.started_at,
            submittedAt: latest.submitted_at,
            autoSubmitted: latest.auto_submitted,
          });
        }
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
    // `record` is intentionally excluded: this should run once per signed-in user,
    // not again after it populates the record it just fetched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPaid]);

  // Re-grade from the stored answers so the review always reflects the current
  // question bank, rather than trusting numbers written by an older client.
  const graded = useMemo(
    () => (record ? gradeAttempt(record.answers ?? {}) : null),
    [record]
  );

  // Free tier has no results to see — the dashboard is where their upgrade is.
  if (!isPaid) {
    return <Navigate to="/dashboard" replace state={{ upgradeRequired: '/results' }} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading your results…" />
      </div>
    );
  }

  if (!graded) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">No results yet</h1>
        <p className="mt-3 text-ink-500">
          You haven't completed an exam on this account yet. Take one and your score breakdown will
          appear here.
        </p>
        <Link to="/quiz" className="btn-primary mt-7">
          Start the exam
        </Link>
      </div>
    );
  }

  const reviewed = view === 'missed' ? graded.missed : graded.results;
  const strongest = [...graded.topicBreakdown].reverse()[0];
  const weakest = graded.topicBreakdown[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Verdict */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          <ScoreRing score={graded.score} passed={graded.passed} />

          <div className="flex-1 text-center sm:text-left">
            <span
              className={`inline-flex rounded-full px-3.5 py-1 text-sm font-bold ${
                graded.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {graded.passed ? 'PASS' : 'NOT YET'}
            </span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
              {graded.passed
                ? "You're tracking well for the real exam"
                : `You need ${PASS_THRESHOLD}% to pass`}
            </h1>

            <p className="mt-2 text-ink-500">
              {graded.correctCount} of {graded.total} correct
              {record.durationSeconds != null && (
                <> · finished in {formatDuration(record.durationSeconds)}</>
              )}
              {record.autoSubmitted && <> · auto-submitted when time expired</>}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link to="/quiz" className="btn-primary">
                Retake the exam
              </Link>
              <Link to="/study" className="btn-secondary">
                Study the material
              </Link>
              <Link to="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {(weakest || strongest) && (
          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            {strongest && (
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold tracking-wide text-emerald-700 uppercase">
                  Strongest module
                </p>
                <p className="mt-1.5 font-semibold text-ink-900">{strongest.topic}</p>
                <p className="text-sm text-ink-500">
                  {strongest.correct}/{strongest.total} correct
                </p>
              </div>
            )}
            {weakest && (
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-bold tracking-wide text-rose-700 uppercase">
                  Focus here next
                </p>
                <p className="mt-1.5 font-semibold text-ink-900">{weakest.topic}</p>
                <p className="text-sm text-ink-500">
                  {weakest.correct}/{weakest.total} correct
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topic breakdown */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink-900">Topic breakdown</h2>
        <p className="mt-1 text-sm text-ink-500">Weakest modules first — revise from the top down.</p>

        <div className="mt-4 divide-y divide-slate-100">
          {graded.topicBreakdown.map((entry) => (
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

      {/* Review */}
      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Question review</h2>
            <p className="mt-1 text-sm text-ink-500">
              {graded.missed.length === 0
                ? 'A clean sweep — every question correct.'
                : `${graded.missed.length} question${graded.missed.length === 1 ? '' : 's'} to learn from.`}
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-300 bg-white p-1">
            {[
              ['missed', `Missed (${graded.missed.length})`],
              ['all', `All (${graded.total})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                  view === key ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {reviewed.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-2xl">🎯</p>
            <p className="mt-3 font-semibold text-ink-900">Nothing missed</p>
            <p className="mt-1 text-sm text-ink-500">
              Switch to “All” to reread the explanations anyway.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviewed.map((r) => (
              <QuestionCard
                key={r.question.id}
                question={r.question}
                index={QUESTIONS.findIndex((q) => q.id === r.question.id)}
                total={graded.total}
                selected={r.given}
                review
              />
            ))}
          </div>
        )}
      </section>

      {/* Attempt history */}
      {history.length > 1 && (
        <section className="card mt-8 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink-900">Your attempts</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-ink-500 uppercase">
                  <th className="py-2.5 pr-4 font-semibold">Date</th>
                  <th className="py-2.5 pr-4 font-semibold">Score</th>
                  <th className="py-2.5 pr-4 font-semibold">Result</th>
                  <th className="py-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2.5 pr-4 whitespace-nowrap text-ink-700">
                      {new Date(h.submitted_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-ink-900">{h.score}%</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          h.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {h.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-500">{formatDuration(h.duration_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
