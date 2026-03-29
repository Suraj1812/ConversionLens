import BrandLogo from './BrandLogo.jsx';

export default function ScreenLoader({ description, overlay = false, title }) {
  const className = overlay ? 'screen-loader screen-loader-overlay' : 'screen-loader';

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="screen-loader-card">
        <BrandLogo />

        <div className="screen-loader-copy">
          <p className="eyebrow">Loading</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="loader-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
