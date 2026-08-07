/**
 * Local persistence for the exam.
 *
 * Answers are mirrored to localStorage on every change so a refresh, a crash or
 * a closed tab mid-exam does not lose progress.
 *
 * The attempt counter here is a per-user convenience mirror only: it lets the UI
 * say "1 attempt remaining" before the profile fetch resolves. The limit that
 * actually holds is `can_attempt()` behind the insert policy on quiz_attempts,
 * so clearing localStorage buys nobody an extra attempt.
 *
 * Results are only ever cached for paid accounts — a free account's score never
 * touches this file, which is why /results has nothing to show them even offline.
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

/** @returns {{ answers: Record<string,string>, startedAt: number, deadline: number, flagged: string[] } | null} */
export function loadInProgress() {
  const saved = read(IN_PROGRESS_KEY);
  if (!saved || typeof saved.startedAt !== 'number' || typeof saved.deadline !== 'number') {
    return null;
  }
  return {
    answers: saved.answers ?? {},
    startedAt: saved.startedAt,
    deadline: saved.deadline,
    flagged: Array.isArray(saved.flagged) ? saved.flagged : [],
  };
}

export function saveInProgress(attempt) {
  write(IN_PROGRESS_KEY, attempt);
}

export function clearInProgress() {
  remove(IN_PROGRESS_KEY);
}

/* -------------------------------- last result ------------------------------ */

/** The most recently submitted attempt, used to render /results. Paid only. */
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
