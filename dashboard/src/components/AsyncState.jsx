export function LoadingState() {
  return <div className="panel state-block">Loading data...</div>;
}

export function ErrorState({ message }) {
  return <div className="panel state-block error-state">{message}</div>;
}
