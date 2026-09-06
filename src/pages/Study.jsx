import { useMemo, useState } from 'react';

import { KNOWLEDGE_BASE } from '../data/knowledgebase';
import { renderMarkdown } from '../lib/markdown';

export default function Study() {
  const [activeSlug, setActiveSlug] = useState(KNOWLEDGE_BASE[0]?.slug ?? null);

  const active = KNOWLEDGE_BASE.find((m) => m.slug === activeSlug) ?? KNOWLEDGE_BASE[0] ?? null;
  const html = useMemo(() => (active ? renderMarkdown(active.content) : ''), [active]);

  if (!active) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">No study material found</h1>
        <p className="mt-3 text-ink-500">
          Drop the module <code className="font-mono">.md</code> files into{' '}
          <code className="font-mono">src/data/knowledgebase/</code> and restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Study material</h1>
      <p className="mt-3 text-ink-500">
        Review the supporting study notes across {KNOWLEDGE_BASE.length} modules, then practise with
        the categorized Intermediate and Advanced question banks.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr] lg:items-start">
        {/* Module list */}
        <nav className="lg:sticky lg:top-20" aria-label="Modules">
          <ul className="space-y-1.5">
            {KNOWLEDGE_BASE.map((mod) => {
              const isActive = mod.slug === active.slug;

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
                      {mod.title}
                    </span>
                    {/* A module feeds several exam topics and a topic draws on
                        several modules, so there is no honest per-module
                        question count to show — name the topics instead. */}
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {mod.topics.join(' · ') || 'no topic mapped'}
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
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">{active.title}</h2>
            <p className="mt-1 font-mono text-xs text-ink-500">{active.file}</p>
            {active.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {active.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-600"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content is bundled, build-time markdown that renderMarkdown() escapes. */}
          <div className="prose-kb max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  );
}
