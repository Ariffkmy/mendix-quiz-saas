import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';
import { LEGAL_PAGES } from '../pages/legal/LegalLayout.jsx';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        MX
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-ink-900">Mendix Practice</span>
        <span className="block text-xs text-ink-500">Exam Simulator</span>
      </span>
    </Link>
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

  const onLegalPage = LEGAL_PAGES.some((link) => link.to === pathname);

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
          {LEGAL_PAGES.map((link) => (
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
  const { user, email, isAdmin, signOut } = useAuth();
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
                <NavLink to="/study" className={linkClass}>
                  Study
                </NavLink>
                <NavLink to="/results" className={linkClass}>
                  Results
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            <LegalMenu />

            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <span
                  className="hidden max-w-[12rem] truncate text-sm text-ink-500 lg:inline"
                  title={email}
                >
                  {email}
                </span>
                <button type="button" onClick={handleSignOut} className="btn-secondary">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Start free
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
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {PRODUCT.name}. Independent study material — not affiliated
          with or endorsed by Mendix.
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGAL_PAGES.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-ink-700">
              {link.label}
            </Link>
          ))}
          <a href={`mailto:${PRODUCT.supportEmail}`} className="text-brand-600 hover:text-brand-700">
            {PRODUCT.supportEmail}
          </a>
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
