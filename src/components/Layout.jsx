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
        <span className="block text-sm font-bold text-ink-900">Mendix Advanced</span>
        <span className="block text-xs text-ink-500">Exam Simulator</span>
      </span>
    </Link>
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
        <a href={`mailto:${PRODUCT.supportEmail}`} className="text-brand-600 hover:text-brand-700">
          {PRODUCT.supportEmail}
        </a>
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
