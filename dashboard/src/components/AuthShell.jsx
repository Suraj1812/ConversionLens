import BrandLogo from './BrandLogo.jsx';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <BrandLogo />
          <div className="auth-copy">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {children}

        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
