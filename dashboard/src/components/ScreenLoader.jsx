import BrandLogo from "./BrandLogo.jsx";

export default function ScreenLoader({ description, overlay = false, title }) {
  const className = overlay
    ? "screen-loader screen-loader-overlay"
    : "screen-loader";

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true" />
    </div>
  );
}
