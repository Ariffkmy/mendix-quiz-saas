/**
 * Parser for the markdown question banks in src/data/.
 *
 * The markdown is the authoring source; scripts/seed-question-bank.mjs runs it
 * through here and writes the result into Supabase. It is deliberately *not*
 * imported by the app — the app reads questions from the database, so the bank
 * can be edited without a redeploy and the answer key never ships to a browser.
 *
 * Keeping this a plain function of a string (rather than a `?raw` import) is
 * what lets the seed script run it under Node.
 *
 * Three question shapes are supported, and the type is inferred from the layout
 * rather than declared — there is no `**Type:**` line to keep in sync:
 *
 *   single      two to four options, one correct.
 *
 *     ### <id>
 *     <question text>
 *     - A. <option>            (A-D)
 *     **Answer:** <letter>
 *     **Source:** <explanation>
 *     **Tip:** <optional revision pointer>
 *
 *   true-false  exactly two options, "True" and "False" in that order. Write the
 *               question text as an assertion to be judged.
 *
 *     ### <id>
 *     <statement to judge>
 *     - A. True
 *     - B. False
 *     **Answer:** A
 *
 *   roman       numbered statements, then options that combine them ("I and III
 *               only"). The classic certification format. The stem must come
 *               BEFORE the statements — text after the first statement is not
 *               parsed as question text.
 *
 *     ### <id>
 *     <question text>
 *     - I. <statement>         (I-V, in order)
 *     - II. <statement>
 *     - A. I and II only       (A-D)
 *     **Answer:** B
 *
 * Parsing fails loudly on out-of-order letters or numerals, a duplicate id, an
 * answer that is not among the options, and on a roman question whose options
 * never reference its statements — a seed that half-works is worse than one
 * that stops.
 */

/** Option letters, in display order. A question may use a prefix of this. */
export const LETTERS = ['A', 'B', 'C', 'D'];

/** Statement numerals for roman-format questions, in display order. */
export const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

/** Question shapes the bank can hold. */
export const QUESTION_TYPES = {
  single: 'single',
  trueFalse: 'true-false',
  roman: 'roman',
};

const TOPIC_RE = /^##\s+(.+?)\s*$/;
const ID_RE = /^###\s+(.+?)\s*$/;
const OPTION_RE = /^-\s+([A-D])\.\s+(.+?)\s*$/;
const STATEMENT_RE = /^-\s+(I{1,3}|IV|V)\.\s+(.+?)\s*$/;
const ANSWER_RE = /^\*\*Answer:\*\*\s*([A-D])\s*$/;
const SOURCE_RE = /^\*\*Source:\*\*\s*(.+?)\s*$/;
const TIP_RE = /^\*\*Tip:\*\*\s*(.+?)\s*$/;

/** Two options reading True/False is a true-false question; numbered statements make it roman. */
function inferType({ options, statements }) {
  if (statements.length) return QUESTION_TYPES.roman;
  if (
    options.length === 2 &&
    options[0].toLowerCase() === 'true' &&
    options[1].toLowerCase() === 'false'
  ) {
    return QUESTION_TYPES.trueFalse;
  }
  return QUESTION_TYPES.single;
}

/**
 * @param {string} markdown raw contents of a questions markdown file
 * @param {string} [label] file name, used in error messages
 * @returns {Array<{ id: string, topic: string, question: string, statements: string[],
 *   options: string[], letters: string[], type: string, answer: string, src: string, tip: string }>}
 */
export function parseQuestions(markdown, label = 'questions.md') {
  const questions = [];
  const seen = new Set();
  let topic = null;
  let current = null;

  const push = () => {
    if (!current) return;

    const { id, options, statements } = current;

    if (options.length < 2) {
      throw new Error(`${label}: "${id}" has ${options.length} options, expected at least 2`);
    }
    if (!current.answer) {
      throw new Error(`${label}: "${id}" has no **Answer:**`);
    }

    const letters = LETTERS.slice(0, options.length);
    if (!letters.includes(current.answer)) {
      throw new Error(
        `${label}: "${id}" answers ${current.answer}, which is not among its ${options.length} options`
      );
    }
    // Ids are primary keys in Supabase and are not namespaced by level, so a
    // duplicate would silently overwrite rather than produce two questions.
    if (seen.has(id)) throw new Error(`${label}: duplicate question id "${id}"`);
    seen.add(id);

    const type = inferType(current);

    // A roman question whose options never reference its statements is almost
    // certainly a mis-typed option letter, so fail rather than seed a question
    // with an unreachable statement list.
    if (type === QUESTION_TYPES.roman) {
      const referenced = options.some((option) =>
        statements.some((_, i) => new RegExp(`\\b${NUMERALS[i]}\\b`).test(option))
      );
      if (!referenced) {
        throw new Error(`${label}: "${id}" lists statements but no option refers to them`);
      }
    }

    questions.push({ ...current, letters, type });
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
      if (!topic) {
        throw new Error(`${label}: question "${idMatch[1]}" appears before any "## <topic>" heading`);
      }
      current = {
        id: idMatch[1],
        topic,
        question: '',
        statements: [],
        options: [],
        answer: '',
        src: '',
        tip: '',
      };
      continue;
    }

    if (!current) continue; // title, HTML comment body, or other preamble

    // Statements are matched before options: both are `- X. text`, and only the
    // numeral pattern distinguishes them.
    const statementMatch = STATEMENT_RE.exec(line);
    if (statementMatch) {
      if (current.options.length) {
        throw new Error(
          `${label}: "${current.id}" has statement ${statementMatch[1]} after its options — statements come first`
        );
      }
      const expected = NUMERALS[current.statements.length];
      if (statementMatch[1] !== expected) {
        throw new Error(
          `${label}: "${current.id}" statement ${statementMatch[1]} is out of order (expected ${expected})`
        );
      }
      current.statements.push(statementMatch[2]);
      continue;
    }

    const optionMatch = OPTION_RE.exec(line);
    if (optionMatch) {
      const expected = LETTERS[current.options.length];
      if (optionMatch[1] !== expected) {
        throw new Error(
          `${label}: "${current.id}" option ${optionMatch[1]} is out of order (expected ${expected})`
        );
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

    const tipMatch = TIP_RE.exec(line);
    if (tipMatch) {
      current.tip = tipMatch[1];
      continue;
    }

    // Anything else before the statements and options is the question text,
    // which may wrap across lines.
    if (!current.options.length && !current.statements.length) {
      current.question = current.question ? `${current.question} ${line}` : line;
    }
  }

  push();
  return questions;
}
