import { useEffect, useMemo, useState } from 'react';

import Spinner from '../components/Spinner.jsx';
import { renderMarkdown } from '../lib/markdown';
import { fetchTopicContent, fetchTopics } from '../lib/questionBank';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * The knowledge base, read from Supabase.
 *
 * topic_content is readable by any signed-in account.
 */
export default function Study() {
  const [modules, setModules] = useState([]);
  const [activeSlug, setActiveSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const [topics, content] = await Promise.all([fetchTopics(), fetchTopicContent()]);
        if (!active) return;

        // Only modules with study material are worth listing.
        const merged = topics
          .filter((t) => content.has(t.slug))
          .map((t) => ({
            slug: t.slug,
            topic: t.name,
            questionCount: t.question_count ?? 0,
            file: content.get(t.slug).file,
            content: content.get(t.slug).content,
          }));

        setModules(merged);
        setActiveSlug((prev) => prev ?? merged[0]?.slug ?? null);
      } catch {
        // Falls through to the empty state below.
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const active = modules.find((m) => m.slug === activeSlug) ?? modules[0] ?? null;
  const html = useMemo(() => (active ? renderMarkdown(active.content) : ''), [active]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading the study material…" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">No study material found</h1>
        <p className="mt-3 text-ink-500">
          The study guides live in Supabase. Run{' '}
          <code className="font-mono">node scripts/seed-question-bank.mjs</code> to load them from{' '}
          <code className="font-mono">src/data/knowledgebase/</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Study material</h1>
      <p className="mt-3 text-ink-500">
        The knowledge base every exam question is drawn from — {modules.length} modules.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr] lg:items-start">
        {/* Module list */}
        <nav className="lg:sticky lg:top-20" aria-label="Modules">
          <ul className="space-y-1.5">
            {modules.map((mod) => {
              const isActive = mod.slug === active.slug;
              const count = mod.questionCount;

              return (
                <li key={mod.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlug(mod.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full rounded-xl border p-3.5 text-left transition ${
                      isActive
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${
                        isActive ? 'text-brand-800' : 'text-ink-900'
                      }`}
                    >
                      {mod.topic}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {count} exam question{count === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rendered module */}
        <article className="card p-6 sm:p-10">
          <div className="mb-6 border-b border-slate-200 pb-5">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              Module
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">{active.topic}</h2>
            <p className="mt-1 font-mono text-xs text-ink-500">{active.file}</p>
          </div>

          {/* Seeded markdown from topic_content, escaped by renderMarkdown(). */}
          <div className="prose-kb max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  );
}
