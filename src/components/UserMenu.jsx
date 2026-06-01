import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function initials(user) {
  const f = user.first_name?.trim()?.[0];
  const l = user.last_name?.trim()?.[0];
  if (f && l) return (f + l).toUpperCase();
  if (f) return f.toUpperCase();
  return (user.email?.[0] || '?').toUpperCase();
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/');
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const displayName = fullName || user.email;

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="user-avatar">{initials(user)}</span>
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-header">
            <span className="user-avatar user-avatar--lg">{initials(user)}</span>
            <div className="user-menu-identity">
              <div className="user-menu-name">{displayName}</div>
              <div className="user-menu-email">{user.email}</div>
              {user.role === 'admin' && (
                <span className="user-menu-role">Admin</span>
              )}
            </div>
          </div>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span>Admin panel</span>
              <span className="user-menu-chevron">›</span>
            </Link>
          )}
          <button
            className="user-menu-item user-menu-item--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
