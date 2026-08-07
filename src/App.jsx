import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import Checkout from './pages/Checkout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Quiz from './pages/Quiz.jsx';
import Results from './pages/Results.jsx';
import Success from './pages/Success.jsx';

// Split out of the main bundle: Study carries the whole knowledge base, and
// Admin is only ever reached by a handful of accounts.
const Study = lazy(() => import('./pages/Study.jsx'));
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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/quiz"
          element={
            <ProtectedRoute requirePurchase>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute requirePurchase>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute requirePurchase>
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
