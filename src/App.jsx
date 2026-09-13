import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Quiz from './pages/Quiz.jsx';
import QuickQuiz from './pages/QuickQuiz.jsx';
import Register from './pages/Register.jsx';
import Results from './pages/Results.jsx';

// Split out of the main bundle: Study carries the whole knowledge base, and
// Admin is only ever reached by a handful of accounts.
const Study = lazy(() => import('./pages/Study.jsx'));

// Policy pages are rarely visited and carry a lot of prose, so they stay out of
// the main bundle.
const Terms = lazy(() => import('./pages/legal/Terms.jsx'));
const Privacy = lazy(() => import('./pages/legal/Privacy.jsx'));
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer.jsx'));
const Contact = lazy(() => import('./pages/legal/Contact.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public policy pages. */}
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageFallback />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageFallback />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="/disclaimer"
          element={
            <Suspense fallback={<PageFallback />}>
              <Disclaimer />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageFallback />}>
              <Contact />
            </Suspense>
          }
        />

        {/* Everything below needs an account. The product is free, so that is
            the only check. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick"
          element={
            <ProtectedRoute>
              <QuickQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
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
