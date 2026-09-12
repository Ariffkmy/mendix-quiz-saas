/**
 * Local persistence for the exam.
 *
 * Answers are mirrored to localStorage on every change so a refresh, a crash or
 * a closed tab mid-exam does not lose progress.
 *
 * The attempt counter here is a per-user convenience mirror of
 * user_profiles.attempts_used, so the dashboard can show a count before the
 * profile fetch resolves. Nothing gates on it.
 *
 * Results are cached so /results can render without a round-trip.
 */
const IN_PROGRESS_KEY = 'mx-exam:in-progress';
const LAST_RESULT_KEY = 'mx-exam:last-result';
const ATTEMPT_COUNTS_KEY = 'mx-exam:attempt-counts';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private-browsing / quota failures must never break the exam.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ----------------------------- in-progress exam ---------------------------- */

/**
 * @returns {{ answers: Record<string,string>, startedAt: number, deadline: number|null,
 *   flagged: string[], questionIds: string[], timeLimitMinutes: number|null } | null}
 */
export function loadInProgress() {
  const saved = read(IN_PROGRESS_KEY);
  if (!saved || typeof saved.startedAt !== 'number') return null;

  // An untimed run has no deadline, so only reject a malformed one.
  if (saved.deadline != null && typeof saved.deadline !== 'number') return null;

  // Without the paper there is nothing to resume — the questions were chosen at
  // random, so a saved answer map alone cannot be put back on screen.
  if (!Array.isArray(saved.questionIds) || saved.questionIds.length === 0) return null;

  return {
    answers: saved.answers ?? {},
    startedAt: saved.startedAt,
    deadline: saved.deadline ?? null,
    flagged: Array.isArray(saved.flagged) ? saved.flagged : [],
    questionIds: saved.questionIds,
    timeLimitMinutes: saved.timeLimitMinutes ?? null,
  };
}

export function saveInProgress(attempt) {
  write(IN_PROGRESS_KEY, attempt);
}

export function clearInProgress() {
  remove(IN_PROGRESS_KEY);
}

/* -------------------------------- last result ------------------------------ */

/** The most recently submitted attempt, used to render /results. */
export function loadLastResult() {
  return read(LAST_RESULT_KEY);
}

export function saveLastResult(result) {
  write(LAST_RESULT_KEY, result);
}

export function clearLastResult() {
  remove(LAST_RESULT_KEY);
}

/* ------------------------------ attempt counts ----------------------------- */

/** @returns {Record<string, number>} attempt counts keyed by user id. */
function readCounts() {
  const saved = read(ATTEMPT_COUNTS_KEY);
  return saved && typeof saved === 'object' ? saved : {};
}

/** How many exams this account has submitted, according to this browser. */
export function loadAttemptCount(userId) {
  if (!userId) return 0;
  const count = readCounts()[userId];
  return Number.isFinite(count) ? count : 0;
}

/**
 * Record one submitted exam for this account.
 *
 * @returns {number} the new count.
 */
export function recordAttempt(userId) {
  if (!userId) return 0;
  const counts = readCounts();
  const next = loadAttemptCount(userId) + 1;
  write(ATTEMPT_COUNTS_KEY, { ...counts, [userId]: next });
  return next;
}

/**
 * Reconcile the local mirror with the server's count, which is authoritative.
 * Only ever moves the local number up, so a stale browser cannot undercount.
 */
export function syncAttemptCount(userId, serverCount) {
  if (!userId || !Number.isFinite(serverCount)) return loadAttemptCount(userId);
  const counts = readCounts();
  const next = Math.max(loadAttemptCount(userId), serverCount);
  write(ATTEMPT_COUNTS_KEY, { ...counts, [userId]: next });
  return next;
}

/** Wipe every local trace of a sitting — used on sign-out. */
export function clearAttemptData() {
  remove(IN_PROGRESS_KEY);
  remove(LAST_RESULT_KEY);
  remove(ATTEMPT_COUNTS_KEY);
}
