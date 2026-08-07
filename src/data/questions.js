/**
 * Mendix Advanced Developer Certification — practice question bank.
 *
 * The bank itself now lives in questions.md (the source of truth) and is parsed
 * by src/lib/parseQuestions.js. This module stays as the import surface the rest
 * of the app already uses, and adds the exam constants derived from the bank.
 *
 * Each question:
 *   id       unique stable identifier (used as the answer-map key)
 *   topic    exam module the question belongs to (matches a knowledge-base file)
 *   question the question text
 *   options  4 answer options, in A/B/C/D order
 *   answer   the correct option letter
 *   src      explanation, citing the module the answer comes from
 */
export { LETTERS, QUESTIONS, parseQuestions } from '../lib/parseQuestions';

import { QUESTIONS } from '../lib/parseQuestions';

/** Score at or above this percentage to pass. */
export const PASS_THRESHOLD = 70;

/** Exam duration in minutes. */
export const EXAM_MINUTES = 30;

/** Distinct topics, in the order they first appear in the bank. */
export const TOPICS = [...new Set(QUESTIONS.map((q) => q.topic))];

/** Number of questions per topic, keyed by topic name. */
export const QUESTIONS_PER_TOPIC = TOPICS.reduce((acc, topic) => {
  acc[topic] = QUESTIONS.filter((q) => q.topic === topic).length;
  return acc;
}, {});
