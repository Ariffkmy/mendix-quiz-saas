import { Link } from 'react-router-dom';

import { PRODUCT } from '../../config';
import LegalLayout, { Fill, H2, LI, P, UL } from './LegalLayout.jsx';

export default function Refunds() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      summary="Full access is a one-time purchase, not a subscription — there is nothing to cancel. This page explains when you can get your money back."
    >
      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <p className="font-semibold text-ink-900">The short version</p>
        <p className="mt-2 leading-relaxed text-ink-700">
          Email{' '}
          <a href={`mailto:${PRODUCT.supportEmail}`} className="font-medium text-brand-600 hover:text-brand-700">
            {PRODUCT.supportEmail}
          </a>{' '}
          within <Fill>14 days</Fill> of buying and we will refund you in full, no questions asked.
          After that, we still refund anything that is our fault.
        </p>
      </div>

      <H2 id="no-subscription">1. Nothing recurring to cancel</H2>
      <P>
        Full access costs {PRODUCT.priceLabel} once. There is no subscription, no renewal, no trial
        that converts into a charge, and no stored card. You will never be billed again, so there is
        no cancellation step to remember.
      </P>

      <H2 id="guarantee">
        2. Our <Fill>14-day</Fill> money-back guarantee
      </H2>
      <P>
        If the Service is not what you expected, email us within <Fill>14 days</Fill> of your purchase
        from the address on your account and we will refund the full amount. You do not need to give a
        reason. We may ask what went wrong, but only so we can fix it — an answer is not a condition of
        the refund.
      </P>
      <P>
        We offer this even though, strictly, we would be entitled to withhold it once you have used the
        paid features (see section 4). We would rather have your goodwill than your {PRODUCT.priceLabel}.
      </P>

      <H2 id="always">3. Refunds we give at any time</H2>
      <P>Regardless of how long ago you bought, we refund in full where:</P>
      <UL>
        <LI>you were charged twice for the same access;</LI>
        <LI>
          payment succeeded but access was never granted, and we cannot fix it within{' '}
          <Fill>3 business days</Fill>;
        </LI>
        <LI>
          the Service is substantially unavailable or broken for an extended period and we cannot
          restore it;
        </LI>
        <LI>we permanently withdraw the Service — see the "lifetime access" clause in the Terms;</LI>
        <LI>the charge was not authorised by you, and Stripe confirms it.</LI>
      </UL>

      <H2 id="withdrawal">4. Your statutory right of withdrawal (EU / UK consumers)</H2>
      <P>
        Consumers in the EU and UK normally have 14 days to withdraw from a distance contract without
        reason. For digital content supplied immediately, that right is lost once supply begins —
        provided you gave your express consent to immediate supply and acknowledged losing the right.
      </P>
      <P>
        Because access is unlocked the moment Stripe confirms payment, we ask you to give exactly that
        consent at checkout by ticking the box next to it. Even where the statutory right has ended
        this way, our own <Fill>14-day</Fill> guarantee in section 2 still applies — it is more
        generous than the law requires, and it is not affected.
      </P>
      <P>
        Nothing here removes your rights under mandatory consumer law where you live, including the
        right to a remedy if what you received was not as described or not of satisfactory quality.
      </P>

      <H2 id="not-refundable">5. When we may decline</H2>
      <P>
        Outside the guarantee window, we may decline a refund where the request appears abusive —
        for example an account that has bulk-downloaded the question bank, shared credentials, or
        repeatedly bought and refunded. We will always tell you why.
      </P>
      <P>
        Failing the official Mendix certification is not itself a ground for a refund. This is
        practice material, and no practice product can guarantee an exam result — see the{' '}
        <Link to="/disclaimer" className="font-medium text-brand-600 hover:text-brand-700">
          Disclaimer
        </Link>
        .
      </P>

      <H2 id="how">6. How to request one</H2>
      <UL>
        <LI>
          Email{' '}
          <a href={`mailto:${PRODUCT.supportEmail}`} className="font-medium text-brand-600 hover:text-brand-700">
            {PRODUCT.supportEmail}
          </a>{' '}
          from the address you used at checkout.
        </LI>
        <LI>Include the date of purchase, or the receipt Stripe emailed you.</LI>
        <LI>We reply within <Fill>2 business days</Fill> and approve or explain.</LI>
      </UL>

      <H2 id="processing">7. How the money comes back</H2>
      <P>
        Refunds are issued through Stripe to the original payment method — we cannot send them
        anywhere else. We process approved refunds within <Fill>5 business days</Fill>; your bank
        then typically takes a further 5 to 10 business days to show it. The full amount is returned,
        including any tax charged. We do not deduct payment-processing fees from your refund.
      </P>
      <P>
        Once a refund is issued, access to the paid features ends and your account reverts to the free
        tier. Your exam history is retained but the scores become unreadable to you again.
      </P>

      <H2 id="chargebacks">8. Chargebacks</H2>
      <P>
        Please email us before disputing a charge with your bank. A chargeback costs us a fee on top of
        the refund and takes weeks to resolve, whereas we can usually refund you the same day. We
        contest chargebacks only where the account shows substantial use of the paid features and no
        prior contact with us.
      </P>

      <P>
        This policy forms part of our{' '}
        <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
          Terms of Service
        </Link>
        .
      </P>
    </LegalLayout>
  );
}
