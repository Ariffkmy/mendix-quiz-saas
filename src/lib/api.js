/**
 * Thin client for the serverless functions in /api.
 *
 * Stripe's secret key must never reach the browser, so every Stripe call goes
 * through these endpoints.
 */

async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || `Request to ${path} failed (${res.status})`);
  }
  return payload;
}

/**
 * Create a Stripe Checkout Session for a one-time exam purchase.
 * @returns {Promise<{ url: string, sessionId: string, purchaseId: string }>}
 */
export function createCheckoutSession(email) {
  return postJson('/api/create-checkout-session', { email });
}

/**
 * Confirm a completed Checkout Session and mark the purchase as paid.
 *
 * The Stripe webhook is the authoritative path, but redirects often land here
 * before the webhook is delivered, so this endpoint reconciles on demand.
 *
 * @returns {Promise<{ paid: boolean, email: string, purchaseId: string }>}
 */
export function verifyCheckoutSession(sessionId) {
  return postJson('/api/verify-session', { sessionId });
}
