import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';

// The policy pages, in the order they are linked everywhere on the site.
const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms of Service', short: 'Terms' },
  { to: '/privacy', label: 'Privacy Policy', short: 'Privacy' },
  { to: '/refunds', label: 'Refund Policy', short: 'Refunds' },
  { to: '/disclaimer', label: 'Disclaimer', short: 'Disclaimer' },
  { to: '/contact', label: 'Contact', short: 'Contact' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        MX
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-ink-900">Mendix Exam Prep</span>
        <span className="block text-xs text-ink-500">Exam Simulator</span>
      </span>
    </Link>
  );
}

function TierPill({ tier }) {
  const paid = tier === 'paid';
  return (
    <span
      className={`hidden rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase sm:inline ${
        paid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-ink-500'
      }`}
      title={paid ? 'Full access' : 'Free tier — one attempt, no results'}
    >
      {paid ? 'Full' : 'Free'}
    </span>
  );
}

/**
 * Legal menu in the header.
 *
 * Five policy links would swamp a nav that is already carrying the sign-up
 * path, so they collapse behind one button. Built as a real menu rather than a
 * hover card: it has to work on touch, close on Escape and on an outside click,
 * and return focus to the button afterwards.
 */
function LegalMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname } = useLocation();

  // A navigation is a decision — the menu has done its job and should close.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      // Escape must not leave focus stranded on a hidden element.
      buttonRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const onLegalPage = LEGAL_LINKS.some((link) => link.to === pathname);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          onLegalPage ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-slate-100'
        }`}
      >
        Legal
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.58l3.3-3.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.42Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
          {LEGAL_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink-700 hover:bg-slate-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { user, email, tier, isPaid, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // The exam screen gets a stripped-down header so nothing competes with the
  // question being read.
  const examMode = pathname === '/quiz';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {examMode ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Exam in progress
          </span>
        ) : (
          <nav className="flex items-center gap-1">
            {user && (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/quiz" className={linkClass}>
                  Exam
                </NavLink>
                {/* Study and Results reveal answers, so they are paid-only. */}
                {isPaid && (
                  <>
                    <NavLink to="/study" className={linkClass}>
                      Study
                    </NavLink>
                    <NavLink to="/results" className={linkClass}>
                      Results
                    </NavLink>
                  </>
                )}
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}

            {/* Hidden on the narrowest screens, where the sign-up buttons
                already fill the bar — the footer carries the same links on
                every page, so nothing becomes unreachable. */}
            <div className="hidden sm:block">
              <LegalMenu />
            </div>

            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <TierPill tier={tier} />
                <span
                  className="hidden max-w-[12rem] truncate text-sm text-ink-500 lg:inline"
                  title={email}
                >
                  {email}
                </span>
                {!isPaid && (
                  <Link to="/checkout" className="btn-primary">
                    Upgrade
                  </Link>
                )}
                <button type="button" onClick={handleSignOut} className="btn-secondary">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/quiz" className="btn-secondary">
                  Start free
                </Link>
                <Link to="/checkout" className="btn-primary">
                  Get full access
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-500 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {PRODUCT.name}. Independent study material — not affiliated
            with or endorsed by Mendix.
          </p>
          <a href={`mailto:${PRODUCT.supportEmail}`} className="text-brand-600 hover:text-brand-700">
            {PRODUCT.supportEmail}
          </a>
        </div>

        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="transition hover:text-brand-600">
              {link.short}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  // The landing page ships its own full marketing footer.
  const ownFooter = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!ownFooter && <Footer />}
    </div>
  );
}
