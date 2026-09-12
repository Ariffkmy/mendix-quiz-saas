import { Link } from 'react-router-dom';

import { PRODUCT } from '../../config';
import { PASS_THRESHOLD } from '../../data/questions';
import { useExamOverview } from '../../hooks/useExamOverview';
import LegalLayout, { H2, LI, P, UL } from './LegalLayout.jsx';

export default function Disclaimer() {
  const { questionCount } = useExamOverview();
  return (
    <LegalLayout
      title="Disclaimer"
      summary="What this product is, what it is not, and who it is not connected to."
    >
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">Not affiliated with Mendix or Siemens</p>
        <p className="mt-2 leading-relaxed text-amber-900/90">
          {PRODUCT.name} is an independent study aid. It is not affiliated with, authorised by,
          sponsored by, endorsed by, licensed by or in any way officially connected with Mendix
          Technology B.V., Siemens AG, or any of their subsidiaries or affiliates.
        </p>
      </div>

      <H2 id="trademarks">1. Trademarks</H2>
      <P>
        "Mendix" is a trademark of Mendix Technology B.V. "Siemens" is a trademark of Siemens AG. All
        other product names, logos and brands mentioned on this site are the property of their
        respective owners.
      </P>
      <P>
        We use these names only descriptively, to identify the certification our material prepares you
        for. That is nominative fair use — it does not imply any partnership, sponsorship or
        endorsement, and no such relationship exists.
      </P>

      <H2 id="not-official">2. This is not official exam material</H2>
      <UL>
        <LI>
          The {questionCount} questions here were written independently by us. They are not copied,
          reproduced or derived from official Mendix exam papers, question banks, courseware or
          certification materials.
        </LI>
        <LI>
          They are not "leaked" or "real" exam questions. Anyone selling you those is selling you
          something both dishonest and useless.
        </LI>
        <LI>
          Our study guides are our own summaries of publicly documented Mendix concepts, written in our
          own words.
        </LI>
        <LI>
          Passing our exam grants you no credential, badge or certification of any kind. Only Mendix can
          certify you.
        </LI>
      </UL>

      <H2 id="no-guarantee">3. No guarantee of results</H2>
      <P>
        Our {PASS_THRESHOLD}% pass threshold mirrors the official one, but a score here is a practice
        score and nothing more. It does not predict your official result, and we make no promise —
        express or implied — that using this Service will help you pass a Mendix Developer
        certification, or that you will pass at all.
      </P>
      <P>
        The real exam's format, content, difficulty and blueprint are set by Mendix and can change at
        any time without notice to us. Our material may lag behind such changes.
      </P>

      <H2 id="accuracy">4. Accuracy</H2>
      <P>
        We work to keep the questions and explanations correct and current, but we do not warrant that
        they are free of error or complete. Nothing here is professional, technical or career advice.
        Always check the official Mendix documentation before relying on a technical detail in
        production work.
      </P>
      <P>
        Spotted a mistake? Please tell us at{' '}
        <a href={`mailto:${PRODUCT.supportEmail}`} className="font-medium text-brand-600 hover:text-brand-700">
          {PRODUCT.supportEmail}
        </a>{' '}
        — corrections are genuinely welcome.
      </P>

      <H2 id="external">5. External links</H2>
      <P>
        Where we link to Mendix documentation or other third-party sites, we do so for your
        convenience. We do not control that content and are not responsible for it.
      </P>

      <H2 id="conduct">6. Exam conduct</H2>
      <P>
        Nothing in this Service is intended to help anyone cheat in the official certification. Using
        practice material to prepare is entirely legitimate; attempting to reproduce or circulate real
        exam content is not, and it breaches the candidate agreement you sign with Mendix. Do not ask
        us for real exam questions — we do not have them and would not supply them.
      </P>

      <P>
        See also our{' '}
        <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
          Terms of Service
        </Link>
        , which contain the limits on our liability.
      </P>
    </LegalLayout>
  );
}
