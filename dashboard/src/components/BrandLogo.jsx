export default function BrandLogo({ compact = false }) {
  return (
    <div className={compact ? 'brand-logo compact' : 'brand-logo'}>
      <svg
        aria-hidden="true"
        viewBox="0 0 128 128"
        className="brand-logo-mark"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="128" height="128" rx="28" fill="#0F172A" />
        <circle cx="54" cy="54" r="28" stroke="#F8FAFC" strokeWidth="10" />
        <path d="M74 74L102 102" stroke="#F97316" strokeWidth="10" strokeLinecap="round" />
        <path d="M41 61V45" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
        <path d="M54 61V34" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
        <path d="M67 61V50" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
      </svg>

      {!compact ? (
        <div className="brand-logo-type">
          <span className="brand-logo-wordmark">Shoplytics</span>
          <span className="brand-logo-tagline">Shopify tracking and analytics</span>
        </div>
      ) : null}
    </div>
  );
}
