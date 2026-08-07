import { stripe } from './_lib/stripe.js';
import { fulfillCheckoutSession, normalizeEmail } from './_lib/supabaseAdmin.js';

/**
 * POST /api/verify-session
 * body: { sessionId }
 * -> { paid, email, purchaseId }
 *
 * The browser reaches /success before the webhook usually lands, so this
 * re-reads the session straight from Stripe and fulfills it if it is paid.
 * Payment status comes from Stripe, never from the client.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.body?.sessionId;

  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'A valid Stripe session id is required.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        paid: false,
        email: normalizeEmail(session.customer_details?.email ?? session.customer_email),
      });
    }

    const purchase = await fulfillCheckoutSession(session);

    return res.status(200).json({
      paid: true,
      email: purchase.email,
      purchaseId: purchase.id,
    });
  } catch (err) {
    console.error('verify-session failed:', err);

    if (err?.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'That checkout session could not be found.' });
    }
    return res.status(500).json({ error: 'Could not verify the payment. Please try again.' });
  }
}
