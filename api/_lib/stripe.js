import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set. Add it to your environment variables.');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-06-24.dahlia',
  appInfo: { name: 'Mendix Advanced Exam Simulator', version: '1.0.0' },
});

/**
 * Public origin used to build Stripe's return URLs.
 * Falls back to the deployment URL Vercel injects.
 */
export function appOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const proto = req.headers['x-forwarded-proto'] ?? 'http';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  return `${proto}://${host}`;
}

/**
 * The line item to charge for.
 *
 * Prefer STRIPE_PRICE_ID — a Price created in the Stripe Dashboard is the
 * single source of truth for what the product costs. The inline fallback keeps
 * the app runnable before that Price exists.
 */
export function buildLineItem() {
  if (process.env.STRIPE_PRICE_ID) {
    return { price: process.env.STRIPE_PRICE_ID, quantity: 1 };
  }

  return {
    quantity: 1,
    price_data: {
      currency: (process.env.PRICE_CURRENCY ?? 'myr').toLowerCase(),
      // Minor units — 2900 = RM 29.00
      unit_amount: Number(process.env.PRICE_AMOUNT ?? 2900),
      product_data: {
        name: 'Mendix Advanced — Exam Simulator',
        description:
          'Lifetime access to the full practice exam, explanations, topic breakdowns and study guides.',
      },
    },
  };
}
