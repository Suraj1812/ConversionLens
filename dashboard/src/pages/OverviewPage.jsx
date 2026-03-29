import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';

export default function OverviewPage({ windowDays }) {
  const { data: overview, loading, error } = useAnalyticsData('/analytics/overview', {
    windowDays
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const eventBreakdown = [
    { label: 'Views', count: overview.totalsByEvent.view },
    { label: 'Add to Cart', count: overview.totalsByEvent.add_to_cart },
    { label: 'Purchases', count: overview.totalsByEvent.purchase }
  ];

  return (
    <div className="page-grid">
      <SectionHeading
        title="Overview"
        subtitle={`High-level activity for the last ${windowDays} days.`}
      />

      <div className="metrics-grid">
        <MetricCard label="Total Users" value={overview.totalUsers} />
        <MetricCard label="Total Events" value={overview.totalEvents} />
        <MetricCard
          label="Conversion Rate"
          value={`${overview.conversionRate}%`}
          helper="Purchasing sessions divided by viewing sessions"
        />
      </div>

      <Panel title="Event Breakdown" subtitle="A quick look at activity across the store.">
        <BarList
          items={eventBreakdown}
          emptyMessage="Track some storefront activity to see data here."
        />
      </Panel>
    </div>
  );
}
