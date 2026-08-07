import { stripe } from './_lib/stripe.js';
import { fulfillCheckoutSession, supabaseAdmin } from './_lib/supabaseAdmin.js';

// Signature verification needs the exact bytes Stripe sent, so the platform
// body parser must stay out of the way.
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * POST /api/stripe-webhook
 *
 * The authoritative fulfillment path. Access is granted here, on a
 * signature-verified event from Stripe — not on a browser redirect, which a
 * user could forge or simply never complete.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — refusing to process webhooks.');
    return res.status(500).json({ error: 'Webhook is not configured.' });
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    // A bad signature means the request did not come from Stripe.
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await fulfillCheckoutSession(session);
        }
        break;
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const session = event.data.object;
        await supabaseAdmin
          .from('purchases')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id)
          .eq('status', 'pending');
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          await supabaseAdmin
            .from('purchases')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent', paymentIntentId);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying them.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // A 500 tells Stripe to retry — the handlers above are idempotent.
    console.error(`Failed to handle ${event.type}:`, err);
    return res.status(500).json({ error: 'Webhook handler failed.' });
  }
}
