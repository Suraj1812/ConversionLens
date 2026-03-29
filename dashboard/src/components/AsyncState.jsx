export function LoadingState() {
  return (
    <div className="panel state-block">
      <div className="state-card-copy">
        <p className="eyebrow">Loading</p>
        <h2>Fetching analytics data</h2>
        <p className="empty-text">We&apos;re pulling the latest dashboard metrics right now.</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="panel state-block error-state">
      <div className="state-card-copy">
        <p className="eyebrow">Connection issue</p>
        <h2>Analytics data could not be loaded</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
