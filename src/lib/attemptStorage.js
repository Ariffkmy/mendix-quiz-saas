/**
 * Local persistence for the exam.
 *
 * Answers are mirrored to localStorage on every change so a refresh, a crash or
 * a closed tab mid-exam does not lose progress. The submitted attempt is also
 * written to Supabase; this is the offline-safe copy the results page falls back
 * to when the network write did not land.
 */
const IN_PROGRESS_KEY = 'mx-exam:in-progress';
const LAST_RESULT_KEY = 'mx-exam:last-result';

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
