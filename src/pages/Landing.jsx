import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, PASS_THRESHOLD, QUESTIONS, TOPICS } from '../data/questions';

/* ------------------------------------------------------------------ data --- */

/** Presentation metadata per exam module, keyed by the topic name in the bank. */
const MODULE_META = {
  'Advanced Domain Model Skills': {
    emoji: '📘',
    short: 'Domain Model',
    body: 'System entities, associations, indexes and date-time handling done properly.',
  },
  'Configure Advanced Security': {
    emoji: '🔒',
    short: 'Security',
    body: 'Module roles, entity access rules, XPath constraints and anonymous access.',
  },
  'Constrain Your Data Using Advanced XPath': {
    emoji: '🔍',
    short: 'Advanced XPath',
    body: 'Tokens, functions and constraints that filter data without killing performance.',
  },
  'Design and Publish a REST API': {
    emoji: '🌐',
    short: 'REST API',
    body: 'Published services, operations, status codes and authentication microflows.',
  },
  'Error Handling': {
    emoji: '⚠️',
    short: 'Error Handling',
    body: 'Rollback vs. continue, error variables and where transactions really end.',
  },
  'Master Modeling Microflows': {
    emoji: '⚙️',
    short: 'Microflows',
    body: 'Loops, sub-microflows, java actions and the patterns reviewers expect.',
  },
  'Track Application Behavior with Logging': {
    emoji: '📊',
    short: 'Logging',
    body: 'Log levels, log nodes, custom messages and reading production behaviour.',
  },
  'Win at Working with Data': {
    emoji: '🗄️',
    short: 'Working with Data',
    body: 'Retrieves, commits, caching and the data-heavy questions people lose marks on.',
  },
};

const FALLBACK_META = { emoji: '📕', short: '', body: 'A full module of the Advanced blueprint.' };

const moduleMeta = (topic) => MODULE_META[topic] ?? FALLBACK_META;

const TRUSTED_BY = ['Mendix', 'Siemens', 'Orangeleaf', 'CLEVR', 'Appronto', 'Flowfabric'];

const STATS = [
  { emoji: '🧠', value: `${QUESTIONS.length}`, label: 'Real exam questions' },
  { emoji: '🧩', value: `${TOPICS.length}`, label: 'Mendix modules covered' },
  { emoji: '🎯', value: `${PASS_THRESHOLD}%`, label: 'Pass threshold' },
];

const PRICING_FEATURES = [
  `Full access to all ${QUESTIONS.length} exam-style questions`,
  `All ${TOPICS.length} Advanced modules covered`,
  `${EXAM_MINUTES}-minute timed exam simulation`,
  'Detailed explanation for every single answer',
  'Topic-by-topic score breakdown',
  'Full knowledge base study guides included',
  'Lifetime access · unlimited retakes',
];

const FAQ = [
  {
    q: 'How does it work?',
    a: `You buy once, sign in with the email you paid with, and the simulator unlocks immediately. You sit a ${EXAM_MINUTES}-minute timed run of ${QUESTIONS.length} exam-style questions — one at a time, with a jump grid and a flag-for-review marker — and get a scored breakdown the moment you submit.`,
  },
  {
    q: 'What topics are covered?',
    a: `All ${TOPICS.length} modules of the Mendix Advanced blueprint: ${TOPICS.join(', ')}. Every question is tagged to its module, and every module ships with a full written study guide.`,
  },
  {
    q: 'How is the exam scored?',
    a: `Each question is worth one mark and you need ${PASS_THRESHOLD}% to pass — the same threshold as the real certification. Your result also breaks down module by module, so you can see exactly which topics would have failed you.`,
  },
  {
    q: 'Can I retake the quiz?',
    a: 'Yes — unlimited retakes, forever. There is no subscription and no renewal. Every attempt is scored and stored, so you can watch your weakest modules improve over time.',
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------------------------------------------------------- small pieces --- */

function CheckIcon({ className = 'text-accent-500' }) {
  return (
    <svg
      className={`mt-0.5 h-5 w-5 flex-none ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Decorative dot grid used to break up the flat colour blocks. */
function DotGrid({ className = '', dotClass = 'fill-white/25' }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 7 }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 17}
            cy={10 + row * 17}
            r="2.5"
            className={dotClass}
          />
        )),
      )}
    </svg>
  );
}

/**
 * Stylised mock of the exam screen. Used twice (dark hero, magenta feature
 * band) with different surface treatments.
 */
function QuizMockup({ tone = 'dark' }) {
  const dark = tone === 'dark';

  return (
    <div
      className={`overflow-hidden rounded-3xl border shadow-2xl ${
        dark ? 'border-white/10 bg-ink-900' : 'border-black/20 bg-ink-900 shadow-black/30'
      }`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 truncate font-mono text-[11px] tracking-wide text-white/40">
          exam · question 9 of {QUESTIONS.length}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-bold tracking-wide text-accent-300 uppercase">
            Error Handling
          </span>
          <span className="font-mono text-sm font-bold text-white">24:18</span>
        </div>

        {/* progress */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[56%] rounded-full bg-gradient-to-r from-accent-500 to-accent-300" />
        </div>

        <h3 className="mt-5 text-base leading-relaxed font-semibold text-white">
          Which error handling type rolls back everything up to the error and initiates a new
          transaction?
        </h3>

        <div className="mt-5 space-y-2.5">
          {[
            ['A', 'Custom without rollback', false],
            ['B', 'Custom with rollback', true],
            ['C', 'Error End Event', false],
            ['D', 'End Event', false],
          ].map(([letter, text, active]) => (
            <div
              key={letter}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                active
                  ? 'border-accent-500 bg-accent-500/15'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                  active ? 'bg-accent-500 text-white' : 'bg-white/10 text-white/50'
                }`}
              >
                {letter}
              </span>
              <span className={`text-sm ${active ? 'text-white' : 'text-white/60'}`}>{text}</span>
            </div>
          ))}
        </div>

        {/* question jump grid */}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={`h-6 w-6 rounded-md text-center text-[10px] leading-6 font-bold ${
                i === 8
                  ? 'bg-accent-500 text-white'
                  : i < 8
                    ? 'bg-white/15 text-white/70'
                    : 'bg-white/5 text-white/25'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- page --- */

export default function Landing() {
  const { hasPurchased } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const primaryHref = hasPurchased ? '/quiz' : '/checkout';
  const primaryLabel = hasPurchased ? 'Start your exam' : 'Start practicing now';

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (trimmed && !EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError('');
    navigate(trimmed ? `${primaryHref}?email=${encodeURIComponent(trimmed)}` : primaryHref);
  };

  return (
    <>
      {/* ============================================================ HERO === */}
      <section className="relative overflow-hidden bg-ink-900">
        {/* decorative wash + shapes */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_28rem_at_78%_-8%,var(--color-accent-500),transparent_65%)] opacity-40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden="true"
        />
        <DotGrid className="pointer-events-none absolute top-24 left-6 hidden h-28 w-28 lg:block" />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-accent-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              {TOPICS.length} modules · {QUESTIONS.length} questions · {EXAM_MINUTES} min
            </span>

            <h1 className="display-heading mt-6 text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Pass your Mendix{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-200 bg-clip-text text-transparent">
                Advanced
              </span>{' '}
              certification
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              De-risk your exam with science-backed practice assessments. Measure your Mendix
              knowledge with real exam questions.
            </p>

            <form onSubmit={handleHeroSubmit} className="mt-9 max-w-lg" noValidate>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="hero-email" className="sr-only">
                  Your email address
                </label>
                <input
                  id="hero-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  aria-invalid={emailError ? 'true' : undefined}
                  aria-describedby={emailError ? 'hero-email-error' : undefined}
                  className="w-full rounded-full border border-white/15 bg-white/10 px-6 py-3.5 text-base text-white placeholder:text-white/40 focus:border-accent-400 focus:bg-white/15 focus:outline-none sm:flex-1"
                />
                <button type="submit" className="btn-pill-accent shrink-0">
                  Try for free!
                </button>
              </div>
              {emailError && (
                <p id="hero-email-error" role="alert" className="mt-2.5 text-sm text-accent-300">
                  {emailError}
                </p>
              )}
              <p className="mt-3 text-sm text-white/45">
                {PRODUCT.priceLabel} once · lifetime access · no subscription
              </p>
            </form>
          </div>

          {/* Dashboard mockup */}
          <div className="relative lg:pl-6">
            <div
              className="pointer-events-none absolute -top-8 -right-6 h-28 w-28 rounded-full border-2 border-accent-500/30"
              aria-hidden="true"
            />
            <QuizMockup />
          </div>
        </div>
      </section>

      {/* ==================================================== SOCIAL PROOF === */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-center text-xs font-bold tracking-[0.2em] text-ink-500 uppercase">
            Trusted by Mendix developers worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {TRUSTED_BY.map((name) => (
              <span
                key={name}
                className="text-xl font-extrabold tracking-tight text-slate-300 grayscale transition hover:text-slate-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ FEATURE HIGHLIGHT === */}
      <section className="relative overflow-hidden bg-accent-500">
        <DotGrid className="pointer-events-none absolute right-8 bottom-8 hidden h-32 w-32 lg:block" />
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h2 className="display-heading text-4xl leading-[0.95] text-white sm:text-5xl">
              Master every module
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Every question is written from the official Advanced course material — same phrasing,
              same plausible-but-wrong distractors. Answer one, and the explanation cites the exact
              module it came from, so a wrong answer sends you straight to the right page.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'One question at a time, exactly like exam day',
                'Flag for review and jump between questions freely',
                'Module-by-module breakdown the second you submit',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white">
                  <CheckIcon className="text-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a href="#modules" className="btn-pill-light mt-9">
              Explore all modules
            </a>
          </div>

          <div className="lg:pl-6">
            <QuizMockup tone="light" />
          </div>
        </div>
      </section>

      {/* ============================================================ STATS === */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="display-heading mx-auto max-w-2xl text-center text-3xl text-ink-900 sm:text-4xl">
            The numbers you walk in with
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="text-3xl" aria-hidden="true">
                  {stat.emoji}
                </span>
                <p className="mt-4 text-6xl font-extrabold tracking-tighter text-accent-500">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold tracking-wide text-ink-500 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== MODULES === */}
      <section id="modules" className="scroll-mt-20 bg-accent-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">
              The blueprint
            </span>
            <h2 className="display-heading mt-3 text-3xl text-ink-900 sm:text-4xl">
              {TOPICS.length} modules, nothing skipped
            </h2>
            <p className="mt-4 text-lg text-ink-500">
              Every question is tagged to a module, and every module ships with a full written study
              guide you keep for life.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map((topic) => {
              const meta = moduleMeta(topic);
              return (
                <div
                  key={topic}
                  className="group rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent-200 hover:shadow-xl"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-2xl transition group-hover:bg-accent-100"
                    aria-hidden="true"
                  >
                    {meta.emoji}
                  </span>
                  <h3 className="mt-5 leading-snug font-bold text-ink-900">
                    {meta.short || topic}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{meta.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================== PRICING === */}
      <section id="pricing" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="display-heading text-3xl text-ink-900 sm:text-4xl">
              One payment. Lifetime access.
            </h2>
            <p className="mt-4 text-lg text-ink-500">
              No subscription, no renewals, no upsells. Buy it once, retake it forever.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-lg">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-accent-500/10 ring-1 ring-accent-500/20">
              <div className="bg-accent-500 px-6 py-3 text-center text-xs font-bold tracking-[0.2em] text-white uppercase">
                One-time payment
              </div>

              <div className="p-8 sm:p-10">
                <div className="flex items-end justify-center gap-3">
                  <span className="text-6xl font-extrabold tracking-tighter text-ink-900">
                    {PRODUCT.priceLabel}
                  </span>
                  <span className="mb-2.5 text-lg text-ink-500 line-through">
                    {PRODUCT.priceCompareLabel}
                  </span>
                </div>
                <p className="mt-2 text-center text-sm text-ink-500">{PRODUCT.currencyNote}</p>

                <ul className="mt-8 space-y-3.5">
                  {PRICING_FEATURES.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-ink-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to={primaryHref} className="btn-pill-accent mt-9 w-full">
                  {primaryLabel}
                </Link>

                <p className="mt-4 text-center text-xs text-ink-500">
                  Secure payment via Stripe · Instant access · No card details stored by us
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== FAQ === */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 className="display-heading text-center text-3xl text-ink-900 sm:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-accent-200 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-ink-900">
                  {item.q}
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent-50 text-lg leading-none text-accent-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== FOOTER CTA === */}
      <section className="relative overflow-hidden bg-accent-500">
        <DotGrid className="pointer-events-none absolute top-6 left-8 hidden h-24 w-24 lg:block" />
        <div
          className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="display-heading text-4xl leading-[0.95] text-white sm:text-5xl">
            Ready to ace your certification?
          </h2>
          <p className="mt-5 text-lg text-white/85">
            {PRODUCT.priceLabel} once. {QUESTIONS.length} questions. Unlimited retakes.
          </p>
          <Link to={primaryHref} className="btn-pill-dark mt-9">
            {hasPurchased ? 'Start your exam' : 'Start practicing'}
          </Link>
        </div>
      </section>

      {/* ========================================================== FOOTER === */}
      <footer className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-sm font-bold text-white">
                  MX
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-white">Mendix Advanced</span>
                  <span className="block text-xs text-white/50">Exam Simulator</span>
                </span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/50">
                Independent practice material for the Mendix Advanced Developer certification. Not
                affiliated with or endorsed by Mendix.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:gap-16">
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <a href="#modules" className="text-white/70 transition hover:text-accent-300">
                      Modules
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-white/70 transition hover:text-accent-300">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link to="/checkout" className="text-white/70 transition hover:text-accent-300">
                      Get access
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
                  Account
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link to="/login" className="text-white/70 transition hover:text-accent-300">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <a
                      href={`mailto:${PRODUCT.supportEmail}`}
                      className="text-white/70 transition hover:text-accent-300"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
            © {new Date().getFullYear()} {PRODUCT.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
