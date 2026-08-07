/**
 * Question jump-grid. Answered questions are filled in, so a candidate can see
 * at a glance what is left before submitting.
 */
export default function QuestionNav({ questions, answers, current, onJump, flagged = new Set() }) {
  return (
    <nav aria-label="Question navigator" className="grid grid-cols-8 gap-2 sm:grid-cols-10">
      {questions.map((q, i) => {
        const answered = Boolean(answers[q.id]);
        const isCurrent = i === current;
        const isFlagged = flagged.has(q.id);

        let tone = 'border-slate-200 bg-white text-ink-500 hover:border-brand-300';
        if (answered) tone = 'border-brand-200 bg-brand-100 text-brand-800 hover:border-brand-400';
        if (isCurrent) tone = 'border-brand-600 bg-brand-600 text-white';

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Question ${i + 1}${answered ? ', answered' : ', not answered'}${
              isFlagged ? ', flagged for review' : ''
            }`}
            aria-current={isCurrent ? 'true' : undefined}
            className={`relative flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition ${tone}`}
          >
            {i + 1}
            {isFlagged && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
