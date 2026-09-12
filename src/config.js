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

/**
 * Trader identity, published on every legal page.
 *
 * This is not decoration. An online service must identify itself: EU e-Commerce
 * Directive art. 5, the UK equivalent, and Malaysia's Electronic Commerce Act
 * 2006 s.6 all require a name, a geographic address and a working electronic
 * contact.
 *
 * The product is free, so the consumer-contract rules bite less hard than they
 * would on a paid sale — but the identification duty applies to a commercial
 * online service either way, and the privacy policy needs a real controller to
 * name.
 *
 * ⚠️ EVERY VALUE BELOW IS A PLACEHOLDER. Fill them in — via the env vars, or by
 * editing the fallbacks. Shipping a "[Your …]" string to a real visitor is
 * worse than shipping nothing.
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
export const LEGAL_EFFECTIVE_DATE = '12 September 2026';
