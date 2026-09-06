import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { PRODUCT } from '../config';
import { useAuth } from '../context/AuthContext.jsx';

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

// Consumer law expects the policy pages to be reachable from anywhere on the
// site, not just from the marketing footer, so they live in the shared one too.
const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/refunds', label: 'Refunds' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/contact', label: 'Contact' },
];

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
              {link.label}
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
