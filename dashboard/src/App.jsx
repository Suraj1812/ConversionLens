import { lazy, Suspense, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

export default function App() {
  const [windowDays, setWindowDays] = useState(30);
  const location = useLocation();
  const { data: readiness, loading: readinessLoading, error: readinessError } = useAnalyticsData(
    '/readyz'
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

  return (
    <div className="app-shell">
      <SeoManager />
      <Sidebar statusTone={statusTone} statusLabel={statusLabel} />

      <main className="content-shell">
        <header className="content-header">
          <div className="page-intro">
            <p className="eyebrow">Production workspace</p>
            <div className="title-row">
              <h1>{pageMeta.pageTitle}</h1>
              <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
            </div>
            <p className="page-copy">{pageMeta.pageSubtitle}</p>
            <div className="page-meta-row">
              <StatusPill tone="neutral">{windowDays}-day reporting window</StatusPill>
              {readiness?.databaseState ? (
                <StatusPill tone={readiness?.status === 'ready' ? 'success' : 'neutral'}>
                  Database {readiness.databaseState}
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral">Shopify event intelligence</StatusPill>
            </div>
          </div>

          <RangeSelector value={windowDays} onChange={setWindowDays} />
        </header>

        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage windowDays={windowDays} />} />
            <Route path="/funnel" element={<FunnelPage windowDays={windowDays} />} />
            <Route path="/products" element={<ProductsPage windowDays={windowDays} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
