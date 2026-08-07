import { appOrigin, buildLineItem, stripe } from './_lib/stripe.js';
import { normalizeEmail, supabaseAdmin } from './_lib/supabaseAdmin.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/create-checkout-session
 * body: { email }
 * -> { url, sessionId, purchaseId }
 *
 * Creates a pending purchase row, then a Stripe Checkout Session for a
 * one-time payment. The row is only flipped to `paid` by Stripe's webhook (or
 * the /success reconciliation), never by the browser.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = normalizeEmail(req.body?.email);

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Already bought? Don't let them pay twice.
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('email', email)
      .eq('status', 'paid')
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'This email already has access. Sign in with your email to start the exam.',
      });
    }

    const { data: purchase, error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({ email, status: 'pending' })
      .select('id')
      .single();

    if (insertError) {
      return res.status(500).json({ error: `Could not create the order: ${insertError.message}` });
    }

    const origin = appOrigin(req);

    // NOTE: payment_method_types is deliberately omitted so Stripe can surface
    // the payment methods most likely to convert for each buyer.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [buildLineItem()],
      customer_email: email,
      client_reference_id: purchase.id,
      metadata: { purchase_id: purchase.id, email },
      payment_intent_data: { metadata: { purchase_id: purchase.id, email } },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      allow_promotion_codes: true,
    });

    await supabaseAdmin
      .from('purchases')
      .update({ stripe_session_id: session.id })
      .eq('id', purchase.id);

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      purchaseId: purchase.id,
    });
  } catch (err) {
    console.error('create-checkout-session failed:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
