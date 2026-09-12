/**
 * Exam setup: how long the paper is, and whether it is timed.
 *
 * The bank is ~100 questions across 8 modules, which is a real sitting. These
 * presets exist so someone can do a 10-question warm-up on the train without
 * committing to the full thing.
 */

/** Question-count presets. `null` means "every question in the bank". */
export const LENGTH_PRESETS = [
  { value: 10, label: 'Quick 10', hint: 'A warm-up' },
  { value: 30, label: '30 questions', hint: 'A focused run' },
  { value: 50, label: '50 questions', hint: 'Half the bank' },
  { value: null, label: 'Full exam', hint: 'Every question' },
];

/**
 * Time-limit presets, in minutes. `null` is untimed.
 *
 * `'scaled'` keeps the real exam's pace — the full paper allows 30 minutes for
 * 100 questions, so a shorter paper gets the same seconds per question. That is
 * the default, because practising at the wrong pace is worse than not
 * practising the pace at all.
 */
export const TIME_PRESETS = [
  { value: 'scaled', label: 'Exam pace', hint: 'Same seconds per question' },
  { value: 10, label: '10 minutes', hint: null },
  { value: 30, label: '30 minutes', hint: null },
  { value: 60, label: '60 minutes', hint: null },
  { value: null, label: 'No limit', hint: 'Untimed practice' },
];

/** Seconds per question in the real sitting, used by the 'scaled' preset. */
const SECONDS_PER_QUESTION = (30 * 60) / 100;

/**
 * Resolve a time preset against a paper length.
 * @returns {number|null} minutes, or null when untimed
 */
export function resolveTimeLimit(preset, questionCount) {
  if (preset === null) return null;
  if (preset === 'scaled') {
    return Math.max(1, Math.round((questionCount * SECONDS_PER_QUESTION) / 60));
  }
  return preset;
}

/** Fisher-Yates, on a copy. */
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `count` questions, spread across modules.
 *
 * A naive random sample of 10 from a 100-question bank can easily miss half the
 * syllabus, which makes a short run a poor signal. This allocates places to
 * modules in proportion to their size, then fills any remainder from whatever is
 * left over — so a 10-question paper still touches most modules, and an 8-module
 * bank gives roughly one question each.
 *
 * Returns questions in shuffled order. Passing a count at or above the bank size
 * returns the whole bank, shuffled.
 */
export function buildPaper(questions, count) {
  if (!count || count >= questions.length) return shuffle(questions);

  const byTopic = new Map();
  for (const q of questions) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic).push(q);
  }

  const topics = [...byTopic.keys()];
  const picked = [];
  const leftovers = [];

  for (const topic of topics) {
    const pool = shuffle(byTopic.get(topic));
    // Proportional share, but never zero — every module gets at least one place
    // while there are more places than modules.
    const share =
      topics.length <= count
        ? Math.max(1, Math.floor((pool.length / questions.length) * count))
        : 0;

    picked.push(...pool.slice(0, share));
    leftovers.push(...pool.slice(share));
  }

  // Proportional shares round down, and with fewer places than modules nothing
  // is allocated at all — either way the remainder comes from the leftovers.
  const remaining = count - picked.length;
  if (remaining > 0) picked.push(...shuffle(leftovers).slice(0, remaining));

  return shuffle(picked.slice(0, count));
}
