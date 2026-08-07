/**
 * Parser for the markdown question bank (src/data/questions.md).
 *
 * The markdown is the source of truth; this turns it back into the array shape
 * the app has always consumed:
 *   { id, topic, question, options: [4], answer: 'A'|'B'|'C'|'D', src }
 *
 * Expected layout (see the comment at the top of questions.md):
 *   ## <topic>
 *   ### <id>
 *   <question text>
 *   - A. <option>            (four of these, A-D)
 *   **Answer:** <letter>
 *   **Source:** <explanation>
 */

import markdown from '../data/questions.md?raw';

/** Option letters, in display order. */
export const LETTERS = ['A', 'B', 'C', 'D'];

const TOPIC_RE = /^##\s+(.+?)\s*$/;
const ID_RE = /^###\s+(.+?)\s*$/;
const OPTION_RE = /^-\s+([A-D])\.\s+(.+?)\s*$/;
const ANSWER_RE = /^\*\*Answer:\*\*\s*([A-D])\s*$/;
const SOURCE_RE = /^\*\*Source:\*\*\s*(.+?)\s*$/;

/**
 * @param {string} markdown raw contents of questions.md
 * @returns {Array<{ id: string, topic: string, question: string, options: string[], answer: string, src: string }>}
 */
export function parseQuestions(markdown) {
  const questions = [];
  let topic = null;
  let current = null;

  const push = () => {
    if (!current) return;
    if (current.options.length !== LETTERS.length) {
      throw new Error(`questions.md: "${current.id}" has ${current.options.length} options, expected 4`);
    }
    if (!current.answer) throw new Error(`questions.md: "${current.id}" has no **Answer:**`);
    questions.push(current);
    current = null;
  };

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('<!--') || line.startsWith('#####')) continue;

    const topicMatch = TOPIC_RE.exec(line);
    if (topicMatch) {
      push();
      topic = topicMatch[1];
      continue;
    }

    const idMatch = ID_RE.exec(line);
    if (idMatch) {
      push();
      if (!topic) throw new Error(`questions.md: question "${idMatch[1]}" appears before any "## <topic>" heading`);
      current = { id: idMatch[1], topic, question: '', options: [], answer: '', src: '' };
      continue;
    }

    if (!current) continue; // title, HTML comment body, or other preamble

    const optionMatch = OPTION_RE.exec(line);
    if (optionMatch) {
      const expected = LETTERS[current.options.length];
      if (optionMatch[1] !== expected) {
        throw new Error(`questions.md: "${current.id}" option ${optionMatch[1]} is out of order (expected ${expected})`);
      }
      current.options.push(optionMatch[2]);
      continue;
    }

    const answerMatch = ANSWER_RE.exec(line);
    if (answerMatch) {
      current.answer = answerMatch[1];
      continue;
    }

    const sourceMatch = SOURCE_RE.exec(line);
    if (sourceMatch) {
      current.src = sourceMatch[1];
      continue;
    }

    // Anything else before the options is the question text (may wrap lines).
    if (!current.options.length) {
      current.question = current.question ? `${current.question} ${line}` : line;
    }
  }

  push();
  return questions;
}

/** The parsed question bank, read from src/data/questions.md at build time. */
export const QUESTIONS = parseQuestions(markdown);
