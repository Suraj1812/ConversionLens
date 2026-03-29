import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';

export default function FunnelPage({ windowDays }) {
  const { data: funnel, loading, error } = useAnalyticsData('/analytics/funnel', {
    windowDays
  });

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="page-grid">
      <SectionHeading
        title="Funnel"
        subtitle={`Sequential session progression from product view to purchase over the last ${windowDays} days.`}
      />

      <div className="metrics-grid">
        {funnel.steps.map((step) => (
          <MetricCard
            key={step.key}
            label={step.label}
            value={step.count}
            helper={`Step conversion: ${step.conversionFromPrevious}%`}
          />
        ))}
      </div>

      <Panel title="Funnel Performance" subtitle="Session counts for each conversion step.">
        <BarList items={funnel.steps} emptyMessage="No funnel data has been collected yet." />
      </Panel>

      <Panel
        title="Overall Conversion"
        subtitle="Sessions that purchased divided by sessions that viewed a product."
      >
        <div className="conversion-highlight">{funnel.overallConversionRate}%</div>
      </Panel>
    </div>
  );
}
