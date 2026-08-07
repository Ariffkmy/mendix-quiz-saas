import { Link } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { EXAM_MINUTES, PASS_THRESHOLD, QUESTIONS, TOPICS } from '../data/questions';

const FEATURES = [
  {
    title: `All ${TOPICS.length} exam modules`,
    body: 'Every module on the Advanced blueprint — domain model, security, XPath, REST, error handling, microflows, logging and data performance.',
    icon: 'grid',
  },
  {
    title: `${QUESTIONS.length}+ exam-style questions`,
    body: 'Written from the official course material, in the same phrasing and distractor style the real exam uses.',
    icon: 'list',
  },
  {
    title: 'A reason for every answer',
    body: 'Each explanation cites the exact module it comes from, so a wrong answer sends you straight to the right page of the material.',
    icon: 'book',
  },
  {
    title: 'Topic-by-topic breakdown',
    body: 'See which modules you are weakest in before you sit the real exam, not after you fail it.',
    icon: 'chart',
  },
  {
    title: `${EXAM_MINUTES}-minute timed simulation`,
    body: 'One question at a time, a jump grid, a flag-for-review marker and a countdown — the exam-day experience.',
    icon: 'clock',
  },
  {
    title: 'Full knowledge base included',
    body: `${TOPICS.length} in-depth study guides bundled with your purchase, so revision and practice live in one place.`,
    icon: 'docs',
  },
];

const ICONS = {
  grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z',
  chart: 'M5 20V10M12 20V4M19 20v-7',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  docs: 'M14 3v5h5M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-4-4Z',
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-none text-brand-600"
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

const TESTIMONIALS = [
  {
    quote:
      'The per-topic breakdown told me my XPath and security were fine but my error handling was a coin flip. Two evenings on that module and I passed with room to spare.',
    name: 'Priya N.',
    role: 'Mendix Developer, logistics',
  },
  {
    quote:
      "The explanations are the real product. Every one points at the module it came from, so I never had to guess where I'd gone wrong.",
    name: 'Daniel A.',
    role: 'Solution Architect',
  },
  {
    quote:
      'Closest thing to the real exam I found — the distractors are plausible in the same annoying way. Worth far more than the price.',
    name: 'Marcus L.',
    role: 'Senior Mendix Consultant',
  },
];

const FAQ = [
  {
    q: 'Is this the real certification exam?',
    a: 'No. This is an independent practice simulator built from the Advanced course material. It is not affiliated with or endorsed by Mendix, and passing here does not grant certification — it tells you whether you are ready to sit the real thing.',
  },
  {
    q: 'How long do I have access?',
    a: 'Forever. It is a single one-time payment with no subscription and no renewal. Retake the exam as many times as you like.',
  },
  {
    q: 'Can I retake the exam?',
    a: 'Yes, unlimited retakes. Every attempt is scored and kept, so you can watch your weak modules improve over time.',
  },
  {
    q: 'What if I already have an account?',
    a: 'Sign in with the same email you paid with and the exam unlocks automatically — access is tied to your email address.',
  },
];

export default function Landing() {
  const { hasPurchased } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_70%_-10%,var(--color-brand-100),transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {TOPICS.length} modules · {QUESTIONS.length} questions · {EXAM_MINUTES} minutes
            </span>

            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight text-balance text-ink-900 sm:text-5xl">
              {PRODUCT.tagline}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
              A timed, exam-realistic practice run across all eight Advanced modules. Find out
              exactly which topics will fail you — before exam day, not after.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {hasPurchased ? (
                <Link to="/quiz" className="btn-primary px-7 py-3 text-base">
                  Start your exam
                </Link>
              ) : (
                <Link to="/checkout" className="btn-primary px-7 py-3 text-base">
                  Get instant access — {PRODUCT.priceLabel}
                </Link>
              )}
              <a href="#pricing" className="btn-secondary px-7 py-3 text-base">
                See what's included
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              {[
                [`${TOPICS.length}`, 'Modules covered'],
                [`${PASS_THRESHOLD}%`, 'Pass threshold'],
                ['∞', 'Retakes included'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold text-ink-900">{value}</dt>
                  <dd className="mt-0.5 text-sm text-ink-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Question preview */}
          <div className="relative">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  Error Handling
                </span>
                <span className="font-mono text-sm font-semibold text-ink-500">24:18</span>
              </div>
              <div className="p-6">
                <p className="text-xs font-medium text-ink-500">Question 9 of {QUESTIONS.length}</p>
                <h3 className="mt-2 text-base leading-relaxed font-semibold text-ink-900">
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
                      className={`flex items-center gap-3 rounded-xl border p-3.5 ${
                        active
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                          : 'border-slate-200'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border text-xs font-bold ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 text-ink-500'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm text-ink-900">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-ink-500">
              Actual exam interface — one question at a time, no distractions.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-ink-900">
            Everything you need to walk in confident
          </h2>
          <p className="mt-3 text-lg text-ink-500">
            Built from the official Advanced course material, not from memory dumps.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">The eight modules</h2>
          <p className="mt-3 text-ink-500">
            Every question is tagged to a module, and every module ships with a full study guide.
          </p>

          <ol className="mt-8 grid gap-3 sm:grid-cols-2">
            {TOPICS.map((topic, i) => (
              <li
                key={topic}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-medium text-ink-900">{topic}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            One payment. Lifetime access.
          </h2>
          <p className="mt-3 text-ink-500">
            No subscription, no renewals, no upsells. Buy it once, retake it forever.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <div className="card overflow-hidden ring-2 ring-brand-600">
            <div className="bg-brand-600 px-6 py-2.5 text-center text-sm font-semibold text-white">
              Full exam simulator
            </div>

            <div className="p-8">
              <div className="flex items-end justify-center gap-3">
                <span className="text-5xl font-extrabold tracking-tight text-ink-900">
                  {PRODUCT.priceLabel}
                </span>
                <span className="mb-2 text-lg text-ink-500 line-through">
                  {PRODUCT.priceCompareLabel}
                </span>
              </div>
              <p className="mt-2 text-center text-sm text-ink-500">{PRODUCT.currencyNote}</p>

              <ul className="mt-8 space-y-3.5">
                {[
                  `All ${QUESTIONS.length} exam-style questions`,
                  `All ${TOPICS.length} Advanced modules covered`,
                  `${EXAM_MINUTES}-minute timed exam simulation`,
                  'Detailed explanation for every question',
                  'Topic-by-topic score breakdown',
                  'Full knowledge base study guides',
                  'Unlimited retakes, forever',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-ink-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={hasPurchased ? '/quiz' : '/checkout'}
                className="btn-primary mt-8 w-full py-3 text-base"
              >
                {hasPurchased ? 'Start your exam' : `Get access — ${PRODUCT.priceLabel}`}
              </Link>

              <p className="mt-4 text-center text-xs text-ink-500">
                Secure payment via Stripe · Instant access · No card details stored by us
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            Developers who stopped guessing
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card flex flex-col p-6">
                <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5Z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4">
                  <span className="block font-semibold text-ink-900">{t.name}</span>
                  <span className="block text-sm text-ink-500">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-slate-200 pt-8 text-sm text-ink-500">
            <span>🔒 Payments secured by Stripe</span>
            <span>⚡ Instant access after checkout</span>
            <span>♾️ Lifetime access, unlimited retakes</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-ink-900">Questions, answered</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink-900">
                {item.q}
                <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-500">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand-700">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white">
            Find your weak modules today, not on exam day.
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            {PRODUCT.priceLabel} once. {QUESTIONS.length} questions. Unlimited retakes.
          </p>
          <Link
            to={hasPurchased ? '/quiz' : '/checkout'}
            className="btn mt-8 bg-white px-8 py-3 text-base text-brand-700 hover:bg-brand-50"
          >
            {hasPurchased ? 'Start your exam' : 'Get instant access'}
          </Link>
        </div>
      </section>
    </>
  );
}
