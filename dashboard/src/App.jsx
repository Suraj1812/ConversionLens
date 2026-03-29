import { lazy, Suspense, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BrandLogo from './components/BrandLogo.jsx';
import RangeSelector from './components/RangeSelector.jsx';
import SeoManager from './components/SeoManager.jsx';
import Sidebar from './components/Sidebar.jsx';
import SuspenseFallback from './components/SuspenseFallback.jsx';

const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx'));
const FunnelPage = lazy(() => import('./pages/FunnelPage.jsx'));
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'));

export default function App() {
  const [windowDays, setWindowDays] = useState(30);

  return (
    <div className="app-shell">
      <SeoManager />
      <Sidebar />

      <main className="content-shell">
        <div className="content-header">
          <header className="page-intro">
            <BrandLogo compact />
            <p className="eyebrow">Shoplytics</p>
            <h1>Shopify Tracking Dashboard</h1>
            <p className="page-copy">
              Track product interest, cart intent, and purchase behavior across your store.
            </p>
          </header>

          <RangeSelector value={windowDays} onChange={setWindowDays} />
        </div>

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
