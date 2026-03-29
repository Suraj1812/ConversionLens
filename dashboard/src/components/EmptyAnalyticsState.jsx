import Panel from './Panel.jsx';

export default function EmptyAnalyticsState({ title, description, steps = [] }) {
  return (
    <Panel title={title} subtitle={description}>
      <div className="setup-list">
        {steps.map((step, index) => (
          <div className="setup-step" key={step.title}>
            <span className="setup-step-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="setup-step-body">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
