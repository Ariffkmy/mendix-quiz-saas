/**
 * Local development escape hatch: show the real score after submitting instead
 * of the blind free-tier confirmation, without paying or signing in.
 *
 * `import.meta.env.DEV` is true under `npm run dev` and false in any production
 * build, so this cannot ship enabled by accident. Set VITE_UNLOCK_RESULTS=true
 * to get the same behaviour from a local `npm run preview` of a real build.
 *
 * This only affects what the client renders. It is not a way around the server:
 * row-level security still refuses to hand a stored attempt to a free account,
 * so an unlocked page falls back to the result held in this browser.
 */
export const RESULTS_UNLOCKED =
  import.meta.env.DEV || import.meta.env.VITE_UNLOCK_RESULTS === 'true';

/**
 * Trader identity, published on every legal page.
 *
 * This is not decoration. An online seller must identify itself: EU e-Commerce
 * Directive art. 5 and the Consumer Rights Directive, the UK equivalents, and
 * Malaysia's Electronic Commerce Act 2006 s.6 all require a name, a geographic
 * address and a working electronic contact before you take money. Stripe checks
 * for the same details when it reviews a live account.
 *
 * ⚠️ EVERY VALUE BELOW IS A PLACEHOLDER. Fill them in — via the env vars, or by
 * editing the fallbacks — before switching Stripe out of test mode. Shipping a
 * "[Your …]" string to a paying customer is worse than shipping nothing.
 */
export const BUSINESS = {
  /** Registered company name, or your own full legal name if a sole trader. */
  legalName: import.meta.env.VITE_BUSINESS_LEGAL_NAME || '[Your registered business name]',
  /** Trading name shown to customers. Safe to leave as the product name. */
  tradingName: import.meta.env.VITE_BUSINESS_TRADING_NAME || 'Mendix Exam Simulator',
  /** Company / business registration number, if you have one. */
  registrationNumber: import.meta.env.VITE_BUSINESS_REG_NO || '',
  /** Full postal address. A PO box is not sufficient in the EU/UK. */
  address: import.meta.env.VITE_BUSINESS_ADDRESS || '[Street address, city, postcode, country]',
  /** Country whose law governs the contract and whose courts hear disputes. */
  country: import.meta.env.VITE_BUSINESS_COUNTRY || 'Malaysia',
  /** Where privacy questions and data-subject requests go. */
  privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || '',
  /** Sales-tax / VAT / SST number, if you are registered. Blank if not. */
  taxNumber: import.meta.env.VITE_BUSINESS_TAX_NO || '',
};

/**
 * The date the current wording of the legal pages took effect.
 *
 * Bump it whenever you change the substance of a policy — a dated version is
 * what lets you show which terms a given customer agreed to.
 */
export const LEGAL_EFFECTIVE_DATE = '6 September 2026';

/** Product / pricing presentation. The authoritative price lives in Stripe. */
export const PRODUCT = {
  name: 'Mendix Exam Simulator',
  tagline: 'Prepare for Mendix Intermediate and Advanced Developer Certification',
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
    'Choose Intermediate or Advanced — no time limit',
    'Balanced topic coverage for the selected exam',
    'No account, no card — start instantly',
    'Exam-day interface: flags, jump grid',
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
