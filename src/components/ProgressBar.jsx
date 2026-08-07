export default function ProgressBar({ value, max, label }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label ?? 'Progress'}</span>
        <span className="font-semibold text-ink-900">
          {value}/{max} answered
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Exam progress'}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
