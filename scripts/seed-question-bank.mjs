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
const QUESTIONS_MD = join(ROOT, 'src/data/questions.md');
const KB_DIR = join(ROOT, 'src/data/knowledgebase');

/** Same slug rule the old knowledgebase/index.js used, so URLs do not change. */
const slugify = (topic) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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
function readKnowledgeBase(topicNames) {
  const bySlug = new Map(topicNames.map((name) => [slugify(name), name]));
  const found = [];

  let files = [];
  try {
    files = readdirSync(KB_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    console.warn(`! No knowledge base directory at ${KB_DIR} — skipping topic_content.`);
    return found;
  }

  for (const file of files) {
    const stem = file.replace(/\.md$/, '');
    // "Advanced-Domain-Model-Skills-Knowledge-Base" -> "advanced-domain-model-skills"
    const slug = slugify(stem.replace(/-?Knowledge-?Base$/i, ''));

    if (!bySlug.has(slug)) {
      console.warn(`! ${file} does not match any topic in questions.md (slug "${slug}") — skipped.`);
      continue;
    }

    found.push({
      topic_slug: slug,
      file,
      content: readFileSync(join(KB_DIR, file), 'utf8'),
    });
  }

  return found;
}

/* --------------------------------- main ---------------------------------- */

async function main() {
  const { url, key } = loadEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const questions = parseQuestions(readFileSync(QUESTIONS_MD, 'utf8'));
  if (!questions.length) {
    console.error('questions.md parsed to zero questions — refusing to wipe the bank.');
    process.exit(1);
  }

  // Topic order follows first appearance in the markdown, matching how the old
  // TOPICS constant was derived.
  const topicNames = [...new Set(questions.map((q) => q.topic))];
  const topics = topicNames.map((name, i) => ({ slug: slugify(name), name, position: i }));
  const slugByTopic = new Map(topics.map((t) => [t.name, t.slug]));

  const questionRows = questions.map((q, i) => ({
    id: q.id,
    topic_slug: slugByTopic.get(q.topic),
    position: i,
    question: q.question,
    options: q.options,
    updated_at: new Date().toISOString(),
  }));

  const keyRows = questions.map((q) => ({
    question_id: q.id,
    answer: q.answer,
    explanation: q.src ?? '',
    tip: q.tip ?? '',
    updated_at: new Date().toISOString(),
  }));

  const kb = readKnowledgeBase(topicNames);

  const step = async (label, promise) => {
    const { error } = await promise;
    if (error) {
      console.error(`✗ ${label}: ${error.message}`);
      process.exit(1);
    }
    console.log(`✓ ${label}`);
  };

  // Order matters: topics own the foreign keys, and question_keys hangs off
  // questions.
  await step(
    `topics (${topics.length})`,
    supabase.from('topics').upsert(topics, { onConflict: 'slug' })
  );
  await step(
    `questions (${questionRows.length})`,
    supabase.from('questions').upsert(questionRows, { onConflict: 'id' })
  );
  await step(
    `question_keys (${keyRows.length})`,
    supabase.from('question_keys').upsert(keyRows, { onConflict: 'question_id' })
  );

  if (kb.length) {
    await step(
      `topic_content (${kb.length})`,
      supabase
        .from('topic_content')
        .upsert(
          kb.map((m) => ({ ...m, updated_at: new Date().toISOString() })),
          { onConflict: 'topic_slug' }
        )
    );
  }

  // Drop anything the markdown no longer contains, so the database is a mirror
  // of the files rather than an accumulation of every question ever written.
  await step(
    'prune removed questions',
    supabase.from('questions').delete().not('id', 'in', `(${questions.map((q) => q.id).join(',')})`)
  );
  await step(
    'prune removed topics',
    supabase.from('topics').delete().not('slug', 'in', `(${topics.map((t) => t.slug).join(',')})`)
  );

  const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log(`\nSeeded ${count} questions across ${topics.length} topics.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
