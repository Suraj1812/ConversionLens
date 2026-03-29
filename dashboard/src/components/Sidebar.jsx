import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

const links = [
  { to: '/overview', label: 'Overview' },
  { to: '/funnel', label: 'Funnel' },
  { to: '/products', label: 'Products' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <BrandLogo />
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
