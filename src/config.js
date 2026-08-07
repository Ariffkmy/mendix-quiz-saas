/** Product / pricing presentation. The authoritative price lives in Stripe. */
export const PRODUCT = {
  name: 'Mendix Advanced — Exam Simulator',
  tagline: 'Pass Your Mendix Advanced Developer Certification',
  priceLabel: import.meta.env.VITE_PRICE_LABEL || '$9',
  priceCompareLabel: import.meta.env.VITE_PRICE_COMPARE_LABEL || '$29',
  currencyNote: 'One-time payment · lifetime access · no subscription',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@mendix-simulator.test',
};

/**
 * How many exams a free account may sit.
 *
 * This is a presentation constant only — the limit that actually holds is the
 * `can_attempt()` check behind the row-level security policy on quiz_attempts,
 * so editing this number does not hand anyone extra attempts.
 */
export const FREE_ATTEMPT_LIMIT = 1;

/** What each tier includes, rendered on the landing page and the dashboard. */
export const TIER_FEATURES = {
  free: [
    'Full 100-question timed exam',
    'All 8 Advanced modules included',
    'One attempt, on the house',
    'Exam-day interface: timer, flags, jump grid',
  ],
  paid: [
    'Unlimited exam attempts, forever',
    'Your score and pass/fail verdict',
    'Topic-by-topic performance breakdown',
    'Every missed question, with the explanation',
    'Analytics dashboard tracking progress over time',
    'Full knowledge base study guides',
  ],
};

/** Locked to free accounts — the upgrade pitch, in one list. */
export const PAID_ONLY_FEATURES = [
  'See your score',
  'Pass or fail verdict',
  'Topic breakdown',
  'Missed-question review',
  'Unlimited retakes',
  'Progress analytics',
];
