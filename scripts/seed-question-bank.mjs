/**
 * Seed the Supabase question bank from the markdown in src/data/.
 *
 * The .md files remain the authoring source — they are simply no longer
 * imported into the browser bundle. This script pushes them into the tables
 * created by supabase/migrations/0004_question_bank.sql:
 *
 *   src/data/questions.md            -> topics, questions, question_keys
 *   src/data/knowledgebase/*.md      -> topic_content
 *
 * Run it with the service role key, which bypasses RLS — nothing else can write
 * these tables:
 *
 *   node scripts/seed-question-bank.mjs
 *
 * Idempotent: every write is an upsert keyed on the question id or topic slug,
 * so re-running after editing the markdown syncs the changes. Questions and
 * topics that have disappeared from the markdown are deleted, so the database
 * always matches the files exactly.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseQuestions } from '../src/lib/parseQuestions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * One bank per certification level.
 *
 * Mendix certifies at Intermediate and Advanced against different syllabuses,
 * so these are separate question sets with their own modules — not a difficulty
 * filter over one set. A bank whose questions file is missing is skipped, which
 * is how the Intermediate level stays dormant until someone writes it.
 */
const BANKS = [
  {
    level: 'advanced',
    questions: 'src/data/questions.md',
    knowledgebase: 'src/data/knowledgebase',
  },
  {
    level: 'intermediate',
    questions: 'src/data/questions-intermediate.md',
    knowledgebase: 'src/data/knowledgebase-intermediate',
  },
];

const slugifyName = (topic) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Topic slugs are level-prefixed because a module name is only unique within a
 * level — both blueprints can have an "Error Handling".
 */
const slugify = (topic, level) => `${level}-${slugifyName(topic)}`;

/* ------------------------------- env ------------------------------------- */

function loadEnv() {
  // Vercel and CI provide these directly; locally they live in .env.
  const env = { ...process.env };

  try {
    for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!env[key]) env[key] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // No .env — rely on the real environment.
  }

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      'Missing credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or the environment.\n' +
        'The service role key is required: RLS gives no client write access to the bank.'
    );
    process.exit(1);
  }

  return { url, key };
}

/* ----------------------------- knowledge base ---------------------------- */

/**
 * Map a knowledge-base filename to its topic name by matching against the
 * topics found in questions.md, rather than a hand-maintained lookup table.
 */
function readKnowledgeBase(dir, topicNames, level) {
  const bySlug = new Map(topicNames.map((name) => [slugify(name, level), name]));
  const found = [];

  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    console.warn(`  ! no knowledge base directory at ${dir} — skipping topic_content`);
    return found;
  }

  for (const file of files) {
    const stem = file.replace(/\.md$/, '');
    // "Advanced-Domain-Model-Skills-Knowledge-Base" -> "advanced-domain-model-skills"
    const slug = slugify(stem.replace(/-?Knowledge-?Base$/i, ''), level);

    if (!bySlug.has(slug)) {
      console.warn(`  ! ${file} matches no topic in this bank (slug "${slug}") — skipped`);
      continue;
    }

    found.push({
      topic_slug: slug,
      file,
      content: readFileSync(join(dir, file), 'utf8'),
    });
  }

  return found;
}

/* --------------------------------- main ---------------------------------- */

async function main() {
  const { url, key } = loadEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const allTopics = [];
  const allQuestions = [];
  const allKeys = [];
  const allContent = [];

  for (const bank of BANKS) {
    const questionsPath = join(ROOT, bank.questions);

    let markdown;
    try {
      markdown = readFileSync(questionsPath, 'utf8');
    } catch {
      console.log(`- ${bank.level}: no ${bank.questions}, skipping`);
      continue;
    }

    const questions = parseQuestions(markdown);
    if (!questions.length) {
      console.error(`${bank.questions} parsed to zero questions — refusing to wipe that bank.`);
      process.exit(1);
    }

    // Topic order follows first appearance in the markdown.
    const topicNames = [...new Set(questions.map((q) => q.topic))];
    const now = new Date().toISOString();

    allTopics.push(
      ...topicNames.map((name, i) => ({
        slug: slugify(name, bank.level),
        name,
        level: bank.level,
        position: i,
        updated_at: now,
      }))
    );

    allQuestions.push(
      ...questions.map((q, i) => ({
        id: q.id,
        topic_slug: slugify(q.topic, bank.level),
        position: i,
        question: q.question,
        options: q.options,
        updated_at: now,
      }))
    );

    allKeys.push(
      ...questions.map((q) => ({
        question_id: q.id,
        answer: q.answer,
        explanation: q.src ?? '',
        tip: q.tip ?? '',
        updated_at: now,
      }))
    );

    const kb = readKnowledgeBase(join(ROOT, bank.knowledgebase), topicNames, bank.level);
    allContent.push(...kb.map((m) => ({ ...m, updated_at: now })));

    console.log(
      `- ${bank.level}: ${questions.length} questions, ${topicNames.length} topics, ${kb.length} study guides`
    );
  }

  if (!allQuestions.length) {
    console.error('No banks found. Expected at least src/data/questions.md.');
    process.exit(1);
  }

  // Question ids are the primary key and are not namespaced by level, so a
  // collision between banks would silently overwrite rather than add.
  const dupes = allQuestions.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) {
    console.error(`Duplicate question ids across banks: ${[...new Set(dupes)].join(', ')}`);
    process.exit(1);
  }

  const step = async (label, promise) => {
    const { error } = await promise;
    if (error) {
      console.error(`\u2717 ${label}: ${error.message}`);
      process.exit(1);
    }
    console.log(`\u2713 ${label}`);
  };

  console.log('');

  // Prune first. Topics carry a unique (level, name), so a renamed slug would
  // collide with the row it is replacing if the old one were still present —
  // and deleting a topic cascades to its questions, which are re-inserted
  // immediately below. A seed that fails between these steps leaves the bank
  // short, so re-run it rather than leaving it half-applied.
  await step(
    'prune removed topics',
    supabase
      .from('topics')
      .delete()
      .not('slug', 'in', `(${allTopics.map((t) => t.slug).join(',')})`)
  );

  // Order matters: topics own the foreign keys, and question_keys hangs off
  // questions.
  await step(
    `topics (${allTopics.length})`,
    supabase.from('topics').upsert(allTopics, { onConflict: 'slug' })
  );
  await step(
    `questions (${allQuestions.length})`,
    supabase.from('questions').upsert(allQuestions, { onConflict: 'id' })
  );
  await step(
    `question_keys (${allKeys.length})`,
    supabase.from('question_keys').upsert(allKeys, { onConflict: 'question_id' })
  );

  if (allContent.length) {
    await step(
      `topic_content (${allContent.length})`,
      supabase.from('topic_content').upsert(allContent, { onConflict: 'topic_slug' })
    );
  }

  // Drop anything the markdown no longer contains, so the database is a mirror
  // of the files rather than an accumulation of every question ever written.
  await step(
    'prune removed questions',
    supabase
      .from('questions')
      .delete()
      .not('id', 'in', `(${allQuestions.map((q) => q.id).join(',')})`)
  );

  const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log(`\nSeeded ${count} questions across ${allTopics.length} topics.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
