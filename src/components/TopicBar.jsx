import { PASS_THRESHOLD } from '../data/questions';

/**
 * One module's score as a labelled bar. Shared by the results page (a single
 * attempt) and the dashboard (aggregated across every attempt), so the same
 * percentage always reads the same colour.
 */
export default function TopicBar({ topic, correct, total, percentage, meta = null }) {
  const pct = percentage ?? (total > 0 ? Math.round((correct / total) * 100) : 0);

  const tone =
    pct >= PASS_THRESHOLD ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="py-3.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-ink-900">{topic}</span>
        <span className="text-sm whitespace-nowrap text-ink-500">
          {correct}/{total} · <strong className="text-ink-900">{pct}%</strong>
          {meta && <span className="ml-2 text-xs">{meta}</span>}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${tone} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
