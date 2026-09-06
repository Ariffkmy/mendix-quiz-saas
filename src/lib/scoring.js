import { LETTERS, PASS_THRESHOLD, QUESTIONS } from '../data/questions';

/**
 * The questions a sitting actually asked, recovered from its answer map.
 *
 * Every asked question is seeded into `answers` when the exam starts (unanswered
 * ones as null), so the keys are the sitting's question set. That is what makes
 * a short sitting gradeable without a schema change — and why grading must never
 * fall back to the whole bank, which would mark every un-asked question wrong.
 *
 * Attempts recorded before configurable length existed have no seeded keys; for
 * those the caller should fall back to the full bank.
 *
 * @returns {Array} the asked questions, in bank order
 */
export function questionsFromAnswers(answers, bank = QUESTIONS) {
  const asked = new Set(Object.keys(answers ?? {}));
  return asked.size === 0 ? [] : bank.filter((q) => asked.has(q.id));
}

/**
 * Grade an answer map ({ [questionId]: 'A' | 'B' | 'C' | 'D' }) against the bank.
 *
 * Unanswered questions count as incorrect, which matches how the real exam
 * scores a submission.
 *
 * Option counts vary by question type — true/false questions carry two — so the
 * letter is resolved against the question's own `letters`, never a fixed A-D.
 */
export function gradeAttempt(answers, questions = QUESTIONS) {
  const results = questions.map((q) => {
    const given = answers?.[q.id] ?? null;
    const letters = q.letters ?? LETTERS;
    const textFor = (letter) => {
      const index = letters.indexOf(letter);
      return index === -1 ? null : (q.options[index] ?? null);
    };

    return {
      question: q,
      given,
      correct: given === q.answer,
      answered: given !== null,
      givenText: given ? textFor(given) : null,
      correctText: textFor(q.answer),
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
