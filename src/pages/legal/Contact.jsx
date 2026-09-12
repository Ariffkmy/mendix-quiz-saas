import { BUSINESS, PRODUCT } from '../../config';
import LegalLayout, { Biz, H2, LI, P, UL } from './LegalLayout.jsx';

/**
 * Trader identification page (an "imprint" / "legal notice").
 *
 * Required of anyone selling online in the EU (e-Commerce Directive art. 5) and
 * the UK, and by Malaysia's Electronic Commerce Act 2006. Its absence
 * a reachable business identity when reviewing a live account, so a missing one
 * is the single most common gap on a small commercial site.
 */
export default function Contact() {
  const privacyContact = BUSINESS.privacyEmail || PRODUCT.supportEmail;

  return (
    <LegalLayout
      title="Contact & Business Details"
      summary="Who we are and how to reach a human. We answer every email ourselves."
    >
      <H2 id="support">Support</H2>
      <P>
        For anything at all — a wrong answer in the question bank, a sign-in problem, an
        invoice — email{' '}
        <a
          href={`mailto:${PRODUCT.supportEmail}`}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {PRODUCT.supportEmail}
        </a>
        . We aim to reply within 2 business days.
      </P>
      <P>
        For privacy requests — a copy of your data, a correction, or deletion — write to{' '}
        <a href={`mailto:${privacyContact}`} className="font-medium text-brand-600 hover:text-brand-700">
          {privacyContact}
        </a>{' '}
        from the address on your account.
      </P>

      <H2 id="details">Business details</H2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <dl className="divide-y divide-slate-200 text-sm">
          {[
            ['Trading name', PRODUCT.name],
            [
              'Legal entity',
              <Biz key="legal" field="legalName" fallback="[registered business name]" />,
            ],
            BUSINESS.registrationNumber && ['Registration number', BUSINESS.registrationNumber],
            [
              'Registered address',
              <Biz key="addr" field="address" fallback="[full postal address]" />,
            ],
            BUSINESS.taxNumber && ['Tax / VAT / SST number', BUSINESS.taxNumber],
            [
              'Email',
              <a
                key="mail"
                href={`mailto:${PRODUCT.supportEmail}`}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {PRODUCT.supportEmail}
              </a>,
            ],
          ]
            .filter(Boolean)
            .map(([term, value]) => (
              <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
                <dt className="font-semibold text-ink-900">{term}</dt>
                <dd className="text-ink-700">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      <H2 id="what-we-cannot">What we cannot help with</H2>
      <UL>
        <LI>
          Booking, rescheduling or querying your actual Mendix certification exam — that goes to
          Mendix, not to us. We are not connected to them.
        </LI>
        <LI>Official exam content, or confirmation of what will be on your exam paper.</LI>
        <LI>Technical support for the Mendix platform itself.</LI>
      </UL>
    </LegalLayout>
  );
}
