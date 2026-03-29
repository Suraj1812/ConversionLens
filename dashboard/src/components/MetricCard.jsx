export default function MetricCard({ label, value, helper }) {
  return (
    <section className="panel metric-card">
      <p className="metric-label">{label}</p>
      <h2 className="metric-value">{value}</h2>
      {helper ? <p className="metric-helper">{helper}</p> : null}
    </section>
  );
}
