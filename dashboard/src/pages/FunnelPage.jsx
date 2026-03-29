import { ErrorState, LoadingState } from '../components/AsyncState.jsx';
import BarList from '../components/BarList.jsx';
import EmptyAnalyticsState from '../components/EmptyAnalyticsState.jsx';
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
  const recommendations = [];

  if ((funnel.steps[1]?.conversionFromPrevious || 0) < 40) {
    recommendations.push(
      'Review product pages for pricing clarity, stronger buy messaging, and a more obvious add-to-cart action.'
    );
  }

  if ((funnel.steps[2]?.conversionFromPrevious || 0) < 50) {
    recommendations.push(
      'Audit checkout friction such as shipping surprise, coupon distraction, or extra steps before payment.'
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      'The funnel looks reasonably healthy. Keep driving more qualified traffic and watch product-level conversion next.'
    );
  }

  return (
    <div className="page-grid">
      <SectionHeading
        title="Funnel"
        subtitle={`Sequential session progression from ${rangeLabel || `the last ${windowDays} days`}.`}
      />

      {isEmpty ? (
        <EmptyAnalyticsState
          title="No funnel journey yet"
          description="The funnel view becomes useful as soon as a few real storefront sessions have viewed products, added items to cart, and completed a test checkout."
          steps={[
            {
              title: 'Generate product page traffic',
              description:
                'Open a few product pages in the Shopify storefront so the view stage has real signal.'
            },
            {
              title: 'Create cart intent',
              description:
                'Add at least one product to cart and continue toward checkout to exercise the middle of the funnel.'
            },
            {
              title: 'Complete a test purchase',
              description:
                'Place a development-store test order so the purchase step appears and end-to-end conversion can be measured.'
            }
          ]}
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
      </div>

      <Panel title="Journey Flow" subtitle="Relative strength of each step across the tracked funnel.">
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
        <Panel title="Drop-off Points" subtitle="Where the shopper journey is losing the most momentum.">
          <BarList
            items={dropOffs}
            valueFormatter={formatPercent}
            emptyMessage="Drop-off data will appear after funnel events are tracked."
          />
        </Panel>

        <Panel title="Interpretation" subtitle="What the current funnel suggests about store performance.">
          <div className="insight-list">
            <div className="insight-row">
              <div>
                <p className="insight-label">Overall conversion</p>
                <p className="insight-helper">
                  Sessions that purchased divided by sessions that viewed a product.
                </p>
              </div>
              <strong className="insight-value">{formatPercent(funnel.overallConversionRate)}</strong>
            </div>
            <div className="insight-row">
              <div>
                <p className="insight-label">Largest friction point</p>
                <p className="insight-helper">
                  Biggest percentage drop between two consecutive funnel steps.
                </p>
              </div>
              <strong className="insight-value">{largestDropOff.label}</strong>
            </div>
            <div className="insight-row">
              <div>
                <p className="insight-label">Priority focus</p>
                <p className="insight-helper">{recommendations[0]}</p>
              </div>
              <strong className="insight-value">{formatPercent(largestDropOff.count)}</strong>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
