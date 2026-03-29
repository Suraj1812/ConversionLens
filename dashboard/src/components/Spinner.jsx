export default function Spinner({ label = 'Loading', size = 'md' }) {
  const className = size === 'lg' ? 'spinner spinner-lg' : 'spinner';

  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className={className} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
