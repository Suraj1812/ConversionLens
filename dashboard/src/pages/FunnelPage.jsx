import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import EmptyBanner from '../components/EmptyBanner.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Panel from '../components/Panel.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { useAnalyticsData } from '../hooks/useAnalyticsData.js';
import { formatDateRange, formatNumber, formatPercent } from '../lib/formatters.js';

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

  const rangeLabel = formatDateRange(funnel.range);
  const isEmpty = funnel.steps.every((step) => step.count === 0);
  const largestStepCount = Math.max(...funnel.steps.map((step) => step.count), 1);
  const dropOffs = [
    {
      label: 'View to cart drop-off',
      count: Math.max(100 - (funnel.steps[1]?.conversionFromPrevious || 0), 0)
    },
    {
      label: 'Cart to purchase drop-off',
      count: Math.max(100 - (funnel.steps[2]?.conversionFromPrevious || 0), 0)
    }
  ];
  const largestDropOff = [...dropOffs].sort((left, right) => right.count - left.count)[0];

  return (
    <div className="page-grid">
      <SectionHeading title="Funnel" subtitle={rangeLabel || `Last ${windowDays} days`} />

      {isEmpty ? (
        <EmptyBanner
          title="No funnel data yet"
          description="Generate product views, cart events, and a purchase to populate this page."
        />
      ) : null}

      <div className="metrics-grid">
        {funnel.steps.map((step) => (
          <MetricCard
            key={step.key}
            label={step.label}
            value={formatNumber(step.count)}
            helper={`Step conversion: ${formatPercent(step.conversionFromPrevious)}`}
          />
        ))}
        <MetricCard
          label="Overall Conversion"
          value={formatPercent(funnel.overallConversionRate)}
          helper="Purchase sessions from product-view sessions."
        />
      </div>

      <Panel title="Stages">
        <div className="funnel-strip">
          {funnel.steps.map((step) => (
            <div className="funnel-step-card" key={step.key}>
              <div className="funnel-step-topline">
                <p className="snapshot-label">{step.label}</p>
                <strong>{formatPercent(step.conversionFromPrevious)}</strong>
              </div>
              <h3 className="snapshot-value">{formatNumber(step.count)}</h3>
              <div className="funnel-step-bar">
                <div
                  className="funnel-step-fill"
                  style={{ width: `${Math.max((step.count / largestStepCount) * 100, 8)}%` }}
                />
              </div>
              <p className="insight-helper">
                {step.key === 'view'
                  ? 'Entry point into the tracked journey.'
                  : step.key === 'add_to_cart'
                    ? 'Sessions that showed purchase intent.'
                    : 'Sessions that completed checkout.'}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="page-grid two-column">
        <Panel title="Drop-offs">
          <BarList
            items={dropOffs}
            valueFormatter={formatPercent}
            emptyMessage="No drop-off data yet."
          />
        </Panel>

        <Panel title="Rates">
          <div className="summary-list">
            <div className="summary-row">
              <span>View to cart</span>
              <strong>{formatPercent(funnel.steps[1]?.conversionFromPrevious || 0)}</strong>
            </div>
            <div className="summary-row">
              <span>Cart to purchase</span>
              <strong>{formatPercent(funnel.steps[2]?.conversionFromPrevious || 0)}</strong>
            </div>
            <div className="summary-row">
              <span>Overall conversion</span>
              <strong>{formatPercent(funnel.overallConversionRate)}</strong>
            </div>
            <div className="summary-row">
              <span>Largest drop-off</span>
              <strong>{largestDropOff.label}</strong>
            </div>
            <div className="summary-row">
              <span>Largest drop-off rate</span>
              <strong>{formatPercent(largestDropOff.count)}</strong>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
