import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';

export default function ProductsPage({ windowDays }) {
  const { data: products, loading, error } = useAnalyticsData('/analytics/products', {
    windowDays,
    limit: 6
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="page-grid two-column">
      <SectionHeading
        title="Products"
        subtitle={`Product-level performance and friction points for the last ${windowDays} days.`}
      />

      <Panel title="Top Viewed Products" subtitle="Products getting the most attention.">
        <BarList
          items={products.topViewed}
          emptyMessage="No product views have been tracked yet."
        />
      </Panel>

      <Panel title="Top Purchased Products" subtitle="Products driving the most purchases.">
        <BarList
          items={products.topPurchased}
          emptyMessage="No purchases have been tracked yet."
        />
      </Panel>

      <Panel title="Best Converting Products" subtitle="Products turning views into purchases.">
        <BarList
          items={products.bestConverting}
          valueKey="conversionRate"
          valueFormatter={(value) => `${value}%`}
          emptyMessage="Not enough product conversion data yet."
        />
      </Panel>

      <Panel title="Most Abandoned Products" subtitle="Products that reach cart but fail to convert.">
        <BarList
          items={products.mostAbandoned}
          valueKey="abandonmentCount"
          emptyMessage="No abandoned cart patterns have been tracked yet."
        />
      </Panel>
    </div>
  );
}
