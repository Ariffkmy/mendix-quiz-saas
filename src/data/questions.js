/**
 * Mendix Developer Certification — categorized practice question banks.
 *
 * The bank itself now lives in questions.md (the source of truth) and is parsed
 * by src/lib/parseQuestions.js. This module stays as the import surface the rest
 * of the app already uses, and adds the exam constants derived from the bank.
 *
 * Each question:
 *   id         unique stable identifier (used as the answer-map key)
 *   category   certification level: Advanced or Intermediate
 *   topic      exam module the question belongs to (matches a knowledge-base file)
 *   question   the question text
 *   statements numbered statements (roman questions only; empty otherwise)
 *   options    answer options, in order — 2 for true/false, otherwise 4
 *   letters    the option letters this question actually uses
 *   type       'single' | 'true-false' | 'roman'
 *   answer     the correct option letter
 *   src        explanation, citing the module the answer comes from
 */
export {
  LETTERS,
  NUMERALS,
  QUESTIONS,
  QUESTION_TYPES,
  parseQuestions,
} from '../lib/parseQuestions';

import { QUESTIONS } from '../lib/parseQuestions';

/** Certification levels, in bank order. */
export const EXAM_LEVELS = [...new Set(QUESTIONS.map((q) => q.category))];

/** The default keeps the app's existing Advanced behavior for old links and attempts. */
export const DEFAULT_EXAM_LEVEL = 'Advanced';

/** Return the isolated bank for one certification level. */
export function questionsForLevel(level = DEFAULT_EXAM_LEVEL) {
  return QUESTIONS.filter((q) => q.category === level);
}

/** Level-specific question and topic totals for setup and marketing UI. */
export const EXAM_CATEGORIES = Object.fromEntries(
  EXAM_LEVELS.map((level) => {
    const questions = questionsForLevel(level);
    return [
      level,
      {
        level,
        questions,
        questionCount: questions.length,
        topics: [...new Set(questions.map((q) => q.topic))],
      },
    ];
  })
);

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
