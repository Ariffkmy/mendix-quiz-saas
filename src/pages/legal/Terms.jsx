import { Link } from 'react-router-dom';

import { BUSINESS, FREE_ATTEMPT_LIMIT, PRODUCT } from '../../config';
import { PASS_THRESHOLD, QUESTIONS } from '../../data/questions';
import LegalLayout, { Biz, Fill, H2, LI, P, UL } from './LegalLayout.jsx';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      summary="The agreement between you and us when you use the exam simulator or buy full access. Please read it before paying — buying is the point at which it binds you."
    >
      <H2 id="who-we-are">1. Who you are contracting with</H2>
      <P>
        {PRODUCT.name} ("the Service") is operated by <Biz field="legalName" fallback="[registered business name]" />
        {BUSINESS.registrationNumber && <> (registration no. {BUSINESS.registrationNumber})</>}, of{' '}
        <Biz field="address" fallback="[full postal address]" /> ("we", "us", "our"). You can reach us
        at{' '}
        <a href={`mailto:${PRODUCT.supportEmail}`} className="font-medium text-brand-600 hover:text-brand-700">
          {PRODUCT.supportEmail}
        </a>
        . Full details are on the{' '}
        <Link to="/contact" className="font-medium text-brand-600 hover:text-brand-700">
          contact page
        </Link>
        .
      </P>

      <H2 id="acceptance">2. Accepting these terms</H2>
      <P>
        By using the Service you agree to these terms. If you do not agree, do not use it. We ask you
        to tick a box confirming your agreement before you pay and before you create an account, so
        that the point of acceptance is recorded.
      </P>
      <P>
        You must be at least 16 years old, or the age of digital consent in your country if that is
        higher, to create an account or make a purchase.
      </P>

      <H2 id="what-you-get">3. What the Service is</H2>
      <P>
        The Service is a practice-exam simulator: a bank of {QUESTIONS.length} multiple-choice
        questions written as practice for Mendix Intermediate and Advanced Developer certification,
        together with written study guides, scoring and progress analytics.
      </P>
      <UL>
        <LI>
          <strong>Free tier.</strong> You may sit the exam without an account. A free registered
          account may submit {FREE_ATTEMPT_LIMIT === 1 ? 'one exam' : `${FREE_ATTEMPT_LIMIT} exams`}.
          The free tier deliberately does <em>not</em> return your score, your pass/fail verdict, the
          correct answers or the explanations.
        </LI>
        <LI>
          <strong>Full access.</strong> A single payment of {PRODUCT.priceLabel} unlocks unlimited
          attempts, your scores, the {PASS_THRESHOLD}% pass/fail verdict, per-module breakdowns,
          answer explanations, the study guides and the analytics dashboard.
        </LI>
      </UL>

      <H2 id="lifetime">4. What "lifetime access" means</H2>
      <P>
        Full access is a one-time purchase with no renewal and no subscription. "Lifetime" means for
        as long as we operate the Service — it is not a promise to operate it forever, which no
        business can honestly make. If we decide to shut the Service down permanently, we will give
        you at least <Fill>90 days'</Fill> notice by email and offer a pro-rata refund to anyone who
        purchased within the preceding <Fill>12 months</Fill>.
      </P>

      <H2 id="payment">5. Price and payment</H2>
      <UL>
        <LI>
          The price shown at checkout, in the stated currency, is the price you pay. Taxes are
          calculated and displayed by Stripe at checkout where they apply.
        </LI>
        <LI>
          Payment is processed by Stripe, Inc. and its group companies. We never receive or store
          your card number, CVC or expiry date — those go directly to Stripe. Stripe's own terms and
          privacy notice apply to that part of the transaction.
        </LI>
        <LI>
          Access is granted on Stripe's confirmation that the payment succeeded, normally within
          seconds and always within one business day.
        </LI>
        <LI>
          Access is tied to the email address you enter at checkout. Keep it accurate — it is how we
          identify your purchase.
        </LI>
      </UL>
      <P>
        Cancellation and refunds are covered separately in the{' '}
        <Link to="/refunds" className="font-medium text-brand-600 hover:text-brand-700">
          Refund Policy
        </Link>
        , which forms part of these terms.
      </P>

      <H2 id="licence">6. Your licence, and its limits</H2>
      <P>
        We grant you a personal, non-exclusive, non-transferable, revocable licence to use the
        Service and its content for your own study. One purchase is for one individual.
      </P>
      <P>You may not:</P>
      <UL>
        <LI>
          copy, republish, sell, sub-licence, or otherwise redistribute the questions, explanations or
          study guides, in whole or in part, in any medium;
        </LI>
        <LI>share your account credentials, or use one purchase to provide access to a team or class;</LI>
        <LI>
          scrape, crawl, bulk-download or use automated means to extract the question bank, or attempt
          to enumerate it through repeated attempts;
        </LI>
        <LI>
          circumvent, or attempt to circumvent, the tier restrictions, the attempt limits, the
          authentication, or any other technical protection measure;
        </LI>
        <LI>
          probe, load-test, or attack the Service or its infrastructure, or use it to store or
          transmit unlawful material;
        </LI>
        <LI>
          use the content to train, fine-tune or evaluate a machine-learning model, or to build a
          competing product.
        </LI>
      </UL>
      <P>
        We may suspend or terminate access, without refund, where we reasonably believe you have
        materially breached this section. Where the breach is capable of being remedied we will tell
        you what is wrong and give you a reasonable chance to fix it first.
      </P>

      <H2 id="ip">7. Intellectual property</H2>
      <P>
        All questions, explanations, study guides, code, design and branding on the Service are owned
        by us or licensed to us, and are protected by copyright. Nothing in these terms transfers any
        ownership to you.
      </P>
      <P>
        "Mendix" and "Siemens" are trademarks of their respective owners. We are not affiliated with,
        authorised by, sponsored by or endorsed by them — see the{' '}
        <Link to="/disclaimer" className="font-medium text-brand-600 hover:text-brand-700">
          Disclaimer
        </Link>
        . Our material is independently written and is not reproduced from official Mendix
        courseware, exam papers or documentation.
      </P>

      <H2 id="accounts">8. Your account</H2>
      <P>
        You are responsible for keeping your password confidential and for everything done through
        your account. Tell us promptly at{' '}
        <a href={`mailto:${PRODUCT.supportEmail}`} className="font-medium text-brand-600 hover:text-brand-700">
          {PRODUCT.supportEmail}
        </a>{' '}
        if you believe it has been compromised. You may delete your account at any time — see the{' '}
        <Link to="/privacy" className="font-medium text-brand-600 hover:text-brand-700">
          Privacy Policy
        </Link>{' '}
        for what happens to your data when you do.
      </P>

      <H2 id="no-guarantee">9. No guarantee of exam success</H2>
      <P>
        This is practice material, not the certification and not a substitute for it. We do not
        guarantee that using the Service will result in you passing a Mendix Developer
        exam, or any other exam. Your score here predicts nothing about your official result. We do
        not warrant that the material is free of error, complete, or current with the latest version
        of the official exam blueprint.
      </P>

      <H2 id="availability">10. Availability</H2>
      <P>
        We aim to keep the Service available but do not promise uninterrupted access. It may be
        unavailable for maintenance, or because of failures at our hosting, database or payment
        providers. We provide the Service "as is" and "as available", and — to the extent the law
        allows — exclude all implied warranties.
      </P>

      <H2 id="liability">11. Limitation of liability</H2>
      <P>
        Nothing in these terms limits our liability for death or personal injury caused by our
        negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot
        lawfully be limited. Your statutory rights as a consumer are unaffected.
      </P>
      <P>
        Subject to that: we are not liable for indirect or consequential loss, loss of profit, loss of
        opportunity, exam fees, or the cost of retaking a certification; and our total liability to
        you for all claims connected with the Service is limited to the amount you actually paid us in
        the twelve months before the claim arose.
      </P>

      <H2 id="changes">12. Changes to these terms</H2>
      <P>
        We may update these terms. The "last updated" date at the top always reflects the current
        version. If a change materially reduces what you get for a purchase you have already made, we
        will email you at least 30 days before it takes effect, and you may ask for a refund if you do
        not accept it. Continuing to use the Service after a change takes effect means you accept it.
      </P>
      <P>
        We may also change the price of full access at any time. A price change never affects a
        purchase already completed.
      </P>

      <H2 id="law">13. Governing law and disputes</H2>
      <P>
        These terms are governed by the laws of <Biz field="country" fallback="[country]" />, and the
        courts of <Biz field="country" fallback="[country]" /> have jurisdiction.
      </P>
      <P>
        If you are a consumer resident in the EU, the UK, or another country whose law gives you the
        protection of your local mandatory consumer rules and the right to bring proceedings in your
        local courts, this clause does not take that away from you.
      </P>
      <P>
        Please contact us first — most disputes are resolved by email in a day. EU consumers may also
        use the European Commission's Online Dispute Resolution platform at{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </P>

      <H2 id="general">14. General</H2>
      <UL>
        <LI>
          If any clause is found unenforceable, the rest of these terms continue in force without it.
        </LI>
        <LI>
          Our not enforcing a term on one occasion does not waive our right to enforce it later.
        </LI>
        <LI>
          You may not transfer your rights under these terms. We may transfer ours if the business is
          sold, provided your rights are not reduced.
        </LI>
        <LI>
          These terms, together with the Refund Policy, Privacy Policy and Disclaimer, are the whole
          agreement between us about the Service.
        </LI>
      </UL>
    </LegalLayout>
  );
}
