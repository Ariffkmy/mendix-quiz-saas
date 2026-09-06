import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import { RESULTS_UNLOCKED } from './config';
import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Quiz from './pages/Quiz.jsx';
import Register from './pages/Register.jsx';
import Results from './pages/Results.jsx';
import Success from './pages/Success.jsx';

// Split out of the main bundle: Study carries the whole knowledge base, and
// Admin is only ever reached by a handful of accounts.
const Study = lazy(() => import('./pages/Study.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

// The policy pages are long-form prose that most visits never open, so they are
// split out too. They must stay publicly reachable without an account: Stripe
// checks them during account review, and a customer looking for the refund terms
// is often not signed in.
const Terms = lazy(() => import('./pages/legal/Terms.jsx'));
const Privacy = lazy(() => import('./pages/legal/Privacy.jsx'));
const Refunds = lazy(() => import('./pages/legal/Refunds.jsx'));
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer.jsx'));
const Contact = lazy(() => import('./pages/legal/Contact.jsx'));

/** Wraps a lazily loaded page in the shared loading fallback. */
function Lazy({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

function PageFallback() {
  return (
    <div className="flex justify-center py-24">
      <Spinner label="Loading…" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public policy pages — never behind a guard. */}
        <Route path="/terms" element={<Lazy><Terms /></Lazy>} />
        <Route path="/privacy" element={<Lazy><Privacy /></Lazy>} />
        <Route path="/refunds" element={<Lazy><Refunds /></Lazy>} />
        <Route path="/disclaimer" element={<Lazy><Disclaimer /></Lazy>} />
        <Route path="/contact" element={<Lazy><Contact /></Lazy>} />

        {/* Any signed-in account, free or paid. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Open to everyone, signed in or not: the free tier is the try-before-
            you-buy, so nothing stands between the landing page and question one.
            An anonymous sitting is never scored and never persisted server-side.
            Signed-in accounts still get the briefing and the attempt check,
            which live in Quiz.jsx so it can offer the upgrade in context. */}
        <Route path="/quiz" element={<Quiz />} />

        {/* Paid only: anything that reveals a score. */}
        {/* RESULTS_UNLOCKED is a local-development switch (see config.js): it
            drops the guard so a score can be checked without paying or signing
            in. It is always false in a production build. */}
        <Route
          path="/results"
          element={
            RESULTS_UNLOCKED ? (
              <Results />
            ) : (
              <ProtectedRoute requirePaid redirectTo="/dashboard">
                <Results />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute requirePaid>
              <Suspense fallback={<PageFallback />}>
                <Study />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Suspense fallback={<PageFallback />}>
                <Admin />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
