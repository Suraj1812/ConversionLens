import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import StatusPill from './StatusPill.jsx';
import { navigationItems } from '../lib/routes.js';

export default function Sidebar({ statusTone, statusLabel }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <BrandLogo />
      </div>

      <nav className="nav-list">
        {navigationItems.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="nav-link-label">{link.navLabel}</span>
            <span className="nav-link-description">{link.navDescription}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-label">System status</p>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
        <p className="sidebar-footer-copy">
          Clean visibility into Shopify product views, cart actions, and purchases.
        </p>
      </div>
    </aside>
  );
}
