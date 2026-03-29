export default function SuspenseFallback() {
  return (
    <div className="panel state-block">
      <div className="state-card-copy">
        <p className="eyebrow">Loading</p>
        <h2>Preparing dashboard view</h2>
        <p className="empty-text">The selected analytics screen is being loaded.</p>
      </div>
    </div>
  );
}
