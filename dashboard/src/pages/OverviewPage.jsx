import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import EmptyBanner from '../components/EmptyBanner.jsx';
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
  const summaryRows = [
    { label: 'View to cart rate', value: formatPercent(viewToCartRate) },
    { label: 'Cart to purchase rate', value: formatPercent(cartToPurchaseRate) },
    { label: 'Top viewed product', value: topViewedProduct?.productTitle || 'No data yet' },
    { label: 'Top purchased product', value: topPurchasedProduct?.productTitle || 'No data yet' },
    { label: 'Largest cart leak', value: biggestLeakProduct?.productTitle || 'No data yet' },
    {
      label: 'Largest cart leak rate',
      value: formatPercent(biggestLeakProduct?.abandonmentRate || 0)
    }
  ];

  return (
    <div className="page-grid">
      <SectionHeading title="Overview" subtitle={rangeLabel || `Last ${windowDays} days`} />

      {isEmpty ? (
        <EmptyBanner
          title="No storefront data yet"
          description="Generate a few Shopify events to populate the dashboard."
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
        <Panel title="Event volume">
          <BarList
            items={eventBreakdown}
            emptyMessage="No event data yet."
          />
        </Panel>

        <Panel title="Funnel">
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

      <Panel title="Summary">
        <div className="summary-list">
          {summaryRows.map((row) => (
            <div className="summary-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Purchasing sessions</span>
            <strong>{formatNumber(funnelSteps[2]?.count || 0)}</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}
