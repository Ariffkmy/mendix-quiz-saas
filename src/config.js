/** Product presentation. Free for everyone — there is no paid tier. */
export const PRODUCT = {
  name: 'Mendix Advanced — Exam Simulator',
  tagline: 'Pass Your Mendix Advanced Developer Certification',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@mendix-simulator.test',
};

/** What every account gets, rendered on the landing page and the dashboard. */
export const FEATURES = [
  'Full 100-question timed exam',
  'All 8 Advanced modules included',
  'Unlimited attempts, forever',
  'Your score and pass/fail verdict',
  'Topic-by-topic performance breakdown',
  'Every missed question, with the explanation',
  'Analytics dashboard tracking progress over time',
  'Full knowledge base study guides',
];

/**
 * Fallback module list and question count for the marketing pages.
 *
 * The authoritative numbers live in Supabase (`public.topics`), and
 * useExamOverview() hydrates from there. These exist so the landing page and
 * register render real copy on first paint — and still render if Supabase is
 * unreachable — rather than flashing "0 questions".
 *
 * Keep in step with src/data/questions.md; the seed script is what makes the
 * database match it.
 */
export const EXAM_OVERVIEW_FALLBACK = {
  questionCount: 100,
  topics: [
    'Advanced Domain Model Skills',
    'Configure Advanced Security',
    'Constrain Your Data Using Advanced XPath',
    'Design and Publish a REST API',
    'Error Handling',
    'Master Modeling Microflows',
    'Track Application Behavior with Logging',
    'Win at Working with Data',
  ],
};
