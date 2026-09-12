/**
 * Reads the exam content out of Supabase.
 *
 * Four tables back this:
 *
 *   topics         anyone, signed in or not  — module names and counts
 *   questions      any signed-in account     — stems and options, no answers
 *   question_keys  any signed-in account     — answers, explanations, tips
 *   topic_content  any signed-in account     — knowledge-base markdown
 *
 * `topics` stays anon-readable so the landing page can quote the module list and
 * question count before anyone signs in. Everything else needs a session, which
 * is why the answer key is not simply bundled into the client.
 */

import { requireSupabase, supabase } from './supabase';

/** Module list with question counts. Readable without a session. */
export async function fetchTopics() {
  const { data, error } = await requireSupabase()
    .from('topics')
    .select('slug, name, position, question_count')
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * The exam paper: every question in bank order, with no answer attached.
 *
 * Returns the shape the UI has always consumed — `{ id, topic, question,
 * options }` — with `topic` as the display name rather than the slug, so
 * QuestionCard and the topic breakdown keep working unchanged.
 */
export async function fetchQuestions() {
  const { data, error } = await requireSupabase()
    .from('questions')
    .select('id, position, question, options, topic_slug, topics ( name )')
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    topic: row.topics?.name ?? row.topic_slug,
    question: row.question,
    options: row.options ?? [],
  }));
}

/** Answer keys, as a map of question id -> { answer, explanation, tip }. */
export async function fetchAnswerKeys() {
  const { data, error } = await requireSupabase()
    .from('question_keys')
    .select('question_id, answer, explanation, tip');

  if (error) throw new Error(error.message);

  const keys = new Map();
  for (const row of data ?? []) {
    keys.set(row.question_id, {
      answer: row.answer,
      explanation: row.explanation ?? '',
      tip: row.tip ?? '',
    });
  }
  return keys;
}

/**
 * Merge keys into questions for the review UI, which needs `answer` and `src`
 * on the question object. A question with no key keeps `answer: null`, and
 * grading treats that as ungradeable rather than as wrong.
 */
export function withAnswerKeys(questions, keys) {
  return questions.map((q) => {
    const key = keys.get(q.id);
    return {
      ...q,
      answer: key?.answer ?? null,
      src: key?.explanation ?? '',
      tip: key?.tip ?? '',
    };
  });
}

/** Knowledge-base markdown for every module. */
export async function fetchTopicContent() {
  const { data, error } = await requireSupabase()
    .from('topic_content')
    .select('topic_slug, file, content');

  if (error) throw new Error(error.message);

  const bySlug = new Map();
  for (const row of data ?? []) bySlug.set(row.topic_slug, row);
  return bySlug;
}

/**
 * Submit an exam for server-side grading.
 *
 * The client sends answers and timing only — score, pass/fail and the topic
 * breakdown are computed in the database against question_keys, so a tampered
 * client cannot report a score it did not earn.
 *
 * @param {Record<string, string>} answers question id -> 'A' | 'B' | 'C' | 'D'
 */
export async function submitAttempt(answers, { startedAt, durationSeconds, autoSubmitted }) {
  const { data, error } = await requireSupabase().rpc('submit_attempt', {
    p_answers: answers ?? {},
    p_started_at: startedAt ?? null,
    p_duration_seconds: durationSeconds ?? null,
    p_auto_submitted: Boolean(autoSubmitted),
  });

  if (error) throw new Error(error.message);
  return data;
}

/** True when a bank query can even be attempted. */
export function canQueryBank() {
  return Boolean(supabase);
}
