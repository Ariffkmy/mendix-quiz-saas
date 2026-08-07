import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for the payment endpoints.'
  );
}

/**
 * Server-side Supabase client.
 *
 * The service-role key bypasses row-level security, so it must only ever be
 * used from these serverless functions — never bundled into the browser.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Normalize an email for storage and lookup. */
export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

/**
 * Mark a purchase paid from a completed Checkout Session.
 *
 * Both the webhook and the /success reconciliation call this, so it is written
 * to be idempotent — replaying the same session is a no-op.
 */
export async function fulfillCheckoutSession(session) {
  const email = normalizeEmail(
    session.customer_details?.email ?? session.customer_email ?? session.metadata?.email
  );

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const patch = {
    email,
    status: 'paid',
    amount_total: session.amount_total,
    currency: session.currency,
    stripe_payment_intent: paymentIntentId,
    paid_at: new Date().toISOString(),
  };

  // Link the purchase to an existing auth user when the buyer already has one.
  const userId = await findUserIdByEmail(email);
  if (userId) patch.user_id = userId;

  const { data, error } = await supabaseAdmin
    .from('purchases')
    .update(patch)
    .eq('stripe_session_id', session.id)
    .select('id, email')
    .maybeSingle();

  if (error) throw new Error(`Failed to record purchase: ${error.message}`);

  // The pending row is normally created at checkout time, but a session created
  // outside this app (or a lost row) still deserves fulfillment.
  if (!data) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({ ...patch, stripe_session_id: session.id })
      .select('id, email')
      .single();

    if (insertError) throw new Error(`Failed to record purchase: ${insertError.message}`);
    return inserted;
  }

  return data;
}

/** Look up an auth user id by email, or null if they have not signed up yet. */
export async function findUserIdByEmail(email) {
  const target = normalizeEmail(email);
  if (!target) return null;

  // listUsers is paginated; the buyer is almost always on an early page, and
  // the DB trigger in the migration backfills user_id on signup regardless.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;

    const match = data.users.find((u) => normalizeEmail(u.email) === target);
    if (match) return match.id;

    if (data.users.length < 200) return null;
  }

  return null;
}
