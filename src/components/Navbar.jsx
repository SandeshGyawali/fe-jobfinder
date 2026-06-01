import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import UserMenu from './UserMenu';

const PRIMARY_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/new-listings', label: 'New' },
  { to: '/companies', label: 'Companies' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>JobSearch</Link>

        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          {PRIMARY_LINKS.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                onClick={closeMenu}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          <button
            className="nav-icon-btn"
            onClick={toggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? '☽' : '☀'}
          </button>
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="nav-signin">Sign in</Link>
              <Link to="/register" className="nav-cta">Register</Link>
            </>
          )}
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
