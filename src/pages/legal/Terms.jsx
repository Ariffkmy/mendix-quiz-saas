import { Link } from 'react-router-dom';

import { BUSINESS, PRODUCT } from '../../config';
import { PASS_THRESHOLD } from '../../data/questions';
import { useExamOverview } from '../../hooks/useExamOverview';
import LegalLayout, { Biz, Fill, H2, LI, P, UL } from './LegalLayout.jsx';

export default function Terms() {
  const { questionCount } = useExamOverview();
  return (
    <LegalLayout
      title="Terms of Service"
      summary="The agreement between you and us when you use the exam simulator. The Service is free — there is nothing to buy and nothing to pay."
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
        to tick a box confirming your agreement before you create an account, so
        that the point of acceptance is recorded.
      </P>
      <P>
        You must be at least 16 years old, or the age of digital consent in your country if that is
        higher, to create an account.
      </P>

      <H2 id="what-you-get">3. What the Service is</H2>
      <P>
        The Service is a practice-exam simulator: a bank of {questionCount} multiple-choice
        questions written as practice for Mendix Intermediate and Advanced Developer certification,
        together with written study guides, scoring and progress analytics.
      </P>
      <P>
        The Service is free. There is no paid tier, no subscription and nothing to buy: every
        registered account gets unlimited attempts, its scores, the {PASS_THRESHOLD}% pass/fail
        verdict, per-module breakdowns, answer explanations, the study guides and the analytics
        dashboard.
      </P>

      <H2 id="continuity">4. How long the Service will run</H2>
      <P>
        We offer the Service free of charge and for as long as we choose to operate it. That is not
        a promise to operate it forever, which no business can honestly make. If we decide to shut
        it down permanently, we will give registered users at least <Fill>30 days'</Fill> notice by
        email so you can export anything you want to keep.
      </P>

      <H2 id="no-payment">5. No payment</H2>
      <P>
        We do not charge for the Service and we do not collect card or bank details. If anyone asks
        you to pay for access to this site, they are not acting for us — tell us at{' '}
        <a
          href={`mailto:${PRODUCT.supportEmail}`}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {PRODUCT.supportEmail}
        </a>
        .
      </P>

      <H2 id="licence">6. Your licence, and its limits</H2>
      <P>
        We grant you a personal, non-exclusive, non-transferable, revocable licence to use the
        Service and its content for your own study. An account is for one individual.
      </P>
      <P>You may not:</P>
      <UL>
        <LI>
          copy, republish, sell, sub-licence, or otherwise redistribute the questions, explanations or
          study guides, in whole or in part, in any medium;
        </LI>
        <LI>share your account credentials, or use one account to provide access to a team or class;</LI>
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
        We may suspend or terminate access where we reasonably believe you have
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
        unavailable for maintenance, or because of failures at our hosting or database
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
        version. If a change materially reduces what the Service offers, we
        will email you at least 30 days before it takes effect, and you may close your account if you do
        not accept it. Continuing to use the Service after a change takes effect means you accept it.
      </P>
      <P>
        We may also change what the Service offers at any time. A change never affects a
        attempt already recorded.
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
          These terms, together with the Privacy Policy and Disclaimer, are the whole
          agreement between us about the Service.
        </LI>
      </UL>
    </LegalLayout>
  );
}
