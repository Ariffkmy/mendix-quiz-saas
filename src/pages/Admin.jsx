import { useEffect, useMemo, useState } from 'react';

import Spinner from '../components/Spinner.jsx';
import { PASS_THRESHOLD } from '../data/questions';
import { formatDuration } from '../lib/scoring';
import { supabase } from '../lib/supabase';

/**
 * Admin view: who has signed up and how they are doing.
 *
 * There is no revenue to report — the product is free — so this reads
 * user_profiles and quiz_attempts, both of which admins can select across all
 * rows via the "admins can read all" policies.
 */

function Stat({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export default function Admin() {
  const [profiles, setProfiles] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all'); // all | active | dormant

  useEffect(() => {
    let active = true;

    (async () => {
      const [profileRes, attemptRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, email, attempts_used, created_at')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('quiz_attempts')
          .select('id, email, score, passed, correct_count, total_count, duration_seconds, submitted_at')
          .order('submitted_at', { ascending: false })
          .limit(1000),
      ]);

      if (!active) return;

      if (profileRes.error || attemptRes.error) {
        setError(profileRes.error?.message || attemptRes.error?.message);
      } else {
        setProfiles(profileRes.data ?? []);
        setAttempts(attemptRes.data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  /** Best attempt per email, so each account shows one pass/fail verdict. */
  const bestByEmail = useMemo(() => {
    const map = new Map();
    for (const a of attempts) {
      const key = a.email?.toLowerCase();
      if (!key) continue;
      const existing = map.get(key);
      if (!existing || (a.score ?? 0) > (existing.score ?? 0)) map.set(key, a);
    }
    return map;
  }, [attempts]);

  const latestByEmail = useMemo(() => {
    // `attempts` arrives newest first, so the first hit per email is the latest.
    const map = new Map();
    for (const a of attempts) {
      const key = a.email?.toLowerCase();
      if (key && !map.has(key)) map.set(key, a);
    }
    return map;
  }, [attempts]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return profiles
      .filter((p) => {
        if (activityFilter === 'active') return (p.attempts_used ?? 0) > 0;
        if (activityFilter === 'dormant') return (p.attempts_used ?? 0) === 0;
        return true;
      })
      .filter((p) => (needle ? p.email?.toLowerCase().includes(needle) : true))
      .map((p) => {
        const key = p.email?.toLowerCase();
        return {
          ...p,
          best: bestByEmail.get(key) ?? null,
          latest: latestByEmail.get(key) ?? null,
        };
      });
  }, [profiles, activityFilter, query, bestByEmail, latestByEmail]);

  const stats = useMemo(() => {
    const withAttempt = profiles.filter((p) => (p.attempts_used ?? 0) > 0).length;
    const passed = [...bestByEmail.values()].filter((a) => a.passed).length;
    const scored = [...bestByEmail.values()];
    const avgBest =
      scored.length === 0
        ? '—'
        : `${Math.round(scored.reduce((sum, a) => sum + (a.score ?? 0), 0) / scored.length)}%`;

    return {
      accounts: profiles.length,
      withAttempt,
      activationRate:
        profiles.length === 0 ? '—' : `${Math.round((withAttempt / profiles.length) * 100)}%`,
      attemptCount: attempts.length,
      passed,
      passRate: bestByEmail.size === 0 ? '—' : `${Math.round((passed / bestByEmail.size) * 100)}%`,
      avgBest,
    };
  }, [profiles, attempts, bestByEmail]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Admin dashboard</h1>
      <p className="mt-3 text-ink-500">
        Every account, and how each one is performing on their best attempt.
      </p>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Accounts"
          value={stats.accounts}
          hint={`${stats.withAttempt} have sat the exam`}
        />
        <Stat
          label="Activation"
          value={stats.activationRate}
          hint={`${stats.attemptCount} attempts total`}
        />
        <Stat
          label="Pass rate"
          value={stats.passRate}
          hint={`${stats.passed} passed at ${PASS_THRESHOLD}%+`}
        />
        <Stat label="Average best score" value={stats.avgBest} hint="Across accounts with an attempt" />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email…"
          aria-label="Search accounts by email"
          className="input max-w-xs"
        />
        <div className="flex rounded-lg border border-slate-300 bg-white p-1">
          {[
            ['all', 'All'],
            ['active', 'Has attempted'],
            ['dormant', 'Never attempted'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivityFilter(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                activityFilter === key ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-ink-500">
          {rows.length} of {profiles.length} accounts
        </span>
      </div>

      {/* Accounts table */}
      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs tracking-wide text-ink-500 uppercase">
                <th className="px-5 py-3 font-semibold">Account</th>
                <th className="px-5 py-3 font-semibold">Registered</th>
                <th className="px-5 py-3 font-semibold">Attempts</th>
                <th className="px-5 py-3 font-semibold">Last sat</th>
                <th className="px-5 py-3 font-semibold">Best score</th>
                <th className="px-5 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                    No accounts match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{p.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{p.attempts_used ?? 0}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-500">
                      {p.latest ? new Date(p.latest.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {p.best ? (
                        <span className="font-semibold text-ink-900">
                          {p.best.score}%{' '}
                          <span className="font-normal text-ink-500">
                            ({p.best.correct_count}/{p.best.total_count})
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.best ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.best.passed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.best.passed ? 'Pass' : 'Fail'}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-500">Not attempted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent attempts */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink-900">Recent attempts</h2>
        <div className="card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs tracking-wide text-ink-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Result</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-ink-500">
                      No exam attempts yet.
                    </td>
                  </tr>
                ) : (
                  attempts.slice(0, 25).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-ink-900">{a.email}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-ink-500">
                        {new Date(a.submitted_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-ink-900">{a.score}%</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {a.passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-500">
                        {formatDuration(a.duration_seconds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
