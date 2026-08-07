import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-bold tracking-wide text-brand-600 uppercase">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">Page not found</h1>
      <p className="mt-3 text-ink-500">
        That page doesn't exist. It may have moved, or the link may be out of date.
      </p>
      <Link to="/" className="btn-primary mt-7">
        Back to home
      </Link>
    </div>
  );
}
