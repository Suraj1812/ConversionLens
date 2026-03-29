import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import { navigationItems } from '../lib/routes.js';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside id="primary-navigation" className={isOpen ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-header">
        <BrandLogo />
        <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={onClose}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5L15 15" />
            <path d="M15 5L5 15" />
          </svg>
        </button>
      </div>

      <nav className="nav-list">
        {navigationItems.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={onClose}
          >
            {link.navLabel}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
