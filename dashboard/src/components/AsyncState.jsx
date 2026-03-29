import PageSkeleton from './PageSkeleton.jsx';

export function LoadingState() {
  return <PageSkeleton />;
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
