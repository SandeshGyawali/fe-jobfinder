import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>JobSearch</Link>
        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/new-listings" onClick={closeMenu}>New Listings</Link></li>
          <li><Link to="/companies" onClick={closeMenu}>Companies</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>
          <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
        </ul>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.first_name || user.email}!</span>
              {user.role === 'admin' && <span className="nav-role-badge">admin</span>}
              <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login-btn">Sign in</Link>
              <Link to="/register" className="nav-register-btn">Register</Link>
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
