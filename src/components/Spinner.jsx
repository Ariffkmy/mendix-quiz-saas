export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
      {label && <span className="text-sm text-ink-500">{label}</span>}
    </div>
  );
}
