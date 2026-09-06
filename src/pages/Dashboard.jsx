import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Spinner from '../components/Spinner.jsx';
import TopicBar from '../components/TopicBar.jsx';
import { FREE_ATTEMPT_LIMIT, PAID_ONLY_FEATURES, PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, PASS_THRESHOLD, QUESTIONS, TOPICS } from '../data/questions';
import { syncAttemptCount } from '../lib/attemptStorage';
import { formatDuration } from '../lib/scoring';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/* --------------------------------------------------------- small pieces --- */

function TierBadge({ tier }) {
  const paid = tier === 'paid';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
        paid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-ink-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${paid ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {paid ? 'Full access' : 'Free tier'}
    </span>
  );
}

function StatCard({ label, value, hint, tone = 'default' }) {
  const valueTone = {
    default: 'text-ink-900',
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-rose-600',
  }[tone];

  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

/** Score-over-time sparkline, oldest attempt on the left. */
function ScoreTrend({ scores }) {
  if (scores.length < 2) return null;

  const width = 100;
  const height = 32;
  const step = width / (scores.length - 1);
  const points = scores
    .map((score, i) => `${(i * step).toFixed(2)},${(height - (score / 100) * height).toFixed(2)}`)
    .join(' ');

  const passY = (height - (PASS_THRESHOLD / 100) * height).toFixed(2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="mt-4 h-16 w-full"
      role="img"
      aria-label={`Score trend across ${scores.length} attempts, most recent ${scores[scores.length - 1]}%`}
    >
      <line
        x1="0"
        x2={width}
        y1={passY}
        y2={passY}
        stroke="currentColor"
        className="text-slate-300"
        strokeWidth="0.5"
        strokeDasharray="2 2"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        className="text-brand-600"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ----------------------------------------------------------- free view --- */

function FreeDashboard({ attemptsRemaining, attemptsUsed }) {
  const canStart = attemptsRemaining > 0;

  return (
    <>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Attempt state */}
        <div className="card p-6 sm:p-8">
          {canStart ? (
            <>
              <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
                Ready when you are
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
                You have {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
              </h2>
              <p className="mt-3 leading-relaxed text-ink-500">
                Choose an Intermediate or Advanced practice bank from {QUESTIONS.length} questions.
                The free tier includes one sitting, and submitting uses it up.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/quiz" className="btn-primary px-6 py-3 text-base">
                  Start exam
                </Link>
                <Link to="/checkout" className="btn-secondary px-6 py-3 text-base">
                  Get unlimited attempts
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold tracking-wide text-amber-700 uppercase">
                Free attempt used
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
                Your exam is submitted and on record
              </h2>
              <p className="mt-3 leading-relaxed text-ink-500">
                It's scored and stored against your account — the free tier just doesn't show you the
                result. Unlock full access to see how you did, review every question you missed, and
                retake as often as you like.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/checkout" className="btn-primary px-6 py-3 text-base">
                  Unlock my results · {PRODUCT.priceLabel}
                </Link>
              </div>
            </>
          )}

          <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
            {[
              ['Attempts used', `${attemptsUsed} of ${FREE_ATTEMPT_LIMIT}`],
              ['Questions', QUESTIONS.length],
              ['Time limit', `${EXAM_MINUTES} min`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs tracking-wide text-ink-500 uppercase">{label}</dt>
                <dd className="mt-1 text-lg font-bold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Upgrade card */}
        <div className="card overflow-hidden">
          <div className="bg-brand-600 px-6 py-3 text-center text-xs font-bold tracking-[0.2em] text-white uppercase">
            Full access
          </div>
          <div className="p-6 sm:p-7">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tighter text-ink-900">
                {PRODUCT.priceLabel}
              </span>
              <span className="mb-1.5 text-sm text-ink-500">once</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">{PRODUCT.currencyNote}</p>

            <ul className="mt-6 space-y-2.5 text-sm">
              {PAID_ONLY_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-ink-700">
                  <span className="mt-0.5 flex-none font-bold text-emerald-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link to="/checkout" className="btn-primary mt-7 w-full py-3">
              Upgrade now
            </Link>
          </div>
        </div>
      </div>

      {/* Locked analytics teaser */}
      <section className="card mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Your analytics</h2>
            <p className="mt-1 text-sm text-ink-500">
              Scores, pass rate and module-by-module performance land here the moment you upgrade.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-500">
            🔒 Locked
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
          {['Total attempts', 'Average score', 'Best score', 'Pass rate'].map((label) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-ink-500">{label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-300 select-none">
                ••
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3" aria-hidden="true">
          {TOPICS.slice(0, 4).map((topic, i) => (
            <div key={topic}>
              <p className="mb-1.5 text-sm font-medium text-slate-400">{topic}</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-200"
                  style={{ width: `${70 - i * 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------- paid view --- */

function PaidDashboard({ attempts, error }) {
  const stats = useMemo(() => {
    if (attempts.length === 0) return null;

    const scores = attempts.map((a) => a.score ?? 0);
    const passed = attempts.filter((a) => a.passed).length;

    return {
      total: attempts.length,
      average: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      best: Math.max(...scores),
      passRate: Math.round((passed / attempts.length) * 100),
      passed,
      // `attempts` arrives newest-first; the trend reads left to right in time.
      trend: [...scores].reverse(),
      latest: attempts[0],
    };
  }, [attempts]);

  /** Correct/total per module, summed across every attempt. */
  const topicPerformance = useMemo(() => {
    const byTopic = new Map();

    for (const attempt of attempts) {
      for (const entry of attempt.topic_breakdown ?? []) {
        if (!entry?.topic) continue;
        const acc = byTopic.get(entry.topic) ?? { topic: entry.topic, correct: 0, total: 0 };
        acc.correct += entry.correct ?? 0;
        acc.total += entry.total ?? 0;
        byTopic.set(entry.topic, acc);
      }
    }

    return [...byTopic.values()]
      .filter((e) => e.total > 0)
      .map((e) => ({ ...e, percentage: Math.round((e.correct / e.total) * 100) }))
      .sort((a, b) => a.percentage - b.percentage || a.topic.localeCompare(b.topic));
  }, [attempts]);

  const tone = (pct) => (pct >= PASS_THRESHOLD ? 'good' : pct >= 50 ? 'warn' : 'bad');

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Primary CTA */}
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            {stats ? 'Sit another exam' : 'Ready for your first exam?'}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {stats
              ? `Unlimited attempts — you've completed ${stats.total}. Every run is scored and tracked below.`
              : `${QUESTIONS.length} questions across Intermediate and Advanced banks, ${PASS_THRESHOLD}% to pass.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/quiz" className="btn-primary px-6 py-3 text-base">
            Start new exam
          </Link>
          {stats && (
            <Link to="/results" className="btn-secondary px-6 py-3 text-base">
              Latest results
            </Link>
          )}
        </div>
      </div>

      {!stats ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-3xl">📊</p>
          <p className="mt-4 font-semibold text-ink-900">No attempts yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Your analytics fill in as soon as you submit your first exam — score trend, pass rate and
            a breakdown of every module.
          </p>
          <Link to="/quiz" className="btn-primary mt-7">
            Start your first exam
          </Link>
        </div>
      ) : (
        <>
          {/* Headline numbers */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total attempts"
              value={stats.total}
              hint={`Last one ${new Date(stats.latest.submitted_at).toLocaleDateString()}`}
            />
            <StatCard
              label="Average score"
              value={`${stats.average}%`}
              hint={`Pass mark is ${PASS_THRESHOLD}%`}
              tone={tone(stats.average)}
            />
            <StatCard
              label="Best score"
              value={`${stats.best}%`}
              hint={stats.best >= PASS_THRESHOLD ? 'Above the pass mark' : 'Not there yet'}
              tone={tone(stats.best)}
            />
            <StatCard
              label="Pass rate"
              value={`${stats.passRate}%`}
              hint={`${stats.passed} of ${stats.total} attempts passed`}
              tone={tone(stats.passRate)}
            />
          </div>

          {/* Trend + module performance */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <section className="card p-6 sm:p-7">
              <h2 className="text-lg font-bold text-ink-900">Score trend</h2>
              <p className="mt-1 text-sm text-ink-500">
                Oldest attempt on the left. The dashed line is the {PASS_THRESHOLD}% pass mark.
              </p>
              <ScoreTrend scores={stats.trend} />
              <div className="mt-2 flex justify-between text-xs text-ink-500">
                <span>Attempt 1</span>
                <span>Attempt {stats.total}</span>
              </div>
              {stats.trend.length < 2 && (
                <p className="mt-4 text-sm text-ink-500">
                  One more attempt and the trend line appears here.
                </p>
              )}
            </section>

            <section className="card p-6 sm:p-7">
              <h2 className="text-lg font-bold text-ink-900">Performance by module</h2>
              <p className="mt-1 text-sm text-ink-500">
                Every question you've answered, pooled across attempts — weakest module first.
              </p>

              <div className="mt-3 divide-y divide-slate-100">
                {topicPerformance.map((entry) => (
                  <TopicBar
                    key={entry.topic}
                    topic={entry.topic}
                    correct={entry.correct}
                    total={entry.total}
                    percentage={entry.percentage}
                  />
                ))}
              </div>

              {topicPerformance[0] && (
                <div className="mt-6 rounded-xl bg-brand-50 p-4">
                  <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">
                    Revise this next
                  </p>
                  <p className="mt-1.5 font-semibold text-ink-900">{topicPerformance[0].topic}</p>
                  <Link
                    to="/study"
                    className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Open the study guide →
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Recent attempts */}
          <section className="card mt-6 p-6 sm:p-7">
            <h2 className="text-lg font-bold text-ink-900">Recent attempts</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-ink-500 uppercase">
                    <th className="py-2.5 pr-4 font-semibold">#</th>
                    <th className="py-2.5 pr-4 font-semibold">Date</th>
                    <th className="py-2.5 pr-4 font-semibold">Score</th>
                    <th className="py-2.5 pr-4 font-semibold">Correct</th>
                    <th className="py-2.5 pr-4 font-semibold">Result</th>
                    <th className="py-2.5 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.slice(0, 10).map((a, i) => (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-4 text-ink-500">
                        {a.attempt_number ?? stats.total - i}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-ink-700">
                        {new Date(a.submitted_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-ink-900">{a.score}%</td>
                      <td className="py-2.5 pr-4 text-ink-500">
                        {a.correct_count}/{a.total_count}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {a.passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-2.5 whitespace-nowrap text-ink-500">
                        {formatDuration(a.duration_seconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {attempts.length > 10 && (
              <p className="mt-4 text-xs text-ink-500">
                Showing your 10 most recent of {attempts.length} attempts.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}

/* --------------------------------------------------------------- page --- */

/**
 * The hub every signed-in user lands on.
 *
 * Free accounts see their remaining attempt and the upgrade path. Paid accounts
 * see the analytics — which is only possible for them at all because row-level
 * security refuses to return quiz_attempts rows to a free account.
 */
export default function Dashboard() {
  const { user, email, tier, isPaid, attemptsUsed, attemptsRemaining } = useAuth();
  const location = useLocation();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(isPaid);
  const [error, setError] = useState('');

  // Bumped here because the dashboard is where /quiz sends a free user after
  // submitting — keeps the local mirror level with the server's counter.
  useEffect(() => {
    if (user) syncAttemptCount(user.id, attemptsUsed);
  }, [user, attemptsUsed]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user || !isPaid) {
      setAttempts([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      const { data, error: fetchError } = await supabase
        .from('quiz_attempts')
        .select(
          'id, attempt_number, score, correct_count, total_count, passed, topic_breakdown, duration_seconds, submitted_at'
        )
        .order('submitted_at', { ascending: false })
        .limit(100);

      if (!active) return;

      if (fetchError) setError(fetchError.message);
      else setAttempts(data ?? []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, isPaid]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading your dashboard…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Redirected here from a paid-only route. */}
      {location.state?.upgradeRequired && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong className="font-semibold">That page needs full access.</strong> Scores and answer
          reviews are part of the paid tier — everything else on your account stays as it is.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900">Dashboard</h1>
            <TierBadge tier={tier} />
          </div>
          <p className="mt-2 text-ink-500">
            Signed in as <span className="font-medium text-ink-700">{email}</span>
          </p>
        </div>

        {isPaid ? (
          <Link to="/study" className="btn-secondary">
            Study guides
          </Link>
        ) : (
          <Link to="/checkout" className="btn-primary">
            Upgrade · {PRODUCT.priceLabel}
          </Link>
        )}
      </div>

      {isPaid ? (
        <PaidDashboard attempts={attempts} error={error} />
      ) : (
        <FreeDashboard attemptsRemaining={attemptsRemaining} attemptsUsed={attemptsUsed} />
      )}
    </div>
  );
}
