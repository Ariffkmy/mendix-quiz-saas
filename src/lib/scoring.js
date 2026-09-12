import { LETTERS, PASS_THRESHOLD } from '../data/questions';

/**
 * Grade an answer map against a question list, for display only.
 *
 * The authoritative grading happens in Postgres — public.submit_attempt() scores
 * the paper against question_keys and writes the result. This function exists so
 * the results page can rebuild the per-question review — which option was
 * picked, which was right, what the explanation says — without asking the server
 * to grade the same paper twice.
 *
 * `questions` must therefore carry `answer` — pass the output of
 * withAnswerKeys(). Questions with a null answer are not gradeable and are left
 * out of the totals rather than counted wrong.
 *
 * Unanswered-but-gradeable questions count as incorrect, matching how the real
 * exam scores a submission.
 */
export function gradeAttempt(answers, questions = []) {
  const gradeable = questions.filter((q) => q.answer != null);

  const results = gradeable.map((q) => {
    const given = answers?.[q.id] ?? null;
    return {
      question: q,
      given,
      correct: given === q.answer,
      answered: given !== null,
      givenText: given ? q.options[LETTERS.indexOf(given)] : null,
      correctText: q.options[LETTERS.indexOf(q.answer)],
    };
  });

  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return {
    results,
    total,
    correctCount,
    answeredCount: results.filter((r) => r.answered).length,
    missed: results.filter((r) => !r.correct),
    score,
    passed: score >= PASS_THRESHOLD,
    topicBreakdown: buildTopicBreakdown(results),
  };
}

/** Per-topic correct/total/percentage, sorted weakest first. */
function buildTopicBreakdown(results) {
  const byTopic = new Map();

  for (const r of results) {
    const entry = byTopic.get(r.question.topic) ?? { topic: r.question.topic, correct: 0, total: 0 };
    entry.total += 1;
    if (r.correct) entry.correct += 1;
    byTopic.set(r.question.topic, entry);
  }

  return [...byTopic.values()]
    .map((e) => ({ ...e, percentage: Math.round((e.correct / e.total) * 100) }))
    .sort((a, b) => a.percentage - b.percentage || a.topic.localeCompare(b.topic));
}

/** Format seconds as m:ss (or h:mm:ss past an hour). */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds ?? 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
