import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { BUSINESS, LEGAL_EFFECTIVE_DATE, PRODUCT } from '../../config';

/**
 * Shared chrome for the policy pages.
 *
 * Every legal document on the site is reachable from every other one, so a
 * visitor who lands on the privacy policy does not have to hunt for the terms it
 * refers to.
 */
export const LEGAL_PAGES = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/contact', label: 'Contact' },
];

/** Section heading. */
export function H2({ children, id }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 text-xl font-bold tracking-tight text-ink-900">
      {children}
    </h2>
  );
}

/** Sub-heading inside a section. */
export function H3({ children }) {
  return <h3 className="mt-7 font-semibold text-ink-900">{children}</h3>;
}

/** Body paragraph. */
export function P({ children }) {
  return <p className="mt-4 leading-relaxed text-ink-700">{children}</p>;
}

/** Bulleted list. */
export function UL({ children }) {
  return <ul className="mt-4 space-y-2.5">{children}</ul>;
}

export function LI({ children }) {
  return (
    <li className="flex items-start gap-3 leading-relaxed text-ink-700">
      <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

/**
 * Marks a value you still have to supply. It renders in warning colours so an
 * unfilled placeholder is impossible to miss in review — and so nobody mistakes
 * boilerplate for a completed policy.
 */
export function Fill({ children }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">
      {children}
    </mark>
  );
}

/** Renders a BUSINESS field, or a visible placeholder when it is still blank. */
export function Biz({ field, fallback }) {
  const value = BUSINESS[field];
  return value ? <span>{value}</span> : <Fill>{fallback}</Fill>;
}

export default function LegalLayout({ title, summary, children }) {
  // These pages are often linked to directly, so a visitor often
  // arrives mid-scroll from another route.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} · ${PRODUCT.name}`;
    return () => {
      document.title = PRODUCT.name;
    };
  }, [title]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <p className="text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">Legal</p>
        <h1 className="display-heading mt-3 text-3xl text-ink-900 sm:text-4xl">{title}</h1>

        {summary && <p className="mt-5 text-lg leading-relaxed text-ink-500">{summary}</p>}

        <p className="mt-5 text-sm text-ink-500">
          Last updated: {LEGAL_EFFECTIVE_DATE} · Applies to {PRODUCT.name}.
        </p>

        <nav aria-label="Legal pages" className="mt-8 flex flex-wrap gap-2 border-y border-slate-200 py-4">
          {LEGAL_PAGES.map((page) => (
            <NavLink
              key={page.to}
              to={page.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-ink-700 hover:bg-slate-200'
                }`
              }
            >
              {page.label}
            </NavLink>
          ))}
        </nav>

        <article className="mt-2">{children}</article>
      </div>
    </div>
  );
}
