import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import EmptyAnalyticsState from '../components/EmptyAnalyticsState.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';
import { formatDateRange, formatNumber, formatPercent } from '../lib/formatters.js';

export default function OverviewPage({ windowDays }) {
  const overviewState = useAnalyticsData('/analytics/overview', { windowDays });
  const funnelState = useAnalyticsData('/analytics/funnel', { windowDays });
  const productsState = useAnalyticsData('/analytics/products', { windowDays, limit: 4 });

  if (overviewState.loading || funnelState.loading || productsState.loading) {
    return <LoadingState />;
  }

  if (overviewState.error || funnelState.error || productsState.error) {
    return <ErrorState message={overviewState.error || funnelState.error || productsState.error} />;
  }

  const overview = overviewState.data;
  const funnel = funnelState.data;
  const products = productsState.data;
  const funnelSteps = funnel.steps || [];
  const viewToCartRate = funnelSteps[1]?.conversionFromPrevious || 0;
  const cartToPurchaseRate = funnelSteps[2]?.conversionFromPrevious || 0;
  const averageEventsPerUser = overview.totalUsers ? overview.totalEvents / overview.totalUsers : 0;
  const rangeLabel = formatDateRange(overview.range);
  const isEmpty = overview.totalEvents === 0;

  const eventBreakdown = [
    { label: 'Views', count: overview.totalsByEvent.view },
    { label: 'Add to Cart', count: overview.totalsByEvent.add_to_cart },
    { label: 'Purchases', count: overview.totalsByEvent.purchase }
  ];
  const conversionSnapshot = funnelSteps.map((step) => ({
    label: step.label,
    count: step.count
  }));
  const topViewedProduct = products.topViewed[0];
  const topPurchasedProduct = products.topPurchased[0];
  const biggestLeakProduct = products.mostAbandoned[0];

  return (
    <div className="page-grid">
      <SectionHeading
        title="Overview"
        subtitle={`High-level activity from ${rangeLabel || `the last ${windowDays} days`}.`}
      />

      {isEmpty ? (
        <EmptyAnalyticsState
          title="No storefront events yet"
          description="The dashboard is live and ready. The next step is sending Shopify storefront events into the backend."
          steps={[
            {
              title: 'Install the customer pixel',
              description:
                'Paste the Shoplytics customer event script into Shopify so product views, add-to-cart actions, and purchases are emitted.'
            },
            {
              title: 'Create a few real test sessions',
              description:
                'Open product pages, add items to cart, and place a test order from the storefront to generate real funnel data.'
            },
            {
              title: 'Refresh the dashboard',
              description:
                'As soon as events hit the backend, the overview, funnel, and product analytics pages will populate automatically.'
            }
          ]}
        />
      ) : null}

      <div className="metrics-grid">
        <MetricCard label="Tracked Users" value={formatNumber(overview.totalUsers)} />
        <MetricCard label="Total Events" value={formatNumber(overview.totalEvents)} />
        <MetricCard
          label="Conversion Rate"
          value={formatPercent(overview.conversionRate)}
          helper="Purchasing sessions divided by viewing sessions."
        />
        <MetricCard
          label="Events per User"
          value={averageEventsPerUser.toFixed(1)}
          helper="Average interaction depth across tracked sessions."
        />
      </div>

      <div className="page-grid two-column">
        <Panel title="Event Breakdown" subtitle="A quick look at tracked actions across the store.">
          <BarList
            items={eventBreakdown}
            emptyMessage="Track some storefront activity to see event volume here."
          />
        </Panel>

        <Panel
          title="Conversion Snapshot"
          subtitle="Session progression from product discovery through purchase."
        >
          <div className="snapshot-list">
            {conversionSnapshot.map((step) => (
              <div className="snapshot-item" key={step.label}>
                <p className="snapshot-label">{step.label}</p>
                <h3 className="snapshot-value">{formatNumber(step.count)}</h3>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="page-grid two-column">
        <Panel
          title="Operational Readout"
          subtitle="Useful ratios to judge storefront quality, not just raw event volume."
        >
          <div className="insight-list">
            <div className="insight-row">
              <div>
                <p className="insight-label">View to cart rate</p>
                <p className="insight-helper">How often product interest turns into cart intent.</p>
              </div>
              <strong className="insight-value">{formatPercent(viewToCartRate)}</strong>
            </div>
            <div className="insight-row">
              <div>
                <p className="insight-label">Cart to purchase rate</p>
                <p className="insight-helper">How efficiently checkout intent becomes revenue.</p>
              </div>
              <strong className="insight-value">{formatPercent(cartToPurchaseRate)}</strong>
            </div>
            <div className="insight-row">
              <div>
                <p className="insight-label">Purchasing sessions</p>
                <p className="insight-helper">Completed purchase journeys captured in the current window.</p>
              </div>
              <strong className="insight-value">
                {formatNumber(funnelSteps[2]?.count || 0)}
              </strong>
            </div>
          </div>
        </Panel>

        <Panel title="Product Spotlight" subtitle="A quick read on winners and friction points.">
          <div className="spotlight-list">
            <div className="spotlight-item">
              <p className="spotlight-label">Most viewed</p>
              <h3 className="spotlight-title">
                {topViewedProduct?.productTitle || 'Waiting for view data'}
              </h3>
              <p className="spotlight-meta">
                {topViewedProduct
                  ? `${formatNumber(topViewedProduct.viewCount)} tracked views`
                  : 'Product attention data appears after the first storefront sessions.'}
              </p>
            </div>
            <div className="spotlight-item">
              <p className="spotlight-label">Most purchased</p>
              <h3 className="spotlight-title">
                {topPurchasedProduct?.productTitle || 'Waiting for purchase data'}
              </h3>
              <p className="spotlight-meta">
                {topPurchasedProduct
                  ? `${formatNumber(topPurchasedProduct.purchaseCount)} purchases recorded`
                  : 'This will update after a checkout completes in the connected store.'}
              </p>
            </div>
            <div className="spotlight-item">
              <p className="spotlight-label">Largest cart leak</p>
              <h3 className="spotlight-title">
                {biggestLeakProduct?.productTitle || 'Waiting for cart data'}
              </h3>
              <p className="spotlight-meta">
                {biggestLeakProduct
                  ? `${formatPercent(biggestLeakProduct.abandonmentRate)} abandonment rate`
                  : 'Cart leakage appears after real add-to-cart traffic starts flowing.'}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
