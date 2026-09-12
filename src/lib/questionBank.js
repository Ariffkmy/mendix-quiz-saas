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

/**
 * Human labels for the certification levels.
 *
 * Mendix certifies at Intermediate and Advanced against different syllabuses,
 * so a level is a separate set of modules rather than a difficulty setting.
 */
export const LEVELS = {
  intermediate: { label: 'Intermediate', blurb: 'Mendix Intermediate Developer blueprint' },
  advanced: { label: 'Advanced', blurb: 'Mendix Advanced Developer blueprint' },
};

/** Level order, easiest first. */
export const LEVEL_ORDER = ['intermediate', 'advanced'];

/**
 * Module list with question counts. Readable without a session.
 * @param {string} [level] restrict to one certification level
 */
export async function fetchTopics(level) {
  let query = requireSupabase()
    .from('topics')
    .select('slug, name, level, position, question_count')
    .order('position', { ascending: true });

  if (level) query = query.eq('level', level);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Which levels actually have questions, in order.
 *
 * The selector is built from this rather than from LEVELS, so a level with no
 * content seeded yet simply does not appear — better than offering an exam that
 * turns out to be empty.
 *
 * @returns {Promise<Array<{ level: string, label: string, blurb: string,
 *   questionCount: number, topicCount: number }>>}
 */
export async function fetchLevels() {
  const topics = await fetchTopics();
  const byLevel = new Map();

  for (const t of topics) {
    const entry = byLevel.get(t.level) ?? { questionCount: 0, topicCount: 0 };
    entry.questionCount += t.question_count ?? 0;
    entry.topicCount += 1;
    byLevel.set(t.level, entry);
  }

  return LEVEL_ORDER.filter((level) => (byLevel.get(level)?.questionCount ?? 0) > 0).map(
    (level) => ({
      level,
      label: LEVELS[level]?.label ?? level,
      blurb: LEVELS[level]?.blurb ?? '',
      ...byLevel.get(level),
    })
  );
}

/**
 * The exam paper: every question in bank order, with no answer attached.
 *
 * Returns the shape the UI has always consumed — `{ id, topic, question,
 * options }` — with `topic` as the display name rather than the slug, so
 * QuestionCard and the topic breakdown keep working unchanged.
 */
export async function fetchQuestions(level) {
  // !inner so the level filter applies to the join rather than nulling it out.
  let query = requireSupabase()
    .from('questions')
    .select('id, position, question, options, statements, type, topic_slug, topics!inner ( name, level )')
    .order('position', { ascending: true });

  if (level) query = query.eq('topics.level', level);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    topic: row.topics?.name ?? row.topic_slug,
    level: row.topics?.level ?? null,
    question: row.question,
    options: row.options ?? [],
    statements: row.statements ?? [],
    type: row.type ?? 'single',
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

/**
 * Knowledge-base guides.
 *
 * These are a different cut from exam topics — a module feeds several topics and
 * a topic draws on several modules — so they are fetched in their own right
 * rather than hanging off a topic.
 *
 * @param {string} [level] restrict to one certification level
 */
export async function fetchStudyModules(level) {
  let query = requireSupabase()
    .from('study_modules')
    .select('slug, level, title, file, content, topics, position')
    .order('position', { ascending: true });

  if (level) query = query.eq('level', level);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Submit an exam for server-side grading.
 *
 * The client sends the paper, the answers and the timing — score, pass/fail and
 * the topic breakdown are computed in the database against question_keys, so a
 * tampered client cannot report a score it did not earn.
 *
 * `questionIds` is what makes a short run score out of its own length rather
 * than out of the whole bank. The server intersects it with `questions`, so
 * unknown or repeated ids cannot pad or shrink the denominator. Omit it for the
 * full bank.
 *
 * @param {Record<string, string>} answers question id -> 'A' | 'B' | 'C' | 'D'
 */
export async function submitAttempt(
  answers,
  { questionIds, startedAt, durationSeconds, autoSubmitted, timeLimitMinutes } = {}
) {
  const { data, error } = await requireSupabase().rpc('submit_attempt', {
    p_answers: answers ?? {},
    p_question_ids: questionIds?.length ? questionIds : null,
    p_started_at: startedAt ?? null,
    p_duration_seconds: durationSeconds ?? null,
    p_auto_submitted: Boolean(autoSubmitted),
    p_time_limit_minutes: timeLimitMinutes ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

/** True when a bank query can even be attempted. */
export function canQueryBank() {
  return Boolean(supabase);
}
