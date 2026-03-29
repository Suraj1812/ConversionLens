const METRIC_CARDS = ['users', 'events', 'conversion', 'engagement'];
const PANELS = ['left', 'right'];

export default function PageSkeleton() {
  return (
    <div className="page-grid page-skeleton" aria-hidden="true">
      <div className="skeleton-heading">
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-line skeleton-line-title" />
      </div>

      <div className="metrics-grid">
        {METRIC_CARDS.map((card) => (
          <div className="panel metric-card skeleton-panel" key={card}>
            <span className="skeleton-line skeleton-line-short" />
            <span className="skeleton-line skeleton-line-value" />
            <span className="skeleton-line skeleton-line-medium" />
          </div>
        ))}
      </div>

      <div className="page-grid two-column">
        {PANELS.map((panel) => (
          <div className="panel skeleton-panel skeleton-panel-large" key={panel}>
            <span className="skeleton-line skeleton-line-medium" />
            <span className="skeleton-line skeleton-line-short" />
            <div className="skeleton-bars">
              <span className="skeleton-bar skeleton-bar-long" />
              <span className="skeleton-bar skeleton-bar-medium" />
              <span className="skeleton-bar skeleton-bar-short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
