import { useEffect, useState } from 'react';

import { formatDuration } from '../lib/scoring';

/**
 * The exam clock.
 *
 * With a `deadline` (epoch ms) it counts down and calls `onExpire` once. With
 * `deadline` null the run is untimed, so it counts up from `startedAt` instead
 * — an untimed practice run still benefits from knowing how long it took, and a
 * blank space where the clock was reads like something is broken.
 *
 * The deadline is absolute rather than a tick-accumulated remainder, so a
 * backgrounded tab or a page refresh cannot buy the candidate extra time.
 */
export default function Timer({ deadline = null, startedAt = null, onExpire }) {
  const untimed = deadline == null;
  const measure = () =>
    untimed ? Math.max(0, Date.now() - (startedAt ?? Date.now())) : Math.max(0, deadline - Date.now());

  const [remaining, setRemaining] = useState(measure);

  useEffect(() => {
    setRemaining(measure());

    const id = setInterval(() => setRemaining(measure()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, startedAt, untimed]);

  const expired = !untimed && remaining <= 0;

  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);

  const seconds = Math.round(remaining / 1000);
  // Only a countdown has anything to warn about.
  const critical = !untimed && seconds <= 60;
  const warning = !untimed && seconds <= 300;

  const tone = critical
    ? 'bg-rose-50 text-rose-700 ring-rose-200'
    : warning
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-slate-100 text-ink-700 ring-slate-200';

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm font-semibold ring-1 ${tone}`}
      role="timer"
      aria-live={warning ? 'polite' : 'off'}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M10 7.5V11l2.5 1.5M7.5 2.5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {formatDuration(seconds)}
      <span className="sr-only">{untimed ? 'elapsed' : 'remaining'}</span>
    </div>
  );
}
