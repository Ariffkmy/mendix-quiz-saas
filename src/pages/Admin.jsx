import { useEffect, useMemo, useState } from 'react';

import Spinner from '../components/Spinner.jsx';
import { PASS_THRESHOLD } from '../data/questions';
import { formatDuration } from '../lib/scoring';
import { supabase } from '../lib/supabase';

function Stat({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const tone =
    {
      paid: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      refunded: 'bg-slate-100 text-ink-700',
      failed: 'bg-rose-50 text-rose-700',
    }[status] ?? 'bg-slate-100 text-ink-700';

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone}`}>
      {status}
    </span>
  );
}

function money(amountTotal, currency) {
  if (amountTotal == null) return '—';
  // Stripe reports minor units for the currencies this app sells in.
  const value = amountTotal / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: (currency ?? 'usd').toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${(currency ?? '').toUpperCase()}`;
  }
}

export default function Admin() {
  const [purchases, setPurchases] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    (async () => {
      const [purchaseRes, attemptRes] = await Promise.all([
        supabase
          .from('purchases')
          .select('id, email, status, amount_total, currency, created_at, paid_at, stripe_session_id')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('quiz_attempts')
          .select('id, email, score, passed, correct_count, total_count, duration_seconds, submitted_at')
          .order('submitted_at', { ascending: false })
          .limit(1000),
      ]);

      if (!active) return;

      if (purchaseRes.error || attemptRes.error) {
        setError(purchaseRes.error?.message || attemptRes.error?.message);
      } else {
        setPurchases(purchaseRes.data ?? []);
        setAttempts(attemptRes.data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  /** Best attempt per email, so each customer shows one pass/fail verdict. */
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

  const attemptCountByEmail = useMemo(() => {
    const map = new Map();
    for (const a of attempts) {
      const key = a.email?.toLowerCase();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [attempts]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return purchases
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => (needle ? p.email?.toLowerCase().includes(needle) : true))
      .map((p) => {
        const key = p.email?.toLowerCase();
        return {
          ...p,
          best: bestByEmail.get(key) ?? null,
          attemptCount: attemptCountByEmail.get(key) ?? 0,
        };
      });
  }, [purchases, statusFilter, query, bestByEmail, attemptCountByEmail]);

  const stats = useMemo(() => {
    const paid = purchases.filter((p) => p.status === 'paid');
    const revenue = paid.reduce((sum, p) => sum + (p.amount_total ?? 0), 0);
    const currency = paid[0]?.currency ?? 'usd';
    const passed = [...bestByEmail.values()].filter((a) => a.passed).length;
    const withAttempt = bestByEmail.size;

    return {
      paidCount: paid.length,
      pendingCount: purchases.filter((p) => p.status === 'pending').length,
      revenue: money(revenue, currency),
      attemptCount: attempts.length,
      passed,
      passRate: withAttempt === 0 ? '—' : `${Math.round((passed / withAttempt) * 100)}%`,
      activationRate:
        paid.length === 0 ? '—' : `${Math.round((withAttempt / paid.length) * 100)}%`,
    };
  }, [purchases, attempts, bestByEmail]);

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
        Every purchase, and how each customer performed on their best attempt.
      </p>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Paid customers" value={stats.paidCount} hint={`${stats.pendingCount} pending`} />
        <Stat label="Revenue" value={stats.revenue} hint="Gross, before Stripe fees" />
        <Stat
          label="Pass rate"
          value={stats.passRate}
          hint={`${stats.passed} passed at ${PASS_THRESHOLD}%+`}
        />
        <Stat
          label="Activation"
          value={stats.activationRate}
          hint={`${stats.attemptCount} attempts total`}
        />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email…"
          aria-label="Search purchases by email"
          className="input max-w-xs"
        />
        <div className="flex rounded-lg border border-slate-300 bg-white p-1">
          {['all', 'paid', 'pending', 'refunded', 'failed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-ink-500">
          {rows.length} of {purchases.length} purchases
        </span>
      </div>

      {/* Purchases table */}
      <div className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs tracking-wide text-ink-500 uppercase">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Purchased</th>
                <th className="px-5 py-3 font-semibold">Attempts</th>
                <th className="px-5 py-3 font-semibold">Best score</th>
                <th className="px-5 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink-500">
                    No purchases match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-ink-900">{p.email}</span>
                      <span className="block font-mono text-xs text-ink-500">
                        {p.stripe_session_id?.slice(0, 20) ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-700">
                      {money(p.amount_total, p.currency)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-500">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString()
                        : new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{p.attemptCount}</td>
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
