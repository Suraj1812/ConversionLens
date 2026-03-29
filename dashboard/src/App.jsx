import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider.jsx';
import BrandLogo from './components/BrandLogo.jsx';
import ScreenLoader from './components/ScreenLoader.jsx';
import RangeSelector from './components/RangeSelector.jsx';
import SeoManager from './components/SeoManager.jsx';
import Sidebar from './components/Sidebar.jsx';
import StatusPill from './components/StatusPill.jsx';
import SuspenseFallback from './components/SuspenseFallback.jsx';
import { useAnalyticsData } from './hooks/useAnalyticsData.js';
import { getRouteMeta } from './lib/routes.js';

const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx'));
const FunnelPage = lazy(() => import('./pages/FunnelPage.jsx'));
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

export default function App() {
  const auth = useAuth();
  const [windowDays, setWindowDays] = useState(30);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = Boolean(auth.user);
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);
  const { data: readiness, loading: readinessLoading, error: readinessError } = useAnalyticsData(
    '/readyz',
    undefined,
    {
      credentialsMode: 'omit'
    }
  );
  const pageMeta = getRouteMeta(location.pathname);
  const statusTone = readinessError
    ? 'danger'
    : readinessLoading
      ? 'neutral'
      : readiness?.status === 'ready'
        ? 'success'
        : 'warning';
  const statusLabel = readinessError
    ? 'Connection issue'
    : readinessLoading
      ? 'Checking backend'
      : readiness?.status === 'ready'
        ? 'API connected'
        : 'Backend starting';

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth.transition) {
      return;
    }

    if ((isAuthenticated && !isAuthRoute) || (!isAuthenticated && isAuthRoute)) {
      auth.clearTransition();
    }
  }, [auth, isAuthenticated, isAuthRoute]);

  useEffect(() => {
    if (!sidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  async function handleLogout() {
    setSidebarOpen(false);
    await auth.logout();
  }

  if (auth.loading) {
    return (
      <>
        <SeoManager />
        <ScreenLoader
          title="Preparing your workspace"
          description="Checking your session and loading the dashboard."
        />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SeoManager />
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="*"
              element={<Navigate to="/login" replace state={{ from: location.pathname }} />}
            />
          </Routes>
        </Suspense>
        {auth.transition ? (
          <ScreenLoader
            overlay
            title={auth.transition.title}
            description={auth.transition.description}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="app-shell">
        <SeoManager />
        <button
          type="button"
          className={sidebarOpen ? 'sidebar-backdrop visible' : 'sidebar-backdrop'}
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          user={auth.user}
        />

        <main className="content-shell">
          <div className="mobile-topbar">
            <BrandLogo />
            <button
              type="button"
              className="menu-button"
              aria-label="Open navigation menu"
              aria-controls="primary-navigation"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 5H17" />
                <path d="M3 10H17" />
                <path d="M3 15H17" />
              </svg>
            </button>
          </div>

          <header className="content-header">
            <div className="page-intro">
              <div className="title-row">
                <h1>{pageMeta.pageTitle}</h1>
                <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
              </div>
              <p className="page-copy">{pageMeta.pageSubtitle}</p>
            </div>

            <div className="content-actions">
              {readiness?.databaseState ? (
                <StatusPill tone={readiness?.status === 'ready' ? 'success' : 'neutral'}>
                  Database {readiness.databaseState}
                </StatusPill>
              ) : null}
              <RangeSelector value={windowDays} onChange={setWindowDays} />
            </div>
          </header>

          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/login" element={<Navigate to="/overview" replace />} />
              <Route path="/register" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage windowDays={windowDays} />} />
              <Route path="/funnel" element={<FunnelPage windowDays={windowDays} />} />
              <Route path="/products" element={<ProductsPage windowDays={windowDays} />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {auth.transition ? (
        <ScreenLoader
          overlay
          title={auth.transition.title}
          description={auth.transition.description}
        />
      ) : null}
    </>
  );
}
