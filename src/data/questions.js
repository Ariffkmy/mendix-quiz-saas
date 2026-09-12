/**
 * Exam constants.
 *
 * The question bank itself now lives in Supabase (see
 * supabase/migrations/0004_question_bank.sql). This module used to re-export a
 * bundled QUESTIONS array; it no longer does, because that array carried the
 * answer key into the browser. Use src/lib/questionBank.js to load questions,
 * and useExamOverview() when all you need is the module list or a count.
 *
 * PASS_THRESHOLD is mirrored by public.pass_threshold() in the database, which
 * is the value that actually decides pass/fail. The copy here is for display —
 * "you need 70% to pass" — and the two must be changed together.
 */
export { LETTERS } from '../lib/parseQuestions';

/** Score at or above this percentage to pass. Mirrors public.pass_threshold(). */
export const PASS_THRESHOLD = 70;

/** Exam duration in minutes. */
export const EXAM_MINUTES = 30;
