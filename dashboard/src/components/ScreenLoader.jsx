import Spinner from './Spinner.jsx';

export default function ScreenLoader({ overlay = false, title = 'Loading' }) {
  const className = overlay ? 'screen-loader screen-loader-overlay' : 'screen-loader';

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="screen-loader-minimal">
        <Spinner label={title} size="lg" />
      </div>
    </div>
  );
}
