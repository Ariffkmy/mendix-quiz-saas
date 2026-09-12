import { Link } from 'react-router-dom';

import { BUSINESS, PRODUCT } from '../../config';
import LegalLayout, { Biz, Fill, H2, H3, LI, P, UL } from './LegalLayout.jsx';

/** Where privacy mail goes — a dedicated address if set, else support. */
const privacyContact = BUSINESS.privacyEmail || PRODUCT.supportEmail;

function Table({ head, rows }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="px-4 py-3 font-semibold text-ink-900">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-slate-200 align-top">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-medium text-ink-900' : 'text-ink-700'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      summary="What personal data we collect, why, who else sees it, how long we keep it, and the rights you have over it."
    >
      <H2 id="controller">1. Who is responsible for your data</H2>
      <P>
        The data controller is <Biz field="legalName" fallback="[registered business name]" /> of{' '}
        <Biz field="address" fallback="[full postal address]" />. For anything in this policy —
        including a request to see, correct or delete your data — write to{' '}
        <a href={`mailto:${privacyContact}`} className="font-medium text-brand-600 hover:text-brand-700">
          {privacyContact}
        </a>
        .
      </P>
      <P>
        We have not appointed a Data Protection Officer, as we are not required to. If your country
        requires a local representative for our size of business, we will appoint one on request.
      </P>

      <H2 id="what-we-collect">2. What we collect and why</H2>
      <P>
        We collect as little as the product allows. There is no name field, no phone number, no
        address and no marketing profile. Notably, you can sit a full practice exam without giving us
        anything at all — the anonymous free sitting stays in your own browser and never reaches us.
      </P>

      <Table
        head={['Data', 'Why we hold it', 'Lawful basis (UK/EU GDPR)']}
        rows={[
          [
            'Email address',
            'Identifies your account; used to send sign-in and confirmation links.',
            'Performance of the contract',
          ],
          [
            'Password',
            'Authenticates you. Stored only as a salted hash by Supabase — we never see the password itself.',
            'Performance of the contract',
          ],
          [
            'Exam attempts',
            'Your answers, score, pass/fail, per-topic breakdown, duration and timestamps, so your dashboard and history work.',
            'Performance of the contract',
          ],
          [
            'Attempt count',
            'How many exams you have submitted, shown on your dashboard.',
            'Performance of the contract',
          ],
          [
            'Technical logs',
            'IP address, user agent and request metadata kept briefly by our hosting and database providers to keep the Service secure and working.',
            'Legitimate interests (security, fraud prevention, debugging)',
          ],
        ]}
      />

      <P>
        We do <strong>not</strong> collect special-category data, we do not buy data about you from
        anyone, and we do not build advertising profiles. We do not sell or share your personal data
        for cross-context behavioural advertising, as those terms are used in the California
        Consumer Privacy Act.
      </P>

      <H2 id="storage">3. Cookies and browser storage</H2>
      <P>
        We run no advertising cookies, no analytics cookies and no third-party trackers, so there is
        no consent banner to click through. What we do store on your device is strictly necessary to
        deliver a service you asked for, which is why it is exempt from consent under the ePrivacy
        rules:
      </P>
      <UL>
        <LI>
          <strong>Sign-in session.</strong> Supabase keeps your authentication token in your browser
          so you stay signed in between visits. Clearing it signs you out.
        </LI>
        <LI>
          <strong>Exam in progress</strong> (<code className="font-mono text-sm">mx-exam:in-progress</code>) —
          your answers so far, so a refresh or a crash does not cost you the sitting.
        </LI>
        <LI>
          <strong>Last result</strong> (<code className="font-mono text-sm">mx-exam:last-result</code>) —
          so the results page still works for an anonymous sitting.
        </LI>
        <LI>
          <strong>Attempt counts and seen questions</strong> (
          <code className="font-mono text-sm">mx-exam:attempt-counts</code>,{' '}
          <code className="font-mono text-sm">mx-exam:seen-questions</code>) — so a repeat sitting
          does not serve you the same questions in the same order.
        </LI>
      </UL>
      <P>
        These are stored in your browser's local storage, not sent to us, and you can clear them at
        any time through your browser settings.
      </P>

      <H2 id="processors">4. Who else processes your data</H2>
      <P>
        We use a small number of service providers, each bound by a data-processing agreement and
        each permitted to use your data only to provide their service to us.
      </P>
      <Table
        head={['Provider', 'What it does', 'Where']}
        rows={[
          ['Supabase', 'Database, authentication and account storage.', <Fill key="s">[your Supabase project region]</Fill>],
          ['Vercel', 'Hosting of the website and its serverless functions.', 'Global edge network'],
        ]}
      />
      <P>
        Some of these providers process data outside your country. Where personal data is transferred
        out of the UK or EEA, the transfer relies on the European Commission's Standard Contractual
        Clauses, or on an adequacy decision, as set out in each provider's own data-processing terms.
      </P>
      <P>
        We disclose data beyond this only where we are legally obliged to, or where it is necessary to
        establish or defend a legal claim. If our business is sold, account records may transfer to
        the buyer; your rights under this policy travel with them.
      </P>

      <H2 id="retention">5. How long we keep it</H2>
      <UL>
        <LI>
          <strong>Account and exam history</strong> — for as long as your account exists, then deleted
          within 30 days of you closing it.
        </LI>
        <LI>
          <strong>Technical logs</strong> — kept by our providers for their own retention periods,
          typically no more than 30 days.
        </LI>
        <LI>
          <strong>Anonymous exam sittings</strong> — never reach us at all. They live in your browser
          until you clear it.
        </LI>
      </UL>

      <H2 id="rights">6. Your rights</H2>
      <P>
        Depending on where you live, you have some or all of the following rights. We will respond
        within 30 days and will not charge you for a reasonable request.
      </P>
      <UL>
        <LI>
          <strong>Access</strong> — a copy of the personal data we hold about you.
        </LI>
        <LI>
          <strong>Rectification</strong> — correction of anything inaccurate.
        </LI>
        <LI>
          <strong>Erasure</strong> — deletion of your account and exam history, subject to the
          accounting records noted above.
        </LI>
        <LI>
          <strong>Portability</strong> — your data in a machine-readable format.
        </LI>
        <LI>
          <strong>Restriction and objection</strong> — including objecting to processing we base on
          legitimate interests.
        </LI>
        <LI>
          <strong>Withdraw consent</strong> — where we ever rely on consent, withdrawing it is as easy
          as giving it, and does not affect processing already carried out.
        </LI>
        <LI>
          <strong>Complain</strong> — to your data protection authority. In the UK that is the ICO (
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            ico.org.uk
          </a>
          ); in the EU, the supervisory authority where you live; in Malaysia, the Personal Data
          Protection Department (JPDP) under the Personal Data Protection Act 2010. We would rather
          you came to us first.
        </LI>
      </UL>
      <P>
        To exercise any of these, email{' '}
        <a href={`mailto:${privacyContact}`} className="font-medium text-brand-600 hover:text-brand-700">
          {privacyContact}
        </a>{' '}
        from the address on your account. We may ask you to confirm it is you before acting on a
        request.
      </P>

      <H2 id="security">7. Security</H2>
      <P>
        Traffic is encrypted in transit with TLS. Passwords are salted and hashed, never stored in
        readable form. Access to your exam history is enforced in the database itself with row-level
        security, not merely hidden in the interface, so one account cannot read another's data even
        with a raw API token. Administrative keys are held server-side only and are never included in
        the code sent to your browser.
      </P>
      <P>
        No system is perfectly secure. If a breach occurs that is likely to result in a risk to your
        rights, we will notify the relevant supervisory authority within 72 hours and tell you
        directly where the risk is high.
      </P>

      <H2 id="children">8. Children</H2>
      <P>
        The Service is aimed at working software developers and is not directed at children. We do not
        knowingly collect data from anyone under 16. If you believe a child has created an account,
        tell us and we will delete it.
      </P>

      <H2 id="changes">9. Changes to this policy</H2>
      <P>
        We will update this page when our practices change, and revise the date at the top. If a
        change is significant — a new category of data, a new purpose, a new processor handling your
        exam history — we will email account holders before it takes effect. Related documents:{' '}
        <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
          Terms of Service
        </Link>
        .
      </P>
    </LegalLayout>
  );
}
