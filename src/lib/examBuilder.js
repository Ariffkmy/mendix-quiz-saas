/**
 * Builds a sitting from the question bank.
 *
 * A candidate chooses how many questions to face. Anything short of the full
 * bank is drawn proportionally across the seven topics, so a 25-question run
 * carries the same topic weighting as the selected full question bank and the per-topic
 * breakdown on the results page stays meaningful.
 *
 * The chosen set travels with the attempt (see Quiz.jsx: `answers` is seeded
 * with every asked question id) so grading never scores a question that was
 * never put in front of the candidate.
 */
import { QUESTIONS } from '../data/questions';

/** A sitting shorter than this is not a meaningful rehearsal. */
export const MIN_EXAM_QUESTIONS = 5;

/** Sizes offered as one-click presets, plus the full bank. */
export const EXAM_SIZE_PRESETS = [10, 25, 50, QUESTIONS.length];

/**
 * What the setup screen offers first. A short sitting, not the full bank: the
 * point of choosing a length is to practise in the time available, and the full
 * exam is still one click away.
 */
export const DEFAULT_EXAM_SIZE = 25;

/** Clamp any requested size into what the bank can actually serve. */
export function clampExamSize(size, bank = QUESTIONS) {
  const n = Math.round(Number(size));
  if (!Number.isFinite(n)) return bank.length;
  return Math.min(bank.length, Math.max(MIN_EXAM_QUESTIONS, n));
}

/** Topics in bank order, with how many questions each holds. */
export function topicTotals(bank = QUESTIONS) {
  const counts = new Map();
  for (const q of bank) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
  return [...counts.entries()].map(([topic, total]) => ({ topic, total }));
}

/**
 * Split `size` across the topics in proportion to how many questions each holds.
 *
 * Uses largest-remainder: floor every share, then hand the leftover places to
 * the topics that lost the most in rounding. That keeps the total exact and
 * stops a small sitting from silently dropping a whole topic where the maths
 * allows it to be represented.
 *
 * @returns {Array<{ topic: string, total: number, count: number }>}
 */
export function planTopicCounts(size, bank = QUESTIONS) {
  const totals = topicTotals(bank);
  const bankSize = bank.length;
  if (bankSize === 0) return [];

  const target = clampExamSize(size, bank);

  const shares = totals.map((entry) => {
    const exact = (entry.total * target) / bankSize;
    const floor = Math.floor(exact);
    return { ...entry, count: floor, remainder: exact - floor };
  });

  let remaining = target - shares.reduce((sum, s) => sum + s.count, 0);

  // Hand out the leftover places by largest rounding loss, never exceeding what
  // a topic actually holds.
  const byRemainder = [...shares].sort((a, b) => b.remainder - a.remainder);
  for (const share of byRemainder) {
    if (remaining <= 0) break;
    if (share.count < share.total) {
      share.count += 1;
      remaining -= 1;
    }
  }

  // If rounding still left places over (only possible when some topic capped),
  // top up wherever there is room.
  while (remaining > 0) {
    const room = shares.find((s) => s.count < s.total);
    if (!room) break;
    room.count += 1;
    remaining -= 1;
  }

  return shares.map(({ topic, total, count }) => ({ topic, total, count }));
}

/** Fisher-Yates, on a copy. */
function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pick `count` questions from one topic's pool, never-asked ones first.
 *
 * `seenRank` maps a question id to how long ago it was asked (0 = longest ago).
 * Anything missing from it has never been asked and is drawn first, shuffled so
 * two sittings of the same length are not the same exam. Only once the unseen
 * questions run out does the topic reach back for the ones asked longest ago —
 * and it shuffles within that oldest slice too, so a candidate cycling through
 * the bank a second time does not get the first sitting back verbatim.
 */
function pickFromPool(pool, count, seenRank) {
  if (count <= 0) return [];

  const unseen = pool.filter((q) => !seenRank.has(q.id));
  const picked = shuffled(unseen).slice(0, count);
  if (picked.length >= count) return picked;

  const shortfall = count - picked.length;
  const seen = pool
    .filter((q) => seenRank.has(q.id))
    .sort((a, b) => seenRank.get(a.id) - seenRank.get(b.id));

  // Draw from the stalest slice rather than strictly the oldest N, so the
  // repeats vary between retakes instead of replaying in a fixed order.
  const staleSlice = seen.slice(0, Math.min(seen.length, shortfall * 2));
  return [...picked, ...shuffled(staleSlice).slice(0, shortfall)];
}

/**
 * Draw a sitting of `size` questions.
 *
 * Which questions are drawn is random within each topic, but the returned list
 * is in bank order — so the sitting stays grouped by topic and the question
 * navigator reads coherently rather than jumping between subjects.
 *
 * Pass `seen` (question ids in the order they were last asked, oldest first) to
 * keep a retake fresh: the draw exhausts the questions the candidate has never
 * faced before it repeats any of them.
 *
 * @param {number} size
 * @param {{ bank?: Array, seen?: string[] }} [options]
 * @returns {Array} the drawn questions, in bank order
 */
export function buildExam(size, { bank = QUESTIONS, seen = [] } = {}) {
  const plan = planTopicCounts(size, bank);
  const seenRank = new Map(seen.map((id, index) => [id, index]));
  const picked = new Set();

  for (const { topic, count } of plan) {
    const pool = bank.filter((q) => q.topic === topic);
    for (const q of pickFromPool(pool, count, seenRank)) picked.add(q.id);
  }

  return bank.filter((q) => picked.has(q.id));
}
