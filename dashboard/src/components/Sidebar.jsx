import { NavLink } from 'react-router-dom';

const links = [
  { to: '/overview', label: 'Overview' },
  { to: '/funnel', label: 'Funnel' },
  { to: '/products', label: 'Products' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">S</div>
        <div>
          <p className="brand-name">Shoplytics</p>
          <p className="brand-subtitle">Tracking & analytics</p>
        </div>
      </div>

      <nav className="nav-list">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
