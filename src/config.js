/** Product / pricing presentation. The authoritative price lives in Stripe. */
export const PRODUCT = {
  name: 'Mendix Advanced — Exam Simulator',
  tagline: 'Pass Your Mendix Advanced Developer Certification',
  priceLabel: import.meta.env.VITE_PRICE_LABEL || 'RM 29',
  priceCompareLabel: import.meta.env.VITE_PRICE_COMPARE_LABEL || 'RM 79',
  currencyNote: 'One-time payment · lifetime access · no subscription',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@mendix-simulator.test',
};
