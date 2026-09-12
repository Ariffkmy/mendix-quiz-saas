import { LETTERS } from '../data/questions';

/**
 * A single exam question with its four options.
 *
 * In `review` mode the correct answer and explanation are shown and the options
 * become read-only — the same component backs both the exam and the results
 * review, so an answer always looks the way it did during the exam.
 */
export default function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
  review = false,
}) {
  const isCorrect = selected === question.answer;

  return (
    <article className="card p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {question.topic}
        </span>
        <span className="text-xs font-medium text-ink-500">
          Question {index + 1} of {total}
        </span>
        {review && (
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
              isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isCorrect ? 'Correct' : selected ? 'Incorrect' : 'Not answered'}
          </span>
        )}
      </header>

      <h2 className="text-lg leading-relaxed font-semibold text-balance text-ink-900 sm:text-xl">
        {question.question}
      </h2>

      <div className="mt-6 space-y-3" role={review ? 'list' : 'radiogroup'}>
        {question.options.map((option, i) => {
          const letter = LETTERS[i];
          const isSelected = selected === letter;
          const isAnswer = question.answer === letter;

          let tone = 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40';
          if (review && isAnswer) tone = 'border-emerald-400 bg-emerald-50';
          else if (review && isSelected) tone = 'border-rose-400 bg-rose-50';
          else if (!review && isSelected) tone = 'border-brand-500 bg-brand-50 ring-2 ring-brand-200';

          let badgeTone = 'border-slate-300 text-ink-500';
          if (review && isAnswer) badgeTone = 'border-emerald-500 bg-emerald-500 text-white';
          else if (review && isSelected) badgeTone = 'border-rose-500 bg-rose-500 text-white';
          else if (!review && isSelected) badgeTone = 'border-brand-600 bg-brand-600 text-white';

          const content = (
            <>
              <span
                className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-bold ${badgeTone}`}
              >
                {letter}
              </span>
              <span className="text-base leading-relaxed text-ink-900">{option}</span>
            </>
          );

          if (review) {
            return (
              <div
                key={letter}
                role="listitem"
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${tone}`}
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={letter}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(letter)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${tone}`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* The answer and explanation come from question_keys; if they were not
          loaded, `question.answer` is null and this block does not render. */}
      {review && question.answer && (
        <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">
            Correct answer: {question.answer}
          </p>
          {question.src && (
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{question.src}</p>
          )}
          {question.tip && (
            <p className="mt-3 border-t border-brand-100 pt-3 text-sm leading-relaxed text-brand-800">
              <span className="font-semibold">Tip:</span> {question.tip}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
